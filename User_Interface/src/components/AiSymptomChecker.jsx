import { useState, useRef, useEffect } from 'react'
import { Bot, Send, X, Sparkles, User, ArrowRight, Stethoscope } from 'lucide-react'

const symptomDatabase = [
    { keywords: ['headache', 'head pain', 'migraine', 'head hurts'], specialty: 'Neurology', severity: 'moderate', advice: 'Rest in a dark room, stay hydrated. If persistent for 3+ days, consult a neurologist.', emoji: '🧠' },
    { keywords: ['chest pain', 'heart', 'breathing difficulty', 'shortness of breath', 'palpitation'], specialty: 'Cardiology', severity: 'high', advice: '⚠️ This could be serious. If severe, call emergency immediately. Otherwise, book a cardiologist ASAP.', emoji: '❤️' },
    { keywords: ['stomach', 'digestion', 'nausea', 'vomiting', 'diarrhea', 'abdominal pain', 'gas', 'acidity'], specialty: 'Gastroenterology', severity: 'moderate', advice: 'Avoid spicy/oily food. Stay hydrated. If symptoms persist 48+ hours, consult a gastroenterologist.', emoji: '🫁' },
    { keywords: ['skin', 'rash', 'itching', 'acne', 'allergy', 'eczema', 'hives'], specialty: 'Dermatology', severity: 'low', advice: 'Avoid scratching. Use mild moisturizer. If rash spreads or has fever, see a dermatologist.', emoji: '🧴' },
    { keywords: ['bone', 'joint', 'knee', 'back pain', 'fracture', 'sprain', 'muscle pain', 'neck pain'], specialty: 'Orthopedics', severity: 'moderate', advice: 'Apply ice, rest the affected area. If you had an injury, get an X-ray. Consult an orthopedic specialist.', emoji: '🦴' },
    { keywords: ['eye', 'vision', 'blurry', 'eye pain', 'glasses'], specialty: 'Ophthalmology', severity: 'low', advice: 'Rest your eyes from screens. Use lubricating drops. Book an eye exam if vision changes.', emoji: '👁️' },
    { keywords: ['tooth', 'dental', 'gum', 'cavity', 'toothache'], specialty: 'Dentistry', severity: 'moderate', advice: 'Rinse with warm salt water. Avoid very hot/cold food. See a dentist promptly.', emoji: '🦷' },
    { keywords: ['fever', 'cold', 'cough', 'flu', 'sore throat', 'running nose', 'congestion'], specialty: 'General Medicine', severity: 'low', advice: 'Rest, drink fluids, take paracetamol if needed. If fever above 103°F or lasts 3+ days, see a doctor.', emoji: '🤒' },
    { keywords: ['anxiety', 'depression', 'stress', 'sleep problem', 'insomnia', 'panic', 'mental'], specialty: 'Psychiatry', severity: 'moderate', advice: 'Practice deep breathing. Maintain a routine. Speaking to a therapist can help significantly.', emoji: '🧘' },
    { keywords: ['child', 'baby', 'kid', 'infant', 'pediatric', 'vaccination'], specialty: 'Pediatrics', severity: 'moderate', advice: 'Monitor temperature closely. Ensure adequate fluids. Consult a pediatrician for any persistent symptoms.', emoji: '👶' },
    { keywords: ['pregnancy', 'pregnant', 'period', 'menstrual', 'gynec', 'pcos', 'ovary'], specialty: 'Gynecology', severity: 'moderate', advice: 'Track your symptoms. Maintain regular check-ups. Book a gynecologist appointment for evaluation.', emoji: '🤰' },
    { keywords: ['diabetes', 'sugar', 'thyroid', 'hormone', 'weight gain', 'fatigue'], specialty: 'Endocrinology', severity: 'moderate', advice: 'Monitor blood sugar levels. Maintain a balanced diet with regular exercise. Get hormone levels checked.', emoji: '💉' },
]

function analyzeSymptoms(text) {
    const lower = text.toLowerCase()
    const matches = symptomDatabase.filter(s => s.keywords.some(k => lower.includes(k)))
    if (matches.length === 0) return null
    // Return highest severity match
    const severityOrder = { high: 3, moderate: 2, low: 1 }
    matches.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity])
    return matches[0]
}

