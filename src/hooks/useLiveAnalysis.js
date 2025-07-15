import { useState, useRef, useEffect, useCallback } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { useNotification } from '../context/NotificationContext';
import poseAnalysisService from '../services/PoseAnalysisService';
import { INITIAL_METRICS, isValidMetric, formatMetric } from '../utils/liveAnalysisUtils';

export const useLiveAnalysis = () => {
  const { 
    analysisResults,
    updateAnalysis, 
    startAnalysis: startAnalysisContext, 
    stopAnalysis: stopAnalysisContext 
  } = useAnalysis();
  
  const { addNotification } = useNotification();
  
  const [mode, setMode] = useState('camera');
  const [videoFile, setVideoFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [riskLevel, setRiskLevel] = useState('low');
  const [recommendations, setRecommendations] = useState(['Stand in view of the camera for analysis']);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [showPositioningGuide, setShowPositioningGuide] = useState(true);
  const [fullBodyDetected, setFullBodyDetected] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Helper functions

  const hasAtLeastOneValidMetric = (metrics) => {
    if (!metrics) return false;
    return (
      isValidMetric(metrics.kneeAngle) ||
      isValidMetric(metrics.hipRotation) ||
      isValidMetric(metrics.shoulderRotation) ||
      isValidMetric(metrics.elbowBend)
    );
  };

  const updateRiskLevel = useCallback((metrics) => {
    let newRiskLevel = 'low';
    
    // Check knee angle
    if (metrics.kneeAngle > 170) {
      newRiskLevel = 'high';
    } else if (metrics.kneeAngle > 150) {
      newRiskLevel = Math.max(newRiskLevel === 'high' ? 'high' : 'medium', 'medium');
    }

    // Check hip rotation
    if (metrics.hipRotation > 45) {
      newRiskLevel = 'high';
    } else if (metrics.hipRotation > 30) {
      newRiskLevel = Math.max(newRiskLevel === 'high' ? 'high' : 'medium', 'medium');
    }

    // Check shoulder rotation
    if (metrics.shoulderRotation > 90) {
      newRiskLevel = 'high';
    } else if (metrics.shoulderRotation > 60) {
      newRiskLevel = Math.max(newRiskLevel === 'high' ? 'high' : 'medium', 'medium');
    }

    // Check elbow bend
    if (metrics.elbowBend > 90) {
      newRiskLevel = 'high';
    } else if (metrics.elbowBend > 70) {
      newRiskLevel = Math.max(newRiskLevel === 'high' ? 'high' : 'medium', 'medium');
    }

    setRiskLevel(newRiskLevel);

    // Update analysis context with risk level
    updateAnalysis(prevState => ({
      ...prevState,
      riskLevel: newRiskLevel,
      metrics: metrics,
      timestamp: Date.now()
    }));
  }, [updateAnalysis]);

  const updateRecommendations = useCallback((metrics) => {
    const newRecommendations = [];

    // Add specific recommendations based on metrics
    if (metrics.kneeAngle > 170) {
      newRecommendations.push('Keep your knees slightly bent to prevent injury');
    } else if (metrics.kneeAngle > 150) {
      newRecommendations.push('Watch your knee angle');
    }

    if (metrics.hipRotation > 45) {
      newRecommendations.push('Reduce hip rotation to prevent strain');
    } else if (metrics.hipRotation > 30) {
      newRecommendations.push('Maintain proper hip alignment');
    }

    if (metrics.shoulderRotation > 90) {
      newRecommendations.push('Reduce shoulder rotation to prevent injury');
    } else if (metrics.shoulderRotation > 60) {
      newRecommendations.push('Watch your shoulder position');
    }

    if (metrics.elbowBend > 90) {
      newRecommendations.push('Control your elbow movement');
    }

    // Add default recommendation if no issues found
    if (newRecommendations.length === 0) {
      newRecommendations.push('Good form! Keep it up!');
    }

    setRecommendations(newRecommendations);
  }, []);

  const cleanup = useCallback(() => {
    try {
      // Stop any ongoing analysis
      if (poseAnalysisService) {
        poseAnalysisService.stopAnalysis();
      }
      
      // Clean up video element
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = '';
        videoRef.current.load();
      }
      
      // Clean up canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      
      // Reset states
      setIsAnalyzing(false);
      setIsVideoLoaded(false);
      stopAnalysisContext();
      setVideoFile(null);
      setFullBodyDetected(false);
      setShowPositioningGuide(true);
      setMetrics(INITIAL_METRICS);
    } catch (error) {
              // Error during cleanup
    }
  }, []); // Remove stopAnalysisContext dependency to prevent circular dependencies

  return {
    // State
    mode,
    setMode,
    videoFile,
    setVideoFile,
    isAnalyzing,
    setIsAnalyzing,
    isLoading,
    setIsLoading,
    error,
    setError,
    riskLevel,
    setRiskLevel,
    recommendations,
    setRecommendations,
    metrics,
    setMetrics,
    showPositioningGuide,
    setShowPositioningGuide,
    fullBodyDetected,
    setFullBodyDetected,
    isVideoLoaded,
    setIsVideoLoaded,
    
    // Refs
    videoRef,
    canvasRef,
    streamRef,
    
    // Functions
    isValidMetric,
    hasAtLeastOneValidMetric,
    formatMetric,
    updateRiskLevel,
    updateRecommendations,
    cleanup,
    
    // Context
    analysisResults,
    updateAnalysis,
    startAnalysisContext,
    stopAnalysisContext,
    addNotification
  };
};
