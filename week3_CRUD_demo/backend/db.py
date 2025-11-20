import os
import pymysql
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return pymysql.connect(
        host='localhost',
        user='root',
        password=os.environ.get('DB_PASSWORD', ''),
        database=os.environ.get('DB_NAME', ''),
        cursorclass=pymysql.cursors.DictCursor
    )

if __name__ == "__main__":
    try:
        conn = get_connection()
        with conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1")
                print("DB connected! Result:", cur.fetchone())
    except Exception as e:
        print("Connection error:", e)
