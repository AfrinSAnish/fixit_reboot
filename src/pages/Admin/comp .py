from fastapi import FastAPI, HTTPException, Path
from pydantic import BaseModel
from typing import Optional
import mysql.connector
from datetime import datetime

app = FastAPI()

conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tuktuk@2008",
    database="fixit"
)
cursor = conn.cursor(dictionary=True)

class AIOutputModel(BaseModel):
    type: str
    priority: str
    department: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class UserInputModel(BaseModel):
    user_id: int
    description: Optional[str] = None
    image_url: Optional[str] = None

class ComplaintCreateModel(BaseModel):
    user_input: UserInputModel
    ai_output: AIOutputModel

VALID_STATUS = ['Reported','Acknowledged','InProgress','Resolved']

@app.post("/complaints")
def create_complaint(data: ComplaintCreateModel):
    user_data = data.user_input
    ai_data = data.ai_output

    cursor.execute("SELECT * FROM users WHERE id=%s", (user_data.user_id,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute(
        """INSERT INTO complaints 
        (user_id, type, description, image_url, status, priority, department, latitude, longitude, reported_at)
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)""",
        (
            user_data.user_id,
            ai_data.type,                 
            user_data.description,       
            user_data.image_url,          
            "Reported",                   
            ai_data.priority,              
            ai_data.department,         
            ai_data.latitude,           
            ai_data.longitude,            
            datetime.now()                 
        )
    )
    conn.commit()
    return {"status": "success", "message": "Complaint created", "complaint_id": cursor.lastrowid}

@app.patch("/admin/complaints/{complaint_id}")
def update_complaint_status(
    complaint_id: int = Path(..., description="ID of the complaint to update"),
    status: Optional[str] = None,
    priority: Optional[str] = None
):
    if status and status not in ['Acknowledged', 'InProgress', 'Resolved']:
        raise HTTPException(status_code=400, detail="Invalid status for admin update")

    cursor.execute("SELECT * FROM complaints WHERE id=%s", (complaint_id,))
    complaint = cursor.fetchone()
    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")
    
    timestamps = {
        "Acknowledged": "acknowledged_at",
        "InProgress": "in_progress_at",
        "Resolved": "resolved_at"
    }
    timestamp_field = timestamps.get(status)
    timestamp_value = datetime.now() if timestamp_field else None

    query_parts = []
    values = []

    if status:
        query_parts.append("status=%s")
        values.append(status)
    if timestamp_field:
        query_parts.append(f"{timestamp_field}=%s")
        values.append(timestamp_value)
    if priority:
        query_parts.append("priority=%s")
        values.append(priority)
    
    if not query_parts:
        raise HTTPException(status_code=400, detail="Nothing to update")
    
    query = f"UPDATE complaints SET {', '.join(query_parts)} WHERE id=%s"
    values.append(complaint_id)
    cursor.execute(query, tuple(values))
    conn.commit()
    return {"status": "success", "message": "Complaint updated"}