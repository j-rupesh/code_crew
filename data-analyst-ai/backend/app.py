import os
import re
import json
import difflib
from io import StringIO
from datetime import datetime
from typing import List, Tuple, Optional, Dict

import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Optional Gemini import
try:
    import google.generativeai as genai  # type: ignore
except Exception:
    genai = None

# Manual SQL helper
from pandasql import sqldf

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

AI_PROVIDER = os.getenv("AI_PROVIDER", "gemini").lower()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

if AI_PROVIDER == "gemini" and GEMINI_API_KEY and genai:
    genai.configure(api_key=GEMINI_API_KEY)
else:
    AI_PROVIDER = "none"  # force local fallback

# ------------------------------ Utilities ------------------------------

MONEY_HINTS = re.compile(r"(revenue|sales|amount|price|cost|total|profit)", re.I)
DATE_HINTS = re.compile(r"(date|time|month|year|day|week|quarter|timestamp)", re.I)

def convert_df_for_json(df: pd.DataFrame) -> pd.DataFrame:
    """Converts datetime columns to strings to make a DataFrame JSON serializable."""
    df_copy = df.copy()
    for col in df_copy.columns:
        if pd.api.types.is_datetime64_any_dtype(df_copy[col]):
            # Convert known datetime columns to a standard string format
            df_copy[col] = df_copy[col].dt.strftime('%Y-%m-%d %H:%M:%S')
        elif df_copy[col].dtype == 'object':
            # For object columns, attempt to convert any datetime/timestamp objects within them
            try:
                df_copy[col] = df_copy[col].apply(
                    lambda x: x.isoformat() if isinstance(x, (datetime, pd.Timestamp)) else x
                )
            except Exception:
                pass  # Ignore columns or values that can't be converted
    return df_copy

def coerce_dates_and_numbers(df: pd.DataFrame) -> pd.DataFrame:
    """Try to coerce dates and numeric-looking text columns safely."""
    for c in df.columns:
        if DATE_HINTS.search(str(c)) or df[c].dtype == object:
            try:
                parsed = pd.to_datetime(df[c], errors="coerce", infer_datetime_format=True)
                if parsed.notna().mean() > 0.7:
                    df[c] = parsed
            except Exception:
                pass
    for c in df.columns:
        if df[c].dtype == object:
            s = pd.to_numeric(
                df[c].astype(str).str.replace(r"[, ]+", "", regex=True),
                errors="coerce"
            )
            if s.notna().mean() > 0.7:
                df[c] = s
    return df

def split_types(df: pd.DataFrame) -> Tuple[List[str], List[str], List[str]]:
    numeric = [c for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]
    datetime_cols = [c for c in df.columns if pd.api.types.is_datetime64_any_dtype(df[c])]
    categorical = [c for c in df.columns if c not in numeric and c not in datetime_cols]
    return numeric, categorical, datetime_cols

def best_match(term: str, options: List[str]) -> Optional[str]:
    if not options:
        return None
    matches = difflib.get_close_matches(term.lower(), [o.lower() for o in options], n=1, cutoff=0.6)
    if matches:
        idx = [o.lower() for o in options].index(matches[0])
        return options[idx]
    return None

def parse_limit(q: str, default_with_group: int = 25) -> int:
    m = re.search(r"(top|first|limit)\s+(\d+)", q, flags=re.I)
    if m:
        try:
            return int(m.group(2))
        except Exception:
            pass
    return default_with_group

def parse_agg(q: str) -> str:
    ql = q.lower()
    if re.search(r"(avg|average|mean)", ql): return "mean"
    if re.search(r"(count|how many|#)", ql): return "count"
    if re.search(r"(min|lowest|smallest|least)", ql): return "min"
    if re.search(r"(max|highest|largest|most|peak)", ql): return "max"
    return "sum"

def parse_sort(q: str) -> str:
    ql = q.lower()
    if re.search(r"(lowest|min|smallest|least|bottom)", ql): return "asc"
    if re.search(r"(highest|max|largest|most|top|descend)", ql): return "desc"
    return "desc"

def choose_metric_col(q: str, numeric_cols: List[str]) -> Optional[str]:
    if not numeric_cols: return None
    if MONEY_HINTS.search(q):
        for c in numeric_cols:
            if MONEY_HINTS.search(c):
                return c
    order = ["revenue","sales","amount","total","value","score","qty","quantity","profit","price","count"]
    for hint in order:
        for c in numeric_cols:
            if re.search(hint, c, re.I): return c
    return numeric_cols[0]

# ------------------------------ AI SQL ------------------------------

SQL_INSTRUCTIONS = """
You are a data analyst. Generate a single SQLite-compatible SQL query for a table named df.
Rules:
- Use only SELECT, WHERE, GROUP BY, ORDER BY, LIMIT, COUNT, SUM, AVG, MIN, MAX, strftime for dates.
- Do not use JOINs, CTEs, comments, or backticks. Do not add explanations.
Return ONLY the SQL.
""".strip()

