import { useState, useEffect } from 'react';
import { Download, FileText, Calendar, BarChart3, Trash2, AlertCircle } from 'lucide-react';
import { getEmotionEntries, clearEmotionEntries, type EmotionEntry } from '@/app/utils/emotionStorage';

export default function Reports() {
  const [entries, setEntries] = useState<EmotionEntry[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv' | 'txt'>('json');
  const [dateRange, setDateRange] = useState<'7days' | '30days' | '90days' | 'all'>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const allEntries = getEmotionEntries();
    setEntries(allEntries);
  };

  const getFilteredEntries = () => {
    const now = Date.now();
    let cutoffTime = 0;

    switch (dateRange) {
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

    return entries.filter(entry => entry.timestamp >= cutoffTime);
  };

  const generateStatistics = (data: EmotionEntry[]) => {
    const emotionCounts: Record<string, number> = {
      Happiness: 0,
      Sadness: 0,
      Anger: 0,
      Anxiety: 0,
      Neutral: 0
    };

    let totalConfidence = 0;

    data.forEach(entry => {
      emotionCounts[entry.emotion]++;
      totalConfidence += entry.confidence;
    });

    const dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0];

    return {
      totalEntries: data.length,
      emotionDistribution: emotionCounts,
      dominantEmotion: { emotion: dominantEmotion[0], count: dominantEmotion[1] },
      averageConfidence: data.length > 0 ? (totalConfidence / data.length).toFixed(2) : '0',
      dateRange: {
        start: data.length > 0 ? new Date(Math.min(...data.map(e => e.timestamp))).toLocaleDateString() : 'N/A',
        end: data.length > 0 ? new Date(Math.max(...data.map(e => e.timestamp))).toLocaleDateString() : 'N/A'
      }
    };
  };

  const downloadJSON = () => {
    const filteredData = getFilteredEntries();
    const stats = generateStatistics(filteredData);

    const report = {
      generatedAt: new Date().toISOString(),
      statistics: stats,
      entries: filteredData.map(entry => ({
        ...entry,
        timestamp: new Date(entry.timestamp).toISOString(),
        date: new Date(entry.timestamp).toLocaleDateString(),
        time: new Date(entry.timestamp).toLocaleTimeString()
      }))
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emotional-report-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadCSV = () => {
    const filteredData = getFilteredEntries();

    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    // CSV headers
    let csv = 'Date,Time,Emotion,Confidence,Text,Keywords\n';

    // CSV data
    filteredData.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      const time = new Date(entry.timestamp).toLocaleTimeString();
      const text = `"${entry.text.replace(/"/g, '""')}"`;
      const keywords = `"${entry.keywords.join(', ')}"`;
      csv += `${date},${time},${entry.emotion},${(entry.confidence * 100).toFixed(1)}%,${text},${keywords}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emotional-report-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadTXT = () => {
    const filteredData = getFilteredEntries();
    const stats = generateStatistics(filteredData);

    let report = `EMOTIONAL DRIFT MONITORING REPORT\n`;
    report += `Generated: ${new Date().toLocaleString()}\n`;
    report += `${'='.repeat(60)}\n\n`;

    report += `STATISTICS\n`;
    report += `${'─'.repeat(60)}\n`;
    report += `Total Entries: ${stats.totalEntries}\n`;
    report += `Date Range: ${stats.dateRange.start} - ${stats.dateRange.end}\n`;
    report += `Average Confidence: ${stats.averageConfidence}%\n`;
    report += `Dominant Emotion: ${stats.dominantEmotion.emotion} (${stats.dominantEmotion.count} entries)\n\n`;

    report += `EMOTION DISTRIBUTION\n`;
    report += `${'─'.repeat(60)}\n`;
    Object.entries(stats.emotionDistribution).forEach(([emotion, count]) => {
      const percentage = stats.totalEntries > 0 ? ((count / stats.totalEntries) * 100).toFixed(1) : '0';
      const bar = '█'.repeat(Math.round(count / 2));
      report += `${emotion.padEnd(12)} ${count.toString().padStart(4)} (${percentage.padStart(5)}%) ${bar}\n`;
    });

    report += `\n${'='.repeat(60)}\n\n`;
    report += `ENTRIES\n`;
    report += `${'─'.repeat(60)}\n\n`;

    filteredData.forEach((entry, index) => {
      report += `Entry #${index + 1}\n`;
      report += `Date: ${new Date(entry.timestamp).toLocaleDateString()} ${new Date(entry.timestamp).toLocaleTimeString()}\n`;
      report += `Emotion: ${entry.emotion}\n`;
      report += `Confidence: ${(entry.confidence * 100).toFixed(1)}%\n`;
      report += `Keywords: ${entry.keywords.join(', ') || 'None'}\n`;
      report += `Text: ${entry.text}\n`;
      report += `${'-'.repeat(60)}\n\n`;
    });

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `emotional-report-${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownload = () => {
    switch (selectedFormat) {
      case 'json':
        downloadJSON();
        break;
      case 'csv':
        downloadCSV();
        break;
      case 'txt':
        downloadTXT();
        break;
    }
  };

  const handleClearData = () => {
    clearEmotionEntries();
    setEntries([]);
    setShowClearConfirm(false);
    alert('All emotional data has been cleared.');
  };

  const filteredEntries = getFilteredEntries();
  const stats = generateStatistics(filteredEntries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Data Export</h2>
        <p className="text-gray-600">
          Generate comprehensive reports and export your emotional data
        </p>
      </div>

      {/* Report Configuration */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Export Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value as typeof selectedFormat)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="json">JSON - For developers</option>
              <option value="csv">CSV - For spreadsheets</option>
              <option value="txt">TXT - Human-readable</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={filteredEntries.length === 0}
          className="mt-6 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          Download Report ({filteredEntries.length} entries)
        </button>
      </div>

      {/* Statistics Preview */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Preview</h3>
        
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No data available for the selected date range</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm text-indigo-600 font-medium">Total Entries</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalEntries}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Dominant</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{stats.dominantEmotion.emotion}</p>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">Avg Confidence</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageConfidence}%</p>
              </div>

              <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-lg p-4 border border-pink-100">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-5 h-5 text-pink-600" />
                  <span className="text-sm text-pink-600 font-medium">Date Range</span>
                </div>
                <p className="text-xs font-medium text-gray-900">{stats.dateRange.start}</p>
                <p className="text-xs text-gray-600">to {stats.dateRange.end}</p>
              </div>
            </div>

            {/* Emotion Distribution */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Emotion Distribution</h4>
              <div className="space-y-3">
                {Object.entries(stats.emotionDistribution)
                  .filter(([_, count]) => count > 0)
                  .sort((a, b) => b[1] - a[1])
                  .map(([emotion, count]) => {
                    const percentage = (count / stats.totalEntries) * 100;
                    const colors: Record<string, string> = {
                      Happiness: 'bg-green-500',
                      Sadness: 'bg-blue-500',
                      Anger: 'bg-red-500',
                      Anxiety: 'bg-yellow-500',
                      Neutral: 'bg-gray-500'
                    };

                    return (
                      <div key={emotion}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{emotion}</span>
                          <span className="text-sm text-gray-600">
                            {count} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[emotion]}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Format Information */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-gray-900 mb-3">📄 Export Format Details</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div>
            <span className="font-medium">JSON:</span> Machine-readable format containing all entry data, statistics, and timestamps. Best for importing into other applications or backup purposes.
          </div>
          <div>
            <span className="font-medium">CSV:</span> Spreadsheet-compatible format that can be opened in Excel, Google Sheets, or other data analysis tools. Perfect for creating custom visualizations.
          </div>
          <div>
            <span className="font-medium">TXT:</span> Human-readable plain text report with formatted statistics and all entry details. Ideal for printing or reading without software.
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-semibold text-red-900 mb-2">Clear All Data</h4>
              <p className="text-sm text-red-800 mb-4">
                This will permanently delete all your emotional entries. This action cannot be undone. 
                Make sure to export your data first if you want to keep a backup.
              </p>
              
              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="font-medium text-red-900">Are you absolutely sure?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={handleClearData}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Yes, Delete Everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
        <h3 className="font-semibold text-gray-900 mb-3">🔒 Privacy & Data Storage</h3>
        <p className="text-sm text-gray-700">
          All your emotional data is stored locally on your device using browser storage. No data is sent to external servers. 
          Your entries remain completely private and secure. If you clear your browser data or use a different device, 
          you won't be able to access your previous entries unless you've exported them.
        </p>
      </div>
    </div>
  );
}
