import { useEffect, useState } from 'react';
import { Smile, Frown, Meh, Zap, TrendingUp, Calendar } from 'lucide-react';
import { motion } from 'motion/react';
import { getEmotionEntries, type EmotionEntry } from '@/app/utils/emotionStorage';
import { ThreeDCard } from './ui/ThreeDCard';

interface DashboardProps {
  onNavigate: (tab: 'dashboard' | 'entry' | 'timeline' | 'analysis' | 'reports') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [stats, setStats] = useState({
    totalEntries: 0,
    dominantEmotion: 'Neutral',
    avgConfidence: 0,
    recentTrend: 'Stable'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allEntries = getEmotionEntries();
    setEntries(allEntries);

    if (allEntries.length > 0) {
      // Calculate dominant emotion
      const emotionCounts: Record<string, number> = {};
      let totalConfidence = 0;

      allEntries.forEach(entry => {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
        totalConfidence += entry.confidence;
      });

      const dominant = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0][0];
      const avgConf = totalConfidence / allEntries.length;

      // Calculate recent trend (last 5 entries vs previous 5)
      let trend = 'Stable';
      if (allEntries.length >= 10) {
        const recent = allEntries.slice(-5);
        const previous = allEntries.slice(-10, -5);

        const recentPositive = recent.filter(e => e.emotion === 'Happiness').length;
        const previousPositive = previous.filter(e => e.emotion === 'Happiness').length;

        if (recentPositive > previousPositive) trend = 'Improving';
        else if (recentPositive < previousPositive) trend = 'Declining';
      }

      setStats({
        totalEntries: allEntries.length,
        dominantEmotion: dominant,
        avgConfidence: Math.round(avgConf * 100),
        recentTrend: trend
      });
    }
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Happiness': return '😊';
      case 'Sadness': return '😢';
      case 'Anger': return '😠';
      case 'Anxiety': return '😰';
      default: return '😐';
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion) {
      case 'Happiness': return 'from-green-500 to-emerald-600';
      case 'Sadness': return 'from-blue-500 to-indigo-600';
      case 'Anger': return 'from-red-500 to-rose-600';
      case 'Anxiety': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-500 to-slate-600';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'Improving': return 'text-green-600 bg-green-50';
      case 'Declining': return 'text-red-600 bg-red-50';
      default: return 'text-blue-600 bg-blue-50';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div
        variants={itemVariants}
        className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-2xl"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl rounded-bl-none animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>

        <div className="relative z-10">
          <motion.h2
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-4xl font-extrabold mb-2 tracking-tight"
          >
            Welcome to Your Emotional Dashboard
          </motion.h2>
          <motion.p
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-indigo-100 mb-8 text-lg max-w-2xl"
          >
            Track your emotional journey, visualize patterns, and gain deep insights into your mental well-being with our advanced AI analysis.
          </motion.p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onNavigate('entry')}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-bold shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center gap-2 group"
          >
            <Zap className="w-5 h-5 group-hover:text-amber-500 transition-colors" />
            Add New Entry
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ThreeDCard className="h-full">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Total Entries</p>
            <p className="text-4xl font-black text-gray-900">{stats.totalEntries}</p>
          </div>
        </ThreeDCard>

        <ThreeDCard className="h-full">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-br ${getEmotionColor(stats.dominantEmotion)} p-3 rounded-xl shadow-md`}>
                <Smile className="w-6 h-6 text-white" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Dominant Emotion</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl">{getEmotionIcon(stats.dominantEmotion)}</span>
              <p className="text-2xl font-bold text-gray-900">{stats.dominantEmotion}</p>
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="h-full">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 p-3 rounded-xl">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Avg. Confidence</p>
            <p className="text-4xl font-black text-gray-900">{stats.avgConfidence}%</p>
            <div className="w-full bg-gray-100 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-purple-500 rounded-full"
                style={{ width: `${stats.avgConfidence}%` }}
              />
            </div>
          </div>
        </ThreeDCard>

        <ThreeDCard className="h-full">
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 h-full">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${getTrendColor(stats.recentTrend)}`}>
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
            <p className="text-gray-500 text-sm font-medium mb-1">Recent Trend</p>
            <p className="text-3xl font-bold text-gray-900">{stats.recentTrend}</p>
          </div>
        </ThreeDCard>
      </motion.div>

      {/* Recent Entries */}
      <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Entries</h3>
          <button
            onClick={() => onNavigate('timeline')}
            className="text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
          >
            View All
          </button>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ repeat: Infinity, duration: 5 }}
              className="inline-block"
            >
              <Meh className="w-20 h-20 text-gray-300 mb-4" />
            </motion.div>
            <p className="text-gray-600 mb-6 text-lg">No entries yet. Start tracking your emotions!</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onNavigate('entry')}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
              Create Your First Entry
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.slice(-5).reverse().map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group flex items-start gap-5 p-5 rounded-2xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-gray-100 cursor-default"
              >
                <div className={`bg-gradient-to-br ${getEmotionColor(entry.emotion)} p-4 rounded-2xl text-3xl shadow-sm group-hover:scale-110 transition-transform`}>
                  {getEmotionIcon(entry.emotion)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">{entry.emotion}</h4>
                    <span className="text-sm text-gray-500 font-medium">
                      {new Date(entry.timestamp).toLocaleDateString()} • {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2 leading-relaxed">{entry.text}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
                      Confidence: {Math.round(entry.confidence * 100)}%
                    </span>
                    {entry.keywords && entry.keywords.map((k, i) => (
                      <span key={i} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                        #{k}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { icon: TrendingUp, title: "View Timeline", desc: "Visualize your emotional journey over time", nav: 'timeline', color: 'text-indigo-600' },
          { icon: Zap, title: "Trend Analysis", desc: "Discover patterns and insights", nav: 'analysis', color: 'text-purple-600' },
          { icon: Frown, title: "Generate Reports", desc: "Download detailed emotion reports", nav: 'reports', color: 'text-pink-600' }
        ].map((action, i) => (
          <motion.button
            key={i}
            whileHover={{ y: -5 }}
            onClick={() => onNavigate(action.nav as any)}
            className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all text-left group"
          >
            <div className="bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-50 transition-colors">
              <action.icon className={`w-8 h-8 ${action.color}`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h3>
            <p className="text-gray-600 leading-relaxed">{action.desc}</p>
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}