export default function AiSymptomChecker({ onFindDoctor }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { from: 'bot', text: "Hi! I'm NeoHealth AI. 👋 Tell me your symptoms and I'll recommend the right specialist for you.", time: new Date() }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const handleSend = () => {
        if (!input.trim()) return
        const userMsg = input.trim()
        setInput('')

        setMessages(prev => [...prev, { from: 'user', text: userMsg, time: new Date() }])
        setIsTyping(true)

        // Simulate AI thinking
        setTimeout(() => {
            const result = analyzeSymptoms(userMsg)

            if (result) {
                setMessages(prev => [...prev, {
                    from: 'bot',
                    text: `${result.emoji} Based on your symptoms, I'd recommend seeing a **${result.specialty}** specialist.`,
                    time: new Date(),
                    result
                }])

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        from: 'bot',
                        text: result.advice,
                        time: new Date(),
                        severity: result.severity,
                    }])
                    setIsTyping(false)
                }, 800)
            } else {
                setMessages(prev => [...prev, {
                    from: 'bot',
                    text: "I'm not sure about those symptoms. Could you describe them differently? Try mentioning specific body areas like head, chest, stomach, skin, joints, etc.",
                    time: new Date()
                }])
                setIsTyping(false)
            }
        }, 1200)
    }

    return (
        <>
            {/* Floating trigger button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 z-40 w-14 h-14 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-lg shadow-violet-300 flex items-center justify-center hover:shadow-xl hover:scale-105 active:scale-95 transition-all group"
                >
                    <Sparkles size={24} className="text-white group-hover:animate-spin" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />
                </button>
            )}

            {/* Chat panel */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden fade-in-up" style={{ height: '520px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-r from-violet-600 to-indigo-700 px-5 py-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                                <Bot size={22} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">NeoHealth AI</h3>
                                <p className="text-[10px] text-white/60">Symptom Checker • Powered by AI</p>
                            </div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                            <X size={16} className="text-white" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50/50 to-white">
                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] ${msg.from === 'user'
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-md px-4 py-2.5'
                                    : 'bg-white border border-gray-100 text-gray-700 rounded-2xl rounded-tl-md px-4 py-2.5 shadow-sm'
                                }`}>
                                    <p className="text-[13px] leading-relaxed whitespace-pre-wrap"
                                        dangerouslySetInnerHTML={{
                                            __html: msg.text
                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        }}
                                    />
                                    {/* Severity badge */}
                                    {msg.severity && (
                                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                            msg.severity === 'high' ? 'bg-red-100 text-red-600'
                                            : msg.severity === 'moderate' ? 'bg-amber-100 text-amber-600'
                                            : 'bg-green-100 text-green-600'
                                        }`}>
                                            {msg.severity === 'high' ? '🔴 High Priority' : msg.severity === 'moderate' ? '🟡 Moderate' : '🟢 Low Severity'}
                                        </span>
                                    )}
                                    {/* Find Doctor CTA */}
                                    {msg.result && (
                                        <button
                                            onClick={() => onFindDoctor && onFindDoctor(msg.result.specialty)}
                                            className="mt-2.5 flex items-center gap-1.5 w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                                        >
                                            <Stethoscope size={14} />
                                            Find {msg.result.specialty} Doctors
                                            <ArrowRight size={12} className="ml-auto" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-4 py-3 shadow-sm flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestions */}
                    {messages.length <= 2 && (
                        <div className="px-4 py-2 border-t border-gray-50 flex gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
                            {['Headache', 'Fever & Cold', 'Back Pain', 'Skin Rash', 'Chest Pain'].map(sug => (
                                <button
                                    key={sug}
                                    onClick={() => { setInput(sug); }}
                                    className="text-[11px] font-semibold text-violet-600 bg-violet-50 px-3 py-1.5 rounded-full whitespace-nowrap hover:bg-violet-100 transition border border-violet-100"
                                >
                                    {sug}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0 bg-white">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type your symptoms..."
                            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-300 transition"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                                input.trim()
                                    ? 'bg-gradient-to-br from-violet-600 to-indigo-700 text-white shadow-md shadow-violet-200 hover:shadow-lg active:scale-95'
                                    : 'bg-gray-100 text-gray-300'
                            }`}
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
