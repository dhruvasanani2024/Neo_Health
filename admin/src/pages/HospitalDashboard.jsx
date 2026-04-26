import { useState, useMemo } from 'react'
import { LogOut, Building2, Users, Clock, Calendar, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, AlertTriangle, User, Star, Shield, Power, Plus, X, FileText, Receipt, Pill, CalendarCheck } from 'lucide-react'
import { ALL_DAY_SLOTS, getSlotStatus, SLOT_CONFIG, isSlotPastForToday } from '../data/slotUtils'

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

export default function HospitalDashboard({ hospital: initialHospital, bookings = [], onLogout }) {
    const [hospital, setHospital] = useState(initialHospital)
    const [isOpen, setIsOpen] = useState(hospital.openNow)
    const [selectedDoctor, setSelectedDoctor] = useState(null)
    const [showAddDoctor, setShowAddDoctor] = useState(false)
    const [expandedBillingId, setExpandedBillingId] = useState(null)
    const [weekDays] = useState(generateNext7Days())
    const [selectedDate, setSelectedDate] = useState(() => generateNext7Days()[0].dateString)
    const [newDoctor, setNewDoctor] = useState({
        name: '', email: '', password: '', specialty: 'General',
        qualification: '', experience: '', fee: '', image: ''
    })
    const [doctorSlots, setDoctorSlots] = useState(() => {
        // Initialize slot availability per doctor
        const map = {}
        hospital.doctors.forEach(d => {
            map[d.id] = new Set(d.slots || [])
        })
        return map
    })

    // Mock today's appointments with prescriptions
    const mockTodayAppointments = useMemo(() => [
        { id: 'apt-1', patientName: 'Aarav Sharma', age: 28, time: '09:30 AM', doctorName: hospital.doctors[0]?.name || 'Dr. Smith', doctorFee: hospital.doctors[0]?.fee || 500, type: 'In-Person', status: 'completed', prescription: [{ medicine: 'Amoxicillin 500mg', dosage: '1-1-1', days: 5, cost: 120 }, { medicine: 'Paracetamol 650mg', dosage: '1-0-1', days: 3, cost: 45 }] },
        { id: 'apt-2', patientName: 'Priya Patel', age: 34, time: '10:30 AM', doctorName: hospital.doctors[0]?.name || 'Dr. Smith', doctorFee: hospital.doctors[0]?.fee || 500, type: 'Virtual', status: 'completed', prescription: [{ medicine: 'Azithromycin 250mg', dosage: '1-0-0', days: 3, cost: 180 }, { medicine: 'Cetirizine 10mg', dosage: '0-0-1', days: 5, cost: 30 }, { medicine: 'Cough Syrup 100ml', dosage: '2tsp-2tsp-2tsp', days: 5, cost: 95 }] },
        { id: 'apt-3', patientName: 'Rohan Gupta', age: 45, time: '11:00 AM', doctorName: hospital.doctors[1]?.name || hospital.doctors[0]?.name || 'Dr. Verma', doctorFee: hospital.doctors[1]?.fee || hospital.doctors[0]?.fee || 700, type: 'In-Person', status: 'upcoming', prescription: [] },
        { id: 'apt-4', patientName: 'Neha Singh', age: 29, time: '02:00 PM', doctorName: hospital.doctors[1]?.name || hospital.doctors[0]?.name || 'Dr. Verma', doctorFee: hospital.doctors[1]?.fee || hospital.doctors[0]?.fee || 700, type: 'In-Person', status: 'upcoming', prescription: [] },
    ], [hospital.doctors])

    // Overall stats
    const stats = useMemo(() => {
        const totalBookings = bookings.filter(b => b.hospitalId === hospital.id).length || mockTodayAppointments.length
        const doctorsOnDuty = hospital.doctors.filter(d => d.available).length
        const emergencyBookings = bookings.filter(b => b.hospitalId === hospital.id && b.patientType === 'emergency').length
        const seniorBookings = bookings.filter(b => b.hospitalId === hospital.id && b.patientType === 'senior').length
        return { totalBookings, doctorsOnDuty, emergencyBookings, seniorBookings }
    }, [bookings, hospital, mockTodayAppointments])

    const toggleHospitalOpen = () => {
        setIsOpen(!isOpen)
    }

    const toggleDoctorSlot = (doctorId, slotTime) => {
        setDoctorSlots(prev => {
            const next = { ...prev }
            const set = new Set(next[doctorId])
            if (set.has(slotTime)) {
                set.delete(slotTime)
            } else {
                set.add(slotTime)
            }
            next[doctorId] = set
            return next
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

    const getDoctorBookings = (doctorId) => {
        return bookings.filter(b => b.doctorId === doctorId)
    }

    const handleAddDoctor = (e) => {
        e.preventDefault()
        const doctor = {
            id: Date.now(),
            ...newDoctor,
            fee: parseInt(newDoctor.fee) || 500,
            rating: 5.0,
            totalRatings: 0,
            available: true,
            nextAvailable: 'Today',
            slots: ALL_DAY_SLOTS.map(s => s.time), // Default to all slots available
            image: newDoctor.image || 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop'
        }

        // Update local hospital state
        const updatedHospital = {
            ...hospital,
            doctors: [...hospital.doctors, doctor]
        }
        setHospital(updatedHospital)

        // Initialize slots for new doctor
        setDoctorSlots(prev => ({
            ...prev,
            [doctor.id]: new Set(doctor.slots)
        }))

        setShowAddDoctor(false)
        setNewDoctor({
            name: '', email: '', password: '', specialty: 'General',
            qualification: '', experience: '', fee: '', image: ''
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50/30">
            {/* Top bar */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-sm">
                            <Building2 size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-800">Hospital Admin</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wider">{hospital.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Hospital status toggle */}
                        <button
                            onClick={toggleHospitalOpen}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${isOpen ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-500 border border-red-200'}`}
                        >
                            <Power size={14} />
                            {isOpen ? 'Open' : 'Closed'}
                        </button>
                        <button
                            onClick={onLogout}
                            className="p-2 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                            title="Sign Out"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                {/* Hospital Header */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <img
                        src={hospital.image}
                        alt={hospital.name}
                        className="w-20 h-20 rounded-2xl object-cover"
                    />
                    <div className="flex-1">
                        <h1 className="text-xl font-extrabold text-gray-800 mb-1">{hospital.name}</h1>
                        <p className="text-sm text-gray-400">{hospital.address}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-500">
                                <Star size={12} fill="currentColor" /> {hospital.rating}
                            </span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">{hospital.totalRatings} ratings</span>
                            <span className="text-xs text-gray-300">•</span>
                            <span className="text-xs text-gray-400">{hospital.specialties?.join(', ')}</span>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isOpen ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className={`text-sm font-semibold ${isOpen ? 'text-green-600' : 'text-red-500'}`}>
                            {isOpen ? 'Currently Open' : 'Closed'}
                        </span>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: 'Total Bookings', value: stats.totalBookings, icon: <Calendar size={18} />, color: 'from-orange-500 to-amber-500' },
                        { label: 'Doctors On Duty', value: stats.doctorsOnDuty, icon: <Users size={18} />, color: 'from-teal-500 to-emerald-500' },
                        { label: 'Senior Patients', value: stats.seniorBookings, icon: <Shield size={18} />, color: 'from-purple-500 to-violet-500' },
                        { label: 'Emergency', value: stats.emergencyBookings, icon: <AlertTriangle size={18} />, color: 'from-red-500 to-rose-500' },
                    ].map((s, i) => (
                        <div key={i} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-2.5`}>
                                {s.icon}
                            </div>
                            <p className="text-2xl font-extrabold text-gray-800">{s.value}</p>
                            <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                        </div>
                    ))}
                </div>

                {/* Slot capacity legend */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Slot Capacity Rules</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-green-400" /> Normal: {SLOT_CONFIG.normalCapacity} patients/slot</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Reserved: {SLOT_CONFIG.reservedCapacity} (Senior/Emergency)</span>
                        <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Overflow: Reserved opens to all 30 min before slot</span>
                    </div>
                </div>

                {/* Today's Appointments & Prescriptions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <FileText size={16} className="text-white" />
                            </div>
                            Today's Appointments & Prescriptions
                        </h2>
                        <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                    </div>

                    <div className="space-y-3">
                        {mockTodayAppointments.map(apt => {
                            const isExpanded = expandedBillingId === apt.id
                            const medicineCost = apt.prescription.reduce((sum, p) => sum + (p.cost * p.days), 0)
                            const totalBill = apt.doctorFee + medicineCost

                            return (
                                <div key={apt.id} className={`rounded-xl border transition-all ${isExpanded ? 'border-blue-200 shadow-md' : 'border-gray-100 hover:border-gray-200'}`}>
                                    {/* Patient Strip */}
                                    <div
                                        className="p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50/80 transition-colors rounded-xl"
                                        onClick={() => setExpandedBillingId(isExpanded ? null : apt.id)}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${apt.status === 'completed' ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-orange-400 to-amber-500'}`}>
                                            {apt.patientName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{apt.patientName} <span className="text-gray-400 font-normal">({apt.age}y)</span></p>
                                            <p className="text-xs text-gray-400">
                                                <span className="font-semibold text-gray-500">{apt.time}</span> · {apt.doctorName} · {apt.type}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${apt.status === 'completed' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                {apt.status === 'completed' ? '✓ Done' : '⏳ Upcoming'}
                                            </span>
                                            {apt.prescription.length > 0 && (
                                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center gap-1">
                                                    <Pill size={10} /> Rx
                                                </span>
                                            )}
                                            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                        </div>
                                    </div>

                                    {/* Expanded: Prescription & Pricing */}
                                    {isExpanded && (
                                        <div className="border-t border-gray-100 p-5 bg-gray-50/50 rounded-b-xl fade-in-up">
                                            {apt.prescription.length > 0 ? (
                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                                    {/* Prescription */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                            <Pill size={13} className="text-blue-500" /> Prescription
                                                        </p>
                                                        <div className="space-y-2">
                                                            {apt.prescription.map((med, idx) => (
                                                                <div key={idx} className="bg-white rounded-lg p-3 border border-gray-100 flex items-center justify-between">
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-gray-700">{med.medicine}</p>
                                                                        <p className="text-[10px] text-gray-400 mt-0.5">Dosage: {med.dosage} · {med.days} days</p>
                                                                    </div>
                                                                    <span className="text-xs font-bold text-gray-500">₹{med.cost * med.days}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    {/* Pricing Breakdown */}
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                            <Receipt size={13} className="text-green-500" /> Billing Summary
                                                        </p>
                                                        <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Consultation Fee</span>
                                                                <span className="font-bold text-gray-700">₹{apt.doctorFee}</span>
                                                            </div>
                                                            <div className="flex justify-between text-sm">
                                                                <span className="text-gray-500">Medicine Cost</span>
                                                                <span className="font-bold text-gray-700">₹{medicineCost}</span>
                                                            </div>
                                                            <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between text-sm">
                                                                <span className="font-bold text-gray-800">Total Estimated Bill</span>
                                                                <span className="font-extrabold text-lg text-green-600">₹{totalBill}</span>
                                                            </div>
                                                            <button className="w-full mt-2 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 transition-all active:scale-[0.98]">
                                                                Confirm & Print Bill
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="text-center py-6">
                                                    <FileText size={28} className="mx-auto text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-400">Prescription will be available after consultation</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Manage Doctors & Slot Control */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-base font-bold text-gray-800 flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center">
                                <CalendarCheck size={16} className="text-white" />
                            </div>
                            Manage Doctors & Daily Slots
                        </h2>
                        <button
                            onClick={() => setShowAddDoctor(!showAddDoctor)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors"
                        >
                            {showAddDoctor ? <X size={14} /> : <Plus size={14} />}
                            {showAddDoctor ? 'Cancel' : 'Add Doctor'}
                        </button>
                    </div>

                    {/* Shared Date Selector Bar */}
                    <div className="flex gap-2.5 overflow-x-auto pb-4 mb-5 border-b border-gray-100" style={{ scrollbarWidth: 'none' }}>
                        {weekDays.map(day => (
                            <button
                                key={day.dateString}
                                onClick={() => setSelectedDate(day.dateString)}
                                className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-2xl border-2 transition-all ${
                                    selectedDate === day.dateString
                                        ? 'bg-teal-500 border-teal-600 text-white shadow-lg shadow-teal-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <span className="text-[10px] font-semibold mb-0.5 opacity-80">{day.isToday ? 'Today' : day.dayName}</span>
                                <span className="text-xl font-black">{day.dayNumber}</span>
                            </button>
                        ))}
                    </div>

                    {/* Add Doctor Form */}
                    {showAddDoctor && (
                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-5 mb-5 fade-in-up">
                            <h3 className="text-sm font-bold text-gray-800 mb-4">Register New Doctor</h3>
                            <form onSubmit={handleAddDoctor} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Name</label>
                                        <input required type="text" placeholder="Dr. Name"
                                            value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Specialty</label>
                                        <select
                                            value={newDoctor.specialty} onChange={e => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            {['Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Dermatology', 'General'].map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Email (Login)</label>
                                        <input required type="email" placeholder="doctor@hospital.com"
                                            value={newDoctor.email} onChange={e => setNewDoctor({ ...newDoctor, email: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Password</label>
                                        <input required type="password" placeholder="Set login password"
                                            value={newDoctor.password} onChange={e => setNewDoctor({ ...newDoctor, password: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Qualification</label>
                                        <input required type="text" placeholder="e.g. MBBS, MD"
                                            value={newDoctor.qualification} onChange={e => setNewDoctor({ ...newDoctor, qualification: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Experience</label>
                                        <input required type="text" placeholder="e.g. 10 years"
                                            value={newDoctor.experience} onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Fee (₹)</label>
                                        <input required type="number" placeholder="500"
                                            value={newDoctor.fee} onChange={e => setNewDoctor({ ...newDoctor, fee: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">Image URL</label>
                                        <input type="text" placeholder="https://..."
                                            value={newDoctor.image} onChange={e => setNewDoctor({ ...newDoctor, image: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-100 outline-none" />
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all">
                                    Create Doctor Account
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Doctors List with Slots */}
                    <div className="space-y-4">
                        {hospital.doctors.map(doctor => {
                            const docBookings = getDoctorBookings(doctor.id)
                            const activeSlots = doctorSlots[doctor.id]?.size || 0

                            return (
                                <div key={doctor.id} className="rounded-xl border border-gray-100 overflow-hidden">
                                    {/* Doctor Info Strip */}
                                    <div className="p-4 flex items-center gap-4 bg-white">
                                        <img
                                            src={doctor.image}
                                            alt={doctor.name}
                                            className="w-11 h-11 rounded-xl object-cover border border-gray-200"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-800 truncate">{doctor.name}</p>
                                            <p className="text-xs text-gray-400">{doctor.specialty} · {doctor.experience}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs font-semibold text-gray-600">{activeSlots} slots active</p>
                                                <p className="text-[10px] text-gray-400">{docBookings.length} bookings</p>
                                            </div>
                                            <span className={`w-2.5 h-2.5 rounded-full ${doctor.available ? 'bg-green-400' : 'bg-gray-300'}`} />
                                            <button
                                                onClick={() => toggleAllDoctorSlots(doctor.id)}
                                                className="text-[10px] font-bold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 px-2.5 py-1 rounded-lg border border-orange-200 transition-colors"
                                            >
                                                {doctorSlots[doctor.id]?.size === ALL_DAY_SLOTS.length ? 'Disable All' : 'Enable All'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Time Slots Grid - Always Visible */}
                                    <div className="border-t border-gray-100 px-4 py-4 bg-gray-50/50">
                                        {/* Morning */}
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">🌅 Morning (9 AM – 12 PM)</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-4">
                                            {ALL_DAY_SLOTS.filter(s => s.hour24 < 12 && !isSlotPastForToday(s, selectedDate)).map(slot => {
                                                const isEnabled = doctorSlots[doctor.id]?.has(slot.time)
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => toggleDoctorSlot(doctor.id, slot.time)}
                                                        className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all ${isEnabled
                                                            ? 'bg-teal-50 border-2 border-teal-400 text-teal-700 shadow-sm'
                                                            : 'bg-gray-100 border-2 border-transparent text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                )
                                            })}
                                        </div>

                                        {/* Afternoon */}
                                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">☀️ Afternoon (12 PM – 5 PM)</p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                                            {ALL_DAY_SLOTS.filter(s => s.hour24 >= 12 && !isSlotPastForToday(s, selectedDate)).map(slot => {
                                                const isEnabled = doctorSlots[doctor.id]?.has(slot.time)
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        onClick={() => toggleDoctorSlot(doctor.id, slot.time)}
                                                        className={`px-2 py-2 rounded-xl text-xs font-semibold transition-all ${isEnabled
                                                            ? 'bg-teal-50 border-2 border-teal-400 text-teal-700 shadow-sm'
                                                            : 'bg-gray-100 border-2 border-transparent text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}
