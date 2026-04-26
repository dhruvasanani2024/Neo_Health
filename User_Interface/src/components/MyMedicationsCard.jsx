import { Pill, Calendar, AlertTriangle, RefreshCw } from 'lucide-react'
import {
    calculateDaysRemaining,
    getRefillStatus,
    formatRefillDate,
    calculatePercentageRemaining,
    getStatusColors
} from '../utils/refillCalculator'

export default function MyMedicationsCard({ medication, onReorder }) {
    const daysRemaining = calculateDaysRemaining(
        medication.quantity,
        medication.dailyDosage,
        medication.startDate
    )
    const status = getRefillStatus(medication)
    const percentageRemaining = calculatePercentageRemaining(medication)
    const colors = getStatusColors(status)
    const refillDate = formatRefillDate(medication)

    const getStatusText = () => {
        if (status === 'overdue') return 'Overdue - Refill Now!'
        if (status === 'critical') return 'Refill Today'
        if (status === 'warning') return `${daysRemaining} days remaining`
        return `${daysRemaining} days remaining`
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border-2 ${colors.border} overflow-hidden hover:shadow-md transition-shadow`}>
            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${colors.bg}`}>
                            <Pill className={`w-5 h-5 ${colors.text}`} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{medication.name}</h3>
                            <p className="text-sm text-gray-500">{medication.dosageForm}</p>
                        </div>
                    </div>

                    {(status === 'warning' || status === 'critical' || status === 'overdue') && (
                        <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
                    )}
                </div>

                {/* Dosage Info */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Daily Dosage</p>
                        <p className="font-semibold text-gray-900">{medication.dailyDosage}x per day</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Quantity Left</p>
                        <p className="font-semibold text-gray-900">{Math.max(0, medication.quantity - (medication.dailyDosage * Math.floor((Date.now() - new Date(medication.startDate)) / (1000 * 60 * 60 * 24))))} units</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Supply Status</p>
                        <p className={`text-sm font-semibold ${colors.text}`}>{getStatusText()}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                            className={`h-full ${colors.progress} transition-all duration-500 rounded-full`}
                            style={{ width: `${percentageRemaining}%` }}
                        />
                    </div>
                </div>

                {/* Refill Date */}
                <div className="flex items-center gap-2 mb-4 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Refill by: <span className="font-medium">{refillDate}</span></span>
                </div>

                {/* Prescription Info */}
                {medication.prescriptionId && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-700">
                            Prescribed by: <span className="font-medium">{medication.doctorName}</span>
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                            {new Date(medication.prescriptionDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            })}
                        </p>
                    </div>
                )}

                {/* Reorder Button */}
                <button
                    onClick={() => onReorder(medication)}
                    className={`w-full py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${status === 'overdue' || status === 'critical'
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : status === 'warning'
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                >
                    <RefreshCw className="w-4 h-4" />
                    {status === 'overdue' || status === 'critical' ? 'Refill Now' : 'Reorder'}
                </button>
            </div>
        </div>
    )
}
