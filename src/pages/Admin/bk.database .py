import mysql.connector
connection = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tuktuk@2008"
)
cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS fixit")
print("Database 'fixit' created successfully!")
cursor.close()
connection.close()