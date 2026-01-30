export interface EmotionEntry {
  id: string;
  text: string;
  emotion: 'Happiness' | 'Sadness' | 'Anger' | 'Anxiety' | 'Neutral';
  confidence: number;
  timestamp: number;
  keywords: string[];
}

const STORAGE_KEY = 'emotion_entries';

// Get all emotion entries from localStorage
export function getEmotionEntries(): EmotionEntry[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading emotion entries:', error);
    return [];
  }
}

// Save a new emotion entry
export function saveEmotionEntry(entry: EmotionEntry): void {
  try {
    const entries = getEmotionEntries();
    entries.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Error saving emotion entry:', error);
  }
}

// Clear all entries (for testing or reset)
export function clearEmotionEntries(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing emotion entries:', error);
  }
}

// Get entries within a date range
export function getEntriesInRange(startDate: Date, endDate: Date): EmotionEntry[] {
  const entries = getEmotionEntries();
  return entries.filter(entry => {
    const entryDate = new Date(entry.timestamp);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

// Get entries by emotion type
export function getEntriesByEmotion(emotion: string): EmotionEntry[] {
  const entries = getEmotionEntries();
  return entries.filter(entry => entry.emotion === emotion);
}
