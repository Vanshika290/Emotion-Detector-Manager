// Client-side emotion detection using keyword analysis
// This is a rule-based system that analyzes text for emotional keywords

interface EmotionResult {
  emotion: 'Happiness' | 'Sadness' | 'Anger' | 'Anxiety' | 'Neutral';
  confidence: number;
  keywords: string[];
}

const emotionKeywords = {
  Happiness: [
    'happy', 'joy', 'joyful', 'delighted', 'pleased', 'glad', 'cheerful', 'wonderful',
    'amazing', 'fantastic', 'great', 'excellent', 'love', 'loved', 'loving', 'excited',
    'ecstatic', 'thrilled', 'blessed', 'grateful', 'thankful', 'awesome', 'perfect',
    'smile', 'smiling', 'laugh', 'laughing', 'fun', 'enjoy', 'enjoying', 'celebration',
    'celebrate', 'success', 'successful', 'proud', 'achievement', 'accomplished',
    'beautiful', 'positive', 'optimistic', 'hopeful', 'bright', 'sunshine'
  ],
  Sadness: [
    'sad', 'unhappy', 'depressed', 'down', 'low', 'miserable', 'gloomy', 'disappointed',
    'upset', 'hurt', 'heartbroken', 'lonely', 'alone', 'isolated', 'empty', 'hopeless',
    'despair', 'grief', 'grieving', 'crying', 'tears', 'sorrow', 'sorrowful', 'blue',
    'melancholy', 'regret', 'lost', 'missing', 'miss', 'mourn', 'mourning', 'terrible',
    'awful', 'bad', 'worse', 'worst', 'failed', 'failure', 'rejected', 'rejection'
  ],
  Anger: [
    'angry', 'mad', 'furious', 'rage', 'enraged', 'irritated', 'annoyed', 'frustrated',
    'frustration', 'outraged', 'bitter', 'resentful', 'hostile', 'aggravated', 'livid',
    'infuriated', 'hate', 'hatred', 'disgusted', 'revolted', 'pissed', 'mad', 'fury',
    'anger', 'aggressive', 'violent', 'fight', 'fighting', 'argue', 'arguing', 'dispute',
    'conflict', 'enemy', 'revenge', 'unfair', 'injustice', 'betrayed', 'betrayal'
  ],
  Anxiety: [
    'anxious', 'anxiety', 'worried', 'worry', 'nervous', 'stressed', 'stress', 'panic',
    'panicking', 'fear', 'fearful', 'afraid', 'scared', 'terrified', 'frightened',
    'overwhelmed', 'tense', 'uneasy', 'restless', 'agitated', 'disturbed', 'troubled',
    'concerned', 'apprehensive', 'dread', 'dreading', 'uncertain', 'doubt', 'doubting',
    'insecure', 'vulnerable', 'threatened', 'danger', 'dangerous', 'unsafe', 'risk'
  ],
  Neutral: [
    'okay', 'fine', 'alright', 'normal', 'usual', 'regular', 'average', 'ordinary',
    'typical', 'standard', 'moderate', 'calm', 'peaceful', 'quiet', 'stable'
  ]
};

// Additional patterns for emotion detection
const emotionPatterns = {
  Happiness: [
    /feeling\s+(great|good|amazing|wonderful)/i,
    /had\s+a\s+(great|wonderful|amazing)\s+day/i,
    /things\s+are\s+(going\s+)?well/i,
    /couldn't\s+be\s+happier/i
  ],
  Sadness: [
    /feeling\s+(down|low|sad|depressed)/i,
    /can't\s+stop\s+crying/i,
    /nothing\s+seems\s+to\s+work/i,
    /lost\s+(hope|motivation)/i
  ],
  Anger: [
    /so\s+(mad|angry|furious)/i,
    /can't\s+believe/i,
    /makes\s+me\s+(angry|mad)/i,
    /had\s+enough/i
  ],
  Anxiety: [
    /feeling\s+(anxious|nervous|stressed)/i,
    /can't\s+stop\s+worrying/i,
    /keeps\s+me\s+up\s+at\s+night/i,
    /what\s+if/i
  ],
  Neutral: []
};

export function detectEmotion(text: string): EmotionResult {
  if (!text || text.trim().length === 0) {
    return {
      emotion: 'Neutral',
      confidence: 0.5,
      keywords: []
    };
  }

  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  // Calculate scores for each emotion
  const scores: Record<string, { score: number; matches: string[] }> = {
    Happiness: { score: 0, matches: [] },
    Sadness: { score: 0, matches: [] },
    Anger: { score: 0, matches: [] },
    Anxiety: { score: 0, matches: [] },
    Neutral: { score: 0, matches: [] }
  };

  // Check for keyword matches
  Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
    keywords.forEach(keyword => {
      // Check for exact word matches (with word boundaries)
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      if (regex.test(lowerText)) {
        scores[emotion].score += 1;
        scores[emotion].matches.push(keyword);
      }
    });
  });

  // Check for pattern matches (higher weight)
  Object.entries(emotionPatterns).forEach(([emotion, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        scores[emotion].score += 2;
      }
    });
  });

  // Apply negation detection (simple)
  const negationWords = ['not', 'no', 'never', "don't", "didn't", "won't", "can't", "isn't", "aren't"];
  const hasNegation = negationWords.some(neg => lowerText.includes(neg));
  
  if (hasNegation && scores.Happiness.score > 0) {
    // Flip happiness to sadness if negated
    scores.Sadness.score += scores.Happiness.score * 0.5;
    scores.Happiness.score *= 0.3;
  }

  // Find the emotion with the highest score
  let maxScore = 0;
  let detectedEmotion: EmotionResult['emotion'] = 'Neutral';
  let matchedKeywords: string[] = [];

  Object.entries(scores).forEach(([emotion, data]) => {
    if (data.score > maxScore) {
      maxScore = data.score;
      detectedEmotion = emotion as EmotionResult['emotion'];
      matchedKeywords = data.matches;
    }
  });

  // Calculate confidence based on score and text length
  const wordCount = words.length;
  const normalizedScore = Math.min(maxScore / Math.max(wordCount * 0.1, 1), 1);
  
  // Base confidence calculation
  let confidence = normalizedScore;
  
  // Boost confidence for clear indicators
  if (maxScore >= 3) confidence = Math.min(confidence + 0.2, 0.95);
  if (maxScore >= 5) confidence = Math.min(confidence + 0.15, 0.98);
  
  // Ensure minimum confidence
  if (maxScore > 0) {
    confidence = Math.max(confidence, 0.5);
  } else {
    // Default to neutral with medium confidence if no keywords found
    confidence = 0.6;
  }

  return {
    emotion: detectedEmotion,
    confidence: Math.round(confidence * 100) / 100,
    keywords: matchedKeywords.slice(0, 5) // Return top 5 matched keywords
  };
}

// Analyze emotional intensity
export function analyzeIntensity(text: string): 'low' | 'medium' | 'high' {
  const intensifiers = ['very', 'extremely', 'incredibly', 'absolutely', 'completely', 'totally', 'really', 'so'];
  const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
  const exclamationCount = (text.match(/!/g) || []).length;
  
  let intensityScore = 0;
  
  const lowerText = text.toLowerCase();
  intensifiers.forEach(word => {
    if (lowerText.includes(word)) intensityScore += 1;
  });
  
  if (capsRatio > 0.3) intensityScore += 2;
  if (exclamationCount > 2) intensityScore += 2;
  
  if (intensityScore >= 4) return 'high';
  if (intensityScore >= 2) return 'medium';
  return 'low';
}
