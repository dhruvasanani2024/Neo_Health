import { useState, useMemo } from 'react'
import { Star, Clock, Award, ChevronDown, ChevronUp, Check, User, Shield, Video, MapPin, Globe2, GraduationCap, Info, CalendarDays } from 'lucide-react'
import { getSlotStatus, canBook, SLOT_CONFIG, filterPastSlots, generateNext7Days, ALL_DAY_SLOTS } from '../data/slotUtils'

const weekDays = generateNext7Days()

export default function DoctorCard({ doctor, onBook, bookings = [], hospitalName, onBookingComplete, user, onSignInClick }) {
    const [showSlots, setShowSlots] = useState(false)
    const [selectedSlot, setSelectedSlot] = useState(null)
    const [patientType, setPatientType] = useState('normal')
    const [appointmentType, setAppointmentType] = useState('in-person')
    const [patientName, setPatientName] = useState('')
    const [patientAge, setPatientAge] = useState('')
    const [booked, setBooked] = useState(false)
    const [bookError, setBookError] = useState('')
    const [showAbout, setShowAbout] = useState(false)
    const [selectedDate, setSelectedDate] = useState(weekDays[0].dateString)

    const currentFee = appointmentType === 'virtual' && doctor.offersVirtual ? (doctor.virtualFee || doctor.fee) : doctor.fee

    // Extract explicit slots from backend model
    const inPersonSlots = doctor.slots && doctor.slots.length > 0 ? doctor.slots : [];
    const virtualSlots = doctor.offersVirtual && doctor.virtualSlots && doctor.virtualSlots.length > 0 ? doctor.virtualSlots : [];

    // Apply past-slot filtering based on selected date
    const filteredInPersonSlots = useMemo(() => filterPastSlots(inPersonSlots, selectedDate), [inPersonSlots, selectedDate])
    const filteredVirtualSlots = useMemo(() => filterPastSlots(virtualSlots, selectedDate), [virtualSlots, selectedDate])

    const displaySlots = appointmentType === 'virtual' ? filteredVirtualSlots : filteredInPersonSlots
    const totalAvailableSlots = filteredInPersonSlots.length + filteredVirtualSlots.length

    // Format date for booking confirmation
    const selectedDateFormatted = useMemo(() => {
        const day = weekDays.find(d => d.dateString === selectedDate)
        if (!day) return selectedDate
        return day.dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    }, [selectedDate])

    const handleBooking = () => {
        if (!selectedSlot) return
        // Require sign-in before booking
        if (!user && onSignInClick) {
            setBookError('Please sign in to book an appointment')
            return
        }
        if (!patientName.trim()) { setBookError('Please enter patient name'); return }
        if (!patientAge || patientAge <= 0 || patientAge > 110) { setBookError('Please enter a valid age (1–110)'); return }
        if (patientType === 'senior' && patientAge < 60) { setBookError('Senior citizen slots are only for patients aged 60 and above'); return }
        if (appointmentType === 'virtual' && !doctor.offersVirtual) { setBookError('This doctor does not offer virtual consultations'); return }

        const result = canBook(selectedSlot, patientType, bookings)
        if (!result.allowed) { setBookError(result.reason); return }

        setBookError('')

        const bookingData = {
            doctor,
            slot: selectedSlot,
            patientType,
            patientName: patientName.trim(),
            patientAge,
            appointmentType,
            fee: currentFee,
            hospitalName,
        }

        onBook(doctor, selectedSlot, patientType, patientName.trim(), appointmentType, currentFee, selectedDateFormatted)
        setBooked(true)

        if (onBookingComplete) {
            onBookingComplete({
                ...bookingData,
                id: Date.now() + Math.random(),
                slotTime: selectedSlot,
                doctor: doctor.name,
                doctorImage: doctor.image,
                specialty: doctor.specialty,
                hospital: hospitalName,
                date: selectedDateFormatted,
            })
        }

        setTimeout(() => {
            setBooked(false)
            setShowSlots(false)
            setSelectedSlot(null)
            setPatientName('')
            setPatientAge('')
            setPatientType('normal')
            setAppointmentType('in-person')
            setSelectedDate(weekDays[0].dateString)
        }, 2000)
    }

    return (
        <div className={`bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all hover:shadow-md ${booked ? 'ring-2 ring-green-300' : ''}`}>
            <div className="p-4 flex gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0 relative">
                    <img src={doctor.image} alt={doctor.name} className="w-16 h-16 rounded-2xl object-cover bg-gray-100" />
                    {doctor.offersVirtual && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center border-2 border-white" title="Video Consult Available">
                            <Video size={10} className="text-white" />
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-bold text-gray-800 truncate">{doctor.name}</h3>
                            <p className="text-xs text-gray-400 mt-0.5">{doctor.specialty}</p>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star size={12} className="text-amber-400" fill="currentColor" />
                            <span className="text-xs font-bold text-gray-700">{doctor.rating}</span>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{doctor.qualification}</p>

                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                            <Award size={12} /> {doctor.experience}
                        </span>
                        {/* Dual pricing */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-green-600">₹{doctor.fee}</span>
                            {doctor.offersVirtual && doctor.virtualFee && doctor.virtualFee !== doctor.fee && (
                                <>
                                    <span className="text-[10px] text-gray-300">|</span>
                                    <span className="flex items-center gap-0.5 text-xs font-semibold text-teal-600">
                                        <Video size={10} /> ₹{doctor.virtualFee}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Languages */}
                    {doctor.languages && (
                        <div className="flex items-center gap-1 mt-1.5">
                            <Globe2 size={10} className="text-gray-300" />
                            <span className="text-[10px] text-gray-400">{doctor.languages.join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* About section */}
            {doctor.about && (
                <div className="px-4 pb-2">
                    <button
                        onClick={() => setShowAbout(!showAbout)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-600 transition-colors"
                    >
                        <Info size={12} />
                        {showAbout ? 'Hide' : 'About'} Doctor
                    </button>
                    {showAbout && (
                        <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 fade-in-up">
                            <p className="text-xs text-gray-600 leading-relaxed">{doctor.about}</p>
                            {doctor.education && (
                                <div className="mt-2 pt-2 border-t border-blue-100">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Education</p>
                                    {doctor.education.map((edu, i) => (
                                        <div key={i} className="flex items-start gap-1.5 mt-1">
                                            <GraduationCap size={10} className="text-blue-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-[11px] text-gray-500">{edu}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Availability + Book section */}
            <div className="border-t border-gray-100">
                {!booked ? (
                    <>
                        <button
                            onClick={() => {
                                if (!user && onSignInClick) {
                                    onSignInClick()
                                    return
                                }
                                setShowSlots(!showSlots)
                                setBookError('')
                            }}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50/50 transition-colors"
                        >
                            <span className="flex items-center gap-2">
                                <Clock size={14} />
                                {doctor.available ? `${totalAvailableSlots} Slot${totalAvailableSlots !== 1 ? 's' : ''} Available` : 'Not Available Today'}
                            </span>
                            {doctor.available && (showSlots ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
                        </button>

                        {showSlots && doctor.available && (
                            <div className="px-4 pb-4 slide-up">
                                {/* Date Picker */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                        <CalendarDays size={11} /> Select Date
                                    </p>
                                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                                        {weekDays.map(day => (
                                            <button
                                                key={day.dateString}
                                                onClick={() => { setSelectedDate(day.dateString); setSelectedSlot(null); setBookError('') }}
                                                className={`flex-shrink-0 flex flex-col items-center justify-center w-14 h-16 rounded-xl border-2 transition-all ${
                                                    selectedDate === day.dateString
                                                        ? 'bg-blue-600 border-blue-700 text-white shadow-md shadow-blue-200'
                                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300'
                                                }`}
                                            >
                                                <span className="text-[9px] font-semibold opacity-80">{day.displayLabel}</span>
                                                <span className="text-base font-black leading-tight">{day.dayNumber}</span>
                                                <span className="text-[8px] font-medium opacity-60">{day.monthShort}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Appointment type toggle */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Appointment Type</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => { setAppointmentType('in-person'); setBookError(''); setSelectedSlot(null) }}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-1 justify-center ${
                                                appointmentType === 'in-person'
                                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            <MapPin size={13} /> In-Person
                                            <span className="text-[10px] opacity-75">₹{doctor.fee}</span>
                                        </button>
                                        <button
                                            onClick={() => { if (doctor.offersVirtual) { setAppointmentType('virtual'); setBookError(''); setSelectedSlot(null) } }}
                                            disabled={!doctor.offersVirtual}
                                            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all flex-1 justify-center ${
                                                !doctor.offersVirtual
                                                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed'
                                                    : appointmentType === 'virtual'
                                                        ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                            }`}
                                        >
                                            <Video size={13} /> Video Call
                                            <span className="text-[10px] opacity-75">
                                                {doctor.offersVirtual ? `₹${doctor.virtualFee || doctor.fee}` : 'N/A'}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {/* Patient type selector */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Patient Type</p>
                                    <div className="flex gap-2">
                                        {[
                                            { key: 'normal', label: 'Normal', icon: <User size={12} />, color: 'blue' },
                                            { key: 'senior', label: 'Senior (60+)', icon: <Shield size={12} />, color: 'purple' },
                                        ].map(pt => (
                                            <button
                                                key={pt.key}
                                                onClick={() => { setPatientType(pt.key); setBookError('') }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${patientType === pt.key
                                                    ? pt.color === 'blue' ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                                                        : 'bg-purple-100 text-purple-700 ring-1 ring-purple-300'
                                                    : 'bg-gray-100 text-gray-500'}`}
                                            >
                                                {pt.icon} {pt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Patient name and age */}
                                <div className="mb-3 grid grid-cols-2 gap-2">
                                    <input
                                        type="text" value={patientName}
                                        onChange={(e) => { setPatientName(e.target.value); setBookError('') }}
                                        placeholder="Patient name"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                    />
                                    <input
                                        type="number" value={patientAge}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setPatientAge(val);
                                            setBookError('');
                                            const num = parseInt(val, 10);
                                            if (!isNaN(num) && num >= 60) setPatientType('senior');
                                            else if (!isNaN(num) && num < 60 && num > 0) setPatientType('normal');
                                        }}
                                        placeholder="Age" min="1" max="120"
                                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-700 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                                    />
                                </div>

                                {/* Time Slots */}
                                <div className="mb-3">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Select Time Slot</p>
                                    {displaySlots.length > 0 ? (
                                        <div className="grid grid-cols-3 gap-2">
                                            {displaySlots.map((slot) => {

                                            const status = getSlotStatus(slot, bookings)
                                            const bookResult = canBook(slot, patientType, bookings)
                                            const isFull = !bookResult.allowed
                                            const isSelected = selectedSlot === slot

                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => { if (!isFull) { setSelectedSlot(slot); setBookError('') } }}
                                                    disabled={isFull}
                                                    className={`relative px-2 py-2 rounded-xl text-xs font-semibold transition-all text-center ${isFull
                                                        ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                                                        : isSelected
                                                            ? appointmentType === 'virtual'
                                                                ? 'bg-teal-600 text-white shadow-md shadow-teal-200'
                                                                : 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                            : 'bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                                                    }`}
                                                >
                                                    <span>{slot}</span>
                                                    <span className={`block text-[9px] mt-0.5 ${isSelected ? 'text-white/70' : isFull ? 'text-gray-300' : 'text-gray-400'}`}>
                                                        {status.normal}/{SLOT_CONFIG.normalCapacity}N · {status.reserved}/{SLOT_CONFIG.reservedCapacity}R
                                                    </span>
                                                </button>
                                            )
                                        })}
                                        </div>
                                    ) : (
                                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                                            <p className="text-sm font-semibold text-gray-500">
                                                {selectedDate === weekDays[0].dateString
                                                    ? `All ${appointmentType} slots have passed for today.`
                                                    : `No ${appointmentType} slots available for this day.`}
                                            </p>
                                            {selectedDate === weekDays[0].dateString && (
                                                <button
                                                    onClick={() => { setSelectedDate(weekDays[1].dateString); setSelectedSlot(null) }}
                                                    className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                                                >
                                                    Check tomorrow →
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {bookError && (
                                    <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg mb-3">{bookError}</p>
                                )}

                                {/* Fee summary + Book button */}
                                {selectedSlot && (
                                    <div className="flex items-center justify-between mb-3 px-3 py-2 bg-gray-50 rounded-xl">
                                        <span className="text-xs text-gray-500">Consultation Fee</span>
                                        <span className="text-sm font-bold text-green-600">₹{currentFee}</span>
                                    </div>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedSlot}
                                    className={`w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${selectedSlot
                                        ? appointmentType === 'virtual'
                                            ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-md shadow-teal-200 active:scale-[0.98]'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 active:scale-[0.98]'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    }`}
                                >
                                    {appointmentType === 'virtual' && <Video size={14} />}
                                    {appointmentType === 'in-person' && <MapPin size={14} />}
                                    {selectedSlot ? `Confirm ${appointmentType === 'virtual' ? 'Video' : ''} Booking — ${selectedSlot}` : 'Select a slot'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="px-4 py-4 text-center fade-in-up">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <Check size={20} className="text-green-600" />
                        </div>
                        <p className="text-sm font-semibold text-green-600">Booked!</p>
                        <p className="text-xs text-gray-400">
                            {selectedDateFormatted} · {selectedSlot} · {appointmentType === 'virtual' ? '📹 Video' : '🏥 In-Person'} · {patientType === 'senior' ? '👴 Senior' : '👤 Normal'} · Age: {patientAge}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
