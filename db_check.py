import sqlite3

# Just check database directly
conn = sqlite3.connect('backend/edupulse.db')
c = conn.cursor()

# Count students
c.execute('SELECT COUNT(*) as total FROM students')
total = c.fetchone()['total'] if hasattr(c.fetchone(), '__getitem__') else c.fetchall()[0][0]

# Try again with proper method
c = conn.cursor()
c.execute('SELECT COUNT(*) FROM students')
total = c.fetchone()[0]

with open('DB_STATUS.txt', 'w') as f:
    f.write(f"Total Students in Database: {total}\n")

if total > 0:
    c.execute('SELECT name, risk_level FROM students LIMIT 5')
    with open('DB_STATUS.txt', 'a') as f:
        f.write("\nSample Students:\n")
        for row in c.fetchall():
            f.write(f"  {row[0]} - Risk: {row[1]}\n")

conn.close()

# Display
with open('DB_STATUS.txt', 'r') as f:
    print(f.read())
