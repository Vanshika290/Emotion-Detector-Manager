import { useRef, useState, useEffect } from 'react';
import { Mic, Loader2, CheckCircle, X, Volume2, AlertCircle, Bug } from 'lucide-react';
import { motion } from 'motion/react';
import { detectEmotion } from '@/app/utils/emotionDetection';
import { saveEmotionEntry, type EmotionEntry } from '@/app/utils/emotionStorage';

interface VoiceEmotionDetectionProps {
    onSuccess: () => void;
    onClose: () => void;
}

export default function VoiceEmotionDetection({ onSuccess, onClose }: VoiceEmotionDetectionProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<string>('Idle');
    const [error, setError] = useState<string | null>(null);
    const [debugLog, setDebugLog] = useState<string[]>([]);

    // Refs for mutable state to avoid closure issues
    const recognitionRef = useRef<any>(null);
    const isRecordingRef = useRef(false);
    const transcriptRef = useRef('');

    const addLog = (msg: string) => {
        console.log(`[Voice] ${msg}`);
        setDebugLog(prev => [`${new Date().toLocaleTimeString()} ${msg}`, ...prev].slice(0, 10));
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            stopEverything();
        };
    }, []);

    const stopEverything = () => {
        isRecordingRef.current = false;
        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        }
    };

    const startRecording = async () => {
        setError(null);
        setTranscript('');
        transcriptRef.current = '';
        addLog("Initializing...");
        setStatus("Initializing...");

        // 1. Check Browser Support
        if (!('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            setError('Browser not supported. Please use Chrome/Edge.');
            return;
        }

        try {
            // 2. Setup Speech Recognition (Lazy Init)
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            // Debugging events
            recognition.onaudiostart = () => addLog("Audio input started");
            recognition.onsoundstart = () => addLog("Sound detected");
            recognition.onspeechstart = () => addLog("Speech detected");
            recognition.onspeechend = () => addLog("Speech stopped");
            recognition.onaudioend = () => addLog("Audio input ended");
            recognition.onnomatch = () => addLog("No match found");

            recognition.onstart = () => {
                addLog("Service started");
                setStatus("Listening...");
                setIsRecording(true);
                isRecordingRef.current = true;
            };

            recognition.onerror = (event: any) => {
                const err = event.error;
                addLog(`Error: ${err}`);

                if (err === 'not-allowed') {
                    setError('Microphone blocked. Check browser settings.');
                    stopRecording();
                } else if (err === 'no-speech') {
                    // This is the common one - silence detected
                    addLog("Silence detected (no-speech)");
                } else if (err === 'network') {
                    setError('Network error. Check internet.');
                }
            };

            recognition.onend = () => {
                addLog("Service ended");
                // Key fix: Only restart if we truly intend to be recording
                if (isRecordingRef.current) {
                    addLog("Auto-restarting...");
                    setTimeout(() => {
                        try {
                            recognition.start();
                        } catch (e) {
                            addLog("Restart failed");
                            setIsRecording(false);
                        }
                    }, 50);
                } else {
                    setIsRecording(false);
                    setStatus("Idle");
                }
            };

            recognition.onresult = (event: any) => {
                let finalChunk = '';
                let interimChunk = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalChunk += event.results[i][0].transcript;
                    } else {
                        interimChunk += event.results[i][0].transcript;
                    }
                }

                if (finalChunk) {
                    addLog(`Final: ${finalChunk.substring(0, 20)}...`);
                    transcriptRef.current = (transcriptRef.current + ' ' + finalChunk).trim();
                }

                // Always update UI
                const display = (transcriptRef.current + ' ' + interimChunk).trim();
                setTranscript(display);
            };

            recognitionRef.current = recognition;
            recognition.start();

        } catch (e: any) {
            addLog(`Catch: ${e.message}`);
            setError("Could not start API.");
        }
    };

    const stopRecording = () => {
        addLog("User stopped");
        isRecordingRef.current = false;

        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }

        setIsRecording(false);
        setStatus('Analysis Ready');
    };

    const processEmotion = async () => {
        const textToAnalyze = transcript.trim() || transcriptRef.current.trim();

        if (!textToAnalyze) {
            setError("Please say something first.");
            return;
        }

        setIsProcessing(true);
        addLog("Analyzing text...");

        await new Promise(resolve => setTimeout(resolve, 800));
        const analysis = detectEmotion(textToAnalyze);

        const entry: EmotionEntry = {
            id: `entry_${Date.now()}`,
            text: textToAnalyze,
            emotion: analysis.emotion,
            confidence: analysis.confidence,
            timestamp: Date.now(),
            keywords: [...analysis.keywords, 'voice-detected']
        };

        saveEmotionEntry(entry);
        setIsProcessing(false);
        onSuccess();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Volume2 className="w-6 h-6 text-indigo-600" />
                        Voice Scan
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-6 overflow-y-auto">
                    {/* Status Badge */}
                    <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider transition-colors ${status === 'Listening...' ? 'bg-red-100 text-red-600 animate-pulse' :
                            status === 'Initializing...' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-gray-100 text-gray-600'
                        }`}>
                        {status}
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 w-full text-sm border border-red-100">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Microphone Icon Area (Replaces Visualizer to reduce conflict) */}
                    <div className="relative w-full h-32 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center shrink-0">
                        {isRecording ? (
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                className="bg-red-100 p-6 rounded-full"
                            >
                                <Mic className="w-10 h-10 text-red-600" />
                            </motion.div>
                        ) : (
                            <div className="bg-gray-100 p-6 rounded-full">
                                <Mic className="w-10 h-10 text-gray-400" />
                            </div>
                        )}
                        <p className="absolute bottom-4 text-xs text-gray-400 font-medium">
                            {isRecording ? "Microphone Active" : "Microphone Idle"}
                        </p>
                    </div>

                    {/* Transcript Preview */}
                    <div className="w-full bg-indigo-50/50 rounded-xl p-6 min-h-[120px] border border-indigo-100 text-left relative">
                        <p className="text-xs text-indigo-400 font-bold uppercase mb-2 flex justify-between">
                            <span>Live Transcript</span>
                            <span className="text-[10px] opacity-70">{transcript.length} chars</span>
                        </p>
                        <p className="text-gray-900 text-lg font-medium leading-relaxed">
                            {transcript || <span className="text-gray-400 italic font-normal">Tap "Start" and speak normally...</span>}
                        </p>
                    </div>

                    {/* Debug Log */}
                    <div className="w-full">
                        <details className="text-xs text-gray-400">
                            <summary className="cursor-pointer hover:text-gray-600 flex items-center gap-1 select-none">
                                <Bug className="w-3 h-3" /> Diagnostic Logs
                            </summary>
                            <div className="mt-2 bg-slate-900 text-green-400 p-3 rounded-lg font-mono text-[10px] h-24 overflow-y-auto border border-slate-800 shadow-inner">
                                {debugLog.length === 0 && <span className="opacity-50">Log empty...</span>}
                                {debugLog.map((log, i) => (
                                    <div key={i} className="border-b border-white/5 pb-0.5 mb-0.5 last:border-0">{log}</div>
                                ))}
                            </div>
                        </details>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 w-full pt-2">
                        {!isProcessing ? (
                            <>
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    className={`flex-1 py-4 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2 ${isRecording
                                            ? 'bg-red-500 hover:bg-red-600 shadow-red-200'
                                            : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
                                        }`}
                                >
                                    {isRecording ? (
                                        <> <div className="w-3 h-3 bg-white rounded-sm" /> Stop Recording </>
                                    ) : (
                                        <> <Mic className="w-5 h-5" /> Start Recording </>
                                    )}
                                </button>

                                <button
                                    onClick={processEmotion}
                                    disabled={!transcript && !transcriptRef.current}
                                    className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                                >
                                    <CheckCircle className="w-5 h-5" /> Analyze
                                </button>
                            </>
                        ) : (
                            <div className="w-full py-4 bg-gray-100 rounded-xl flex items-center justify-center gap-2 text-gray-500 font-medium animate-pulse border border-gray-200">
                                <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                                Analyzing Emotions...
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
