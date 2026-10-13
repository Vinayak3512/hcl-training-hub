import { navByRole } from './data.js'
import { store, escapeHtml } from './store.js'
import { authenticate, getCurrentSession, clearSession, canAccessPage, getDefaultPageForRole } from './auth.js'
import { renderPage, pageTitle, modalContent, icon } from './render.js'

const state = {
  user: null,
  page: null,
  viewState: {
    syllabusFilter: 'all',
    syllabusSearch: '',
    taskTag: 'all',
    taskSearch: '',
    assignmentFilter: 'all',
    assignmentSearch: '',
    attDate: '2026-10-13',
    resourceFilter: 'all',
    resourceSearch: '',
    userFilter: 'all',
    userSearch: '',
    settingsTab: 'profile'
  },
  modalCallback: null
}

const $ = (selector) => document.querySelector(selector)

function init() {
  initTheme()
  bindLogin()
  bindGlobalEvents()

  // Validate saved demo session
  const session = getCurrentSession()
  if (session) {
    showApp(session)
  } else {
    $('#login-screen').classList.remove('hidden')
    $('#app-shell').classList.add('hidden')
  }

  refreshIcons()
}

/* ═══════════════════════════════════════════════════════════
   THEME CONTROLLER
   ═══════════════════════════════════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('hcl_theme') || 'light'
  applyTheme(saved)
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme
  localStorage.setItem('hcl_theme', theme)
  const isDark = theme === 'dark'
  const iconEl = $('#theme-icon')
  const textEl = $('#theme-text')
  if (iconEl) iconEl.setAttribute('data-lucide', isDark ? 'sun' : 'moon')
  if (textEl) textEl.textContent = isDark ? 'Light mode' : 'Dark mode'
  refreshIcons()
}

function toggleTheme() {
  const current = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'
  applyTheme(current)
  showToast(`Switched to ${current} mode`)
}

/* ═══════════════════════════════════════════════════════════
   LOGIN CONTROLLER
   ═══════════════════════════════════════════════════════════ */
function bindLogin() {
  // Demo account quick-fill buttons
  document.querySelectorAll('.demo-pill').forEach((btn) => {
    btn.addEventListener('click', () => {
      const email = btn.dataset.email
      const pass = btn.dataset.pass
      $('#login-email').value = email
      $('#login-password').value = pass
      $('#login-error').classList.add('hidden')
    })
  })

  // Password visibility toggle
  const togglePassBtn = $('#toggle-password')
  if (togglePassBtn) {
    togglePassBtn.addEventListener('click', () => {
      const passInput = $('#login-password')
      const passIcon = $('#toggle-password-icon')
      if (passInput.type === 'password') {
        passInput.type = 'text'
        if (passIcon) passIcon.setAttribute('data-lucide', 'eye-off')
        togglePassBtn.setAttribute('aria-label', 'Hide password')
      } else {
        passInput.type = 'password'
        if (passIcon) passIcon.setAttribute('data-lucide', 'eye')
        togglePassBtn.setAttribute('aria-label', 'Show password')
      }
      refreshIcons()
    })
  }

  // Form submission
  $('#login-form').addEventListener('submit', (event) => {
    event.preventDefault()
    const email = $('#login-email').value.trim()
    const password = $('#login-password').value

    if (!email || !password) {
      showLoginError('Please enter both email and password.')
      return
    }

    const authResult = authenticate(email, password)
    if (!authResult.success) {
      showLoginError(authResult.error)
      return
    }

    $('#login-error').classList.add('hidden')
    showApp(authResult.user)
    showToast(`Signed in as ${authResult.user.name} (${authResult.user.role.toUpperCase()})`)
  })
}

function showLoginError(msg) {
  const errBox = $('#login-error')
  const errMsg = $('#login-error-msg')
  if (errMsg) errMsg.textContent = msg
  errBox.classList.remove('hidden')
  refreshIcons()
}

/* ═══════════════════════════════════════════════════════════
   APP SHELL & NAVIGATION
   ═══════════════════════════════════════════════════════════ */
