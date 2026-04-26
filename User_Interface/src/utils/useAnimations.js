import { useEffect, useRef, useState } from 'react'

/**
 * Custom hook for scroll-triggered reveal animations.
 * Adds 'visible' class when element enters viewport.
 */
export function useScrollReveal(options = {}) {
    const ref = useRef(null)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true)
                    observer.unobserve(el)
                }
            },
            { threshold: options.threshold || 0.15, rootMargin: options.rootMargin || '0px' }
        )

        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return [ref, isVisible]
}

/**
 * Custom hook for counting up numbers (animated counters).
 */
export function useCountUp(target, duration = 1500, start = false) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!start) return
        let startTime = null
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp
            const progress = Math.min((timestamp - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3) // easeOutCubic
            setCount(Math.floor(eased * target))
            if (progress < 1) requestAnimationFrame(step)
        }
        requestAnimationFrame(step)
    }, [start, target, duration])

    return count
}

/**
 * Custom hook for mouse parallax effect on cards.
 */
export function useMouseParallax(intensity = 10) {
    const ref = useRef(null)

    const handleMouseMove = (e) => {
        const el = ref.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const x = (e.clientX - rect.left) / rect.width - 0.5
        const y = (e.clientY - rect.top) / rect.height - 0.5
        el.style.transform = `perspective(600px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateY(-4px) scale(1.02)`
    }

    const handleMouseLeave = () => {
        const el = ref.current
        if (!el) return
        el.style.transform = 'perspective(600px) rotateY(0deg) rotateX(0deg) translateY(0) scale(1)'
    }

    return { ref, onMouseMove: handleMouseMove, onMouseLeave: handleMouseLeave }
}
