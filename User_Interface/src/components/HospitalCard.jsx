import { Star, MapPin, ShieldCheck, Clock } from 'lucide-react'
import { useMouseParallax } from '../utils/useAnimations'

export default function HospitalCard({ hospital, onClick, index }) {
    const parallax = useMouseParallax(6)

    return (
        <div
            onClick={onClick}
            className="group cursor-pointer"
            style={{ transitionDelay: `${index * 60}ms` }}
        >
            <div
                ref={parallax.ref}
                onMouseMove={parallax.onMouseMove}
                onMouseLeave={parallax.onMouseLeave}
                className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
                style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease', willChange: 'transform' }}
            >
                {/* Image with zoom */}
                <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <img
                        src={hospital.image || "https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=400&h=300"}
                        alt={hospital.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Top badges */}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                        {hospital.accreditations?.includes('NABH') && (
                            <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold shadow-lg animate-scale-bounce" style={{ animationDelay: `${index * 100}ms` }}>
                                <ShieldCheck size={12} /> NABH
                            </div>
                        )}
                        {hospital.verified && !hospital.accreditations?.includes('NABH') && (
                            <div className="bg-blue-500 text-white px-2 py-1 rounded-full flex items-center gap-1 text-xs font-semibold shadow-lg">
                                <ShieldCheck size={14} /> Verified
                            </div>
                        )}
                    </div>

                    {/* Bottom badges */}
                    <div className="absolute bottom-2 left-2 flex gap-1.5">
                        <div className="glass rounded-lg flex items-center gap-1 text-xs font-bold px-2 py-1 shadow-md">
                            <Star size={12} fill="#10b981" className="text-green-500" />
                            {hospital.rating}
                        </div>
                        {hospital.openNow !== undefined && (
                            <div className={`px-2 py-1 rounded-lg text-[10px] font-bold shadow-md ${hospital.openNow ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                                {hospital.openNow ? 'Open Now' : 'Closed'}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="font-bold text-base text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors mb-1.5 hover-underline-grow inline-block">
                        {hospital.name}
                    </h3>

                    {/* Specialty tags */}
                    {hospital.specialties && (
                        <div className="flex gap-1 mb-2 flex-wrap">
                            {hospital.specialties.slice(0, 3).map((spec, i) => (
                                <span key={spec} className={`text-[9px] font-bold px-2 py-0.5 rounded-full transition-all group-hover:scale-105 ${
                                    i === 0 ? 'bg-blue-100 text-blue-700'
                                    : i === 1 ? 'bg-purple-100 text-purple-700'
                                    : 'bg-amber-100 text-amber-700'
                                }`}>
                                    {spec}
                                </span>
                            ))}
                        </div>
                    )}

                    <p className="text-[10px] text-gray-400 flex items-start gap-1 mb-2">
                        <MapPin size={10} className="flex-shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{hospital.address || hospital.location}</span>
                    </p>

                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-blue-200/50 hover:shadow-lg hover:shadow-blue-300/40 active:scale-[0.98]">
                        Book Appointment
                    </button>
                </div>
            </div>
        </div>
    )
}
