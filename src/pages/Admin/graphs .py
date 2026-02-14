from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector
from mysql.connector import Error
import google.generativeai as genai
from datetime import datetime

app = FastAPI()

# 1. ALLOW FRONTEND ACCESS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. CONFIGURATIONS
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "Tuktuk@2008",
    "database": "your_database_name"
}

# AI Setup - Replace with your key
genai.configure(api_key="YOUR_GEMINI_API_KEY")
ai_model = genai.GenerativeModel('gemini-1.5-flash')

# --- ANALYTICS ENDPOINTS ---

# 1. STATISTICS FOR GRAPHS
@app.get("/api/stats")
def get_stats():
    connection = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        
        # Count by Status (Pie Chart)
        cursor.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status")
        status_data = cursor.fetchall()
        
        # Count by Department (Bar Chart)
        cursor.execute("SELECT department, COUNT(*) as count FROM complaints GROUP BY department")
        dept_data = cursor.fetchall()
        
        # Count by Priority (KPI Cards)
        cursor.execute("SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority")
        priority_data = cursor.fetchall()

        return {
            "status_distribution": status_data,
            "department_volume": dept_data,
            "priority_summary": priority_data
        }
    except Error as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if connection and connection.is_connected():
            connection.close()

# 2. AI SUGGESTION BOX
@app.get("/api/ai-suggestion")
def get_ai_insight():
    connection = None
    try:
        connection = mysql.connector.connect(**db_config)
        cursor = connection.cursor(dictionary=True)
        # Fetching summary data for the AI to analyze
        cursor.execute("SELECT department, priority, type FROM complaints WHERE status != 'Resolved'")

        active_cases = cursor.fetchall()
        connection.close()

        if not active_cases:
            return {"suggestion": "System clean. No pending administrative actions required."}

        # Create a prompt for the AI
        data_string = str(active_cases[:10]) # Send a sample to keep it fast
        prompt = f"Act as a City Operations Manager. Analyze this data and give a 15-word administrative advice: {data_string}"
        
        response = ai_model.generate_content(prompt)
        return {"suggestion": response.text}

    except Exception as e:
        return {"suggestion": "Focus on high-priority tickets while I re-analyze the trends."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)