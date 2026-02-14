import mysql.connector as sql
conn = sql.connect(
    host="localhost",
    user="root",
    password="Tuktuk@2008", 
    database="fixit",
    port=3306 
)
cursor = conn.cursor()
create_table_query = """CREATE TABLE complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,                          
    type VARCHAR(50) NOT NULL,
    description TEXT,
    image_url VARCHAR(255),
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
    FOREIGN KEY (user_id) REFERENCES users(id)
);"""

cursor.execute(create_table_query)
print("Users table created successfully!")
cursor.close()
conn.close()