export const demoUsers = {
  student: { email: 'student@hcl.com', password: 'student123', role: 'student', name: 'Vinayak Kumar Singh', initials: 'VK', title: 'Student · Batch 01' },
  trainer: { email: 'trainer@hcl.com', password: 'trainer123', role: 'trainer', name: 'Rahul Guha', initials: 'RG', title: 'Lead Trainer' },
  admin: { email: 'admin@hcl.com', password: 'admin123', role: 'admin', name: 'Rajesh Kumar', initials: 'RK', title: 'Programme Admin' }
}

export const navByRole = {
  student: [
    { group: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard' }] },
    { group: 'Learning', items: [
      { id: 'syllabus', label: 'Syllabus progress', icon: 'book-open' },
      { id: 'assignments', label: 'Assignments', icon: 'clipboard-check', count: '3' },
      { id: 'tasks', label: 'My tasks', icon: 'list-checks' },
      { id: 'labs', label: 'Practical labs', icon: 'flask-conical' },
      { id: 'resources', label: 'Resources & notes', icon: 'library' }
    ] },
    { group: 'Programme', items: [
      { id: 'schedule', label: 'Class schedule', icon: 'calendar-days' },
      { id: 'attendance', label: 'Attendance', icon: 'calendar-check' },
      { id: 'assessments', label: 'Assessments', icon: 'file-bar-chart-2' },
      { id: 'reports', label: 'My reports', icon: 'trending-up' }
    ] },
    { group: 'Account', items: [{ id: 'settings', label: 'Settings', icon: 'settings-2' }] }
  ],
  trainer: [
    { group: 'Overview', items: [{ id: 'trainer-dashboard', label: 'Dashboard', icon: 'layout-dashboard' }] },
    { group: 'Manage learning', items: [
      { id: 'assignments', label: 'Assignments', icon: 'clipboard-check', count: '8' },
      { id: 'labs', label: 'Lab tracker', icon: 'flask-conical' },
      { id: 'resources', label: 'Resources & notes', icon: 'library' },
      { id: 'assessments', label: 'Assessments', icon: 'file-bar-chart-2' }
    ] },
    { group: 'Cohort', items: [
      { id: 'attendance', label: 'Attendance register', icon: 'calendar-check' },
      { id: 'schedule', label: 'Class schedule', icon: 'calendar-days' },
      { id: 'reports', label: 'Cohort reports', icon: 'trending-up' }
    ] },
    { group: 'Account', items: [{ id: 'settings', label: 'Settings', icon: 'settings-2' }] }
  ],
  admin: [
    { group: 'Overview', items: [{ id: 'admin-dashboard', label: 'Dashboard', icon: 'layout-dashboard' }] },
    { group: 'Programme', items: [
      { id: 'reports', label: 'Programme reports', icon: 'trending-up' },
      { id: 'assessments', label: 'Assessment overview', icon: 'file-bar-chart-2' },
      { id: 'schedule', label: 'Schedule config', icon: 'calendar-days' }
    ] },
    { group: 'Administration', items: [
      { id: 'users', label: 'User management', icon: 'users' },
      { id: 'settings', label: 'Settings', icon: 'settings-2' }
    ] }
  ]
}

export const modules = [
  { n: 1, name: 'Core Java Fundamentals', topics: ['Java Platform Basics: JVM, JRE, JDK', 'Language Fundamentals & Data Types', 'Control Flow', 'OOP Concepts', 'Inheritance & Polymorphism', 'Exception Handling', 'Collections Framework', 'Generics & Memory Management'], progress: 78, hours: '24 hrs', status: 'In progress' },
  { n: 2, name: 'Modern Java (8–21)', topics: ['Functional Programming & Lambdas', 'Streams API', 'Optional & Date/Time', 'Concurrency Essentials', 'Java 9–21 Key Features', 'Immutable Collections & Modern APIs'], progress: 46, hours: '16 hrs', status: 'In progress' },
  { n: 3, name: 'Version Control – Git', topics: ['Git Fundamentals', 'Branching & Merging', 'Conflict Resolution'], progress: 100, hours: '7 hrs', status: 'Completed' },
  { n: 4, name: 'Build Tools, IDE & Debugging', topics: ['Maven Project Structure', 'IDE & Debugging Techniques', 'AI-assisted Debugging'], progress: 88, hours: '8 hrs', status: 'In progress' },
  { n: 5, name: 'SQL & Database', topics: ['Relational Database Concepts', 'CRUD Operations', 'Joins & Aggregations', 'Views, Indexing & Constraints', 'Transactions & ACID'], progress: 22, hours: '26 hrs', status: 'In progress' },
  { n: 6, name: 'Spring Boot & REST API Development', topics: ['Spring Core Concepts', 'Spring Boot Fundamentals', 'REST Design Principles', 'RESTful API Development', 'Validation & Error Handling', 'Spring Data JPA'], progress: 0, hours: '36 hrs', status: 'Not started' },
  { n: 7, name: 'Spring Security', topics: ['Authentication & Authorization', 'JWT Authentication', 'Secure Configuration Review'], progress: 0, hours: '12 hrs', status: 'Not started' },
  { n: 8, name: 'Backend Testing & Code Quality', topics: ['JUnit 5', 'Mockito', 'Integration Testing', 'Coding Standards', 'Code Coverage & SonarQube'], progress: 0, hours: '28 hrs', status: 'Not started' },
  { n: 9, name: 'Logging & Monitoring', topics: ['Structured Logging', 'Monitoring Awareness'], progress: 0, hours: '6 hrs', status: 'Not started' },
  { n: 10, name: 'Design Patterns & SOLID', topics: ['SOLID Principles', 'Key Design Patterns'], progress: 0, hours: '10 hrs', status: 'Not started' },
  { n: 11, name: 'HTML5 & CSS3 Fundamentals', topics: ['HTML5 Semantics & Forms', 'CSS3 Layout & Responsive Design', 'Bootstrap 5 Awareness'], progress: 0, hours: '18 hrs', status: 'Not started' },
  { n: 12, name: 'JavaScript Fundamentals', topics: ['Language Basics', 'Functions & Scope', 'DOM Manipulation & Events', 'ES6+ Features', 'Asynchronous JavaScript', 'JSON & Data Handling'], progress: 0, hours: '22 hrs', status: 'Not started' },
  { n: 13, name: 'TypeScript', topics: ['TypeScript Fundamentals', 'TypeScript with React', 'Advanced Patterns'], progress: 0, hours: '15 hrs', status: 'Not started' },
  { n: 14, name: 'React.js', topics: ['React Fundamentals', 'State & Events', 'Hooks & Lifecycle', 'Routing', 'State Management', 'API & Form Integration'], progress: 0, hours: '42 hrs', status: 'Not started' },
  { n: 15, name: 'Frontend Testing', topics: ['Jest Basics', 'React Testing Library', 'E2E Awareness', 'Frontend Checkpoint'], progress: 0, hours: '13 hrs', status: 'Not started' },
  { n: 16, name: 'Full-Stack Integration', topics: ['Connecting React to Spring Boot', 'End-to-End Data Flow', 'Cross-stack Error Handling', 'Authentication Flow'], progress: 0, hours: '15 hrs', status: 'Not started' },
  { n: 17, name: 'Microservices Concepts', topics: ['Architecture Patterns', 'Service Discovery & API Gateway', 'Inter-Service Communication'], progress: 0, hours: '12 hrs', status: 'Not started' },
  { n: 18, name: 'Docker & CI/CD', topics: ['Docker Fundamentals', 'CI/CD Concepts', 'Kubernetes Awareness'], progress: 0, hours: '15 hrs', status: 'Not started' },
  { n: 19, name: 'Cloud Awareness', topics: ['Cloud Fundamentals & Core Services'], progress: 0, hours: '5 hrs', status: 'Not started' },
  { n: 20, name: 'Security Practices', topics: ['OWASP Top 10', 'Secure Coding Habits'], progress: 0, hours: '6 hrs', status: 'Not started' },
  { n: 21, name: 'AI-Augmented Development', topics: ['GenAI Fundamentals & Ethics', 'Prompt Engineering', 'GitHub Copilot — Advanced'], progress: 0, hours: '14 hrs', status: 'Not started' },
  { n: 22, name: 'Agile & Project Readiness', topics: ['Agile/Scrum Basics', 'Project Communication', 'Code Review Culture', 'Final Assessment'], progress: 0, hours: '8 hrs', status: 'Not started' },
  { n: 23, name: 'Full-Stack Capstone Project', topics: ['Build assigned capstone project', 'Apply security & quality practices', 'Presentation, demo & review'], progress: 0, hours: 'Project', status: 'Not started' }
]

export const assignments = [
  { title: 'Collections API — Java Fundamentals', module: 'Core Java Fundamentals', due: '18 Oct 2026', status: 'Submitted', statusClass: 'badge-info', type: 'Coding exercise', points: '20 pts', submitted: '12 Oct 2026' },
  { title: 'Stream Pipeline Refactoring', module: 'Modern Java (8–21)', due: '21 Oct 2026', status: 'In progress', statusClass: 'badge-warning', type: 'Hands-on lab', points: '15 pts', submitted: '—' },
  { title: 'SQL Queries & Joins Checkpoint', module: 'SQL & Database', due: '25 Oct 2026', status: 'Not started', statusClass: 'badge-neutral', type: 'Assessment', points: '25 pts', submitted: '—' },
  { title: 'Git Branching Practice', module: 'Version Control – Git', due: '10 Oct 2026', status: 'Marked · 18/20', statusClass: 'badge-success', type: 'Practical', points: '20 pts', submitted: '09 Oct 2026' }
]

export const tasks = [
  { title: 'Review Java Collections notes', tag: 'Study', tagClass: 'badge-primary', due: 'Today', column: 'todo' },
  { title: 'Finish Stream Pipeline exercise', tag: 'Assignment', tagClass: 'badge-warning', due: '21 Oct', column: 'doing' },
  { title: 'Prepare questions for trainer', tag: 'Personal', tagClass: 'badge-info', due: 'Tomorrow', column: 'todo' },
  { title: 'Complete Git branching lab', tag: 'Lab', tagClass: 'badge-success', due: 'Done', column: 'done' },
  { title: 'Read SQL joins revision note', tag: 'Study', tagClass: 'badge-primary', due: '25 Oct', column: 'todo' }
]

export const resources = [
  { title: 'Java Collections — Quick Reference', type: 'Revision note', module: 'Core Java Fundamentals', icon: 'file-text', color: 'primary', meta: 'Updated 2 days ago · 8 min read' },
  { title: 'Spring Boot REST API Patterns', type: 'Learning guide', module: 'Spring Boot & REST API Development', icon: 'book-open', color: 'success', meta: 'Not started · 25 min read' },
  { title: 'Git branching visual guide', type: 'Reference', module: 'Version Control – Git', icon: 'git-branch', color: 'warning', meta: 'Completed · 12 min read' },
  { title: 'SQL joins explained with examples', type: 'Video lesson', module: 'SQL & Database', icon: 'play-circle', color: 'danger', meta: 'In progress · 18 min watch' },
  { title: 'Java exception handling checklist', type: 'Cheat sheet', module: 'Core Java Fundamentals', icon: 'clipboard-list', color: 'info', meta: 'Not started · 5 min read' },
  { title: 'Clean code review prompts', type: 'Trainer note', module: 'Backend Testing & Code Quality', icon: 'message-square-text', color: 'primary', meta: 'Added 5 days ago · 10 min read' }
]

export const assessments = [
  { name: 'Assessment 1', title: 'Core Java Checkpoint', date: '06 Oct 2026', score: '18/20', percent: 90, status: 'Passed', className: 'badge-success', feedback: 'Strong fundamentals. Review custom exception naming.' },
  { name: 'Assessment 2', title: 'SQL Checkpoint', date: '25 Oct 2026', score: '—', percent: 0, status: 'Upcoming', className: 'badge-info', feedback: 'Exercises cover CRUD, joins and aggregations.' },
  { name: 'Assessment 3', title: 'Backend Checkpoint', date: '14 Nov 2026', score: '—', percent: 0, status: 'Upcoming', className: 'badge-neutral', feedback: 'Spring Boot API with JWT auth and JPA persistence.' },
  { name: 'Assessment 4', title: 'Frontend Checkpoint', date: '03 Dec 2026', score: '—', percent: 0, status: 'Upcoming', className: 'badge-neutral', feedback: 'React app with routing, state, forms and tests.' },
  { name: 'Assessment 5', title: 'Final Assessment', date: '12 Jan 2027', score: '—', percent: 0, status: 'Upcoming', className: 'badge-neutral', feedback: 'All programme topics included.' }
]

export const students = [
  { name: 'Vinayak Kumar Singh', initials: 'VK', email: 'vinayak.singh@hcl.com', progress: 38, attendance: 92, score: 90, status: 'On track' },
  { name: 'Neha Reddy', initials: 'NR', email: 'neha.reddy@hcl.com', progress: 44, attendance: 97, score: 86, status: 'On track' },
  { name: 'Vikram Singh', initials: 'VS', email: 'vikram.singh@hcl.com', progress: 29, attendance: 84, score: 78, status: 'Needs attention' },
  { name: 'Ananya Iyer', initials: 'AI', email: 'ananya.iyer@hcl.com', progress: 41, attendance: 95, score: 92, status: 'On track' },
  { name: 'Rohan Das', initials: 'RD', email: 'rohan.das@hcl.com', progress: 22, attendance: 79, score: 71, status: 'Needs attention' }
]

export const schedule = [
  { day: 'Mon', date: '12 Oct', time: '09:30', title: 'Modern Java', trainer: 'Rahul G.', tone: '' },
  { day: 'Tue', date: '13 Oct', time: '09:30', title: 'Modern Java', trainer: 'Rahul G.', tone: '' },
  { day: 'Tue', date: '13 Oct', time: '14:00', title: 'Practical Lab', trainer: 'Ravi K.', tone: 'green' },
  { day: 'Wed', date: '14 Oct', time: '09:30', title: 'SQL & Database', trainer: 'Rahul G.', tone: 'orange' },
  { day: 'Thu', date: '15 Oct', time: '09:30', title: 'SQL & Database', trainer: 'Rahul G.', tone: 'orange' },
  { day: 'Fri', date: '16 Oct', time: '11:00', title: 'Code review hour', trainer: 'Rahul G.', tone: 'green' }
]
