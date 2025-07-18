# app\services\scheduler\scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

from app.services.email.email_service import fetch_all_emails
from app.services.email.email_service import store_emails_in_db

def start_email_scheduler():
    scheduler = BackgroundScheduler()

    scheduler.add_job(
        func=store_emails_in_db,
        trigger=IntervalTrigger(minutes=2),
        id='email_store_job',
        name='Fetch Emails Every 2 Minutes',
        replace_existing=True
    )

    scheduler.start()

    #scheduler shuts down on app exit
    atexit.register(lambda: scheduler.shutdown())
