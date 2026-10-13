import sqlite3
import os
from app.config import settings

def run_db_migrations():
    """Ensure newly added columns and tables exist in SQLite without data loss."""
    db_path = settings.DATABASE_URL.replace("sqlite:///", "")
    if not os.path.exists(db_path):
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    try:
        # Check bookings columns
        cursor.execute("PRAGMA table_info(bookings)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if "coupon_id" not in columns:
            cursor.execute("ALTER TABLE bookings ADD COLUMN coupon_id INTEGER REFERENCES coupons(id)")
        if "discount_amount" not in columns:
            cursor.execute("ALTER TABLE bookings ADD COLUMN discount_amount REAL DEFAULT 0.0")
        if "final_amount" not in columns:
            cursor.execute("ALTER TABLE bookings ADD COLUMN final_amount REAL DEFAULT 0.0")
        cursor.execute("UPDATE bookings SET final_amount = total_price WHERE final_amount IS NULL OR final_amount = 0.0")
        cursor.execute("UPDATE bookings SET discount_amount = 0.0 WHERE discount_amount IS NULL")

        # Check notifications columns
        cursor.execute("PRAGMA table_info(notifications)")
        notif_columns = [col[1] for col in cursor.fetchall()]
        if "notification_type" not in notif_columns:
            cursor.execute("ALTER TABLE notifications ADD COLUMN notification_type TEXT DEFAULT 'EVENT'")
            cursor.execute("UPDATE notifications SET notification_type = type WHERE notification_type IS NULL")

        # Check coupons columns
        cursor.execute("PRAGMA table_info(coupons)")
        coupon_columns = [col[1] for col in cursor.fetchall()]
        if coupon_columns and "times_used" not in coupon_columns:
            cursor.execute("ALTER TABLE coupons ADD COLUMN times_used INTEGER DEFAULT 0")

        conn.commit()
    except Exception as e:
        print(f"Migration note: {e}")

    finally:
        conn.close()
