# app\services\scheduler\scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

from app.services.email.email_service import fetch_all_emails

def start_email_scheduler():
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=fetch_all_emails,
        trigger=IntervalTrigger(minutes=2),
        id='email_fetch_job',
        name='Fetch Emails Every 2 Minutes',
        replace_existing=True
    )

    scheduler.start()
    print("Scheduler started")

    #scheduler shuts down on app exit
    atexit.register(lambda: scheduler.shutdown())
    print("emails fetched")