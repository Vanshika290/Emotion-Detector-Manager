import { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { ThreeDCard } from './ui/ThreeDCard';

export default function Login() {
    const { signInWithGoogle } = useAuth();
    const [error, setError] = useState<string | null>(null);
    const [detailedError, setDetailedError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Temporary "Guest" login for demo purposes if Firebse isn't set up
    const handleGuestLogin = () => {
        // We can simulate a login by manually setting the user in the context 
        // BUT since the context is tied to Firebase, we might need to bypass it slightly.
        // For now, let's just use a window reload trick or similar, OR 
        // better, we can modify the AuthContext, but let's try to just warn the user first.
        alert("To use Guest Mode, please ask the developer to enable 'Demo Auth' or configure the Firebase keys correctly in src/lib/firebase.ts");
    };

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError(null);
            setDetailedError(null);
            await signInWithGoogle();
        } catch (err: any) {
            console.error("Login Error:", err);
            if (err.code === 'auth/configuration-not-found' || err.code === 'auth/invalid-api-key' || err.message.includes("api-key")) {
                setError("Missing Firebase Config");
                setDetailedError("You need to paste your 'Web App' config keys in src/lib/firebase.ts.");
            } else if (err.code === 'auth/popup-closed-by-user') {
                setError("Sign-in cancelled");
            } else if (err.code === 'auth/operation-not-allowed') {
                setError("Google Sign-In not enabled");
                setDetailedError("Enable 'Google' provider in Firebase Console -> Authentication -> Sign-in method.");
            } else {
                setError("Failed to sign in");
                setDetailedError(err.message || "Unknown error occurred");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative z-50">
            <ThreeDCard className="w-full max-w-md">
                <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                    <div className="text-center mb-8">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg transform rotate-3">
                            <LogIn className="w-10 h-10 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to track your emotional journey</p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-sm font-bold text-red-900">{error}</h4>
                                    {detailedError && <p className="text-xs text-red-700 mt-1">{detailedError}</p>}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    <div className="space-y-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogin}
                            disabled={isLoading}
                            className="w-full bg-white border border-gray-300 text-gray-700 font-semibold py-4 px-6 rounded-xl hover:bg-gray-50 transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-3 group"
                        >
                            {isLoading ? (
                                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <img
                                        src="https://www.google.com/favicon.ico"
                                        alt="Google"
                                        className="w-6 h-6 group-hover:scale-110 transition-transform"
                                    />
                                    <span>Sign in with Google</span>
                                </>
                            )}
                        </motion.button>

                        {/* Fallback for setup help */}
                        <div className="text-center">
                            <p className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium mt-2" onClick={() => alert("Please open src/lib/firebase.ts and replace the placeholder config with your actual Firebase Web App config from the Firebase Console.")}>
                                Need help setting up?
                            </p>
                        </div>
                    </div>

                    <p className="text-center text-xs text-gray-400 mt-6">
                        By continuing, you agree to our Terms of Service.
                    </p>
                </div>
            </ThreeDCard>
        </div>
    );
}
