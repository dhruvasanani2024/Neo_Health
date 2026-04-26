import { useState, useEffect } from 'react'
import { Check, X, Calendar, Video, MapPin, Clock, User } from 'lucide-react'

export default function BookingConfirmationModal({ isOpen, booking, onClose, onViewBookings }) {
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShowConfetti(true)
            const timer = setTimeout(() => setShowConfetti(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!isOpen || !booking) return null

    const isVirtual = booking.appointmentType === 'virtual'

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Confetti particles */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
                    {Array.from({ length: 40 }).map((_, i) => {
                        const rotation = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720)
                        return (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: '-10px',
                                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][i % 6],
                                    animation: `confetti-fall-${i} ${1.5 + Math.random() * 2}s ease-out forwards`,
                                    animationDelay: `${Math.random() * 0.5}s`,
                                }}
                            />
                        )
                    })}
                    <style>{`
                        ${Array.from({ length: 40 }).map((_, i) => {
                            const rot = (Math.random() > 0.5 ? '' : '-') + (360 + Math.floor(Math.random() * 720))
                            return `@keyframes confetti-fall-${i} {
                                0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
                                100% { transform: translateY(100vh) rotate(${rot}deg) scale(0.5); opacity: 0; }
                            }`
                        }).join('\n')}
                    `}</style>
                </div>
            )}

            {/* Modal */}
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 fade-in-up z-50">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                    <X size={16} className="text-gray-500" />
                </button>

                {/* Success icon */}
                <div className="flex justify-center mb-5">
                    <div className="relative">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-200">
                            <Check size={36} className="text-white" strokeWidth={3} />
                        </div>
                        <div className="absolute inset-0 w-20 h-20 bg-green-400 rounded-full animate-ping opacity-20" />
                    </div>
                </div>

                <h2 className="text-xl font-extrabold text-gray-800 text-center mb-1">Booking Confirmed!</h2>
                <p className="text-sm text-gray-400 text-center mb-6">Your appointment has been scheduled</p>

                {/* Booking details card */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-2xl border border-gray-100 p-4 space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                        <img src={booking.doctorImage} alt={booking.doctor} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                            <p className="text-sm font-bold text-gray-800">{booking.doctor}</p>
                            <p className="text-xs text-gray-400">{booking.specialty} • {booking.hospital}</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 grid grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Calendar size={14} className="text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Date</p>
                                <p className="text-xs font-bold text-gray-700">{booking.date}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                                <Clock size={14} className="text-purple-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Time</p>
                                <p className="text-xs font-bold text-gray-700">{booking.slotTime}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 ${isVirtual ? 'bg-teal-100' : 'bg-amber-100'} rounded-lg flex items-center justify-center`}>
                                {isVirtual ? <Video size={14} className="text-teal-600" /> : <MapPin size={14} className="text-amber-600" />}
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Type</p>
                                <p className="text-xs font-bold text-gray-700">{isVirtual ? 'Video Call' : 'In-Person'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <User size={14} className="text-green-600" />
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 uppercase">Patient</p>
                                <p className="text-xs font-bold text-gray-700 truncate">{booking.patientName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-400">Fee</span>
                        <span className="text-sm font-bold text-green-600">₹{booking.fee}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onViewBookings}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl active:scale-[0.98] transition-all"
                    >
                        View My Bookings
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-200 transition-all"
                    >
                        Done
                    </button>
                </div>

                {isVirtual && (
                    <p className="text-center text-[11px] text-teal-600 mt-3 bg-teal-50 rounded-lg py-2 font-medium">
                        📹 A video call link will be sent to your email before the appointment
                    </p>
                )}
            </div>
        </div>
    )
}
