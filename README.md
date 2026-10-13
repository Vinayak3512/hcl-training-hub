# HCL Training Hub — Java Full Stack ERP

An enterprise Student Training ERP built for managing the **HCL Technologies Java Full Stack Programme (Batch 01)**. Developed with Vanilla JavaScript (ES Modules), HTML5, and CSS3, bundled with Vite.

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Execution
```bash
# Install dependencies
npm install

# Start development server
npm run dev
# -> Local server runs at http://localhost:5173/

# Build for production
npm run build
```

---

## 🔑 Demo Accounts & Credentials

The application includes an automated quick-fill system on the sign-in screen with pre-configured demo roles:

| Role | Name | Email | Password | Allowed Dashboards & Key Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Vinayak Kumar Singh | `student@hcl.com` | `student123` | Personal Dashboard, Syllabus Tracker (23 modules), Personal Task Manager, Assignment Submissions, Attendance View, Lab Tracking, Resource Reader |
| **Trainer** | Rahul Guha | `trainer@hcl.com` | `trainer123` | Trainer Dashboard, Cohort Roster, Attendance Register, Assignment Creation & Grading, Practical Lab Management, Timetable Sessions |
| **Admin** | Rajesh Kumar | `admin@hcl.com` | `admin123` | Admin Dashboard, User Management Directory, Programme Reports & KPIs, Timetable Configuration, Demo State Reset |

> **Security & Simulation Disclaimer**: This application implements simulated, client-side authentication and role-based authorization for demonstration purposes. In a real-world enterprise deployment, authentication credentials, JSON Web Tokens (JWT), and authorization roles must be validated by an authoritative backend API on every request.

---

## 🏛️ Architecture & Modules

### 1. Centralized Authorization System (`js/auth.js`)
Permissions are evaluated centrally using `can(role, action)` and `canAccessPage(role, page)`:
- Navigation attempts to unauthorized routes (e.g. students accessing `/users`) are blocked with notification feedback.
- Administrative controls (user deletion, official attendance register, grading) are role-guarded at the component and action layers.

### 2. State & Persistence Layer (`js/store.js`)
- Persistent LocalStorage cache (`hcl_training_hub_store_v2`) stores all user-modified states.
- Initial seed data is generated on first run and is never overwritten on re-render.
- Corrupted or invalid localStorage data is safely caught, recovering with a fresh initial state.
- Includes a deliberate **Factory Reset Demo State** option in Settings.

### 3. ERP Modules Overview
- **Student Dashboard**: Live metrics dynamically derived from persistent state: overall syllabus progress %, attendance rate %, pending tasks count, and average checkpoint score.
- **23-Module Syllabus**: Preserves all 23 official Java Full Stack modules from Core Java to Capstone. Allows students to toggle individual topic completion, triggering immediate module progress and overall programme completion recalculations.
- **Personal Task Manager**: Kanban-style board ("To do", "In progress", "Completed") with full CRUD, priority tags, due dates, overdue badges, search, and category filtering.
- **Assignments**: Students can submit repository links and review feedback. Trainers can create coursework, evaluate submissions, and record marks with feedback notes.
- **Attendance Register**: Calculates attendance percentages starting from programme commencement (20 September 2026) across Mon–Fri sessions. Students view a visual calendar and rate ring; trainers can select any training day and mark status (`Present`, `Late`, `Absent`) for the cohort.
- **Practical Labs**: Step-by-step guided coding exercises with completion toggle.
- **Class Schedule**: Interactive IST timetable for training sessions.
- **Assessments & Results**: 5 programme checkpoints with grade status and trainer feedback.
- **Reports & Analytics**: Tailored metrics for each role with export summary capability.
- **User Management (Admin)**: Create, edit, and delete users with duplicate email validation.
- **Settings & Theme**: Light / Dark mode toggle with preference persistence, notification settings, and factory reset.

---

## 🧪 Manual Testing Checklist

1. **Authentication Flow**:
   - [x] Click password visibility eye icon to verify toggle.
   - [x] Click each demo pill button to verify auto-fill.
   - [x] Test invalid credentials to verify alert message.
   - [x] Successful sign in persists session on refresh.
2. **Syllabus Progress**:
   - [x] Verify all 23 modules are present.
   - [x] Toggle topic checkbox and verify module progress bar and overall percentage update.
   - [x] Filter by "In progress" or "Completed" and test search input.
3. **Personal Task Manager**:
   - [x] Add a new task with title, priority, category, and due date.
   - [x] Move task between columns ("To do" → "In progress" → "Completed").
   - [x] Delete a task with modal confirmation.
4. **Attendance Register**:
   - [x] View student attendance ring (reflects actual attendance records).
   - [x] Sign in as Trainer, select date, change a student's status, and click "Save register".
   - [x] Verify student's attendance percentage updates accordingly.
5. **Role Switching & Guarding**:
   - [x] Sign out and sign in as Trainer / Admin.
   - [x] Verify role-specific navigation and restricted page access.
6. **Appearance & Settings**:
   - [x] Toggle Dark / Light theme; refresh page to confirm preference persistence.
   - [x] Test factory reset demo state button with modal confirmation.
