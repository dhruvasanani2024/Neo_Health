/**
 * Calculate days remaining until medication runs out
 * @param {number} quantity - Total quantity of medication
 * @param {number} dailyDosage - Number of units taken per day
 * @param {Date|string} startDate - Date when medication was started
 * @returns {number} Days remaining (can be negative if overdue)
 */
export const calculateDaysRemaining = (quantity, dailyDosage, startDate) => {
    const start = new Date(startDate)
    const today = new Date()
    const daysPassed = Math.floor((today - start) / (1000 * 60 * 60 * 24))
    const totalDays = Math.floor(quantity / dailyDosage)
    return totalDays - daysPassed
}

/**
 * Check if refill reminder should be shown
 * @param {number} daysRemaining - Days until medication runs out
 * @param {number} threshold - Days before running out to show reminder (default: 3)
 * @returns {boolean} Whether to show reminder
 */
export const shouldShowReminder = (daysRemaining, threshold = 3) => {
    return daysRemaining <= threshold && daysRemaining >= 0
}

/**
 * Get refill status for a medication
 * @param {Object} medication - Medication object with quantity, dailyDosage, startDate
 * @returns {string} Status: 'good', 'warning', 'critical', 'overdue'
 */
export const getRefillStatus = (medication) => {
    const daysRemaining = calculateDaysRemaining(
        medication.quantity,
        medication.dailyDosage,
        medication.startDate
    )

    if (daysRemaining < 0) return 'overdue'
    if (daysRemaining === 0) return 'critical'
    if (daysRemaining <= 3) return 'warning'
    return 'good'
}

/**
 * Format the next refill date
 * @param {Object} medication - Medication object with quantity, dailyDosage, startDate
 * @returns {string} Formatted date string
 */
export const formatRefillDate = (medication) => {
    const daysRemaining = calculateDaysRemaining(
        medication.quantity,
        medication.dailyDosage,
        medication.startDate
    )

    const refillDate = new Date()
    refillDate.setDate(refillDate.getDate() + daysRemaining)

    return refillDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    })
}

/**
 * Calculate percentage of medication remaining
 * @param {Object} medication - Medication object with quantity, dailyDosage, startDate
 * @returns {number} Percentage remaining (0-100)
 */
export const calculatePercentageRemaining = (medication) => {
    const totalDays = Math.floor(medication.quantity / medication.dailyDosage)
    const daysRemaining = calculateDaysRemaining(
        medication.quantity,
        medication.dailyDosage,
        medication.startDate
    )

    const percentage = (daysRemaining / totalDays) * 100
    return Math.max(0, Math.min(100, percentage))
}

/**
 * Get status color for UI display
 * @param {string} status - Status from getRefillStatus
 * @returns {Object} Object with background and text colors
 */
export const getStatusColors = (status) => {
    const colors = {
        good: {
            bg: 'bg-green-100',
            text: 'text-green-800',
            border: 'border-green-300',
            progress: 'bg-green-500'
        },
        warning: {
            bg: 'bg-yellow-100',
            text: 'text-yellow-800',
            border: 'border-yellow-300',
            progress: 'bg-yellow-500'
        },
        critical: {
            bg: 'bg-orange-100',
            text: 'text-orange-800',
            border: 'border-orange-300',
            progress: 'bg-orange-500'
        },
        overdue: {
            bg: 'bg-red-100',
            text: 'text-red-800',
            border: 'border-red-300',
            progress: 'bg-red-500'
        }
    }

    return colors[status] || colors.good
}

/**
 * Check if prescription is still valid
 * @param {Date|string} prescriptionDate - Date when prescription was issued
 * @param {number} validityDays - Number of days prescription is valid (default: 30)
 * @returns {boolean} Whether prescription is still valid
 */
export const isPrescriptionValid = (prescriptionDate, validityDays = 30) => {
    const issued = new Date(prescriptionDate)
    const today = new Date()
    const daysSinceIssued = Math.floor((today - issued) / (1000 * 60 * 60 * 24))
    return daysSinceIssued <= validityDays
}

/**
 * Get all medications that need refills
 * @param {Array} medications - Array of medication objects
 * @param {number} threshold - Days threshold for reminder (default: 3)
 * @returns {Array} Medications that need refills
 */
export const getMedicationsNeedingRefill = (medications, threshold = 3) => {
    return medications.filter(med => {
        const daysRemaining = calculateDaysRemaining(
            med.quantity,
            med.dailyDosage,
            med.startDate
        )
        return daysRemaining <= threshold
    })
}
