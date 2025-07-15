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
      <h3 className="font-bold text-base sm:text-lg mb-2">How to get the best results:</h3>
      <ul className="list-disc pl-6 text-sm sm:text-base space-y-1">
        <li>Ensure good lighting in the room</li>
        <li>Stand 6-8 feet away from the camera</li>
        <li>Wear contrasting clothing for better pose detection</li>
        <li>Make sure your whole body is visible in the frame</li>
        <li>Perform movements slowly and deliberately</li>
      </ul>
    </div>
  );

  const ErrorMessage = () => (
    <div className="absolute bottom-0 inset-x-0 bg-red-500 text-white p-3 sm:p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm sm:text-base">{error}</p>
        <button 
          onClick={() => setError(null)}
          className="ml-2 text-white hover:text-gray-200 text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );

  const LoadingIndicator = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-blue-500"></div>
    </div>
  );

  return (
    <div className="w-full relative">
      {/* Responsive Camera Container - Fully responsive height */}
      <div className="relative bg-gray-900 rounded-lg overflow-hidden w-full h-48 sm:h-64 md:h-80 lg:h-96">
        {/* Single Video Element for both camera and uploaded video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain"
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
          <div className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-green-600 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium flex items-center">
            <div className="w-2 h-2 bg-white rounded-full mr-1 sm:mr-2 animate-pulse"></div>
            <span className="hidden sm:inline">MediaPipe Active</span>
            <span className="sm:hidden">Active</span>
          </div>
        )}
      </div>
      
      {/* Instructions - Only show when not analyzing */}
      {!isAnalyzing && showPositioningGuide && <Instructions />}
    </div>
  );
};

export default VideoCanvas;
