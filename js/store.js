import { modules as defaultModules, assignments as defaultAssignments, tasks as defaultTasks, resources as defaultResources, assessments as defaultAssessments, students as defaultStudents, schedule as defaultSchedule, demoUsers } from './data.js'

const STORAGE_KEY = 'hcl_training_hub_store_v2'

export function escapeHtml(str) {
  if (typeof str !== 'string') return str === null || str === undefined ? '' : String(str)
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]))
}

/**
 * Generate initial topic records with completion states matching initial demo percentages
 */
function buildInitialModules() {
  return defaultModules.map((m) => {
    const total = m.topics.length
    // Determine how many topics are initially completed based on initial progress
    let completedCount = 0
    if (m.progress === 100) {
      completedCount = total
    } else if (m.progress > 0) {
      completedCount = Math.round((m.progress / 100) * total)
    }

    const topics = m.topics.map((tName, idx) => ({
      id: `m${m.n}-t${idx + 1}`,
      name: tName,
      completed: idx < completedCount,
      hours: idx % 2 === 0 ? '1 hr' : '2 hrs'
    }))

    const calcProgress = Math.round((completedCount / total) * 100)
    const status = calcProgress === 100 ? 'Completed' : calcProgress > 0 ? 'In progress' : 'Not started'

    return {
      n: m.n,
      name: m.name,
      hours: m.hours,
      topics,
      progress: calcProgress,
      status
    }
  })
}

/**
 * Build initial attendance records from programme start (20 Sept 2026) to 13 Oct 2026 (Mon-Fri)
 */
function buildInitialAttendance() {
  // Dates in IST between 21 Sept 2026 and 13 Oct 2026 (excluding weekends: 17 training days)
  const trainingDates = [
    '2026-09-21', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25',
    '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02',
    '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09',
    '2026-10-12', '2026-10-13'
  ]
  const uniqueDates = Array.from(new Set(trainingDates))

  // Records mapped by date: { 'YYYY-MM-DD': { 'student.email': 'Present' | 'Late' | 'Absent' } }
  const records = {}
  uniqueDates.forEach((d, idx) => {
    records[d] = {
      'student@hcl.com': idx === 3 ? 'Late' : idx === 9 ? 'Absent' : 'Present',
      'neha.reddy@hcl.com': idx === 6 ? 'Late' : 'Present',
      'vikram.singh@hcl.com': idx === 4 || idx === 11 ? 'Absent' : idx === 8 ? 'Late' : 'Present',
      'ananya.iyer@hcl.com': idx === 10 ? 'Late' : 'Present',
      'rohan.das@hcl.com': idx === 2 || idx === 7 || idx === 12 ? 'Absent' : idx === 5 ? 'Late' : 'Present'
    }
  })

  return {
    startDate: '2026-09-20',
    currentDate: '2026-10-13',
    records
  }
}

function buildInitialTasks() {
  return [
    { id: 'task-1', title: 'Review Java Collections notes', description: 'Review ArrayList, HashSet and HashMap performance comparisons.', tag: 'Study', priority: 'High', due: '2026-10-13', column: 'todo', createdAt: '2026-10-10' },
    { id: 'task-2', title: 'Finish Stream Pipeline exercise', description: 'Complete map, filter, collect tasks for assignment 2.', tag: 'Assignment', priority: 'High', due: '2026-10-21', column: 'doing', createdAt: '2026-10-11' },
    { id: 'task-3', title: 'Prepare questions for trainer', description: 'Clarify Java 21 virtual threads and record patterns.', tag: 'Personal', priority: 'Normal', due: '2026-10-14', column: 'todo', createdAt: '2026-10-12' },
    { id: 'task-4', title: 'Complete Git branching lab', description: 'Feature branch workflow, pull request and merge conflict resolution.', tag: 'Lab', priority: 'Normal', due: '2026-10-09', column: 'done', createdAt: '2026-10-07' },
    { id: 'task-5', title: 'Read SQL joins revision note', description: 'Practice inner, left, right, full outer joins with sample tables.', tag: 'Study', priority: 'Low', due: '2026-10-25', column: 'todo', createdAt: '2026-10-12' }
  ]
}

