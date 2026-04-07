import json
import urllib.request
import io

# Test CSV content with corrected sample data (10 fields each)
csv_content = """name,roll_no,department,attendance,subject1_marks,subject2_marks,subject3_marks,subject4_marks,subject5_marks,fees_pending
Raj Kumar,21CS001,Computer Science,85,78,82,80,85,79,5
Priya Singh,21CS002,Computer Science,92,88,90,89,91,87,2
Amit Patel,21CS003,Computer Science,45,40,42,38,35,39,75
Zara Khan,21IT001,Information Technology,70,65,68,70,72,66,40
Rohan Verma,21CE001,Civil Engineering,55,50,52,48,51,49,50
"""

# Create multipart form data
boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = [
    f'--{boundary}',
    'Content-Disposition: form-data; name="file"; filename="test.csv"',
    'Content-Type: text/csv',
    '',
    csv_content,
    f'--{boundary}--',
    ''
]
body_bytes = '\r\n'.join(body).encode('utf-8')

url = 'http://127.0.0.1:8000/upload'
request = urllib.request.Request(url, data=body_bytes)
request.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

try:
    with urllib.request.urlopen(request) as response:
        print("Status Code:", response.status)
        data = json.loads(response.read().decode('utf-8'))
        print("Response:")
        print(json.dumps(data, indent=2))
except urllib.error.HTTPError as e:
    print("Error Status Code:", e.code)
    print("Error Response:")
    print(e.read().decode('utf-8'))