function showApp(sessionUser) {
  state.user = sessionUser
  $('#login-screen').classList.add('hidden')
  $('#app-shell').classList.remove('hidden')

  // Populate sidebar user details
  $('#sidebar-user-name').textContent = sessionUser.name
  $('#sidebar-role-text').textContent = sessionUser.title || `${sessionUser.role.toUpperCase()} · Batch 01`
  $('#sidebar-avatar').textContent = sessionUser.initials
  $('#topbar-avatar').textContent = sessionUser.initials

  // Default page for role
  state.page = getDefaultPageForRole(sessionUser.role)

  renderNavigation()
  renderCurrentPage()
}

function renderNavigation() {
  if (!state.user) return
  const groups = navByRole[state.user.role] || []

  // Dynamic badge counts
  const asgs = store.getAssignments()
  const studentPendingAsg = asgs.filter(a => a.status === 'Not started' || a.status === 'In progress').length
  const trainerPendingReview = asgs.filter(a => a.status === 'Submitted').length

  $('#sidebar-nav').innerHTML = groups.map(group => `
    <div class="nav-section">
      <div class="nav-section-label">${escapeHtml(group.group)}</div>
      ${group.items.map(item => {
        let badgeCount = item.count || ''
        if (item.id === 'assignments') {
          badgeCount = state.user.role === 'student' ? studentPendingAsg : trainerPendingReview
        }
        return `
          <button class="nav-item ${item.id === state.page ? 'active' : ''}" data-page="${item.id}">
            ${icon(item.icon, 'icon-sm')}
            <span>${escapeHtml(item.label)}</span>
            ${badgeCount ? `<span class="nav-badge">${badgeCount}</span>` : ''}
          </button>
        `
      }).join('')}
    </div>
  `).join('')

  // Bind navigation clicks
  $('#sidebar-nav').querySelectorAll('[data-page]').forEach((item) => {
    item.addEventListener('click', () => navigate(item.dataset.page))
  })

  refreshIcons()
}

