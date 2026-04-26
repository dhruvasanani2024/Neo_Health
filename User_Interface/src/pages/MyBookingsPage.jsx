import { useState } from 'react'
import { ArrowLeft, Calendar, Clock, Video, MapPin, Star, XCircle, RefreshCcw, Phone, Filter } from 'lucide-react'

const statusSteps = ['Booked', 'Confirmed', 'In Progress', 'Completed']
const statusColors = {
    'Upcoming': 'bg-blue-100 text-blue-700',
    'Completed': 'bg-green-100 text-green-700',
    'Cancelled': 'bg-red-100 text-red-700',
}

function getBookingStatus(booking) {
    if (booking.cancelled) return 'Cancelled'
    if (booking.completed) return 'Completed'
    return 'Upcoming'
}

function StatusTimeline({ status }) {
    const currentStep = status === 'Cancelled' ? -1
        : status === 'Completed' ? 3
        : status === 'Upcoming' ? 1
        : 0

    return (
        <div className="flex items-center gap-1 mt-3">
            {statusSteps.map((step, i) => (
                <div key={step} className="flex items-center gap-1 flex-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 transition-all ${
                        i <= currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                        {i <= currentStep ? '✓' : i + 1}
                    </div>
                    {i < statusSteps.length - 1 && (
                        <div className={`flex-1 h-0.5 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                    )}
                </div>
            ))}
        </div>
    )
}

export default function MyBookingsPage({ bookings = [], onBack, onCancelBooking }) {
    const [activeTab, setActiveTab] = useState('All')
    const tabs = ['All', 'Upcoming', 'Completed', 'Cancelled']

    const filteredBookings = activeTab === 'All'
        ? bookings
        : bookings.filter(b => getBookingStatus(b) === activeTab)

    return (
        <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button onClick={onBack} className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 hover:bg-gray-50 transition">
                    <ArrowLeft size={18} className="text-gray-700" />
                </button>
                <div>
                    <h1 className="text-xl font-extrabold text-gray-800">My Bookings</h1>
                    <p className="text-xs text-gray-400">{bookings.length} total appointments</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
                {tabs.map(tab => {
                    const count = tab === 'All' ? bookings.length : bookings.filter(b => getBookingStatus(b) === tab).length
                    return (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                activeTab === tab
                                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                            }`}
                        >
                            {tab}
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                activeTab === tab ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-400'
                            }`}>{count}</span>
                        </button>
                    )
                })}
            </div>

            {/* Bookings list */}
            {filteredBookings.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <Calendar size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-1">No Bookings Yet</h3>
                    <p className="text-sm text-gray-300">Find a doctor and book your first appointment</p>
                    <button onClick={onBack} className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow hover:bg-blue-700 transition">
                        Browse Hospitals
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredBookings.map((booking, idx) => {
                        const status = getBookingStatus(booking)
                        const isVirtual = booking.appointmentType === 'virtual'

                        return (
                            <div key={booking.id || idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                                <div className="p-4">
                                    {/* Doctor info */}
                                    <div className="flex items-start gap-3">
                                        <img src={booking.doctorImage} alt={booking.doctor} className="w-14 h-14 rounded-2xl object-cover bg-gray-100 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-bold text-gray-800 truncate">{booking.doctor}</h3>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${statusColors[status]}`}>
                                                    {status}
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-400">{booking.specialty} • {booking.hospital}</p>

                                            {/* Booking details */}
                                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                                    <Calendar size={11} /> {booking.date}
                                                </span>
                                                <span className="flex items-center gap-1 text-[11px] text-gray-500">
                                                    <Clock size={11} /> {booking.slotTime}
                                                </span>
                                                <span className={`flex items-center gap-1 text-[11px] font-semibold ${isVirtual ? 'text-teal-600' : 'text-blue-600'}`}>
                                                    {isVirtual ? <Video size={11} /> : <MapPin size={11} />}
                                                    {isVirtual ? 'Video Call' : 'In-Person'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Timeline */}
                                    {status !== 'Cancelled' && <StatusTimeline status={status} />}

                                    {/* Fee & Patient */}
                                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                                        <span className="text-[11px] text-gray-400">
                                            {booking.patientName} • Age {booking.patientAge} • {booking.patientType === 'senior' ? '👴 Senior' : '👤 Normal'}
                                        </span>
                                        <span className="text-xs font-bold text-green-600">₹{booking.fee}</span>
                                    </div>

                                    {/* Action buttons */}
                                    {status === 'Upcoming' && (
                                        <div className="flex gap-2 mt-3">
                                            {isVirtual ? (
                                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-sm">
                                                    <Video size={13} /> Join Video Call
                                                </button>
                                            ) : (
                                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm">
                                                    <MapPin size={13} /> Get Directions
                                                </button>
                                            )}
                                            <button
                                                onClick={() => onCancelBooking && onCancelBooking(booking.id)}
                                                className="flex items-center justify-center gap-1 px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition"
                                            >
                                                <XCircle size={13} /> Cancel
                                            </button>
                                        </div>
                                    )}

                                    {status === 'Completed' && !booking.rated && (
                                        <button className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 bg-amber-50 text-amber-600 rounded-xl text-xs font-bold hover:bg-amber-100 transition">
                                            <Star size={13} /> Rate Your Visit
                                        </button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
