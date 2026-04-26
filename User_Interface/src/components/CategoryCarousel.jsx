import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function CategoryCarousel({ categories, onCategoryClick, activeCategory }) {
    const scrollRef = useRef(null)
    const [canScrollLeft, setCanScrollLeft] = useState(false)
    const [canScrollRight, setCanScrollRight] = useState(true)

    const checkScroll = () => {
        const el = scrollRef.current
        if (el) {
            setCanScrollLeft(el.scrollLeft > 0)
            setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
        }
    }

    const scroll = (direction) => {
        const el = scrollRef.current
        if (el) {
            const scrollAmount = direction === 'left' ? -220 : 220
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
            setTimeout(checkScroll, 300)
        }
    }

    return (
        <div className="relative group/carousel">
            {/* Left scroll button */}
            {canScrollLeft && (
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                    <ChevronLeft size={16} className="text-gray-600 dark:text-gray-300" />
                </button>
            )}

            {/* Carousel */}
            <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-2 px-1"
            >
                {categories.map((cat) => {
                    const isActive = activeCategory === cat.name
                    return (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryClick(cat.name)}
                            className="flex flex-col items-center gap-2 group flex-shrink-0"
                        >
                            <div
                                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-2xl sm:text-3xl transition-all duration-300 border-2 group-hover:scale-110 group-hover:shadow-lg
                  ${isActive
                                        ? 'border-blue-500 shadow-lg shadow-blue-100 dark:shadow-blue-900/20 scale-110'
                                        : 'border-transparent group-hover:border-blue-200 dark:group-hover:border-blue-800'
                                    }`}
                                style={{ backgroundColor: cat.color }}
                            >
                                {cat.icon}
                            </div>
                            <span
                                className={`text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap
                  ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200'}`}
                            >
                                {cat.name}
                            </span>
                            {isActive && (
                                <div className="w-8 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full -mt-1" />
                            )}
                        </button>
                    )
                })}
            </div>

            {/* Right scroll button */}
            {canScrollRight && (
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all opacity-0 group-hover/carousel:opacity-100"
                >
                    <ChevronRight size={16} className="text-gray-600 dark:text-gray-300" />
                </button>
            )}
        </div>
    )
}
