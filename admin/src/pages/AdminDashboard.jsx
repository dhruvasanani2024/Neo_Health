import React, { useState, Fragment } from 'react'
import {
    LayoutDashboard, Users, UserPlus, Settings, LogOut,
    Stethoscope, Calendar, TrendingUp, Activity, MoreVertical,
    Clock, Building2, ShieldCheck, Mail, Phone,
    FileText, Pill, Receipt, ChevronDown, ChevronUp,
    Video, FilePlus, CheckCircle2, CalendarCheck, Menu, X, Save, AlertCircle
} from 'lucide-react'
import { ALL_DAY_SLOTS } from '../data/slotUtils'
import {
    apiAddDoctor,
    apiUpdateDoctorSlotsByHospital,
    apiUpdateHospitalSettings
} from '../utils/api'

function generateNext7Days() {
    const days = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        days.push({
            dateObj: d,
            dateString: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: d.getDate(),
            isToday: i === 0
        })
    }
    return days
}

export default function AdminDashboard({ hospital, bookings = [], onLogout, onRefreshBookings, onHospitalUpdate }) {
    const [activeTab, setActiveTab] = useState('overview')
    const [openDropdownIndex, setOpenDropdownIndex] = useState(null)
    const [expandedPatientId, setExpandedPatientId] = useState(null)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [weekDays] = useState(generateNext7Days())
    const [selectedDate, setSelectedDate] = useState(() => generateNext7Days()[0].dateString)
    const [localDoctors, setLocalDoctors] = useState(hospital.doctors || [])
    const [doctorSlots, setDoctorSlots] = useState(() => {
        const map = {}
        ;(hospital.doctors || []).forEach(d => {
            map[d._id || d.id] = new Set(d.slots || ALL_DAY_SLOTS.map(s => s.time))
        })
        return map
    })
    const [doctorVirtualSlots, setDoctorVirtualSlots] = useState(() => {
        const map = {}
        ;(hospital.doctors || []).forEach(d => {
            map[d._id || d.id] = new Set(d.virtualSlots || [])
        })
        return map
    })
    const [customSlotTimes, setCustomSlotTimes] = useState({}) // { doctorId: ['18:30', ...] }
    const [newSlotInput, setNewSlotInput] = useState({}) // { doctorId: '' }

    // Add Doctor form state
    const [showAddDoctor, setShowAddDoctor] = useState(false)
    const [addDoctorLoading, setAddDoctorLoading] = useState(false)
    const [addDoctorError, setAddDoctorError] = useState('')
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', specialty: '', qualification: '',
        experience: '', fee: '', virtualFee: '', offersVirtual: false, about: ''
    })

    // Slot save state
    const [slotSaveStatus, setSlotSaveStatus] = useState({})
    const [savingSlots, setSavingSlots] = useState({})

    // Settings form state
    const [settingsData, setSettingsData] = useState({
        name: hospital.name || hospital.hospital_name || '',
        phone: hospital.phone_number || hospital.phone || '',
        address: hospital.address || '',
    })
    const [settingsSaving, setSettingsSaving] = useState(false)
    const [settingsMessage, setSettingsMessage] = useState('')

    const getDoctorId = (doc) => doc._id || doc.id

    const toggleDoctorSlot = (doctorId, time) => {
        setDoctorSlots(prev => {
            const current = new Set(prev[doctorId] || [])
            if (current.has(time)) current.delete(time)
            else current.add(time)
            return { ...prev, [doctorId]: current }
        })
    }

    const toggleDoctorVirtualSlot = (doctorId, time) => {
        setDoctorVirtualSlots(prev => {
            const current = new Set(prev[doctorId] || [])
            if (current.has(time)) current.delete(time)
            else current.add(time)
            return { ...prev, [doctorId]: current }
        })
    }

    const toggleAllDoctorSlots = (doctorId) => {
        setDoctorSlots(prev => {
            const next = { ...prev }
            if (next[doctorId]?.size === ALL_DAY_SLOTS.length) {
                next[doctorId] = new Set()
            } else {
                next[doctorId] = new Set(ALL_DAY_SLOTS.map(s => s.time))
            }
            return next
        })
    }

    const handleAddDoctor = async (e) => {
        e.preventDefault()
        if (!newDoctor.name || !newDoctor.email || !newDoctor.password || !newDoctor.specialty || !newDoctor.fee) {
            setAddDoctorError('Name, email, password, specialty and fee are required')
            return
        }
        setAddDoctorLoading(true)
        setAddDoctorError('')
        try {
            const created = await apiAddDoctor({
                name: newDoctor.name,
                email: newDoctor.email,
                password: newDoctor.password,
                specialty: newDoctor.specialty,
                qualification: newDoctor.qualification,
                experience: newDoctor.experience,
                fee: Number(newDoctor.fee),
                virtualFee: Number(newDoctor.virtualFee) || 0,
                offersVirtual: newDoctor.offersVirtual,
                about: newDoctor.about,
                available: true,
            })
            const docId = created._id || created.id
            setLocalDoctors(prev => [...prev, { ...created, id: docId }])
            setDoctorSlots(prev => ({ ...prev, [docId]: new Set(ALL_DAY_SLOTS.map(s => s.time)) }))
            setShowAddDoctor(false)
            setNewDoctor({ name: '', email: '', password: '', specialty: '', qualification: '', experience: '', fee: '', virtualFee: '', offersVirtual: false, about: '' })
        } catch (err) {
            setAddDoctorError(err.message || 'Failed to add doctor')
        } finally {
            setAddDoctorLoading(false)
        }
    }

    const handleSaveSettings = async (e) => {
        e.preventDefault()
        setSettingsSaving(true)
        setSettingsMessage('')
        try {
            const updated = await apiUpdateHospitalSettings({
                hospital_name: settingsData.name,
                phone_number: settingsData.phone,
                address: settingsData.address,
            })
            setSettingsMessage('Settings saved successfully!')
            if (onHospitalUpdate) onHospitalUpdate(updated)
        } catch (err) {
            setSettingsMessage(err.message || 'Failed to save settings')
        } finally {
            setSettingsSaving(false)
            setTimeout(() => setSettingsMessage(''), 3000)
        }
    }

    // Compute real metrics from bookings
    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const todayBookings = bookings.filter(b => b.date === todayStr || b.date?.startsWith(new Date().toISOString().split('T')[0]))
    const metrics = [
        { label: 'Total Doctors', value: localDoctors.length, icon: Stethoscope, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: "Today's Appointments", value: todayBookings.length || bookings.filter(b => b.status === 'upcoming').length, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-100' },
        { label: 'Total Bookings', value: bookings.length, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Revenue (Est.)', value: `₹${bookings.filter(b => b.status !== 'cancelled').reduce((sum, b) => sum + (b.fee || 0), 0).toLocaleString('en-IN')}`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row">
            {/* Add Doctor Modal (Portal-like outer scope) */}
            {showAddDoctor && (
                <div className="fixed inset-0 bg-black/60 z-[100] overflow-y-auto flex p-4 sm:p-8 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8 m-auto animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-xl font-extrabold text-gray-800 dark:text-gray-100 mb-1">Add New Doctor</h3>
                                <p className="text-xs text-gray-500">Register a new specialist to your hospital</p>
                            </div>
                            <button onClick={() => { setShowAddDoctor(false); setAddDoctorError('') }} className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Autocomplete Datalists */}
                        <datalist id="specialties-list">
                            <option value="Cardiology" />
                            <option value="Neurology" />
                            <option value="Orthopedics" />
                            <option value="Pediatrics" />
                            <option value="Dermatology" />
                            <option value="Ophthalmology" />
                            <option value="ENT" />
                            <option value="Dentistry" />
                            <option value="Gynecology" />
                            <option value="General" />
                            <option value="Oncology" />
                            <option value="Urology" />
                        </datalist>

                        <datalist id="qualifications-list">
                            <option value="MBBS" />
                            <option value="MD" />
                            <option value="MS" />
                            <option value="BDS" />
                            <option value="MDS" />
                            <option value="DNB" />
                            <option value="FRCS" />
                            <option value="MRCP" />
                            <option value="DO" />
                        </datalist>

                        <form onSubmit={handleAddDoctor} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Name *</label>
                                    <input type="text" value={newDoctor.name} onChange={e => setNewDoctor(p => ({...p, name: e.target.value}))} placeholder="Dr. John Smith" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Specialty *</label>
                                    <input list="specialties-list" type="text" value={newDoctor.specialty} onChange={e => setNewDoctor(p => ({...p, specialty: e.target.value}))} placeholder="Cardiology" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Email *</label>
                                <input type="email" value={newDoctor.email} onChange={e => setNewDoctor(p => ({...p, email: e.target.value}))} placeholder="doctor@hospital.com" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Password *</label>
                                <input type="password" value={newDoctor.password} onChange={e => setNewDoctor(p => ({...p, password: e.target.value}))} placeholder="Min 6 characters" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Fee (₹) *</label>
                                    <input type="number" value={newDoctor.fee} onChange={e => setNewDoctor(p => ({...p, fee: e.target.value}))} placeholder="500" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Virtual Fee (₹)</label>
                                    <input type="number" value={newDoctor.virtualFee} onChange={e => setNewDoctor(p => ({...p, virtualFee: e.target.value}))} placeholder="300" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Qualification</label>
                                    <input list="qualifications-list" type="text" value={newDoctor.qualification} onChange={e => setNewDoctor(p => ({...p, qualification: e.target.value}))} placeholder="MBBS, MD" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Experience</label>
                                    <input type="text" value={newDoctor.experience} onChange={e => setNewDoctor(p => ({...p, experience: e.target.value}))} placeholder="5 years" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all dark:text-gray-100" />
                                </div>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">About</label>
                                <textarea value={newDoctor.about} onChange={e => setNewDoctor(p => ({...p, about: e.target.value}))} placeholder="Brief expertise or bio..." rows={3} className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none dark:text-gray-100" />
                            </div>
                            <label className="flex items-center gap-3 cursor-pointer bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/50 p-3 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors mt-2">
                                <input type="checkbox" checked={newDoctor.offersVirtual} onChange={e => setNewDoctor(p => ({...p, offersVirtual: e.target.checked}))} className="w-5 h-5 accent-orange-600 cursor-pointer" />
                                <span className="text-sm font-bold text-orange-900 dark:text-orange-200">Offers Virtual Consultations</span>
                            </label>
                            {addDoctorError && <p className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 p-3 rounded-xl font-medium flex items-center gap-2"><X size={14}/> {addDoctorError}</p>}
                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={() => setShowAddDoctor(false)} className="w-1/3 py-3 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
                                <button type="submit" disabled={addDoctorLoading} className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-sm font-extrabold shadow-lg shadow-orange-200 dark:shadow-orange-900/20 hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                    {addDoctorLoading ? 'Saving Profile...' : 'Add Specialist Profile'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Mobile Top Bar */}
            <div className="md:hidden flex flex-shrink-0 items-center justify-between bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg">
                        <Building2 size={16} className="text-white" />
                    </div>
                    <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 line-clamp-1">{hospital.name}</h2>
                </div>
                <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -mr-2 text-gray-600 dark:text-gray-300">
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                            <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                            <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 line-clamp-1">{hospital.name}</h2>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">Admin Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => {
                            setActiveTab('overview')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <LayoutDashboard size={18} /> Overview
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('appointments')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'appointments' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <Calendar size={18} /> Appointments
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('doctors')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'doctors' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <Users size={18} /> Manage Doctors
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('patients')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'patients' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <FileText size={18} /> Patients & Prescriptions
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('settings')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'settings' ? 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <Settings size={18} /> Hospital Settings
                    </button>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut size={18} /> Log Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 w-full overflow-y-auto">
                <div className="p-4 sm:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8 fade-in-up">
                    
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                                {activeTab === 'overview' && 'Hospital Overview'}
                                {activeTab === 'appointments' && "Today's Appointments"}
                                {activeTab === 'doctors' && 'Manage Doctors'}
                                {activeTab === 'patients' && 'Patients & Prescriptions'}
                                {activeTab === 'settings' && 'Hospital Settings'}
                            </h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                Good morning, Admin ({hospital.adminEmail})
                            </p>
                        </div>
                        {activeTab === 'doctors' && (
                            <button
                                onClick={() => setShowAddDoctor(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-orange-200 dark:shadow-orange-900/20 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                            >
                                <UserPlus size={16} /> Add Doctor
                            </button>
                        )}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <>
                            {/* Metrics Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {metrics.map((m, i) => {
                                    const Icon = m.icon
                                    return (
                                        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 ${m.bg} ${m.color} rounded-xl flex items-center justify-center dark:bg-opacity-20`}>
                                                    <Icon size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{m.label}</p>
                                                    <h3 className="text-2xl font-black text-gray-800 dark:text-gray-100 mt-0.5">{m.value}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Manage Subscriptions */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <ShieldCheck size={20} className="text-blue-500" /> Manage Subscriptions
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                                        <div>
                                            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">Current Plan: Premium Partner</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">₹5,000 / month · Renews next month</p>
                                        </div>
                                        <button className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold text-xs px-4 py-2 rounded-lg border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-colors">
                                            Change Plan
                                        </button>
                                    </div>
                                    {bookings.length > 0 && (
                                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                            <p className="text-sm font-bold text-green-700 dark:text-green-400">✅ {bookings.length} total bookings received via NeoHealth</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* Appointments Tab */}
                    {activeTab === 'appointments' && (
                        <div className="space-y-6">
                            {/* Date & Stats Bar */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                                        <Clock size={16} className="text-gray-400" />
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                    </div>
                                    <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl px-4 py-2">
                                        <span className="text-sm font-bold text-orange-600 dark:text-orange-400">{bookings.length} appointments</span>
                                    </div>
                                </div>
                                <button onClick={onRefreshBookings} className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100 transition-colors">
                                    Refresh
                                </button>
                            </div>

                            {/* Bookings List */}
                            {bookings.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                                    <Calendar size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments yet</p>
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Appointments booked by patients will appear here</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {bookings.map(apt => {
                                        const initials = (apt.patientName || apt.patient?.fullname || 'P').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
                                        const doctorName = apt.doctor?.name || apt.doctorName || 'Doctor'
                                        const status = apt.status || 'upcoming'
                                        return (
                                            <div key={apt._id || apt.id} className={`bg-white dark:bg-gray-800 rounded-2xl border ${status === 'completed' ? 'border-gray-100 dark:border-gray-700 opacity-80' : 'border-teal-100 dark:border-teal-900/30'} p-5 shadow-sm hover:shadow-md transition-all`}>
                                                <div className="flex items-start gap-4">
                                                    <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 font-bold text-lg">
                                                        {initials}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base font-bold text-gray-800 dark:text-gray-100">{apt.patientName || apt.patient?.fullname || 'Patient'}</h4>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Dr. {doctorName} · {apt.slotTime}</p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                                                apt.appointmentType === 'virtual'
                                                                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800'
                                                                    : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-100 dark:border-orange-800'
                                                            }`}>
                                                                {apt.appointmentType === 'virtual' ? <Video size={12} /> : <Stethoscope size={12} />}
                                                                {apt.appointmentType === 'virtual' ? 'Virtual' : 'In-Person'}
                                                            </span>
                                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                                                                status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100'
                                                                : status === 'cancelled' ? 'bg-red-50 text-red-600 border border-red-100'
                                                                : 'bg-amber-50 text-amber-600 border border-amber-100'
                                                            }`}>
                                                                {status === 'completed' ? '✓ Done' : status === 'cancelled' ? '✗ Cancelled' : '⏳ Upcoming'}
                                                            </span>
                                                            <span className="text-xs text-gray-400">₹{apt.fee}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-400">
                                                    Date: {apt.date} · Patient: {apt.patientName}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Doctors Tab */}
                    {activeTab === 'doctors' && (
                        <div className="space-y-6">

                            {/* Shared Date Bar */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                        <CalendarCheck size={16} className="text-teal-500" /> Select Date
                                    </h3>
                                </div>
                                <div className="flex gap-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                                    {weekDays.map(day => (
                                        <button
                                            key={day.dateString}
                                            onClick={() => setSelectedDate(day.dateString)}
                                            className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                                                selectedDate === day.dateString
                                                    ? 'bg-orange-500 border-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/20'
                                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
                                            }`}
                                        >
                                            <span className="text-[10px] font-semibold mb-0.5 opacity-80">{day.isToday ? 'Today' : day.dayName}</span>
                                            <span className="text-xl font-black">{day.dayNumber}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Doctor Cards with Slots */}
                            {localDoctors.length > 0 ? (
                                localDoctors.map((doc, i) => {
                                    const doctorId = getDoctorId(doc)
                                    const activeSlots = doctorSlots[doctorId]?.size || 0
                                    const saveStatus = slotSaveStatus[doctorId]
                                    return (
                                        <div key={doctorId || i} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                            {/* Doctor Header */}
                                            <div className="p-5 flex items-center gap-4 border-b border-gray-100 dark:border-gray-700">
                                                <img
                                                    src={doc.image || 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=100&h=100&fit=crop'}
                                                    alt={doc.name}
                                                    className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-gray-600"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{doc.name}</p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{doc.specialty} · {doc.email}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right hidden sm:block">
                                                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-300">{activeSlots}/{ALL_DAY_SLOTS.length} slots</p>
                                                        <p className="text-[10px] text-gray-400">active</p>
                                                    </div>
                                                    <span className={`w-2.5 h-2.5 rounded-full ${doc.available !== false ? 'bg-green-400' : 'bg-gray-300'}`} />
                                                    <button
                                                        onClick={() => toggleAllDoctorSlots(doctorId)}
                                                        className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 dark:border-orange-800 transition-colors"
                                                    >
                                                        {doctorSlots[doctorId]?.size === ALL_DAY_SLOTS.length ? 'Disable All' : 'Enable All'}
                                                    </button>
                                                    <div className="flex gap-2">
                                                    <button
                                                        onClick={async () => {
                                                            setSavingSlots(prev => ({ ...prev, [doctorId]: true }));
                                                            try {
                                                                const sortedSlots = Array.from(doctorSlots[doctorId] || []).sort((a, b) => ALL_DAY_SLOTS.findIndex(s => s.time === a) - ALL_DAY_SLOTS.findIndex(s => s.time === b));
                                                                const sortedVirtualSlots = Array.from(doctorVirtualSlots[doctorId] || []).sort((a, b) => ALL_DAY_SLOTS.findIndex(s => s.time === a) - ALL_DAY_SLOTS.findIndex(s => s.time === b));
                                                                await apiUpdateDoctorSlotsByHospital(doctorId, {
                                                                    slots: sortedSlots,
                                                                    virtualSlots: sortedVirtualSlots
                                                                });
                                                                setSlotSaveStatus(prev => ({ ...prev, [doctorId]: 'saved' }));
                                                                setTimeout(() => setSlotSaveStatus(prev => ({ ...prev, [doctorId]: null })), 2000);
                                                            } catch (err) {
                                                                setSlotSaveStatus(prev => ({ ...prev, [doctorId]: 'error' }));
                                                                setTimeout(() => setSlotSaveStatus(prev => ({ ...prev, [doctorId]: null })), 2000);
                                                            } finally {
                                                                setSavingSlots(prev => ({ ...prev, [doctorId]: false }));
                                                            }
                                                        }}
                                                        disabled={savingSlots[doctorId]}
                                                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1 ${
                                                            saveStatus === 'saved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                            saveStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200' :
                                                            'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'
                                                        }`}
                                                    >
                                                        {savingSlots[doctorId] ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? '✗ Error' : 'Save Slots'}
                                                    </button>
                                                    <div className="relative">
                                                        <button
                                                            onClick={() => setOpenDropdownIndex(openDropdownIndex === i ? null : i)}
                                                            className="p-2 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20"
                                                        >
                                                            <MoreVertical size={18} />
                                                        </button>
                                                        {openDropdownIndex === i && (
                                                            <div className="absolute right-0 top-10 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] border border-gray-200 dark:border-gray-700 py-1 z-10 fade-in-up">
                                                                <button className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-600 dark:hover:text-orange-400 font-semibold transition-colors flex items-center gap-2">
                                                                    <Settings size={15}/> Update Details
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Time Slots Grid */}
                                            <div className="px-5 py-4 bg-gray-50/50 dark:bg-gray-900/30">
                                                
                                                {/* In-Person Grid */}
                                                <div className="bg-orange-50/40 dark:bg-gray-900/40 p-4 rounded-xl border border-orange-100 dark:border-gray-700 mb-4">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                                            <span>🏥 In-Person Options</span>
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={newSlotInput[doctorId] || ''}
                                                                onChange={(e) => setNewSlotInput(prev => ({ ...prev, [doctorId]: e.target.value }))}
                                                                className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const time24 = newSlotInput[doctorId];
                                                                    if (!time24) return;
                                                                    let [h, m] = time24.split(':').map(Number);
                                                                    // snap to 30 min
                                                                    m = m >= 30 ? 30 : 0;
                                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                                    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                                                    const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                                                                    
                                                                    setCustomSlotTimes(prev => ({
                                                                        ...prev,
                                                                        [doctorId]: Array.from(new Set([...(prev[doctorId] || []), timeStr]))
                                                                    }));
                                                                    toggleDoctorSlot(doctorId, timeStr);
                                                                    setNewSlotInput(prev => ({ ...prev, [doctorId]: '' }));
                                                                }}
                                                                className="text-[10px] font-bold px-2 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200"
                                                            >
                                                                Add Custom Slot
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                                        {(() => {
                                                            const allSlotsForDoc = [...ALL_DAY_SLOTS];
                                                            const customForDoc = customSlotTimes[doctorId] || [];
                                                            customForDoc.forEach(ct => {
                                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                                    let [h12, rest] = ct.split(':');
                                                                    let m = rest.substring(0, 2);
                                                                    let ampm = rest.substring(3);
                                                                    let h = parseInt(h12);
                                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                                    allSlotsForDoc.push({
                                                                        id: `custom-${ct}`,
                                                                        time: ct,
                                                                        hour24: h,
                                                                        minute: parseInt(m)
                                                                    });
                                                                }
                                                            });
                                                            // Also include any slots from doctorSlots that aren't in ALL_DAY_SLOTS (e.g. loaded from DB)
                                                            Array.from(doctorSlots[doctorId] || []).forEach(ct => {
                                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                                    let [h12, rest] = ct.split(':');
                                                                    let m = rest.substring(0, 2);
                                                                    let ampm = rest.substring(3);
                                                                    let h = parseInt(h12);
                                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                                    allSlotsForDoc.push({
                                                                        id: `db-${ct}`,
                                                                        time: ct,
                                                                        hour24: h,
                                                                        minute: parseInt(m)
                                                                    });
                                                                }
                                                            });
                                                            return allSlotsForDoc.sort((a,b) => a.hour24 - b.hour24 || a.minute - b.minute).map(slot => {
                                                            const isEnabled = doctorSlots[doctorId]?.has(slot.time)
                                                            return (
                                                                <button
                                                                    key={`inperson-${slot.id}`}
                                                                    onClick={() => toggleDoctorSlot(doctorId, slot.time)}
                                                                    className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all ${isEnabled
                                                                        ? 'bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-400 dark:border-orange-600 text-orange-700 dark:text-orange-400 shadow-sm'
                                                                        : 'bg-white dark:bg-gray-800 border-2 border-transparent text-gray-400 dark:text-gray-500 hover:bg-orange-50 dark:hover:bg-gray-700'
                                                                    }`}
                                                                >
                                                                    {slot.time}
                                                                </button>
                                                            )
                                                        })})()}
                                                    </div>
                                                </div>

                                                {/* Virtual Grid */}
                                                {doc.offersVirtual && (
                                                <div className="bg-blue-50/40 dark:bg-gray-900/40 p-4 rounded-xl border border-blue-100 dark:border-gray-700">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                                            <span>💻 Video Call Options</span>
                                                        </p>
                                                        <div className="flex items-center gap-2">
                                                            <input
                                                                type="time"
                                                                value={newSlotInput[`${doctorId}-v`] || ''}
                                                                onChange={(e) => setNewSlotInput(prev => ({ ...prev, [`${doctorId}-v`]: e.target.value }))}
                                                                className="text-xs px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
                                                            />
                                                            <button
                                                                onClick={() => {
                                                                    const time24 = newSlotInput[`${doctorId}-v`];
                                                                    if (!time24) return;
                                                                    let [h, m] = time24.split(':').map(Number);
                                                                    m = m >= 30 ? 30 : 0;
                                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                                    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                                                    const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                                                                    
                                                                    setCustomSlotTimes(prev => ({
                                                                        ...prev,
                                                                        [doctorId]: Array.from(new Set([...(prev[doctorId] || []), timeStr]))
                                                                    }));
                                                                    toggleDoctorVirtualSlot(doctorId, timeStr);
                                                                    setNewSlotInput(prev => ({ ...prev, [`${doctorId}-v`]: '' }));
                                                                }}
                                                                className="text-[10px] font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                                            >
                                                                Add Virtual Slot
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                                        {(() => {
                                                            const allSlotsForDoc = [...ALL_DAY_SLOTS];
                                                            const customForDoc = customSlotTimes[doctorId] || [];
                                                            customForDoc.forEach(ct => {
                                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                                    let [h12, rest] = ct.split(':');
                                                                    let m = rest.substring(0, 2);
                                                                    let ampm = rest.substring(3);
                                                                    let h = parseInt(h12);
                                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                                    allSlotsForDoc.push({
                                                                        id: `custom-${ct}`,
                                                                        time: ct,
                                                                        hour24: h,
                                                                        minute: parseInt(m)
                                                                    });
                                                                }
                                                            });
                                                            Array.from(doctorVirtualSlots[doctorId] || []).forEach(ct => {
                                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                                    let [h12, rest] = ct.split(':');
                                                                    let m = rest.substring(0, 2);
                                                                    let ampm = rest.substring(3);
                                                                    let h = parseInt(h12);
                                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                                    allSlotsForDoc.push({
                                                                        id: `db-v-${ct}`,
                                                                        time: ct,
                                                                        hour24: h,
                                                                        minute: parseInt(m)
                                                                    });
                                                                }
                                                            });
                                                            return allSlotsForDoc.sort((a,b) => a.hour24 - b.hour24 || a.minute - b.minute).map(slot => {
                                                            const isEnabled = doctorVirtualSlots[doctorId]?.has(slot.time)
                                                            return (
                                                                <button
                                                                    key={`virtual-${slot.id}`}
                                                                    onClick={() => toggleDoctorVirtualSlot(doctorId, slot.time)}
                                                                    className={`px-2 py-2 rounded-xl text-[10px] font-bold transition-all ${isEnabled
                                                                        ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 dark:border-blue-600 text-blue-700 dark:text-blue-400 shadow-sm'
                                                                        : 'bg-white dark:bg-gray-800 border-2 border-transparent text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-gray-700'
                                                                    }`}
                                                                >
                                                                    {slot.time}
                                                                </button>
                                                            )
                                                        })})()}
                                                    </div>
                                                </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">No doctors added yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Patients & Prescriptions Tab */}
                    {activeTab === 'patients' && (
                        <div className="space-y-6">
                            {/* Date Badge */}
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Showing appointments for today</p>
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </span>
                            </div>

                            {/* Group by doctor */}
                            {todayBookings.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500">
                                    <h4 className="text-lg font-bold">No Patients Today</h4>
                                    <p className="mt-2 text-sm">Appointments for today will appear here.</p>
                                </div>
                            ) : [...new Set(todayBookings.map(b => b.doctor?.name || b.doctorName || (typeof b.doctor === 'string' ? b.doctor : 'Doctor')))].map(doctorName => {
                                const doctorApts = todayBookings.filter(b => (b.doctor?.name || b.doctorName || (typeof b.doctor === 'string' ? b.doctor : 'Doctor')) === doctorName)
                                return (
                                    <div key={doctorName} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                                        {/* Doctor Header */}
                                        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                                                <Stethoscope size={16} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100">{doctorName}</p>
                                                <p className="text-[10px] text-gray-400">{doctorApts.length} patients today</p>
                                            </div>
                                        </div>

                                        {/* Patient List */}
                                        <div className="divide-y divide-gray-50 dark:divide-gray-700">
                                            {doctorApts.map(apt => {
                                                const aptId = apt._id || apt.id
                                                const isExpanded = expandedPatientId === aptId
                                                const consultFee = apt.fee || 500
                                                const patientName = apt.patientName || apt.patient?.fullname || 'Patient'
                                                const patientAge = apt.patient?.age || apt.age || '--'
                                                const prescription = apt.prescription || []
                                                const status = apt.status || 'upcoming'
                                                const time = apt.slotTime || apt.time || ''
                                                const type = apt.appointmentType || 'In-Person'

                                                return (
                                                    <div key={aptId}>
                                                        {/* Patient Strip */}
                                                        <div
                                                            className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/20 transition-colors"
                                                            onClick={() => setExpandedPatientId(isExpanded ? null : aptId)}
                                                        >
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${status === 'completed' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-amber-500'}`}>
                                                                {patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                                                                    {patientName} <span className="text-gray-400 font-normal">({patientAge}y)</span>
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    <span className="font-semibold text-gray-500">{time}</span> · {type}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${status === 'completed' ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-800' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800'}`}>
                                                                    {status === 'completed' ? '✓ Done' : '⏳ Upcoming'}
                                                                </span>
                                                                {prescription.length > 0 && (
                                                                    <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800 flex items-center gap-1">
                                                                        <Pill size={10} /> Rx
                                                                    </span>
                                                                )}
                                                                {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                            </div>
                                                        </div>

                                                        {/* Expanded: Prescription & Billing */}
                                                        {isExpanded && (
                                                            <div className="px-6 pb-5 pt-1 bg-gray-50/50 dark:bg-gray-900/30 fade-in-up">
                                                                {prescription.length > 0 ? (
                                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                                        {/* Prescription */}
                                                                        <div>
                                                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                                <Pill size={13} className="text-blue-500" /> Prescription
                                                                            </p>
                                                                            <div className="space-y-2">
                                                                                {prescription.map((med, idx) => (
                                                                                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-100 dark:border-gray-700">
                                                                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{med.medicine || med.name}</p>
                                                                                        <p className="text-[10px] text-gray-400 mt-0.5">Dosage: {med.dosage} · {med.duration || med.days} days</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Billing */}
                                                                        <div>
                                                                            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                                <Receipt size={13} className="text-green-500" /> Billing Summary
                                                                            </p>
                                                                            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
                                                                                <div className="flex justify-between text-sm">
                                                                                    <span className="text-gray-500 dark:text-gray-400">Consultation Fee</span>
                                                                                    <span className="font-bold text-gray-700 dark:text-gray-200">₹{consultFee}</span>
                                                                                </div>
                                                                                <div className="border-t border-dashed border-gray-200 dark:border-gray-600 pt-3 flex justify-between text-sm">
                                                                                    <span className="font-bold text-gray-800 dark:text-gray-100">Total Bill</span>
                                                                                    <span className="font-extrabold text-lg text-green-600 dark:text-green-400">₹{consultFee}</span>
                                                                                </div>
                                                                                <button className="w-full mt-1 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-200 dark:shadow-green-900/20 hover:shadow-xl transition-all active:scale-[0.98]">
                                                                                    Confirm & Print Bill
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="text-center py-6">
                                                                        <FileText size={28} className="mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                                                                        <p className="text-sm text-gray-400 dark:text-gray-500">Prescription will be available after consultation</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Settings Tab */}
                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 border-b border-gray-100 dark:border-gray-700 pb-4">General Information</h3>
                                    <form onSubmit={handleSaveSettings} className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hospital Name</label>
                                                <input type="text" value={settingsData.name} onChange={e => setSettingsData(p => ({...p, name: e.target.value}))} className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm" />
                                            </div>
                                            <div>
                                                <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</label>
                                                <input type="text" value={settingsData.phone} onChange={e => setSettingsData(p => ({...p, phone: e.target.value}))} className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Address</label>
                                            <input type="text" value={settingsData.address} onChange={e => setSettingsData(p => ({...p, address: e.target.value}))} className="w-full mt-1 px-4 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-xl text-sm" />
                                        </div>
                                        {settingsMessage && (
                                            <p className={`text-sm font-medium px-3 py-2 rounded-lg ${
                                                settingsMessage.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                                            }`}>{settingsMessage}</p>
                                        )}
                                        <button type="submit" disabled={settingsSaving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-60">
                                            {settingsSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/20">
                                    <ShieldCheck size={32} className="mb-4 opacity-80" />
                                    <h3 className="text-lg font-extrabold mb-2">Premium Partner</h3>
                                    <p className="text-sm text-orange-100 mb-4">Your hospital is listed as a premium partner, boosting visibility by 40%.</p>
                                    <button className="w-full py-2.5 bg-white text-orange-600 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow">
                                        Manage Subscription
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
