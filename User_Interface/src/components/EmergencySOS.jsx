import { useState } from 'react'
import { Phone, X, Ambulance, Shield, MapPin, AlertTriangle } from 'lucide-react'

const emergencyContacts = [
    { label: 'Ambulance', number: '108', icon: Ambulance, color: 'bg-red-500', desc: 'Medical emergency service' },
    { label: 'Police', number: '100', icon: Shield, color: 'bg-blue-600', desc: 'Law enforcement' },
    { label: 'Women Helpline', number: '1091', icon: Phone, color: 'bg-purple-600', desc: '24/7 women safety helpline' },
    { label: 'Fire Brigade', number: '101', icon: AlertTriangle, color: 'bg-orange-500', desc: 'Fire & rescue' },
]

export default function EmergencySOS() {
    const [isOpen, setIsOpen] = useState(false)
    const [confirming, setConfirming] = useState(null)

    const handleCall = (contact) => {
        setConfirming(contact)
    }

    const confirmCall = () => {
        if (confirming) {
            window.location.href = `tel:${confirming.number}`
        }
        setConfirming(null)
    }

    return (
        <>
            {/* SOS Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-2xl shadow-lg shadow-red-300 flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                <span className="text-white text-xs font-black tracking-wider">SOS</span>
                <span className="absolute inset-0 rounded-2xl bg-red-400 animate-ping opacity-20" />
            </button>

            {/* Emergency Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setIsOpen(false); setConfirming(null) }} />

                    <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 fade-in-up z-50">
                        <button onClick={() => { setIsOpen(false); setConfirming(null) }} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition">
                            <X size={16} className="text-gray-500" />
                        </button>

                        <div className="flex items-center gap-3 mb-5">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-extrabold text-gray-800">Emergency SOS</h2>
                                <p className="text-xs text-gray-400">Quick access to emergency services</p>
                            </div>
                        </div>

                        {/* Share location banner */}
                        <div className="bg-blue-50 rounded-xl p-3 mb-4 flex items-center gap-2">
                            <MapPin size={16} className="text-blue-500 flex-shrink-0" />
                            <p className="text-[11px] text-blue-600 font-medium">Your live location will be shared with emergency services when you call</p>
                        </div>

                        {/* Confirmation */}
                        {confirming ? (
                            <div className="text-center py-4 fade-in-up">
                                <div className={`w-16 h-16 ${confirming.color} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg`}>
                                    <Phone size={28} className="text-white" />
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-1">Call {confirming.label}?</p>
                                <p className="text-2xl font-extrabold text-gray-900 mb-4">{confirming.number}</p>
                                <div className="flex gap-3">
                                    <button onClick={() => setConfirming(null)} className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl text-sm font-bold hover:bg-gray-200 transition">
                                        Cancel
                                    </button>
                                    <button onClick={confirmCall} className="flex-1 py-3 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 transition shadow-lg shadow-red-200 active:scale-[0.98]">
                                        📞 Call Now
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {emergencyContacts.map(contact => {
                                    const Icon = contact.icon
                                    return (
                                        <button
                                            key={contact.number}
                                            onClick={() => handleCall(contact)}
                                            className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition group"
                                        >
                                            <div className={`w-10 h-10 ${contact.color} rounded-xl flex items-center justify-center shadow-sm`}>
                                                <Icon size={18} className="text-white" />
                                            </div>
                                            <div className="text-left flex-1">
                                                <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition">{contact.label}</p>
                                                <p className="text-[10px] text-gray-400">{contact.desc}</p>
                                            </div>
                                            <span className="text-sm font-bold text-gray-400">{contact.number}</span>
                                        </button>
                                    )
                                })}
                            </div>
                        )}

                        <p className="text-center text-[10px] text-gray-300 mt-4">Only use in genuine emergencies</p>
                    </div>
                </div>
            )}
        </>
    )
}
