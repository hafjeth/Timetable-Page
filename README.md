# Timetable Management System

A web-based school timetable management application built with React and Vite. Designed for primary schools, the system supports per-class and per-teacher schedule views, recurring schedule modifications, Excel import, and PNG export.

---

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Architecture](#architecture)
- [Features](#features)
- [Data Model](#data-model)
- [Getting Started](#getting-started)
- [Usage](#usage)

---

## Overview

The application manages weekly timetables across multiple classes and teachers within a school. It operates entirely on the client side with no backend dependency — schedule data is held in React state and merged at render time from a base mock dataset and a user-driven modification log.

The core design principle is **non-destructive editing**: rather than mutating the base schedule directly, every user action (add, edit, delete, move) appends a typed modification record. The final schedule for any given week is computed by replaying these records against the base data. This makes it straightforward to reason about what changed, support recurring rules, and reverse modifications.

---

## Project Structure

```
src/
├── components/
│   └── common/
│       └── Toast.jsx
│
├── contexts/
│   └── SchoolConfigContext.jsx
│
├── features/
│   └── timetable/
│       ├── components/
│       │   ├── ActionButtons.jsx
│       │   ├── FilterBar.jsx
│       │   ├── SubjectLegend.jsx
│       │   ├── TeacherFilterBar.jsx
│       │   ├── TeacherSelector.jsx
│       │   ├── TeacherSubjectLegend.jsx
│       │   ├── TeacherTimetableGrid.jsx
│       │   ├── TimetableCell.jsx
│       │   ├── TimetableGrid.jsx
│       │   ├── TimetableHeader.jsx
│       │   └── WeekNavigator.jsx
│       │
│       ├── constants/
│       │   └── timetableConstants.js
│       │
│       ├── data/
│       │   ├── mockSchedule.js
│       │   └── teacherSubjects.js
│       │
│       ├── hooks/
│       │   ├── useExportPNG.js
│       │   ├── useSchedule.js
│       │   └── useTeacherView.js
│       │
│       ├── modals/
│       │   ├── AddScheduleModal.jsx
│       │   ├── DeleteConfirmModal.jsx
│       │   ├── EditScheduleModal.jsx
│       │   ├── ExportImageModal.jsx
│       │   ├── ImportExcelModal.jsx
│       │   └── MoveConfirmModal.jsx
│       │
│       ├── pages/
│       │   └── TimetablePage.jsx
│       │
│       └── utils/
│           └── timetableHelpers.js
│
├── layouts/
│   ├── MainLayout.jsx
│   ├── Navbar.jsx
│   └── TopTabs.jsx
│
├── routes/
│   └── AppRoutes.jsx
│
├── services/
│   └── excelService.js
│
├── styles/
│   ├── globals.css
│   ├── reset.css
│   └── variables.css
│
├── utils/
│   └── formatDate.js
│
└── App.jsx
```

---

## Architecture

### State Management

All schedule state is local to `TimetablePage` and distributed downward via props. There is no global store. The three custom hooks encapsulate distinct concerns:

**`useSchedule`** owns the modifications array and exposes handlers for every write operation. It also computes `fullSchoolScheduleForWeek` — the merged schedule for every class in the school — which is the shared input for both conflict detection and the teacher view.

**`useTeacherView`** derives `allTeachers`, `teacherSchedule`, and `teacherSubjects` from `fullSchoolScheduleForWeek` via memoized selectors. It has no side effects and holds no state.

**`useExportPNG`** manages the DOM capture lifecycle: expanding overflow-hidden containers before capture, waiting for browser reflow, invoking `html2canvas`, and restoring original styles afterward.

### Schedule Merging

The merge function (`mergeSchedule`) takes three inputs — a base schedule object, an ordered list of modification records, and the array of dates for the current week — and returns a new schedule object. Modifications are applied in insertion order. The supported record types are:

- `ADD` — inserts a cell at a given day/period according to a repeat rule (`none`, `weekly`, `daily`, `custom`) and an end condition (`semester`, `after N weeks`, `until date`).
- `EDIT` — overwrites an existing cell, optionally propagating forward from the modification date.
- `DELETE` — removes a cell, optionally propagating forward.

This design means switching weeks requires only rerunning the merge function with a different date array; no data migration is needed.

### Teacher Conflict Detection

Before any write operation is committed, the system checks whether the assigned teacher is already scheduled in a different class at the same day and period, using `fullSchoolScheduleForWeek`. If a conflict is detected, the operation is strictly blocked, and the issue is reported to the user via non-intrusive toast notifications.

### View Modes

The application supports two view modes toggled from the filter bar:

- **By class (`THEO_LOP`)** — displays the weekly timetable for a selected class, with drag-and-drop cell reordering and inline CRUD actions.
- **By teacher (`THEO_GIAO_VIEN`)** — displays all teaching slots for a selected teacher across all classes, with conflict highlighting for double-booked periods.

---

## Features

### Schedule Management

- Add a single lesson or a recurring series (weekly, daily, or on selected weekdays) with a configurable end date.
- Edit or delete individual lessons, with an option to propagate the change to all subsequent weeks in the semester.
- Drag and drop to move or swap lessons between slots, with teacher conflict validation before confirmation.

### Import and Export

- **Excel import** — parses `.xlsx` files using SheetJS. Validates each row for required fields, detects teacher conflicts against the current schedule, and detects intra-file double-booking before applying any changes.
- **PNG export** — captures the timetable grid as a high-resolution, print-ready PNG (Retina 2x scale) using html2canvas. It utilizes the modern File System Access API to prompt a "Save As" dialog with an intelligently pre-filled filename, providing an automatic download fallback for older browsers.

### Filtering

- Filter cells by subject or teacher name across the currently displayed timetable.
- Multiple filters can be active simultaneously; each is displayed as a removable tag in the header.

---

## Data Model

### Base Schedule

The base schedule (`MOCK_SCHEDULE`) is a nested object keyed by class name, then by day key (`thu2` through `thu7`), then by period number (1–7). Each cell contains `subject` and `teacher` strings.

```
MOCK_SCHEDULE = {
  "1A": {
    "thu2": {
      1: { subject: "Toán", teacher: "Nguyễn Quang Duy" },
      ...
    },
    ...
  },
  ...
}
```

### Modification Record

```
{
  type: "ADD" | "EDIT" | "DELETE",
  date: string,          // ISO date of the originating action (YYYY-MM-DD)
  dayKey: string,        // "thu2" ... "thu7"
  period: number,        // 1–7
  subject?: string,
  teacher?: string,
  repeat?: "none" | "weekly" | "daily" | "custom",
  customDays?: number[], // 0 = Monday ... 5 = Saturday
  endMode?: "semester" | "after" | "date",
  endAfterWeeks?: number,
  endDate?: string,
  applyFuture?: boolean,
}
```

---

## Getting Started

**Prerequisites:** Node.js 18 or later.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

---

## Usage

### Navigating weeks

Use the previous and next arrows in the header to move between weeks. The "Tuần này" button returns to the current week.

### Adding a lesson

Click any empty cell in the grid to open the add modal with the day and period pre-filled, or use the "Thêm tiết" button to open it with defaults. Select a subject, optionally assign a teacher, configure the repeat rule, and save.

### Editing or deleting a lesson

Hover over a filled cell to reveal the edit and delete action icons. Both actions support a "apply to future weeks" option that propagates the change from the lesson date through the end of the semester.

### Moving or swapping lessons

Drag a filled cell onto an empty slot to move it, or onto another filled cell to swap the two. A confirmation modal appears before the change is committed.

### Importing from Excel

The expected column layout is: A — date (dd/MM/yyyy), B — period number, C — class name, D — subject, E — teacher name (optional). Click "Import Excel", upload the file, review the parsed rows in the preview table, and confirm.

### Exporting as PNG

Navigate to the desired view (Class or Teacher), ensure the screen looks correct, and click "Xuất PNG". A confirmation modal will appear. Upon proceeding, the system will temporarily adjust the viewport to capture the full grid and prompt you to save the high-resolution image file.
