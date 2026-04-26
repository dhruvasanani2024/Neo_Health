import { Heart, Brain, Apple, Moon, Dumbbell, Droplets, Sun, Wind } from 'lucide-react'

const tips = [
    { id: 1, icon: Heart, color: 'from-red-400 to-rose-600', bg: 'bg-red-50', title: 'Heart Health', tip: 'Walk 10,000 steps daily to reduce cardiovascular risk by 35%. Even 5-minute walk breaks help.', tag: 'Cardiology' },
    { id: 2, icon: Brain, color: 'from-violet-400 to-purple-600', bg: 'bg-violet-50', title: 'Mental Wellness', tip: 'Practice 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Reduces anxiety in minutes.', tag: 'Mental Health' },
    { id: 3, icon: Apple, color: 'from-green-400 to-emerald-600', bg: 'bg-green-50', title: 'Nutrition Hack', tip: 'Eat the rainbow — aim for 5 different colored fruits/veggies daily for complete micronutrient coverage.', tag: 'Diet' },
    { id: 4, icon: Moon, color: 'from-indigo-400 to-blue-600', bg: 'bg-indigo-50', title: 'Sleep Quality', tip: 'Stop screen time 1 hour before bed. Blue light delays melatonin by 90+ minutes.', tag: 'Sleep' },
    { id: 5, icon: Dumbbell, color: 'from-amber-400 to-orange-600', bg: 'bg-amber-50', title: 'Exercise Tip', tip: '150 mins of moderate exercise per week lowers your risk of 13 types of cancer significantly.', tag: 'Fitness' },
    { id: 6, icon: Droplets, color: 'from-cyan-400 to-teal-600', bg: 'bg-cyan-50', title: 'Hydration', tip: 'Drink water 30 mins before meals — aids digestion and can help manage weight naturally.', tag: 'Wellness' },
    { id: 7, icon: Sun, color: 'from-yellow-400 to-amber-600', bg: 'bg-yellow-50', title: 'Vitamin D', tip: '15 mins of morning sunlight (before 10 AM) boosts Vitamin D and improves circadian rhythm.', tag: 'Immunity' },
    { id: 8, icon: Wind, color: 'from-teal-400 to-cyan-600', bg: 'bg-teal-50', title: 'Breathwork', tip: 'Box breathing (4-4-4-4) activates your parasympathetic nervous system. Practice 3x daily.', tag: 'Stress' },
]

export default function HealthTipsFeed() {
    return (
        <section className="py-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-gray-800">Daily Health Insights</h2>
                    <p className="text-xs text-gray-400 mt-0.5">AI-curated tips for a healthier you</p>
                </div>
                <span className="text-[10px] font-bold text-violet-600 bg-violet-50 px-3 py-1 rounded-full border border-violet-100">
                    ✨ Powered by AI
                </span>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {tips.map((tip, i) => {
                    const Icon = tip.icon
                    return (
                        <div
                            key={tip.id}
                            className="flex-shrink-0 w-64 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group fade-in-up"
                            style={{ animationDelay: `${i * 60}ms` }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`w-10 h-10 bg-gradient-to-br ${tip.color} rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-800">{tip.title}</h3>
                                    <span className={`text-[9px] font-bold ${tip.bg} px-2 py-0.5 rounded-full`}>{tip.tag}</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">{tip.tip}</p>
                        </div>
                    )
                })}
            </div>
        </section>
    )
}
