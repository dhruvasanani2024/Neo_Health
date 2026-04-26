import { useState, useCallback, useEffect } from 'react'
import { Routes, Route, useNavigate, useParams } from 'react-router-dom'
import Navbar from './components/Navbar'
import SignInModal from './components/SignInModal'
import HomePage from './pages/HomePage'
import HospitalDetailPage from './pages/HospitalDetailPage'
import PharmacyPage from './pages/PharmacyPage'
import MyBookingsPage from './pages/MyBookingsPage'
import ProfilePage from './pages/ProfilePage'
import BookingConfirmationModal from './components/BookingConfirmationModal'
import EmergencySOS from './components/EmergencySOS'
import HealixChatbot from './components/HealixChatbot'
import {
    apiGetAllHospitals,
    apiGetUserBookings,
    apiCreateBooking,
    apiCancelBooking,
    apiLogoutUser,
    apiGetUserProfile,
    getUserToken,
} from './utils/api'
import { hospitals as mockHospitals } from './data/mockData'

// ── normalize hospital data coming from the backend into the same shape
// as our frontend mock data so existing components work without changes
function normalizeHospital(h) {
    return {
        // Core identity
        _id: h._id,
        id: h._id || h.id,

        // Display fields
        name: h.hospital_name || h.name,
        image: h.hospital_image || h.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop',
        rating: h.rating || 4.0,
        totalRatings: h.totalRatings || 0,
        specialty: h.specialities?.[0] || h.specialty || 'General',
        specialties: h.specialities || h.specialties || [],
        address: h.address || '',
        distance: h.distance || '—',
        distanceValue: parseFloat(h.distance) || 99,
        estimatedTime: h.estimatedTime || '—',
        promoted: h.promoted || false,
        openNow: h.openNow !== undefined ? h.openNow : true,
        phone_number: h.phone_number || h.phone || '',
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

// normalize booking from backend
function normalizeBooking(b) {
    return {
        id: b._id || b.id,
        _id: b._id,
        slotTime: b.slotTime,
        patientType: b.patientType || 'normal',
        patientName: b.patientName,
        appointmentType: b.appointmentType || 'in-person',
        fee: b.fee,
        date: b.date,
        status: b.status || 'upcoming',
        cancelled: b.status === 'cancelled',
        completed: b.status === 'completed',
        bookedAt: b.createdAt || new Date().toISOString(),
        doctorId: b.doctor?._id || b.doctor,
        hospitalId: b.hospital?._id || b.hospital,
        doctor: b.doctor?.name || '',
        doctorImage: b.doctor?.image || '',
        specialty: b.doctor?.specialty || '',
        hospital: b.hospital?.hospital_name || b.hospital?.name || '',
        prescription: b.prescription || [],
    }
}

export default function App() {
    const navigate = useNavigate()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedHospital, setSelectedHospital] = useState(null)
    const [bookings, setBookings] = useState([])
    const [user, setUser] = useState(null)
    const [showSignIn, setShowSignIn] = useState(false)
    const [hospitals, setHospitals] = useState([])
    const [hospitalsLoading, setHospitalsLoading] = useState(true)
    const [backendOnline, setBackendOnline] = useState(false)

    // Confirmation modal state
    const [confirmationBooking, setConfirmationBooking] = useState(null)

    // Pharmacy state
    const [userMedications, setUserMedications] = useState([])
    const [prescriptions, setPrescriptions] = useState([])
    const [pharmacyCart, setPharmacyCart] = useState([])

    // ── Fetch hospitals from backend (fallback to mock data) ─────────────────
    useEffect(() => {
        const loadHospitals = async () => {
            setHospitalsLoading(true)
            try {
                const data = await apiGetAllHospitals()
                if (Array.isArray(data) && data.length > 0) {
                    setHospitals(data.map(normalizeHospital))
                    setBackendOnline(true)
                } else {
                    // Backend returned empty — use mock + set as not connected
                    setHospitals(mockHospitals)
                    setBackendOnline(false)
                }
            } catch {
                // Backend not reachable — fall back to mock data
                setHospitals(mockHospitals)
                setBackendOnline(false)
            } finally {
                setHospitalsLoading(false)
            }
        }
        loadHospitals()
    }, [])

    // ── Auto-login from stored token ─────────────────────────────────────────
    useEffect(() => {
        const token = getUserToken()
        if (!token) return
        apiGetUserProfile()
            .then(u => {
                if (u) setUser({
                    _id: u._id,
                    name: u.fullname || u.email?.split('@')[0],
                    fullname: u.fullname,
                    email: u.email,
                    phone: u.phone,
                    avatar: u.avatar,
                })
            })
            .catch(() => { /* token expired, ignore */ })
    }, [])

    // ── Fetch user bookings when logged in ───────────────────────────────────
    useEffect(() => {
        if (!user || !backendOnline) return
        apiGetUserBookings()
            .then(data => {
                if (Array.isArray(data)) setBookings(data.map(normalizeBooking))
            })
            .catch(() => { /* ignore */ })
    }, [user, backendOnline])

    const handleHospitalSelect = useCallback((hospital) => {
        setSelectedHospital(hospital)
        navigate(`/hospital/${hospital._id || hospital.id}`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [navigate])

    const handleBack = useCallback(() => {
        setSelectedHospital(null)
        navigate('/')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [navigate])

    const handleBook = useCallback(async (doctor, slot, patientType, patientName, appointmentType, fee, bookingDate) => {
        const date = bookingDate || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

        if (backendOnline && user?._id) {
            try {
                const booking = await apiCreateBooking({
                    doctorId: doctor._id || doctor.id,
                    hospitalId: selectedHospital?._id || selectedHospital?.id,
                    slotTime: slot,
                    appointmentType: appointmentType || 'in-person',
                    patientType: patientType || 'normal',
                    patientName: patientName || user.fullname || user.name || 'Patient',
                    fee: fee || doctor.fee,
                    date,
                })
                const normalized = normalizeBooking(booking)
                setBookings(prev => [normalized, ...prev])
                return normalized
            } catch (err) {
                console.warn('Booking API failed, falling back to local state:', err.message)
            }
        }

        // Fallback to local state (when backend offline or not logged in)
        const newBooking = {
            id: Date.now() + Math.random(),
            slotTime: slot,
            patientType: patientType || 'normal',
            patientName: patientName || user?.name || 'Patient',
            appointmentType: appointmentType || 'in-person',
            fee: fee || doctor.fee,
            bookedAt: new Date().toISOString(),
            doctorId: doctor.id || doctor._id,
            hospitalId: selectedHospital?.id || selectedHospital?._id,
            doctor: doctor.name,
            doctorImage: doctor.image,
            specialty: doctor.specialty,
            hospital: selectedHospital?.name,
            date,
            status: 'upcoming',
            cancelled: false,
        }
        setBookings(prev => [...prev, newBooking])
        return newBooking
    }, [selectedHospital, user, backendOnline])

    // Called from DoctorCard after successful booking — triggers confirmation modal
    const handleBookingComplete = useCallback((bookingData) => {
        setConfirmationBooking(bookingData)
    }, [])

    const handleCancelBooking = useCallback(async (bookingId) => {
        if (backendOnline) {
            try {
                await apiCancelBooking(bookingId)
            } catch (err) {
                console.warn('Cancel API failed:', err.message)
            }
        }
        setBookings(prev => prev.map(b =>
            (b.id === bookingId || b._id === bookingId)
                ? { ...b, cancelled: true, status: 'cancelled' }
                : b
        ))
    }, [backendOnline])

    const handleSignIn = useCallback((userData) => {
        setUser(userData)
        // Fetch bookings after sign-in
        if (backendOnline && userData._id) {
            apiGetUserBookings()
                .then(data => {
                    if (Array.isArray(data)) setBookings(data.map(normalizeBooking))
                })
                .catch(() => { })
        }
    }, [backendOnline])

    const handleSignOut = useCallback(async () => {
        if (backendOnline) {
            try { await apiLogoutUser() } catch { /* ignore */ }
        }
        setUser(null)
        setBookings([])
        navigate('/')
    }, [backendOnline, navigate])

    const goToHome = useCallback(() => {
        navigate('/')
        setSelectedHospital(null)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [navigate])

    // Pharmacy handlers
    const handleAddPrescription = useCallback((prescription) => {
        setPrescriptions(prev => [...prev, {
            ...prescription,
            id: Date.now() + Math.random(),
            issuedDate: new Date().toISOString()
        }])
    }, [])

    const handleAddToCart = useCallback((medication) => {
        setPharmacyCart(prev => {
            const existing = prev.find(item => item.id === medication.id)
            if (existing) {
                return prev.map(item => item.id === medication.id ? { ...item, quantity: item.quantity + 1 } : item)
            }
            return [...prev, { ...medication, quantity: 1 }]
        })
    }, [])

    const handleRemoveFromCart = useCallback((medicationId) => {
        setPharmacyCart(prev => prev.filter(item => item.id !== medicationId))
    }, [])

    const handleCheckout = useCallback(() => {
        if (!user) { alert('Please sign in to complete purchase'); return }
        const newMedications = pharmacyCart.map(item => ({
            id: Date.now() + Math.random(),
            name: item.name,
            dosageForm: item.dosageForm,
            quantity: item.quantity * 30,
            dailyDosage: 2,
            startDate: new Date().toISOString(),
            prescriptionId: prescriptions.find(p => p.medications.some(m => m.name.toLowerCase().includes(item.name.toLowerCase())))?.id,
            doctorName: prescriptions.find(p => p.medications.some(m => m.name.toLowerCase().includes(item.name.toLowerCase())))?.doctorName,
            prescriptionDate: prescriptions.find(p => p.medications.some(m => m.name.toLowerCase().includes(item.name.toLowerCase())))?.issuedDate
        }))
        setUserMedications(prev => [...prev, ...newMedications])
        setPharmacyCart([])
        alert('Purchase successful! Your medications have been added to "My Medications"')
    }, [user, pharmacyCart, prescriptions])

    const handleReorder = useCallback((medication) => {
        const catalogMed = { id: Date.now(), name: medication.name, price: 100, requiresPrescription: true }
        handleAddToCart(catalogMed)
        alert(`${medication.name} added to cart`)
    }, [handleAddToCart])

    const upcomingCount = bookings.filter(b => !b.cancelled && !b.completed && b.status !== 'cancelled' && b.status !== 'completed').length

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Backend status banner */}
            {!backendOnline && !hospitalsLoading && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center">
                    <p className="text-xs text-amber-700 font-medium">
                        ⚡ Demo Mode — Backend not connected. Add MongoDB URI to go live.
                    </p>
                </div>
            )}

            <Navbar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                user={user}
                onSignInClick={() => setShowSignIn(true)}
                onSignOut={handleSignOut}
                onPharmacyClick={() => navigate('/pharmacy')}
                onBookingsClick={() => { navigate('/my-bookings'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                onProfileClick={() => { navigate('/profile'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                refillCount={userMedications.filter(med => {
                    const daysRemaining = Math.floor(
                        (med.quantity / med.dailyDosage) -
                        ((Date.now() - new Date(med.startDate)) / (1000 * 60 * 60 * 24))
                    )
                    return daysRemaining <= 3
                }).length}
                upcomingCount={upcomingCount}
            />

            <SignInModal
                isOpen={showSignIn}
                onClose={() => setShowSignIn(false)}
                onSignIn={handleSignIn}
            />

            <BookingConfirmationModal
                isOpen={!!confirmationBooking}
                booking={confirmationBooking}
                onClose={() => setConfirmationBooking(null)}
                onViewBookings={() => {
                    setConfirmationBooking(null)
                    navigate('/my-bookings')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
            />

            {/* Floating components */}
            <HealixChatbot />
            <EmergencySOS />

            <Routes>
                <Route path="/" element={
                    <HomePage
                        searchQuery={searchQuery}
                        onHospitalSelect={handleHospitalSelect}
                        onPharmacyClick={() => navigate('/pharmacy')}
                        hospitals={hospitals}
                        hospitalsLoading={hospitalsLoading}
                        backendOnline={backendOnline}
                    />
                } />
                <Route path="/hospital/:id" element={
                    <HospitalDetailRoute
                        hospitals={hospitals}
                        selectedHospital={selectedHospital}
                        setSelectedHospital={setSelectedHospital}
                        onBack={handleBack}
                        onBook={handleBook}
                        bookings={bookings}
                        onAddPrescription={handleAddPrescription}
                        onBookingComplete={handleBookingComplete}
                        user={user}
                        onSignInClick={() => setShowSignIn(true)}
                    />
                } />
                <Route path="/pharmacy" element={
                    <PharmacyPage
                        user={user}
                        userMedications={userMedications}
                        prescriptions={prescriptions}
                        cart={pharmacyCart}
                        onAddToCart={handleAddToCart}
                        onRemoveFromCart={handleRemoveFromCart}
                        onCheckout={handleCheckout}
                        onReorder={handleReorder}
                        onBack={goToHome}
                    />
                } />
                <Route path="/my-bookings" element={
                    <MyBookingsPage
                        bookings={bookings}
                        onBack={goToHome}
                        onCancelBooking={handleCancelBooking}
                    />
                } />
                <Route path="/profile" element={
                    <ProfilePage
                        user={user}
                        bookings={bookings}
                        onBack={goToHome}
                    />
                } />
            </Routes>
        </div>
    )
}

// ── Route wrapper for hospital detail page ──────────────────────────────────
// Resolves the hospital from URL params, supporting both navigation-with-state
// and direct URL access (e.g., bookmarked or shared links)
function HospitalDetailRoute({ hospitals, selectedHospital, setSelectedHospital, ...pageProps }) {
    const { id } = useParams()
    const navigate = useNavigate()

    // Prefer selectedHospital if it matches the URL id, otherwise find from list
    const hospital = (selectedHospital && String(selectedHospital._id || selectedHospital.id) === String(id))
        ? selectedHospital
        : hospitals.find(h => String(h._id || h.id) === String(id))

    useEffect(() => {
        if (hospital && !selectedHospital) {
            setSelectedHospital(hospital)
        }
        if (!hospital && hospitals.length > 0) {
            // Hospital not found in list, redirect to home
            navigate('/', { replace: true })
        }
    }, [hospital, hospitals, selectedHospital, setSelectedHospital, navigate])

    if (!hospital) {
        // Still loading hospitals
        return (
            <div className="p-12 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading hospital...</p>
            </div>
        )
    }

    return <HospitalDetailPage hospital={hospital} {...pageProps} />
}
