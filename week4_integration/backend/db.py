import os
import psycopg2
from psycopg2.extras import DictCursor
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    """
    Get a connection to PostgreSQL database
    """
    return psycopg2.connect(
        host=os.environ.get('DB_HOST', 'localhost'),
        user=os.environ.get('DB_USER', 'postgres'),
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', 'pawpoint'),
        port=int(os.environ.get('DB_PORT', 5432)),
        sslmode=os.environ.get('DB_SSLMODE', 'prefer'),
        cursor_factory=DictCursor
    )

if __name__ == "__main__":
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 as test")
                print("DB connected! Result:", cur.fetchone())
    except Exception as e:
        print("Connection error:", e)
