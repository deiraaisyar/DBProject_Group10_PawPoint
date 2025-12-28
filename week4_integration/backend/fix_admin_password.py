import os
import psycopg2
from psycopg2.extras import DictCursor
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv

load_dotenv()

# Connect to Supabase
conn = psycopg2.connect(
    host=os.environ["DB_HOST"],
    user=os.environ["DB_USER"],
    password=os.environ["DB_PASSWORD"],
    database=os.environ.get("DB_NAME", "postgres"),
    port=int(os.environ.get("DB_PORT", 6543)),
    sslmode=os.environ.get("DB_SSLMODE", "require"),
    cursor_factory=DictCursor
)

try:
    with conn.cursor() as cur:
        # Check admin user
        cur.execute("""
            SELECT u.user_id, u.email, u.password_hash, r.role
            FROM "user" u
            JOIN user_role ur ON u.user_id = ur.user_id
            JOIN role r ON ur.role_id = r.role_id
            WHERE u.email = 'admin@pawpoint.com'
        """)
        admin = cur.fetchone()
        
        if admin:
            print(f"✅ Admin found:")
            print(f"   User ID: {admin['user_id']}")
            print(f"   Email: {admin['email']}")
            print(f"   Role: {admin['role']}")
            print(f"   Current hash: {admin['password_hash'][:50]}...")
            
            # Generate new hash
            new_hash = generate_password_hash("admin123")
            print(f"\n🔄 Updating password hash...")
            
            # Update password
            cur.execute(
                'UPDATE "user" SET password_hash = %s WHERE user_id = %s',
                (new_hash, admin['user_id'])
            )
            conn.commit()
            print(f"✅ Password updated successfully!")
            print(f"   New hash: {new_hash[:50]}...")
        else:
            print("❌ Admin user not found!")
            print("Creating admin user...")
            
            # Create admin user
            cur.execute("""
                INSERT INTO "user" (first_name, last_name, email, password_hash, phone_no)
                VALUES ('Admin', 'PawPoint', 'admin@pawpoint.com', %s, '081234567890')
                RETURNING user_id
            """, (generate_password_hash("admin123"),))
            user_id = cur.fetchone()[0]
            
            # Get admin role
            cur.execute("SELECT role_id FROM role WHERE role = 'admin'")
            role = cur.fetchone()
            
            if role:
                cur.execute(
                    "INSERT INTO user_role (user_id, role_id) VALUES (%s, %s)",
                    (user_id, role['role_id'])
                )
                conn.commit()
                print(f"✅ Admin created with user_id: {user_id}")
            else:
                print("❌ Admin role not found in database!")
                
finally:
    conn.close()
    
print("\n✅ Done! Try login with: admin@pawpoint.com / admin123")