function navigate(page) {
  if (!canAccessPage(state.user.role, page)) {
    showToast(`Access restricted: ${pageTitle(page)} is not available for ${state.user.role} role.`)
    return
  }

  state.page = page
  renderNavigation()
  renderCurrentPage()
  closeSidebar()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function renderCurrentPage() {
  if (!state.user || !state.page) return
  $('#breadcrumb-section').textContent = pageTitle(state.page)
  $('#page-content').innerHTML = renderPage(state.page, state.user.role, state.user, state.viewState)
  refreshIcons()
  bindPageEvents()
}

/* ═══════════════════════════════════════════════════════════
   PAGE INTERACTIVITY & EVENT BINDINGS
   ═══════════════════════════════════════════════════════════ */
function bindPageEvents() {
  // Navigation shortcuts
  document.querySelectorAll('[data-navigate]').forEach((btn) => {
    btn.addEventListener('click', () => navigate(btn.dataset.navigate))
  })

  // ── Syllabus Events ──
  document.querySelectorAll('[data-module-toggle]').forEach((header) => {
    header.addEventListener('click', () => {
      const parent = header.closest('[data-module-wrapper]')
      if (parent) parent.classList.toggle('open')
    })
  })

  document.querySelectorAll('[data-topic-toggle]').forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation()
      if (state.user.role !== 'student') return
      const modN = Number(checkbox.dataset.moduleN)
      const topicId = checkbox.dataset.topicId
      const result = store.toggleTopic(modN, topicId)
      if (result) {
        showToast(`Topic updated: Module ${modN} is now ${result.module.progress}% completed`)
        renderCurrentPage()
        renderNavigation()
      }
    })
  })

  document.querySelectorAll('[data-syllabus-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.syllabusFilter = tab.dataset.syllabusFilter
      renderCurrentPage()
    })
  })

  const sylSearchInput = $('#syllabus-search-input')
  if (sylSearchInput) {
    sylSearchInput.addEventListener('input', (e) => {
      state.viewState.syllabusSearch = e.target.value
      renderCurrentPage()
      // Preserve search focus
      const newInp = $('#syllabus-search-input')
      if (newInp) {
        newInp.focus()
        newInp.setSelectionRange(newInp.value.length, newInp.value.length)
      }
    })
  }

  // ── Task Events ──
  document.querySelectorAll('[data-task-tag]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.taskTag = tab.dataset.taskTag
      renderCurrentPage()
    })
  })

  const taskSearchInput = $('#task-search-input')
  if (taskSearchInput) {
    taskSearchInput.addEventListener('input', (e) => {
      state.viewState.taskSearch = e.target.value
      renderCurrentPage()
      const newInp = $('#task-search-input')
      if (newInp) {
        newInp.focus()
        newInp.setSelectionRange(newInp.value.length, newInp.value.length)
      }
    })
  }

  document.querySelectorAll('[data-move-task]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const taskId = btn.dataset.moveTask
      const targetCol = btn.dataset.col
      store.setTaskColumn(taskId, targetCol)
      showToast('Task status updated')
      renderCurrentPage()
    })
  })

  document.querySelectorAll('[data-edit-task]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const taskId = btn.dataset.editTask
      const task = store.getTasks().find(t => t.id === taskId)
      if (task) openModal('task', task)
    })
  })

  document.querySelectorAll('[data-delete-task]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation()
      const taskId = btn.dataset.deleteTask
      const task = store.getTasks().find(t => t.id === taskId)
      if (task) {
        openModal('confirm_delete', {
          title: `Task "${task.title}"`,
          message: `Are you sure you want to delete task "${task.title}"?`,
          onConfirm: () => {
            store.deleteTask(taskId)
            showToast('Task deleted successfully')
            renderCurrentPage()
          }
        })
      }
    })
  })

  // ── Assignment Events ──
  document.querySelectorAll('[data-asg-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.assignmentFilter = tab.dataset.asgFilter
      renderCurrentPage()
    })
  })

  const asgSearchInput = $('#asg-search-input')
  if (asgSearchInput) {
    asgSearchInput.addEventListener('input', (e) => {
      state.viewState.assignmentSearch = e.target.value
      renderCurrentPage()
      const newInp = $('#asg-search-input')
      if (newInp) {
        newInp.focus()
        newInp.setSelectionRange(newInp.value.length, newInp.value.length)
      }
    })
  }

  document.querySelectorAll('[data-submit-asg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const asgId = btn.dataset.submitAsg
      const asg = store.getAssignments().find(a => a.id === asgId)
      openModal('assignment_submit', asg || { id: asgId })
    })
  })

  document.querySelectorAll('[data-grade-asg]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const asgId = btn.dataset.gradeAsg
      const asg = store.getAssignments().find(a => a.id === asgId)
      openModal('assignment_grade', asg)
    })
  })

  // ── Attendance Events ──
  const attDatePicker = $('#att-date-picker')
  if (attDatePicker) {
    attDatePicker.addEventListener('change', (e) => {
      state.viewState.attDate = e.target.value
      renderCurrentPage()
    })
  }

  document.querySelectorAll('.att-status-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.att-status-group')
      if (!group) return
      group.querySelectorAll('.att-status-btn').forEach(b => {
        b.className = 'att-status-btn'
      })
      const status = btn.dataset.setStatus
      btn.className = `att-status-btn selected-${status.toLowerCase()}`
    })
  })

  const btnSaveAtt = $('#btn-save-attendance')
  if (btnSaveAtt) {
    btnSaveAtt.addEventListener('click', () => {
      const date = $('#att-date-picker')?.value || '2026-10-13'
      document.querySelectorAll('.att-status-group').forEach(group => {
        const email = group.dataset.studentEmail
        const activeBtn = group.querySelector('.selected-present, .selected-late, .selected-absent')
        if (email && activeBtn) {
          const status = activeBtn.dataset.setStatus
          store.markAttendance(date, email, status)
        }
      })
      showToast(`Attendance register saved for ${date}`)
      renderCurrentPage()
    })
  }

  // ── Practical Lab Events ──
  document.querySelectorAll('[data-toggle-lab]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const labId = btn.dataset.toggleLab
      const updated = store.toggleLabStatus(labId)
      if (updated) {
        showToast(`Lab status updated to ${updated.status}`)
        renderCurrentPage()
      }
    })
  })

  // ── Resource Events ──
  document.querySelectorAll('[data-res-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.resourceFilter = tab.dataset.resFilter
      renderCurrentPage()
    })
  })

  const resSearchInput = $('#res-search-input')
  if (resSearchInput) {
    resSearchInput.addEventListener('input', (e) => {
      state.viewState.resourceSearch = e.target.value
      renderCurrentPage()
      const newInp = $('#res-search-input')
      if (newInp) {
        newInp.focus()
        newInp.setSelectionRange(newInp.value.length, newInp.value.length)
      }
    })
  }

  document.querySelectorAll('[data-view-resource]').forEach((cardEl) => {
    cardEl.addEventListener('click', () => {
      const title = cardEl.dataset.viewResource
      openModal('resource_detail', { title })
    })
  })

  // ── Assessments ──
  document.querySelectorAll('[data-grade-single-asm]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const name = btn.dataset.gradeSingleAsm
      openModal('assessment_grade', { name })
    })
  })

  // ── User Management Events ──
  document.querySelectorAll('[data-user-filter]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.userFilter = tab.dataset.userFilter
      renderCurrentPage()
    })
  })

  const userSearchInput = $('#user-search-input')
  if (userSearchInput) {
    userSearchInput.addEventListener('input', (e) => {
      state.viewState.userSearch = e.target.value
      renderCurrentPage()
      const newInp = $('#user-search-input')
      if (newInp) {
        newInp.focus()
        newInp.setSelectionRange(newInp.value.length, newInp.value.length)
      }
    })
  }

  document.querySelectorAll('[data-delete-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uId = btn.dataset.deleteUser
      const user = store.getUsers().find(u => u.id === uId)
      if (user) {
        openModal('confirm_delete', {
          title: `User ${user.name}`,
          message: `Are you sure you want to remove ${user.name} (${user.email}) from the training programme?`,
          onConfirm: () => {
            store.deleteUser(uId)
            showToast('User removed from directory')
            renderCurrentPage()
          }
        })
      }
    })
  })

  document.querySelectorAll('[data-edit-user]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const uId = btn.dataset.editUser
      const user = store.getUsers().find(u => u.id === uId)
      if (user) openModal('user_edit', user)
    })
  })

  document.querySelectorAll('[data-view-asg-feedback]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const asgId = btn.dataset.viewAsgFeedback
      const asg = store.getAssignments().find(a => a.id === asgId)
      if (asg) openModal('assignment_feedback', asg)
    })
  })

  document.querySelectorAll('[data-view-session]').forEach((block) => {
    block.addEventListener('click', () => {
      const title = block.dataset.viewSession
      openModal('session_detail', { title })
    })
  })

  document.querySelectorAll('[data-view-lab]').forEach((el) => {
    el.addEventListener('click', () => {
      const labId = el.dataset.viewLab
      openModal('lab_detail', { id: labId })
    })
  })

  // ── Settings Events ──
  document.querySelectorAll('[data-settings-tab]').forEach((tab) => {
    tab.addEventListener('click', () => {
      state.viewState.settingsTab = tab.dataset.settingsTab
      renderCurrentPage()
    })
  })

  const profileForm = $('#profile-form')
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault()
      const newName = $('#settings-name').value.trim()
      const newBio = $('#settings-bio').value.trim()
      store.updateSettings({ profileName: newName, bio: newBio })

      // Update current user record in store
      const allUsers = store.getUsers()
      const curr = allUsers.find(u => u.email === state.user.email)
      if (curr) {
        curr.name = newName
        store.save()
      }

      state.user.name = newName
      $('#sidebar-user-name').textContent = newName
      showToast('Profile information saved successfully')
      renderCurrentPage()
    })
  }

  // Notification toggles in Settings
  const toggleNotifDeadlines = $('#toggle-notif-deadlines')
  if (toggleNotifDeadlines) {
    toggleNotifDeadlines.addEventListener('click', () => {
      toggleNotifDeadlines.classList.toggle('on')
      store.updateSettings({ notifDeadlines: toggleNotifDeadlines.classList.contains('on') })
      showToast('Deadline notification preferences saved')
    })
  }
  const toggleNotifSessions = $('#toggle-notif-sessions')
  if (toggleNotifSessions) {
    toggleNotifSessions.addEventListener('click', () => {
      toggleNotifSessions.classList.toggle('on')
      store.updateSettings({ notifSessions: toggleNotifSessions.classList.contains('on') })
      showToast('Session reminder preferences saved')
    })
  }
  const toggleNotifAnnouncements = $('#toggle-notif-announcements')
  if (toggleNotifAnnouncements) {
    toggleNotifAnnouncements.addEventListener('click', () => {
      toggleNotifAnnouncements.classList.toggle('on')
      store.updateSettings({ notifAnnouncements: toggleNotifAnnouncements.classList.contains('on') })
      showToast('Announcement preferences saved')
    })
  }

  const btnToggleThemePage = $('#btn-toggle-theme-page')
  if (btnToggleThemePage) {
    btnToggleThemePage.addEventListener('click', toggleTheme)
  }

  const btnTriggerResetDemo = $('#btn-trigger-reset-demo')
  if (btnTriggerResetDemo) {
    btnTriggerResetDemo.addEventListener('click', () => {
      openModal('confirm_reset', {
        onConfirm: () => {
          store.resetAll()
          showToast('Demo data restored to factory defaults')
          renderCurrentPage()
          renderNavigation()
        }
      })
    })
  }

  // Export report
  const btnExport = $('#btn-export-report')
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      exportReportSummary()
    })
  }

  // Generic modal openers
  document.querySelectorAll('[data-modal]').forEach((btn) => {
    btn.addEventListener('click', () => openModal(btn.dataset.modal))
  })
}

