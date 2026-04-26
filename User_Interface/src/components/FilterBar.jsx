import { Star, SlidersHorizontal, ArrowDownUp, X } from 'lucide-react'

const filterOptions = [
    { id: 'rating4', label: 'Rating 4.0+', type: 'rating' },
    { id: 'rating4.5', label: 'Rating 4.5+', type: 'rating' },
    { id: 'distance3', label: 'Within 3 km', type: 'distance' },
    { id: 'distance5', label: 'Within 5 km', type: 'distance' },
]

const specialtyFilters = [
    'Cardiology', 'Pediatrics', 'Orthopedics', 'Neurology',
    'Dermatology', 'General', 'Gynecology', 'ENT', 'Dentistry', 'Ophthalmology',
]

const sortOptions = [
    { id: 'relevance', label: 'Relevance' },
    { id: 'rating', label: 'Rating: High to Low' },
    { id: 'distance', label: 'Distance: Nearest' },
    { id: 'name', label: 'Alphabetical' },
]

export default function FilterBar({ filters, setFilters, sortBy, setSortBy }) {
    const handleFilterToggle = (filterId) => {
        setFilters(prev => {
            const updated = { ...prev }
            if (filterId.startsWith('rating')) {
                updated.rating = updated.rating === filterId ? null : filterId
            } else if (filterId.startsWith('distance')) {
                updated.distance = updated.distance === filterId ? null : filterId
            }
            return updated
        })
    }

    const handleSpecialtyToggle = (specialty) => {
        setFilters(prev => {
            const current = prev.specialty || []
            const updated = current.includes(specialty)
                ? current.filter(s => s !== specialty)
                : [...current, specialty]
            return { ...prev, specialty: updated }
        })
    }

    const clearAll = () => {
        setFilters({ rating: null, distance: null, specialty: [] })
        setSortBy('relevance')
    }

    const hasActiveFilters = filters.rating || filters.distance || (filters.specialty && filters.specialty.length > 0) || sortBy !== 'relevance'

    return (
        <div className="bg-white border-b border-gray-100 transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4 py-3">
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {/* Filter icon */}
                    <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 flex-shrink-0">
                        <SlidersHorizontal size={14} />
                        Filters
                    </div>

                    {/* Sort dropdown */}
                    <div className="relative group flex-shrink-0">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="appearance-none px-3 py-2 pr-7 rounded-full bg-gray-50 border border-gray-200 text-xs font-semibold text-gray-600 cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            {sortOptions.map(opt => (
                                <option key={opt.id} value={opt.id} className="bg-white text-gray-900">{opt.label}</option>
                            ))}
                        </select>
                        <ArrowDownUp size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

                    {/* Rating / Distance filters */}
                    {filterOptions.map(option => {
                        const isActive = filters[option.type] === option.id
                        return (
                            <button
                                key={option.id}
                                onClick={() => handleFilterToggle(option.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${isActive
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                {option.type === 'rating' && <Star size={12} fill={isActive ? 'white' : 'none'} />}
                                {option.label}
                            </button>
                        )
                    })}

                    {/* Divider */}
                    <div className="w-px h-6 bg-gray-200 flex-shrink-0" />

                    {/* Specialty filters */}
                    {specialtyFilters.map(spec => {
                        const isActive = filters.specialty?.includes(spec)
                        return (
                            <button
                                key={spec}
                                onClick={() => handleSpecialtyToggle(spec)}
                                className={`px-3 py-2 rounded-full border text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0
                  ${isActive
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                {spec}
                            </button>
                        )
                    })}

                    {/* Clear all */}
                    {hasActiveFilters && (
                        <>
                            <div className="w-px h-6 bg-gray-200 flex-shrink-0" />
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors whitespace-nowrap flex-shrink-0"
                            >
                                <X size={12} />
                                Clear All
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
