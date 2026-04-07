# Dashboard Navigation & Feature Map

## Complete Feature Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT DASHBOARD SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

CORE PAGES
├── /student-home
│   ├── Student Selection Dropdown
│   └── StudentDashboard Component (Main View)
│
├── / (Home Page)
│   └── Dashboard with all student management
│
└── /students
    └── Student list management for mentors


DASHBOARD SECTIONS (Left Side → Top to Bottom)
├── Header
│   ├── Welcome Message with Student Name
│   ├── Academic Year & Semester Info
│   └── Current Time/Date
│
├── Academic Health Score Card (TOP LEFT, 1/3 width)
│   ├── Circular Progress (0-100)
│   ├── Color-Coded Status
│   │   ├── 🟢 Green: ≥75 (Excellent)
│   │   ├── 🟡 Amber: 60-74 (Good)
│   │   └── 🔴 Red: <60 (At Risk)
│   ├── Status Text (✨ Excellent / ⚡ Good / ⚠️ Needs Attention)
│   └── Motivational Message
│
├── Quick Stats (TOP MIDDLE, 2/3 width)
│   ├── Attendance Card
│   │   ├── Percentage Display (large)
│   │   ├── Progress Bar (blue gradient)
│   │   ├── Status: ✓ Good / ⚠ Maintain / ✗ Low
│   │   └── Status Text (smart feedback)
│   │
│   └── Fee Status Card
│       ├── Status Display (Paid / Pending / % Paid)
│       ├── Progress Bar (amber gradient)
│       ├── Status: ✓ Cleared / ⚡ In Progress / ⚠ Complete Payment
│       └── Status Text (actionable)
│
├── Risk Assessment Card (TOP RIGHT, 1/3 width)
│   ├── Risk Level Display (HIGH/MEDIUM/LOW)
│   ├── Icon (Alert/Lightbulb/Check)
│   ├── Confidence Score (30-49 / 50-79 / 80-100)
│   ├── Individual Risk Breakdown
│   │   ├── Marks Risk (HIGH/MEDIUM/LOW)
│   │   ├── Attendance Risk (HIGH/MEDIUM/LOW)
│   │   └── Fees Risk (HIGH/MEDIUM/LOW)
│   └── Color-Coded Risk Indicators
│
├── Subject Performance Section (FULL WIDTH)
│   ├── 5 Subject Cards in a Grid
│   │   ├── Mathematics
│   │   │   ├── Circular Progress (0-100)
│   │   │   └── Status (⭐ Excellent / ✓ Good / ✗ Needs Work)
│   │   ├── Physics
│   │   ├── Chemistry
│   │   ├── English
│   │   └── CS/Economics
│   └── Hover Effects & Interactive Elements
│
├── Action Items Section (LEFT, BOTTOM HALF)
│   ├── Target Icon + Title
│   ├── Dynamic Task List (auto-generated)
│   │   ├── Attendance Improvement (if <75%)
│   │   │   └── Show: Current % & Target (75%+)
│   │   ├── Academic Boost (if avg <60%)
│   │   │   └── Show: Current avg & Target (60%+)
│   │   ├── Fee Payment (if pending)
│   │   │   └── Show: % Pending & Action
│   │   └── Join Study Group (always shown)
│   └── Checkbox Interface for Tracking
│
├── Study Tips Section (RIGHT, BOTTOM HALF)
│   ├── Sparkles Icon + Title
│   ├── 4 Actionable Tips
│   │   ├── 📚 Daily Review (30 min routine)
│   │   ├── ⏰ Time Management (Pomodoro)
│   │   ├── 👥 Peer Learning (weekly study)
│   │   └── 🎯 Goal Setting (weekly milestones)
│   └── Interactive Tip Cards
│
└── Achievements Section (FULL WIDTH, BOTTOM)
    ├── Trophy Icon + Title
    ├── 6 Achievement Badges (Grid)
    │   ├── 🌟 Attendance Star (≥90% attendance)
    │   ├── 🎯 High Scorer (≥80% marks)
    │   ├── 📈 Rising Star (≥70% marks)
    │   ├── 💯 Perfect Subject (any = 100%)
    │   ├── 🏆 All-Rounder (≥70% marks AND ≥75% attendance)
    │   └── 💪 Consistent (≥60% marks)
    │
    ├── Unlocked Badges
    │   ├── Full Color & Interaction
    │   ├── No Lock Icon
    │   └── Hover: Scale Effect (1.1x)
    │
    └── Locked Badges
        ├── Greyscale / Low Opacity
        ├── Lock Icon (🔒)
        └── Hover: Subtle Effect