/* ═══════════════════════════════════════════════════════════
   EXPORT REPORT
   ═══════════════════════════════════════════════════════════ */
function exportReportSummary() {
  const syllabus = store.getOverallSyllabusStats()
  const att = store.getStudentAttendanceStats(state.user.email)
  const reportText = `
HCL TRAINING HUB — PERFORMANCE SUMMARY
Programme: Java Full Stack Training Programme (Batch 01)
Simulated Date: 13 October 2026
User: ${state.user.name} (${state.user.role.toUpperCase()})
-----------------------------------------------------------
Syllabus Topics Completed: ${syllabus.completedTopics} of ${syllabus.totalTopics} (${syllabus.overallProgress}%)
Attendance Rate: ${att.pct}% (${att.present} Present / ${att.total} Training Sessions)
Assessment Average: 90%
Status: In Good Standing
-----------------------------------------------------------
Generated from HCL Training Hub Local State Engine.
`.trim()

  const blob = new Blob([reportText], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `HCL_Training_Report_${state.user.role}_20261013.txt`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  showToast('Performance summary downloaded successfully')
}

/* ═══════════════════════════════════════════════════════════
   MODAL CONTROLLER
   ═══════════════════════════════════════════════════════════ */
function openModal(type, data = {}) {
  const content = modalContent(type, data, state.user?.role)
  $('#modal-title').textContent = content.title
  $('#modal-body').innerHTML = content.body
  $('#modal-footer').innerHTML = content.footer
  $('#modal-overlay').classList.remove('hidden')
  refreshIcons()

  // Modal Cancel
  const cancelBtn = $('#modal-cancel')
  if (cancelBtn) cancelBtn.addEventListener('click', closeModal)

  // Modal Submit
  const submitBtn = $('#modal-submit')
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      e.preventDefault()
      handleModalSubmission(type, data)
    })
  }

  // Practical lab modal toggle
  const labModalToggle = document.querySelector('[data-toggle-lab-modal]')
  if (labModalToggle) {
    labModalToggle.addEventListener('click', () => {
      const labId = labModalToggle.dataset.toggleLabModal
      const updated = store.toggleLabStatus(labId)
      if (updated) {
        showToast(`Lab status updated to ${updated.status}`)
        closeModal()
        renderCurrentPage()
      }
    })
  }
}

