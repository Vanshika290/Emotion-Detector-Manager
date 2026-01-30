import { useState } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, Camera } from 'lucide-react';
import { detectEmotion, analyzeIntensity } from '@/app/utils/emotionDetection';
import { saveEmotionEntry, type EmotionEntry } from '@/app/utils/emotionStorage';
import FacialEmotionDetection from '@/app/components/FacialEmotionDetection';

interface EmotionEntryProps {
  onSuccess: () => void;
}

export default function EmotionEntry({ onSuccess }: EmotionEntryProps) {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<{
    emotion: string;
    confidence: number;
    keywords: string[];
    intensity: string;
  } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFacialDetection, setShowFacialDetection] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!text.trim()) {
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    // Simulate AI processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));

    const detection = detectEmotion(text);
    const intensity = analyzeIntensity(text);

    setResult({
      emotion: detection.emotion,
      confidence: detection.confidence,
      keywords: detection.keywords,
      intensity
    });

    // Save to localStorage
    const entry: EmotionEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: text.trim(),
      emotion: detection.emotion,
      confidence: detection.confidence,
      timestamp: Date.now(),
      keywords: detection.keywords
    };

    saveEmotionEntry(entry);

    setIsAnalyzing(false);
    setShowSuccess(true);

    // Reset form after 2 seconds
    setTimeout(() => {
      setText('');
      setResult(null);
      setShowSuccess(false);
      onSuccess();
    }, 2000);
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

  const getEmotionIcon = (emotion: string) => {
    switch (emotion) {
      case 'Happiness': return '😊';
      case 'Sadness': return '😢';
      case 'Anger': return '😠';
      case 'Anxiety': return '😰';
      default: return '😐';
    }
  };

  const getIntensityColor = (intensity: string) => {
    switch (intensity) {
      case 'high': return 'bg-red-100 text-red-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">New Emotional Entry</h2>
          <p className="text-gray-600">
            Share your thoughts, feelings, or experiences. Our AI will analyze the emotional content and track your emotional journey.
          </p>
          
          {/* Facial Recognition Button */}
          <button
            onClick={() => setShowFacialDetection(true)}
            className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Use Facial Emotion Detection
          </button>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label htmlFor="emotion-text" className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today?
              </label>
              <textarea
                id="emotion-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write about your day, your feelings, or anything on your mind... The more you write, the better our AI can understand your emotional state."
                className="w-full min-h-[200px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                disabled={isAnalyzing || showSuccess}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {text.length} characters
                </span>
                <span className="text-sm text-gray-500">
                  {text.trim().split(/\s+/).filter(w => w.length > 0).length} words
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={!text.trim() || isAnalyzing || showSuccess}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Emotions...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Entry Saved!
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Analyze & Save Entry
                </>
              )}
            </button>
          </div>
        </form>

        {/* Analysis Result */}
        {result && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-in fade-in duration-500">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-gray-900">Analysis Complete</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Detected Emotion */}
              <div className={`bg-gradient-to-br ${getEmotionColor(result.emotion)} rounded-xl p-6 text-white`}>
                <p className="text-sm opacity-90 mb-2">Detected Emotion</p>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-5xl">{getEmotionIcon(result.emotion)}</span>
                  <p className="text-3xl font-bold">{result.emotion}</p>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <p className="text-sm opacity-90 mb-1">Confidence Level</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-white/30 rounded-full h-2">
                      <div
                        className="bg-white h-2 rounded-full transition-all"
                        style={{ width: `${result.confidence * 100}%` }}
                      />
                    </div>
                    <span className="font-bold">{Math.round(result.confidence * 100)}%</span>
                  </div>
                </div>
              </div>

              {/* Additional Insights */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-2">Emotional Intensity</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getIntensityColor(result.intensity)}`}>
                    {result.intensity.toUpperCase()}
                  </span>
                </div>

                {result.keywords.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-3">Key Emotional Indicators</p>
                    <div className="flex flex-wrap gap-2">
                      {result.keywords.map((keyword, index) => (
                        <span
                          key={index}
                          className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-indigo-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-indigo-900 mb-1">Entry Recorded</p>
                      <p className="text-sm text-indigo-700">
                        Your emotional state has been logged and will contribute to your long-term trend analysis.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tips Section */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <h3 className="font-semibold text-gray-900 mb-3">💡 Tips for Better Analysis</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Write at least 2-3 sentences for more accurate emotion detection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Be honest and specific about your feelings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Make regular entries to track emotional patterns over time</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>Your entries are stored locally on your device for privacy</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Facial Emotion Detection Modal */}
      {showFacialDetection && (
        <FacialEmotionDetection
          onClose={() => setShowFacialDetection(false)}
          onSuccess={onSuccess}
        />
      )}
    </>
  );
}