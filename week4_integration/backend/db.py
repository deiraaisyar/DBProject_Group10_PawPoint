import os
import psycopg2
from psycopg2.pool import SimpleConnectionPool
from psycopg2.extras import DictCursor
from dotenv import load_dotenv
from contextlib import contextmanager

load_dotenv()

_pool = None


def init_db_pool():
    """
    Initialize PostgreSQL connection pool (Supabase-safe)
    """
    global _pool
    if _pool is None:
        _pool = SimpleConnectionPool(
            minconn=1,
            maxconn=10,  # allow more concurrent requests; still modest for Supabase
            host=os.environ["DB_HOST"],
            user=os.environ["DB_USER"],
            password=os.environ["DB_PASSWORD"],
            database=os.environ.get("DB_NAME", "postgres"),
            port=int(os.environ.get("DB_PORT", 6543)),
            sslmode=os.environ.get("DB_SSLMODE", "require"),
            cursor_factory=DictCursor,
            connect_timeout=10,
            options="-c statement_timeout=30000"
        )


def get_connection():
    if _pool is None:
        init_db_pool()
    return _pool.getconn()


def release_connection(conn):
    if _pool and conn:
        _pool.putconn(conn)


@contextmanager
def get_db_conn():
    conn = get_connection()
    try:
        yield conn
    finally:
        release_connection(conn)


# =========================
# Local test
# =========================
if __name__ == "__main__":
    try:
        init_db_pool()
        with get_db_conn() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 AS test")
                print("DB connected! Result:", cur.fetchone())
    except Exception as e:
        print("Connection error:", e)
