import { useState } from 'react'
import { Search, MapPin, ChevronDown, User, Menu, X, LogOut, Pill, Calendar, Heart } from 'lucide-react'

export default function Navbar({ searchQuery, setSearchQuery, user, onSignInClick, onSignOut, onPharmacyClick, onBookingsClick, onProfileClick, refillCount = 0, upcomingCount = 0 }) {
    const [locationOpen, setLocationOpen] = useState(false)
    const [selectedLocation, setSelectedLocation] = useState('Koramangala, Bengaluru')
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [profileOpen, setProfileOpen] = useState(false)

    const locations = [
        'Koramangala, Bengaluru',
        'Indiranagar, Bengaluru',
        'HSR Layout, Bengaluru',
        'Whitefield, Bengaluru',
        'Jayanagar, Bengaluru',
        'MG Road, Bengaluru',
    ]

    return (
        <header className="bg-white sticky top-0 z-50 shadow-sm transition-colors duration-300">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="flex items-center justify-between h-[72px] gap-4">
                    {/* Logo + Location */}
                    <div className="flex items-center gap-4 lg:gap-8 flex-shrink-0">
                        <button className="lg:hidden p-1 text-gray-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>

                        <a href="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 group-hover:shadow-lg group-hover:shadow-blue-300 transition-shadow">
                                <span className="text-white font-black text-sm">N</span>
                            </div>
                            <span className="hidden sm:block text-xl font-extrabold text-gray-800 tracking-tight">
                                Neo<span className="text-blue-600">Health</span>
                            </span>
                        </a>

                        <div className="relative">
                            <button onClick={() => setLocationOpen(!locationOpen)} className="flex items-center gap-1.5 py-2 pl-2 pr-3 rounded-xl hover:bg-gray-50 transition-colors group">
                                <MapPin size={18} className="text-blue-600 flex-shrink-0" />
                                <div className="text-left hidden sm:block">
                                    <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block leading-3">Location</span>
                                    <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors line-clamp-1 max-w-[160px]">{selectedLocation}</span>
                                </div>
                                <ChevronDown size={14} className={`text-gray-400 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {locationOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setLocationOpen(false)} />
                                    <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 fade-in-up">
                                        <div className="px-4 py-2 border-b border-gray-50">
                                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Select Location</p>
                                        </div>
                                        {locations.map((loc) => (
                                            <button key={loc} onClick={() => { setSelectedLocation(loc); setLocationOpen(false) }}
                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-blue-50 transition-colors flex items-center gap-3 ${selectedLocation === loc ? 'text-blue-600 bg-blue-50/50 font-medium' : 'text-gray-600'}`}>
                                                <MapPin size={14} className={selectedLocation === loc ? 'text-blue-600' : 'text-gray-300'} /> {loc}
                                            </button>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="flex-1 max-w-xl hidden md:block">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                            <input type="text" placeholder="Search hospitals, doctors, specialties..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all" />
                        </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {/* My Bookings button */}
                        {user && (
                            <button
                                onClick={onBookingsClick}
                                className="relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 transition-all border border-purple-200"
                            >
                                <Calendar size={14} />
                                Bookings
                                {upcomingCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                        {upcomingCount}
                                    </span>
                                )}
                            </button>
                        )}

                        {/* User profile */}
                        {user ? (
                            <div className="relative">
                                <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2.5 px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                        <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase() || 'U'}</span>
                                    </div>
                                    <span className="hidden sm:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">{user.name}</span>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {profileOpen && (
                                    <>
                                        <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                                        <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 fade-in-up">
                                            <div className="px-4 py-3 border-b border-gray-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email || user.phone}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <button onClick={() => { onProfileClick && onProfileClick(); setProfileOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                                <Heart size={16} className="text-red-400" /> Health Profile
                                            </button>
                                            <button onClick={() => { onBookingsClick && onBookingsClick(); setProfileOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors">
                                                <Calendar size={16} className="text-purple-400" /> My Bookings
                                                {upcomingCount > 0 && <span className="ml-auto text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{upcomingCount}</span>}
                                            </button>
                                            <div className="border-t border-gray-100 mt-1 pt-1">
                                                <button onClick={() => { onSignOut(); setProfileOpen(false) }} className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors">
                                                    <LogOut size={16} /> Sign Out
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        ) : (
                            <button onClick={onSignInClick} className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl hover:bg-gray-50 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">
                                <User size={18} /> <span className="hidden sm:block">Sign In</span>
                            </button>
                        )}

                        {/* Pharmacy Button */}
                        <button onClick={onPharmacyClick} className="relative hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-200">
                            <Pill size={14} /> Pharmacy
                            {refillCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{refillCount}</span>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Search */}
                <div className="md:hidden pb-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" placeholder="Search hospitals, doctors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 focus:bg-white transition-all" />
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden border-t border-gray-100 bg-white py-4 px-4 shadow-lg">
                    <nav className="space-y-1">
                        {user ? (
                            <>
                                <div className="flex items-center gap-3 px-4 py-3">
                                    <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">{user.name?.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-400">{user.email || user.phone}</p>
                                    </div>
                                </div>
                                <button onClick={() => { onProfileClick && onProfileClick(); setMobileMenuOpen(false) }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <Heart size={18} className="text-red-400" /> Health Profile
                                </button>
                                <button onClick={() => { onBookingsClick && onBookingsClick(); setMobileMenuOpen(false) }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                    <Calendar size={18} className="text-purple-400" /> My Bookings
                                    {upcomingCount > 0 && <span className="ml-auto text-[10px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">{upcomingCount}</span>}
                                </button>
                                <button onClick={() => { onSignOut(); setMobileMenuOpen(false) }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                                    <LogOut size={18} /> Sign Out
                                </button>
                            </>
                        ) : (
                            <button onClick={() => { onSignInClick(); setMobileMenuOpen(false) }} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                                <User size={18} /> Sign In
                            </button>
                        )}
                        <button onClick={() => { onPharmacyClick(); setMobileMenuOpen(false) }} className="relative flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                            <Pill size={18} /> Pharmacy
                            {refillCount > 0 && <span className="ml-auto w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{refillCount}</span>}
                        </button>
                    </nav>
                </div>
            )}
        </header>
    )
}
