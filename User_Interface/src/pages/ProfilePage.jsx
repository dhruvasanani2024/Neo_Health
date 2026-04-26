import { useState } from 'react'
import {
    ArrowLeft, Heart, Thermometer, Activity, Droplets, Weight, Ruler, AlertCircle,
    Pill, Clock, Calendar, Video, MapPin, Star, Phone, Shield, QrCode,
    FileText, ChevronRight, ChevronDown, User, Edit3, Bell
} from 'lucide-react'



function HealthScoreGauge({ score }) {
    const circumference = 2 * Math.PI * 45
    const progress = ((100 - score) / 100) * circumference
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'

    return (
        <div className="relative w-28 h-28 mx-auto">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" stroke={color} strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={circumference} strokeDashoffset={progress}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-extrabold" style={{ color }}>{score}</span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase">Health Score</span>
            </div>
        </div>
    )
}

function VitalCard({ icon: Icon, label, value, color, bgColor }) {
    return (
        <div className={`${bgColor} rounded-2xl p-3 flex items-center gap-3`}>
            <div className={`w-10 h-10 ${color} bg-white rounded-xl flex items-center justify-center shadow-sm`}>
                <Icon size={18} />
            </div>
            <div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase">{label}</p>
                <p className="text-sm font-bold text-gray-800">{value}</p>
            </div>
        </div>
    )
}

