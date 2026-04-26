import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import AdminAuthPage from './pages/AdminAuthPage'
import DoctorDashboard from './pages/DoctorDashboard'
import AdminDashboard from './pages/AdminDashboard'
import {
    apiGetHospitalProfile,
    apiGetDoctorProfile,
    apiGetHospitalBookings,
    apiGetDoctorBookings,
    apiLogoutHospital,
    apiLogoutDoctor,
    getAdminToken,
    clearAdminSession,
} from './utils/api'

export default function App() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])

    // Doctor/Hospital admin session
    const [doctorSession, setDoctorSession] = useState(null) // { doctor, hospital }
    const [hospitalSession, setHospitalSession] = useState(null) // { hospital }

    const [sessionLoading, setSessionLoading] = useState(true)

    // ── Restore session from localStorage token on page refresh ──────────────
    useEffect(() => {
        const token = getAdminToken()
        if (!token) {
            setSessionLoading(false)
            return
        }

        // Try hospital profile first, then doctor
        const tryRestore = async () => {
            try {
                const hospitalData = await apiGetHospitalProfile()
                if (hospitalData) {
                    setHospitalSession({ hospital: normalizeHospital(hospitalData) })
                    // Fetch bookings
                    const bData = await apiGetHospitalBookings().catch(() => [])
                    if (Array.isArray(bData)) setBookings(bData)
                    return
                }
            } catch { /* not a hospital token */ }

            try {
                const doctorData = await apiGetDoctorProfile()
                if (doctorData) {
                    setDoctorSession({
                        doctor: doctorData,
                        hospital: normalizeHospital(doctorData.hospital),
                    })
                    const bData = await apiGetDoctorBookings().catch(() => [])
                    if (Array.isArray(bData)) setBookings(bData)
                }
            } catch { /* not a doctor token either */ }
        }

        tryRestore().finally(() => setSessionLoading(false))
    }, [])

    // normalize hospital from backend → frontend shape
    function normalizeHospital(h) {
        if (!h) return null
        return {
            _id: h._id,
            id: h._id || h.id,
            name: h.hospital_name || h.name,
            hospital_name: h.hospital_name || h.name,
            image: h.hospital_image || h.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop',
            hospital_image: h.hospital_image || h.image,
            rating: h.rating || 4.0,
            totalRatings: h.totalRatings || 0,
            specialty: h.specialities?.[0] || h.specialty || 'General',
            specialties: h.specialities || h.specialties || [],
            specialities: h.specialities || h.specialties || [],
            address: h.address || '',
            phone: h.phone_number || h.phone || '',
            phone_number: h.phone_number || h.phone || '',
            adminEmail: h.admin_email || h.adminEmail || '',
            admin_email: h.admin_email || h.adminEmail || '',
            promoted: h.promoted || false,
            openNow: h.openNow !== undefined ? h.openNow : true,
            accreditations: h.accreditations || [],
            facilities: h.facilities || [],
            insurancePartners: h.insurancePartners || [],
            workingHours: h.workingHours instanceof Map
                ? Object.fromEntries(h.workingHours)
                : (h.workingHours || {}),
            reviews: h.reviews || [],
            doctors: (h.doctors || []).map(d => ({
                ...d,
                id: d._id || d.id,
            })),
        }
    }

    // Doctor login handler
    const handleDoctorLogin = useCallback((session) => {
        // session = { doctor, hospital, accessToken, refreshToken }
        setDoctorSession({
            doctor: session.doctor,
            hospital: normalizeHospital(session.hospital),
        })
        navigate('/doctor')
        // Fetch doctor bookings
        apiGetDoctorBookings()
            .then(data => { if (Array.isArray(data)) setBookings(data) })
            .catch(() => { })
    }, [navigate])

    const handleDoctorLogout = useCallback(async () => {
        try { await apiLogoutDoctor() } catch { clearAdminSession() }
        setDoctorSession(null)
        setBookings([])
        navigate('/')
    }, [navigate])

    // Hospital login handler
    const handleHospitalLogin = useCallback((session) => {
        // session = { hospital, accessToken, refreshToken }
        setHospitalSession({ hospital: normalizeHospital(session.hospital) })
        navigate('/dashboard')
        // Fetch hospital bookings
        apiGetHospitalBookings()
            .then(data => { if (Array.isArray(data)) setBookings(data) })
            .catch(() => { })
    }, [navigate])

    const handleHospitalRegister = useCallback((newHospital) => {
        // newHospital comes from AdminAuthPage after successful API registration
        setHospitalSession({ hospital: normalizeHospital(newHospital) })
        navigate('/dashboard')
    }, [navigate])

    const handleHospitalLogout = useCallback(async () => {
        try { await apiLogoutHospital() } catch { clearAdminSession() }
        setHospitalSession(null)
        setBookings([])
        navigate('/')
    }, [navigate])

    // Prescription handler
    const handleAddPrescription = useCallback((prescription) => {
        console.log('Prescription added:', prescription)
    }, [])

    // Refresh bookings (called from dashboards after status changes)
    const handleRefreshHospitalBookings = useCallback(() => {
        apiGetHospitalBookings()
            .then(data => { if (Array.isArray(data)) setBookings(data) })
            .catch(() => { })
    }, [])

    const handleRefreshDoctorBookings = useCallback(() => {
        apiGetDoctorBookings()
            .then(data => { if (Array.isArray(data)) setBookings(data) })
            .catch(() => { })
    }, [])

    if (sessionLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-white text-2xl font-black">N</span>
                    </div>
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                </div>
            </div>
        )
    }

    return (
        <Routes>
            <Route path="/" element={
                (doctorSession || hospitalSession)
                    ? <Navigate to={doctorSession ? '/doctor' : '/dashboard'} replace />
                    : <AdminAuthPage
                        onDoctorLogin={handleDoctorLogin}
                        onHospitalLogin={handleHospitalLogin}
                        onHospitalRegister={handleHospitalRegister}
                        onBack={() => { }}
                    />
            } />
            <Route path="/doctor" element={
                doctorSession
                    ? <DoctorDashboard
                        doctor={doctorSession.doctor}
                        hospital={doctorSession.hospital}
                        bookings={bookings}
                        onLogout={handleDoctorLogout}
                        onAddPrescription={handleAddPrescription}
                        onRefreshBookings={handleRefreshDoctorBookings}
                    />
                    : <Navigate to="/" replace />
            } />
            <Route path="/dashboard" element={
                hospitalSession
                    ? <AdminDashboard
                        hospital={hospitalSession.hospital}
                        bookings={bookings}
                        onLogout={handleHospitalLogout}
                        onRefreshBookings={handleRefreshHospitalBookings}
                        onHospitalUpdate={(updatedHospital) => {
                            setHospitalSession({ hospital: normalizeHospital(updatedHospital) })
                        }}
                    />
                    : <Navigate to="/" replace />
            } />
        </Routes>
    )
}
