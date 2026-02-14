import mysql.connector
import mysql.connector

def auto_escalate():
    connection = mysql.connector.connect(
        host="localhost",
        user="root",
        password="Tuktuk@2008",
        database="fixit"
    )

    cursor = connection.cursor()

    # Condition 1: Older than 24 hours
    cursor.execute("""
        UPDATE complaints
        SET status = 'Escalated',
            escalated_at = NOW()
        WHERE status = 'Reported'
        AND reported_at <= NOW() - INTERVAL 1 DAY
    """)

    # Condition 2: Clustered complaints (more than 5 same type within 5km)
    cursor.execute("""
        UPDATE complaints c
        JOIN (
            SELECT c1.id
            FROM complaints c1
            JOIN complaints c2
              ON c1.type = c2.type
              AND c1.id != c2.id
              AND c1.status = 'Reported'
              AND c2.status = 'Reported'
              AND c1.latitude IS NOT NULL
              AND c1.longitude IS NOT NULL
              AND c2.latitude IS NOT NULL
              AND c2.longitude IS NOT NULL
              AND (
                6371000 * ACOS(
                    COS(RADIANS(c1.latitude)) * COS(RADIANS(c2.latitude)) *
                    COS(RADIANS(c2.longitude) - RADIANS(c1.longitude)) +
                    SIN(RADIANS(c1.latitude)) * SIN(RADIANS(c2.latitude))
                )
              ) <= 5000
            GROUP BY c1.id
            HAVING COUNT(c2.id) > 5
        ) clustered ON c.id = clustered.id
        SET c.status = 'Escalated',
            c.escalated_at = NOW()
    """)

    connection.commit()
    cursor.close()
    connection.close()
