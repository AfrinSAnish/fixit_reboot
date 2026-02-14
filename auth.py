from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
import math

import mysql.connector as sql
import bcrypt

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== DB CONNECTION =====================
def get_conn():
    return sql.connect(
        host="localhost",
        user="fixit_user",
        password="fixit1234",
        database="fixit",
        port=3306
    )

# ===================== ENSURE TABLES =====================
def ensure_tables():
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor()

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            aadhar_no VARCHAR(12) NOT NULL UNIQUE,
            mobile_no VARCHAR(15) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            lat DECIMAL(10,8) NULL,
            lng DECIMAL(11,8) NULL,
            location_text VARCHAR(255) NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        """)

        cursor.execute("""
        CREATE TABLE IF NOT EXISTS complaints (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            image_url TEXT,
            status ENUM('Reported','Acknowledged','InProgress','Resolved','Escalated') DEFAULT 'Reported',
            priority VARCHAR(20) NOT NULL,
            department VARCHAR(50) NOT NULL,
            latitude DECIMAL(10,8),
            longitude DECIMAL(11,8),
            reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            acknowledged_at DATETIME NULL,
            in_progress_at DATETIME NULL,
            resolved_at DATETIME NULL,
            escalated_at DATETIME NULL,
            CONSTRAINT fk_complaints_user FOREIGN KEY (user_id) REFERENCES users(id)
                ON DELETE CASCADE
        );
        """)

        conn.commit()
        print("✅ users + complaints tables ensured")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


@app.on_event("startup")
def startup():
    ensure_tables()
    print("✅ Backend started")


@app.get("/")
def health():
    return {"status": "ok", "message": "API running"}


# ===================== TIME FORMAT HELPERS =====================
def day_suffix(day: int) -> str:
    if 11 <= day <= 13:
        return "th"
    return {1: "st", 2: "nd", 3: "rd"}.get(day % 10, "th")

def format_reported_time(dt: datetime) -> str:
    day = dt.day
    suffix = day_suffix(day)
    month = dt.strftime("%b")
    time = dt.strftime("%I:%M%p").lstrip("0").lower()
    return f"{day}{suffix} {month}, {time}"

def format_waiting_time(start_time: datetime) -> str:
    delta = datetime.now() - start_time
    days = delta.days
    hours = delta.seconds // 3600
    parts = []
    if days > 0:
        parts.append(f"{days} days")
    if hours > 0:
        parts.append(f"{hours} hrs")
    return " ".join(parts) if parts else "Just now"


# ===================== AUTH MODELS =====================
class SignupModel(BaseModel):
    name: str
    aadhar: str
    mobile: str
    password: str
    lat: Optional[float] = None
    lng: Optional[float] = None
    location_text: Optional[str] = None

class LoginModel(BaseModel):
    aadhar: str
    password: str


# ===================== SIGNUP =====================
@app.post("/api/signup")
def signup(data: SignupModel):
    conn = None
    cursor = None
    try:
        aadhar = (data.aadhar or "").strip()
        if len(aadhar) != 12 or not aadhar.isdigit():
            raise HTTPException(status_code=400, detail="Invalid Aadhaar (must be 12 digits)")

        name = (data.name or "").strip()
        mobile = (data.mobile or "").strip()
        password = (data.password or "").strip()

        if not name:
            raise HTTPException(status_code=400, detail="Name required")
        if not mobile:
            raise HTTPException(status_code=400, detail="Mobile required")
        if not password:
            raise HTTPException(status_code=400, detail="Password required")

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id FROM users WHERE aadhar_no=%s", (aadhar,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Aadhaar already registered")

        cursor.execute("SELECT id FROM users WHERE mobile_no=%s", (mobile,))
        if cursor.fetchone():
            raise HTTPException(status_code=409, detail="Mobile already registered")

        hashed_pw = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

        cursor.execute(
            """
            INSERT INTO users (name, aadhar_no, mobile_no, password, lat, lng, location_text)
            VALUES (%s,%s,%s,%s,%s,%s,%s)
            """,
            (name, aadhar, mobile, hashed_pw, data.lat, data.lng, data.location_text),
        )
        conn.commit()

        return {"status": "success", "user_id": cursor.lastrowid, "name": name}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== LOGIN =====================
@app.post("/api/login")
def login(data: LoginModel):
    conn = None
    cursor = None
    try:
        aadhar = (data.aadhar or "").strip()
        password = (data.password or "").strip()

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, password, mobile_no, aadhar_no, lat, lng, location_text
            FROM users
            WHERE aadhar_no=%s
            """,
            (aadhar,),
        )
        user = cursor.fetchone()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        if not bcrypt.checkpw(password.encode("utf-8"), user["password"].encode("utf-8")):
            raise HTTPException(status_code=401, detail="Invalid password")

        return {
            "status": "success",
            "user_id": user["id"],
            "name": user["name"],
            "mobile_no": user["mobile_no"],
            "aadhar_no": user["aadhar_no"],
            "lat": float(user["lat"]) if user.get("lat") is not None else None,
            "lng": float(user["lng"]) if user.get("lng") is not None else None,
            "location_text": user.get("location_text"),
        }

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== COMPLAINT MODELS =====================
class ComplaintCreateModel(BaseModel):
    user_id: int
    type: str
    priority: str
    department: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintAdminUpdateModel(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None

ADMIN_ALLOWED_STATUS = ["Acknowledged", "InProgress", "Resolved", "Escalated"]


# ===================== CREATE COMPLAINT =====================
@app.post("/api/complaints")
def create_complaint(data: ComplaintCreateModel):
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT id FROM users WHERE id=%s", (data.user_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="User not found")

        cursor.execute(
            """
            INSERT INTO complaints
            (user_id, type, description, image_url, status, priority, department,
             latitude, longitude, reported_at)
            VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            """,
            (
                data.user_id,
                data.type,
                data.description,
                data.image_url,
                "Reported",
                data.priority,
                data.department,
                data.latitude,
                data.longitude,
                datetime.now(),
            ),
        )
        conn.commit()

        return {"status": "success", "message": "Complaint created", "complaint_id": cursor.lastrowid}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== GET COMPLAINTS BY USER =====================
@app.get("/api/complaints/user/{user_id}")
def get_user_complaints(user_id: int):
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT c.*, u.location_text
            FROM complaints c
            JOIN users u ON u.id = c.user_id
            WHERE c.user_id=%s
            ORDER BY c.reported_at DESC
            """,
            (user_id,),
        )
        rows = cursor.fetchall()
        return {"status": "success", "complaints": rows}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== GET SINGLE COMPLAINT =====================
@app.get("/api/complaints/{complaint_id}")
def get_complaint(complaint_id: int = Path(...)):
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT c.*, u.location_text
            FROM complaints c
            JOIN users u ON u.id = c.user_id
            WHERE c.id=%s
            """,
            (complaint_id,),
        )
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Complaint not found")

        return {"status": "success", "complaint": row}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== ADMIN UPDATE =====================