function buildInitialAssignments() {
  return [
    {
      id: 'asg-1',
      title: 'Collections API — Java Fundamentals',
      module: 'Core Java Fundamentals',
      due: '2026-10-18',
      status: 'Submitted',
      statusClass: 'badge-info',
      type: 'Coding exercise',
      points: '20 pts',
      submitted: '12 Oct 2026',
      submissionUrl: 'https://github.com/vinayak-hcl/java-collections-lab',
      submissionNotes: 'Implemented custom comparator and LRU cache using LinkedHashMap.',
      grade: 'Pending evaluation',
      feedback: 'Awaiting trainer review'
    },
    {
      id: 'asg-2',
      title: 'Stream Pipeline Refactoring',
      module: 'Modern Java (8–21)',
      due: '2026-10-21',
      status: 'In progress',
      statusClass: 'badge-warning',
      type: 'Hands-on lab',
      points: '15 pts',
      submitted: '—',
      submissionUrl: '',
      submissionNotes: '',
      grade: '—',
      feedback: 'Due in 8 days'
    },
    {
      id: 'asg-3',
      title: 'SQL Queries & Joins Checkpoint',
      module: 'SQL & Database',
      due: '2026-10-25',
      status: 'Not started',
      statusClass: 'badge-neutral',
      type: 'Assessment',
      points: '25 pts',
      submitted: '—',
      submissionUrl: '',
      submissionNotes: '',
      grade: '—',
      feedback: 'Pre-requisite for Spring Boot JPA'
    },
    {
      id: 'asg-4',
      title: 'Git Branching Practice',
      module: 'Version Control – Git',
      due: '2026-10-10',
      status: 'Marked · 18/20',
      statusClass: 'badge-success',
      type: 'Practical',
      points: '20 pts',
      submitted: '09 Oct 2026',
      submissionUrl: 'https://github.com/vinayak-hcl/git-branching-demo',
      submissionNotes: 'Resolved merge conflict between feature/auth and main branch cleanly.',
      grade: '18/20',
      feedback: 'Excellent clean git history and descriptive commit messages.'
    }
  ]
}

function buildInitialLabs() {
  return [
    {
      id: 'lab-1',
      title: 'Build a Student Registry',
      module: 'Core Java Fundamentals',
      status: 'Completed',
      cls: 'badge-success',
      progress: 100,
      estimatedHours: '3 hrs',
      instructions: 'Construct a console-based student management system applying OOP encapsulation, inheritance, exception handling and Java Collections framework.',
      completedDate: '08 Oct 2026'
    },
    {
      id: 'lab-2',
      title: 'Stream-based Order Processor',
      module: 'Modern Java (8–21)',
      status: 'In progress',
      cls: 'badge-warning',
      progress: 65,
      estimatedHours: '2.5 hrs',
      instructions: 'Refactor imperative loops to declarative Stream pipelines. Filter cancelled orders, group by category, calculate revenue and find top customers.',
      completedDate: null
    },
    {
      id: 'lab-3',
      title: 'SQL Employee Analytics & Joins',
      module: 'SQL & Database',
      status: 'Not started',
      cls: 'badge-neutral',
      progress: 0,
      estimatedHours: '2 hrs',
      instructions: 'Write multi-table queries connecting Employees, Departments and Salaries. Practice indexing and aggregate window functions.',
      completedDate: null
    },
    {
      id: 'lab-4',
      title: 'REST API Starter Project',
      module: 'Spring Boot & REST API Development',
      status: 'Locked',
      cls: 'badge-neutral',
      progress: 0,
      estimatedHours: '4 hrs',
      instructions: 'Initialise Spring Boot project using Spring Initializr. Configure controllers, services, repositories and H2 in-memory DB.',
      completedDate: null
    }
  ]
}

function buildInitialUsers() {
  return [
    {
      id: 'u-1',
      name: 'Vinayak Kumar Singh',
      initials: 'VK',
      email: 'student@hcl.com',
      role: 'student',
      title: 'Student · Batch 01',
      batch: 'Batch 01',
      status: 'Active',
      lastActive: 'Today, 09:12'
    },
    {
      id: 'u-2',
      name: 'Rahul Guha',
      initials: 'RG',
      email: 'trainer@hcl.com',
      role: 'trainer',
      title: 'Lead Trainer',
      batch: 'Batch 01 & 02',
      status: 'Active',
      lastActive: 'Today, 09:40'
    },
    {
      id: 'u-3',
      name: 'Rajesh Kumar',
      initials: 'RK',
      email: 'admin@hcl.com',
      role: 'admin',
      title: 'Programme Admin',
      batch: 'All Batches',
      status: 'Active',
      lastActive: 'Today, 08:30'
    },
    {
      id: 'u-4',
      name: 'Neha Reddy',
      initials: 'NR',
      email: 'neha.reddy@hcl.com',
      role: 'student',
      title: 'Student · Batch 01',
      batch: 'Batch 01',
      status: 'Active',
      lastActive: 'Today, 10:05'
    },
    {
      id: 'u-5',
      name: 'Vikram Singh',
      initials: 'VS',
      email: 'vikram.singh@hcl.com',
      role: 'student',
      title: 'Student · Batch 01',
      batch: 'Batch 01',
      status: 'Active',
      lastActive: 'Yesterday, 17:30'
    },
    {
      id: 'u-6',
      name: 'Ananya Iyer',
      initials: 'AI',
      email: 'ananya.iyer@hcl.com',
      role: 'student',
      title: 'Student · Batch 01',
      batch: 'Batch 01',
      status: 'Active',
      lastActive: 'Today, 09:50'
    },
    {
      id: 'u-7',
      name: 'Rohan Das',
      initials: 'RD',
      email: 'rohan.das@hcl.com',
      role: 'student',
      title: 'Student · Batch 01',
      batch: 'Batch 01',
      status: 'Needs attention',
      lastActive: '11 Oct 2026'
    }
  ]
}

