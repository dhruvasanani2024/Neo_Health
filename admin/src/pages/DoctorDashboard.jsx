import { useState } from 'react'
import {
    Calendar, Users, LogOut, Video, FileText,
    Clock, Phone, MoreVertical, Stethoscope, CheckCircle2,
    CalendarCheck, FilePlus, ToggleLeft, Menu, X, Save
} from 'lucide-react'
import { ALL_DAY_SLOTS, isSlotPastForToday } from '../data/slotUtils'
import { apiUpdateDoctorSlots, apiUpdateDoctorBooking } from '../utils/api'

// Removed mockAppointments

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

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
}

export default function DoctorDashboard({ doctor, hospital, bookings = [], onLogout }) {
    const [activeTab, setActiveTab] = useState('schedule')
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [weekDays] = useState(generateNext7Days())
    
    // Manage Global Slots for the Doctor
    const [activeVirtualSlots, setActiveVirtualSlots] = useState(new Set(doctor.virtualSlots && doctor.virtualSlots.length > 0 ? doctor.virtualSlots : []))
    // We initialize in-person slots with `doctor.slots`. If `doctor.slots` doesn't exist, use all slots.
    const [activeSlots, setActiveSlots] = useState(new Set(doctor.slots && doctor.slots.length > 0 ? doctor.slots : ALL_DAY_SLOTS.map(s => s.time)))
    
    const [savingSlots, setSavingSlots] = useState(false)
    const [saveStatus, setSaveStatus] = useState('')

    const [customSlotTimes, setCustomSlotTimes] = useState({}) // { inperson: [], virtual: [] }
    const [newSlotInput, setNewSlotInput] = useState({ inperson: '', virtual: '' })

    // Prescription State
    const [prescribingAptId, setPrescribingAptId] = useState(null)
    const [prescriptionText, setPrescriptionText] = useState('')
    const [isSavingPrescription, setIsSavingPrescription] = useState(false)

    const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    const todayBookings = bookings.filter(b => b.date === todayStr || b.date?.startsWith(new Date().toISOString().split('T')[0]))
    const completedCount = todayBookings.filter(b => b.status === 'completed').length


    const toggleSlot = (time) => {
        setActiveSlots(prev => {
            const newSlots = new Set(prev)
            if (newSlots.has(time)) newSlots.delete(time)
            else newSlots.add(time)
            return newSlots
        })
    }

    const toggleVirtualSlot = (time) => {
        setActiveVirtualSlots(prev => {
            const newSlots = new Set(prev)
            if (newSlots.has(time)) newSlots.delete(time)
            else newSlots.add(time)
            return newSlots
        })
    }

    const handleSaveSlots = async () => {
        setSavingSlots(true)
        setSaveStatus('')
        try {
            // Sort chronologically using ALL_DAY_SLOTS order
            const sortedSlots = [...activeSlots].sort((a, b) => {
                return ALL_DAY_SLOTS.findIndex(s => s.time === a) - ALL_DAY_SLOTS.findIndex(s => s.time === b)
            })
            const sortedVirtualSlots = [...activeVirtualSlots].sort((a, b) => {
                return ALL_DAY_SLOTS.findIndex(s => s.time === a) - ALL_DAY_SLOTS.findIndex(s => s.time === b)
            })

            await apiUpdateDoctorSlots({ 
                slots: sortedSlots,
                virtualSlots: sortedVirtualSlots
            })
            setSaveStatus('success')
            setTimeout(() => setSaveStatus(''), 2000)
        } catch (err) {
            setSaveStatus('error')
            setTimeout(() => setSaveStatus(''), 2000)
        } finally {
            setSavingSlots(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex flex-col md:flex-row">
            {/* Mobile Top Bar */}
            <div className="md:hidden flex flex-shrink-0 items-center justify-between bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <img src={doctor.image || 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=100&h=100&fit=crop'} alt={doctor.name} className="w-8 h-8 rounded-lg object-cover shadow-sm border border-gray-200 dark:border-gray-600" />
                    <div>
                        <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 line-clamp-1">{doctor.name}</h2>
                    </div>
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
                        <img src={doctor.image || 'https://images.unsplash.com/photo-1612349317150-e410f624c427?w=100&h=100&fit=crop'} alt={doctor.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-gray-200 dark:border-gray-600" />
                        <div>
                            <h2 className="text-sm font-extrabold text-gray-800 dark:text-gray-100 line-clamp-1">{doctor.name}</h2>
                            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">{doctor.specialty} • {hospital.name}</p>
                        </div>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <button
                        onClick={() => {
                            setActiveTab('schedule')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'schedule' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <Calendar size={18} /> Today's Schedule
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab('availability')
                            setIsMobileMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'availability' ? 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-gray-200'}`}
                    >
                        <CalendarCheck size={18} /> Manage Time Slots
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
                <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8 fade-in-up">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-5">
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-800 dark:text-gray-100">
                                {activeTab === 'schedule' && 'Appointments for Today'}
                                {activeTab === 'availability' && 'Manage Time Slots'}
                            </h1>
                            {activeTab === 'schedule' && (
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    You have <span className="font-bold text-teal-600 dark:text-teal-400">{todayBookings.filter(b => b.status === 'upcoming').length} upcoming</span> appointments today.
                                </p>
                            )}
                        </div>
                        {activeTab === 'schedule' && (
                            <div className="flex gap-3">
                                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                                    <Clock size={16} className="text-gray-400" />
                                    <span className="text-sm font-bold text-gray-700 dark:text-gray-200">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Schedule Tab */}
                    {activeTab === 'schedule' && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            
                            {/* Appointments List */}
                            <div className="lg:col-span-2 space-y-4">
                                {todayBookings.length === 0 ? (
                                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center text-gray-500 shadow-sm">
                                        <CalendarCheck size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                        <h4 className="text-lg font-bold text-gray-800 dark:text-gray-200">No appointments today</h4>
                                        <p className="mt-2 text-sm">Your schedule is completely clear for the day.</p>
                                    </div>
                                ) : (
                                    todayBookings.map((apt) => {
                                        const patientName = apt.patientName || apt.patient?.fullname || 'Patient'
                                        const aptId = apt._id || apt.id
                                        const type = apt.appointmentType || 'In-Person'
                                        
                                        return (
                                            <div key={aptId} className={`bg-white dark:bg-gray-800 rounded-2xl border ${apt.status === 'completed' ? 'border-gray-100 dark:border-gray-700 opacity-70' : 'border-teal-100 dark:border-teal-900/30'} p-5 shadow-sm transition-all hover:shadow-md flex flex-col sm:flex-row sm:items-center gap-5`}>
                                                
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="relative">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800 shadow-sm text-gray-500 dark:text-gray-300 font-bold text-lg">
                                                            {getInitials(patientName)}
                                                        </div>
                                                        {apt.status === 'completed' && (
                                                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full">
                                                                <CheckCircle2 size={18} className="text-green-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-800 dark:text-gray-100">{patientName}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Age: {apt.age || apt.patient?.age || '--'} • ID: #{aptId.substring(aptId.length - 6).toUpperCase()}</p>
                                                        
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${type === 'Virtual' ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-100 dark:border-blue-800' : 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400 border border-orange-100 dark:border-orange-800'}`}>
                                                                {type === 'Virtual' ? <Video size={12} /> : <Stethoscope size={12} />}
                                                                {type}
                                                            </span>
                                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                                                                <Clock size={12} /> {apt.slotTime || apt.time}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex sm:flex-col gap-2 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-700 pt-4 sm:pt-0 sm:pl-5">
                                                    {apt.status === 'upcoming' ? (
                                                        <>
                                                            {prescribingAptId === aptId ? (
                                                                <div className="flex-1 w-full mt-2 sm:mt-0 flex flex-col gap-2">
                                                                    <textarea 
                                                                        value={prescriptionText}
                                                                        onChange={e => setPrescriptionText(e.target.value)}
                                                                        placeholder="Write prescription here..."
                                                                        className="w-full text-sm p-2 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50/10 dark:bg-blue-900/10 focus:outline-none focus:border-blue-400 resize-none dark:text-white"
                                                                        rows="3"
                                                                    />
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => setPrescribingAptId(null)}
                                                                            disabled={isSavingPrescription}
                                                                            className="flex-1 px-2 py-1.5 text-xs font-bold text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
                                                                        >
                                                                            Cancel
                                                                        </button>
                                                                        <button 
                                                                            disabled={isSavingPrescription || !prescriptionText.trim()}
                                                                            onClick={async () => {
                                                                                setIsSavingPrescription(true);
                                                                                try {
                                                                                    await apiUpdateDoctorBooking(aptId, { 
                                                                                        status: 'completed', 
                                                                                        prescription: [{ medicine: prescriptionText }] 
                                                                                    });
                                                                                    setPrescribingAptId(null);
                                                                                    setPrescriptionText('');
                                                                                    window.location.reload(); // Simple way to refresh data for now
                                                                                } catch(e) {
                                                                                    alert("Failed to save prescription: " + (e.message || e.toString()));
                                                                                } finally {
                                                                                    setIsSavingPrescription(false);
                                                                                }
                                                                            }}
                                                                            className="flex-[2] px-2 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg flex items-center justify-center gap-1 transition-all"
                                                                        >
                                                                            <Save size={12}/> {isSavingPrescription ? 'Saving...' : 'Save & Complete'}
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <>
                                                                    {type === 'Virtual' ? (
                                                                        <button className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-bold shadow-md shadow-blue-200 dark:shadow-blue-900/20 hover:shadow-lg transition-all active:scale-95">
                                                                            <Video size={14} /> Start Call
                                                                        </button>
                                                                    ) : (
                                                                        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-all">
                                                                            Call Next
                                                                        </button>
                                                                    )}
                                                                    <button 
                                                                        onClick={() => {
                                                                            setPrescribingAptId(aptId);
                                                                            setPrescriptionText('');
                                                                        }}
                                                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-3 py-2 rounded-xl text-[10px] font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all"
                                                                    >
                                                                        <FilePlus size={14} /> Prescribe
                                                                    </button>
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <button className="flex-1 flex items-center justify-center gap-2 bg-gray-50 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                                                            View Notes
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>

                            {/* Sidebar Widgets */}
                            <div className="space-y-6">
                                {/* Next Patient Widget */}
                                {todayBookings.filter(b => b.status === 'upcoming').length > 0 && (
                                    (() => {
                                        const nextApt = todayBookings.find(b => b.status === 'upcoming');
                                        const pName = nextApt.patientName || nextApt.patient?.fullname || 'Patient';
                                        return (
                                            <div className="bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-200 dark:shadow-teal-900/20 relative overflow-hidden">
                                                <div className="absolute -right-4 -top-4 opacity-10">
                                                    <Stethoscope size={100} />
                                                </div>
                                                <h3 className="text-xs font-bold text-teal-100 uppercase tracking-wider mb-4">Up Next</h3>
                                                
                                                <div className="flex items-center gap-4 mb-4">
                                                    <div className="w-16 h-16 bg-white/20 rounded-2xl border-2 border-white/20 flex items-center justify-center text-white font-black text-2xl shadow-sm">
                                                        {getInitials(pName)}
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black">{pName}</p>
                                                        <p className="text-sm text-teal-100">{nextApt.appointmentType || 'In-Person'} Consult • {nextApt.slotTime || nextApt.time}</p>
                                                    </div>
                                                </div>
                                                <button className="w-full py-3 bg-white text-teal-700 rounded-xl text-sm font-bold shadow-sm hover:shadow-md transition-shadow active:scale-[0.98]">
                                                    Start Consultation Now
                                                </button>
                                            </div>
                                        )
                                    })()
                                )}

                                {/* Quick Stats */}
                                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 shadow-sm">
                                    <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-4">Today's Progress</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                                <span className="text-gray-500 dark:text-gray-400">Completed</span>
                                                <span className="text-teal-600 dark:text-teal-400">{completedCount} of {todayBookings.length}</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                                <div className="w-1/4 h-full bg-teal-500 rounded-full" style={{ width: todayBookings.length > 0 ? `${(completedCount / todayBookings.length) * 100}%` : '0%' }} />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3 pt-2">
                                            <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-3 text-center border border-orange-100 dark:border-orange-900/20">
                                                <p className="text-2xl font-black text-orange-600 dark:text-orange-400">{todayBookings.filter(b => b.appointmentType !== 'Virtual').length}</p>
                                                <p className="text-[10px] font-bold text-orange-800/60 dark:text-orange-300 uppercase tracking-wider">In-Person</p>
                                            </div>
                                            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-3 text-center border border-blue-100 dark:border-blue-900/20">
                                                <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{todayBookings.filter(b => b.appointmentType === 'Virtual').length}</p>
                                                <p className="text-[10px] font-bold text-blue-800/60 dark:text-blue-300 uppercase tracking-wider">Virtual</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>
                    )}
                    
                    {/* Availability Tab */}
                    {activeTab === 'availability' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-8 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                                    <CalendarCheck className="text-teal-500" /> Explicit Daily Time Slots
                                </h3>
                                <button
                                    onClick={handleSaveSlots}
                                    disabled={savingSlots}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                                        saveStatus === 'success' ? 'bg-green-50 text-green-600 border-green-200' : 
                                        saveStatus === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 
                                        'bg-teal-600 hover:bg-teal-700 text-white shadow-md active:scale-95 border-transparent'
                                    } disabled:opacity-50`}
                                >
                                    <Save size={16} /> 
                                    {savingSlots ? 'Saving...' : saveStatus === 'success' ? 'Saved Successfully!' : saveStatus === 'error' ? 'Error Saving' : 'Save Changes'}
                                </button>
                            </div>
                            
                            <p className="text-sm text-gray-500 mb-6">Explicitly mark any 30-minute block for your in-person hospital visits or virtual tele-health visits. Patients can only book what you explicitly enable.</p>

                            <div className="space-y-8 pt-2">
                                
                                {/* ---------------- IN PERSON GRID ---------------- */}
                                <div className="bg-orange-50/40 dark:bg-gray-900/40 p-5 rounded-2xl border border-orange-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-black text-orange-700 dark:text-orange-400 uppercase tracking-wider flex items-center gap-2">
                                            🏥 In-Person Options
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={newSlotInput.inperson}
                                                onChange={(e) => setNewSlotInput(prev => ({ ...prev, inperson: e.target.value }))}
                                                className="text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            />
                                            <button
                                                onClick={() => {
                                                    const time24 = newSlotInput.inperson;
                                                    if (!time24) return;
                                                    let [h, m] = time24.split(':').map(Number);
                                                    m = m >= 30 ? 30 : 0;
                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                                    const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                                                    
                                                    setCustomSlotTimes(prev => ({
                                                        ...prev,
                                                        inperson: Array.from(new Set([...(prev.inperson || []), timeStr]))
                                                    }));
                                                    setActiveSlots(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.add(timeStr);
                                                        return newSet;
                                                    });
                                                    setNewSlotInput(prev => ({ ...prev, inperson: '' }));
                                                }}
                                                className="text-xs font-bold px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all"
                                            >
                                                Add Slot
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-8 gap-3">
                                        {(() => {
                                            const allSlotsForDoc = [...ALL_DAY_SLOTS];
                                            const customForDoc = customSlotTimes.inperson || [];
                                            customForDoc.forEach(ct => {
                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                    let [h12, rest] = ct.split(':');
                                                    let m = rest.substring(0, 2);
                                                    let ampm = rest.substring(3);
                                                    let h = parseInt(h12);
                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                    allSlotsForDoc.push({ id: `c-${ct}`, time: ct, hour24: h, minute: parseInt(m) });
                                                }
                                            });
                                            Array.from(activeSlots).forEach(ct => {
                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                    let [h12, rest] = ct.split(':');
                                                    let m = rest.substring(0, 2);
                                                    let ampm = rest.substring(3);
                                                    let h = parseInt(h12);
                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                    allSlotsForDoc.push({ id: `db-${ct}`, time: ct, hour24: h, minute: parseInt(m) });
                                                }
                                            });
                                            return allSlotsForDoc.sort((a,b) => a.hour24 - b.hour24 || a.minute - b.minute).map(slot => {
                                                const isEnabled = activeSlots.has(slot.time)
                                                return (
                                                    <button
                                                        key={`inperson-${slot.id}`}
                                                        onClick={() => toggleSlot(slot.time)}
                                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${isEnabled ? 'bg-orange-100 border-2 border-orange-400 text-orange-800 dark:bg-orange-900/40 dark:border-orange-500 dark:text-orange-300 shadow-sm' : 'bg-white border-2 border-transparent text-gray-400 dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700'}`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>

                                {/* ---------------- VIRTUAL GRID ---------------- */}
                                {doctor.offersVirtual && (
                                <div className="bg-blue-50/40 dark:bg-gray-900/40 p-5 rounded-2xl border border-blue-100 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-sm font-black text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-2">
                                            💻 Video Call Options
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="time"
                                                value={newSlotInput.virtual}
                                                onChange={(e) => setNewSlotInput(prev => ({ ...prev, virtual: e.target.value }))}
                                                className="text-xs px-2 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800"
                                            />
                                            <button
                                                onClick={() => {
                                                    const time24 = newSlotInput.virtual;
                                                    if (!time24) return;
                                                    let [h, m] = time24.split(':').map(Number);
                                                    m = m >= 30 ? 30 : 0;
                                                    const ampm = h >= 12 ? 'PM' : 'AM';
                                                    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
                                                    const timeStr = `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
                                                    
                                                    setCustomSlotTimes(prev => ({
                                                        ...prev,
                                                        virtual: Array.from(new Set([...(prev.virtual || []), timeStr]))
                                                    }));
                                                    setActiveVirtualSlots(prev => {
                                                        const newSet = new Set(prev);
                                                        newSet.add(timeStr);
                                                        return newSet;
                                                    });
                                                    setNewSlotInput(prev => ({ ...prev, virtual: '' }));
                                                }}
                                                className="text-xs font-bold px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all"
                                            >
                                                Add Virtual Slot
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 sm:grid-cols-4 xl:grid-cols-8 gap-3">
                                        {(() => {
                                            const allSlotsForDoc = [...ALL_DAY_SLOTS];
                                            const customForDoc = customSlotTimes.virtual || [];
                                            customForDoc.forEach(ct => {
                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                    let [h12, rest] = ct.split(':');
                                                    let m = rest.substring(0, 2);
                                                    let ampm = rest.substring(3);
                                                    let h = parseInt(h12);
                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                    allSlotsForDoc.push({ id: `c-v-${ct}`, time: ct, hour24: h, minute: parseInt(m) });
                                                }
                                            });
                                            Array.from(activeVirtualSlots).forEach(ct => {
                                                if (!allSlotsForDoc.find(s => s.time === ct)) {
                                                    let [h12, rest] = ct.split(':');
                                                    let m = rest.substring(0, 2);
                                                    let ampm = rest.substring(3);
                                                    let h = parseInt(h12);
                                                    if (ampm === 'PM' && h !== 12) h += 12;
                                                    if (ampm === 'AM' && h === 12) h = 0;
                                                    allSlotsForDoc.push({ id: `db-v-${ct}`, time: ct, hour24: h, minute: parseInt(m) });
                                                }
                                            });
                                            return allSlotsForDoc.sort((a,b) => a.hour24 - b.hour24 || a.minute - b.minute).map(slot => {
                                                const isEnabled = activeVirtualSlots.has(slot.time)
                                                return (
                                                    <button
                                                        key={`virtual-${slot.id}`}
                                                        onClick={() => toggleVirtualSlot(slot.time)}
                                                        className={`px-2 py-2 rounded-xl text-xs font-bold transition-all ${isEnabled ? 'bg-blue-100 border-2 border-blue-400 text-blue-800 dark:bg-blue-900/40 dark:border-blue-500 dark:text-blue-300 shadow-sm' : 'bg-white border-2 border-transparent text-gray-400 dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700'}`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Placeholder for other tabs */}
                    {activeTab !== 'schedule' && activeTab !== 'availability' && (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                            <Stethoscope size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Coming Soon</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">This feature is currently under development.</p>
                        </div>
                    )}

                </div>
            </main>
        </div>
    )
}
