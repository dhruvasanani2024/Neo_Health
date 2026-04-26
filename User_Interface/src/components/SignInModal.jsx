import { useState } from 'react'
import { X, Mail, Eye, EyeOff, Lock, User, Phone, AtSign } from 'lucide-react'
import { apiLoginUser, apiRegisterUser } from '../utils/api'

export default function SignInModal({ isOpen, onClose, onSignIn }) {
    const [isSignUp, setIsSignUp] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' })
    const [errors, setErrors] = useState({})
    const [loading, setLoading] = useState(false)
    const [apiError, setApiError] = useState('')

    if (!isOpen) return null

    const handleChange = (field, value) => {
        if (field === 'phone') value = value.replace(/\D/g, '')
        setFormData(prev => ({ ...prev, [field]: value }))
        setErrors(prev => ({ ...prev, [field]: null }))
        setApiError('')
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        const errs = {}
        if (!formData.email.trim()) errs.email = 'Identifier is required'
        if (formData.password.length < 6) errs.password = 'Min 6 characters'
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true)
        setApiError('')

        try {
            const cleanIdentifier = formData.email.replace(/\s+/g, '');
            const result = await apiLoginUser({
                email: cleanIdentifier,
                password: formData.password
            })
            // result.user contains the user object from backend
            const userData = result?.user || { name: formData.email.split('@')[0], email: formData.email }
            onSignIn({
                _id: userData._id,
                name: userData.fullname || formData.email.split('@')[0],
                fullname: userData.fullname,
                email: userData.email || formData.email,
                phone: userData.phone,
                avatar: userData.avatar,
            })
            setFormData({ name: '', email: '', phone: '', password: '' })
            onClose()
        } catch (err) {
            setApiError(err.message || 'Login failed. Please check your credentials.')
        } finally {
            setLoading(false)
        }
    }

    const handleSignUp = async (e) => {
        e.preventDefault()
        const errs = {}
        if (!formData.name.trim()) errs.name = 'Name is required'
        if (!formData.email.includes('@')) errs.email = 'Valid email required'
        if (formData.phone.length > 0 && formData.phone.length < 10) errs.phone = 'Valid 10-digit phone required'
        if (formData.password.length < 6) errs.password = 'Min 6 characters'
        if (Object.keys(errs).length > 0) { setErrors(errs); return }

        setLoading(true)
        setApiError('')

        try {
            const result = await apiRegisterUser({
                fullname: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
            })
            const userData = result?.user || {}
            onSignIn({
                _id: userData._id,
                name: userData.fullname || formData.name,
                fullname: userData.fullname || formData.name,
                email: userData.email || formData.email,
                phone: userData.phone || formData.phone,
                avatar: userData.avatar,
            })
            setFormData({ name: '', email: '', phone: '', password: '' })
            onClose()
        } catch (err) {
            setApiError(err.message || 'Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({ name: '', email: '', phone: '', password: '' })
        setErrors({})
        setApiError('')
        setIsSignUp(false)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-white rounded-3xl shadow-2xl overflow-hidden slide-up">

                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                    <X size={16} className="text-gray-500" />
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-6 pt-8 pb-10 text-white relative overflow-hidden">
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full" />
                    <div className="absolute -left-4 -bottom-6 w-24 h-24 bg-white/5 rounded-full" />
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-4">
                            <span className="text-white font-black text-lg">N</span>
                        </div>
                        <h2 className="text-2xl font-extrabold mb-1">
                            {isSignUp ? 'Create Account' : 'Welcome Back'}
                        </h2>
                        <p className="text-white/60 text-sm">
                            {isSignUp ? 'Join NeoHealth for seamless healthcare' : 'Sign in to book appointments & manage health'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="p-6 space-y-4 -mt-4">
                    <div className="bg-white rounded-2xl pt-6">
                        {/* Name (signup only) */}
                        {isSignUp && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Full Name</label>
                                <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${errors.name ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                    <User size={16} className="text-gray-300 flex-shrink-0" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder="John Doe"
                                        className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                                    />
                                </div>
                                {errors.name && <p className="text-xs text-red-500 mt-1 ml-1">{errors.name}</p>}
                            </div>
                        )}


                        {/* Email */}
                        <div className="mb-4">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">{isSignUp ? 'Email' : 'Email or Phone'}</label>
                            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${errors.email ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                <Mail size={16} className="text-gray-300 flex-shrink-0" />
                                <input
                                    type={isSignUp ? "email" : "text"}
                                    value={formData.email}
                                    onChange={(e) => handleChange('email', e.target.value)}
                                    placeholder={isSignUp ? "you@example.com" : "you@example.com or 9876543210"}
                                    className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                                    autoFocus
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-500 mt-1 ml-1">{errors.email}</p>}
                        </div>

                        {/* Phone (signup only) */}
                        {isSignUp && (
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Phone</label>
                                <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${errors.phone ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                    <Phone size={16} className="text-gray-300 flex-shrink-0" />
                                    <span className="text-sm text-gray-400 font-medium">+91</span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder="98765 43210"
                                        className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                                    />
                                </div>
                                {errors.phone && <p className="text-xs text-red-500 mt-1 ml-1">{errors.phone}</p>}
                            </div>
                        )}

                        {/* Password */}
                        <div className="mb-2">
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Password</label>
                                {!isSignUp && (
                                    <button type="button" className="text-xs text-blue-600 font-semibold hover:text-blue-700">
                                        Forgot?
                                    </button>
                                )}
                            </div>
                            <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${errors.password ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
                                <Lock size={16} className="text-gray-300 flex-shrink-0" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                    placeholder="••••••••"
                                    className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 outline-none bg-transparent"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-300 hover:text-gray-500 transition-colors">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-xs text-red-500 mt-1 ml-1">{errors.password}</p>}
                        </div>

                        {/* API Error */}
                        {apiError && (
                            <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-xl">
                                <p className="text-xs text-red-600 font-medium">{apiError}</p>
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-xl active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                {isSignUp ? 'Creating Account...' : 'Signing In...'}
                            </span>
                        ) : (
                            isSignUp ? 'Create Account' : 'Sign In'
                        )}
                    </button>

                    {/* Toggle */}
                    <p className="text-center text-sm text-gray-400 pb-2">
                        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                        <button
                            type="button"
                            onClick={() => { setIsSignUp(!isSignUp); setErrors({}); setApiError(''); setFormData({ name: '', email: '', phone: '', password: '' }) }}
                            className="text-blue-600 font-semibold hover:text-blue-700"
                        >
                            {isSignUp ? 'Sign In' : 'Sign Up'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    )
}