function buildInitialData() {
  return {
    version: 2,
    modules: buildInitialModules(),
    attendance: buildInitialAttendance(),
    tasks: buildInitialTasks(),
    assignments: buildInitialAssignments(),
    labs: buildInitialLabs(),
    resources: JSON.parse(JSON.stringify(defaultResources)),
    assessments: JSON.parse(JSON.stringify(defaultAssessments)),
    schedule: JSON.parse(JSON.stringify(defaultSchedule)),
    users: buildInitialUsers(),
    settings: {
      profileName: 'Vinayak Kumar Singh',
      bio: 'Java Full Stack learner · Batch 01',
      notifDeadlines: true,
      notifSessions: true,
      notifAnnouncements: true,
      compactView: false
    }
  }
}

class Store {
  constructor() {
    this.data = this.load()
  }

  load() {
    try {
      const serialized = localStorage.getItem(STORAGE_KEY)
      if (!serialized) {
        const initial = buildInitialData()
        this.saveDirect(initial)
        return initial
      }
      const parsed = JSON.parse(serialized)
      // Check data validity
      if (!parsed || !parsed.modules || parsed.modules.length !== 23 || !parsed.tasks) {
        console.warn('HCL Store: Data corrupted or outdated version. Re-seeding clean state.')
        const fresh = buildInitialData()
        this.saveDirect(fresh)
        return fresh
      }
      return parsed
    } catch (err) {
      console.error('HCL Store: Failed to parse localStorage data:', err)
      const fresh = buildInitialData()
      this.saveDirect(fresh)
      return fresh
    }
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch (e) {
      console.error('HCL Store: Failed to save to localStorage:', e)
    }
  }

