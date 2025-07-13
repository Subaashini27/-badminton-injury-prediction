import React from 'react';

const VideoCanvas = ({ 
  videoRef, 
  canvasRef, 
  mode, 
  isLoading, 
  error, 
  setError,
  showPositioningGuide,
  isAnalyzing 
}) => {
  const Instructions = () => (
    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
      <h3 className="font-bold text-lg mb-2">How to get the best results:</h3>
      <ul className="list-disc pl-6">
        <li>Ensure good lighting in the room</li>
        <li>Stand 6-8 feet away from the camera</li>
        <li>Wear contrasting clothing for better pose detection</li>
        <li>Make sure your whole body is visible in the frame</li>
        <li>Perform movements slowly and deliberately</li>
      </ul>
    </div>
  );

  const ErrorMessage = () => (
    <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white p-4">
      <div className="flex items-center justify-between">
        <p>{error}</p>
        <button 
          onClick={() => setError(null)}
          className="ml-2 text-white hover:text-gray-200"
        >
          ✕
        </button>
      </div>
    </div>
  );

  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="w-full relative">
      {/* Responsive Camera Container - Constrained to container width */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full" style={{ 
        height: "400px", // Reduced height to fit better
        maxWidth: "100%" // Ensure it doesn't exceed container
      }}>
        {/* Single Video Element for both camera and uploaded video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain" // Changed to object-contain to fit within bounds
          playsInline
          muted
          controls={mode === 'video'}
          style={{
            objectPosition: 'center center'
          }}
        />
        
        {/* Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
          style={{
            zIndex: 10
          }}
        />

        {/* Loading Indicator */}
        {isLoading && <LoadingIndicator />}

        {/* Error Message */}
        {error && <ErrorMessage />}

        {/* Analysis Status Overlay */}
        {isAnalyzing && (
          <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            MediaPipe Active
          </div>
        )}
      </div>
      
      {/* Instructions - Only show when not analyzing */}
      {!isAnalyzing && mode === 'camera' && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-blue-800 mb-2">📋 Analysis Tips:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center">
              <span className="mr-2">💡</span>
              Ensure good lighting
            </div>
            <div className="flex items-center">
              <span className="mr-2">📏</span>
              Stand 6-8 feet from camera
            </div>
            <div className="flex items-center">
              <span className="mr-2">👕</span>
              Wear contrasting colors
            </div>
            <div className="flex items-center">
              <span className="mr-2">🎯</span>
              Keep full body in frame
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCanvas;
