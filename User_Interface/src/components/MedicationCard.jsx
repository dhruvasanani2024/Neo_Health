import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react'

export default function MedicationCard({
    medication,
    hasValidPrescription,
    isInCart,
    onAddToCart,
    user
}) {
    const canPurchase = !medication.requiresPrescription || hasValidPrescription

    const handleAddToCart = () => {
        if (!user) {
            alert('Please sign in to purchase medications')
            return
        }

        if (medication.requiresPrescription && !hasValidPrescription) {
            alert('This medication requires a valid prescription. Please consult a doctor first.')
            return
        }

        onAddToCart(medication)
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            {/* Medication Image */}
            <div className="relative h-48 bg-gradient-to-br from-blue-50 to-blue-100">
                <img
                    src={medication.image}
                    alt={medication.name}
                    className="w-full h-full object-cover"
                />
                {medication.requiresPrescription && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Rx Required
                    </div>
                )}
                {!medication.inStock && (
                    <div className="absolute top-2 left-2 bg-gray-800 text-white text-xs px-2 py-1 rounded-full font-medium">
                        Out of Stock
                    </div>
                )}
            </div>

            {/* Medication Details */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">{medication.name}</h3>
                <p className="text-sm text-gray-500 mb-2">{medication.dosageForm} • {medication.manufacturer}</p>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{medication.description}</p>

                {/* Category Badge */}
                <div className="inline-block mb-3">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                        {medication.category}
                    </span>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        <p className="text-2xl font-bold text-gray-900">₹{medication.price}</p>
                    </div>

                    {isInCart ? (
                        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            In Cart
                        </div>
                    ) : (
                        <button
                            onClick={handleAddToCart}
                            disabled={!medication.inStock || (!canPurchase && user)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${!medication.inStock
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : !canPurchase && user
                                        ? 'bg-red-100 text-red-600 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add
                        </button>
                    )}
                </div>

                {/* Prescription Warning */}
                {medication.requiresPrescription && !hasValidPrescription && user && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-2 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-yellow-800">
                            Valid prescription required. Book a consultation to get one.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
