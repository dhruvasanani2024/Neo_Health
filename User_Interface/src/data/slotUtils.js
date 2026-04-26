// Slot Management Utility
// Rules:
// - 30 min per slot
// - 3 normal capacity per slot
// - 2 reserved (senior citizen + emergency) per slot
// - Total: 5 per slot
// - If normal full, reserved slots open to ANYONE 30 min before slot time
// - Seniors CAN book normal slots too

export const SLOT_CONFIG = {
    normalCapacity: 3,
    reservedCapacity: 2,
    totalCapacity: 5,
    slotDurationMinutes: 30,
    overflowWindowMinutes: 30, // reserved slots open to all X min before slot
}

// Generate 30-min slots between start and end hours
export function generateDaySlots(startHour = 9, endHour = 17) {
    const slots = []
    for (let h = startHour; h < endHour; h++) {
        for (let m = 0; m < 60; m += 30) {
            const hour12 = h > 12 ? h - 12 : h === 0 ? 12 : h
            const ampm = h >= 12 ? 'PM' : 'AM'
            const timeStr = `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`
            slots.push({
                id: `${String(h).padStart(2, '0')}${String(m).padStart(2, '0')}`,
                time: timeStr,
                hour24: h,
                minute: m,
            })
        }
    }
    return slots
}

// All possible day slots
export const ALL_DAY_SLOTS = generateDaySlots(9, 17)

// Parse "09:00 AM" → { hour24, minute }
export function parseSlotTime(timeStr) {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
    if (!match) return null
    let hour = parseInt(match[1])
    const minute = parseInt(match[2])
    const ampm = match[3].toUpperCase()
    if (ampm === 'PM' && hour !== 12) hour += 12
    if (ampm === 'AM' && hour === 12) hour = 0
    return { hour24: hour, minute }
}

// Get slot booking counts
export function getSlotBookings(slotTime, bookings = []) {
    const slotBookings = bookings.filter(b => b.slotTime === slotTime)
    const normal = slotBookings.filter(b => b.patientType === 'normal').length
    const senior = slotBookings.filter(b => b.patientType === 'senior').length
    const emergency = slotBookings.filter(b => b.patientType === 'emergency').length
    return {
        normal,
        senior,
        emergency,
        reserved: senior + emergency,
        total: slotBookings.length,
        bookings: slotBookings,
    }
}

// Get availability status for a slot
export function getSlotStatus(slotTime, bookings = []) {
    const counts = getSlotBookings(slotTime, bookings)
    const normalAvailable = SLOT_CONFIG.normalCapacity - counts.normal
    const reservedAvailable = SLOT_CONFIG.reservedCapacity - counts.reserved

    let status = 'available' // available, partial, full
    if (counts.total >= SLOT_CONFIG.totalCapacity) {
        status = 'full'
    } else if (counts.normal >= SLOT_CONFIG.normalCapacity) {
        status = 'partial' // only reserved left
    }

    return {
        ...counts,
        normalAvailable: Math.max(0, normalAvailable),
        reservedAvailable: Math.max(0, reservedAvailable),
        totalAvailable: SLOT_CONFIG.totalCapacity - counts.total,
        status,
    }
}