ANIMATIONS & INTERACTIONS
├── Page Load
│   ├── Staggered animations (0.1s delay between elements)
│   ├── Fade-in + Y-translate
│   └── Smooth easing (cubic-bezier)
│
├── Circular Progress
│   ├── Stroke animation (0-100%)
│   ├── Duration: 1s
│   ├── Color transitions
│   └── Real-time updates
│
├── Hover States
│   ├── Scale: 1.02x
│   ├── Border color brighten
│   ├── Shadow enhancement
│   └── Duration: 200ms
│
└── Transitions
    ├── Smooth color changes
    ├── Progress bar fills
    ├── Status text updates
    └── All <300ms duration


COLOR SCHEME
├── Risk Indicators
│   ├── HIGH: Red (#ef4444)
│   ├── MEDIUM: Amber (#f59e0b)
│   └── LOW: Green (#10b981)
│
├── Component Colors
│   ├── Attendance: Blue (#3b82f6)
│   ├── Fees: Amber (#f59e0b)
│   ├── Actions: Blue (#3b82f6)
│   ├── Tips: Yellow (#fbbf24)
│   └── Achievements: Yellow (#fbbf24)
│
├── Backgrounds
│   ├── Main: Gradient (slate-900 → purple-900)
│   ├── Cards: Glass/Semi-transparent
│   ├── Text: White / Purple-200 / Purple-300
│   └── Hover: White/Color at 5-10% opacity
│
└── Gradients
    ├── Progress bars: Color gradient (left-right)
    ├── Background: Multi-color (diagonal)
    └── Accents: Subtle color blends


RESPONSIVE BREAKPOINTS

Desktop (1024px+)
├── 3-column layout for top stats
├── Full width subject cards
├── Side-by-side action items & tips
└── Full badge grid

Tablet (768px-1023px)
├── 2-column layout for top stats
├── 2-column subject cards
├── Stacked action items & tips
└── Stacked badges

Mobile (<768px)
├── Single column layout
├── All cards full width
├── Dropdown menu for actions
├── 2-column badge grid
└── Touch-optimized buttons


INTEGRATION POINTS

API Endpoints Used
├── GET /students
│   └── Fetch all students (for dropdown)
│
├── GET /students/{id}/risk-evaluation (POST)
│   └── Get detailed risk assessment
│
├── Refresh Interval: Every 5 seconds
├── Error Handling: Toast notifications
└── Fallback: Show last known data


Data Flow
├── Load Page → Fetch Students
├── Select Student → Fetch Risk Data
├── Calculate Metrics → Render Dashboard
├── Every 5s → Refresh All Data
└── User Action → Update UI + API


State Management
├── selectedStudent: StudentData | null
├── riskEval: RiskEvaluation | null
├── averageMarks: number
├── loading: boolean
└── Real-time updates via SWR


ACCESSIBILITY
├── WCAG 2.1 AA Compliance
├── Color Contrast: ≥4.5:1
├── Font Size: Base 16px
├── Focus Indicators: Visible
├── Keyboard Navigation: Fully supported
├── Screen Reader: Compatible
└── ARIA Labels: On interactive elements


PERFORMANCE
├── Load Time: <2 seconds
├── Time to Interactive: <3 seconds
├── FPS: 60 (smooth scrolling)
├── Bundle Size: ~150KB (gzipped)
├── Caching: SWR with 5s refresh
└── Optimizations: Code splitting, lazy loading
```

---

## Quick Navigation Guide

### For Students

**I want to...**

1. **See my overall performance**
   - Look at Academic Health Score (top-left circle)
   - Check color: Green ✓ / Amber ⚠ / Red ✗

2. **Understand why my risk is HIGH/MEDIUM**
   - Check Risk Assessment Card (top-right)
   - Read individual risk factors
   - Review action items below

3. **Know what to do next**
   - Check Action Items section (bottom-left)
   - Complete tasks in order
   - Check them off as done

4. **Improve my grades**
   - See Subject Performance cards (middle)
   - Identify weak subjects
   - Use Study Tips (bottom-right) to improve

5. **Unlock badges**
   - View Achievements section (very bottom)
   - See badge requirements
   - Work towards unlocking them

6. **Track my attendance**
   - Check Attendance Card (top-middle)
   - Target: ≥75% (green) or ≥90% (excellent)
   - Click to see requirements

7. **Check fee status**
   - Look at Fee Status Card (top-middle-right)
   - See payment percentage
   - Contact accounts if you have questions

---

### For Mentors/Educators

**I want to...**

1. **Monitor all my students' risk**
   - Go to main Dashboard (/)
   - See risk distribution stats
   - View "Recent Students" with risk badges

2. **Get details on a specific student**
   - Click student detail panel
   - See Risk Assessment Card
   - Review individual risk factors

3. **Identify at-risk students**
   - Look for HIGH risk badge (red)
   - Check MEDIUM risk badge (amber)
   - View unread alerts
   - Create intervention plan

4. **See performance trends**
   - Check analytics on main dashboard
   - Review average marks & attendance
   - Monitor risk distribution changes

5. **Generate reports**
   - Export student data (if available)
   - Create risk assessment reports
   - Plan interventions

---

## Feature Checklist

### For Students ✓

- [x] View personal academic health score
- [x] See risk assessment status
- [x] Track attendance percentage
- [x] Monitor fee payment status
- [x] View performance in 5 subjects
- [x] Get personalized action items
- [x] Receive study tips & guidance
- [x] Unlock achievement badges
- [x] Understand risk factors
- [x] Get confidence score
- [x] See motivational feedback
- [x] Mobile-friendly interface

### For System ✓

- [x] Real-time data updates (5s)
- [x] Smooth animations (60fps)
- [x] Responsive design
- [x] Accessibility compliant
- [x] Error handling
- [x] Performance optimized
- [x] Type-safe code
- [x] Well documented
- [x] Comprehensive tests

---

## Keyboard Shortcuts (Optional Additions)

```
Ctrl/Cmd + R    → Refresh dashboard
Ctrl/Cmd + N    → Next student
Ctrl/Cmd + P    → Previous student
Ctrl/Cmd + E    → Edit student
Ctrl/Cmd + D    → Delete student
Ctrl/Cmd + S    → Save/Submit action
```

---

## Mobile Experience

### Portrait Mode (<768px)
- Single column layout
- Large touch targets (48px minimum)
- Hamburger menu header
- Bottom notification bar
- Full-width cards

### Landscape Mode
- Two-column layout
- Adjusted spacing
- Optimized card width
- Touch-friendly buttons

---

## Troubleshooting Navigation

**Dashboard not loading?**
- Check browser console for errors
- Verify API endpoint is running
- Clear cache and refresh

**Data not updating?**
- Check network connection
- Verify API is responding
- Refresh manually (Ctrl+R)

**Performance issues?**
- Disable animations (in settings)
- Clear browser cache
- Check system resources

---

**Navigation Map Version**: 1.0
**Last Updated**: April 5, 2026
