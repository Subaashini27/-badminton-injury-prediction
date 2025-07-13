import React, { useRef, useState, useCallback, useEffect } from 'react';

const MediaPipeLiveAnalysis = ({ 
  mode, 
  onModeChange, 
  onPoseData, 
  onJointAngles, 
  onRiskAnalysis,
  className = "" 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraRef = useRef(null);
  const poseRef = useRef(null);
  const fileInputRef = useRef(null);
  const isAnalyzingRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentMode, setCurrentMode] = useState('stopped');
  const [isStopping, setIsStopping] = useState(false);

  // Update ref when analyzing state changes
  useEffect(() => {
    isAnalyzingRef.current = isAnalyzing;
  }, [isAnalyzing]);

  // Initialize MediaPipe Pose
  useEffect(() => {
    const initializePose = async () => {
      try {
        setIsLoading(true);
        
        // Load MediaPipe scripts
        const loadScript = (src) => {
          return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        };

        // Load MediaPipe dependencies if not already loaded
        if (!window.Pose) {
          try {
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/control_utils/control_utils.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js');
            await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js');
          } catch (scriptError) {
            throw new Error('Failed to load MediaPipe libraries. Check your internet connection.');
          }
        }
        
        // Create pose instance
        const pose = new window.Pose({
          locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
          }
        });

        pose.setOptions({
          modelComplexity: 1, // Use the full model for better accuracy
          smoothLandmarks: true, 
          enableSegmentation: false,
          smoothSegmentation: false,
          minDetectionConfidence: 0.5, // Reset to default for the more powerful model
          minTrackingConfidence: 0.5
        });

        pose.onResults((results) => {
          if (!canvasRef.current) return;
          
          const canvasElement = canvasRef.current;
          const canvasCtx = canvasElement.getContext('2d');
          
          // Set canvas size to match video
          canvasElement.width = results.image.width;
          canvasElement.height = results.image.height;
          
          // Clear canvas
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          // Draw the image
          canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
          
          if (results.poseLandmarks && results.poseLandmarks.length > 0) {
            // Draw pose landmarks with more visible styling
            window.drawConnectors(canvasCtx, results.poseLandmarks, window.POSE_CONNECTIONS, 
              { color: '#00FF00', lineWidth: 3 });
            window.drawLandmarks(canvasCtx, results.poseLandmarks,
              { color: '#FF0000', lineWidth: 1, radius: 4 });
            
            // Calculate joint angles
            const landmarks = results.poseLandmarks;
            
            // Shoulder angle (11: left shoulder, 13: left elbow, 15: left wrist)
            const leftShoulderAngle = calculateAngle(
              landmarks[13], landmarks[11], landmarks[23]
            );
            const rightShoulderAngle = calculateAngle(
              landmarks[14], landmarks[12], landmarks[24]
            );
            const shoulderAngle = (leftShoulderAngle + rightShoulderAngle) / 2;
            
            // Elbow angle
            const leftElbowAngle = calculateAngle(
              landmarks[11], landmarks[13], landmarks[15]
            );
            const rightElbowAngle = calculateAngle(
              landmarks[12], landmarks[14], landmarks[16]
            );
            const elbowAngle = (leftElbowAngle + rightElbowAngle) / 2;
            
            // Hip angle
            const leftHipAngle = calculateAngle(
              landmarks[11], landmarks[23], landmarks[25]
            );
            const rightHipAngle = calculateAngle(
              landmarks[12], landmarks[24], landmarks[26]
            );
            const hipAngle = (leftHipAngle + rightHipAngle) / 2;
            
            // Knee angle
            const leftKneeAngle = calculateAngle(
              landmarks[23], landmarks[25], landmarks[27]
            );
            const rightKneeAngle = calculateAngle(
              landmarks[24], landmarks[26], landmarks[28]
            );
            const kneeAngle = (leftKneeAngle + rightKneeAngle) / 2;
            
            // Calculate risks
            const shoulderRisk = calculateRisk(shoulderAngle, 90, 140);
            const elbowRisk = calculateRisk(elbowAngle, 140, 170);
            const hipRisk = calculateRisk(hipAngle, 80, 120);
            const kneeRisk = calculateRisk(kneeAngle, 140, 165);
            
            // Prepare metrics object
            const metrics = {
              shoulderRotation: shoulderAngle,
              shoulderRisk: shoulderRisk,
              elbowBend: elbowAngle,
              elbowRisk: elbowRisk,
              hipRotation: hipAngle,
              hipRisk: hipRisk,
              kneeAngle: kneeAngle,
              kneeRisk: kneeRisk
            };
            
            // Call parent callbacks
            if (onJointAngles) {
              onJointAngles(metrics);
            }
            
            if (onRiskAnalysis) {
              onRiskAnalysis({
                overall: [shoulderRisk, elbowRisk, hipRisk, kneeRisk].includes('High Risk') ? 'high' : 
                         [shoulderRisk, elbowRisk, hipRisk, kneeRisk].includes('Medium Risk') ? 'medium' : 'low',
                areas: []
              });
            }
            
            if (onPoseData) {
              onPoseData(results.poseLandmarks);
            }
            
            // Draw angle values on canvas
            canvasCtx.font = '16px Arial';
            canvasCtx.fillStyle = '#00FF00';
            
            // Draw shoulder angle
            if (landmarks[11] && landmarks[12]) {
              const shoulderMidX = (landmarks[11].x + landmarks[12].x) / 2 * canvasElement.width;
              const shoulderMidY = (landmarks[11].y + landmarks[12].y) / 2 * canvasElement.height;
              canvasCtx.fillText(`Shoulder: ${Math.round(shoulderAngle)}°`, shoulderMidX, shoulderMidY - 10);
            }
            
            // Draw elbow angles
            if (landmarks[13]) {
              canvasCtx.fillText(`L Elbow: ${Math.round(leftElbowAngle)}°`, 
                landmarks[13].x * canvasElement.width + 10, 
                landmarks[13].y * canvasElement.height);
            }
            if (landmarks[14]) {
              canvasCtx.fillText(`R Elbow: ${Math.round(rightElbowAngle)}°`, 
                landmarks[14].x * canvasElement.width + 10, 
                landmarks[14].y * canvasElement.height);
            }
            
            // Draw knee angles
            if (landmarks[25]) {
              canvasCtx.fillText(`L Knee: ${Math.round(leftKneeAngle)}°`, 
                landmarks[25].x * canvasElement.width + 10, 
                landmarks[25].y * canvasElement.height);
            }
            if (landmarks[26]) {
              canvasCtx.fillText(`R Knee: ${Math.round(rightKneeAngle)}°`, 
                landmarks[26].x * canvasElement.width + 10, 
                landmarks[26].y * canvasElement.height);
            }
          }
          
          canvasCtx.restore();
        });
        
        poseRef.current = pose;
        
        setIsLoading(false);
      } catch (err) {
        setError('Failed to initialize pose detection. Please refresh the page.');
        setIsLoading(false);
      }
    };

    initializePose();

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
    };
  }, [onJointAngles, onPoseData, onRiskAnalysis]);

  // Calculate angle between three points
  const calculateAngle = (a, b, c) => {
    const radians = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs(radians * 180.0 / Math.PI);
    if (angle > 180.0) {
      angle = 360 - angle;
    }
    return angle;
  };

  // Calculate risk based on angle
  const calculateRisk = (angle, optimalMin, optimalMax) => {
    if (angle >= optimalMin && angle <= optimalMax) {
      return 'Safe';
    } else if (angle >= optimalMin - 10 && angle <= optimalMax + 10) {
      return 'Medium Risk';
    } else {
      return 'High Risk';
    }
  };

  // Stop analysis - MUST be defined before functions that use it (startCamera, handleVideoUpload)
  const stopAnalysis = useCallback(() => {
    setIsStopping(true); // Set flag to prevent error messages
    setIsAnalyzing(false);
    setError(null); // Clear any existing errors
    if (onModeChange) onModeChange('stopped');
    setCurrentMode('stopped');
    
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }
    
    if (videoRef.current) {
      // Store current src before clearing to revoke URL properly
      const currentSrc = videoRef.current.src;
      videoRef.current.pause();
      
      // Remove event listeners to prevent errors
      videoRef.current.onloadeddata = null;
      videoRef.current.onerror = null;
      videoRef.current.onabort = null;
      
      videoRef.current.src = '';
      videoRef.current.load();
      
      // Revoke object URL if it's a blob URL
      if (currentSrc && currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc);
      }
    }
    
    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    // Reset stopping flag after a short delay
    setTimeout(() => {
      setIsStopping(false);
    }, 100);
  }, [onModeChange]);

  // Start camera
  const startCamera = useCallback(async () => {
    if (!poseRef.current || !videoRef.current) return;
    
    try {
      setError(null);
      
      // Use the centralized stop function for robust cleanup
      stopAnalysis();
      await new Promise(resolve => setTimeout(resolve, 150)); // Allow state to settle

      setIsAnalyzing(true);
      if (onModeChange) onModeChange('camera');
      setCurrentMode('camera');
      
      const camera = new window.Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480
      });
      
      cameraRef.current = camera;
      await camera.start();
    } catch (err) {
      setError('Failed to access camera. Please check permissions.');
      setIsAnalyzing(false);
    }
  }, [onModeChange, stopAnalysis]);

      // Process uploaded video
  const processVideo = useCallback(async () => {
    if (!poseRef.current || !videoRef.current) {
      return;
    }
    
    const processFrame = async () => {
      try {
        if (videoRef.current && !videoRef.current.ended && isAnalyzingRef.current) {
          // Check if video has valid dimensions
          if (videoRef.current.videoWidth > 0 && videoRef.current.videoHeight > 0) {
            
            try {
              if (poseRef.current && videoRef.current) {
                await poseRef.current.send({ image: videoRef.current });
              }
            } catch (poseError) {
              // Continue processing even if one frame fails
            }
          }
          
          // Continue processing if still analyzing
          if (isAnalyzingRef.current) {
            // Use requestAnimationFrame for smooth processing
            requestAnimationFrame(processFrame);
          }
        } else if (videoRef.current && videoRef.current.ended && isAnalyzingRef.current) {
          setIsAnalyzing(false);
          setCurrentMode('stopped');
          if (onModeChange) onModeChange('stopped');
        }
      } catch (err) {
        if (isAnalyzingRef.current) { // Only show error if we're still analyzing
          setError('Error processing video frame. Please try a different video.');
          setIsAnalyzing(false);
        }
      }
    };
    
    try {
      // Wait for video to be ready
      const waitForVideo = () => {
        if (videoRef.current && videoRef.current.readyState >= 2) { // HAVE_CURRENT_DATA or higher
          // Start processing loop immediately
          processFrame();
        } else if (videoRef.current) {
          setTimeout(waitForVideo, 100);
        }
      };
      
      waitForVideo();
    } catch (err) {
      setError('Could not start video processing. Please check the video format.');
      setIsAnalyzing(false);
    }
  }, [onModeChange]);

  // Handle video upload
  const handleVideoUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!poseRef.current || !videoRef.current) {
      setError('MediaPipe is not ready yet. Please wait a moment and try again.');
      return;
    }
    
    if (!file.type.startsWith('video/')) {
      setError('Please upload a valid video file.');
      return;
    }
    
    if (file.size > 100 * 1024 * 1024) {
      setError('Video file is too large. Please upload a file smaller than 100MB.');
      return;
    }
    
    try {
      setError(null);
      setIsLoading(true);
      
      // Stop any current analysis using the dedicated function for robust cleanup
      stopAnalysis();
      
      // Wait for the DOM and state to settle after stopping
      await new Promise(resolve => setTimeout(resolve, 150));

      const url = URL.createObjectURL(file);

      // CRITICAL: Set up event listeners *before* setting the src attribute
      videoRef.current.onloadeddata = () => {
        setIsLoading(false);
        setIsAnalyzing(true);
        if (onModeChange) onModeChange('video');
        setCurrentMode('video');

        // Auto-play the video for analysis
        videoRef.current.play().then(() => {
          processVideo();
        }).catch(() => {
          // Play can be interrupted, but we can still try to process
          processVideo();
        });
      };

      videoRef.current.onerror = () => {
        // isStopping flag prevents this from firing during normal cleanup
        if (!isStopping) {
          setIsLoading(false);
          setError('Failed to load video. Please try a different video file or format.');
          if (url) URL.revokeObjectURL(url);
        }
      };
      
      videoRef.current.src = url;
      videoRef.current.load(); // Request the browser to load the new video
      
    } catch (err) {
      setIsLoading(false);
      setError('Failed to process video file. Please try again.');
    }
    
    // Reset file input so the same file can be selected again
    if(event.target) {
      event.target.value = '';
    }
  }, [onModeChange, processVideo, stopAnalysis, isStopping]);

  return (
    <div className={`w-full ${className}`}>
      {/* Status indicator */}
      <div className="mb-4 p-3 rounded-lg bg-gray-50 border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isAnalyzing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className="text-sm font-medium">
            {isLoading ? 'Loading...' : isAnalyzing ? 'Analysis Active - MediaPipe Running' : 'Ready'}
          </span>
        </div>
        {isAnalyzing && (
          <span className="text-xs text-gray-500">
            {currentMode === 'camera' ? 'Live Camera' : 'Video Analysis'}
          </span>
        )}
      </div>

      {/* Control buttons */}
      <div className="flex space-x-3 mb-4">
        <button
          onClick={startCamera}
          disabled={isLoading}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <span>📹</span>
          <span>Live Camera</span>
        </button>
        
        <label className={`flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <span>📁</span>
          <span>Upload Video</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            disabled={isLoading}
            className="hidden"
          />
        </label>
        
                <button
          onClick={stopAnalysis}
          disabled={!isAnalyzing}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            isAnalyzing 
              ? 'bg-red-500 text-white hover:bg-red-600' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <span>⏹️</span>
          <span>Stop Analysis</span>
        </button>
      </div>

      {/* Guidance Note */}
      {isAnalyzing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">💡 Pro Tip:</span> For best results, ensure your full body is visible to the camera in a well-lit area.
          </p>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <span className="text-red-500 mr-2">⚠️</span>
          <div className="flex-1">
            <p className="text-sm text-red-700 font-medium">Error</p>
            <p className="text-sm text-red-600">{error}</p>
            {/* Debug info */}
            <details className="mt-2">
              <summary className="text-xs text-gray-500 cursor-pointer">Debug Info</summary>
              <div className="text-xs text-gray-600 mt-1 font-mono">
                <p>MediaPipe Ready: {poseRef.current ? 'Yes' : 'No'}</p>
                <p>Video Element: {videoRef.current ? 'Yes' : 'No'}</p>
                <p>Canvas Element: {canvasRef.current ? 'Yes' : 'No'}</p>
                <p>Is Loading: {isLoading ? 'Yes' : 'No'}</p>
                <p>Is Analyzing: {isAnalyzing ? 'Yes' : 'No'}</p>
                <p>Current Mode: {currentMode || 'None'}</p>
                {videoRef.current && (
                  <>
                    <p>Video Ready State: {videoRef.current.readyState}</p>
                    <p>Video Dimensions: {videoRef.current.videoWidth}x{videoRef.current.videoHeight}</p>
                    <p>Video Duration: {videoRef.current.duration}s</p>
                  </>
                )}
              </div>
            </details>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Video/Canvas container - 16:9 aspect ratio with full coverage */}
      <div className="relative bg-black rounded-lg overflow-hidden w-full max-w-4xl mx-auto" style={{ paddingBottom: '75%' }}>
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover" // Use object-cover to fill container without black bars
          playsInline
          muted={currentMode === 'camera'}
          controls={currentMode === 'video'}
          preload="metadata"
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" // Use object-cover to match video
          style={{ maxWidth: '100%', maxHeight: '100%', zIndex: 10 }}
        />
        
        {/* Video analysis instructions */}
        {currentMode === 'video' && isAnalyzing && (
          <div className="absolute top-4 left-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
              Analyzing video... Use controls to play/pause
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg font-medium">
                {currentMode === 'video' ? 'Loading Video...' : 'Initializing Pose Detection...'}
              </p>
              <p className="text-sm text-gray-300 mt-2">
                {currentMode === 'video' ? 'Processing video file for analysis...' : 'Loading MediaPipe models...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Analysis accuracy note */}
      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <span className="font-medium">⚠️ Analysis Accuracy Note:</span> Angle calculations are based on pose estimation and may vary based on lighting and camera angle. Use as supportive feedback for technique improvement.
        </p>
      </div>
    </div>
  );
};

export default MediaPipeLiveAnalysis;