function handleModalSubmission(type, originalData) {
  switch (type) {
    case 'task': {
      const title = $('#task-m-title')?.value.trim()
      const desc = $('#task-m-desc')?.value.trim()
      const priority = $('#task-m-priority')?.value
      const tag = $('#task-m-tag')?.value
      const due = $('#task-m-due')?.value
      const column = $('#task-m-col')?.value

      if (!title) {
        showToast('Please provide a task title')
        return
      }

      if (originalData.id) {
        store.updateTask(originalData.id, { title, description: desc, priority, tag, due, column })
        showToast('Task updated successfully')
      } else {
        store.addTask({ title, description: desc, priority, tag, due, column })
        showToast('Task created successfully')
      }
      closeModal()
      renderCurrentPage()
      break
    }

    case 'assignment_submit': {
      const asgId = $('#asg-select')?.value
      const url = $('#asg-url')?.value.trim()
      const notes = $('#asg-notes')?.value.trim()

      if (!url) {
        showToast('Please enter your project or repo link')
        return
      }

      store.submitAssignment(asgId, { submissionUrl: url, submissionNotes: notes })
      showToast('Assignment submitted successfully')
      closeModal()
      renderCurrentPage()
      renderNavigation()
      break
    }

    case 'assignment_create': {
      const title = $('#asg-title')?.value.trim()
      const moduleName = $('#asg-module')?.value
      const due = $('#asg-due')?.value
      const points = $('#asg-points')?.value.trim() || '20 pts'
      const type = $('#asg-type')?.value

      if (!title) {
        showToast('Please enter an assignment title')
        return
      }

      store.addAssignment({ title, module: moduleName, due, points, type })
      showToast('New assignment created')
      closeModal()
      renderCurrentPage()
      renderNavigation()
      break
    }

    case 'assignment_grade': {
      const grade = $('#grade-score')?.value.trim()
      const feedback = $('#grade-feedback')?.value.trim()
      const status = $('#grade-status')?.value

      if (!grade) {
        showToast('Please award a score')
        return
      }

      store.gradeAssignment(originalData.id, { grade, feedback, status })
      showToast('Evaluation recorded')
      closeModal()
      renderCurrentPage()
      renderNavigation()
      break
    }

    case 'schedule_create': {
      const title = $('#sch-title')?.value.trim()
      const day = $('#sch-day')?.value
      const time = $('#sch-time')?.value
      const trainer = $('#sch-trainer')?.value.trim()
      const room = $('#sch-room')?.value.trim()

      if (!title) {
        showToast('Please specify session title')
        return
      }

      const dateMap = { Mon: '12 Oct', Tue: '13 Oct', Wed: '14 Oct', Thu: '15 Oct', Fri: '16 Oct' }
      store.addScheduleSession({
        title,
        day,
        date: dateMap[day] || '13 Oct',
        time,
        trainer,
        room,
        tone: 'green'
      })
      showToast('Timetable session added')
      closeModal()
      renderCurrentPage()
      break
    }

    case 'assessment_grade': {
      const asmName = $('#asm-sel')?.value
      const score = $('#asm-score')?.value.trim()
      const percent = Number($('#asm-pct')?.value)
      const status = $('#asm-status')?.value
      const feedback = $('#asm-feedback')?.value.trim()

      store.updateAssessment(asmName, { score, percent, status, feedback })
      showToast(`Assessment results updated for ${asmName}`)
      closeModal()
      renderCurrentPage()
      break
    }

    case 'lab_create': {
      const title = $('#lab-title')?.value.trim()
      const moduleName = $('#lab-module')?.value
      const estimatedHours = $('#lab-hrs')?.value.trim()
      const instructions = $('#lab-inst')?.value.trim()

      if (!title) {
        showToast('Please enter a lab title')
        return
      }

      store.addLab({ title, module: moduleName, estimatedHours, instructions })
      showToast('Practical lab added')
      closeModal()
      renderCurrentPage()
      break
    }

    case 'resource_create': {
      const title = $('#res-title')?.value.trim()
      const type = $('#res-type')?.value
      const moduleName = $('#res-module')?.value
      const url = $('#res-url')?.value.trim()

      if (!title) {
        showToast('Please provide a resource title')
        return
      }

      store.addResource({ title, type, module: moduleName, url })
      showToast('Resource added to knowledge centre')
      closeModal()
      renderCurrentPage()
      break
    }

    case 'user_create': {
      const name = $('#user-m-name')?.value.trim()
      const role = $('#user-m-role')?.value
      const email = $('#user-m-email')?.value.trim()
      const batch = $('#user-m-batch')?.value.trim()

      if (!name || !email) {
        showModalError('Please fill in both full name and email address.')
        return
      }

      try {
        store.addUser({ name, role, email, batch })
        showToast(`User ${name} created successfully`)
        closeModal()
        renderCurrentPage()
      } catch (err) {
        showModalError(err.message)
      }
      break
    }

    case 'user_edit': {
      const name = $('#user-edit-name')?.value.trim()
      const role = $('#user-edit-role')?.value
      const email = $('#user-edit-email')?.value.trim()
      const batch = $('#user-edit-batch')?.value.trim()

      if (!name) {
        showModalError('Please specify the user\'s full name.')
        return
      }

      try {
        store.updateUser(originalData.id, {
          name,
          role,
          email: email || originalData.email,
          batch
        })
        showToast(`User ${name} updated successfully`)
        closeModal()
        renderCurrentPage()
      } catch (err) {
        const errBox = $('#user-edit-error')
        const errMsg = $('#user-edit-error-msg')
        if (errBox && errMsg) {
          errMsg.textContent = err.message
          errBox.classList.remove('hidden')
        } else {
          showToast(err.message)
        }
      }
      break
    }

    case 'confirm_delete': {
      if (typeof originalData.onConfirm === 'function') {
        originalData.onConfirm()
      }
      closeModal()
      break
    }

    case 'confirm_reset': {
      if (typeof originalData.onConfirm === 'function') {
        originalData.onConfirm()
      }
      closeModal()
      break
    }

    default: {
      closeModal()
      break
    }
  }
}

