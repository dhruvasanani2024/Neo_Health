import { useState, useEffect } from 'react'
import { Calendar, Pill, TestTube, ArrowRight, Sparkles } from 'lucide-react'

const services = [
    {
        id: 1,
        title: 'Book Appointments',
        subtitle: 'Find & consult with top doctors',
        description: '500+ verified doctors across all specialties',
        icon: Calendar,
        gradient: 'from-blue-600 via-blue-700 to-indigo-800',
        accentColor: 'text-blue-300',
        stats: ['500+ Doctors', '50+ Hospitals', '4.5★ Rating']
    },
    {
        id: 2,
        title: 'Order Medicines',
        subtitle: 'Get medicines delivered to your door',
        description: '100% genuine medicines with fast delivery',
        icon: Pill,
        gradient: 'from-green-600 via-emerald-600 to-teal-700',
        accentColor: 'text-green-300',
        stats: ['24 Products', 'Same Day Delivery', '100% Genuine']
    },
    {
        id: 3,
        title: 'Lab Tests',
        subtitle: 'Book lab tests from home',
        description: 'Accurate reports from certified labs',
        icon: TestTube,
        gradient: 'from-purple-600 via-purple-700 to-indigo-800',
        accentColor: 'text-purple-300',
        stats: ['100+ Tests', 'Home Sample', 'Quick Reports']
    }
]

export default function AnimatedHeroSection({ onPharmacyClick, onBookAppointmentClick }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [isAnimating, setIsAnimating] = useState(false)

    useEffect(() => {
        const interval = setInterval(() => {
            setIsAnimating(true)
            setTimeout(() => {
                setActiveIndex((prev) => (prev + 1) % services.length)
                setIsAnimating(false)
            }, 300)
        }, 4000) // Switch every 4 seconds

        return () => clearInterval(interval)
    }, [])

    const activeService = services[activeIndex]
    const Icon = activeService.icon

    const handleServiceClick = (index) => {
        if (index === activeIndex) return
        setIsAnimating(true)
        setTimeout(() => {
            setActiveIndex(index)
            setIsAnimating(false)
        }, 300)
    }

    const handleCTAClick = () => {
        if (activeIndex === 0) {
            // Book Appointments → scroll to hospitals
            onBookAppointmentClick?.()
        } else if (activeIndex === 1) {
            // Pharmacy
            onPharmacyClick()
        }
        // Lab Tests (index 2) is coming soon — no action
    }

    return (
        <section className="py-6 sm:py-8">
            <div className={`bg-gradient-to-br ${activeService.gradient} rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-2xl transition-all duration-500`}>
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2 animate-pulse" />
                    <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-white rounded-full translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
                    <div className="absolute top-1/2 left-0 w-48 h-48 bg-white rounded-full -translate-x-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10">
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        {/* Left Content */}
                        <div className={`transition-all duration-500 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-semibold">Featured Service</span>
                                {activeIndex === 2 && (
                                    <span className="ml-2 bg-yellow-400 text-yellow-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Coming Soon</span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-5xl font-extrabold mb-3 leading-tight">
                                {activeService.title}
                            </h1>
                            <p className="text-xl sm:text-2xl text-white/90 mb-2 font-medium">
                                {activeService.subtitle}
                            </p>
                            <p className="text-white/70 text-sm sm:text-base mb-6">
                                {activeService.description}
                            </p>

                            {/* Stats */}
                            <div className="flex flex-wrap gap-3 mb-6">
                                {activeService.stats.map((stat, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2.5">
                                        <span className="text-sm font-medium">{stat}</span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleCTAClick}
                                className={`group bg-white text-gray-900 px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-2xl transition-all flex items-center gap-3 hover:gap-4 ${activeIndex === 2 ? 'opacity-60 cursor-not-allowed' : ''}`}
                                disabled={activeIndex === 2}
                            >
                                {activeIndex === 2 ? 'Coming Soon' : 'Get Started'}
                                {activeIndex !== 2 && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </div>

                        {/* Right Icon */}
                        <div className="hidden md:flex items-center justify-center">
                            <div className={`transition-all duration-500 ${isAnimating ? 'scale-75 opacity-0 rotate-12' : 'scale-100 opacity-100 rotate-0'}`}>
                                <div className="relative">
                                    {/* Glow Effect */}
                                    <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl animate-pulse" />

                                    {/* Icon Container */}
                                    <div className="relative bg-white/10 backdrop-blur-md rounded-full p-16 border-4 border-white/20">
                                        <Icon className="w-32 h-32 text-white drop-shadow-2xl" strokeWidth={1.5} />
                                    </div>

                                    {/* Floating Particles */}
                                    <div className="absolute -top-4 -right-4 w-8 h-8 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
                                    <div className="absolute -bottom-6 -left-6 w-6 h-6 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }} />
                                    <div className="absolute top-1/2 -right-8 w-4 h-4 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Service Switcher Dots */}
                    <div className="flex items-center justify-center gap-3 mt-8">
                        {services.map((service, index) => {
                            const ServiceIcon = service.icon
                            return (
                                <button
                                    key={service.id}
                                    onClick={() => handleServiceClick(index)}
                                    className={`group relative transition-all duration-300 ${index === activeIndex
                                            ? 'scale-110'
                                            : 'scale-100 hover:scale-105'
                                        }`}
                                >
                                    {/* Active Indicator */}
                                    {index === activeIndex && (
                                        <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md animate-pulse" />
                                    )}

                                    {/* Icon Button */}
                                    <div className={`relative flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all ${index === activeIndex
                                            ? 'bg-white text-gray-900 border-white shadow-lg'
                                            : 'bg-white/10 backdrop-blur-sm text-white border-white/20 hover:bg-white/20'
                                        }`}>
                                        <ServiceIcon className="w-5 h-5" />
                                        <span className="text-sm font-semibold hidden sm:inline">
                                            {service.title.split(' ')[0]}
                                        </span>
                                        {/* Coming Soon badge for Lab Tests */}
                                        {index === 2 && (
                                            <span className={`absolute -top-2 -right-2 text-[7px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                                                index === activeIndex
                                                    ? 'bg-yellow-400 text-yellow-900'
                                                    : 'bg-yellow-400/90 text-yellow-900'
                                            }`}>Soon</span>
                                        )}
                                    </div>

                                    {/* Progress Bar for Active */}
                                    {index === activeIndex && (
                                        <div className="absolute -bottom-2 left-0 right-0 h-1 bg-white/30 rounded-full overflow-hidden">
                                            <div className="h-full bg-white rounded-full animate-progress" />
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </section>
    )
}