function MedicationCard({ med }) {
    const [showDetails, setShowDetails] = useState(false)
    const percentRemaining = (med.remaining / med.total) * 100
    const isLow = percentRemaining <= 30

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isLow ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <Pill size={18} className={isLow ? 'text-red-500' : 'text-blue-500'} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-800">{med.name}</h4>
                            <p className="text-xs text-gray-400">{med.dosage} • {med.schedule}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowDetails(!showDetails)}>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                    </button>
                </div>

                {/* Supply progress */}
                <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-gray-400">Supply remaining</span>
                        <span className={`text-[10px] font-bold ${isLow ? 'text-red-500' : 'text-gray-500'}`}>
                            {med.remaining}/{med.total} days
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${isLow ? 'bg-gradient-to-r from-red-400 to-red-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                            style={{ width: `${percentRemaining}%` }}
                        />
                    </div>
                    {isLow && (
                        <p className="mt-1.5 text-[10px] font-semibold text-red-500 flex items-center gap-1">
                            <AlertCircle size={10} /> Refill needed by {med.refillDate}
                        </p>
                    )}
                </div>

                {/* Expandable details */}
                {showDetails && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 fade-in-up">
                        <div>
                            <span className="text-[10px] text-gray-400 font-semibold">Purpose:</span>
                            <span className="text-xs text-gray-600 ml-1">{med.purpose}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-400 font-semibold">Side Effects:</span>
                            <span className="text-xs text-gray-600 ml-1">{med.sideEffects}</span>
                        </div>
                        <div>
                            <span className="text-[10px] text-gray-400 font-semibold">Prescribed by:</span>
                            <span className="text-xs text-gray-600 ml-1">{med.doctor}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function PrescriptionCard({ rx }) {
    const [expanded, setExpanded] = useState(false)

    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <img src={rx.image} alt={rx.doctor} className="w-10 h-10 rounded-xl object-cover bg-gray-100" />
                    <div className="flex-1">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-gray-800">{rx.doctor}</h4>
                            <span className="text-[10px] text-gray-400">{rx.date}</span>
                        </div>
                        <p className="text-xs text-gray-400">{rx.specialty} • {rx.hospital}</p>
                        <p className="text-xs font-medium text-gray-600 mt-1">Dx: {rx.diagnosis}</p>
                    </div>
                </div>

                <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-1 mt-2 text-[11px] text-blue-500 font-bold hover:text-blue-600">
                    <FileText size={12} /> {expanded ? 'Hide' : 'View'} Prescription
                </button>

                {expanded && (
                    <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 fade-in-up">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mb-1.5">Medicines</p>
                        {rx.medicines.map((med, i) => (
                            <div key={i} className="flex items-center gap-2 mt-1">
                                <Pill size={10} className="text-blue-400" />
                                <span className="text-xs text-gray-600">{med}</span>
                            </div>
                        ))}
                        <p className="text-[10px] text-gray-400 font-semibold uppercase mt-2 mb-1">Doctor's Notes</p>
                        <p className="text-xs text-gray-500 italic">{rx.notes}</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ProfilePage({ user, bookings = [], onBack }) {
    const [activeSection, setActiveSection] = useState('overview')
    const health = user?.healthProfile || {
        bloodType: '--',
        height: '--',
        weight: '--',
        bmi: '--',
        bloodPressure: '--',
        allergies: [],
        emergencyContact: { name: 'Not set', relation: '-', phone: '-' },
        healthScore: 0,
    }

    const medications = user?.medications || []
    const prescriptions = user?.prescriptions || []

    const sections = [
        { id: 'overview', label: 'Overview', icon: Heart },
        { id: 'medications', label: 'Medications', icon: Pill },
        { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
        { id: 'history', label: 'History', icon: Calendar },
    ]

    const upcomingBookings = bookings.filter(b => !b.cancelled && !b.completed)
    const pastBookings = bookings.filter(b => b.completed)

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-20 fade-in-up">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800">My Health Profile</h1>
                    <p className="text-xs text-gray-400">Your personal health dashboard</p>
                </div>
            </div>

            {/* Health ID Card */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-5 text-white mb-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-blue-200 font-semibold">NeoHealth ID</p>
                            <h2 className="text-xl font-extrabold mt-1">{user?.name || 'Guest User'}</h2>
                            <p className="text-blue-200 text-xs mt-0.5">{user?.email || 'Sign in to save'}</p>
                        </div>
                        <div className="w-14 h-14 bg-white/10 backdrop-blur rounded-2xl flex items-center justify-center border border-white/20">
                            <QrCode size={28} className="text-white/80" />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            <Droplets size={14} />
                            <span className="text-xs font-bold">{health.bloodType}</span>
                        </div>
                        {health.allergies.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-red-500/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                <AlertCircle size={14} />
                                <span className="text-xs font-bold">Allergies: {health.allergies.join(', ')}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-xs text-blue-200">
                            <Phone size={12} />
                            Emergency: {health.emergencyContact.name} ({health.emergencyContact.relation}) — {health.emergencyContact.phone}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {sections.map(sec => {
                    const Icon = sec.icon
                    return (
                        <button
                            key={sec.id}
                            onClick={() => setActiveSection(sec.id)}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                activeSection === sec.id
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            <Icon size={14} /> {sec.label}
                        </button>
                    )
                })}
            </div>

            {/* ===== OVERVIEW ===== */}
            {activeSection === 'overview' && (
                <div className="space-y-6 fade-in-up">
                    {/* Vitals */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Vitals at a Glance</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <VitalCard icon={Droplets} label="Blood Type" value={health.bloodType} color="text-red-500" bgColor="bg-red-50" />
                            <VitalCard icon={Activity} label="Blood Pressure" value={health.bloodPressure} color="text-purple-500" bgColor="bg-purple-50" />
                            <VitalCard icon={Weight} label="Weight" value={health.weight} color="text-blue-500" bgColor="bg-blue-50" />
                            <VitalCard icon={Ruler} label="Height / BMI" value={`${health.height} · ${health.bmi}`} color="text-green-500" bgColor="bg-green-50" />
                        </div>
                    </div>

                    {/* Health Score */}
                    <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center shadow-sm">
                        <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-4">Health Score</h3>
                        <HealthScoreGauge score={health.healthScore} />
                        <p className="text-xs text-gray-400 mt-3">Based on medication adherence, visit frequency & vitals</p>
                    </div>

                    {/* Next appointment */}
                    {upcomingBookings.length > 0 && (
                        <div>
                            <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">Next Appointment</h3>
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 p-4">
                                <div className="flex items-center gap-3">
                                    <img src={upcomingBookings[0].doctorImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-gray-800">{upcomingBookings[0].doctor}</h4>
                                        <p className="text-xs text-gray-400">{upcomingBookings[0].specialty} • {upcomingBookings[0].hospital}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-green-100">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Calendar size={12} /> {upcomingBookings[0].date}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Clock size={12} /> {upcomingBookings[0].slotTime}
                                    </span>
                                    <span className={`flex items-center gap-1 text-xs font-semibold ${upcomingBookings[0].appointmentType === 'virtual' ? 'text-teal-600' : 'text-blue-600'}`}>
                                        {upcomingBookings[0].appointmentType === 'virtual' ? <Video size={12} /> : <MapPin size={12} />}
                                        {upcomingBookings[0].appointmentType === 'virtual' ? 'Video' : 'In-Person'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Medication alerts */}
                    {medications.filter(m => (m.remaining / m.total) * 100 <= 30).length > 0 && (
                        <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Bell size={16} className="text-amber-500" />
                                <span className="text-xs font-bold text-amber-700">Medication Alerts</span>
                            </div>
                            {medications.filter(m => (m.remaining / m.total) * 100 <= 30).map(med => (
                                <div key={med.id} className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-gray-600">{med.name}</span>
                                    <span className="text-[10px] font-bold text-red-500">{med.remaining} days left — Refill by {med.refillDate}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ===== MEDICATIONS ===== */}
            {activeSection === 'medications' && (
                <div className="space-y-3 fade-in-up">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Active Medications ({medications.length})</h3>
                    {medications.length === 0 ? (
                        <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl">
                            <Pill size={32} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No active medications</p>
                        </div>
                    ) : (
                        medications.map(med => <MedicationCard key={med.id} med={med} />)
                    )}
                </div>
            )}

            {/* ===== PRESCRIPTIONS ===== */}
            {activeSection === 'prescriptions' && (
                <div className="space-y-3 fade-in-up">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Prescriptions ({prescriptions.length})</h3>
                    {prescriptions.length === 0 ? (
                        <div className="text-center py-10 bg-white border border-gray-100 rounded-2xl">
                            <FileText size={32} className="text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No prescriptions found</p>
                        </div>
                    ) : (
                        prescriptions.map(rx => <PrescriptionCard key={rx.id} rx={rx} />)
                    )}
                </div>
            )}

            {/* ===== HISTORY ===== */}
            {activeSection === 'history' && (
                <div className="space-y-4 fade-in-up">
                    <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-1">Appointment History</h3>
                    {bookings.length === 0 ? (
                        <div className="text-center py-12">
                            <Calendar size={40} className="text-gray-200 mx-auto mb-3" />
                            <p className="text-sm text-gray-400">No appointment history yet</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Timeline line */}
                            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-100" />

                            {bookings.map((booking, idx) => (
                                <div key={booking.id || idx} className="relative flex items-start gap-4 pb-6">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
                                        booking.cancelled ? 'bg-red-100' : booking.completed ? 'bg-green-100' : 'bg-blue-100'
                                    }`}>
                                        {booking.cancelled ? <Star size={16} className="text-red-400" />
                                            : booking.completed ? <Star size={16} className="text-green-500" />
                                            : <Clock size={16} className="text-blue-500" />}
                                    </div>
                                    <div className="flex-1 bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-bold text-gray-700">{booking.doctor}</h4>
                                            <span className="text-[10px] text-gray-400">{booking.date}</span>
                                        </div>
                                        <p className="text-xs text-gray-400">{booking.specialty} • {booking.hospital}</p>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> {booking.slotTime}
                                            </span>
                                            <span className={`text-[11px] font-semibold flex items-center gap-1 ${booking.appointmentType === 'virtual' ? 'text-teal-600' : 'text-blue-600'}`}>
                                                {booking.appointmentType === 'virtual' ? <Video size={10} /> : <MapPin size={10} />}
                                                {booking.appointmentType === 'virtual' ? 'Video' : 'In-Person'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