function showModalError(msg) {
  const errBox = $('#user-m-error')
  const errMsg = $('#user-m-error-msg')
  if (errBox && errMsg) {
    errMsg.textContent = msg
    errBox.classList.remove('hidden')
  } else {
    showToast(msg)
  }
}

function closeModal() {
  $('#modal-overlay').classList.add('hidden')
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL EVENTS
   ═══════════════════════════════════════════════════════════ */
function bindGlobalEvents() {
  // Sign out
  $('#logout-btn').addEventListener('click', () => {
    clearSession()
    state.user = null
    state.page = null
    $('#app-shell').classList.add('hidden')
    $('#login-screen').classList.remove('hidden')
    $('#login-form').reset()
    showToast('Signed out of the demo')
  })

  // Responsive sidebar
  $('#sidebar-toggle').addEventListener('click', () => {
    $('#sidebar').classList.add('open')
    $('#sidebar-overlay').classList.remove('hidden')
  })
  $('#sidebar-close').addEventListener('click', closeSidebar)
  $('#sidebar-overlay').addEventListener('click', closeSidebar)

  // Theme toggle
  $('#theme-toggle').addEventListener('click', toggleTheme)

  // Notifications
  $('#notif-btn').addEventListener('click', () => {
    showToast('Notifications: Streams API Lab at 14:00 · Assessment 1 passed')
  })

  // Modal backdrop click
  $('#modal-close').addEventListener('click', closeModal)
  $('#modal-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'modal-overlay') closeModal()
  })

  // Keyboard shortcut ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!$('#modal-overlay').classList.contains('hidden')) {
        closeModal()
      } else if ($('#sidebar').classList.contains('open')) {
        closeSidebar()
      }
    }
  })
}

function closeSidebar() {
  $('#sidebar').classList.remove('open')
  $('#sidebar-overlay').classList.add('hidden')
}

/* ═══════════════════════════════════════════════════════════
   TOAST NOTIFICATION
   ═══════════════════════════════════════════════════════════ */
export function showToast(message) {
  const container = $('#toast-container')
  if (!container) return
  const toast = document.createElement('div')
  toast.className = 'toast'
  toast.innerHTML = `${icon('check-circle-2', 'icon-sm')}<span>${escapeHtml(message)}</span>`
  container.appendChild(toast)
  refreshIcons()
  window.setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateY(4px)'
    toast.style.transition = 'all 180ms ease'
    window.setTimeout(() => toast.remove(), 200)
  }, 3200)
}

function refreshIcons() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons()
  }
}

// Initialise application
init()
