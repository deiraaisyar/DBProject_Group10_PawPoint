import os
import psycopg2
from psycopg2.extras import DictCursor
from psycopg2.pool import SimpleConnectionPool
from dotenv import load_dotenv

load_dotenv()

# =========================
# Global Connection Pool
# =========================
_pool = None

def init_db_pool():
    """
    Initialize PostgreSQL connection pool (Supabase-friendly)
    """
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(
            minconn=1,
            maxconn=5,
            host=os.environ["DB_HOST"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ.get("DB_NAME", "postgres"),
            port=int(os.environ.get("DB_PORT", 5432)),
            sslmode="require",
            cursor_factory=DictCursor
        )

def get_connection():
    """
    Get connection from pool
    """
    if _pool is None:
        init_db_pool()
    return _pool.getconn()

def release_connection(conn):
    """
    Return connection to pool
    """
    if _pool:
        _pool.putconn(conn)

# =========================
# Local test
# =========================
if __name__ == "__main__":
    try:
        init_db_pool()
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS test")
                print("DB connected! Result:", cur.fetchone())
        release_connection(conn)
    except Exception as e:
        print("Connection error:", e)
