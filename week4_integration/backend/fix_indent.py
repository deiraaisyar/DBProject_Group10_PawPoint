#!/usr/bin/env python3
"""
Fix indentation issues after replacing get_connection() with get_db_conn()
"""
import re

with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'r') as f:
    content = f.read()

# Fix pattern where "with get_db_conn() as conn:" is followed by "try:" on next line without proper indentation
# Pattern: "with get_db_conn() as conn:\n    try:\n        with conn.cursor():"
# Should be: "with get_db_conn() as conn:\n        try:\n            with conn.cursor():"

pattern = r'(\s+)with get_db_conn\(\) as conn:\n(\s+)try:\n(\s+)with conn\.cursor\(\) as cur:'
def fix_indent(match):
    base_indent = match.group(1)
    # try should be indented 4 more spaces than with get_db_conn
    # with conn.cursor should be indented 4 more than try
    return f'{base_indent}with get_db_conn() as conn:\n{base_indent}    try:\n{base_indent}        with conn.cursor() as cur:'

content = re.sub(pattern, fix_indent, content)

with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'w') as f:
    f.write(content)

print("✅ Fixed indentation issues")
