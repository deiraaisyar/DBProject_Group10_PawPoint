#!/usr/bin/env python3
"""
Test script untuk connect langsung ke Supabase PostgreSQL
"""
import psycopg2
from psycopg2.extras import DictCursor
import time

# Supabase credentials
DB_CONFIG = {
    'host': 'uuiuirnrfttjhmspbgqf.supabase.co',
    'user': 'postgres',
    'password': 'projekbasdat10',
    'database': 'postgres',
    'port': 5432,
    'sslmode': 'require'
}

print("=" * 60)
print("Testing Supabase Connection")
print("=" * 60)

try:
    print("\n1️⃣ Connecting to Supabase...")
    start = time.time()
    conn = psycopg2.connect(
        host=DB_CONFIG['host'],
        user=DB_CONFIG['user'],
        password=DB_CONFIG['password'],
        database=DB_CONFIG['database'],
        port=DB_CONFIG['port'],
        sslmode=DB_CONFIG['sslmode']
    )
    elapsed = time.time() - start
    print(f"✅ Connected in {elapsed:.2f}s")
    
    with conn.cursor(cursor_factory=DictCursor) as cur:
        # Test 1: Simple query
        print("\n2️⃣ Testing simple query...")
        start = time.time()
        cur.execute("SELECT 1 as test")
        result = cur.fetchone()
        elapsed = time.time() - start
        print(f"✅ Query result: {result}, Time: {elapsed:.2f}s")
        
        # Test 2: Count users
        print("\n3️⃣ Checking 'user' table...")
        start = time.time()
        cur.execute('SELECT COUNT(*) as count FROM "user"')
        result = cur.fetchone()
        elapsed = time.time() - start
        print(f"✅ User count: {result['count']}, Time: {elapsed:.2f}s")
        
        # Test 3: List tables
        print("\n4️⃣ Listing all tables...")
        start = time.time()
        cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema='public'
        """)
        tables = cur.fetchall()
        elapsed = time.time() - start
        print(f"✅ Found {len(tables)} tables in {elapsed:.2f}s:")
        for tbl in tables:
            print(f"   - {tbl['table_name']}")
        
        # Test 4: Test login query
        print("\n5️⃣ Testing login query (find admin@pawpoint.com)...")
        start = time.time()
        cur.execute("""
            SELECT u.user_id, u.password_hash, r.role, u.first_name, u.last_name
            FROM "user" u
            JOIN user_role ur ON u.user_id = ur.user_id
            JOIN role r ON ur.role_id = r.role_id
            WHERE u.email=%s
            LIMIT 1
        """, ('admin@pawpoint.com',))
        user = cur.fetchone()
        elapsed = time.time() - start
        if user:
            print(f"✅ Found user in {elapsed:.2f}s: {user['first_name']} {user['last_name']} (Role: {user['role']})")
            print(f"   User ID: {user['user_id']}")
            print(f"   Password hash: {user['password_hash'][:50]}...")
        else:
            print(f"❌ User not found in {elapsed:.2f}s")
        
        # Test 5: Test veterinarians query
        print("\n6️⃣ Testing veterinarians query...")
        start = time.time()
        cur.execute("""
            SELECT 
                v.veterinarian_id,
                v.license_no,
                v.user_id,
                u.first_name,
                u.last_name
            FROM veterinarian v
            LEFT JOIN "user" u ON v.user_id = u.user_id
            LIMIT 5
        """)
        vets = cur.fetchall()
        elapsed = time.time() - start
        print(f"✅ Found {len(vets)} vets in {elapsed:.2f}s:")
        for vet in vets:
            print(f"   - {vet['license_no']}: {vet.get('first_name', 'N/A')} {vet.get('last_name', 'N/A')}")
    
    conn.close()
    print("\n" + "=" * 60)
    print("✅ All tests passed!")
    print("=" * 60)

except Exception as e:
    print(f"\n❌ Error: {str(e)}")
    print(f"Error type: {type(e).__name__}")
    import traceback
    traceback.print_exc()
