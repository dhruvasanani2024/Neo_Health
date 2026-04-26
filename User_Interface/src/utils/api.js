// ─── NeoHealth User Interface API Client ────────────────────────────────────
// All API calls go through this centralized module.
// In dev: Vite proxy forwards /api/* → http://localhost:2873/api/*
// In prod: VITE_API_URL points to the deployed backend

const BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1'

// ── helpers ─────────────────────────────────────────────────────────────────

/**
 * Wrapper around fetch that:
 *  - Includes credentials (cookies) by default
 *  - Attaches Authorization header from localStorage if present
 *  - Returns the parsed JSON body
 *  - Throws on non-2xx responses with a nice error message
 */
async function request(path, options = {}) {
    const token = localStorage.getItem('userAccessToken')

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    }

    const res = await fetch(`${BASE}${path}`, {
        credentials: 'include',
        ...options,
        headers,
    })

    let data
    try {
        data = await res.json()
    } catch {
        data = {}
    }

    if (!res.ok) {
        const err = new Error(data?.message || `Request failed: ${res.status}`)
        err.status = res.status
        err.data = data
        throw err
    }

    return data
}

function post(path, body, options = {}) {
    return request(path, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options,
    })
}

function patch(path, body, options = {}) {
    return request(path, {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...options,
    })
}

function get(path, options = {}) {
    return request(path, { method: 'GET', ...options })
}

// ── Auth token helpers ───────────────────────────────────────────────────────

export function saveUserSession(data) {
    if (data.accessToken) localStorage.setItem('userAccessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('userRefreshToken', data.refreshToken)
}

export function clearUserSession() {
    localStorage.removeItem('userAccessToken')
    localStorage.removeItem('userRefreshToken')
}

export function getUserToken() {
    return localStorage.getItem('userAccessToken')
}

// ── User Auth API ────────────────────────────────────────────────────────────

export async function apiRegisterUser({ fullname, email, password, phone }) {
    const data = await post('/users/register', { fullname, email, password, phone })
    if (data.data) saveUserSession(data.data)
    return data.data
}

export async function apiLoginUser({ email, password }) {
    const data = await post('/users/login', { email, password })
    if (data.data) saveUserSession(data.data)
    return data.data
}

export async function apiLogoutUser() {
    await post('/users/logout', {})
    clearUserSession()
}

export async function apiGetUserProfile() {
    const data = await get('/users/profile')
    return data.data
}

// ── Hospitals API ────────────────────────────────────────────────────────────

export async function apiGetAllHospitals() {
    const data = await get('/hospitals')
    return data.data
}

export async function apiGetHospitalById(id) {
    const data = await get(`/hospitals/${id}`)
    return data.data
}

// ── Doctors API ──────────────────────────────────────────────────────────────

export async function apiGetDoctorsByHospital(hospitalId) {
    const data = await get(`/doctors/hospital/${hospitalId}`)
    return data.data
}

// ── Bookings API ─────────────────────────────────────────────────────────────

export async function apiCreateBooking({
    doctorId, hospitalId, slotTime, appointmentType,
    patientType, patientName, fee, date
}) {
    const data = await post('/bookings', {
        doctorId, hospitalId, slotTime, appointmentType,
        patientType, patientName, fee, date
    })
    return data.data
}

export async function apiGetUserBookings() {
    const data = await get('/bookings/my')
    return data.data
}

export async function apiCancelBooking(bookingId) {
    const data = await patch(`/bookings/${bookingId}/cancel`, {})
    return data.data
}

// ── Healix Chatbot API ──────────────────────────────────────────────────────

export async function apiSendChatMessage(message, sessionId) {
    const data = await post('/chat', { message, sessionId })
    return data.data
}

export async function apiClearChat(sessionId) {
    return post('/chat/clear', { sessionId })
}

// ── Health check ─────────────────────────────────────────────────────────────

export async function apiPing() {
    const data = await get('/ping')
    return data
}
