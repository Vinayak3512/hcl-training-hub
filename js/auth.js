import { demoUsers } from './data.js'
import { store } from './store.js'

const SESSION_KEY = 'hcl_training_hub_session_v2'

/**
 * Validates credentials and creates a session object
 */
export function authenticate(email, password) {
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPass = (password || '').trim()

  const user = Object.values(demoUsers).find(
    (u) => u.email.toLowerCase() === cleanEmail && u.password === cleanPass
  )

  if (!user) {
    return { success: false, error: 'Invalid credentials. Please select or enter a valid demo account.' }
  }

  // Find user details in store (or fall back to demoUsers)
  const allUsers = store.getUsers()
  const detailedUser = allUsers.find((u) => u.email.toLowerCase() === cleanEmail) || user

  const session = {
    email: detailedUser.email,
    role: detailedUser.role,
    name: detailedUser.name,
    initials: detailedUser.initials,
    title: detailedUser.title,
    token: `demo-tok-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    loginTime: new Date().toISOString()
  }

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    // Also remove legacy single string key if present
    localStorage.removeItem('hcl-demo-role')
  } catch (err) {
    console.error('Failed to persist session:', err)
  }

  return { success: true, user: session }
}

/**
 * Retrieves the current session safely. Returns null if invalid or missing.
 */
export function getCurrentSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (!session || !session.email || !session.role || !session.token) {
      clearSession()
      return null
    }

    // Verify role is one of valid roles
    if (!['student', 'trainer', 'admin'].includes(session.role)) {
      clearSession()
      return null
    }

    // Verify user still exists in directory
    const existing = store.getUsers().find((u) => u.email.toLowerCase() === session.email.toLowerCase())
    if (!existing) {
      clearSession()
      return null
    }

    // Return synced user session
    return {
      ...session,
      name: existing.name,
      initials: existing.initials,
      role: existing.role,
      title: existing.title
    }
  } catch (err) {
    console.warn('Corrupted session in localStorage. Clearing:', err)
    clearSession()
    return null
  }
}

/**
 * Clears session
 */
export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('hcl-demo-role')
  } catch (err) {
    console.error('Error clearing session:', err)
  }
}

/**
 * Centralized Permission System
 *
 * NOTE FOR AUDITORS:
 * This authorization system is implemented on the client for demonstration and simulated ERP testing.
 * In a real production deployment, all permissions, roles and tokens must be verified independently
 * on the backend application server on every request.
 */
const ROLE_PERMISSIONS = {
  student: [
    'view_student_dashboard',
    'view_syllabus',
    'toggle_topic_completion',
    'view_assignments',
    'submit_assignment',
    'manage_personal_tasks',
    'view_labs',
    'update_personal_lab_progress',
    'view_resources',
    'view_schedule',
    'view_own_attendance',
    'view_own_assessments',
    'view_student_reports',
    'edit_personal_settings'
  ],
  trainer: [
    'view_trainer_dashboard',
    'view_assignments',
    'create_assignment',
    'grade_assignment',
    'manage_labs',
    'manage_resources',
    'mark_cohort_attendance',
    'manage_assessment_results',
    'manage_schedule',
    'view_cohort_reports',
    'edit_personal_settings'
  ],
  admin: [
    'view_admin_dashboard',
    'view_programme_reports',
    'manage_users',
    'manage_assessments',
    'manage_schedule',
    'manage_programme_settings',
    'reset_demo_data',
    'edit_personal_settings'
  ]
}

const ALLOWED_PAGES_BY_ROLE = {
  student: [
    'dashboard',
    'syllabus',
    'assignments',
    'tasks',
    'labs',
    'resources',
    'schedule',
    'attendance',
    'assessments',
    'reports',
    'settings'
  ],
  trainer: [
    'trainer-dashboard',
    'syllabus',
    'assignments',
    'labs',
    'resources',
    'attendance',
    'schedule',
    'assessments',
    'reports',
    'settings'
  ],
  admin: [
    'admin-dashboard',
    'syllabus',
    'reports',
    'assessments',
    'schedule',
    'users',
    'settings'
  ]
}

/**
 * Check if the given role has the specified permission
 */
export function can(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) return false
  return ROLE_PERMISSIONS[role].includes(permission)
}

/**
 * Check if the given role is allowed to view the requested page
 */
export function canAccessPage(role, page) {
  if (!role || !ALLOWED_PAGES_BY_ROLE[role]) return false
  return ALLOWED_PAGES_BY_ROLE[role].includes(page)
}

/**
 * Returns default home page for the role
 */
export function getDefaultPageForRole(role) {
  switch (role) {
    case 'trainer': return 'trainer-dashboard'
    case 'admin': return 'admin-dashboard'
    default: return 'dashboard'
  }
}
