import { useEffect, useState } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, TrendingUp, Filter } from 'lucide-react';
import { getEmotionEntries, type EmotionEntry } from '@/app/utils/emotionStorage';

type TimeRange = '7days' | '30days' | '90days' | 'all';

export default function EmotionTimeline() {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('30days');
  const [filteredEntries, setFilteredEntries] = useState<EmotionEntry[]>([]);

  useEffect(() => {
    loadEntries();
  }, []);

  useEffect(() => {
    filterEntriesByTimeRange();
  }, [entries, timeRange]);

  const loadEntries = () => {
    const allEntries = getEmotionEntries();
    setEntries(allEntries);
  };

  const filterEntriesByTimeRange = () => {
    const now = Date.now();
    let cutoffTime = 0;

    switch (timeRange) {
      case '7days':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000;
        break;
      case '30days':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000;
        break;
      case '90days':
        cutoffTime = now - 90 * 24 * 60 * 60 * 1000;
        break;
      case 'all':
        cutoffTime = 0;
        break;
    }

    const filtered = entries.filter(entry => entry.timestamp >= cutoffTime);
    setFilteredEntries(filtered);
  };

  // Prepare timeline data
  const getTimelineData = () => {
    if (filteredEntries.length === 0) return [];

    // Group entries by date
    const groupedByDate: Record<string, EmotionEntry[]> = {};

    filteredEntries.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(entry);
    });

    // Calculate emotion scores for each date
    return Object.entries(groupedByDate)
      .map(([date, dayEntries]) => {
        const emotionCounts = {
          Happiness: 0,
          Sadness: 0,
          Anger: 0,
          Anxiety: 0,
          Neutral: 0
        };

        dayEntries.forEach(entry => {
          emotionCounts[entry.emotion]++;
        });

        // Calculate emotional score (positive emotions - negative emotions)
        const positiveScore = emotionCounts.Happiness * 2;
        const negativeScore = (emotionCounts.Sadness + emotionCounts.Anger + emotionCounts.Anxiety);
        const emotionalScore = positiveScore - negativeScore + 50; // Normalize to 0-100 scale

        return {
          date,
          timestamp: dayEntries[0].timestamp,
          Happiness: emotionCounts.Happiness,
          Sadness: emotionCounts.Sadness,
          Anger: emotionCounts.Anger,
          Anxiety: emotionCounts.Anxiety,
          Neutral: emotionCounts.Neutral,
          emotionalScore: Math.max(0, Math.min(100, emotionalScore)),
          totalEntries: dayEntries.length
        };
      })
      .sort((a, b) => a.timestamp - b.timestamp);
  };

  // Prepare emotion distribution data
  const getEmotionDistribution = () => {
    const counts = {
      Happiness: 0,
      Sadness: 0,
      Anger: 0,
      Anxiety: 0,
      Neutral: 0
    };

    filteredEntries.forEach(entry => {
      counts[entry.emotion]++;
    });

    return Object.entries(counts)
      .filter(([_, count]) => count > 0)
      .map(([emotion, count]) => ({
        name: emotion,
        value: count,
        percentage: ((count / filteredEntries.length) * 100).toFixed(1)
      }));
  };

  const timelineData = getTimelineData();
  const distributionData = getEmotionDistribution();

  const EMOTION_COLORS = {
    Happiness: '#10b981',
    Sadness: '#3b82f6',
    Anger: '#ef4444',
    Anxiety: '#f59e0b',
    Neutral: '#6b7280'
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600 mb-6">Start adding emotion entries to see your timeline visualization.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Emotion Timeline</h2>
            <p className="text-gray-600">Visualize your emotional journey over time</p>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">
              Showing {filteredEntries.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-600">
              {timelineData.length} days tracked
            </span>
          </div>
        </div>
      </div>

      {/* Emotional Score Over Time */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotional Wellbeing Score</h3>
        <p className="text-sm text-gray-600 mb-4">Higher scores indicate more positive emotional states</p>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={timelineData}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="emotionalScore"
              stroke="#8b5cf6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Emotion Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Distribution Over Time</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Line
              type="monotone"
              dataKey="Happiness"
              stroke={EMOTION_COLORS.Happiness}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Sadness"
              stroke={EMOTION_COLORS.Sadness}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Anger"
              stroke={EMOTION_COLORS.Anger}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Anxiety"
              stroke={EMOTION_COLORS.Anxiety}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="Neutral"
              stroke={EMOTION_COLORS.Neutral}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Emotion Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} (${percentage}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Emotion Frequency</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]}>
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={EMOTION_COLORS[entry.name as keyof typeof EMOTION_COLORS]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Entry Volume */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Entry Activity</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timelineData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="totalEntries" fill="#6366f1" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
