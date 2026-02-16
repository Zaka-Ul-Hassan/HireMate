# app\services\scheduler\scheduler.py

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import atexit

from app.db import get_db
from app.services.email.email_service import save_fetch_replied_emails
from app.services.email.email_settings_service import get_all_email_settings


def fetch_email_replies_job():
    try:
        db = next(get_db())

        response = get_all_email_settings(db)
        if not response.status or not response.data:
            return

        for settings in response.data:
            user_id = settings.UserId
            try:
                print(f"Fetching replied emails for user_id: {user_id}")
                result = save_fetch_replied_emails(db, user_id)
                if not result.status:
                    print(f"Skipping user {user_id}: {result.message}")
                    continue
            except Exception as e_user:
                print(f"Error fetching emails for user {user_id}: {e_user}")
                continue

    except Exception as e:
        print(f"Error in fetch_replies_for_all_users_job: {e}")
    finally:
        db.close()


def start_email_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.start()
    scheduler.add_job(
        func=fetch_email_replies_job,
        trigger=IntervalTrigger(minutes=5),
        id="fetch_email_replies_job",
        replace_existing=True
    )
    atexit.register(lambda: scheduler.shutdown())
    print("Email scheduler started.")