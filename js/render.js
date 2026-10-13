import { store, escapeHtml } from './store.js'
import { can } from './auth.js'

export const icon = (name, cls = 'icon-sm') => `<i data-lucide="${name}" class="${cls}"></i>`
export const badge = (text, cls = 'badge-neutral') => `<span class="badge ${cls}">${escapeHtml(text)}</span>`

export const pageHead = (eyebrow, title, description, action = '') => `
  <div class="pg-header">
    <div class="pg-header-left">
      <div class="pg-header-context">${escapeHtml(eyebrow)}</div>
      <h1 class="pg-title">${escapeHtml(title)}</h1>
      ${description ? `<p class="pg-sub">${escapeHtml(description)}</p>` : ''}
    </div>
    <div class="pg-header-actions">${action}</div>
  </div>
`

export const card = (title, subtitle, body, headerExtra = '', cardCls = '') => `
  <section class="card ${cardCls}">
    <div class="card-header">
      <div>
        <h2 class="card-title">${escapeHtml(title)}</h2>
        ${subtitle ? `<p class="card-subtitle">${escapeHtml(subtitle)}</p>` : ''}
      </div>
      ${headerExtra}
    </div>
    ${body ? `<div class="card-body">${body}</div>` : ''}
  </section>
`

export const progress = (value, tone = '') => `
  <div class="progress-track" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100">
    <div class="progress-fill ${tone}" style="width:${Math.max(0, Math.min(100, value))}%"></div>
  </div>
`

export const metricStrip = (items) => `
  <div class="metric-strip">
    ${items.map(i => `
      <div class="metric-item">
        <div class="metric-value">${escapeHtml(i.value)}</div>
        <div class="metric-label">${escapeHtml(i.label)}</div>
        ${i.delta ? `<span class="metric-delta ${i.deltaCls || ''}">${escapeHtml(i.delta)}</span>` : ''}
      </div>
    `).join('')}
  </div>
`

export const listRow = (title, meta, right = '') => `
  <div class="list-row">
    <div class="list-row-body">
      <div class="list-row-title">${escapeHtml(title)}</div>
      ${meta ? `<div class="list-row-meta">${escapeHtml(meta)}</div>` : ''}
    </div>
    ${right}
  </div>
`

export function pageTitle(page) {
  const titles = {
    dashboard: 'Dashboard',
    'trainer-dashboard': 'Trainer Dashboard',
    'admin-dashboard': 'Admin Dashboard',
    syllabus: 'Syllabus progress',
    assignments: 'Assignments',
    tasks: 'My tasks',
    attendance: 'Attendance',
    labs: 'Practical labs',
    schedule: 'Class schedule',
    assessments: 'Assessments & Results',
    resources: 'Resources & notes',
    reports: 'Reports & analytics',
    users: 'User management',
    settings: 'Settings'
  }
  return titles[page] || 'Dashboard'
}

export function renderPage(page, role, user, viewState = {}) {
  const renderers = {
    dashboard: () => renderStudentDashboard(user, viewState),
    'trainer-dashboard': () => renderTrainerDashboard(user, viewState),
    'admin-dashboard': () => renderAdminDashboard(user, viewState),
    syllabus: () => renderSyllabus(role, viewState),
    assignments: () => renderAssignments(role, user, viewState),
    tasks: () => renderTasks(role, viewState),
    attendance: () => renderAttendance(role, user, viewState),
    labs: () => renderLabs(role, viewState),
    schedule: () => renderSchedule(role, viewState),
    assessments: () => renderAssessments(role, viewState),
    resources: () => renderResources(role, viewState),
    reports: () => renderReports(role, user, viewState),
    users: () => renderUsers(role, viewState),
    settings: () => renderSettings(role, user, viewState)
  }

  const fn = renderers[page]
  if (!fn) {
    return renderStudentDashboard(user, viewState)
  }
  return fn()
}

/* ═══════════════════════════════════════════════════════════
   1. STUDENT DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function renderStudentDashboard(user, viewState) {
  const syllabusStats = store.getOverallSyllabusStats()
  const attStats = store.getStudentAttendanceStats(user?.email || 'student@hcl.com')
  const tasks = store.getTasks()
  const pendingTasks = tasks.filter(t => t.column !== 'done').length
  const assessments = store.getAssessments()
  const gradedAsm = assessments.filter(a => a.score !== '—' && a.percent > 0)
  const avgScore = gradedAsm.length > 0 ? Math.round(gradedAsm.reduce((acc, a) => acc + a.percent, 0) / gradedAsm.length) : 90
  const assignments = store.getAssignments()

  const userName = user?.name ? user.name.split(' ')[0] : 'Vinayak'

  return `
    ${pageHead('Tuesday, 13 October 2026', `Good morning, ${userName}`, 'Here is your learning overview and progress for today.')}

    <div class="context-bar">
      <div>
        <div class="context-bar-text">You are ${syllabusStats.overallProgress}% through the syllabus — 2 sessions scheduled for today.</div>
        <div class="context-bar-meta">Modern Java at 09:30 · Streams API practical lab at 14:00</div>
      </div>
      <button class="btn btn-primary btn-sm" data-navigate="syllabus">
        ${icon('arrow-right', 'icon-xs')} View syllabus
      </button>
    </div>

    ${metricStrip([
      { value: `${syllabusStats.overallProgress}%`, label: 'Syllabus progress', delta: `${syllabusStats.completedTopics} of ${syllabusStats.totalTopics} topics`, deltaCls: 'delta-up' },
      { value: `${attStats.pct}%`, label: 'Attendance rate', delta: `${attStats.present} of ${attStats.total} sessions`, deltaCls: 'delta-up' },
      { value: `${pendingTasks}`, label: 'Pending tasks', delta: `${tasks.filter(t => t.column === 'todo').length} to do`, deltaCls: pendingTasks > 2 ? 'delta-warn' : 'delta-up' },
      { value: `${avgScore}%`, label: 'Average score', delta: 'Assessment 1 Passed', deltaCls: 'delta-up' }
    ])}

    <div class="grid col-split mt-20">
      ${card('Today\u2019s schedule', 'Tuesday, 13 October 2026', `
        ${listRow('Modern Java \u2014 Streams API & Lambdas', '09:30 \u2013 11:00 · Room 4A · Rahul Guha', badge('Live session', 'badge-primary'))}
        ${listRow('Practical Lab: Streams API Order Pipeline', '14:00 \u2013 16:00 · Lab 2 · Ravi Kumar', badge('Lab session', 'badge-neutral'))}
      `)}

      ${card('Continue learning', 'Recommended learning activities', `
        ${listRow('Streams API revision note', 'Module 2 · 12 min read', `<button class="btn btn-ghost btn-sm" data-navigate="resources">Open note</button>`)}
        ${listRow('Stream Pipeline Refactoring', 'Assignment · Due 21 Oct', `<button class="btn btn-ghost btn-sm" data-navigate="assignments">View details</button>`)}
      `)}
    </div>

    <div class="grid grid-2 mt-20">
      ${card('Upcoming deadlines', 'Assignments and milestones', `
        ${assignments.slice(0, 3).map(a => `
          ${listRow(a.title, `Due: ${a.due} · ${a.points}`, badge(a.status, a.statusClass))}
        `).join('')}
      `, `<button class="btn btn-ghost btn-sm" data-navigate="assignments">All assignments</button>`)}

      ${card('Quick actions', 'Common tools and shortcuts', `
        <div style="display:flex;flex-direction:column;gap:8px">
          <button class="btn btn-secondary btn-full" data-modal="task">
            ${icon('plus-circle', 'icon-sm')} Add personal task
          </button>
          <button class="btn btn-secondary btn-full" data-navigate="syllabus">
            ${icon('book-open', 'icon-sm')} Continue syllabus topics
          </button>
          <button class="btn btn-secondary btn-full" data-navigate="attendance">
            ${icon('calendar-check', 'icon-sm')} Check attendance record
          </button>
        </div>
      `)}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   2. TRAINER DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function renderTrainerDashboard(user, viewState) {
  const users = store.getUsers()
  const students = users.filter(u => u.role === 'student')
  const assignments = store.getAssignments()
  const pendingReviews = assignments.filter(a => a.status === 'Submitted').length
  const cohortAtt = store.getCohortAttendanceStats()
  const syllabusStats = store.getOverallSyllabusStats()

  const userName = user?.name ? user.name.split(' ')[0] : 'Rahul'

  return `
    ${pageHead('Tuesday, 13 October 2026', `Good morning, ${userName}`, 'Cohort overview and pending reviews for Java Full Stack Batch 01.')}

    <div class="context-bar">
      <div>
        <div class="context-bar-text">${students.length} active learners in Batch 01 — ${pendingReviews} assignment submissions awaiting review.</div>
        <div class="context-bar-meta">Next class: Modern Java at 09:30 · Room 4A</div>
      </div>
      <button class="btn btn-primary btn-sm" data-navigate="assignments">
        ${icon('inbox', 'icon-xs')} Review submissions
      </button>
    </div>

    ${metricStrip([
      { value: `${students.length}`, label: 'Active learners', delta: 'Batch 01 cohort', deltaCls: 'delta-up' },
      { value: `${pendingReviews}`, label: 'Submissions to review', delta: 'Collections API exercise', deltaCls: pendingReviews > 0 ? 'delta-warn' : 'delta-up' },
      { value: `${cohortAtt}%`, label: 'Cohort attendance', delta: 'Target: 85%+', deltaCls: cohortAtt >= 85 ? 'delta-up' : 'delta-warn' },
      { value: `${syllabusStats.overallProgress}%`, label: 'Syllabus coverage', delta: 'Module 02 active', deltaCls: 'delta-up' }
    ])}

    <div class="grid col-split mt-20">
      ${card('Today\u2019s training sessions', 'Tuesday, 13 October 2026', `
        ${listRow('Modern Java \u2014 Functional Programming & Streams', '09:30 \u2013 11:00 · Room 4A · 5 learners', badge('Live', 'badge-primary'))}
        ${listRow('Practical Lab: Stream-based Order Processor', '14:00 \u2013 16:00 · Lab 2 · Rahul Guha', badge('Upcoming', 'badge-neutral'))}
      `)}

      ${card('Trainer action items', 'Requires attention', `
        ${listRow(`${pendingReviews} student submissions`, 'Collections API assignment ready for grading', `<button class="btn btn-ghost btn-sm" data-navigate="assignments">Grade</button>`)}
        ${listRow('Mark attendance register', 'Session for 13 Oct 2026', `<button class="btn btn-ghost btn-sm" data-navigate="attendance">Open register</button>`)}
      `)}
    </div>

    <div class="mt-20">
      ${card('Learner progress roster', 'Cohort performance and standing', `
        <div class="table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Learner</th>
                <th>Progress</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${students.map(s => {
                const sAtt = store.getStudentAttendanceStats(s.email)
                const sProg = s.email === 'student@hcl.com' ? syllabusStats.overallProgress : (s.progress || 38)
                return `
                  <tr>
                    <td>
                      <div class="person-cell">
                        <span class="person-avatar">${escapeHtml(s.initials)}</span>
                        <div>
                          <div class="person-name">${escapeHtml(s.name)}</div>
                          <div class="person-sub">${escapeHtml(s.email)}</div>
                        </div>
                      </div>
                    </td>
                    <td style="min-width:110px">
                      <div style="font-size:11px;font-weight:600;margin-bottom:2px">${sProg}%</div>
                      ${progress(sProg)}
                    </td>
                    <td>
                      <strong>${sAtt.pct}%</strong>
                      <span class="text-xs text-muted">(${sAtt.present}/${sAtt.total} days)</span>
                    </td>
                    <td>${badge(sAtt.pct >= 85 ? 'On track' : 'Needs attention', sAtt.pct >= 85 ? 'badge-success' : 'badge-warning')}</td>
                    <td>
                      <button class="table-action-btn" data-navigate="attendance" title="View or update attendance">
                        Register
                      </button>
                    </td>
                  </tr>
                `
              }).join('')}
            </tbody>
          </table>
        </div>
      `)}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   3. ADMIN DASHBOARD
   ═══════════════════════════════════════════════════════════ */
