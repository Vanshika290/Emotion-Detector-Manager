import { useState, useEffect, useMemo } from 'react';
import { Brain, Activity, TrendingUp, FileText, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from '@/app/components/Dashboard';
import EmotionEntry from '@/app/components/EmotionEntry';
import EmotionTimeline from '@/app/components/EmotionTimeline';
import TrendAnalysis from '@/app/components/TrendAnalysis';
import Reports from '@/app/components/Reports';
// import Login from '@/app/components/Login';
// import { AuthProvider, useAuth } from '@/app/contexts/AuthContext';
import { getEmotionEntries } from '@/app/utils/emotionStorage';

type TabType = 'dashboard' | 'entry' | 'timeline' | 'analysis' | 'reports';

// Floating Emojis Component
const FloatingEmojis = ({ mood }: { mood: string }) => {
  const particles = useMemo(() => {
    const getEmojis = (m: string) => {
      switch (m) {
        // Replaced objects/symbols with purely face/emotion emojis
        case 'Happiness': return ['😊', '🥰', '😃', '😍', '😁', '😄', '😆', '🥳'];
        case 'Sadness': return ['😢', '😭', '😓', '😞', '😟', '😦', '😿', '😩'];
        case 'Anger': return ['😠', '😡', '🤬', '👿', '😤', '😒', '😣', '😾'];
        case 'Anxiety': return ['😰', '😨', '😱', '😬', '😖', '😓', '😵', '🫨'];
        default: return ['🙂', '😐', '🤔', '😶', '🙄', '😯', '😌', '🙃'];
      }
    };

    const emojiList = getEmojis(mood);
    return Array.from({ length: 25 }).map((_, i) => ({
      id: i,
      emoji: emojiList[i % emojiList.length],
      left: Math.random() * 100,
      delay: Math.random() * 5, // Reduced delay
      duration: 3 + Math.random() * 7, // Much faster: 3-10s duration (was 15-30s)
      size: 2 + Math.random() * 3, // rem sizes
      rotation: Math.random() * 360,
    }));
  }, [mood]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <AnimatePresence mode="wait">
        {particles.map((p) => (
          <motion.div
            key={`${mood}-${p.id}`}
            initial={{ y: "110vh", x: `${p.left}vw`, opacity: 0, rotate: p.rotation, scale: 0.5 }}
            animate={{
              y: "-20vh",
              opacity: [0, 1, 1, 0],
              rotate: p.rotation + 360,
              scale: 1,
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            }}
            className="absolute drop-shadow-2xl"
            style={{
              fontSize: `${p.size}rem`,
              filter: 'blur(0.5px)',
            }}
          >
            {p.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

// Mood Background Component
const MoodBackground = ({ children }: { children: React.ReactNode }) => {
  const [currentMood, setCurrentMood] = useState('Neutral');

  useEffect(() => {
    const checkMood = () => {
      const entries = getEmotionEntries();
      if (entries.length > 0) {
        const latest = entries[entries.length - 1];
        setCurrentMood(latest.emotion);
      } else {
        setCurrentMood('Neutral');
      }
    };

    checkMood();
    window.addEventListener('focus', checkMood);
    const interval = setInterval(checkMood, 2000);
    return () => {
      window.removeEventListener('focus', checkMood);
      clearInterval(interval);
    };
  }, []);

  const getGradient = (mood: string) => {
    switch (mood) {
      case 'Happiness':
        return 'from-yellow-100 via-orange-100 to-amber-100';
      case 'Sadness':
        return 'from-blue-100 via-cyan-100 to-sky-200';
      case 'Anger':
        return 'from-red-100 via-rose-100 to-pink-200';
      case 'Anxiety':
        return 'from-purple-100 via-violet-100 to-indigo-200';
      default:
        return 'from-indigo-50 via-purple-50 to-pink-50';
    }
  };

  return (
    <div className={`min-h-screen relative overflow-hidden bg-gradient-to-br ${getGradient(currentMood)} transition-colors duration-1000 ease-in-out`}>
      <FloatingEmojis mood={currentMood} />
      <div className="relative z-10 transition-colors duration-1000 ease-in-out">
        {children}
      </div>
    </div>
  );
};

// Main App Component (No Auth)
export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Dummy user data since auth is removed
  const user = {
    displayName: "Guest User",
    email: "guest@example.com",
    photoURL: null
  };

  return (
    <MoodBackground>
      {/* Header */}
      <header className="bg-white/60 backdrop-blur-xl shadow-sm border-b border-white/40 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-2 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Emotional Drift Monitor</h1>
                <p className="text-sm text-gray-700 font-semibold opacity-80">Track, Analyze & Visualize Your Emotions</p>
              </div>
            </div>
            <div className="text-right flex items-center gap-4">
              <div className="hidden md:block">
                <p className="text-sm font-bold text-gray-900">Hello, Friend</p>
                <p className="text-xs text-gray-600 font-medium">Have a great day!</p>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-lg bg-indigo-100 flex items-center justify-center">
                  <Brain className="w-6 h-6 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white/40 backdrop-blur-md shadow-sm border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2 no-scrollbar">
            {[
              { id: 'dashboard', icon: Activity, label: 'Dashboard' },
              { id: 'entry', icon: FileText, label: 'New Entry' },
              { id: 'timeline', icon: TrendingUp, label: 'Timeline' },
              { id: 'analysis', icon: Brain, label: 'Analysis' },
              { id: 'reports', icon: FileText, label: 'Reports' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`relative flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all rounded-xl my-1 whitespace-nowrap z-20 ${activeTab === tab.id
                  ? 'text-indigo-700 bg-white/50 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                  }`}
              >
                <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[3px]' : 'stroke-2'}`} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-white/50 rounded-xl -z-10 border border-white/50 shadow-sm"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
            {activeTab === 'entry' && <EmotionEntry onSuccess={() => setActiveTab('dashboard')} />}
            {activeTab === 'timeline' && <EmotionTimeline />}
            {activeTab === 'analysis' && <TrendAnalysis />}
            {activeTab === 'reports' && <Reports />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/40 backdrop-blur-md border-t border-white/20 mt-16 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-sm text-gray-600 font-semibold">
            © 2026 Emotional Drift Monitor | AI-Powered Emotional Intelligence Platform
          </p>
        </div>
      </footer>
    </MoodBackground>
  );
}
