# Student Data Upload Format Guide

## Overview

The student import feature allows bulk uploading of student records via CSV files. The system automatically calculates risk levels using the advanced risk classification system based on attendance, average marks, and pending fees.

## CSV Format

### Required Columns (In Order)

| Column | Field Name | Type | Range | Required | Description |
|--------|-----------|------|-------|----------|-------------|
| 1 | name | String | - | Yes | Student's full name |
| 2 | roll_no | String | - | No | Rolling number/ID |
| 3 | department | String | - | No | Department name |
| 4 | attendance | Number | 0-100 | Yes | Attendance percentage |
| 5 | subject1_marks | Number | 0-100 | Yes | Subject 1 marks |
| 6 | subject2_marks | Number | 0-100 | Yes | Subject 2 marks |
| 7 | subject3_marks | Number | 0-100 | Yes | Subject 3 marks |
| 8 | subject4_marks | Number | 0-100 | Yes | Subject 4 marks |
| 9 | subject5_marks | Number | 0-100 | Yes | Subject 5 marks |
| 10 | fees_pending | Number | 0-100 | Yes | Percentage of fees pending (0-100%) |

## Example CSV

```csv
name,roll_no,department,attendance,subject1_marks,subject2_marks,subject3_marks,subject4_marks,subject5_marks,fees_pending
Raj Kumar,21CS001,Computer Science,85,78,82,80,85,5
Priya Singh,21CS002,Computer Science,92,88,90,89,91,2
Amit Patel,21CS003,Computer Science,45,40,42,38,35,75
```

## Data Specifications

### Attendance & Marks
- Must be between **0 and 100**
- Can include decimals (e.g., 85.5)
- Values outside range will be **automatically clamped** to 0-100

### Fees Pending %
- Represents **percentage of total fees outstanding**
- Example: If total fees = ₹20,000 and pending = ₹10,000 → fees_pending = 50
- Must be between **0 and 100**

### Name Field
- Must not be empty
- Can include spaces and special characters
- Duplicates are allowed (different students)

### Roll Number & Department
- Optional fields
- If provided, duplicate roll numbers will be **rejected**
- Department helps with data organization

## Automatic Risk Classification

### What Happens During Upload

1. **Average Marks Calculation**
   - System calculates: (Subject1 + Subject2 + Subject3 + Subject4 + Subject5) / 5

2. **Risk Assessment**
   - Uses the **Risk Classification System** with three criteria:
     - Attendance %
     - Average Marks %  
     - Fees Pending %

3. **Risk Levels**

   | Level | Condition | Confidence |
   |-------|-----------|------------|
   | **HIGH** | attendance < 50 OR marks < 40 OR fees > 70 | 70-100% |
   | **MEDIUM** | attendance 50-75 OR marks 40-60 OR fees 30-70 | 40-69% |
   | **LOW** | attendance > 75 AND marks > 60 AND fees < 30 | 0-39% |

4. **Alert Generation**
   - HIGH risk students automatically get an alert
   - Alerts include critical factors (e.g., "Very low attendance: 40%")

## How to Upload

### Via Web Interface

1. Go to **Import Data** page (`/import`)
2. Click **"Download Sample CSV"** to get a template
3. Fill in your student data
4. Drag & drop or click to select the CSV file
5. Click **"Upload and Process"**
6. View results immediately

### File Format Support

- ✅ **CSV** (Comma-separated values) - Recommended
- ✅ **Excel** (.xlsx, .xls)
- ✅ **JSON**

### CSV Creation Tips

**Using Excel:**
1. Create columns: name, roll_no, department, attendance, subject1_marks, ... fees_pending
2. Enter data
3. File → Save As → Choose "CSV UTF-8 (.csv)"

**Using Google Sheets:**
1. Create columns as above
2. File → Download → CSV

**Using Text Editor:**
1. Create file with headers: `name,roll_no,department,attendance,...`
2. Add data rows
3. Save as `.csv`

