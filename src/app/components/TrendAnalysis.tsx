import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Activity, Calendar, Brain, Sparkles } from 'lucide-react';
import { getEmotionEntries, type EmotionEntry } from '@/app/utils/emotionStorage';

interface TrendInsight {
  type: 'positive' | 'negative' | 'neutral' | 'warning';
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface EmotionPattern {
  pattern: string;
  frequency: number;
  description: string;
}

export default function TrendAnalysis() {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [insights, setInsights] = useState<TrendInsight[]>([]);
  const [patterns, setPatterns] = useState<EmotionPattern[]>([]);
  const [emotionalStability, setEmotionalStability] = useState(0);
  const [overallTrend, setOverallTrend] = useState<'improving' | 'stable' | 'declining'>('stable');

  useEffect(() => {
    loadAndAnalyze();
  }, []);

  const loadAndAnalyze = () => {
    const allEntries = getEmotionEntries();
    setEntries(allEntries);

    if (allEntries.length === 0) return;

    // Analyze trends and patterns
    analyzeEmotionalStability(allEntries);
    detectPatterns(allEntries);
    generateInsights(allEntries);
  };

  const analyzeEmotionalStability = (entries: EmotionEntry[]) => {
    if (entries.length < 2) {
      setEmotionalStability(100);
      setOverallTrend('stable');
      return;
    }

    // Calculate variance in emotions
    const emotionScores = entries.map(entry => {
      switch (entry.emotion) {
        case 'Happiness': return 5;
        case 'Neutral': return 3;
        case 'Anxiety': return 2;
        case 'Sadness': return 1;
        case 'Anger': return 0;
        default: return 3;
      }
    });

    const mean = emotionScores.reduce((a, b) => a + b, 0) / emotionScores.length;
    const variance = emotionScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / emotionScores.length;
    const stability = Math.max(0, 100 - (variance * 20));

    setEmotionalStability(Math.round(stability));

    // Analyze recent trend (last 7 entries vs previous 7)
    if (entries.length >= 14) {
      const recent = entries.slice(-7);
      const previous = entries.slice(-14, -7);

      const recentAvg = recent.reduce((sum, e) => sum + (emotionScores[entries.indexOf(e)] || 0), 0) / 7;
      const previousAvg = previous.reduce((sum, e) => sum + (emotionScores[entries.indexOf(e)] || 0), 0) / 7;

      if (recentAvg > previousAvg + 0.5) setOverallTrend('improving');
      else if (recentAvg < previousAvg - 0.5) setOverallTrend('declining');
      else setOverallTrend('stable');
    }
  };

  const detectPatterns = (entries: EmotionEntry[]) => {
    const detectedPatterns: EmotionPattern[] = [];

    // Pattern 1: Consecutive emotions
    let consecutiveHappiness = 0;
    let consecutiveSadness = 0;
    let consecutiveAnxiety = 0;

    entries.forEach(entry => {
      if (entry.emotion === 'Happiness') consecutiveHappiness++;
      else consecutiveHappiness = 0;

      if (entry.emotion === 'Sadness') consecutiveSadness++;
      else consecutiveSadness = 0;

      if (entry.emotion === 'Anxiety') consecutiveAnxiety++;
      else consecutiveAnxiety = 0;
    });

    if (consecutiveHappiness >= 3) {
      detectedPatterns.push({
        pattern: 'Sustained Positivity',
        frequency: consecutiveHappiness,
        description: `${consecutiveHappiness} consecutive positive entries detected. Great job maintaining a positive outlook!`
      });
    }

    if (consecutiveSadness >= 3) {
      detectedPatterns.push({
        pattern: 'Prolonged Sadness',
        frequency: consecutiveSadness,
        description: `${consecutiveSadness} consecutive sad entries. Consider reaching out for support if needed.`
      });
    }

    if (consecutiveAnxiety >= 3) {
      detectedPatterns.push({
        pattern: 'Persistent Anxiety',
        frequency: consecutiveAnxiety,
        description: `${consecutiveAnxiety} consecutive anxious entries. Practice stress management techniques.`
      });
    }

    // Pattern 2: Weekly patterns
    const weekdayEmotions: Record<number, string[]> = {};
    entries.forEach(entry => {
      const day = new Date(entry.timestamp).getDay();
      if (!weekdayEmotions[day]) weekdayEmotions[day] = [];
      weekdayEmotions[day].push(entry.emotion);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    Object.entries(weekdayEmotions).forEach(([day, emotions]) => {
      const negativeCount = emotions.filter(e => e === 'Sadness' || e === 'Anger' || e === 'Anxiety').length;
      if (negativeCount / emotions.length > 0.7 && emotions.length >= 3) {
        detectedPatterns.push({
          pattern: `${dayNames[parseInt(day)]} Blues`,
          frequency: emotions.length,
          description: `You tend to feel more negative on ${dayNames[parseInt(day)]}s. Plan self-care activities for these days.`
        });
      }
    });

    // Pattern 3: Emotion diversity
    const uniqueEmotions = new Set(entries.map(e => e.emotion)).size;
    if (uniqueEmotions <= 2 && entries.length >= 10) {
      detectedPatterns.push({
        pattern: 'Limited Emotional Range',
        frequency: uniqueEmotions,
        description: 'Your emotional range seems limited. This might indicate emotional suppression or consistent circumstances.'
      });
    }

    // Pattern 4: High volatility
    let emotionChanges = 0;
    for (let i = 1; i < entries.length; i++) {
      if (entries[i].emotion !== entries[i - 1].emotion) {
        emotionChanges++;
      }
    }
    const volatilityRate = emotionChanges / Math.max(entries.length - 1, 1);
    if (volatilityRate > 0.7) {
      detectedPatterns.push({
        pattern: 'High Emotional Volatility',
        frequency: emotionChanges,
        description: 'Frequent emotional shifts detected. Consider factors that might be causing instability.'
      });
    }

    setPatterns(detectedPatterns);
  };

  const generateInsights = (entries: EmotionEntry[]) => {
    const generatedInsights: TrendInsight[] = [];

    // Calculate emotion distribution
    const emotionCounts: Record<string, number> = {};
    entries.forEach(entry => {
      emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
    });

    const totalEntries = entries.length;
    const happinessRate = (emotionCounts['Happiness'] || 0) / totalEntries;
    const sadnessRate = (emotionCounts['Sadness'] || 0) / totalEntries;
    const anxietyRate = (emotionCounts['Anxiety'] || 0) / totalEntries;
    const angerRate = (emotionCounts['Anger'] || 0) / totalEntries;

    // Insight 1: Overall emotional health
    if (happinessRate > 0.5) {
      generatedInsights.push({
        type: 'positive',
        title: 'Strong Emotional Health',
        description: `${Math.round(happinessRate * 100)}% of your entries show happiness. You're maintaining a positive emotional state!`,
        icon: <CheckCircle className="w-6 h-6" />
      });
    } else if (happinessRate < 0.2) {
      generatedInsights.push({
        type: 'warning',
        title: 'Low Positive Emotions',
        description: `Only ${Math.round(happinessRate * 100)}% of entries show happiness. Consider activities that boost your mood.`,
        icon: <AlertCircle className="w-6 h-6" />
      });
    }

    // Insight 2: Anxiety levels
    if (anxietyRate > 0.4) {
      generatedInsights.push({
        type: 'warning',
        title: 'Elevated Anxiety Levels',
        description: `${Math.round(anxietyRate * 100)}% of entries indicate anxiety. Consider stress-reduction techniques like meditation or exercise.`,
        icon: <AlertCircle className="w-6 h-6" />
      });
    } else if (anxietyRate < 0.15) {
      generatedInsights.push({
        type: 'positive',
        title: 'Well-Managed Stress',
        description: `Low anxiety detected (${Math.round(anxietyRate * 100)}%). Your stress management strategies are working well.`,
        icon: <CheckCircle className="w-6 h-6" />
      });
    }

    // Insight 3: Emotional balance
    const negativeRate = sadnessRate + angerRate + anxietyRate;
    if (negativeRate < 0.3) {
      generatedInsights.push({
        type: 'positive',
        title: 'Balanced Emotional State',
        description: 'You show good emotional balance with minimal negative emotions. Keep up your positive practices!',
        icon: <Activity className="w-6 h-6" />
      });
    } else if (negativeRate > 0.6) {
      generatedInsights.push({
        type: 'negative',
        title: 'High Negative Emotion Frequency',
        description: `${Math.round(negativeRate * 100)}% of entries show negative emotions. Consider professional support if this persists.`,
        icon: <TrendingDown className="w-6 h-6" />
      });
    }

    // Insight 4: Recent entries
    const recentEntries = entries.slice(-5);
    const recentHappiness = recentEntries.filter(e => e.emotion === 'Happiness').length;
    if (recentHappiness >= 4) {
      generatedInsights.push({
        type: 'positive',
        title: 'Recent Positive Streak',
        description: 'Your last 5 entries show predominantly positive emotions. Something is going right!',
        icon: <Sparkles className="w-6 h-6" />
      });
    }

    // Insight 5: Consistency
    if (entries.length >= 30) {
      const last30Days = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const recentEntries = entries.filter(e => e.timestamp >= last30Days).length;
      if (recentEntries >= 20) {
        generatedInsights.push({
          type: 'positive',
          title: 'Excellent Tracking Consistency',
          description: `You've made ${recentEntries} entries in the last 30 days. Consistent tracking provides better insights!`,
          icon: <Calendar className="w-6 h-6" />
        });
      }
    }

    // Insight 6: Trend direction
    if (overallTrend === 'improving') {
      generatedInsights.push({
        type: 'positive',
        title: 'Positive Trend Detected',
        description: 'Your recent emotional state shows improvement compared to earlier periods. Keep it up!',
        icon: <TrendingUp className="w-6 h-6" />
      });
    } else if (overallTrend === 'declining') {
      generatedInsights.push({
        type: 'warning',
        title: 'Declining Emotional Trend',
        description: 'Recent entries show a decline in emotional wellbeing. Consider what factors might be contributing.',
        icon: <TrendingDown className="w-6 h-6" />
      });
    }

    setInsights(generatedInsights);
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'positive': return 'from-green-500 to-emerald-600';
      case 'negative': return 'from-red-500 to-rose-600';
      case 'warning': return 'from-yellow-500 to-orange-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case 'positive': return 'bg-green-50 border-green-200';
      case 'negative': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const getInsightTextColor = (type: string) => {
    switch (type) {
      case 'positive': return 'text-green-700';
      case 'negative': return 'text-red-700';
      case 'warning': return 'text-yellow-700';
      default: return 'text-blue-700';
    }
  };

  const getStabilityColor = () => {
    if (emotionalStability >= 70) return 'text-green-600';
    if (emotionalStability >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = () => {
    switch (overallTrend) {
      case 'improving': return <TrendingUp className="w-6 h-6 text-green-600" />;
      case 'declining': return <TrendingDown className="w-6 h-6 text-red-600" />;
      default: return <Activity className="w-6 h-6 text-blue-600" />;
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Analysis Available</h3>
        <p className="text-gray-600 mb-6">Start adding emotion entries to receive personalized trend analysis and insights.</p>
      </div>
    );
  }

  if (entries.length < 5) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-8 border border-indigo-200">
        <div className="flex items-start gap-4">
          <Brain className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">More Data Needed</h3>
            <p className="text-gray-700">
              You have {entries.length} entries. Add at least 5 entries to unlock detailed trend analysis and pattern detection.
              The more data you provide, the more accurate and insightful the analysis becomes!
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Trend Analysis & Insights</h2>
        <p className="text-gray-600">
          AI-powered analysis of your emotional patterns and behavioral drift
        </p>
      </div>

      {/* Overall Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <Brain className="w-8 h-8 opacity-90" />
            <span className="text-sm opacity-90">Overall</span>
          </div>
          <p className="text-sm opacity-90 mb-1">Emotional Stability</p>
          <p className="text-4xl font-bold">{emotionalStability}%</p>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all"
              style={{ width: `${emotionalStability}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            {getTrendIcon()}
            <span className="text-sm text-gray-600">Trend</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Recent Direction</p>
          <p className="text-3xl font-bold text-gray-900 capitalize">{overallTrend}</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 text-indigo-600" />
            <span className="text-sm text-gray-600">Data</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Entries</p>
          <p className="text-3xl font-bold text-gray-900">{entries.length}</p>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Key Insights</h3>
        {insights.length === 0 ? (
          <p className="text-gray-600">Keep tracking to generate personalized insights...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 border ${getInsightBgColor(insight.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-1 ${getInsightTextColor(insight.type)}`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold mb-1 ${getInsightTextColor(insight.type)}`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-gray-700">{insight.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detected Patterns */}
      {patterns.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Detected Patterns</h3>
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border border-purple-100">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-purple-900">{pattern.pattern}</h4>
                  <span className="bg-purple-200 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                    {pattern.frequency} occurrences
                  </span>
                </div>
                <p className="text-sm text-purple-800">{pattern.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white shadow-lg">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Personalized Recommendations
        </h3>
        <div className="space-y-3">
          {overallTrend === 'declining' && (
            <div className="bg-white/20 rounded-lg p-4">
              <p className="font-medium mb-1">🌟 Focus on Self-Care</p>
              <p className="text-sm opacity-90">Your emotional trend is declining. Prioritize activities that bring you joy and consider talking to someone you trust.</p>
            </div>
          )}
          {emotionalStability < 50 && (
            <div className="bg-white/20 rounded-lg p-4">
              <p className="font-medium mb-1">⚖️ Build Emotional Stability</p>
              <p className="text-sm opacity-90">Practice mindfulness, maintain a routine, and identify triggers that cause emotional fluctuations.</p>
            </div>
          )}
          <div className="bg-white/20 rounded-lg p-4">
            <p className="font-medium mb-1">📝 Continue Journaling</p>
            <p className="text-sm opacity-90">Regular entries provide better insights. Try to log your emotions at consistent times each day.</p>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <p className="font-medium mb-1">🔄 Review Patterns</p>
            <p className="text-sm opacity-90">Look for patterns in your data. Understanding what triggers certain emotions helps you manage them better.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
