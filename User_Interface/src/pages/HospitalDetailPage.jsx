import { useState, useMemo } from 'react'
import {
    ArrowLeft, Star, MapPin, Phone, Globe,
    Shield, Award, Search, ChevronDown, ChevronUp,
    CheckCircle2, Users, Stethoscope, Car, Coffee,
    Wifi, Accessibility, Ambulance, Droplets, Pill, Heart,
    ShieldCheck, CalendarDays, MessageSquare
} from 'lucide-react'
import DoctorCard from '../components/DoctorCard'

const facilityIcons = {
    'Parking': Car, 'Cafeteria': Coffee, 'WiFi': Wifi, 'Wheelchair Access': Accessibility,
    'Ambulance': Ambulance, 'Blood Bank': Droplets, 'Pharmacy': Pill, 'ICU': Heart,
    '24/7 Emergency': Shield, 'Helipad': Globe, 'NICU': Heart, 'Research Lab': Search, 'Trauma Centre': Shield,
}

export default function HospitalDetailPage({ hospital, onBack, onBook, bookings = [], onBookingComplete, user, onSignInClick }) {
    const [specialtyFilter, setSpecialtyFilter] = useState('All')
    const [searchDoc, setSearchDoc] = useState('')
    const [showAllInfo, setShowAllInfo] = useState(false)
    const [showReviews, setShowReviews] = useState(false)

    const uniqueSpecialties = useMemo(() => {
        const specs = hospital.doctors.map(d => d.specialty)
        return ['All', ...new Set(specs)]
    }, [hospital])

    const filteredDoctors = useMemo(() => {
        let docs = [...hospital.doctors]
        if (specialtyFilter !== 'All') docs = docs.filter(d => d.specialty === specialtyFilter)
        if (searchDoc) {
            const q = searchDoc.toLowerCase()
            docs = docs.filter(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q) || (d.qualification || '').toLowerCase().includes(q))
        }
        return docs
    }, [hospital.doctors, specialtyFilter, searchDoc])

    const today = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hospital Header */}
            <div className="relative">
                <div className="relative h-56 sm:h-72 lg:h-80">
                    <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                    <button onClick={onBack} className="absolute top-4 left-4 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors group">
                        <ArrowLeft size={18} className="text-gray-700 group-hover:text-blue-600 transition-colors" />
                    </button>

                    {/* Accreditation badges */}
                    {hospital.accreditations && (
                        <div className="absolute top-4 right-4 flex gap-1.5">
                            {hospital.accreditations.map(acc => (
                                <span key={acc} className="bg-white/90 backdrop-blur-sm text-gray-800 text-[10px] font-bold px-2 py-1 rounded-full shadow flex items-center gap-1">
                                    <ShieldCheck size={10} className="text-blue-600" /> {acc}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 lg:p-8">
                        <div className="max-w-[1200px] mx-auto">
                            <div className="flex items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white mb-2 drop-shadow-lg">{hospital.name}</h1>
                                    <p className="text-white/80 text-sm sm:text-base font-medium mb-1">{hospital.specialties.join(' • ')}</p>
                                    <div className="flex items-center gap-2 text-white/70 text-xs sm:text-sm">
                                        <MapPin size={14} /> {hospital.address}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                    <div className="flex items-center gap-1.5 bg-green-600 text-white px-3 py-1.5 rounded-xl shadow-lg">
                                        <span className="text-lg font-bold">{hospital.rating}</span>
                                        <Star size={14} fill="white" />
                                    </div>
                                    <span className="text-white/60 text-xs font-medium">{hospital.totalRatings.toLocaleString()} ratings</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick stats */}
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 relative z-10">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-50">
                                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Users size={18} className="text-purple-600" /></div>
                                <div><p className="text-[10px] text-gray-400 font-medium uppercase">Doctors</p><p className="text-sm font-bold text-gray-800">{hospital.doctors.length} Available</p></div>
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50">
                                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center"><Shield size={18} className="text-amber-600" /></div>
                                <div><p className="text-[10px] text-gray-400 font-medium uppercase">Status</p><p className={`text-sm font-bold ${hospital.openNow ? 'text-green-600' : 'text-red-500'}`}>{hospital.openNow ? 'Open Now' : 'Closed'}</p></div>
                            </div>
                        </div>

                        {/* Expandable details */}
                        <button onClick={() => setShowAllInfo(!showAllInfo)} className="flex items-center gap-1.5 mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            {showAllInfo ? 'Less Info' : 'More Info'}
                            {showAllInfo ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>

                        {showAllInfo && (
                            <div className="mt-4 pt-4 border-t border-gray-100 space-y-6 fade-in-up">
                                {/* Facilities */}
                                {hospital.facilities && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Facilities</h4>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                            {hospital.facilities.map(facility => {
                                                const Icon = facilityIcons[facility] || CheckCircle2
                                                return (
                                                    <div key={facility} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl text-xs text-gray-600">
                                                        <Icon size={14} className="text-blue-500 flex-shrink-0" />
                                                        <span className="truncate">{facility}</span>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Working Hours */}
                                {hospital.workingHours && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Working Hours</h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {Object.entries(hospital.workingHours).map(([day, hours]) => (
                                                <div key={day} className={`flex items-center justify-between p-2 rounded-xl text-xs ${day === today ? 'bg-blue-100 border border-blue-200 font-bold text-blue-700' : 'bg-gray-50 text-gray-600'}`}>
                                                    <span>{day}</span>
                                                    <span className={`text-[10px] ${hours === 'Closed' ? 'text-red-500 font-bold' : ''}`}>{hours}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Insurance Partners */}
                                {hospital.insurancePartners && (
                                    <div>
                                        <h4 className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Insurance Partners</h4>
                                        <div className="flex gap-2 flex-wrap">
                                            {hospital.insurancePartners.map(partner => (
                                                <span key={partner} className="text-xs text-gray-600 bg-green-50 border border-green-100 px-3 py-1.5 rounded-xl font-medium">
                                                    ✅ {partner}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Contact */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Phone size={16} className="text-gray-400" /> +91 98765 43210
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                        <Globe size={16} className="text-gray-400" /> www.{hospital.name.toLowerCase().replace(/\s/g, '')}.com
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Doctors Section */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-7 bg-blue-600 rounded-full" />
                        <div>
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Our Doctors</h2>
                            <p className="text-xs text-gray-400">{filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} available</p>
                        </div>
                    </div>
                    <div className="relative hidden sm:block">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="text" placeholder="Search doctors..." value={searchDoc} onChange={(e) => setSearchDoc(e.target.value)}
                            className="pl-9 pr-4 py-2 rounded-xl bg-gray-50 border border-gray-100 text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all w-48" />
                    </div>
                </div>

                {/* Specialty tabs */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 mb-2">
                    {uniqueSpecialties.map(spec => (
                        <button key={spec} onClick={() => setSpecialtyFilter(spec)}
                            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${specialtyFilter === spec ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}>
                            {spec}
                        </button>
                    ))}
                </div>

                {/* Mobile search */}
                <div className="sm:hidden mb-4">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                        <input type="text" placeholder="Search doctors..." value={searchDoc} onChange={(e) => setSearchDoc(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-100 text-xs text-gray-600 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all" />
                    </div>
                </div>

                {/* Doctor cards */}
                {filteredDoctors.length > 0 ? (
                    <div className="space-y-4">
                        {filteredDoctors.map((doctor) => (
                            <DoctorCard
                                key={doctor._id || doctor.id}
                                doctor={doctor}
                                onBook={onBook}
                                bookings={bookings.filter(b => b.doctorId === (doctor._id || doctor.id))}
                                hospitalName={hospital.name}
                                onBookingComplete={onBookingComplete}
                                user={user}
                                onSignInClick={onSignInClick}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Stethoscope size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-700 mb-1">No doctors found</h3>
                        <p className="text-sm text-gray-400">Try a different specialty or search term</p>
                    </div>
                )}
            </div>

            {/* Reviews Section — at the end */}
            {hospital.reviews && hospital.reviews.length > 0 && (
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
                    <button
                        onClick={() => setShowReviews(!showReviews)}
                        className="w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center justify-between hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                                <MessageSquare size={18} className="text-amber-600" />
                            </div>
                            <div className="text-left">
                                <h4 className="text-sm font-bold text-gray-800">Patient Reviews</h4>
                                <p className="text-xs text-gray-400">{hospital.reviews.length} reviews</p>
                            </div>
                        </div>
                        {showReviews ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    </button>

                    {showReviews && (
                        <div className="mt-3 space-y-3 fade-in-up">
                            {hospital.reviews.map(review => (
                                <div key={review.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-[11px] font-bold">
                                                {review.name.charAt(0)}
                                            </div>
                                            <span className="text-sm font-bold text-gray-700">{review.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {Array.from({ length: 5 }).map((_, i) => (
                                                <Star key={i} size={12} fill={i < review.rating ? '#f59e0b' : 'none'} className={i < review.rating ? 'text-amber-400' : 'text-gray-200'} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed">{review.comment}</p>
                                    <span className="text-[10px] text-gray-300 mt-2 block">{review.date}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
