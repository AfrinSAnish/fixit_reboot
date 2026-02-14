import mysql.connector as sql

def get_conn():
    return sql.connect(
        host="localhost",
        user="fixit_user",
        password="fixit1234",
        database="fixit",
        port=3306
    )

def ensure_users_table(cursor):
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        aadhar_no VARCHAR(255) NOT NULL UNIQUE,
        mobile_no VARCHAR(15) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,

        lat DECIMAL(10,8) NULL,
        lng DECIMAL(11,8) NULL,
        location_text VARCHAR(255) NULL,

        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)

def ensure_complaints_table(cursor):
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

def init_db():
    conn = get_conn()
    cursor = conn.cursor()
    ensure_users_table(cursor)
    ensure_complaints_table(cursor)
    conn.commit()
    cursor.close()
    conn.close()
    print("✅ users + complaints tables created/verified successfully")

# run on import
init_db()
