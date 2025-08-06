# app\services\scheduler\scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

from app.db import SessionLocal
from app.models.resume.resume_model import Resume
from app.services.email.email_service import store_emails_in_db
from app.services.job.job_scanner_service import fetch_jobs_from_api

def combined_job():
    db = SessionLocal()
    try:
        store_emails_in_db()

        resumes = db.query(Resume).all()
        for resume in resumes:
            fetch_jobs_from_api(db=db, resume_id=resume.Id)
    except Exception as e:
        print(f"Scheduler Job error: {e}")
    finally:
        db.close()

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
