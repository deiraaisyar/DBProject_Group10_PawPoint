#!/usr/bin/env python3
"""
Properly replace get_connection() with get_db_conn() context manager
This version handles all edge cases correctly
"""

with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'r') as f:
    lines = f.readlines()

output_lines = []
i = 0

# First, update the import
for idx, line in enumerate(lines):
    if 'from db import get_connection' in line:
        lines[idx] = line.replace('from db import get_connection', 'from db import get_db_conn')
        break

while i < len(lines):
    line = lines[i]
    
    # Pattern 1: Simple case - conn = get_connection() followed by try-with-with structure
    if 'conn = get_connection()' in line and i + 1 < len(lines):
        indent = len(line) - len(line.lstrip())
        indent_str = ' ' * indent
        
        # Look ahead to see the structure
        next_line = lines[i + 1] if i + 1 < len(lines) else ''
        
        # Case A: conn = get_connection() -> try: -> with conn: -> with conn.cursor():
        if 'try:' in next_line and i + 2 < len(lines) and 'with conn:' in lines[i + 2]:
            # Replace with context manager
            output_lines.append(f'{indent_str}with get_db_conn() as conn:\n')
            output_lines.append(f'{indent_str}    try:\n')
            i += 2  # Skip 'try:' and 'with conn:'
            
            # Now add cursor line
            i += 1
            cursor_line = lines[i]
            cursor_indent = len(cursor_line) - len(cursor_line.lstrip())
            # Adjust cursor indent to be 8 spaces from base (4 for try, 4 for with cursor)
            output_lines.append(f'{indent_str}        with conn.cursor() as cur:\n')
            i += 1
            
            # Continue copying until we find 'finally: conn.close()'
            in_block = True
            except_found = False
            while i < len(lines) and in_block:
                current = lines[i]
                current_indent = len(current) - len(current.lstrip())
                
                # Skip 'finally:' and 'conn.close()' lines
                if current_indent == indent and 'finally:' in current:
                    i += 1
                    if i < len(lines) and 'conn.close()' in lines[i]:
                        i += 1
                    in_block = False
                    break
                
                # Handle except blocks - keep them at same level as try
                if 'except ' in current and current_indent == indent:
                    # Remove extra indentation if any
                    output_lines.append(f'{indent_str}    except Exception as e:\n')
                    except_found = True
                    i += 1
                    continue
                
                # Regular lines - keep relative indentation
                if except_found and current_indent > indent:
                    # Lines inside except block
                    relative_indent = current_indent - indent - 4  # Base indent of original try block
                    output_lines.append(f'{indent_str}        {current.lstrip()}')
                    i += 1
                    continue
                    
                # Lines inside try block - add 4 more spaces (already have 8 from with cursor)
                if current_indent > indent + 12:  # Inside cursor context
                    relative_indent = current_indent - indent - 16
                    output_lines.append(f'{indent_str}            {" " * relative_indent}{current.lstrip()}')
                else:
                    output_lines.append(current)
                i += 1
            continue
    
    output_lines.append(line)
    i += 1

# Write the result
with open('/home/lenovo/UGM/assignment/semester_3/database/DBProject_Group3_PawPoint/week4_integration/backend/app.py', 'w') as f:
    f.writelines(output_lines)

print("✅ Successfully updated app.py with get_db_conn() context manager")
