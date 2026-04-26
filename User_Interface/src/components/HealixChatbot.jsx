import { useState, useRef, useEffect, useCallback } from 'react'
import { X, Send, Trash2, Sparkles } from 'lucide-react'
import { apiSendChatMessage, apiClearChat } from '../utils/api'

// Generate a unique session ID per browser tab
const SESSION_ID = `healix-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const WELCOME_MESSAGE = {
    role: 'bot',
    text: "Hey there! 👋 I'm **Healix**, your personal health assistant. I can help you with symptoms, wellness tips, booking guidance, or anything health-related. What's on your mind today?",
    time: new Date(),
}

export default function HealixChatbot() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([WELCOME_MESSAGE])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const [hasUnread, setHasUnread] = useState(false)
    const messagesEndRef = useRef(null)
    const inputRef = useRef(null)

    // Auto-scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isTyping])

    // Focus the input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300)
            setHasUnread(false)
        }
    }, [isOpen])

    const sendMessage = useCallback(async (text) => {
        const trimmed = text.trim()
        if (!trimmed || isTyping) return

        const userMsg = { role: 'user', text: trimmed, time: new Date() }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        try {
            const data = await apiSendChatMessage(trimmed, SESSION_ID)
            const botMsg = { role: 'bot', text: data.reply, time: new Date() }
            setMessages(prev => [...prev, botMsg])
            if (!isOpen) setHasUnread(true)
        } catch {
            setMessages(prev => [...prev, {
                role: 'bot',
                text: "Oops! I'm having a little trouble right now 😅 Please try again in a moment.",
                time: new Date(),
                isError: true,
            }])
        } finally {
            setIsTyping(false)
        }
    }, [isTyping, isOpen])

    const handleSend = useCallback(() => {
        sendMessage(input)
    }, [input, sendMessage])

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const handleClear = useCallback(async () => {
        try { await apiClearChat(SESSION_ID) } catch { /* ignore */ }
        setMessages([WELCOME_MESSAGE])
    }, [])

    // Simple markdown-like bold rendering
    const renderText = (text) => {
        if (!text) return null
        const parts = text.split(/(\*\*.*?\*\*)/g)
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
            }
            return <span key={i}>{part}</span>
        })
    }

    return (
        <>
            {/* ── Floating Chat Button (6Eska-style blue orb) ──────────────── */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-24 right-6 z-40 group transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
                aria-label="Open Healix chatbot"
            >
                {/* Outer glow ring */}
                <div className="absolute inset-[-6px] rounded-full bg-blue-300/20 animate-pulse" />
                <div className="absolute inset-[-3px] rounded-full bg-gradient-to-b from-blue-200/30 to-blue-400/20" />

                {/* Main icon — 6Eska-style circular blue gradient */}
                <div className="relative w-14 h-14 rounded-full shadow-lg shadow-blue-400/30 hover:shadow-xl hover:shadow-blue-400/50 hover:scale-110 active:scale-95 transition-all overflow-hidden">
                    <img
                        src="/healix-icon.png"
                        alt="Healix"
                        className="w-full h-full object-cover"
                    />
                    {hasUnread && (
                        <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full right-0 mb-3 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                    Chat with Healix 💬
                    <div className="absolute top-full right-5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
                </div>
            </button>

            {/* ── Chat Window ───────────────────────────────────────────────── */}
            <div className={`fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] transition-all duration-300 origin-bottom-right ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}`}>
                <div className="bg-white rounded-3xl shadow-2xl shadow-blue-200/40 border border-blue-50 overflow-hidden flex flex-col" style={{ height: '560px' }}>

                    {/* ── Header ──── */}
                    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 px-5 py-4 flex items-center justify-between flex-shrink-0 relative overflow-hidden">
                        {/* Decorative subtle circles like 6Eska */}
                        <div className="absolute -top-6 -left-6 w-20 h-20 bg-white/5 rounded-full" />
                        <div className="absolute -bottom-4 right-12 w-16 h-16 bg-white/5 rounded-full" />

                        <div className="flex items-center gap-3 relative z-10">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                                    <img src="/healix-icon.png" alt="Healix" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-blue-700" />
                            </div>
                            <div>
                                <h3 className="text-white font-extrabold text-sm tracking-wide">Healix</h3>
                                <p className="text-blue-200 text-[10px] font-medium">AI Health Assistant • Online</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 relative z-10">
                            <button
                                onClick={handleClear}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                                title="Clear chat"
                            >
                                <Trash2 size={15} />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* ── Messages ──── */}
                    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-blue-50/30 to-white" style={{ scrollBehavior: 'smooth' }}>
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[85%]">
                                    {msg.role === 'bot' && (
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className="w-5 h-5 rounded-full overflow-hidden">
                                                <img src="/healix-icon.png" alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <span className="text-[10px] font-bold text-blue-700">Healix</span>
                                        </div>
                                    )}
                                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                                        msg.role === 'user'
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-md shadow-sm shadow-blue-200'
                                            : msg.isError
                                                ? 'bg-red-50 text-red-700 border border-red-100 rounded-bl-md'
                                                : 'bg-white text-gray-700 border border-gray-100 rounded-bl-md shadow-sm'
                                    }`}>
                                        {renderText(msg.text)}
                                    </div>
                                    <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-right text-gray-400' : 'text-gray-300'}`}>
                                        {msg.time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="max-w-[85%]">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="w-5 h-5 rounded-full overflow-hidden">
                                            <img src="/healix-icon.png" alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <span className="text-[10px] font-bold text-blue-700">Healix</span>
                                    </div>
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* ── Quick Suggestions (shown only with welcome message) ──── */}
                    {messages.length <= 1 && !isTyping && (
                        <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
                            {[
                                "I have a headache 🤕",
                                "How to book an appointment?",
                                "First aid for burns",
                                "Health tips for today"
                            ].map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(q)}
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[11px] font-semibold hover:bg-blue-100 transition-all active:scale-95"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* ── Input Bar ──── */}
                    <div className="border-t border-gray-100 px-4 py-3 bg-white flex-shrink-0">
                        <div className="flex items-center gap-2 bg-gray-50 rounded-2xl px-4 py-1 border border-gray-100 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask Healix anything..."
                                className="flex-1 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 outline-none py-2"
                                disabled={isTyping}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-sm hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-90"
                            >
                                <Send size={14} />
                            </button>
                        </div>
                        <p className="text-center text-[9px] text-gray-300 mt-2">Powered by Gemini AI • Not a substitute for medical advice</p>
                    </div>
                </div>
            </div>
        </>
    )
}
