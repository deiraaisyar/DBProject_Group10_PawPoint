#!/usr/bin/env python3
"""
Script to replace all get_connection() + conn.close() patterns 
with get_db_conn() context manager in app.py
"""
import re

# Read the file
with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'r') as f:
    content = f.read()

# Pattern 1: Replace "conn = get_connection()" followed by try-with-finally blocks
# This pattern handles the most common case
pattern1 = r'(\s+)conn = get_connection\(\)\n(\s+)try:\n(\s+)with conn:\n(\s+)with conn\.cursor\(\) as cur:'
replacement1 = r'\1with get_db_conn() as conn:\n\2try:\n\3with conn.cursor() as cur:'
content = re.sub(pattern1, replacement1, content)

# Pattern 2: Remove "finally: conn.close()" blocks
pattern2 = r'\n\s+finally:\n\s+conn\.close\(\)'
content = re.sub(pattern2, '', content)

# Pattern 3: Handle special case in login where there's no try-with structure
pattern3 = r'(\s+)with get_db_conn\(\) as conn:\n(\s+)with conn\.cursor\(\) as cur:\n(.*?)\n\s+finally:\n\s+conn\.close\(\)'
replacement3 = r'\1with get_db_conn() as conn:\n\2with conn.cursor() as cur:\3'
content = re.sub(pattern3, replacement3, content, flags=re.DOTALL)

# Pattern 4: Clean up any remaining standalone "conn.close()" that might be indented
content = re.sub(r'\n\s+conn\.close\(\)\n', '\n', content)

# Write back
with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'w') as f:
    f.write(content)

print("✅ Successfully updated app.py to use get_db_conn() context manager")
print("✅ All connection pool leaks should be fixed now")
