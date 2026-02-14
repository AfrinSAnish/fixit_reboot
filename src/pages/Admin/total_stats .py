from datetime import datetime, timedelta
import mysql.connector

def get_dashboard_stats():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Tuktuk@2008",
        database="fixit"
    )
    cursor = connection.cursor(dictionary=True)
    today = datetime.now().date()
    yesterday = today - timedelta(days=1)
    cursor.execute("""
        SELECT COUNT(*) AS total_today
        FROM complaints
        WHERE DATE(reported_at) = %s
    """, (today,))
    total_today = cursor.fetchone()["total_today"]
    cursor.execute("""
        SELECT COUNT(*) AS total_yesterday
        FROM complaints
        WHERE DATE(reported_at) = %s
    """, (yesterday,))
    total_yesterday = cursor.fetchone()["total_yesterday"]
    cursor.execute("""
        SELECT COUNT(*) AS escalated_today
        FROM complaints
        WHERE DATE(reported_at) = %s
        AND status = 'Escalated'
    """, (today,))
    escalated_today = cursor.fetchone()["escalated_today"]
    cursor.execute("""
        SELECT COUNT(*) AS total_users
        FROM users
    """)
    total_users = cursor.fetchone()["total_users"]
    cursor.execute("""
        SELECT COUNT(*) AS active_tickets
        FROM complaints
        WHERE status = 'InProgress'
    """)
    active_tickets = cursor.fetchone()["active_tickets"]
    if total_yesterday == 0:
        percentage_change = 100 if total_today > 0 else 0
    else:
        percentage_change = ((total_today - total_yesterday) / total_yesterday) * 100

    connection.close()
    return {
        "total_today": total_today,
        "escalated_today": escalated_today,
        "percentage_change": round(percentage_change, 2),
        "total_users": total_users,
        "active_tickets": active_tickets
    }