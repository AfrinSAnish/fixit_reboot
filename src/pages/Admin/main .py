from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from mysql.connector import Error
import mysql.connector as sql
from escalation import auto_escalate


app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
def get_connection():
    return sql.connect(
        host="localhost",
        user="root",
        password="Tuktuk@2008",
        database="fixit",
        port=3306
    )

@app.get("/")
def root():
    return {"message": "FixIt Backend Running 🚀"}

# 🔥 Clean heatmap endpoint
@app.get("/heatmap-data")
def get_heatmap_data():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT latitude, longitude
        FROM complaints
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
    """)

    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    return [{"lat": row[0], "lng": row[1]} for row in rows]

# -------------------------------
# 📊 ADMIN ANALYTICS ENDPOINTS
# -------------------------------

@app.get("/api/stats")
def get_stats():
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        # Status distribution
        cursor.execute("SELECT status, COUNT(*) as count FROM complaints GROUP BY status")
        status_data = cursor.fetchall()

        # Department volume
        cursor.execute("SELECT department, COUNT(*) as count FROM complaints GROUP BY department")
        dept_data = cursor.fetchall()

        # Priority summary
        cursor.execute("SELECT priority, COUNT(*) as count FROM complaints GROUP BY priority")
        priority_data = cursor.fetchall()

        return {
            "status_distribution": status_data,
            "department_volume": dept_data,
            "priority_summary": priority_data
        }

    except Error as e:
        return {"error": str(e)}

    finally:
        if connection:
            connection.close()


@app.get("/api/ai-suggestion")
def get_ai_insight():
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute("SELECT department, priority, type FROM complaints WHERE status != 'Resolved'")
        active_cases = cursor.fetchall()

        if not active_cases:
            return {"suggestion": "System clean. No pending administrative actions required."}

        high_priority = [c for c in active_cases if c["priority"] == "High"]

        if high_priority:
            return {"suggestion": "High-priority complaints require immediate departmental escalation."}
        else:
            return {"suggestion": "Monitor department workloads and optimize response timelines."}

    except Exception:
        return {"suggestion": "Analyzing trends..."}

    finally:
        if connection:
            connection.close()
@app.get("/api/escalations")
def get_escalations():
    try:
        auto_escalate()  

        conn = get_connection()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, type, priority, department, escalated_at
            FROM complaints
            WHERE status = 'Escalated'
            ORDER BY escalated_at DESC
        """)

        data = cursor.fetchall()
        cursor.close()
        conn.close()

        return {"escalated": data}

    except Exception as e:
        return {"error": str(e)}
