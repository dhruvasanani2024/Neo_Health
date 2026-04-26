import { useState } from 'react'
import {
    ArrowLeft, Stethoscope, Building2, Eye, EyeOff,
    LogIn, UserPlus, ChevronRight, Plus, X, Check
} from 'lucide-react'
import { hospitals as mockHospitals } from '../data/mockData'
import {
    apiLoginDoctor, apiLoginHospital, apiRegisterHospital
} from '../utils/api'

const SPECIALTY_OPTIONS = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics',
    'Dermatology', 'Ophthalmology', 'ENT', 'Dentistry',
    'Gynecology', 'General', 'Oncology', 'Urology',
]

export default function AdminAuthPage({ onDoctorLogin, onHospitalLogin, onHospitalRegister, onBack }) {
    // Step: 'pick-role' | 'doctor-login' | 'hospital-choice' | 'hospital-login' | 'hospital-register'
    const [step, setStep] = useState('pick-role')

    // Login form
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Registration form
    const [regData, setRegData] = useState({
        name: '',
        image: '',
        address: '',
        specialties: [],
        adminEmail: '',
        adminPassword: '',
        confirmPassword: '',
        phone: '',
    })
    const [regError, setRegError] = useState('')
    const [specInput, setSpecInput] = useState('')


    const resetForm = () => {
        setEmail('')
        setPassword('')
        setError('')
        setShowPassword(false)
        setLoading(false)
    }

    const goToStep = (s) => {
        resetForm()
        setRegError('')
        setStep(s)
    }

    // Doctor login — calls backend API, falls back to mock data
    const handleDoctorLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields'); return }
        setLoading(true)
        setError('')

        // Try real API first
        try {
            const result = await apiLoginDoctor({ email, password })
            onDoctorLogin({
                doctor: result.doctor,
                hospital: result.doctor?.hospital || null,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            })
            return
        } catch (apiErr) {
            // If backend is down, fall back to mock data
            const allHospitals = [...mockHospitals]
            for (const hospital of allHospitals) {
                const doctor = hospital.doctors?.find(d => d.email === email && d.password === password)
                if (doctor) {
                    onDoctorLogin({ doctor, hospital })
                    return
                }
            }
            setError(apiErr.message || 'Invalid credentials. Check your email and password.')
        } finally {
            setLoading(false)
        }
    }

    // Hospital login — calls backend API, falls back to mock data
    const handleHospitalLogin = async (e) => {
        e.preventDefault()
        if (!email || !password) { setError('Please fill in all fields'); return }
        setLoading(true)
        setError('')

        try {
            const result = await apiLoginHospital({ admin_email: email, password })
            onHospitalLogin({
                hospital: result.hospital,
                accessToken: result.accessToken,
                refreshToken: result.refreshToken,
            })
            return
        } catch (apiErr) {
            // Fall back to mock data
            const allHospitals = [...mockHospitals]
            const hospital = allHospitals.find(h => h.adminEmail === email && h.adminPassword === password)
            if (hospital) {
                onHospitalLogin({ hospital })
                return
            }
            setError(apiErr.message || 'Invalid admin credentials.')
        } finally {
            setLoading(false)
        }
    }

    // Hospital registration — calls real backend API
    const handleRegister = async (e) => {
        e.preventDefault()
        const { name, address, specialties, adminEmail, adminPassword, confirmPassword, phone } = regData
        if (!name || !address || !adminEmail || !adminPassword) {
            setRegError('Please fill in all required fields')
            return
        }
        if (!phone) {
            setRegError('Phone number is required')
            return
        }
        if (specialties.length === 0) {
            setRegError('Please select at least one specialty')
            return
        }
        if (adminPassword.length < 6) {
            setRegError('Password must be at least 6 characters')
            return
        }
        if (adminPassword !== confirmPassword) {
            setRegError('Passwords do not match')
            return
        }

        setLoading(true)
        setRegError('')

        try {
            const result = await apiRegisterHospital({
                hospital_name: name,
                address,
                phone_number: phone,
                specialities: specialties,
                admin_email: adminEmail,
                password: adminPassword,
                confirm_password: confirmPassword,
            })
            // result.hospital is the created hospital from the backend
            onHospitalRegister(result.hospital)
        } catch (apiErr) {
            // If backend is down, create locally so the demo still works
            if (apiErr.message?.includes('fetch') || apiErr.status === undefined) {
                const newHospital = {
                    id: Date.now(),
                    name,
                    image: regData.image || 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&h=400&fit=crop',
                    rating: 4.0,
                    totalRatings: 0,
                    specialty: specialties[0],
                    specialties: [...specialties],
                    address,
                    promoted: false,
                    openNow: true,
                    adminEmail,
                    adminPassword,
                    phone,
                    doctors: [],
                }
                onHospitalRegister(newHospital)
            } else {
                setRegError(apiErr.message || 'Registration failed. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    const addSpecialty = (spec) => {
        if (!regData.specialties.includes(spec)) {
            setRegData(prev => ({ ...prev, specialties: [...prev.specialties, spec] }))
        }
        setSpecInput('')
    }

    const removeSpecialty = (spec) => {
        setRegData(prev => ({ ...prev, specialties: prev.specialties.filter(s => s !== spec) }))
    }

    const updateReg = (key, value) => {
        setRegData(prev => ({ ...prev, [key]: value }))
        setRegError('')
    }

    const filteredSpecs = SPECIALTY_OPTIONS.filter(s =>
        !regData.specialties.includes(s) &&
        s.toLowerCase().includes(specInput.toLowerCase())
    )

    // ─── RENDER ───

    // Role picker
    if (step === 'pick-role') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors">
                        <ArrowLeft size={16} /> Back to Home
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200 dark:shadow-blue-900/20">
                            <span className="text-white text-2xl font-black">N</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Admin Portal</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Choose your role to continue</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => goToStep('doctor-login')}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-lg hover:shadow-teal-100 dark:hover:shadow-teal-900/20 transition-all group"
                        >
                            <div className="w-14 h-14 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center group-hover:bg-teal-100 dark:group-hover:bg-teal-900/30 transition-colors">
                                <Stethoscope size={28} className="text-teal-600 dark:text-teal-400" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Doctor</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Log in to manage your schedule</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors" />
                        </button>

                        <button
                            onClick={() => goToStep('hospital-choice')}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-900/20 transition-all group"
                        >
                            <div className="w-14 h-14 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 transition-colors">
                                <Building2 size={28} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">Hospital</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Log in or register your hospital</p>
                            </div>
                            <ChevronRight size={20} className="text-gray-300 dark:text-gray-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // Hospital choice: Login or Register
    if (step === 'hospital-choice') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950/30 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <button onClick={() => goToStep('pick-role')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                            <Building2 size={32} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">Hospital Portal</h1>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Login to your existing account or register</p>
                    </div>

                    <div className="space-y-4">
                        <button
                            onClick={() => goToStep('hospital-login')}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-lg hover:shadow-orange-100 dark:hover:shadow-orange-900/20 transition-all group"
                        >
                            <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 rounded-xl flex items-center justify-center group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30">
                                <LogIn size={24} className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Login</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Already have an account</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </button>

                        <button
                            onClick={() => goToStep('hospital-register')}
                            className="w-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 flex items-center gap-4 hover:border-green-300 dark:hover:border-green-700 hover:shadow-lg hover:shadow-green-100 dark:hover:shadow-green-900/20 transition-all group"
                        >
                            <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30">
                                <UserPlus size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="text-left flex-1">
                                <h3 className="font-bold text-gray-800 dark:text-gray-100">Register</h3>
                                <p className="text-xs text-gray-400 dark:text-gray-500">Create a new hospital account</p>
                            </div>
                            <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                        </button>
                    </div>

                    {/* Demo credentials hint */}
                    <div className="mt-6 bg-white/60 dark:bg-gray-800/60 rounded-xl border border-orange-100 dark:border-orange-900/30 p-4">
                        <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">Demo Login</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">admin@apollo.com / apollo123</p>
                    </div>
                </div>
            </div>
        )
    }

    // Doctor Login Form
    if (step === 'doctor-login') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-teal-950/30 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <button onClick={() => goToStep('pick-role')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-teal-200 dark:shadow-teal-900/20">
                                <Stethoscope size={28} className="text-white" />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">Doctor Login</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Your credentials are provided by your hospital</p>
                        </div>

                        <form onSubmit={handleDoctorLogin} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</label>
                                <input
                                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                                    placeholder="doctor@hospital.com"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 focus:border-teal-400 dark:focus:border-teal-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'} value={password}
                                        onChange={e => { setPassword(e.target.value); setError('') }}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 pr-12 focus:outline-none focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900 focus:border-teal-400 dark:focus:border-teal-500"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-teal-200 dark:shadow-teal-900/20 hover:shadow-xl hover:shadow-teal-300 active:scale-[0.98] transition-all disabled:opacity-60">
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <div className="mt-5 bg-teal-50/50 dark:bg-teal-900/10 rounded-xl p-3 border border-teal-100 dark:border-teal-900/30">
                            <p className="text-[10px] font-bold text-teal-400 uppercase tracking-wider mb-1">Demo</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-mono">rajesh@apollo.com / doc123</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Hospital Login Form
    if (step === 'hospital-login') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-orange-950/30 flex items-center justify-center p-4 transition-colors duration-300">
                <div className="w-full max-w-md">
                    <button onClick={() => goToStep('hospital-choice')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-8 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-8">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                                <Building2 size={28} className="text-white" />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">Hospital Login</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Admin access to manage your hospital</p>
                        </div>

                        <form onSubmit={handleHospitalLogin} className="space-y-4">
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Email</label>
                                <input
                                    type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }}
                                    placeholder="admin@hospital.com"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password</label>
                                <div className="relative mt-1">
                                    <input
                                        type={showPassword ? 'text' : 'password'} value={password}
                                        onChange={e => { setPassword(e.target.value); setError('') }}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 pr-12 focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900 focus:border-orange-400 dark:focus:border-orange-500"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {error && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{error}</p>}

                            <button type="submit" disabled={loading}
                                className="w-full py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-200 dark:shadow-orange-900/20 hover:shadow-xl hover:shadow-orange-300 active:scale-[0.98] transition-all disabled:opacity-60">
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                            Don't have an account?{' '}
                            <button onClick={() => goToStep('hospital-register')} className="text-orange-600 dark:text-orange-400 font-semibold hover:underline">
                                Register here
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    // Hospital Registration Form
    if (step === 'hospital-register') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-gray-800 dark:to-emerald-950/30 py-8 px-4 transition-colors duration-300">
                <div className="w-full max-w-lg mx-auto">
                    <button onClick={() => goToStep('hospital-choice')} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>

                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-green-200 dark:shadow-green-900/20">
                                <UserPlus size={28} className="text-white" />
                            </div>
                            <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">Register Hospital</h2>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Fill in your hospital details — this info will be shown to patients</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            {/* Hospital Name */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hospital Name *</label>
                                <input type="text" value={regData.name} onChange={e => updateReg('name', e.target.value)}
                                    placeholder="e.g. City Care Hospital"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                            </div>

                            {/* Address */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address *</label>
                                <input type="text" value={regData.address} onChange={e => updateReg('address', e.target.value)}
                                    placeholder="Full hospital address"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone Number</label>
                                <input type="tel" value={regData.phone} onChange={e => updateReg('phone', e.target.value)}
                                    placeholder="+91 98765 43210"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hospital Image URL</label>
                                <input type="url" value={regData.image} onChange={e => updateReg('image', e.target.value)}
                                    placeholder="https://... (leave empty for default)"
                                    className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                            </div>



                            {/* Specialties */}
                            <div>
                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Specialties *</label>
                                <div className="flex flex-wrap gap-1.5 mt-1 mb-2">
                                    {regData.specialties.map(spec => (
                                        <span key={spec} className="flex items-center gap-1 px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-xs font-semibold">
                                            {spec}
                                            <button type="button" onClick={() => removeSpecialty(spec)} className="hover:text-red-500">
                                                <X size={12} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="relative">
                                    <input type="text" value={specInput} onChange={e => setSpecInput(e.target.value)}
                                        placeholder="Type to search specialties..."
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                                    {specInput && filteredSpecs.length > 0 && (
                                        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-700 rounded-xl shadow-lg border border-gray-100 dark:border-gray-600 py-1 z-10 max-h-40 overflow-y-auto">
                                            {filteredSpecs.map(spec => (
                                                <button key={spec} type="button" onClick={() => addSpecialty(spec)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-600 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-green-900/30 hover:text-green-700 dark:hover:text-green-300 flex items-center gap-2">
                                                    <Plus size={14} /> {spec}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="border-t border-gray-100 dark:border-gray-700 pt-4 mt-4">
                                <p className="text-xs font-bold text-gray-600 dark:text-gray-300 mb-3">Admin Account Credentials</p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin Email *</label>
                                        <input type="email" value={regData.adminEmail} onChange={e => updateReg('adminEmail', e.target.value)}
                                            placeholder="admin@yourhospital.com"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Password *</label>
                                        <input type="password" value={regData.adminPassword} onChange={e => updateReg('adminPassword', e.target.value)}
                                            placeholder="Min 6 characters"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Confirm Password *</label>
                                        <input type="password" value={regData.confirmPassword} onChange={e => updateReg('confirmPassword', e.target.value)}
                                            placeholder="Re-enter password"
                                            className="w-full mt-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-green-100 dark:focus:ring-green-900 focus:border-green-400 dark:focus:border-green-500" />
                                    </div>
                                </div>
                            </div>

                            {regError && <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">{regError}</p>}

                            <button type="submit"
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200 dark:shadow-green-900/20 hover:shadow-xl hover:shadow-green-300 active:scale-[0.98] transition-all">
                                Register Hospital
                            </button>
                        </form>

                        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                            Already registered?{' '}
                            <button onClick={() => goToStep('hospital-login')} className="text-green-600 dark:text-green-400 font-semibold hover:underline">Login here</button>
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return null
}
