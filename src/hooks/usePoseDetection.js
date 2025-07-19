import { useEffect } from 'react';
import poseAnalysisService from '../services/PoseAnalysisService';

export const usePoseDetection = ({
  setIsLoading,
  setError,
  videoRef,
  canvasRef,
  setMetrics,
  updateRiskLevel,
  updateRecommendations,
  setFullBodyDetected,
  addNotification,
  updateAnalysis,
  startAnalysisContext,
  stopAnalysisContext,
  setIsAnalyzing,
  streamRef,
  setIsVideoLoaded,
  setVideoFile,
  onVideoSelect,
  mode,
  useFallbackMode
}) => {
  
  // Initialize pose detection
  useEffect(() => {
    const initializePoseDetection = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check for availability of required APIs
        const hasGetUserMedia = !!(navigator.mediaDevices && 
                                  navigator.mediaDevices.getUserMedia);
        
        if (!hasGetUserMedia) {
          throw new Error('Camera API is not available in your browser');
        }
        
        // Initialize MediaPipe pose detection
        // Update with useFallbackMode preference
        await poseAnalysisService.initialize();
        poseAnalysisService.useFallbackMode = useFallbackMode;
        
        // Initialize video element
        if (videoRef.current) {
          videoRef.current.addEventListener('loadedmetadata', () => {
          });
        }
        
        setIsLoading(false);
      } catch (err) {
        setError(`Failed to initialize pose detection: ${err.message}`);
        setIsLoading(false);
      }
    };

    initializePoseDetection();
    
    // Cleanup function for component unmount
    return () => {
      try {
        // Stop any ongoing analysis
        poseAnalysisService.stopAnalysis();
        
        // Stop camera stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Clear video element
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
          videoRef.current.src = '';
        }
        
        // Cleanup pose service
        poseAnalysisService.cleanup();
        
      } catch (cleanupError) {
      }
    };
  }, [useFallbackMode]); // Include useFallbackMode and remove the other dependencies to prevent re-initialization loops

  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setIsLoading(true);
      setError(null);

      // Check file type
      if (!file.type.startsWith('video/')) {
        throw new Error('Please select a valid video file');
      }

      // Create video URL with proper cleanup
      const videoUrl = URL.createObjectURL(file);
      
      // Ensure video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Clean up any existing video
      if (videoRef.current.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }

      // Reset video element
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      videoRef.current.removeAttribute('src');
      videoRef.current.load();
      
      // Set new video source
      videoRef.current.src = videoUrl;
      
      // Wait for video metadata to load with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Video loading timeout'));
        }, 10000); // 10 second timeout

        const onLoadedMetadata = () => {
          clearTimeout(timeout);
          resolve();
        };

        const onError = (error) => {
          clearTimeout(timeout);
          cleanup();
          reject(new Error('Failed to load video file'));
        };

        const cleanup = () => {
          videoRef.current?.removeEventListener('loadedmetadata', onLoadedMetadata);
          videoRef.current?.removeEventListener('error', onError);
        };

        videoRef.current.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        videoRef.current.addEventListener('error', onError, { once: true });
      });

      // Start playing the video for analysis
      try {
        await videoRef.current.play();
      } catch (playError) {
        // Video autoplay might be blocked, but we can still analyze
        console.warn('Video autoplay blocked, but analysis will continue');
      }

      // Validate video dimensions
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (!videoWidth || !videoHeight || videoWidth < 100 || videoHeight < 100) {
        throw new Error('Invalid video dimensions or corrupted video file');
      }

      // Initialize canvas
      if (!canvasRef.current) {
        throw new Error('Canvas element not found');
      }
      
      // Set canvas size to match video dimensions
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Start analysis with improved error handling
      try {
        await poseAnalysisService.startSession();
        startAnalysisContext();
        setIsAnalyzing(true);

        // Start video analysis with enhanced callback
        // Set fallback mode before calling the method
        poseAnalysisService.useFallbackMode = useFallbackMode;
        await poseAnalysisService.startVideoAnalysis(
          videoRef.current,
          canvasRef.current,
          (results) => {
            try {
              if (results?.metrics) {
                const newMetrics = results.metrics;
                setMetrics(newMetrics);
                updateRiskLevel(newMetrics);
                updateRecommendations(newMetrics);
                
                const isHighRisk =
                  newMetrics.kneeAngle > 170 ||
                  newMetrics.hipRotation > 90 ||
                  newMetrics.shoulderRotation > 90 ||
                  newMetrics.elbowBend > 170;

                if (isHighRisk) {
                  addNotification({
                    title: 'High Injury Risk Detected',
                    message: `High risk detected: Knee Angle ${newMetrics.kneeAngle}°, Hip Rotation ${newMetrics.hipRotation}°, Shoulder Rotation ${newMetrics.shoulderRotation}°, Elbow Bend ${newMetrics.elbowBend}°`,
                    timestamp: new Date().toISOString(),
                    type: 'warning',
                  });
                }
                
                updateAnalysis({
                  currentPose: results.pose?.poseLandmarks,
                  metrics: newMetrics,
                  riskLevel: results.riskLevel,
                  timestamp: Date.now()
                });
              }
            } catch (callbackError) {
            }
          }
        );

        setIsVideoLoaded(true);
        setVideoFile(file);

        // Notify parent component
        if (onVideoSelect) {
          onVideoSelect({
            url: videoUrl,
            file: file
          });
        }

      } catch (analysisError) {
        throw new Error(`Failed to start video analysis: ${analysisError.message}`);
      }

    } catch (error) {
      setError(`Failed to load video: ${error.message}`);
      setIsVideoLoaded(false);
      setIsAnalyzing(false);
      stopAnalysisContext();
      
      // Cleanup on error
      if (videoRef.current) {
        if (videoRef.current.src) {
          URL.revokeObjectURL(videoRef.current.src);
        }
        videoRef.current.src = '';
        videoRef.current.load();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Check for camera availability
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera is not available in your browser');
      }

      // Request camera access with optimized constraints
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640, max: 1280 }, // Lower resolution to reduce memory usage
          height: { ideal: 480, max: 720 },
          facingMode: 'user',
          frameRate: { ideal: 15, max: 30 } // Lower frame rate to reduce processing load
        }
      });

      // Store stream reference for cleanup
      streamRef.current = stream;

      // Ensure video element exists
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Set up video element with stream
      videoRef.current.srcObject = stream;
      videoRef.current.playsInline = true; // Important for mobile devices
      
      // Wait for video to start playing with timeout
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          cleanup();
          reject(new Error('Camera stream timeout'));
        }, 10000); // 10 second timeout

        const onPlaying = () => {
          clearTimeout(timeout);
          resolve();
        };

        const onError = (error) => {
          clearTimeout(timeout);
          cleanup();
          reject(new Error('Failed to start camera stream'));
        };

        const cleanup = () => {
          videoRef.current?.removeEventListener('playing', onPlaying);
          videoRef.current?.removeEventListener('error', onError);
        };

        videoRef.current.addEventListener('playing', onPlaying, { once: true });
        videoRef.current.addEventListener('error', onError, { once: true });
        
        // Start playing
        videoRef.current.play().catch(onError);
      });

      // Initialize canvas
      if (!canvasRef.current) {
        throw new Error('Canvas element not found');
      }

      // Set canvas dimensions to match video
      const videoWidth = videoRef.current.videoWidth;
      const videoHeight = videoRef.current.videoHeight;
      
      if (!videoWidth || !videoHeight) {
        throw new Error('Invalid camera stream dimensions');
      }

      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;

      // Start analysis session with improved error handling
      try {
        await poseAnalysisService.startSession();
        startAnalysisContext();
        setIsAnalyzing(true);

        // Start camera analysis with enhanced callback
        // Set fallback mode before calling the method
        poseAnalysisService.useFallbackMode = useFallbackMode;
        await poseAnalysisService.startCamera(
          videoRef.current,
          canvasRef.current,
          (results) => {
            try {
              if (results?.metrics) {
                const newMetrics = results.metrics;
                setMetrics(newMetrics);
                updateRiskLevel(newMetrics);
                updateRecommendations(newMetrics);
                setFullBodyDetected(results.fullBodyDetected || false);
                
                const isHighRisk =
                  newMetrics.kneeAngle > 170 ||
                  newMetrics.hipRotation > 90 ||
                  newMetrics.shoulderRotation > 90 ||
                  newMetrics.elbowBend > 170;

                if (isHighRisk) {
                  addNotification({
                    title: 'High Injury Risk Detected',
                    message: `High risk detected: Knee Angle ${newMetrics.kneeAngle}°, Hip Rotation ${newMetrics.hipRotation}°, Shoulder Rotation ${newMetrics.shoulderRotation}°, Elbow Bend ${newMetrics.elbowBend}°`,
                    timestamp: new Date().toISOString(),
                    type: 'warning',
                  });
                }
                
                updateAnalysis({
                  currentPose: results.pose?.poseLandmarks,
                  metrics: newMetrics,
                  riskLevel: results.riskLevel,
                  timestamp: Date.now()
                });
              }
            } catch (callbackError) {
            }
          }
        );

      } catch (analysisError) {
        throw new Error(`Failed to start camera analysis: ${analysisError.message}`);
      }

    } catch (error) {
      setError(`Failed to start camera: ${error.message}`);
      setIsAnalyzing(false);
      stopAnalysisContext();
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    try {
      
      // Stop MediaPipe analysis
      poseAnalysisService.stopAnalysis();
      
      // Stop camera stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          track.stop();
        });
        streamRef.current = null;
      }
      
      // Clear video element
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.srcObject = null;
        videoRef.current.src = '';
        videoRef.current.load();
      }

      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }

      // Reset state
      stopAnalysisContext();
      setIsAnalyzing(false);
      setFullBodyDetected(false);
      setMetrics(null);
      setError(null);
      
    } catch (error) {
      setError('Failed to stop camera properly');
    }
  };

  return {
    handleVideoUpload,
    startCamera,
    stopCamera
  };
};