def try_gemini_sql(schema_text: str, sample_rows: List[Dict], question: str) -> Tuple[Optional[str], Optional[str]]:
    if AI_PROVIDER != "gemini": return None, "AI provider disabled"
    if not (GEMINI_API_KEY and genai): return None, "Gemini not configured"
    # The sample_rows are now pre-formatted, so json.dumps is safe
    prompt = f"{SQL_INSTRUCTIONS}\n\nSchema: {schema_text}\nSample rows: {json.dumps(sample_rows)}\nQuestion: {question}\nSQL:"
    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        resp = model.generate_content(prompt)
        text = (resp.text or "").replace("```sql","").replace("```","").strip()
        if not text: return None, "Empty LLM response"
        return text, None
    except Exception as e:
        return None, str(e)

# ------------------------------ Simple Heuristic NL→SQL ------------------------------

def build_simple_sql(df: pd.DataFrame, prompt: str) -> str:
    """Very naive fallback translator from NL -> SQL"""
    p = prompt.lower()
    num_cols, cat_cols, date_cols = split_types(df)

    # Year filter if prompt mentions year
    year_match = re.search(r'\b(20\d{2}|19\d{2})\b', p)
    if year_match and date_cols:
        year = year_match.group(1)
        date_col = date_cols[0]
        return f"SELECT * FROM df WHERE strftime('%Y',{date_col})='{year}'"

    # Top query
    if "top" in p and num_cols and cat_cols:
        limit = parse_limit(p, 10)
        metric = choose_metric_col(p, num_cols)
        group = cat_cols[0]
        return f"SELECT {group}, SUM({metric}) as total FROM df GROUP BY {group} ORDER BY total DESC LIMIT {limit}"

    # Fallback
    return "SELECT * FROM df LIMIT 20"

# ------------------------------ API Routes ------------------------------

@app.route("/api/query", methods=["POST","OPTIONS"])
def handle_query():
    if request.method=="OPTIONS": 
        return jsonify({}),200
    
    try:
        if "file" not in request.files:
            return jsonify({"error":"No file uploaded"}),400
        file = request.files["file"]
        prompt = (request.form.get("question") or "").strip()
        if not prompt: return jsonify({"error":"No question"}),400

        # Load dataframe
        fname=(file.filename or "").lower()
        if fname.endswith(".csv"):
            raw=file.read().decode("utf-8",errors="replace")
            df=pd.read_csv(StringIO(raw))
        elif fname.endswith((".xlsx",".xls")):
            df=pd.read_excel(file)
        else: return jsonify({"error":"Unsupported file"}),400

        # normalize cols + types
        df.columns=[str(c).strip().replace(" ","_") for c in df.columns]
        df=coerce_dates_and_numbers(df)

        # Schema and Sample Data Preparation
        schema=", ".join([f"{c} ({df[c].dtype})" for c in df.columns])
        
        # 🔥 FIX 1: Convert sample data for JSON serialization before sending to LLM
        sample_df_json_safe = convert_df_for_json(df.head(3))
        sample = sample_df_json_safe.to_dict(orient="records")

        sql_text=None; llm_err=None

        # 1. Try Gemini
        if AI_PROVIDER=="gemini":
            sql_text,llm_err=try_gemini_sql(schema,sample,prompt)

        # 2. Fallback simple builder
        if not sql_text:
            sql_text=build_simple_sql(df,prompt)
            llm_err=llm_err or "Used heuristic SQL"

        print("📝 Prompt:", prompt)
        print("⏳ SQL:", sql_text)
        print("📊 Columns:", df.columns.tolist())

        # Run SQL
        result_df=sqldf(sql_text,{"df":df})

        # 🔥 FIX 2: Convert result data for JSON serialization before sending to frontend
        result_df_json_safe = convert_df_for_json(result_df)

        return jsonify({
            "summary": f"Ran SQL: {sql_text}",
            "data": result_df_json_safe.to_dict(orient="records"),
            "sql": sql_text,
            "chartType": "bar",
            "meta": {"used": "gemini" if llm_err is None else "heuristic", "llm_error": llm_err}
        })
    
    except Exception as e:
        return jsonify({"error":str(e)}),500

@app.route("/api/sql", methods=["POST"])
def run_manual_sql():
    try:
        if "file" not in request.files:
            return jsonify({"error":"No file uploaded"}),400
        file=request.files["file"]
        sql=(request.form.get("sql") or "").strip()
        if not sql: return jsonify({"error":"No SQL"}),400

        fname=(file.filename or "").lower()
        if fname.endswith(".csv"):
            raw=file.read().decode("utf-8",errors="replace"); df=pd.read_csv(StringIO(raw))
        elif fname.endswith((".xlsx",".xls")):
            df=pd.read_excel(file)
        else: return jsonify({"error":"Unsupported file"}),400

        df.columns=[str(c).strip().replace(" ","_") for c in df.columns]
        df=coerce_dates_and_numbers(df)
        result_df=sqldf(sql,{"df":df})

        # 🔥 FIX: Convert result data for JSON serialization before sending to frontend
        result_df_json_safe = convert_df_for_json(result_df)

        return jsonify({
            "columns":list(result_df_json_safe.columns),
            "rows":result_df_json_safe.to_dict(orient="records"),
            "rowCount":len(result_df_json_safe)
        })
    except Exception as e: 
        return jsonify({"error":str(e)}),500

@app.route("/api/health")
def health():
    return jsonify({"status":"ok","provider":AI_PROVIDER,
                    "gemini_configured":bool(GEMINI_API_KEY and genai),
                    "time":datetime.utcnow().isoformat()+"Z"})

if __name__=="__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)
