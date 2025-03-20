import schedule
import psycopg2
import time
from plyer import notification

def connect_db():
    return psycopg2.connect(
        dbname="porthealth", user="your_user", password="your_password", host="localhost", port="5432"
    )

def fetch_reminders_from_db():
    conn = connect_db()
    cur = conn.cursor()
    cur.execute("SELECT id, user_id, type, message, remind_at FROM reminders WHERE remind_at > NOW();")
    reminders_data = cur.fetchall()
    cur.close()
    conn.close()
    return reminders_data

class Reminder:
    def __init__(self, reminder_id, user_id, reminder_type, message, remind_at):
        self.reminder_id = reminder_id
        self.user_id = user_id
        self.reminder_type = reminder_type
        self.message = message
        self.remind_at = remind_at

    def schedule_reminder(self):
        remind_time = self.remind_at.strftime("%H:%M")
        schedule.every().day.at(remind_time).do(self.send_notification)

    def send_notification(self):
        notification.notify(
            title=self.reminder_type.capitalize() + " Reminder",
            message=self.message,
            timeout=10
        )

def start_scheduler():
    reminders = fetch_reminders_from_db()
    reminder_objects = [Reminder(*data) for data in reminders]

    for reminder in reminder_objects:
        reminder.schedule_reminder()

    while True:
        schedule.run_pending()
        time.sleep(1)

# Start scheduling reminders
start_scheduler()