function renderAdminDashboard(user, viewState) {
  const users = store.getUsers()
  const students = users.filter(u => u.role === 'student')
  const trainers = users.filter(u => u.role === 'trainer')
  const cohortAtt = store.getCohortAttendanceStats()
  const syllabusStats = store.getOverallSyllabusStats()
  const modules = store.getModules()

  return `
    ${pageHead('Programme Administration', 'Executive Overview', 'High-level operational health and training status for the HCL Java Full Stack Programme.')}

    ${metricStrip([
      { value: `${students.length}`, label: 'Registered learners', delta: 'Batch 01', deltaCls: 'delta-up' },
      { value: `${trainers.length}`, label: 'Active trainers', delta: 'Lead & Lab staff', deltaCls: 'delta-up' },
      { value: `${cohortAtt}%`, label: 'Programme attendance', delta: '20 Sep – 13 Oct 2026', deltaCls: 'delta-up' },
      { value: `${syllabusStats.overallProgress}%`, label: 'Overall syllabus completion', delta: `${syllabusStats.completedTopics} of ${syllabusStats.totalTopics} topics`, deltaCls: 'delta-up' }
    ])}

    <div class="grid col-split mt-20">
      ${card('Active learning modules', 'Current cohort module pacing', `
        ${modules.slice(0, 5).map(m => `
          <div class="list-row">
            <div class="list-row-body">
              <div class="list-row-title">Module ${m.n}: ${escapeHtml(m.name)}</div>
              <div class="list-row-meta">${m.topics.filter(t => t.completed).length} of ${m.topics.length} topics completed · ${m.hours}</div>
            </div>
            <div style="width:130px;text-align:right">
              <div style="font-size:12px;font-weight:600;margin-bottom:3px">${m.progress}%</div>
              ${progress(m.progress, m.progress === 100 ? 'success' : '')}
            </div>
          </div>
        `).join('')}
      `, `<button class="btn btn-ghost btn-sm" data-navigate="syllabus">All 23 modules</button>`)}

      ${card('Administration actions', 'Programme management', `
        <div style="display:flex;flex-direction:column;gap:10px">
          <button class="btn btn-secondary btn-full" data-navigate="users">
            ${icon('users', 'icon-sm')} Manage programme users (${users.length})
          </button>
          <button class="btn btn-secondary btn-full" data-navigate="schedule">
            ${icon('calendar-days', 'icon-sm')} Configure class timetable
          </button>
          <button class="btn btn-secondary btn-full" data-navigate="reports">
            ${icon('trending-up', 'icon-sm')} View programme analytics
          </button>
          <button class="btn btn-secondary btn-full" data-navigate="settings">
            ${icon('settings-2', 'icon-sm')} System preferences & state reset
          </button>
        </div>
      `)}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   4. SYLLABUS PROGRESS (All 23 Modules)
   ═══════════════════════════════════════════════════════════ */
function renderSyllabus(role, viewState = {}) {
  const modules = store.getModules()
  const stats = store.getOverallSyllabusStats()
  const filter = viewState.syllabusFilter || 'all'
  const search = (viewState.syllabusSearch || '').toLowerCase().trim()

  const filteredModules = modules.filter(m => {
    if (filter === 'completed' && m.progress !== 100) return false
    if (filter === 'inprogress' && (m.progress === 0 || m.progress === 100)) return false
    if (filter === 'notstarted' && m.progress !== 0) return false
    if (search) {
      const matchName = m.name.toLowerCase().includes(search)
      const matchTopic = m.topics.some(t => t.name.toLowerCase().includes(search))
      if (!matchName && !matchTopic) return false
    }
    return true
  })

  const isStudent = role === 'student'

  const moduleMarkup = filteredModules.map((m, index) => {
    const isFirst = index === 0 && !search
    return `
      <div class="module-row ${isFirst ? 'open' : ''}" data-module-wrapper="${m.n}">
        <div class="module-row-header" data-module-toggle="${m.n}">
          <div class="module-num ${m.progress === 100 ? 'complete-mod' : m.progress > 0 ? 'active-mod' : ''}">
            ${String(m.n).padStart(2, '0')}
          </div>
          <div class="module-info">
            <div class="module-name">${escapeHtml(m.name)}</div>
            <div class="module-meta">
              ${m.hours} · ${m.topics.length} topics · 
              ${m.progress === 100 ? '<span class="text-success font-semibold">Completed</span>' : m.progress > 0 ? '<span class="text-primary font-semibold">In progress</span>' : '<span class="text-muted">Not started</span>'}
            </div>
          </div>
          <div class="module-progress-col">
            <div class="module-pct">${m.progress}%</div>
            ${progress(m.progress, m.progress === 100 ? 'success' : '')}
          </div>
          ${icon('chevron-down', 'icon-sm module-chevron')}
        </div>
        <div class="module-row-body">
          ${isStudent ? `
            <div class="text-xs text-muted" style="margin-bottom:8px">
              Click checkbox to toggle topic completion (updates module progress immediately):
            </div>
          ` : `
            <div class="text-xs text-muted" style="margin-bottom:8px">
              Topic syllabus outline (read-only for ${role}):
            </div>
          `}
          ${m.topics.map(t => `
            <label class="topic-item">
              <input 
                class="topic-check" 
                type="checkbox" 
                data-topic-toggle 
                data-module-n="${m.n}" 
                data-topic-id="${t.id}" 
                ${t.completed ? 'checked' : ''} 
                ${isStudent ? '' : 'disabled'}
              />
              <span class="topic-name ${t.completed ? 'text-primary font-semibold' : ''}">${escapeHtml(t.name)}</span>
              <span class="topic-hrs">${t.hours}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `
  }).join('')

  return `
    ${pageHead('Curriculum', 'Syllabus progress', 'All 23 comprehensive modules covering Core Java to Full-Stack Capstone.')}

    <div class="stat-row">
      <div class="stat-cell">
        <div class="stat-cell-value">${stats.completedTopics} / ${stats.totalTopics}</div>
        <div class="stat-cell-label">Topics completed</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-value">${stats.overallProgress}%</div>
        <div class="stat-cell-label">Overall syllabus completion</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-value">${modules.filter(m => m.progress === 100).length} / 23</div>
        <div class="stat-cell-label">Modules completed</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-value">Module ${stats.currentModule ? stats.currentModule.n : 5}</div>
        <div class="stat-cell-label">Active: ${escapeHtml(stats.currentModule ? stats.currentModule.name : 'SQL & Database')}</div>
      </div>
    </div>

    <div class="filter-row">
      <div class="tab-bar">
        <button class="tab-item ${filter === 'all' ? 'active' : ''}" data-syllabus-filter="all">All (23)</button>
        <button class="tab-item ${filter === 'inprogress' ? 'active' : ''}" data-syllabus-filter="inprogress">In progress</button>
        <button class="tab-item ${filter === 'completed' ? 'active' : ''}" data-syllabus-filter="completed">Completed</button>
        <button class="tab-item ${filter === 'notstarted' ? 'active' : ''}" data-syllabus-filter="notstarted">Not started</button>
      </div>
      <input 
        id="syllabus-search-input" 
        class="form-input filter-input" 
        placeholder="Search modules or topics..." 
        value="${escapeHtml(search)}" 
      />
    </div>

    <div class="card">
      <div class="card-body-sm" style="display:flex;flex-direction:column;gap:0">
        ${filteredModules.length > 0 ? moduleMarkup : `
          <div class="empty-state">
            <div class="empty-state-icon">${icon('book-open', 'icon-md')}</div>
            <div class="empty-state-title">No modules found</div>
            <div class="empty-state-text">No modules match your current filter or search criteria.</div>
          </div>
        `}
      </div>
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   5. PERSONAL TASK MANAGER
   ═══════════════════════════════════════════════════════════ */
function renderTasks(role, viewState = {}) {
  const allTasks = store.getTasks()
  const filterTag = viewState.taskTag || 'all'
  const search = (viewState.taskSearch || '').toLowerCase().trim()
  const today = '2026-10-13'

  const filteredTasks = allTasks.filter(t => {
    if (filterTag !== 'all' && t.tag !== filterTag) return false
    if (search && !t.title.toLowerCase().includes(search) && !(t.description || '').toLowerCase().includes(search)) return false
    return true
  })

  const columns = [
    { id: 'todo', title: 'To do', count: filteredTasks.filter(t => t.column === 'todo').length },
    { id: 'doing', title: 'In progress', count: filteredTasks.filter(t => t.column === 'doing').length },
    { id: 'done', title: 'Completed', count: filteredTasks.filter(t => t.column === 'done').length }
  ]

  const priorityBadges = {
    High: 'badge-danger',
    Normal: 'badge-primary',
    Low: 'badge-neutral'
  }

  const tagBadges = {
    Study: 'badge-primary',
    Assignment: 'badge-warning',
    Lab: 'badge-success',
    Personal: 'badge-info'
  }

  return `
    ${pageHead('Study planning', 'My tasks', 'Organise your personal study priorities, coding practice and lab deadlines.', `
      <button class="btn btn-primary" data-modal="task">
        ${icon('plus', 'icon-sm')} Add task
      </button>
    `)}

    <div class="filter-row">
      <div class="tab-bar">
        <button class="tab-item ${filterTag === 'all' ? 'active' : ''}" data-task-tag="all">All tags</button>
        <button class="tab-item ${filterTag === 'Study' ? 'active' : ''}" data-task-tag="Study">Study</button>
        <button class="tab-item ${filterTag === 'Assignment' ? 'active' : ''}" data-task-tag="Assignment">Assignment</button>
        <button class="tab-item ${filterTag === 'Lab' ? 'active' : ''}" data-task-tag="Lab">Lab</button>
        <button class="tab-item ${filterTag === 'Personal' ? 'active' : ''}" data-task-tag="Personal">Personal</button>
      </div>
      <input 
        id="task-search-input" 
        class="form-input filter-input" 
        placeholder="Search tasks..." 
        value="${escapeHtml(search)}" 
      />
    </div>

    <div class="task-board">
      ${columns.map(c => {
        const colTasks = filteredTasks.filter(t => t.column === c.id)
        return `
          <div class="task-col">
            <div class="task-col-head">
              <span class="task-col-title">${c.title}</span>
              <span class="task-col-count">${c.count}</span>
            </div>
            ${colTasks.length > 0 ? colTasks.map(t => {
              const isOverdue = t.due && t.due < today && t.column !== 'done'
              return `
                <div class="task-card" data-task-id="${t.id}">
                  <div class="task-card-header">
                    <span class="badge ${priorityBadges[t.priority] || 'badge-neutral'}">${t.priority}</span>
                    <div class="task-card-actions">
                      <button class="icon-btn" data-edit-task="${t.id}" title="Edit task" style="width:24px;height:24px">
                        ${icon('edit-2', 'icon-xs')}
                      </button>
                      <button class="icon-btn text-danger" data-delete-task="${t.id}" title="Delete task" style="width:24px;height:24px">
                        ${icon('trash-2', 'icon-xs')}
                      </button>
                    </div>
                  </div>
                  <div class="task-card-title">${escapeHtml(t.title)}</div>
                  ${t.description ? `<div class="task-card-desc">${escapeHtml(t.description)}</div>` : ''}
                  <div class="task-card-foot">
                    <span class="badge ${tagBadges[t.tag] || 'badge-neutral'}">${escapeHtml(t.tag)}</span>
                    <span class="task-due ${isOverdue ? 'badge badge-overdue' : ''}">
                      ${icon('calendar', 'icon-xs')} ${escapeHtml(t.due)}
                      ${isOverdue ? ' · Overdue' : ''}
                    </span>
                  </div>
                  <div class="task-quick-move">
                    ${c.id === 'todo' ? `
                      <button class="task-quick-btn" data-move-task="${t.id}" data-col="doing">Start working →</button>
                      <button class="task-quick-btn" data-move-task="${t.id}" data-col="done">Mark done ✓</button>
                    ` : c.id === 'doing' ? `
                      <button class="task-quick-btn" data-move-task="${t.id}" data-col="todo">← To do</button>
                      <button class="task-quick-btn" data-move-task="${t.id}" data-col="done">Complete ✓</button>
                    ` : `
                      <button class="task-quick-btn" data-move-task="${t.id}" data-col="doing">↺ Reopen</button>
                    `}
                  </div>
                </div>
              `
            }).join('') : `
              <div class="empty-state" style="padding:28px 12px">
                <span class="text-xs text-muted">No tasks in ${c.title.toLowerCase()}</span>
              </div>
            `}
          </div>
        `
      }).join('')}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   6. ASSIGNMENTS
   ═══════════════════════════════════════════════════════════ */
function renderAssignments(role, user, viewState = {}) {
  const assignments = store.getAssignments()
  const filter = viewState.assignmentFilter || 'all'
  const search = (viewState.assignmentSearch || '').toLowerCase().trim()

  const isTrainer = role === 'trainer' || role === 'admin'

  const filtered = assignments.filter(a => {
    if (filter === 'todo' && (a.status === 'Submitted' || a.status.startsWith('Marked'))) return false
    if (filter === 'submitted' && a.status !== 'Submitted') return false
    if (filter === 'marked' && !a.status.startsWith('Marked')) return false
    if (search && !a.title.toLowerCase().includes(search) && !a.module.toLowerCase().includes(search)) return false
    return true
  })

  return `
    ${pageHead('Learning activities', 'Assignments', 'Coursework, coding exercises and practical submissions with instructor feedback.', `
      ${isTrainer ? `
        <button class="btn btn-primary" data-modal="assignment_create">
          ${icon('plus', 'icon-sm')} Create assignment
        </button>
      ` : `
        <button class="btn btn-primary" data-modal="assignment_submit">
          ${icon('upload-cloud', 'icon-sm')} Submit work
        </button>
      `}
    `)}

    ${card('Assignments overview', `${assignments.length} assignments across curriculum`, `
      <div class="filter-row">
        <div class="tab-bar">
          <button class="tab-item ${filter === 'all' ? 'active' : ''}" data-asg-filter="all">All (${assignments.length})</button>
          <button class="tab-item ${filter === 'todo' ? 'active' : ''}" data-asg-filter="todo">To do</button>
          <button class="tab-item ${filter === 'submitted' ? 'active' : ''}" data-asg-filter="submitted">Submitted</button>
          <button class="tab-item ${filter === 'marked' ? 'active' : ''}" data-asg-filter="marked">Marked</button>
        </div>
        <input 
          id="asg-search-input" 
          class="form-input filter-input" 
          placeholder="Search assignments..." 
          value="${escapeHtml(search)}" 
        />
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Status</th>
              <th>Due date</th>
              <th>Points</th>
              <th>Submission / Grade</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length > 0 ? filtered.map(a => `
              <tr>
                <td>
                  <div class="person-name">${escapeHtml(a.title)}</div>
                  <div class="person-sub">${escapeHtml(a.module)} · ${escapeHtml(a.type)}</div>
                </td>
                <td>${badge(a.status, a.statusClass)}</td>
                <td>${escapeHtml(a.due)}</td>
                <td><strong>${escapeHtml(a.points)}</strong></td>
                <td>
                  <div>${a.submitted !== '—' ? `<span class="text-xs text-muted">Submitted ${escapeHtml(a.submitted)}</span>` : '<span class="text-xs text-muted">Not submitted yet</span>'}</div>
                  ${a.grade && a.grade !== '—' ? `<div class="text-xs font-semibold text-primary">Grade: ${escapeHtml(a.grade)}</div>` : ''}
                </td>
                <td>
                  ${isTrainer ? `
                    <button class="btn btn-secondary btn-sm" data-grade-asg="${a.id}">
                      ${a.status === 'Submitted' ? 'Review & Grade' : 'Edit grade'}
                    </button>
                  ` : a.status.startsWith('Marked') ? `
                    <button class="btn btn-secondary btn-sm" data-view-asg-feedback="${a.id}">
                      View feedback
                    </button>
                  ` : `
                    <button class="btn btn-secondary btn-sm" data-submit-asg="${a.id}">
                      ${a.status === 'Submitted' ? 'Update submission' : 'Submit work'}
                    </button>
                  `}
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <div class="empty-state-icon">${icon('clipboard-check', 'icon-md')}</div>
                    <div class="empty-state-title">No assignments found</div>
                    <div class="empty-state-text">No assignments match your filter or search query.</div>
                  </div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `)}
  `
}

/* ═══════════════════════════════════════════════════════════
   7. ATTENDANCE (Programme Start: 20 Sep 2026, Mon-Fri)
   ═══════════════════════════════════════════════════════════ */
function renderAttendance(role, user, viewState = {}) {
  const attData = store.getAttendance()
  const studentEmail = user?.email || 'student@hcl.com'
  const isTrainerOrAdmin = role === 'trainer' || role === 'admin'
  const selectedDate = viewState.attDate || attData.currentDate

  const studentStats = store.getStudentAttendanceStats(studentEmail)
  const students = store.getUsers().filter(u => u.role === 'student')

  // Build calendar days for October 2026 (1-31 Oct)
  // 1 Oct 2026 is Thursday (day index 4: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6)
  const monthDays = []
  // Padding for Thursday start (Sun, Mon, Tue, Wed = 4 blank cells)
  for (let i = 0; i < 4; i++) {
    monthDays.push({ blank: true })
  }
  for (let d = 1; d <= 31; d++) {
    const dayStr = `2026-10-${String(d).padStart(2, '0')}`
    const dateObj = new Date(2026, 9, d)
    const dayOfWeek = dateObj.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const isPastOrToday = d <= 13
    const isToday = d === 13

    let record = null
    if (!isWeekend && isPastOrToday && attData.records[dayStr]) {
      record = attData.records[dayStr][studentEmail] || 'Present'
    }

    monthDays.push({
      num: d,
      dateStr: dayStr,
      isWeekend,
      isPastOrToday,
      isToday,
      record
    })
  }

  const daysHeader = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return `
    ${pageHead('Programme participation', 'Attendance register', 'Official training attendance records from programme start (20 September 2026) onwards.')}

    ${isTrainerOrAdmin ? `
      <!-- TRAINER / ADMIN ATTENDANCE REGISTER -->
      <div class="card mb-20">
        <div class="card-header">
          <div>
            <h2 class="card-title">Mark attendance register</h2>
            <p class="card-subtitle">Select training date and mark status for Batch 01 learners</p>
          </div>
          <div style="display:flex;align-items:center;gap:10px">
            <label class="form-label" for="att-date-picker" style="margin:0">Date:</label>
            <select id="att-date-picker" class="form-select" style="width:auto">
              ${Object.keys(attData.records).sort().reverse().map(d => `
                <option value="${d}" ${d === selectedDate ? 'selected' : ''}>${d} ${d === '2026-10-13' ? '(Today)' : ''}</option>
              `).join('')}
            </select>
            <button class="btn btn-primary btn-sm" id="btn-save-attendance">
              ${icon('save', 'icon-xs')} Save register
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Email</th>
                  <th>Current status (${selectedDate})</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => {
                  const sStats = store.getStudentAttendanceStats(s.email)
                  const dayRecord = (attData.records[selectedDate] && attData.records[selectedDate][s.email]) || 'Present'
                  return `
                    <tr>
                      <td>
                        <div class="person-cell">
                          <span class="person-avatar">${escapeHtml(s.initials)}</span>
                          <span class="person-name">${escapeHtml(s.name)}</span>
                        </div>
                      </td>
                      <td>${escapeHtml(s.email)}</td>
                      <td>
                        <div class="att-status-group" data-student-email="${escapeHtml(s.email)}">
                          <button type="button" class="att-status-btn ${dayRecord === 'Present' ? 'selected-present' : ''}" data-set-status="Present">Present</button>
                          <button type="button" class="att-status-btn ${dayRecord === 'Late' ? 'selected-late' : ''}" data-set-status="Late">Late</button>
                          <button type="button" class="att-status-btn ${dayRecord === 'Absent' ? 'selected-absent' : ''}" data-set-status="Absent">Absent</button>
                        </div>
                      </td>
                      <td><strong>${sStats.pct}%</strong> <span class="text-xs text-muted">(${sStats.present}/${sStats.total} sessions)</span></td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    ` : ''}

    <div class="grid col-split">
      <div class="card">
        <div class="cal-header">
          <div>
            <span class="cal-month">October 2026</span>
            <div class="text-xs text-muted" style="margin-top:2px">Simulated date: Tuesday, 13 Oct 2026</div>
          </div>
          <div class="cal-nav">
            <span class="badge badge-primary">Weekdays Mon–Fri</span>
          </div>
        </div>
        <div class="cal-grid">
          ${daysHeader.map(d => `<div class="cal-wd">${d}</div>`).join('')}
          ${monthDays.map(item => {
            if (item.blank) return `<div class="cal-day muted"><div class="cal-num"></div></div>`
            const dot = item.record === 'Present'
              ? '<div class="cal-dot present">Present</div>'
              : item.record === 'Late'
              ? '<div class="cal-dot late">Late</div>'
              : item.record === 'Absent'
              ? '<div class="cal-dot absent">Absent</div>'
              : item.isWeekend
              ? '<div class="text-xs text-muted" style="font-size:9px">Off</div>'
              : !item.isPastOrToday
              ? '<div class="text-xs text-muted" style="font-size:8px">Upcoming</div>'
              : ''

            return `
              <div class="cal-day ${item.isWeekend ? 'muted' : ''} ${item.isToday ? 'today' : ''}">
                <div class="cal-num">${item.num}</div>
                ${dot}
              </div>
            `
          }).join('')}
        </div>
      </div>

      ${card('Attendance summary', `Official record for ${escapeHtml(user?.name || 'Vinayak')}`, `
        <div class="att-ring-wrap">
          <div class="att-ring">
            <div class="att-ring-inner">
              <div class="att-pct">${studentStats.pct}%</div>
              <div class="att-lbl">Attendance</div>
            </div>
          </div>
        </div>
        ${listRow(`${studentStats.present} training sessions`, 'Attended in full', badge(`${studentStats.pct}%`, 'badge-success'))}
        ${listRow(`${studentStats.late} session`, 'Marked late', badge('Late', 'badge-warning'))}
        ${listRow(`${studentStats.absent} session`, 'Recorded absence', badge('Absent', 'badge-danger'))}
        <div class="mt-16 text-xs text-muted" style="line-height:1.45">
          <strong>Policy Note:</strong> Programme commenced on 20 September 2026. Official attendance is recorded Monday–Friday. Future sessions are strictly excluded from calculations.
        </div>
      `)}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   8. PRACTICAL LABS
   ═══════════════════════════════════════════════════════════ */
function renderLabs(role, viewState = {}) {
  const labs = store.getLabs()
  const isTrainer = role === 'trainer' || role === 'admin'

  return `
    ${pageHead('Hands-on practice', 'Practical labs', 'Guided programming exercises and architectural labs designed to reinforce concepts.', `
      ${isTrainer ? `
        <button class="btn btn-primary" data-modal="lab_create">
          ${icon('plus', 'icon-sm')} Add practical lab
        </button>
      ` : ''}
    `)}

    <div class="grid grid-2">
      ${labs.map(l => `
        <div class="card">
          <div class="card-body">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px">
              <div>
                <div class="pg-header-context" style="margin-bottom:4px">${escapeHtml(l.module)}</div>
                <div class="list-row-title" style="font-size:14px;cursor:pointer" data-view-lab="${l.id}" title="Click to view lab instructions">${escapeHtml(l.title)}</div>
              </div>
              ${badge(l.status, l.cls)}
            </div>
            <p class="text-xs text-muted" style="line-height:1.45;margin-bottom:14px">
              ${escapeHtml(l.instructions)}
            </p>
            <div class="progress-row">
              <span>Completion progress</span>
              <span>${l.progress}%</span>
            </div>
            ${progress(l.progress, l.progress === 100 ? 'success' : '')}
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px">
              <span class="text-xs text-muted">Est. ${escapeHtml(l.estimatedHours)} ${l.completedDate ? `· Completed ${l.completedDate}` : ''}</span>
              <button class="btn btn-primary btn-sm" data-toggle-lab="${l.id}">
                ${l.status === 'Completed' ? 'Mark In Progress' : 'Mark Completed ✓'}
              </button>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   9. CLASS SCHEDULE
   ═══════════════════════════════════════════════════════════ */
function renderSchedule(role, viewState = {}) {
  const schedule = store.getSchedule()
  const times = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00']
  const days = [
    { code: 'Mon', label: '12 Oct' },
    { code: 'Tue', label: '13 Oct' },
    { code: 'Wed', label: '14 Oct' },
    { code: 'Thu', label: '15 Oct' },
    { code: 'Fri', label: '16 Oct' }
  ]

  const isTrainerOrAdmin = role === 'trainer' || role === 'admin'

  return `
    ${pageHead('Programme calendar', 'Class schedule', 'Timetable for week of 12 October 2026. Standard schedule runs Monday to Friday in IST.', `
      ${isTrainerOrAdmin ? `
        <button class="btn btn-primary" data-modal="schedule_create">
          ${icon('plus', 'icon-sm')} Add session
        </button>
      ` : ''}
    `)}

    <div class="card">
      <div class="cal-header">
        <div>
          <div class="cal-month">Week of 12 October 2026</div>
          <div class="card-subtitle">All timings shown in IST · Batch 01</div>
        </div>
        <div class="cal-nav">
          <span class="badge badge-primary">Normal schedule: Mon–Fri</span>
        </div>
      </div>
      <div class="sch-grid-wrap">
        <div class="sch-grid">
          <div class="sch-cell sch-head"></div>
          ${days.map(d => `
            <div class="sch-cell sch-head">
              <div class="sch-day">${d.code}</div>
              <div class="sch-date">${d.label}</div>
            </div>
          `).join('')}
          ${times.map(time => `
            <div class="sch-time">${time}</div>
            ${days.map(d => {
              const matched = schedule.find(s => s.day === d.code && (s.time === time || s.time.startsWith(time.slice(0, 2))))
              return `
                <div class="sch-cell">
                  ${matched ? `
                    <div class="session-block ${matched.tone}" data-view-session="${escapeHtml(matched.title)}" style="cursor:pointer" title="Click to view session details">
                      <div class="session-title">${escapeHtml(matched.title)}</div>
                      <div class="session-meta">${escapeHtml(matched.trainer)} · ${matched.time}</div>
                    </div>
                  ` : ''}
                </div>
              `
            }).join('')}
          `).join('')}
        </div>
      </div>
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   10. ASSESSMENTS
   ═══════════════════════════════════════════════════════════ */
function renderAssessments(role, viewState = {}) {
  const assessments = store.getAssessments()
  const isTrainerOrAdmin = role === 'trainer' || role === 'admin'

  const passedCount = assessments.filter(a => a.status === 'Passed').length

  return `
    ${pageHead('Measure your growth', 'Assessments & Results', 'Five checkpoints across the Java Full Stack programme with trainer feedback.', `
      ${isTrainerOrAdmin ? `
        <button class="btn btn-primary" data-modal="assessment_grade">
          ${icon('edit-3', 'icon-sm')} Update assessment results
        </button>
      ` : ''}
    `)}

    <div class="stat-row">
      <div class="stat-cell">
        <div class="stat-cell-value">90%</div>
        <div class="stat-cell-label">Average score</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-value">${passedCount} / 5</div>
        <div class="stat-cell-label">Passed checkpoints</div>
      </div>
      <div class="stat-cell">
        <div class="stat-cell-value">12 days</div>
        <div class="stat-cell-label">Next: SQL Checkpoint (25 Oct)</div>
      </div>
    </div>

    <div class="card">
      <div class="card-body-sm" style="display:flex;flex-direction:column;gap:0">
        ${assessments.map((a, i) => `
          <div class="list-row" style="padding:14px 0">
            <div class="module-num ${a.score !== '—' ? 'complete-mod' : 'active-mod'}" style="flex-shrink:0">
              ${i + 1}
            </div>
            <div class="list-row-body">
              <div class="list-row-title">${escapeHtml(a.title)}</div>
              <div class="list-row-meta">
                ${escapeHtml(a.name)} · Scheduled: ${escapeHtml(a.date)}
                ${a.feedback ? `<br/><span class="text-xs text-primary" style="margin-top:2px;display:inline-block">Trainer feedback: "${escapeHtml(a.feedback)}"</span>` : ''}
              </div>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <div class="stat-cell-value" style="font-size:16px">${escapeHtml(a.score)}</div>
              <div style="margin-top:4px">${badge(a.status, a.className)}</div>
              ${isTrainerOrAdmin ? `
                <button class="table-action-btn mt-16" data-grade-single-asm="${a.name}" style="margin-top:6px">
                  Edit score
                </button>
              ` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   11. RESOURCES & NOTES
   ═══════════════════════════════════════════════════════════ */
function renderResources(role, viewState = {}) {
  const resources = store.getResources()
  const filter = viewState.resourceFilter || 'all'
  const search = (viewState.resourceSearch || '').toLowerCase().trim()
  const isTrainer = role === 'trainer' || role === 'admin'

  const filtered = resources.filter(r => {
    if (filter === 'revision' && r.type !== 'Revision note') return false
    if (filter === 'guide' && r.type !== 'Learning guide') return false
    if (filter === 'reference' && r.type !== 'Reference' && r.type !== 'Cheat sheet') return false
    if (search && !r.title.toLowerCase().includes(search) && !r.module.toLowerCase().includes(search)) return false
    return true
  })

  return `
    ${pageHead('Knowledge centre', 'Resources & notes', 'Curated revision guides, code cheat sheets, and official documentation.', `
      ${isTrainer ? `
        <button class="btn btn-primary" data-modal="resource_create">
          ${icon('plus', 'icon-sm')} Add resource
        </button>
      ` : ''}
    `)}

    <div class="filter-row">
      <div class="tab-bar">
        <button class="tab-item ${filter === 'all' ? 'active' : ''}" data-res-filter="all">All (${resources.length})</button>
        <button class="tab-item ${filter === 'revision' ? 'active' : ''}" data-res-filter="revision">Revision notes</button>
        <button class="tab-item ${filter === 'guide' ? 'active' : ''}" data-res-filter="guide">Learning guides</button>
        <button class="tab-item ${filter === 'reference' ? 'active' : ''}" data-res-filter="reference">References</button>
      </div>
      <input 
        id="res-search-input" 
        class="form-input filter-input" 
        placeholder="Search resources..." 
        value="${escapeHtml(search)}" 
      />
    </div>

    <div class="grid grid-3">
      ${filtered.length > 0 ? filtered.map(r => `
        <div class="card resource-card-click" data-view-resource="${escapeHtml(r.title)}">
          <div class="card-body">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:12px">
              ${icon(r.icon || 'book-open', 'icon-md')}
              <span class="badge badge-neutral">${escapeHtml(r.type)}</span>
            </div>
            <div class="list-row-title" style="min-height:32px;font-size:13px">${escapeHtml(r.title)}</div>
            <div class="list-row-meta" style="margin:6px 0 14px">${escapeHtml(r.module)}</div>
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span class="text-xs text-muted">${escapeHtml(r.meta)}</span>
              <button class="icon-btn" title="View resource preview">
                ${icon('arrow-up-right', 'icon-sm')}
              </button>
            </div>
          </div>
        </div>
      `).join('') : `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">${icon('library', 'icon-md')}</div>
          <div class="empty-state-title">No resources found</div>
          <div class="empty-state-text">No study resources match your search or filter.</div>
        </div>
      `}
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   12. REPORTS & ANALYTICS
   ═══════════════════════════════════════════════════════════ */
function renderReports(role, user, viewState = {}) {
  const isAdmin = role === 'admin'
  const isTrainer = role === 'trainer'
  const students = store.getUsers().filter(u => u.role === 'student')
  const cohortAtt = store.getCohortAttendanceStats()
  const syllabusStats = store.getOverallSyllabusStats()
  const studentStats = store.getStudentAttendanceStats(user?.email || 'student@hcl.com')

  return `
    ${pageHead(
      isAdmin ? 'Programme overview' : isTrainer ? 'Cohort insights' : 'Personal analytics',
      isAdmin ? 'Programme reports' : isTrainer ? 'Cohort reports' : 'My reports',
      isAdmin ? 'Comprehensive training KPIs across batches.' : isTrainer ? 'Detailed performance indicators and learner support radar.' : 'Snapshot of your syllabus velocity, attendance reliability and assessment performance.',
      `<button class="btn btn-secondary" id="btn-export-report">${icon('download', 'icon-sm')} Export summary</button>`
    )}

    ${metricStrip([
      { value: isAdmin ? `${students.length}` : isTrainer ? `${students.length}` : `${syllabusStats.overallProgress}%`, label: isAdmin || isTrainer ? 'Active learners' : 'Syllabus completion', delta: '+6% this week', deltaCls: 'delta-up' },
      { value: isAdmin || isTrainer ? `${cohortAtt}%` : `${studentStats.pct}%`, label: 'Attendance rate', delta: 'Good standing', deltaCls: 'delta-up' },
      { value: '88%', label: 'Average assessment score', delta: 'Assessment 1 evaluated', deltaCls: 'delta-up' },
      { value: '23 modules', label: 'Curriculum scope', delta: 'Java 21 + Spring + React', deltaCls: 'delta-up' }
    ])}

    <div class="grid col-split mt-20">
      ${card('Curriculum pacing breakdown', 'Completion percentage across key tech domains', `
        <div class="bar-chart">
          ${[
            { label: 'Core Java', val: 78 },
            { label: 'Modern Java', val: 46 },
            { label: 'SQL DB', val: 22 },
            { label: 'Spring Boot', val: 0 },
            { label: 'React JS', val: 0 },
            { label: 'DevOps', val: 0 },
            { label: 'Capstone', val: 0 }
          ].map((item, i) => `
            <div class="bar-col">
              <span class="bar-val">${item.val}%</span>
              <div class="bar-fill" style="height:${Math.max(item.val, 6)}%;background:${item.val > 50 ? 'var(--primary-600)' : item.val > 0 ? 'var(--primary-400)' : 'var(--neutral-200)'}"></div>
              <span class="bar-label">${item.label}</span>
            </div>
          `).join('')}
        </div>
      `)}

      ${card('Strengths & focus radar', 'Actionable feedback', `
        ${listRow('Core Java OOP & Collections', '90% checkpoint score — strong competency in collections hierarchy', badge('Strength', 'badge-success'))}
        ${listRow('Streams API pipeline refactoring', 'Practice map/filter/reduce grouping and collector collectors', badge('In progress', 'badge-warning'))}
        ${listRow('Relational Database Joins', 'Scheduled checkpoint on 25 Oct 2026', badge('Next focus', 'badge-primary'))}
      `)}
    </div>

    ${(isTrainer || isAdmin) ? `
      <div class="mt-20">
        ${card('Learner health matrix', 'Individual cohort progress and attendance standing', `
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Attendance %</th>
                  <th>Days (Pres/Total)</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                ${students.map(s => {
                  const sAtt = store.getStudentAttendanceStats(s.email)
                  return `
                    <tr>
                      <td>
                        <div class="person-cell">
                          <span class="person-avatar">${escapeHtml(s.initials)}</span>
                          <div>
                            <div class="person-name">${escapeHtml(s.name)}</div>
                            <div class="person-sub">${escapeHtml(s.email)}</div>
                          </div>
                        </div>
                      </td>
                      <td><strong>${sAtt.pct}%</strong></td>
                      <td>${sAtt.present} / ${sAtt.total} sessions</td>
                      <td>${badge(sAtt.pct >= 85 ? 'On track' : 'Needs attention', sAtt.pct >= 85 ? 'badge-success' : 'badge-warning')}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
          </div>
        `)}
      </div>
    ` : ''}
  `
}

/* ═══════════════════════════════════════════════════════════
   13. USER MANAGEMENT (Admin Only)
   ═══════════════════════════════════════════════════════════ */
function renderUsers(role, viewState = {}) {
  if (role !== 'admin') {
    return `
      <div class="empty-state">
        <div class="empty-state-icon text-danger">${icon('shield-alert', 'icon-lg')}</div>
        <div class="empty-state-title">Access restricted</div>
        <div class="empty-state-text">User management is only accessible by Programme Administrators.</div>
        <button class="btn btn-primary" data-navigate="dashboard">Return to dashboard</button>
      </div>
    `
  }

  const users = store.getUsers()
  const filter = viewState.userFilter || 'all'
  const search = (viewState.userSearch || '').toLowerCase().trim()

  const filtered = users.filter(u => {
    if (filter === 'students' && u.role !== 'student') return false
    if (filter === 'trainers' && u.role !== 'trainer') return false
    if (filter === 'admins' && u.role !== 'admin') return false
    if (search && !u.name.toLowerCase().includes(search) && !u.email.toLowerCase().includes(search)) return false
    return true
  })

  return `
    ${pageHead('Administration', 'User management', 'Manage student cohort enrolments, trainers and administrators for Batch 01.', `
      <button class="btn btn-primary" data-modal="user_create">
        ${icon('user-plus', 'icon-sm')} Add user
      </button>
    `)}

    ${card('Programme directory', `${users.length} active registered users`, `
      <div class="filter-row">
        <div class="tab-bar">
          <button class="tab-item ${filter === 'all' ? 'active' : ''}" data-user-filter="all">All (${users.length})</button>
          <button class="tab-item ${filter === 'students' ? 'active' : ''}" data-user-filter="students">Students</button>
          <button class="tab-item ${filter === 'trainers' ? 'active' : ''}" data-user-filter="trainers">Trainers</button>
          <button class="tab-item ${filter === 'admins' ? 'active' : ''}" data-user-filter="admins">Admins</button>
        </div>
        <input 
          id="user-search-input" 
          class="form-input filter-input" 
          placeholder="Search by name or email..." 
          value="${escapeHtml(search)}" 
        />
      </div>

      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Batch</th>
              <th>Status</th>
              <th>Last active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length > 0 ? filtered.map(u => `
              <tr>
                <td>
                  <div class="person-cell">
                    <span class="person-avatar" style="${u.role === 'trainer' ? 'background:var(--warning-100);color:var(--warning-700)' : u.role === 'admin' ? 'background:var(--danger-100);color:var(--danger-700)' : ''}">${escapeHtml(u.initials)}</span>
                    <div>
                      <div class="person-name">${escapeHtml(u.name)}</div>
                      <div class="person-sub">${escapeHtml(u.email)}</div>
                    </div>
                  </div>
                </td>
                <td>${badge(u.role.toUpperCase(), u.role === 'admin' ? 'badge-danger' : u.role === 'trainer' ? 'badge-warning' : 'badge-info')}</td>
                <td>${escapeHtml(u.batch || 'Batch 01')}</td>
                <td>${badge(u.status || 'Active', 'badge-success')}</td>
                <td><span class="text-xs text-muted">${escapeHtml(u.lastActive || 'Today')}</span></td>
                <td>
                  <div style="display:flex;gap:4px">
                    <button class="icon-btn" data-edit-user="${u.id}" title="Edit user">
                      ${icon('edit-2', 'icon-xs')}
                    </button>
                    ${u.email !== 'admin@hcl.com' ? `
                      <button class="icon-btn text-danger" data-delete-user="${u.id}" title="Delete user">
                        ${icon('trash-2', 'icon-xs')}
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `).join('') : `
              <tr>
                <td colspan="6">
                  <div class="empty-state">
                    <div class="empty-state-icon">${icon('users', 'icon-md')}</div>
                    <div class="empty-state-title">No users found</div>
                    <div class="empty-state-text">No user records matched your criteria.</div>
                  </div>
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `)}
  `
}

/* ═══════════════════════════════════════════════════════════
   14. SETTINGS
   ═══════════════════════════════════════════════════════════ */
function renderSettings(role, user, viewState = {}) {
  const activeTab = viewState.settingsTab || 'profile'
  const settings = store.getSettings()

  return `
    ${pageHead('Workspace preferences', 'Settings', 'Manage your profile, notifications, appearance and local demo state.')}

    <div class="settings-layout">
      <nav class="settings-nav">
        <button class="settings-nav-item ${activeTab === 'profile' ? 'active' : ''}" data-settings-tab="profile">Profile</button>
        <button class="settings-nav-item ${activeTab === 'notifications' ? 'active' : ''}" data-settings-tab="notifications">Notifications</button>
        <button class="settings-nav-item ${activeTab === 'appearance' ? 'active' : ''}" data-settings-tab="appearance">Appearance</button>
        <button class="settings-nav-item ${activeTab === 'state' ? 'active' : ''}" data-settings-tab="state">Demo State Reset</button>
      </nav>

      <div class="settings-panel">
        ${activeTab === 'profile' ? `
          <section class="card">
            <div class="card-header"><h2 class="card-title">Profile information</h2></div>
            <div class="settings-card-body">
              <form id="profile-form">
                <div class="form-row">
                  <div class="form-group">
                    <label class="form-label" for="settings-name">Full name</label>
                    <input id="settings-name" class="form-input" value="${escapeHtml(user?.name || 'Vinayak Kumar Singh')}" required />
                  </div>
                  <div class="form-group">
                    <label class="form-label">Email address</label>
                    <input class="form-input" value="${escapeHtml(user?.email || 'student@hcl.com')}" disabled />
                    <span class="text-xs text-muted" style="margin-top:2px">Demo email address is fixed for this role.</span>
                  </div>
                </div>
                <div class="form-group mt-16">
                  <label class="form-label" for="settings-bio">About you</label>
                  <textarea id="settings-bio" class="form-textarea" rows="3">${escapeHtml(settings.bio || 'Java Full Stack learner · Batch 01')}</textarea>
                </div>
                <div style="display:flex;justify-content:flex-end;margin-top:16px">
                  <button type="submit" class="btn btn-primary">Save profile</button>
                </div>
              </form>
            </div>
          </section>
        ` : activeTab === 'notifications' ? `
          <section class="card">
            <div class="card-header"><h2 class="card-title">Notification preferences</h2></div>
            <div class="settings-card-body">
              <div class="settings-divider-row">
                <div>
                  <div class="settings-row-label">Assignment deadlines</div>
                  <div class="settings-row-help">Receive alerts 24 hours before assignment due dates.</div>
                </div>
                <button class="toggle ${settings.notifDeadlines ? 'on' : ''}" id="toggle-notif-deadlines"></button>
              </div>
              <div class="settings-divider-row">
                <div>
                  <div class="settings-row-label">Session reminders</div>
                  <div class="settings-row-help">Receive notifications 30 minutes before live training sessions.</div>
                </div>
                <button class="toggle ${settings.notifSessions ? 'on' : ''}" id="toggle-notif-sessions"></button>
              </div>
              <div class="settings-divider-row">
                <div>
                  <div class="settings-row-label">Trainer announcements</div>
                  <div class="settings-row-help">Receive broadcast notices from Lead Trainer Rahul Guha.</div>
                </div>
                <button class="toggle ${settings.notifAnnouncements ? 'on' : ''}" id="toggle-notif-announcements"></button>
              </div>
            </div>
          </section>
        ` : activeTab === 'appearance' ? `
          <section class="card">
            <div class="card-header"><h2 class="card-title">Theme and display</h2></div>
            <div class="settings-card-body">
              <div class="settings-divider-row">
                <div>
                  <div class="settings-row-label">Dark mode</div>
                  <div class="settings-row-help">Toggle dark background palette for late-night coding practice.</div>
                </div>
                <button class="btn btn-secondary btn-sm" id="btn-toggle-theme-page">
                  ${icon('sun', 'icon-xs')} Toggle theme
                </button>
              </div>
            </div>
          </section>
        ` : `
          <section class="card">
            <div class="card-header"><h2 class="card-title text-danger">Demo state management</h2></div>
            <div class="settings-card-body">
              <div class="danger-notice">
                <strong>Attention:</strong> All modifications to syllabus checkboxes, created personal tasks, submitted assignments, marked attendance and registered users are stored locally in your browser's LocalStorage.
              </div>
              <p class="text-xs text-muted" style="line-height:1.5;margin-bottom:18px">
                If you wish to return the application to its clean initial state, you can perform a factory reset of the demo store. This will restore all 23 syllabus modules, demo users, sample tasks and initial records.
              </p>
              <button class="btn btn-danger" id="btn-trigger-reset-demo">
                ${icon('rotate-ccw', 'icon-xs')} Reset all demo data to factory state
              </button>
            </div>
          </section>
        `}
      </div>
    </div>
  `
}

/* ═══════════════════════════════════════════════════════════
   15. MODAL BUILDER (Dynamic & Fully Functional)
   ═══════════════════════════════════════════════════════════ */
export function modalContent(type, data = {}, role = 'student') {
  const modules = store.getModules()

  switch (type) {
    case 'task': {
      const isEdit = !!data.id
      return {
        title: isEdit ? 'Edit personal task' : 'Add personal task',
        body: `
          <form id="task-modal-form">
            <div class="form-group">
              <label class="form-label" for="task-m-title">Task title *</label>
              <input id="task-m-title" class="form-input" placeholder="e.g. Review Java Collections notes" value="${escapeHtml(data.title || '')}" required />
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="task-m-desc">Description</label>
              <textarea id="task-m-desc" class="form-textarea" rows="2" placeholder="Key topics or steps to cover...">${escapeHtml(data.description || '')}</textarea>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="task-m-priority">Priority</label>
                <select id="task-m-priority" class="form-select">
                  <option value="Normal" ${data.priority === 'Normal' ? 'selected' : ''}>Normal</option>
                  <option value="High" ${data.priority === 'High' ? 'selected' : ''}>High</option>
                  <option value="Low" ${data.priority === 'Low' ? 'selected' : ''}>Low</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="task-m-tag">Category</label>
                <select id="task-m-tag" class="form-select">
                  <option value="Study" ${data.tag === 'Study' ? 'selected' : ''}>Study</option>
                  <option value="Assignment" ${data.tag === 'Assignment' ? 'selected' : ''}>Assignment</option>
                  <option value="Lab" ${data.tag === 'Lab' ? 'selected' : ''}>Lab</option>
                  <option value="Personal" ${data.tag === 'Personal' ? 'selected' : ''}>Personal</option>
                </select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="task-m-due">Due date *</label>
                <input id="task-m-due" class="form-input" type="date" value="${data.due || '2026-10-15'}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="task-m-col">Board column</label>
                <select id="task-m-col" class="form-select">
                  <option value="todo" ${data.column === 'todo' ? 'selected' : ''}>To do</option>
                  <option value="doing" ${data.column === 'doing' ? 'selected' : ''}>In progress</option>
                  <option value="done" ${data.column === 'done' ? 'selected' : ''}>Completed</option>
                </select>
              </div>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">${isEdit ? 'Update task' : 'Save task'}</button>
        `
      }
    }

    case 'assignment_submit': {
      const assignments = store.getAssignments()
      const selectedAsgId = data.id || assignments[1]?.id
      return {
        title: 'Submit assignment work',
        body: `
          <form id="asg-submit-form">
            <div class="form-group">
              <label class="form-label" for="asg-select">Select assignment *</label>
              <select id="asg-select" class="form-select">
                ${assignments.map(a => `
                  <option value="${a.id}" ${a.id === selectedAsgId ? 'selected' : ''}>${escapeHtml(a.title)} (${escapeHtml(a.module)})</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asg-url">GitHub Repository or Pull Request link *</label>
              <input id="asg-url" class="form-input" type="url" placeholder="https://github.com/your-username/repo" value="${escapeHtml(data.submissionUrl || '')}" required />
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asg-notes">Submission notes / implementation summary</label>
              <textarea id="asg-notes" class="form-textarea" rows="3" placeholder="Describe key patterns used, challenges solved and tests written...">${escapeHtml(data.submissionNotes || '')}</textarea>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Submit work</button>
        `
      }
    }

    case 'assignment_create': {
      return {
        title: 'Create new assignment',
        body: `
          <form id="asg-create-form">
            <div class="form-group">
              <label class="form-label" for="asg-title">Assignment title *</label>
              <input id="asg-title" class="form-input" placeholder="e.g. Spring Boot REST Endpoints" required />
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asg-module">Curriculum module *</label>
              <select id="asg-module" class="form-select">
                ${modules.map(m => `
                  <option value="${escapeHtml(m.name)}">Module ${m.n}: ${escapeHtml(m.name)}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="asg-due">Due date *</label>
                <input id="asg-due" class="form-input" type="date" value="2026-10-28" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="asg-points">Points</label>
                <input id="asg-points" class="form-input" value="20 pts" />
              </div>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asg-type">Assignment type</label>
              <select id="asg-type" class="form-select">
                <option value="Hands-on lab">Hands-on lab</option>
                <option value="Coding exercise">Coding exercise</option>
                <option value="Assessment">Assessment</option>
                <option value="Practical">Practical</option>
              </select>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Create assignment</button>
        `
      }
    }

    case 'assignment_grade': {
      return {
        title: `Grade assignment: ${escapeHtml(data.title || '')}`,
        body: `
          <form id="asg-grade-form">
            <div class="form-group">
              <label class="form-label">Student submission URL</label>
              <div class="text-xs text-primary font-semibold" style="word-break:break-all">
                ${data.submissionUrl ? `<a href="${escapeHtml(data.submissionUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(data.submissionUrl)}</a>` : 'No URL provided'}
              </div>
            </div>
            ${data.submissionNotes ? `
              <div class="form-group mt-16">
                <label class="form-label">Student notes</label>
                <div class="text-xs text-muted">${escapeHtml(data.submissionNotes)}</div>
              </div>
            ` : ''}
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="grade-score">Awarded score (e.g. 19/20) *</label>
                <input id="grade-score" class="form-input" value="${data.grade && data.grade !== 'Pending evaluation' ? escapeHtml(data.grade) : '18/20'}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="grade-status">Status</label>
                <select id="grade-status" class="form-select">
                  <option value="Marked · Evaluated">Marked · Evaluated</option>
                  <option value="Revision requested">Revision requested</option>
                </select>
              </div>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="grade-feedback">Trainer feedback & review notes *</label>
              <textarea id="grade-feedback" class="form-textarea" rows="3" required>${escapeHtml(data.feedback || 'Well structured solution. Good test coverage and clean git commits.')}</textarea>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Save evaluation</button>
        `
      }
    }

    case 'schedule_create': {
      return {
        title: 'Add class timetable session',
        body: `
          <form id="sch-create-form">
            <div class="form-group">
              <label class="form-label" for="sch-title">Session topic / title *</label>
              <input id="sch-title" class="form-input" placeholder="e.g. Modern Java Streams & Optional" required />
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="sch-day">Day of week</label>
                <select id="sch-day" class="form-select">
                  <option value="Mon">Monday</option>
                  <option value="Tue">Tuesday</option>
                  <option value="Wed">Wednesday</option>
                  <option value="Thu">Thursday</option>
                  <option value="Fri">Friday</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="sch-time">Start time</label>
                <select id="sch-time" class="form-select">
                  <option value="09:30">09:30</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:30">15:30</option>
                </select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="sch-trainer">Trainer</label>
                <input id="sch-trainer" class="form-input" value="Rahul Guha" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="sch-room">Room / Link</label>
                <input id="sch-room" class="form-input" value="Room 4A" />
              </div>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Add session</button>
        `
      }
    }

    case 'assessment_grade': {
      const assessments = store.getAssessments()
      const selected = data.name || assessments[0].name
      const curr = assessments.find(a => a.name === selected) || assessments[0]
      return {
        title: 'Record assessment results',
        body: `
          <form id="asm-grade-form">
            <div class="form-group">
              <label class="form-label" for="asm-sel">Assessment</label>
              <select id="asm-sel" class="form-select">
                ${assessments.map(a => `
                  <option value="${escapeHtml(a.name)}" ${a.name === selected ? 'selected' : ''}>${escapeHtml(a.name)}: ${escapeHtml(a.title)}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="asm-score">Score (e.g. 18/20)</label>
                <input id="asm-score" class="form-input" value="${escapeHtml(curr.score === '—' ? '18/20' : curr.score)}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="asm-pct">Percentage (%)</label>
                <input id="asm-pct" class="form-input" type="number" min="0" max="100" value="${curr.percent || 90}" required />
              </div>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asm-status">Status</label>
              <select id="asm-status" class="form-select">
                <option value="Passed" ${curr.status === 'Passed' ? 'selected' : ''}>Passed</option>
                <option value="Needs Retest" ${curr.status === 'Needs Retest' ? 'selected' : ''}>Needs Retest</option>
                <option value="Upcoming" ${curr.status === 'Upcoming' ? 'selected' : ''}>Upcoming</option>
              </select>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="asm-feedback">Feedback note</label>
              <textarea id="asm-feedback" class="form-textarea" rows="3">${escapeHtml(curr.feedback || 'Strong performance on fundamentals.')}</textarea>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Save assessment</button>
        `
      }
    }

    case 'lab_create': {
      return {
        title: 'Add practical lab',
        body: `
          <form id="lab-create-form">
            <div class="form-group">
              <label class="form-label" for="lab-title">Lab title *</label>
              <input id="lab-title" class="form-input" placeholder="e.g. Spring Security JWT Pipeline" required />
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="lab-module">Associated module *</label>
              <select id="lab-module" class="form-select">
                ${modules.map(m => `
                  <option value="${escapeHtml(m.name)}">Module ${m.n}: ${escapeHtml(m.name)}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="lab-hrs">Estimated hours</label>
              <input id="lab-hrs" class="form-input" value="3 hrs" />
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="lab-inst">Lab instructions & acceptance criteria</label>
              <textarea id="lab-inst" class="form-textarea" rows="3" placeholder="Provide step-by-step instructions...">Construct secure authentication endpoints using JWT bearer tokens.</textarea>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Create lab</button>
        `
      }
    }

    case 'resource_detail': {
      const res = store.getResources().find(r => r.title === data.title) || data
      return {
        title: escapeHtml(res.title || 'Resource details'),
        body: `
          <div>
            <div class="badge badge-primary mb-12">${escapeHtml(res.type || 'Study note')}</div>
            <p class="text-xs text-muted" style="margin-bottom:14px">Module: <strong>${escapeHtml(res.module || '')}</strong></p>
            <div style="background:var(--neutral-50);padding:14px;border-radius:var(--r-md);border:1px solid var(--border);font-size:12.5px;line-height:1.55">
              ${escapeHtml(res.content || 'Curated reference note for this topic covering key syntax, patterns, and best practices.')}
            </div>
            <div style="margin-top:16px">
              <a href="${escapeHtml(res.url || 'https://docs.oracle.com/en/java/')}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">
                ${icon('external-link', 'icon-xs')} Open official documentation
              </a>
            </div>
          </div>
        `,
        footer: `
          <button class="btn btn-primary" id="modal-cancel">Close note</button>
        `
      }
    }

    case 'resource_create': {
      return {
        title: 'Add learning resource',
        body: `
          <form id="res-create-form">
            <div class="form-group">
              <label class="form-label" for="res-title">Title *</label>
              <input id="res-title" class="form-input" placeholder="e.g. Spring JPA Repository Cheat Sheet" required />
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="res-type">Resource type</label>
                <select id="res-type" class="form-select">
                  <option value="Revision note">Revision note</option>
                  <option value="Learning guide">Learning guide</option>
                  <option value="Cheat sheet">Cheat sheet</option>
                  <option value="Reference">Reference</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="res-module">Module</label>
                <select id="res-module" class="form-select">
                  ${modules.map(m => `
                    <option value="${escapeHtml(m.name)}">${escapeHtml(m.name)}</option>
                  `).join('')}
                </select>
              </div>
            </div>
            <div class="form-group mt-16">
              <label class="form-label" for="res-url">Reference URL</label>
              <input id="res-url" class="form-input" placeholder="https://..." value="https://spring.io/guides" />
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Save resource</button>
        `
      }
    }

    case 'user_create': {
      return {
        title: 'Add programme user',
        body: `
          <form id="user-create-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="user-m-name">Full name *</label>
                <input id="user-m-name" class="form-input" placeholder="e.g. Sandeep Varma" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="user-m-role">Role *</label>
                <select id="user-m-role" class="form-select">
                  <option value="student">Student</option>
                  <option value="trainer">Trainer</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="user-m-email">Email address *</label>
                <input id="user-m-email" class="form-input" type="email" placeholder="name@hcl.com" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="user-m-batch">Batch assignment</label>
                <input id="user-m-batch" class="form-input" value="Batch 01" />
              </div>
            </div>
            <div id="user-m-error" class="login-error hidden mt-16">
              ${icon('alert-circle', 'icon-xs')}
              <span id="user-m-error-msg"></span>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Create user</button>
        `
      }
    }

    case 'user_edit': {
      return {
        title: `Edit programme user: ${escapeHtml(data.name || '')}`,
        body: `
          <form id="user-edit-form">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label" for="user-edit-name">Full name *</label>
                <input id="user-edit-name" class="form-input" value="${escapeHtml(data.name || '')}" required />
              </div>
              <div class="form-group">
                <label class="form-label" for="user-edit-role">Role *</label>
                <select id="user-edit-role" class="form-select">
                  <option value="student" ${data.role === 'student' ? 'selected' : ''}>Student</option>
                  <option value="trainer" ${data.role === 'trainer' ? 'selected' : ''}>Trainer</option>
                  <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Administrator</option>
                </select>
              </div>
            </div>
            <div class="form-row mt-16">
              <div class="form-group">
                <label class="form-label" for="user-edit-email">Email address *</label>
                <input id="user-edit-email" class="form-input" type="email" value="${escapeHtml(data.email || '')}" ${data.email === 'admin@hcl.com' || data.email === 'trainer@hcl.com' || data.email === 'student@hcl.com' ? 'disabled' : ''} required />
              </div>
              <div class="form-group">
                <label class="form-label" for="user-edit-batch">Batch assignment</label>
                <input id="user-edit-batch" class="form-input" value="${escapeHtml(data.batch || 'Batch 01')}" />
              </div>
            </div>
            <div id="user-edit-error" class="login-error hidden mt-16">
              ${icon('alert-circle', 'icon-xs')}
              <span id="user-edit-error-msg"></span>
            </div>
          </form>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-primary" id="modal-submit">Save changes</button>
        `
      }
    }

    case 'assignment_feedback': {
      return {
        title: `Evaluation: ${escapeHtml(data.title || '')}`,
        body: `
          <div>
            <div class="list-row" style="padding:0 0 12px">
              <div>
                <div class="font-semibold">${escapeHtml(data.module || '')}</div>
                <div class="text-xs text-muted">${escapeHtml(data.type || '')} · ${escapeHtml(data.points || '')}</div>
              </div>
              ${badge(data.status || '', data.statusClass || '')}
            </div>
            <div style="background:var(--primary-50);padding:14px;border-radius:var(--r-md);border:1px solid var(--primary-100);margin:12px 0">
              <div class="text-xs text-muted">Awarded Score</div>
              <div style="font-size:20px;font-weight:700;color:var(--primary-700)">${escapeHtml(data.grade || '')}</div>
              <div class="text-xs font-semibold text-primary" style="margin-top:8px">Trainer Feedback:</div>
              <div class="text-xs" style="margin-top:4px;color:var(--neutral-800)">"${escapeHtml(data.feedback || '')}"</div>
            </div>
            <div class="text-xs text-muted" style="margin-top:10px">
              Submitted: ${escapeHtml(data.submitted || '')}<br/>
              Link: ${data.submissionUrl ? `<a href="${escapeHtml(data.submissionUrl)}" target="_blank" rel="noopener noreferrer" class="text-primary font-semibold">${escapeHtml(data.submissionUrl)}</a>` : '—'}
            </div>
          </div>
        `,
        footer: `<button class="btn btn-primary" id="modal-cancel">Close</button>`
      }
    }

    case 'session_detail': {
      const s = store.getSchedule().find(x => x.title === data.title) || data
      return {
        title: `Class session: ${escapeHtml(s.title || '')}`,
        body: `
          <div>
            <div class="badge badge-primary mb-12">${escapeHtml(s.day || 'Weekday')} · ${escapeHtml(s.date || '')}</div>
            <div class="list-row" style="padding:10px 0">
              <div>
                <div class="text-xs text-muted">Time & Venue</div>
                <div class="font-semibold" style="margin-top:2px">${escapeHtml(s.time || '')} IST · ${escapeHtml(s.room || 'Room 4A')}</div>
              </div>
            </div>
            <div class="list-row" style="padding:10px 0">
              <div>
                <div class="text-xs text-muted">Instructor</div>
                <div class="font-semibold" style="margin-top:2px">${escapeHtml(s.trainer || 'Lead Trainer')}</div>
              </div>
            </div>
            <div style="background:var(--neutral-50);padding:12px;border-radius:var(--r-md);border:1px solid var(--border);margin-top:12px;font-size:12px;line-height:1.5">
              Live training session for Java Full Stack Batch 01. Learners are requested to review preceding module notes and join on time.
            </div>
          </div>
        `,
        footer: `<button class="btn btn-primary" id="modal-cancel">Close</button>`
      }
    }

    case 'lab_detail': {
      const lab = store.getLabs().find(x => x.id === data.id) || data
      return {
        title: `Practical lab: ${escapeHtml(lab.title || '')}`,
        body: `
          <div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
              <span class="badge badge-primary">${escapeHtml(lab.module || '')}</span>
              ${badge(lab.status || '', lab.cls || '')}
            </div>
            <div class="text-xs text-muted" style="margin-bottom:12px">Estimated time: ${escapeHtml(lab.estimatedHours || '2-3 hrs')}</div>
            <div style="background:var(--neutral-50);padding:14px;border-radius:var(--r-md);border:1px solid var(--border);font-size:12.5px;line-height:1.55;margin-bottom:14px">
              <strong>Instructions & Acceptance Criteria:</strong><br/>
              ${escapeHtml(lab.instructions || '')}
            </div>
            <div class="progress-row">
              <span>Current completion</span>
              <span>${lab.progress || 0}%</span>
            </div>
            ${progress(lab.progress || 0, lab.progress === 100 ? 'success' : '')}
          </div>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Close</button>
          <button class="btn btn-primary" data-toggle-lab-modal="${lab.id}">Toggle Status</button>
        `
      }
    }

    case 'confirm_delete': {
      return {
        title: `Confirm deletion: ${escapeHtml(data.title || 'Item')}`,
        body: `
          <div class="danger-notice">
            ${escapeHtml(data.message || 'Are you sure you want to delete this item? This action cannot be undone.')}
          </div>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-danger" id="modal-submit">Delete</button>
        `
      }
    }

    case 'confirm_reset': {
      return {
        title: 'Factory reset demo state',
        body: `
          <div class="danger-notice">
            <strong>Warning:</strong> This will reset all 23 syllabus modules, custom tasks, submitted assignments, marked attendance records and added users to initial default demo data.
          </div>
          <p class="text-xs text-muted" style="line-height:1.5">
            Are you sure you want to proceed with restoring default demo records?
          </p>
        `,
        footer: `
          <button class="btn btn-secondary" id="modal-cancel">Cancel</button>
          <button class="btn btn-danger" id="modal-submit">Reset demo data</button>
        `
      }
    }

    default: {
      return {
        title: 'Information',
        body: `<p class="text-xs text-muted">${escapeHtml(data.message || 'Action executed successfully.')}</p>`,
        footer: `<button class="btn btn-primary" id="modal-cancel">OK</button>`
      }
    }
  }
}
