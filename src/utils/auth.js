// Authentication helper and user role management for Dr. Aqua Dashboard

export const DEFAULT_USERS = [
  {
    id: 'user-admin',
    name: 'Admin Usman',
    email: 'admin@draqua.pk',
    password: 'admin123',
    role: 'admin',
    title: 'Business Owner & Admin',
  },
  {
    id: 'user-cashier',
    name: 'Tariq Cashier',
    email: 'cashier@draqua.pk',
    password: 'cashier123',
    role: 'cashier',
    title: 'Shop POS Cashier',
  },
  {
    id: 'user-tech',
    name: 'Farhan Technician',
    email: 'tech@draqua.pk',
    password: 'tech123',
    role: 'technician',
    title: 'Field Service Technician',
  },
]

export const AUTH_STORAGE_KEY = 'draqua-current-user'
export const USERS_STORAGE_KEY = 'draqua-users'

export function getStoredUsers() {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY)
    if (!raw) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS))
      return DEFAULT_USERS
    }
    return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading users from localStorage', e)
    return DEFAULT_USERS
  }
}

export function authenticate(email, password) {
  const users = getStoredUsers()
  const cleanEmail = (email || '').trim().toLowerCase()
  const cleanPassword = (password || '').trim()

  const match = users.find((u) => {
    const userEmail = u.email.toLowerCase()
    const userPrefix = userEmail.split('@')[0]
    const emailMatches =
      userEmail === cleanEmail ||
      userPrefix === cleanEmail ||
      (u.role === 'technician' && (cleanEmail === 'technician@draqua.pk' || cleanEmail === 'technician'))
    return emailMatches && u.password === cleanPassword
  })

  if (match) {
    const safeUser = {
      id: match.id,
      name: match.name,
      email: match.email,
      role: match.role,
      title: match.title,
    }
    return safeUser
  }
  return null
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.error('Error reading auth state', e)
  }
  return null
}

export function saveCurrentUser(user) {
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
  } else {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
  }
}
