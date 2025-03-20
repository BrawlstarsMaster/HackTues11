import psycopg2
from datetime import datetime

def connect_db():
    return psycopg2.connect(
        dbname="porthealth", user="your_user", password="your_password", host="localhost", port="5432"
    )

def save_reminder_to_db(user_id, reminder_type, message, remind_at):
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO reminders (user_id, type, message, remind_at) 
        VALUES (%s, %s, %s, %s) RETURNING id;
    """, (user_id, reminder_type, message, remind_at))
    reminder_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return reminder_id
