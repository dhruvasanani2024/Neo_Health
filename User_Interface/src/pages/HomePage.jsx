import { useState, useMemo, useRef } from 'react'
import { Stethoscope, Loader2 } from 'lucide-react'
import CategoryCarousel from '../components/CategoryCarousel'
import FilterBar from '../components/FilterBar'
import HospitalCard from '../components/HospitalCard'
import AnimatedHeroSection from '../components/AnimatedHeroSection'
import QuickServices from '../components/QuickServices'
import HealthTipsFeed from '../components/HealthTipsFeed'
import { categories } from '../data/mockData'
import { useScrollReveal } from '../utils/useAnimations'

/* ── Main HomePage ───────────────────────────────── */
export default function HomePage({ searchQuery, onHospitalSelect, onPharmacyClick, hospitals = [], hospitalsLoading = false, backendOnline = false }) {
    const [filters, setFilters] = useState({ rating: null, distance: null, specialty: [] })
    const [sortBy, setSortBy] = useState('relevance')
    const [activeCategory, setActiveCategory] = useState(null)

    // Ref for scroll-to-hospitals
    const hospitalsScrollRef = useRef(null)

    const scrollToHospitals = () => {
        hospitalsScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Scroll reveal refs for individual sections
    const [categoryRef, categoryVisible] = useScrollReveal()
    const [hospitalsRef, hospitalsVisible] = useScrollReveal()
    const [footerRef, footerVisible] = useScrollReveal()

    const handleCategoryClick = (categoryName) => {
        if (activeCategory === categoryName) {
            setActiveCategory(null)
        } else {
            setActiveCategory(categoryName)
        }
    }

    const filteredHospitals = useMemo(() => {
        let result = [...hospitals]

        // Search query filter
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            result = result.filter(h =>
                h.name.toLowerCase().includes(q) ||
                h.specialty.toLowerCase().includes(q) ||
                h.specialties.some(s => s.toLowerCase().includes(q)) ||
                h.address.toLowerCase().includes(q) ||
                h.doctors.some(d => d.name.toLowerCase().includes(q) || d.specialty.toLowerCase().includes(q))
            )
        }

        // Category filter
        if (activeCategory) {
            result = result.filter(h =>
                h.specialties.includes(activeCategory)
            )
        }

        // Rating filter
        if (filters.rating === 'rating4') {
            result = result.filter(h => h.rating >= 4.0)
        } else if (filters.rating === 'rating4.5') {
            result = result.filter(h => h.rating >= 4.5)
        }

        // Distance filter
        if (filters.distance === 'distance3') {
            result = result.filter(h => h.distanceValue <= 3)
        } else if (filters.distance === 'distance5') {
            result = result.filter(h => h.distanceValue <= 5)
        }

        // Specialty filter
        if (filters.specialty && filters.specialty.length > 0) {
            result = result.filter(h =>
                filters.specialty.some(spec => h.specialties.includes(spec))
            )
        }

        // Sorting
        switch (sortBy) {
            case 'rating':
                result.sort((a, b) => b.rating - a.rating)
                break
            case 'distance':
                result.sort((a, b) => a.distanceValue - b.distanceValue)
                break
            case 'name':
                result.sort((a, b) => a.name.localeCompare(b.name))
                break
            default:
                result.sort((a, b) => (b.promoted ? 1 : 0) - (a.promoted ? 1 : 0))
        }

        return result
    }, [hospitals, searchQuery, filters, sortBy, activeCategory])

    return (
        <div className="min-h-screen bg-gray-50 transition-colors duration-300">
            <main className="max-w-[1200px] mx-auto px-4">
                {/* Animated Hero Section */}
                <AnimatedHeroSection onPharmacyClick={onPharmacyClick} onBookAppointmentClick={scrollToHospitals} />

                {/* Quick Services */}
                <QuickServices onPharmacyClick={onPharmacyClick} />

                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />

                {/* Health Tips */}
                <HealthTipsFeed />


                <div className="border-t border-gray-200 my-2" />

                {/* Categories */}
                <section className="pb-6 sm:pb-8" ref={categoryRef}>
                    <div className={`reveal ${categoryVisible ? 'visible' : ''}`}>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">
                                What are you looking for?
                            </h2>
                            {activeCategory && (
                                <button
                                    onClick={() => setActiveCategory(null)}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                        <CategoryCarousel
                            categories={categories}
                            onCategoryClick={handleCategoryClick}
                            activeCategory={activeCategory}
                        />
                    </div>
                </section>

                {/* Separator */}
                <div className="border-t border-gray-200 my-2" />

                {/* Filter Bar */}
                <FilterBar
                    filters={filters}
                    setFilters={setFilters}
                    sortBy={sortBy}
                    setSortBy={setSortBy}
                />

                {/* Hospital List */}
                <section className="py-6 sm:py-8" ref={(el) => { hospitalsRef.current = el; hospitalsScrollRef.current = el; }}>
                    <div className={`reveal ${hospitalsVisible ? 'visible' : ''}`}>
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">
                                    {activeCategory ? `${activeCategory} Hospitals` : 'Nearby Hospitals'}
                                </h2>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
                                </p>
                            </div>
                        </div>
                    </div>

                    {hospitalsLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse">
                                    <div className="h-36 bg-gray-200" />
                                    <div className="p-4 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                                        <div className="h-3 bg-gray-100 rounded w-2/3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredHospitals.length > 0 ? (
                        <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 stagger-children ${hospitalsVisible ? 'visible' : ''}`}>
                            {filteredHospitals.map((hospital, index) => (
                                <HospitalCard
                                    key={hospital.id || hospital._id}
                                    hospital={hospital}
                                    onClick={() => onHospitalSelect(hospital)}
                                    index={index}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
                                <Stethoscope size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-700 mb-1">No hospitals found</h3>
                            <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
                        </div>
                    )}
                </section>

                {/* Footer */}
                <footer className="border-t border-gray-200 py-8 mt-8 transition-colors" ref={footerRef}>
                    <div className={`reveal ${footerVisible ? 'visible' : ''}`}>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">
                            <div>
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Company</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">About Us</a></li>
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Careers</a></li>
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Blog</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">For Hospitals</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Partner With Us</a></li>
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Apps For You</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Support</h4>
                                <ul className="space-y-2">
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Help & Support</a></li>
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Privacy Policy</a></li>
                                    <li><a href="#" className="text-xs text-gray-500 hover:text-blue-600 transition-colors hover-underline-grow">Terms of Service</a></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider mb-3">Contact</h4>
                                <ul className="space-y-2">
                                    <li><span className="text-xs text-gray-500">support@neohealth.in</span></li>
                                    <li><span className="text-xs text-gray-500">+91 98765 43210</span></li>
                                </ul>
                            </div>
                        </div>
                        <div className="text-center border-t border-gray-100 pt-6">
                            <p className="text-xs text-gray-400">© 2026 NeoHealth. All rights reserved.</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    )
}
