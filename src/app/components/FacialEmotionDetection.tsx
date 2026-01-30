import { useRef, useState, useEffect } from 'react';
import { Camera, CameraOff, Loader2, CheckCircle, X, AlertCircle, Shield, HelpCircle, ScanFace } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as faceapi from '@vladmandic/face-api';
import { saveEmotionEntry, type EmotionEntry } from '@/app/utils/emotionStorage';
import CameraPermissionsGuide from '@/app/components/CameraPermissionsGuide';

interface FacialEmotionDetectionProps {
  onSuccess: () => void;
  onClose: () => void;
}

export default function FacialEmotionDetection({ onSuccess, onClose }: FacialEmotionDetectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [detectedEmotion, setDetectedEmotion] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'checking'>('prompt');
  const [showPermissionsGuide, setShowPermissionsGuide] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    loadModels();
    checkCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      // Check if the Permissions API is supported
      if (navigator.permissions && navigator.permissions.query) {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');

        // Listen for permission changes
        permission.onchange = () => {
          setPermissionState(permission.state as 'prompt' | 'granted' | 'denied');
        };
      }
    } catch (err) {
      // Permissions API not supported or error occurred
      console.log('Permissions API not available:', err);
      setPermissionState('prompt');
    }
  };

  const loadModels = async () => {
    try {
      setIsLoading(true);
      // Use the specific CDN path with a trailing slash. 
      // Using 'latest' version to ensure we get the correct model format.
      const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

      console.log('Loading models from:', MODEL_URL);

      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);

      console.log('Models loaded successfully');
      setIsModelLoaded(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading models:', err);
      // Fallback error message with more detail
      setError(`Failed to load AI models: ${err.message || err}. check console for details.`);
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setError(null); // Clear any previous errors

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
        setError(null);
        setPermissionState('granted');

        // Start detection after video is playing
        videoRef.current.onloadeddata = () => {
          startDetection();
        };
      }
    } catch (err: any) {
      console.error('Error accessing camera:', err);

      // Provide specific error messages based on the error type
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera access denied. Please allow camera permissions in your browser settings and try again.');
        setPermissionState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Please connect a camera and try again.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setError('Camera is already in use by another application. Please close other applications using the camera and try again.');
      } else if (err.name === 'OverconstrainedError') {
        setError('Camera does not support the requested settings. Please try with a different camera.');
      } else if (err.name === 'SecurityError') {
        setError('Camera access is not allowed on this page due to security restrictions. Please ensure you are using HTTPS.');
      } else {
        setError('Unable to access camera. Please check your camera permissions and try again.');
      }
    }
  };

  const stopCamera = () => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCameraActive(false);
    setDetectedEmotion(null);
    setConfidence(0);
  };

  const startDetection = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    const detectEmotions = async () => {
      if (!video || video.paused || video.ended) return;

      try {
        const detections = await faceapi
          .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 }))
          .withFaceExpressions();

        // Clear previous drawings
        const context = canvas.getContext('2d');
        if (context) {
          context.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (detections) {
          // Resize canvas to match video
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          faceapi.matchDimensions(canvas, displaySize);

          // Draw face detection box
          const resizedDetections = faceapi.resizeResults(detections, displaySize);

          // Custom drawing for a cleaner look
          const { box } = resizedDetections.detection;
          if (context) {
            context.strokeStyle = '#6366f1';
            context.lineWidth = 2;
            context.strokeRect(box.x, box.y, box.width, box.height);
          }
          // faceapi.draw.drawDetections(canvas, resizedDetections);

          // Get the dominant emotion
          const expressions = detections.expressions;
          const sortedExpressions = Object.entries(expressions)
            .sort((a, b) => b[1] - a[1]);

          const [emotion, conf] = sortedExpressions[0];

          // Map face-api emotions to our emotion categories
          const mappedEmotion = mapEmotionToCategory(emotion);

          // Only update if confidence is reasonable
          if (conf > 0.4) {
            setDetectedEmotion(mappedEmotion);
            setConfidence(conf);
          }
        } else {
          // Don't clear immediately to prevent flickering, let it stale for a bit or just keep last valid
          // setDetectedEmotion(null);
          // setConfidence(0);
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    };

    // Run detection every 100ms
    detectionIntervalRef.current = window.setInterval(detectEmotions, 100);
  };

  const mapEmotionToCategory = (emotion: string): string => {
    const mapping: Record<string, string> = {
      'happy': 'Happiness',
      'sad': 'Sadness',
      'angry': 'Anger',
      'fearful': 'Anxiety',
      'disgusted': 'Anger',
      'surprised': 'Neutral', // Surprised is usually short-lived, mapping to Neutral or Anxiety depending on context, keeping simple
      'neutral': 'Neutral'
    };
    return mapping[emotion] || 'Neutral';
  };

  const handleCapture = async () => {
    if (!detectedEmotion || confidence < 0.3) {
      alert('Please position your face clearly in the frame for better detection.');
      return;
    }

    setIsSaving(true);

    // Create entry
    const entry: EmotionEntry = {
      id: `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: 'Captured from facial expression analysis',
      emotion: detectedEmotion as 'Happiness' | 'Sadness' | 'Anger' | 'Anxiety' | 'Neutral',
      confidence: confidence,
      timestamp: Date.now(),
      keywords: ['facial-recognition', 'camera-detected']
    };

    saveEmotionEntry(entry);

    setTimeout(() => {
      setIsSaving(false);
      stopCamera();
      onSuccess();
    }, 1000);
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ScanFace className="w-6 h-6 text-indigo-600" />
              Facial Emotion Detection
            </h2>
            <p className="text-sm text-gray-500 mt-1">Real-time AI emotion analysis</p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-900 font-medium">Loading AI models...</p>
              <p className="text-sm text-gray-500 mt-2">Preparing neural networks</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 p-2 rounded-full">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-900 font-semibold mb-1">Camera Error</h3>
                  <p className="text-red-700 mb-4">{error}</p>
                  {permissionState === 'denied' && (
                    <button
                      onClick={() => setShowPermissionsGuide(true)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <HelpCircle className="w-4 h-4" />
                      View Troubleshooting Guide
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Camera Controls */}
          {!isLoading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video Area */}
              <div className="space-y-4">
                <div className="relative bg-black rounded-2xl overflow-hidden shadow-inner aspect-[4/3] group">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ display: isCameraActive ? 'block' : 'none' }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full"
                    style={{ display: isCameraActive ? 'block' : 'none' }}
                  />

                  {/* Scanning Effect */}
                  {isCameraActive && (
                    <motion.div
                      initial={{ top: 0, opacity: 0.5 }}
                      animate={{ top: "100%", opacity: [0.5, 0.2, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)] z-10 pointer-events-none"
                    />
                  )}

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <div className="bg-gray-800 p-4 rounded-full inline-block mb-4">
                          <CameraOff className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-white mb-6 font-medium">Camera is offline</p>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={startCamera}
                          disabled={!isModelLoaded}
                          className="bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 mx-auto font-bold shadow-lg shadow-indigo-500/20"
                        >
                          <Camera className="w-5 h-5" />
                          Start Camera
                        </motion.button>
                      </div>
                    </div>
                  )}

                  {/* Status Badge */}
                  {isCameraActive && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      LIVE
                    </div>
                  )}
                </div>

                {/* Privacy Notice */}
                {!isCameraActive && (
                  <div className="flex items-center gap-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <p>Privacy: Analysis happens locally. No video is recorded.</p>
                  </div>
                )}
              </div>

              {/* Right Side: Results & Actions */}
              <div className="flex flex-col justify-center space-y-6">
                <AnimatePresence mode="wait">
                  {isCameraActive && detectedEmotion ? (
                    <motion.div
                      key="result"
                      initial={{ opacity: 0, scale: 0.8, rotateX: -15 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className={`bg-gradient-to-br ${getEmotionColor(detectedEmotion)} rounded-3xl p-8 text-white shadow-xl perspective-1000`}
                    >
                      <div className="text-center mb-6">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                          className="text-8xl mb-4"
                        >
                          {getEmotionIcon(detectedEmotion)}
                        </motion.div>
                        <h3 className="text-4xl font-black mb-2 tracking-tight">{detectedEmotion}</h3>
                        <p className="text-lg opacity-90 font-medium">Emotion Detected</p>
                      </div>
                      <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                        <div className="flex justify-between text-sm font-medium mb-2 opacity-90">
                          <span>Confidence</span>
                          <span>{Math.round(confidence * 100)}%</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${confidence * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-white h-full rounded-full"
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="waiting"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-gray-50 rounded-3xl p-8 text-center border-2 border-dashed border-gray-200 h-full flex flex-col items-center justify-center"
                    >
                      <ScanFace className="w-16 h-16 text-gray-300 mb-4 animate-pulse" />
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Face...</h3>
                      <p className="text-gray-500">
                        {isCameraActive
                          ? "Position your face in the frame"
                          : "Start camera to begin analysis"}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                {isCameraActive && (
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCapture}
                      disabled={!detectedEmotion || confidence < 0.3 || isSaving}
                      className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          Capture This Emotion
                        </>
                      )}
                    </motion.button>
                    <button
                      onClick={stopCamera}
                      className="px-6 py-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors font-bold text-gray-700 hover:border-gray-300"
                    >
                      Stop
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {showPermissionsGuide && (
        <CameraPermissionsGuide onClose={() => setShowPermissionsGuide(false)} />
      )}
    </div>
  );
}