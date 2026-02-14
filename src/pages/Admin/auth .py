from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import mysql.connector
import bcrypt
app = FastAPI()
conn = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tuktuk@2008",
    database="fixit"
)
cursor = conn.cursor(dictionary=True) 
class SignupModel(BaseModel):
    name: str
    aadhar: str
    ward: int
    mobile: str
    password: str

class LoginModel(BaseModel):
    aadhar: str
    password: str

def hash_aadhar(aadhar: str) -> str:
    first8 = aadhar[:8]
    last4 = aadhar[8:]
    hashed_first8 = bcrypt.hashpw(first8.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    return hashed_first8 + last4

def check_aadhar(aadhar_input: str, stored: str) -> bool:
    first8_input = aadhar_input[:8]
    last4_input = aadhar_input[8:]
    stored_hashed = stored[:-4]
    stored_last4 = stored[-4:]
    if last4_input != stored_last4:
        return False
    return bcrypt.checkpw(first8_input.encode('utf-8'), stored_hashed.encode('utf-8'))

def find_user_by_aadhar(aadhar_input: str):
    last4 = aadhar_input[-4:]
    cursor.execute("SELECT * FROM users WHERE aadhar_no LIKE %s", ('%' + last4,))
    candidates = cursor.fetchall()
    for user in candidates:
        if check_aadhar(aadhar_input, user['aadhar_no']):
            return user
    return None

#signup
@app.post("/api/signup")
def signup(data: SignupModel):
    existing_user = find_user_by_aadhar(data.aadhar)
    if existing_user:
        raise HTTPException(status_code=400, detail="Aadhaar already registered")
    hashed_aadhar = hash_aadhar(data.aadhar)
    hashed_password = bcrypt.hashpw(data.password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    cursor.execute("INSERT INTO users (name, aadhar_no, ward_no, mobile_no, password) VALUES (%s,%s,%s,%s,%s)",
        (data.name, hashed_aadhar, data.ward, data.mobile, hashed_password))
    conn.commit()
    return {"status": "success", "message": "User registered successfully", "user_id": cursor.lastrowid}

#login_in
@app.post("/api/login")
def login(data: LoginModel):
    user = find_user_by_aadhar(data.aadhar)
    if not user:
        raise HTTPException(status_code=404, detail="Aadhaar not found")
    if not bcrypt.checkpw(data.password.encode('utf-8'), user['password'].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Incorrect password")
    return {"status": "success", "message": "Login successful", "user_id": user['id'], "name": user['name']}