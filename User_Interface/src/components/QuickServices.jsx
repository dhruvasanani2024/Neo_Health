import { TestTube2, Ambulance, ShieldCheck, Users, FileText, Pill, HeartPulse } from 'lucide-react'
import { useScrollReveal } from '../utils/useAnimations'

const services = [
    { id: 1, name: 'Lab Tests', desc: 'Book blood tests, X-ray, MRI', icon: TestTube2, color: 'from-blue-500 to-cyan-600', shadow: 'shadow-blue-200', glow: 'hover:shadow-blue-300/50' },
    { id: 2, name: 'Ambulance', desc: '24/7 emergency ambulance', icon: Ambulance, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-200', glow: 'hover:shadow-red-300/50' },
    { id: 3, name: 'Insurance', desc: 'Verify & claim insurance', icon: ShieldCheck, color: 'from-green-500 to-emerald-600', shadow: 'shadow-green-200', glow: 'hover:shadow-green-300/50' },
    { id: 4, name: 'Second Opinion', desc: 'Get expert review of diagnosis', icon: Users, color: 'from-purple-500 to-violet-600', shadow: 'shadow-purple-200', glow: 'hover:shadow-purple-300/50' },
    { id: 5, name: 'Health Records', desc: 'Upload & manage records', icon: FileText, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-200', glow: 'hover:shadow-amber-300/50' },
    { id: 6, name: 'Medicine Refill', desc: 'Quick prescription refill', icon: Pill, color: 'from-teal-500 to-cyan-600', shadow: 'shadow-teal-200', glow: 'hover:shadow-teal-300/50' },
    { id: 7, name: 'Vitals Monitor', desc: 'Track BP, Sugar, SpO2', icon: HeartPulse, color: 'from-pink-500 to-rose-600', shadow: 'shadow-pink-200', glow: 'hover:shadow-pink-300/50' },
]

export default function QuickServices({ onPharmacyClick }) {
    const [sectionRef, isVisible] = useScrollReveal()

    const handleClick = (service) => {
        if (service.name === 'Medicine Refill' && onPharmacyClick) {
            onPharmacyClick()
        }
    }

    return (
        <section className="py-6" ref={sectionRef}>
            <div className={`reveal-left ${isVisible ? 'visible' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-violet-600 rounded-full" />
                    <div>
                        <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Quick Services</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Everything health, one tap away</p>
                    </div>
                </div>
            </div>

            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 stagger-children ${isVisible ? 'visible' : ''}`}>
                {services.map((service) => {
                    const Icon = service.icon
                    return (
                        <button
                            key={service.id}
                            onClick={() => handleClick(service)}
                            className={`relative bg-white rounded-2xl border border-gray-100 p-4 text-left card-interactive hover:shadow-xl ${service.glow} transition-all group overflow-hidden active:scale-[0.97]`}
                        >
                            {/* Animated gradient blob on hover */}
                            <div className={`absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-bl ${service.color} opacity-0 group-hover:opacity-10 rounded-full transition-all duration-500 group-hover:scale-150 blur-xl`} />

                            <div className={`w-11 h-11 bg-gradient-to-br ${service.color} rounded-xl flex items-center justify-center shadow-sm mb-3 icon-magnetic`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors hover-underline-grow">{service.name}</h3>
                            <p className="text-[10px] text-gray-400 mt-0.5 line-clamp-1">{service.desc}</p>

                            {/* Coming soon badge */}
                            {!['Medicine Refill'].includes(service.name) && (
                                <span className="absolute top-2 right-2 text-[8px] font-bold text-gray-300 bg-gray-50 px-1.5 py-0.5 rounded-full">Soon</span>
                            )}
                        </button>
                    )
                })}
            </div>
        </section>
    )
}
