import { AlertCircle, RefreshCw, X } from 'lucide-react'
import { calculateDaysRemaining } from '../utils/refillCalculator'

export default function RefillReminderBanner({ medications, onReorder }) {
    if (medications.length === 0) return null

    return (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-500">
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-yellow-900 mb-2">
                            {medications.length} {medications.length === 1 ? 'medication needs' : 'medications need'} refill soon
                        </h3>
                        <div className="space-y-2">
                            {medications.map(med => {
                                const daysRemaining = calculateDaysRemaining(
                                    med.quantity,
                                    med.dailyDosage,
                                    med.startDate
                                )
                                return (
                                    <div key={med.id} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                                        <div>
                                            <p className="font-medium text-gray-900">{med.name}</p>
                                            <p className="text-sm text-gray-600">
                                                {daysRemaining < 0
                                                    ? 'Overdue - Refill immediately'
                                                    : daysRemaining === 0
                                                        ? 'Last day - Refill today'
                                                        : `${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'} remaining`
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => onReorder(med)}
                                            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center gap-2 font-medium"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Reorder Now
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
