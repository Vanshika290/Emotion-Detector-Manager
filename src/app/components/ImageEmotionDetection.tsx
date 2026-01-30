import { useRef, useState, useEffect } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from '@vladmandic/face-api';
import { saveEmotionEntry, type EmotionEntry } from '@/app/utils/emotionStorage';

interface ImageEmotionDetectionProps {
    onSuccess: () => void;
    onClose: () => void;
}

export default function ImageEmotionDetection({ onSuccess, onClose }: ImageEmotionDetectionProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
    const [confidence, setConfidence] = useState(0);
    const [modelsLoaded, setModelsLoaded] = useState(false);

    const imgRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
            await Promise.all([
                faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
            ]);
            setModelsLoaded(true);
        } catch (err) {
            console.error('Error loading face-api models', err);
            setError('Failed to load AI models. Please check your internet connection.');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onload = (event) => {
                if (event.target?.result) {
                    setImage(event.target.result as string);
                    setDetectedEmotion(null);
                    setError(null);
                }
            };

            reader.readAsDataURL(file);
        }
    };

    const analyzeImage = async () => {
        if (!imgRef.current || !canvasRef.current || !modelsLoaded) return;

        setIsAnalyzing(true);
        try {
            // Small delay to ensure UI updates
            await new Promise(resolve => setTimeout(resolve, 100));

            const detection = await faceapi
                .detectSingleFace(imgRef.current, new faceapi.TinyFaceDetectorOptions())
                .withFaceExpressions();

            if (detection) {
                // Draw detection
                const displaySize = { width: imgRef.current.width, height: imgRef.current.height };
                faceapi.matchDimensions(canvasRef.current, displaySize);
                const resizedDetections = faceapi.resizeResults(detection, displaySize);

                const ctx = canvasRef.current.getContext('2d');
                if (ctx) {
                    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                    faceapi.draw.drawDetections(canvasRef.current, resizedDetections);
                }

                // Get emotion
                const expressions = detection.expressions;
                const sorted = Object.entries(expressions).sort((a, b) => b[1] - a[1]);
                const topEmotion = sorted[0];

                const mapping: Record<string, string> = {
                    'happy': 'Happiness',
                    'sad': 'Sadness',
                    'angry': 'Anger',
                    'fearful': 'Anxiety',
                    'disgusted': 'Anger',
                    'surprised': 'Neutral',
                    'neutral': 'Neutral'
                };

                setDetectedEmotion(mapping[topEmotion[0]] || 'Neutral');
                setConfidence(topEmotion[1]);
            } else {
                setError('No face detected in the image. Please try another one.');
            }
        } catch (err) {
            console.error(err);
            setError('Error analyzing image.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const saveEntry = () => {
        if (!detectedEmotion) return;

        const entry: EmotionEntry = {
            id: `entry_${Date.now()}`,
            text: 'Analyzed from uploaded image',
            emotion: detectedEmotion as any,
            confidence: confidence,
            timestamp: Date.now(),
            keywords: ['image-analysis', 'upload']
        };

        saveEmotionEntry(entry);
        onSuccess();
    };

    const getEmotionColor = (emotion: string) => {
        switch (emotion) {
            case 'Happiness': return 'bg-green-100 text-green-700';
            case 'Sadness': return 'bg-blue-100 text-blue-700';
            case 'Anger': return 'bg-red-100 text-red-700';
            case 'Anxiety': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6 text-indigo-600" />
                        Image Emotion Detection
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {!modelsLoaded && (
                        <div className="flex items-center justify-center gap-2 text-indigo-600 bg-indigo-50 p-4 rounded-xl">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="font-medium">Loading AI Models...</span>
                        </div>
                    )}

                    {/* Upload Area */}
                    {!image && modelsLoaded && (
                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center hover:border-indigo-500 hover:bg-indigo-50 transition-all group cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10 text-indigo-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload an Image</h3>
                            <p className="text-gray-500">Drag & drop or click to select</p>
                        </div>
                    )}

                    {/* Preview Area */}
                    {image && (
                        <div className="space-y-6">
                            <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-black/5 min-h-[300px] flex items-center justify-center">
                                <img
                                    ref={imgRef}
                                    src={image}
                                    alt="Preview"
                                    className="max-w-full max-h-[500px] object-contain"
                                    onLoad={() => {
                                        // Reset canvas size on load
                                        if (canvasRef.current && imgRef.current) {
                                            canvasRef.current.width = imgRef.current.width;
                                            canvasRef.current.height = imgRef.current.height;
                                        }
                                    }}
                                />
                                <canvas
                                    ref={canvasRef}
                                    className="absolute top-0 left-0 pointer-events-none"
                                    style={{
                                        left: '50%',
                                        top: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        // Note: Precise overlay alignment requires careful implementation
                                        // Here we rely on the component structure and max-width/height constraints
                                    }}
                                />

                                {/* Remove Button */}
                                {!isAnalyzing && !detectedEmotion && (
                                    <button
                                        onClick={() => { setImage(null); setDetectedEmotion(null); setError(null); }}
                                        className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md hover:bg-red-50 hover:text-red-500 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>

                            {/* Actions & Results */}
                            <div className="flex flex-col items-center gap-4">
                                {error && (
                                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 w-full justify-center">
                                        <AlertCircle className="w-5 h-5" />
                                        {error}
                                    </div>
                                )}

                                {detectedEmotion ? (
                                    <div className="w-full bg-white rounded-2xl p-6 border border-gray-100 shadow-lg text-center">
                                        <h3 className="text-gray-500 font-medium mb-1">Detected Emotion</h3>
                                        <div className={`text-4xl font-black mb-2 ${detectedEmotion === 'Happiness' ? 'text-green-600' :
                                            detectedEmotion === 'Sadness' ? 'text-blue-600' :
                                                detectedEmotion === 'Anger' ? 'text-red-600' :
                                                    'text-yellow-600'
                                            }`}>
                                            {detectedEmotion}
                                        </div>
                                        <div className="inline-block px-4 py-1 rounded-full bg-gray-100 text-gray-600 text-sm font-medium mb-6">
                                            Confidence: {Math.round(confidence * 100)}%
                                        </div>

                                        <button
                                            onClick={saveEntry}
                                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Save Entry
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={analyzeImage}
                                        disabled={isAnalyzing}
                                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
                                    >
                                        {isAnalyzing ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Analyzing Face...
                                            </>
                                        ) : (
                                            <>
                                                <ScanFace className="w-5 h-5" />
                                                Analyze Emotion
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

// Helper icon
function ScanFace({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3 7V5a2 2 0 0 1 2-2h2" /><path d="M17 3h2a2 2 0 0 1 2 2v2" /><path d="M21 17v2a2 2 0 0 1-2 2h-2" /><path d="M7 21H5a2 2 0 0 1-2-2v-2" /><path d="M8 14s1.5 2 4 2 4-2 4-2" /><path d="M9 9h.01" /><path d="M15 9h.01" />
        </svg>
    )
}
