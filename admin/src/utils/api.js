// ─── NeoHealth Admin API Client ──────────────────────────────────────────────
// All API calls from the Admin panel go through this module.
// In dev: Vite proxy forwards /api/* → http://localhost:2873/api/*
// In prod: VITE_API_URL points to the deployed backend

const BASE = import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api/v1`
    : '/api/v1'

// ── helpers ──────────────────────────────────────────────────────────────────

async function request(path, options = {}) {
    const token = localStorage.getItem('adminAccessToken')

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

// ── Token storage helpers ─────────────────────────────────────────────────────

export function saveHospitalSession(data) {
    if (data.accessToken) localStorage.setItem('adminAccessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('adminRefreshToken', data.refreshToken)
    if (data.hospital) localStorage.setItem('adminHospitalId', data.hospital._id)
}

export function saveDoctorSession(data) {
    if (data.accessToken) localStorage.setItem('adminAccessToken', data.accessToken)
    if (data.refreshToken) localStorage.setItem('adminRefreshToken', data.refreshToken)
}

export function clearAdminSession() {
    localStorage.removeItem('adminAccessToken')
    localStorage.removeItem('adminRefreshToken')
    localStorage.removeItem('adminHospitalId')
}

export function getAdminToken() {
    return localStorage.getItem('adminAccessToken')
}

// ── Hospital Auth API ─────────────────────────────────────────────────────────

export async function apiRegisterHospital({
    hospital_name, address, phone_number, specialities,
    admin_email, password, confirm_password,
    accreditations, facilities, insurancePartners, workingHours
}) {
    const data = await post('/hospitals/register', {
        hospital_name, address, phone_number, specialities,
        admin_email, password, confirm_password,
        accreditations, facilities, insurancePartners, workingHours
    })
    if (data.data) saveHospitalSession(data.data)
    return data.data
}

export async function apiLoginHospital({ admin_email, password }) {
    const data = await post('/hospitals/login', { admin_email, password })
    if (data.data) saveHospitalSession(data.data)
    return data.data
}

export async function apiLogoutHospital() {
    await post('/hospitals/logout', {})
    clearAdminSession()
}

export async function apiGetHospitalProfile() {
    const data = await get('/hospitals/profile')
    return data.data
}

export async function apiUpdateHospitalSettings(updateData) {
    const data = await patch('/hospitals/settings', updateData)
    return data.data
}

// ── Doctor Auth API ───────────────────────────────────────────────────────────

export async function apiLoginDoctor({ email, password }) {
    const data = await post('/doctors/login', { email, password })
    if (data.data) saveDoctorSession(data.data)
    return data.data
}

export async function apiLogoutDoctor() {
    await post('/doctors/logout', {})
    clearAdminSession()
}

export async function apiGetDoctorProfile() {
    const data = await get('/doctors/profile')
    return data.data
}

// ── Doctor Management (Hospital Admin) ───────────────────────────────────────

export async function apiAddDoctor({
    name, email, password, specialty, qualification, experience,
    fee, virtualFee, offersVirtual, languages, education, about, slots, available
}) {
    const data = await post('/doctors/add', {
        name, email, password, specialty, qualification, experience,
        fee, virtualFee, offersVirtual, languages, education, about, slots, available
    })
    return data.data
}

export async function apiUpdateDoctorSlotsByHospital(doctorId, { slots, virtualSlots, available }) {
    const data = await patch(`/doctors/slots/${doctorId}`, { slots, virtualSlots, available })
    return data.data
}

export async function apiUpdateDoctorSlots({ slots, virtualSlots, available }) {
    const data = await patch('/doctors/slots', { slots, virtualSlots, available })
    return data.data
}

// ── Hospital Bookings API ─────────────────────────────────────────────────────

export async function apiGetHospitalBookings() {
    const data = await get('/bookings/hospital')
    return data.data
}

export async function apiUpdateHospitalBooking(bookingId, { status, prescription }) {
    const data = await patch(`/bookings/hospital/${bookingId}`, { status, prescription })
    return data.data
}

// ── Doctor Bookings API ───────────────────────────────────────────────────────

export async function apiGetDoctorBookings() {
    const data = await get('/bookings/doctor')
    return data.data
}

export async function apiUpdateDoctorBooking(bookingId, { status, prescription }) {
    const data = await patch(`/bookings/doctor/${bookingId}`, { status, prescription })
    return data.data
}

// ── Public APIs ──────────────────────────────────────────────────────────────

export async function apiGetAllHospitals() {
    const data = await get('/hospitals')
    return data.data
}

export async function apiGetHospitalById(id) {
    const data = await get(`/hospitals/${id}`)
    return data.data
}

export async function apiGetDoctorsByHospital(hospitalId) {
    const data = await get(`/doctors/hospital/${hospitalId}`)
    return data.data
}

// ── Health check ─────────────────────────────────────────────────────────────

export async function apiPing() {
    return get('/ping')
}