  saveDirect(val) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    } catch (e) {
      console.error('HCL Store: Failed to save initial data:', e)
    }
  }

  resetAll() {
    this.data = buildInitialData()
    this.save()
    return this.data
  }

  // ── Modules / Syllabus ─────────────────────────
  getModules() {
    return this.data.modules
  }

  toggleTopic(moduleN, topicId) {
    const mod = this.data.modules.find((m) => m.n === moduleN)
    if (!mod) return null
    const topic = mod.topics.find((t) => t.id === topicId)
    if (!topic) return null

    topic.completed = !topic.completed

    // Recalculate module progress
    const total = mod.topics.length
    const completedCount = mod.topics.filter((t) => t.completed).length
    mod.progress = Math.round((completedCount / total) * 100)
    mod.status = mod.progress === 100 ? 'Completed' : mod.progress > 0 ? 'In progress' : 'Not started'

    this.save()
    return { module: mod, topic }
  }

  getOverallSyllabusStats() {
    let totalTopics = 0
    let completedTopics = 0
    let activeModules = 0
    let currentModule = null

    this.data.modules.forEach((m) => {
      totalTopics += m.topics.length
      completedTopics += m.topics.filter((t) => t.completed).length
      if (m.progress > 0 && m.progress < 100) {
        activeModules++
        if (!currentModule) currentModule = m
      }
    })

    if (!currentModule) {
      currentModule = this.data.modules.find(m => m.progress === 0) || this.data.modules[0]
    }

    const overallProgress = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0
    return {
      totalTopics,
      completedTopics,
      activeModules: activeModules || 5,
      overallProgress,
      currentModule
    }
  }

  // ── Tasks ──────────────────────────────────────
  getTasks() {
    return this.data.tasks
  }

  addTask(task) {
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: task.title.trim(),
      description: (task.description || '').trim(),
      priority: task.priority || 'Normal',
      tag: task.tag || 'Personal',
      due: task.due || '2026-10-15',
      column: task.column || 'todo',
      createdAt: new Date().toISOString().split('T')[0]
    }
    this.data.tasks.push(newTask)
    this.save()
    return newTask
  }

  updateTask(id, updates) {
    const task = this.data.tasks.find((t) => t.id === id)
    if (!task) return null
    Object.assign(task, updates)
    this.save()
    return task
  }

  deleteTask(id) {
    const idx = this.data.tasks.findIndex((t) => t.id === id)
    if (idx === -1) return false
    this.data.tasks.splice(idx, 1)
    this.save()
    return true
  }

  setTaskColumn(id, newCol) {
    const task = this.data.tasks.find((t) => t.id === id)
    if (!task) return null
    task.column = newCol
    this.save()
    return task
  }

  // ── Assignments ────────────────────────────────
  getAssignments() {
    return this.data.assignments
  }

  submitAssignment(id, { submissionUrl, submissionNotes }) {
    const asg = this.data.assignments.find((a) => a.id === id)
    if (!asg) return null
    asg.status = 'Submitted'
    asg.statusClass = 'badge-info'
    asg.submitted = 'Today, 13 Oct 2026'
    asg.submissionUrl = (submissionUrl || '').trim()
    asg.submissionNotes = (submissionNotes || '').trim()
    asg.grade = 'Pending evaluation'
    this.save()
    return asg
  }

  gradeAssignment(id, { grade, feedback, status }) {
    const asg = this.data.assignments.find((a) => a.id === id)
    if (!asg) return null
    asg.grade = grade
    asg.feedback = feedback
    asg.status = status || `Marked · ${grade}`
    asg.statusClass = 'badge-success'
    this.save()
    return asg
  }

  addAssignment(item) {
    const newAsg = {
      id: `asg-${Date.now()}`,
      title: item.title.trim(),
      module: item.module,
      due: item.due,
      status: 'Not started',
      statusClass: 'badge-neutral',
      type: item.type || 'Hands-on lab',
      points: item.points || '20 pts',
      submitted: '—',
      submissionUrl: '',
      submissionNotes: '',
      grade: '—',
      feedback: item.feedback || 'New assignment'
    }
    this.data.assignments.push(newAsg)
    this.save()
    return newAsg
  }

  // ── Attendance ─────────────────────────────────
  getAttendance() {
    return this.data.attendance
  }

  markAttendance(date, studentEmail, status) {
    if (!this.data.attendance.records[date]) {
      this.data.attendance.records[date] = {}
    }
    this.data.attendance.records[date][studentEmail] = status
    this.save()
    return true
  }

  getStudentAttendanceStats(email = 'student@hcl.com') {
    const recs = this.data.attendance.records
    let total = 0
    let fullPresent = 0
    let late = 0
    let absent = 0

    Object.keys(recs).forEach((d) => {
      const st = recs[d][email]
      if (st) {
        total++
        if (st === 'Present') fullPresent++
        else if (st === 'Late') late++
        else if (st === 'Absent') absent++
      }
    })

    const creditPresent = fullPresent + (late * 0.8)
    const pct = total > 0 ? Math.round((creditPresent / total) * 100) : 92
    return { total, present: fullPresent, fullPresent, late, absent, pct }
  }

  getCohortAttendanceStats() {
    const students = this.getUsers().filter((u) => u.role === 'student')
    let totalPcts = 0
    students.forEach((s) => {
      totalPcts += this.getStudentAttendanceStats(s.email).pct
    })
    return students.length > 0 ? Math.round(totalPcts / students.length) : 91
  }

  // ── Labs ───────────────────────────────────────
  getLabs() {
    return this.data.labs
  }

  toggleLabStatus(labId) {
    const lab = this.data.labs.find((l) => l.id === labId)
    if (!lab) return null
    if (lab.status === 'Completed') {
      lab.status = 'In progress'
      lab.cls = 'badge-warning'
      lab.progress = 50
    } else if (lab.status === 'In progress') {
      lab.status = 'Completed'
      lab.cls = 'badge-success'
      lab.progress = 100
      lab.completedDate = '13 Oct 2026'
    } else if (lab.status === 'Not started') {
      lab.status = 'In progress'
      lab.cls = 'badge-warning'
      lab.progress = 30
    }
    this.save()
    return lab
  }

  addLab(labData) {
    const newLab = {
      id: `lab-${Date.now()}`,
      title: labData.title.trim(),
      module: labData.module,
      status: 'Not started',
      cls: 'badge-neutral',
      progress: 0,
      estimatedHours: labData.estimatedHours || '2 hrs',
      instructions: labData.instructions || 'Follow module guidelines.',
      completedDate: null
    }
    this.data.labs.push(newLab)
    this.save()
    return newLab
  }

  // ── Resources ──────────────────────────────────
  getResources() {
    return this.data.resources
  }

  addResource(rData) {
    const newR = {
      id: `res-${Date.now()}`,
      title: rData.title.trim(),
      type: rData.type || 'Revision note',
      module: rData.module || 'Core Java Fundamentals',
      icon: rData.icon || 'book-open',
      color: 'primary',
      meta: 'Added just now · 10 min read',
      url: rData.url || 'https://docs.oracle.com/en/java/',
      content: rData.content || 'Curated reference note for this topic.'
    }
    this.data.resources.push(newR)
    this.save()
    return newR
  }

  // ── Assessments ────────────────────────────────
  getAssessments() {
    return this.data.assessments
  }

  updateAssessment(name, { score, percent, status, feedback }) {
    const asm = this.data.assessments.find((a) => a.name === name)
    if (!asm) return null
    if (score !== undefined) asm.score = score
    if (percent !== undefined) asm.percent = Number(percent)
    if (status !== undefined) {
      asm.status = status
      asm.className = status === 'Passed' ? 'badge-success' : status === 'Failed' ? 'badge-danger' : 'badge-info'
    }
    if (feedback !== undefined) asm.feedback = feedback
    this.save()
    return asm
  }

  // ── Schedule ───────────────────────────────────
  getSchedule() {
    return this.data.schedule
  }

  addScheduleSession(session) {
    const newSession = {
      id: `sch-${Date.now()}`,
      day: session.day, // 'Mon', 'Tue', etc.
      date: session.date, // '14 Oct'
      time: session.time, // '09:30'
      title: session.title.trim(),
      trainer: session.trainer.trim(),
      room: session.room || 'Room 4A',
      tone: session.tone || ''
    }
    this.data.schedule.push(newSession)
    this.save()
    return newSession
  }

  // ── Users ──────────────────────────────────────
  getUsers() {
    return this.data.users
  }

  addUser(userData) {
    const existing = this.data.users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase())
    if (existing) {
      throw new Error(`A user with email ${userData.email} already exists.`)
    }
    const nameParts = userData.name.trim().split(' ')
    const initials = nameParts.length > 1
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : nameParts[0].slice(0, 2).toUpperCase()

    const newUser = {
      id: `u-${Date.now()}`,
      name: userData.name.trim(),
      initials,
      email: userData.email.trim().toLowerCase(),
      role: userData.role || 'student',
      title: userData.role === 'trainer' ? 'Lead Trainer' : userData.role === 'admin' ? 'Programme Admin' : `Student · ${userData.batch || 'Batch 01'}`,
      batch: userData.batch || 'Batch 01',
      status: 'Active',
      lastActive: 'Just registered'
    }
    this.data.users.push(newUser)
    this.save()
    return newUser
  }

  updateUser(id, updates) {
    const user = this.data.users.find((u) => u.id === id)
    if (!user) return null
    if (updates.email) {
      const dup = this.data.users.find((u) => u.id !== id && u.email.toLowerCase() === updates.email.trim().toLowerCase())
      if (dup) throw new Error(`Email ${updates.email} is already in use by another account.`)
    }
    if (updates.name) {
      const nameParts = updates.name.trim().split(' ')
      user.initials = nameParts.length > 1
        ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        : nameParts[0].slice(0, 2).toUpperCase()
    }
    if (updates.role) {
      user.title = updates.role === 'trainer' ? 'Lead Trainer' : updates.role === 'admin' ? 'Programme Admin' : `Student · ${updates.batch || user.batch || 'Batch 01'}`
    }
    Object.assign(user, updates)
    this.save()
    return user
  }

  deleteUser(id) {
    const idx = this.data.users.findIndex((u) => u.id === id)
    if (idx === -1) return false
    this.data.users.splice(idx, 1)
    this.save()
    return true
  }

  // ── Settings ───────────────────────────────────
  getSettings() {
    return this.data.settings
  }

  updateSettings(updates) {
    Object.assign(this.data.settings, updates)
    this.save()
    return this.data.settings
  }
}

export const store = new Store()