@app.patch("/api/admin/complaints/{complaint_id}")
def update_complaint_status(complaint_id: int = Path(...), data: ComplaintAdminUpdateModel = None):
    conn = None
    cursor = None
    try:
        status = data.status if data else None
        priority = data.priority if data else None

        if status and status not in ADMIN_ALLOWED_STATUS:
            raise HTTPException(status_code=400, detail="Invalid status for admin update")

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("SELECT * FROM complaints WHERE id=%s", (complaint_id,))
        complaint = cursor.fetchone()
        if not complaint:
            raise HTTPException(status_code=404, detail="Complaint not found")

        timestamps = {
            "Acknowledged": "acknowledged_at",
            "InProgress": "in_progress_at",
            "Resolved": "resolved_at",
            "Escalated": "escalated_at",
        }

        query_parts = []
        values = []

        if status:
            query_parts.append("status=%s")
            values.append(status)

            ts_field = timestamps.get(status)
            if ts_field:
                query_parts.append(f"{ts_field}=%s")
                values.append(datetime.now())

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

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== AUTO ESCALATE OVERDUE =====================
@app.post("/api/admin/escalate-overdue")
def escalate_overdue(hours: int = 24):
    conn = None
    cursor = None
    try:
        cutoff = datetime.now() - timedelta(hours=hours)

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            """
            UPDATE complaints
            SET status='Escalated', escalated_at=%s
            WHERE status <> 'Resolved'
              AND status <> 'Escalated'
              AND reported_at <= %s
            """,
            (datetime.now(), cutoff),
        )
        conn.commit()

        return {"status": "success", "message": "Overdue complaints escalated"}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== NEARBY COMPLAINTS (WHAT'S HAPPENING AROUND YOU) =====================
class NearbyComplaintsQuery(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 5.0
    limit: int = 50
    only_unresolved: bool = True

@app.post("/api/complaints/nearby")
def nearby_complaints(body: NearbyComplaintsQuery):
    conn = None
    cursor = None
    try:
        lat = float(body.latitude)
        lng = float(body.longitude)
        radius_km = float(body.radius_km)

        if radius_km <= 0 or radius_km > 50:
            raise HTTPException(status_code=400, detail="radius_km must be between 0 and 50")
        if body.limit <= 0 or body.limit > 200:
            raise HTTPException(status_code=400, detail="limit must be between 1 and 200")

        lat_delta = radius_km / 111.0
        lng_delta = radius_km / (111.0 * max(0.2, math.cos(math.radians(lat))))

        min_lat = lat - lat_delta
        max_lat = lat + lat_delta
        min_lng = lng - lng_delta
        max_lng = lng + lng_delta

        unresolved_filter = ""
        if body.only_unresolved:
            unresolved_filter = "AND c.status <> 'Resolved'"

        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute(
            f"""
            SELECT
                c.id,
                c.user_id,
                c.type,
                c.description,
                c.image_url,
                c.status,
                c.priority,
                c.department,
                c.latitude,
                c.longitude,
                c.reported_at,
                (
                  6371 * ACOS(
                    COS(RADIANS(%s)) * COS(RADIANS(c.latitude)) * COS(RADIANS(c.longitude) - RADIANS(%s))
                    + SIN(RADIANS(%s)) * SIN(RADIANS(c.latitude))
                  )
                ) AS distance_km
            FROM complaints c
            WHERE c.latitude IS NOT NULL
              AND c.longitude IS NOT NULL
              AND c.latitude BETWEEN %s AND %s
              AND c.longitude BETWEEN %s AND %s
              {unresolved_filter}
            HAVING distance_km <= %s
            ORDER BY c.reported_at DESC
            LIMIT %s
            """,
            (lat, lng, lat, min_lat, max_lat, min_lng, max_lng, radius_km, body.limit),
        )

        rows = cursor.fetchall()

        priority_order = {"High": 1, "Medium": 2, "Low": 3}

        items = []
        for r in rows:
            reported_at = r.get("reported_at")
            if isinstance(reported_at, datetime):
                reported_time = format_reported_time(reported_at)
                waiting_time = format_waiting_time(reported_at)
            else:
                reported_time = None
                waiting_time = None

            items.append({
                "id": r.get("id"),
                "description": r.get("description"),
                "type": r.get("type"),
                "department": r.get("department"),
                "priority": r.get("priority"),
                "current_status": r.get("status"),
                "reported_time": reported_time,
                "waiting_time": waiting_time,
                "distance_km": float(r["distance_km"]) if r.get("distance_km") is not None else None,
                "latitude": float(r["latitude"]) if r.get("latitude") is not None else None,
                "longitude": float(r["longitude"]) if r.get("longitude") is not None else None,
            })

        items.sort(key=lambda x: priority_order.get(x.get("priority"), 9))
        items = items[:5]

        return {"status": "success", "items": items, "count": len(items)}

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        try:
            if cursor: cursor.close()
        except:
            pass
        try:
            if conn: conn.close()
        except:
            pass


# ===================== ADMIN STATS =====================
@app.get("/api/stats")
def admin_stats():
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        # Total complaints today
        cursor.execute("""
            SELECT COUNT(*) as total_today
            FROM complaints
            WHERE DATE(reported_at) = CURDATE()
        """)
        total_today = cursor.fetchone()["total_today"]

        # Escalated today
        cursor.execute("""
            SELECT COUNT(*) as escalated_today
            FROM complaints
            WHERE DATE(escalated_at) = CURDATE()
        """)
        escalated_today = cursor.fetchone()["escalated_today"]

        # Total users
        cursor.execute("SELECT COUNT(*) as total_users FROM users")
        total_users = cursor.fetchone()["total_users"]

        # Active tickets (not resolved)
        cursor.execute("""
            SELECT COUNT(*) as active_tickets
            FROM complaints
            WHERE status <> 'Resolved'
        """)
        active_tickets = cursor.fetchone()["active_tickets"]

        # Priority summary
        cursor.execute("""
            SELECT priority, COUNT(*) as count
            FROM complaints
            GROUP BY priority
        """)
        priority_summary = cursor.fetchall()

        # Status distribution
        cursor.execute("""
            SELECT status, COUNT(*) as count
            FROM complaints
            GROUP BY status
        """)
        status_distribution = cursor.fetchall()

        # Department volume
        cursor.execute("""
            SELECT department, COUNT(*) as count
            FROM complaints
            GROUP BY department
        """)
        department_volume = cursor.fetchall()

        return {
            "total_today": total_today,
            "percentage_change": 0,
            "escalated_today": escalated_today,
            "total_users": total_users,
            "active_tickets": active_tickets,
            "priority_summary": priority_summary,
            "status_distribution": status_distribution,
            "department_volume": department_volume
        }

    finally:
        if cursor: cursor.close()
        if conn: conn.close()
# ===================== ESCALATIONS LIST =====================
@app.get("/escalations")
def get_escalations():
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT id, type, priority, department
            FROM complaints
            WHERE status = 'Escalated'
            ORDER BY escalated_at DESC
            LIMIT 10
        """)

        rows = cursor.fetchall()

        return {"escalated": rows}

    finally:
        if cursor: cursor.close()
        if conn: conn.close()

# ===================== AI SUGGESTION =====================
@app.get("/api/ai-suggestion")
def ai_suggestion():
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT department, COUNT(*) as count
            FROM complaints
            GROUP BY department
            ORDER BY count DESC
            LIMIT 1
        """)
        top = cursor.fetchone()

        if not top:
            return {"suggestion": "No data available yet."}

        return {
            "suggestion": f"Most complaints are from {top['department']}. Consider allocating more resources there."
        }

    finally:
        if cursor: cursor.close()
        if conn: conn.close()
# ===================== ADMIN GET ALL COMPLAINTS =====================
@app.get("/api/admin/complaints")
def get_all_complaints():
    conn = None
    cursor = None
    try:
        conn = get_conn()
        cursor = conn.cursor(dictionary=True)

        cursor.execute("""
            SELECT 
                c.id,
                c.type,
                c.description,
                c.status,
                c.priority,
                c.department,
                c.reported_at,
                u.location_text
            FROM complaints c
            JOIN users u ON u.id = c.user_id
            ORDER BY c.reported_at DESC
        """)

        rows = cursor.fetchall()
        return rows

    except sql.Error as e:
        raise HTTPException(status_code=500, detail=f"MySQL error: {str(e)}")

    finally:
        if cursor: cursor.close()
        if conn: conn.close()
