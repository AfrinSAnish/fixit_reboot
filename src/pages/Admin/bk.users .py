import mysql.connector as sql

conn = sql.connect(
    host="localhost",
    user="root",
    password="Tuktuk@2008",
    database="fixit",
    port=3306
)

cursor = conn.cursor()

create_table_query = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    aadhar_number VARCHAR(12) NOT NULL UNIQUE,
    mobile_no VARCHAR(15) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8)
);
"""

cursor.execute(create_table_query)

print("Users table created successfully!")

cursor.close()
conn.close()