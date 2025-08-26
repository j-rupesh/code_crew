AI Data Analyst Assistant
This project is an AI-powered assistant that allows users to ask natural language questions about their datasets. The assistant translates these questions into SQL queries, executes them, and returns the results in an easy-to-understand format.

🚀 Features
Natural Language Processing: Ask complex questions about your data in plain English.

AI-Powered SQL Generation: Automatically converts user questions into precise SQL queries using the Gemini API.

Data Analysis: Executes queries on a given dataset (e.g., a .csv file) to find insights.

Web Interface: A simple and clean user interface to interact with the AI assistant.

🛠️ Tech Stack
Backend: Python, Flask

AI Model: Google Gemini

Data Handling: Pandas, Pandasql

Frontend: React (Assumed)

Environment Management: venv, python-dotenv

⚙️ Setup and Installation
Follow these steps to get the project running on your local machine.

Prerequisites
Python 3.8+

Node.js and npm (for the frontend)

1. Clone the Repository
git clone <your-repository-url>
cd data-analyst-ai

2. Backend Setup
First, navigate to the backend directory and set up the Python environment.

cd backend

Create and activate a virtual environment:

# Create the virtual environment
python -m venv venv

# Activate on Windows
.\venv\Scripts\activate

# Activate on macOS/Linux
# source venv/bin/activate

Install the required libraries:

The project dependencies are listed in requirements.txt.

pip install pandas pandasql google-generativeai python-dotenv flask flask-cors

(Optional but Recommended) Create a requirements.txt file:

If you don't have one, you can generate it for future use:

pip freeze > requirements.txt

Set up environment variables:

Create a file named .env in the backend directory and add your Gemini API key.

# .env
GEMINI_API_KEY="AIzaSy..."

3. Frontend Setup
Navigate to the frontend directory (assuming it's named frontend or similar).

# Go back to the root and then into the frontend folder
cd ../frontend

Install the necessary Node.js packages:

npm install

▶️ Running the Application
You will need to run two separate terminals for the backend and frontend.

1. Start the Backend Server:

Open a terminal in the backend directory.

Make sure your virtual environment is activated.

Run the Flask application.

# (venv) is active
python app.py

2. Start the Frontend Application:

Open a second terminal in the frontend directory.

Run the React development server.

npm start

Your application should now be running and accessible in your web browser, typically at http://localhost:3000.
