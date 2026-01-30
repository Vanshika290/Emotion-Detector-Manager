import { Settings, Camera, Shield, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react';

interface CameraPermissionsGuideProps {
  onClose: () => void;
}

export default function CameraPermissionsGuide({ onClose }: CameraPermissionsGuideProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-xl">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Camera Permissions Guide</h2>
                <p className="text-sm text-gray-600 mt-1">Enable camera access for emotion detection</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <span className="text-2xl text-gray-600">×</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Privacy First */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-6 h-6 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 mb-2">Your Privacy is Our Priority</h3>
                <p className="text-sm text-green-700">
                  All facial emotion detection happens <strong>locally on your device</strong>. 
                  Your camera feed is never uploaded, stored, or transmitted anywhere. 
                  The AI models run entirely in your browser.
                </p>
              </div>
            </div>
          </div>

          {/* Windows 11 Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Windows 11 Camera Settings
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium text-gray-900">Open Windows Settings</p>
                  <p className="text-sm text-gray-600 mt-1">Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Win</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">I</kbd> on your keyboard</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-medium text-gray-900">Navigate to Privacy & Security</p>
                  <p className="text-sm text-gray-600 mt-1">Click on "Privacy & security" in the left sidebar</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium text-gray-900">Access Camera Settings</p>
                  <p className="text-sm text-gray-600 mt-1">Under "App permissions", click on "Camera"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <p className="font-medium text-gray-900">Enable Camera Access</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Make sure "Camera access" is turned <strong>ON</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Also ensure "Let apps access your camera" is turned <strong>ON</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
                <div>
                  <p className="font-medium text-gray-900">Enable Browser Access</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Scroll down to "Let desktop apps access your camera" and turn it <strong>ON</strong>
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Make sure your browser (Chrome, Edge, Firefox, etc.) is allowed
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Windows 10 Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Settings className="w-5 h-5 text-indigo-600" />
              Windows 10 Camera Settings
            </h3>
            
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                <div>
                  <p className="font-medium text-gray-900">Open Windows Settings</p>
                  <p className="text-sm text-gray-600 mt-1">Press <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">Win</kbd> + <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">I</kbd> or search for "Settings"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                <div>
                  <p className="font-medium text-gray-900">Go to Privacy</p>
                  <p className="text-sm text-gray-600 mt-1">Click on "Privacy" settings</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                <div>
                  <p className="font-medium text-gray-900">Select Camera</p>
                  <p className="text-sm text-gray-600 mt-1">In the left sidebar, click on "Camera"</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                <div>
                  <p className="font-medium text-gray-900">Allow Camera Access</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Turn on "Allow apps to access your camera"
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Turn on "Allow desktop apps to access your camera"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Browser Permissions */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Camera className="w-5 h-5 text-indigo-600" />
              Browser Camera Permissions
            </h3>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm text-blue-900 mb-3">
                After enabling Windows camera access, you'll need to allow this website to use your camera:
              </p>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>When you click "Start Camera", your browser will show a permission popup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Click <strong>"Allow"</strong> or <strong>"Yes"</strong> to grant camera access</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>You can always revoke this permission later from your browser settings</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Troubleshooting */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Troubleshooting
            </h3>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-3">
              <div>
                <p className="font-medium text-yellow-900 mb-1">Camera not working?</p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Make sure no other application is using the camera</li>
                  <li>• Try closing and reopening your browser</li>
                  <li>• Check if your camera is properly connected (for external cameras)</li>
                  <li>• Restart your computer if the issue persists</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-yellow-900 mb-1">Permission denied?</p>
                <ul className="text-sm text-yellow-800 space-y-1 ml-4">
                  <li>• Check Windows camera settings (follow steps above)</li>
                  <li>• Clear your browser's site permissions and try again</li>
                  <li>• Make sure you're using HTTPS (secure connection)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Quick Access Button */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <p className="text-sm text-indigo-900 mb-3 font-medium">
              Quick Access to Windows Camera Settings:
            </p>
            <button
              onClick={() => {
                // This will open Windows Settings to the camera page
                window.open('ms-settings:privacy-webcam', '_blank');
              }}
              className="w-full bg-white hover:bg-gray-50 text-indigo-700 border border-indigo-300 px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-5 h-5" />
              Open Windows Camera Settings
            </button>
            <p className="text-xs text-indigo-600 mt-2 text-center">
              This will open Windows Settings directly to the camera permissions page
            </p>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-6 rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