// Check if a patient type can book a specific slot
export function canBook(slotTime, patientType, bookings = [], currentTime = new Date()) {
    const counts = getSlotBookings(slotTime, bookings)
    const parsed = parseSlotTime(slotTime)
    if (!parsed) return { allowed: false, reason: 'Invalid slot time' }

    const totalBooked = counts.total

    // Slot is completely full
    if (totalBooked >= SLOT_CONFIG.totalCapacity) {
        return { allowed: false, reason: 'Slot is fully booked' }
    }

    // Emergency patients can always book if total capacity allows
    if (patientType === 'emergency') {
        if (counts.normal < SLOT_CONFIG.normalCapacity) {
            return { allowed: true, reason: 'Normal slot available', slotType: 'normal' }
        }
        return { allowed: true, reason: 'Reserved slot for emergency', slotType: 'reserved' }
    }

    // Senior citizens can book normal OR reserved
    if (patientType === 'senior') {
        if (counts.normal < SLOT_CONFIG.normalCapacity) {
            return { allowed: true, reason: 'Normal slot available', slotType: 'normal' }
        }
        if (counts.reserved < SLOT_CONFIG.reservedCapacity) {
            return { allowed: true, reason: 'Reserved slot for senior citizen', slotType: 'reserved' }
        }
        return { allowed: false, reason: 'All slots (normal + reserved) are full' }
    }

    // Normal patients
    if (counts.normal < SLOT_CONFIG.normalCapacity) {
        return { allowed: true, reason: 'Normal slot available', slotType: 'normal' }
    }

    // Normal slots full — check if reserved overflow is active (30 min before slot)
    const slotDate = new Date(currentTime)
    slotDate.setHours(parsed.hour24, parsed.minute, 0, 0)
    const diffMs = slotDate.getTime() - currentTime.getTime()
    const diffMin = diffMs / 60000

    if (diffMin <= SLOT_CONFIG.overflowWindowMinutes && diffMin > 0) {
        if (counts.reserved < SLOT_CONFIG.reservedCapacity) {
            return { allowed: true, reason: 'Reserved slot opened (30 min before slot)', slotType: 'reserved' }
        }
    }

    if (counts.reserved < SLOT_CONFIG.reservedCapacity) {
        return {
            allowed: false,
            reason: `Normal slots full. Reserved slots open ${SLOT_CONFIG.overflowWindowMinutes} min before slot time.`,
            opensIn: Math.max(0, Math.floor(diffMin - SLOT_CONFIG.overflowWindowMinutes)),
        }
    }

    return { allowed: false, reason: 'Slot is fully booked' }
}

// Filter out past slots when the selected date is today
export function filterPastSlots(slots, selectedDate = null) {
    const now = new Date()
    const today = now.toISOString().split('T')[0]

    // Determine the date string to check
    let checkDate = today
    if (selectedDate) {
        // selectedDate can be a Date object or 'YYYY-MM-DD' string
        if (selectedDate instanceof Date) {
            checkDate = selectedDate.toISOString().split('T')[0]
        } else {
            checkDate = selectedDate
        }
    }

    // If the selected date is NOT today, return all slots (no filtering needed)
    if (checkDate !== today) return slots

    // For today: filter out any slot whose time has already passed
    const currentHour = now.getHours()
    const currentMinute = now.getMinutes()

    return slots.filter(slotTime => {
        const parsed = parseSlotTime(slotTime)
        if (!parsed) return false
        // Keep the slot if it's in the future
        if (parsed.hour24 > currentHour) return true
        if (parsed.hour24 === currentHour && parsed.minute > currentMinute) return true
        return false
    })
}

// Generate next 7 days for date picker
export function generateNext7Days() {
    const days = []
    const today = new Date()
    for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() + i)
        days.push({
            dateObj: d,
            dateString: d.toISOString().split('T')[0],
            dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
            monthShort: d.toLocaleDateString('en-US', { month: 'short' }),
            dayNumber: d.getDate(),
            isToday: i === 0,
            displayLabel: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' }),
        })
    }
    return days
}

// Book a slot
export function bookSlot(slotTime, patientData, bookings = []) {
    const result = canBook(slotTime, patientData.patientType, bookings, patientData.currentTime || new Date())
    if (!result.allowed) return { success: false, ...result, bookings }

    const newBooking = {
        id: Date.now() + Math.random(),
        slotTime,
        patientType: patientData.patientType,
        patientName: patientData.name || 'Patient',
        slotType: result.slotType,
        bookedAt: new Date().toISOString(),
        doctorId: patientData.doctorId,
        hospitalId: patientData.hospitalId,
    }

    return {
        success: true,
        booking: newBooking,
        bookings: [...bookings, newBooking],
        ...result,
    }
}