## Validation Rules

### Data Validation
- ✅ Name is required and non-empty
- ✅ All numeric fields must be valid numbers (0-100)
- ✅ Duplicate roll numbers are rejected
- ✅ Values outside 0-100 are clamped

### Error Handling
- If a row has errors, it's **skipped** (not imported)
- Error count is reported after upload
- Other rows are still imported successfully

### Example Errors
```
Row 5: Name is empty → SKIPPED
Row 8: Attendance = 150 → CLAMPED to 100
Row 12: Duplicate roll_no → SKIPPED
Row 15: Non-numeric subject1_marks → SKIPPED
```

## Upload Results

After successful upload, you'll see:

```
✓ Imported 9 students successfully!
  2 high-risk students detected
```

### Result Display

For each imported student:
- **ID**: Database ID
- **Name**: Student name
- **Roll No**: If provided
- **Department**: If provided  
- **Risk Level**: LOW, MEDIUM, or HIGH
- **Confidence**: 0-100% confidence score

## Important Notes

⚠️ **Before Uploading:**
- Check that all required columns are present
- Verify numeric values are between 0-100
- Ensure names are not empty
- Use UTF-8 encoding for special characters

📝 **After Uploading:**
- HIGH risk students automatically get alerts
- Average marks are calculated automatically
- Risk classification is performed immediately
- Data is committed to database

🔄 **Duplicate Handling:**
- Duplicate names are allowed (different students with same name)
- Duplicate roll numbers are **rejected** if roll_no is provided
- Consider including roll_no to prevent accidental duplicates

## Troubleshooting

### Upload Fails with Network Error
- Check backend is running: `http://127.0.0.1:8000`
- Check frontend `.env.local` has `NEXT_PUBLIC_API_URL=http://127.0.0.1:8000`

### Some Rows Are Skipped
- Check CSV format matches expected columns
- Verify all numeric values are 0-100
- Ensure names are not empty
- Check for duplicate roll numbers

### Risk Level Seems Wrong
- Calculate average marks: (S1 + S2 + S3 + S4 + S5) / 5
- Verify against risk rules above
- Check attendance and fees_pending values

### Can't Download Sample CSV
- Try using Firefox or Chrome browser
- Check browser download settings
- Try manually creating CSV with format above

## Sample Data

See `sample_upload.csv` for a complete example with various risk levels:
- ✅ LOW RISK: Raj Kumar (85% attendance, 80.6 avg marks, 5% fees)
- ⚠️ MEDIUM RISK: Zara Khan (70% attendance, 69 avg marks, 40% fees)
- 🔴 HIGH RISK: Vikram Singh (38% attendance, 31 avg marks, 85% fees)

## API Details

**Endpoint**: `POST /upload`  
**Content-Type**: `multipart/form-data`

### Request
```
file: <CSV file>
```

### Response
```json
{
  "imported": 9,
  "errors": 1,
  "students": [
    {
      "id": 1,
      "name": "Raj Kumar",
      "roll_no": "21CS001",
      "department": "Computer Science",
      "risk_level": "low",
      "confidence": 95
    },
    ...
  ],
  "message": "Successfully imported 9 students (1 rows skipped due to errors)"
}
```

## Best Practices

1. **Use Sample Template**: Download sample CSV to ensure correct format
2. **Validate Before Upload**: Check data in spreadsheet first
3. **Use Roll Numbers**: Helps identify students uniquely
4. **Decimal Values**: Allowed for fine-grained scoring
5. **Batch Processing**: Can upload 100+ students at once
6. **Monitor Alerts**: Check results for HIGH risk students immediately

## Related Documentation

- [Risk Classification System](RISK_CLASSIFICATION_SYSTEM.md)
- [Student Management](README.md)
- [System Setup](SETUP_CHECKLIST.md)

---

**Last Updated**: April 2, 2026  
**Version**: 1.0
