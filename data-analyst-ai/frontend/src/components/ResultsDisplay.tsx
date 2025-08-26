import {
  ResponsiveContainer,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import { Download, Table2, TrendingUp, BarChart as BarChartIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ResultsDisplayProps {
  data: any[];
  insight: string;
  chartType?: 'bar' | 'line' | 'pie';
  onExport?: () => void;
}

type Keys = {
  labelKey: string | null;
  valueKey: string | null;
  numericX?: boolean;
  reason?: string;
};

const COLORS = [
  'hsl(175 60% 45%)',
  'hsl(262 52% 67%)',
  'hsl(217 91% 60%)',
  'hsl(142 76% 36%)',
  'hsl(346 87% 43%)',
  'hsl(36 92% 55%)',
  'hsl(198 93% 60%)',
];

function isNumericLike(v: unknown) {
  if (v === null || v === undefined) return false;
  if (typeof v === 'number' && Number.isFinite(v)) return true;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[, ]+/g, ''));
    return Number.isFinite(n);
  }
  return false;
}

function toNumber(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (typeof v === 'string') {
    const n = Number(v.replace(/[, ]+/g, ''));
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function inferKeys(rows: any[]): Keys {
  if (!rows || rows.length === 0) return { labelKey: null, valueKey: null, reason: 'no-rows' };

  const sample = rows[0];
  const keys = Object.keys(sample);
  if (keys.length === 0) return { labelKey: null, valueKey: null, reason: 'no-keys' };

  // Separate likely numeric and text columns
  const numericCandidates = keys.filter(k => isNumericLike(sample[k]));
  const textCandidates = keys.filter(k => typeof sample[k] === 'string' && !isNumericLike(sample[k]));

  // Prefer a text label + numeric value
  if (textCandidates.length > 0 && numericCandidates.length > 0) {
    return { labelKey: textCandidates[0], valueKey: numericCandidates.find(k => k !== textCandidates[0]) || numericCandidates[0] };
  }

  // If only numeric columns exist, we can plot numeric X vs numeric Y (take first two)
  if (numericCandidates.length >= 2) {
    return { labelKey: numericCandidates[0], valueKey: numericCandidates[1], numericX: true };
  }

  // If only one numeric column exists, this is a single metric; better to show metric-only (no chart)
  if (numericCandidates.length === 1) {
    return { labelKey: null, valueKey: numericCandidates[0], reason: 'single-metric' };
  }

  // Fallback: try first two keys assuming second is numeric-like after coercion
  if (keys.length >= 2) {
    const secondLooksNumeric = isNumericLike(sample[keys[1]]);
    return {
      labelKey: secondLooksNumeric ? keys[0] : null,
      valueKey: secondLooksNumeric ? keys[1] : null,
      reason: 'fallback',
    };
  }

  return { labelKey: null, valueKey: null, reason: 'could-not-infer' };
}

function sanitizeData(rows: any[], labelKey: string, valueKey: string) {
  const cleaned = rows
    .map(r => {
      const value = toNumber(r[valueKey]);
      const labelRaw = r[labelKey];
      const label = labelRaw == null ? '' : String(labelRaw);
      return value == null ? null : { ...r, [labelKey]: label, [valueKey]: value };
    })
    .filter(Boolean) as any[];

  // If too many categories, keep top 25 by value to keep the chart legible
  if (cleaned.length > 50) {
    const sorted = [...cleaned].sort((a, b) => b[valueKey] - a[valueKey]).slice(0, 25);
    return sorted;
  }
  return cleaned;
}

const ResultsDisplay = ({ data, insight, chartType = 'bar', onExport }: ResultsDisplayProps) => {
  const keys = inferKeys(data || []);
  const canChart = !!keys.labelKey && !!keys.valueKey;

  let chartData: any[] = [];
  if (canChart && keys.labelKey && keys.valueKey) {
    chartData = sanitizeData(data, keys.labelKey, keys.valueKey);
  }

  const renderSingleMetric = () => {
    // Find a numeric column to show
    const allKeys = data.length ? Object.keys(data[0]) : [];
    const numericKey = allKeys.find(k => isNumericLike(data[0][k]));
    const value = numericKey ? toNumber(data[0][numericKey]) : null;

    return (
      <div className="card-premium p-8 text-center">
        <p className="text-sm text-muted-foreground mb-2">Metric</p>
        <div className="text-4xl font-extrabold tracking-tight">
          {value !== null ? value.toLocaleString() : '—'}
        </div>
        {numericKey && <p className="text-sm text-muted-foreground mt-2">Column: {numericKey}</p>}
      </div>
    );
  };

  const renderChart = () => {
    if (!canChart || chartData.length === 0) return renderSingleMetric();

    const labelKey = keys.labelKey!;
    const valueKey = keys.valueKey!;
    const isNumericX = !!keys.numericX;

    const axisTickColor = 'hsl(220 13% 65%)';
    const gridColor = 'hsl(220 13% 18%)';
    const primaryColor = 'hsl(175 60% 45%)';

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey={labelKey}
              type={isNumericX ? 'number' : 'category'}
              stroke={axisTickColor}
              tick={{ fontSize: 12 }}
              angle={isNumericX ? 0 : -30}
              textAnchor={isNumericX ? 'end' : 'end'}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke={axisTickColor}
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => Intl.NumberFormat().format(v as number)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 13% 12%)',
                border: '1px solid hsl(220 13% 18%)',
                borderRadius: '8px',
                color: 'hsl(220 13% 95%)',
              }}
              formatter={(v: any) => Intl.NumberFormat().format(Number(v))}
              labelFormatter={(l: any) => String(l)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={valueKey}
              stroke={primaryColor}
              strokeWidth={3}
              dot={{ r: 3, strokeWidth: 2, fill: primaryColor }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      // Pie needs nameKey explicitly; labels must reference payload[labelKey]
      return (
        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220 13% 12%)',
                border: '1px solid hsl(220 13% 18%)',
                borderRadius: '8px',
                color: 'hsl(220 13% 95%)',
              }}
              formatter={(v: any, _n, p: any) => [
                Intl.NumberFormat().format(Number(v)),
                p?.payload?.[labelKey] ?? '',
              ]}
            />
            <Legend />
            <Pie
              data={chartData}
              dataKey={valueKey}
              nameKey={labelKey}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ percent, payload }) =>
                `${payload?.[labelKey]} ${(percent * 100).toFixed(0)}%`
              }
              labelLine={false}
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      );
    }

    // Default: Bar
    return (
      <ResponsiveContainer width="100%" height={360}>
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis
            dataKey={labelKey}
            type={isNumericX ? 'number' : 'category'}
            stroke={axisTickColor}
            tick={{ fontSize: 12 }}
            angle={isNumericX ? 0 : -30}
            textAnchor={isNumericX ? 'end' : 'end'}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke={axisTickColor}
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => Intl.NumberFormat().format(v as number)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(220 13% 12%)',
              border: '1px solid hsl(220 13% 18%)',
              borderRadius: '8px',
              color: 'hsl(220 13% 95%)',
            }}
            formatter={(v: any) => Intl.NumberFormat().format(Number(v))}
            labelFormatter={(l: any) => String(l)}
          />
          <Legend />
          <Bar dataKey={valueKey} fill="hsl(175 60% 45%)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6">
      {/* Insight */}
      <div className="card-premium p-6">
        <div className="flex items-start gap-4">
          <TrendingUp className="h-5 w-5 text-primary mt-1" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground mb-2">Analysis Insight</h3>
            <p className="text-muted-foreground leading-relaxed">{insight}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <BarChartIcon className="h-5 w-5 text-primary" />
            <span>Visualization</span>
          </h3>
          <Button
            onClick={onExport}
            variant="outline"
            size="sm"
            className="hover:border-primary/50"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
        <div className="rounded-lg p-2 bg-gradient-secondary">
          {data && data.length > 0 ? (
            renderChart()
          ) : (
            <div className="text-sm text-muted-foreground p-8 text-center">
              No data to visualize
            </div>
          )}
        </div>
        {!canChart && data?.length > 0 && (
          <p className="text-xs text-muted-foreground mt-3">
            Auto‑viz hint: This result looks like a single metric or lacks a clear label+value pair, 
            so we’re showing a metric card instead. Try asking for a breakdown by a category or date.
          </p>
        )}
      </div>

      {/* Table */}
      <div className="card-premium p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Table2 className="h-5 w-5 text-primary" />
            <span>Raw Data</span>
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {data.length > 0 &&
                  Object.keys(data[0]).map((key) => (
                    <th key={key} className="text-left py-3 px-4 font-medium text-foreground">
                      {key}
                    </th>
                  ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/30">
                  {Object.values(row).map((value, vIndex) => (
                    <td key={vIndex} className="py-3 px-4 text-muted-foreground">
                      {typeof value === 'number'
                        ? Intl.NumberFormat().format(value)
                        : String(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay;