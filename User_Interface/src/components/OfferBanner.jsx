import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'

export default function OfferBanner({ offers }) {
    const scrollRef = useRef(null)
    const [copiedId, setCopiedId] = useState(null)

    const scroll = (direction) => {
        const el = scrollRef.current
        if (el) {
            const scrollAmount = direction === 'left' ? -320 : 320
            el.scrollBy({ left: scrollAmount, behavior: 'smooth' })
        }
    }

    const copyCode = (id, code) => {
        navigator.clipboard?.writeText(code)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    return (
        <div className="relative group/offers">
            <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-all opacity-0 group-hover/offers:opacity-100"
            >
                <ChevronLeft size={16} className="text-gray-600" />
            </button>

            <div ref={scrollRef} className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                {offers.map((offer) => (
                    <div
                        key={offer.id}
                        className={`flex-shrink-0 w-72 sm:w-80 bg-gradient-to-r ${offer.color} rounded-2xl p-5 text-white relative overflow-hidden`}
                    >
                        {/* Decorative circles */}
                        <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full" />
                        <div className="absolute -right-2 -bottom-8 w-20 h-20 bg-white/5 rounded-full" />

                        <h3 className="text-lg font-bold mb-1">{offer.title}</h3>
                        <p className="text-white/80 text-sm mb-3">{offer.description}</p>
                        <button
                            onClick={() => copyCode(offer.id, offer.code)}
                            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-xs font-bold"
                        >
                            {copiedId === offer.id ? (
                                <><Check size={12} /> Copied!</>
                            ) : (
                                <><Copy size={12} /> {offer.code}</>
                            )}
                        </button>
                    </div>
                ))}
            </div>

            <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-9 h-9 bg-white rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:shadow-xl transition-all opacity-0 group-hover/offers:opacity-100"
            >
                <ChevronRight size={16} className="text-gray-600" />
            </button>
        </div>
    )
}
