import { useState, useMemo } from 'react'
import { Search, ShoppingCart, Pill, AlertCircle, Clock, Package, TrendingUp, Star, Zap, Gift, Heart, Shield, Truck, Tag } from 'lucide-react'
import { medications, medicationCategories, getMedicationsByCategory, searchMedications } from '../data/medicationData'
import MedicationCard from '../components/MedicationCard'
import MyMedicationsCard from '../components/MyMedicationsCard'
import RefillReminderBanner from '../components/RefillReminderBanner'
import { getMedicationsNeedingRefill } from '../utils/refillCalculator'

export default function PharmacyPage({
    user,
    userMedications = [],
    prescriptions = [],
    cart = [],
    onAddToCart,
    onRemoveFromCart,
    onCheckout,
    onReorder,
    onBack
}) {
    const [activeTab, setActiveTab] = useState('browse') // 'browse' | 'my-medications'
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')

    // Filter medications based on category and search
    const filteredMedications = useMemo(() => {
        let result = medications

        if (selectedCategory !== 'All') {
            result = getMedicationsByCategory(selectedCategory)
        }

        if (searchQuery) {
            result = searchMedications(searchQuery)
        }

        return result
    }, [selectedCategory, searchQuery])

    // Get medications needing refill
    const medicationsNeedingRefill = useMemo(() => {
        return getMedicationsNeedingRefill(userMedications)
    }, [userMedications])

    // Check if user has valid prescription for a medication
    const hasValidPrescription = (medicationName) => {
        return prescriptions.some(prescription =>
            prescription.medications.some(med =>
                med.name.toLowerCase().includes(medicationName.toLowerCase()) &&
                new Date(prescription.issuedDate).getTime() + (30 * 24 * 60 * 60 * 1000) > Date.now()
            )
        )
    }

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)

    // Featured/Trending medications
    const trendingMeds = medications.filter(m => !m.requiresPrescription).slice(0, 6)
    const featuredMeds = medications.filter(m => m.category === 'Vitamins' || m.category === 'First Aid').slice(0, 4)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header with Gradient */}
            <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

                <div className="max-w-7xl mx-auto px-4 py-8 relative z-10">
                    <button
                        onClick={onBack}
                        className="mb-4 flex items-center gap-2 text-white/90 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl">
                                    <Pill className="w-8 h-8" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">NeoHealth Pharmacy</h1>
                                    <p className="text-blue-100 text-sm mt-1">Your trusted online pharmacy</p>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="hidden md:flex items-center gap-6">
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Shield className="w-5 h-5 text-green-300" />
                                <span className="text-sm font-medium">100% Genuine</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                                <Truck className="w-5 h-5 text-blue-300" />
                                <span className="text-sm font-medium">Fast Delivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Refill Reminder Banner */}
            {medicationsNeedingRefill.length > 0 && (
                <RefillReminderBanner
                    medications={medicationsNeedingRefill}
                    onReorder={onReorder}
                />
            )}

            {/* Promotional Banner */}
            {activeTab === 'browse' && (
                <div className="bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                                    <Gift className="w-8 h-8 text-white" />
                                </div>
                                <div className="text-white">
                                    <h3 className="text-xl font-bold mb-1">Special Offers Just for You!</h3>
                                    <p className="text-white/90 text-sm">Get up to 25% off on vitamins & wellness products</p>
                                </div>
                            </div>
                            <button className="hidden md:block px-6 py-3 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                                Explore Deals
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex gap-6">
                        <button
                            onClick={() => setActiveTab('browse')}
                            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'browse'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Package className="w-5 h-5" />
                                Browse Medications
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('my-medications')}
                            className={`py-4 px-2 font-medium border-b-2 transition-colors ${activeTab === 'my-medications'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5" />
                                My Medications
                                {userMedications.length > 0 && (
                                    <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                                        {userMedications.length}
                                    </span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                {activeTab === 'browse' ? (
                    <>
                        {/* Search Bar - Enhanced */}
                        <div className="mb-6">
                            <div className="relative mb-4">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search for medicines, health products..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg shadow-sm"
                                />
                            </div>

                            {/* Category Filter - Enhanced with Icons */}
                            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                <button
                                    onClick={() => setSelectedCategory('All')}
                                    className={`px-5 py-3 rounded-2xl whitespace-nowrap transition-all font-medium ${selectedCategory === 'All'
                                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200'
                                            : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600 hover:shadow-md'
                                        }`}
                                >
                                    All Products
                                </button>
                                {medicationCategories.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.name)}
                                        className={`px-5 py-3 rounded-2xl whitespace-nowrap transition-all font-medium flex items-center gap-2 ${selectedCategory === category.name
                                                ? 'text-white shadow-lg'
                                                : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-600 hover:shadow-md'
                                            }`}
                                        style={{
                                            background: selectedCategory === category.name
                                                ? `linear-gradient(135deg, ${category.textColor}, ${category.textColor}dd)`
                                                : undefined
                                        }}
                                    >
                                        <span className="text-lg">{category.icon}</span>
                                        {category.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Featured Section - Only show when no search/filter */}
                        {!searchQuery && selectedCategory === 'All' && (
                            <>
                                {/* Trending Products */}
                                <div className="mb-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                                                <TrendingUp className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
                                                <p className="text-sm text-gray-500">Most popular this week</p>
                                            </div>
                                        </div>
                                        <button className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                                            View All →
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                        {trendingMeds.map(med => (
                                            <div key={med.id} className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 p-4 hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group">
                                                <div className="relative mb-3">
                                                    <div className="w-full h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl overflow-hidden">
                                                        <img src={med.image} alt={med.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                        HOT
                                                    </div>
                                                </div>
                                                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">{med.name}</h3>
                                                <p className="text-lg font-bold text-blue-600">₹{med.price}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Health Essentials */}
                                <div className="mb-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 border-2 border-green-100">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                                            <Heart className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-gray-900">Health Essentials</h2>
                                            <p className="text-sm text-gray-600">Stock up on daily wellness</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {featuredMeds.map(med => (
                                            <div key={med.id} className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition-all">
                                                <div className="w-full h-32 bg-gradient-to-br from-green-50 to-green-100 rounded-xl mb-3 overflow-hidden">
                                                    <img src={med.image} alt={med.name} className="w-full h-full object-cover" />
                                                </div>
                                                <h3 className="font-semibold text-sm text-gray-900 mb-2 line-clamp-2">{med.name}</h3>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-lg font-bold text-green-600">₹{med.price}</p>
                                                    <button
                                                        onClick={() => onAddToCart(med)}
                                                        className="px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded-lg hover:bg-green-700 transition-colors"
                                                    >
                                                        Add
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Prescription Required Notice */}
                        {!user && (
                            <div className="mb-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-4 flex items-start gap-3">
                                <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-yellow-900">Sign in to purchase medications</p>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Prescription medications require a valid prescription from a licensed doctor.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* All Medications Section */}
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">
                                    {searchQuery ? 'Search Results' : selectedCategory === 'All' ? 'All Products' : selectedCategory}
                                </h2>
                            </div>
                        </div>

                        {/* Medications Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMedications.map(medication => (
                                <MedicationCard
                                    key={medication.id}
                                    medication={medication}
                                    hasValidPrescription={hasValidPrescription(medication.name)}
                                    isInCart={cart.some(item => item.id === medication.id)}
                                    onAddToCart={onAddToCart}
                                    user={user}
                                />
                            ))}
                        </div>

                        {filteredMedications.length === 0 && (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-12 h-12 text-gray-300" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No medications found</p>
                                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* My Medications */}
                        {userMedications.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {userMedications.map(medication => (
                                    <MyMedicationsCard
                                        key={medication.id}
                                        medication={medication}
                                        onReorder={onReorder}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Pill className="w-12 h-12 text-blue-600" />
                                </div>
                                <p className="text-gray-500 text-lg font-medium">No active medications</p>
                                <p className="text-gray-400 text-sm mt-1 mb-4">
                                    Purchase medications from the Browse tab to track them here
                                </p>
                                <button
                                    onClick={() => setActiveTab('browse')}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                                >
                                    Browse Medications
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Shopping Cart Footer - Enhanced */}
            {cart.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
                    <div className="max-w-7xl mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">
                                        {cart.length} {cart.length === 1 ? 'item' : 'items'} in cart
                                    </p>
                                    <p className="text-sm text-gray-500">Total: <span className="font-bold text-blue-600">₹{cartTotal}</span></p>
                                </div>
                            </div>
                            <button
                                onClick={onCheckout}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:shadow-lg transition-all font-bold text-lg flex items-center gap-2"
                            >
                                Proceed to Checkout
                                <Zap className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
