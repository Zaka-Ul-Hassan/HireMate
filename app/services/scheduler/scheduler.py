# app\services\scheduler\scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

from app.services.email.email_service import store_emails_in_db


def combined_job():
    try:
        store_emails_in_db()
    except Exception as e:
        print(f"Scheduler Job error: {e}")

def start_email_scheduler():
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=combined_job,
        trigger=IntervalTrigger(minutes=10),
        id='email_store_job',
        name='Fetch Emails Every 10 Minutes',
        replace_existing=True
    )
    print("start")
    scheduler.start()


    #scheduler shuts down on app exit
    atexit.register(lambda: scheduler.shutdown())
