import React from 'react';

const CameraControls = ({ 
  mode, 
  setMode, 
  isAnalyzing, 
  isLoading, 
  startCamera, 
  handleVideoUpload, 
  stopCamera, 
  cleanup,
  error
}) => {
  return (
    <div className="mb-6">
      {/* Mode Selection - Simplified */}
      <div className="flex space-x-2 mb-4">
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'camera' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('camera')}
        >
          📹 Live Camera
        </button>
        <button 
          className={`px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'video' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          onClick={() => setMode('video')}
        >
          📁 Upload Video
        </button>
      </div>
      
      {/* Status Display */}
      <div className={`p-4 rounded-lg mb-4 ${
        isAnalyzing ? 'bg-green-50 border border-green-200' : 
        isLoading ? 'bg-yellow-50 border border-yellow-200' : 
        'bg-gray-50 border border-gray-200'
      }`}>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-3 ${
            isAnalyzing ? 'bg-green-500 animate-pulse' : 
            isLoading ? 'bg-yellow-500 animate-pulse' : 
            'bg-gray-400'
          }`}></div>
          <span className={`font-medium ${
            isAnalyzing ? 'text-green-800' : 
            isLoading ? 'text-yellow-800' : 
            'text-gray-600'
          }`}>
            {isAnalyzing ? `${mode === 'camera' ? 'Live Camera Active' : 'Video Analysis Active'} - MediaPipe Running` :
             isLoading ? 'Initializing MediaPipe Analysis...' :
             `Ready for ${mode === 'camera' ? 'camera' : 'video'} analysis`}
          </span>
        </div>
        {error && (
          <div className="mt-3 p-3 text-red-700 bg-red-50 rounded border border-red-200">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <strong>Analysis Error:</strong> {error}
                <div className="text-sm text-red-600 mt-1">
                  Please try again or check your camera/video file permissions.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        {!isAnalyzing ? (
          <>
            {mode === 'camera' ? (
              <button 
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
                onClick={startCamera}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Initializing...
                  </div>
                ) : (
                  'Start Camera Analysis'
                )}
              </button>
            ) : (
              <label className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium cursor-pointer hover:bg-green-700 disabled:opacity-50 transition-all shadow-md inline-block">
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Initializing...
                  </div>
                ) : (
                  'Select Video File'
                )}
                <input 
                  type="file" 
                  accept="video/*"
                  className="hidden"
                  onChange={handleVideoUpload}
                  disabled={isLoading}
                />
              </label>
            )}
          </>
        ) : (
          <button 
            className="px-8 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all shadow-md"
            onClick={() => {
              stopCamera();
              cleanup();
            }}
          >
            Stop Analysis
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraControls;
