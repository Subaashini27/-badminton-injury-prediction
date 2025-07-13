import React, { useEffect, useState } from 'react';
import { useLiveAnalysis } from '../../hooks/useLiveAnalysis';
import { usePoseDetection } from '../../hooks/usePoseDetection';
import { useAnalysis } from '../../context/AnalysisContext';
import CameraControls from '../../components/live-analysis/CameraControls';
import VideoCanvas from '../../components/live-analysis/VideoCanvas';
import BodyHeatmap from '../../components/live-analysis/BodyHeatmapNew';
import JointAnglesTable from '../../components/live-analysis/JointAnglesTable';

const LiveAnalysis = ({ onVideoSelect }) => {
  // Add state for fallback mode toggle - DEFAULT TO FALSE to use MediaPipe
  const [useFallbackMode, setUseFallbackMode] = useState(false); // Changed to false to enable MediaPipe by default
  
  // Get processed metrics from AnalysisContext
  const { analysisResults, metricsHistory } = useAnalysis();
  
  const {
    // State
    mode,
    setMode,
    isAnalyzing,
    isLoading,
    error,
    setError,
    riskLevel,
    recommendations,
    metrics,
    showPositioningGuide,
    
    // Functions
    hasAtLeastOneValidMetric,
    formatMetric,
    cleanup,
    
    // Refs
    videoRef,
    canvasRef,
    streamRef,
    
    // Hook state and functions
    setIsLoading,
    setMetrics,
    updateRiskLevel,
    updateRecommendations,
    setFullBodyDetected,
    addNotification,
    updateAnalysis,
    startAnalysisContext,
    stopAnalysisContext,
    setIsAnalyzing,
    setIsVideoLoaded,
    setVideoFile
  } = useLiveAnalysis();

  const {
    handleVideoUpload,
    startCamera,
    stopCamera
  } = usePoseDetection({
    useFallbackMode,
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
    mode
  });

  // Cleanup on component unmount
  useEffect(() => {
    return cleanup;
  }, []); // Remove cleanup from dependency array to prevent circular dependencies

  // High risk notification effect
  useEffect(() => {
    if (riskLevel === 'high') {
      addNotification({
        title: 'Injury Risk Detected',
        message: `Detected high risk during analysis.`,
        timestamp: new Date().toISOString(),
        type: 'warning',
      });
    }
  }, [riskLevel, addNotification]);

  return (
    <div className="space-y-6">
      {/* Main Analysis Grid - Camera on Left, Heatmap on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Camera Analysis (Takes 2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Live Camera Analysis</h2>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  {mode === 'camera' ? 'Live Camera' : 'Video Upload'}
                </span>
              </div>
            </div>
            
            {/* Camera Controls */}
            <CameraControls
              mode={mode}
              setMode={setMode}
              isAnalyzing={isAnalyzing}
              isLoading={isLoading}
              startCamera={startCamera}
              handleVideoUpload={handleVideoUpload}
              stopCamera={stopCamera}
              cleanup={cleanup}
              error={error}
            />
            
            {/* Video Canvas - Constrained container */}
            <div className="mt-4 w-full max-w-full overflow-hidden">
              <VideoCanvas
                videoRef={videoRef}
                canvasRef={canvasRef}
                mode={mode}
                isLoading={isLoading}
                error={error}
                setError={setError}
                showPositioningGuide={showPositioningGuide}
                isAnalyzing={isAnalyzing}
              />
            </div>
            
            {/* Disclaimer */}
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm text-amber-800 font-medium">Analysis Accuracy Note</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Angle calculations are based on pose estimation and may vary based on lighting and camera angle. Use as supportive feedback for technique improvement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Body Heatmap (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Body Heatmap</h3>
              <div className="group relative">
                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="absolute right-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  <p className="font-medium mb-1">Risk Color Guide:</p>
                  <div className="space-y-1">
                    <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>Red: High Risk (Action needed)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>Orange: Medium Risk (Caution)</div>
                    <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>Green: Safe (Good form)</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Enhanced Body Heatmap - using processed metrics */}
            <div className="relative flex-1 flex items-center justify-center">
              {hasAtLeastOneValidMetric(metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : metrics) ? (
                <BodyHeatmap metrics={metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : metrics} />
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">Start Analysis</p>
                  <p className="text-sm text-gray-400">Position yourself in the camera view</p>
                </div>
              )}
            </div>
            
            {/* Real-time Risk Status */}
            {isAnalyzing && hasAtLeastOneValidMetric(metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : metrics) && (
              <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-sm font-medium text-blue-800">Real-time monitoring active</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Risk levels update automatically as you move
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section - Live Joint Angles */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">Live Joint Angles</h3>
            <div className="group relative">
              <svg className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <div className="absolute left-0 top-6 w-80 p-4 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <p className="font-medium mb-2">Safe Angle Ranges:</p>
                <div className="space-y-1">
                  <div><strong>Knee:</strong> 140-165° (avoid locked knee &gt; 165°)</div>
                  <div><strong>Hip:</strong> 80-120° (prevent lower back strain)</div>
                  <div><strong>Shoulder:</strong> 90-140° (avoid overextension &gt; 140°)</div>
                  <div><strong>Elbow:</strong> 140-170° (maintain natural flexion)</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Real-time indicator */}
          {isAnalyzing && (
            <div className="flex items-center text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Real-time tracking
            </div>
          )}
        </div>

        {hasAtLeastOneValidMetric(metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : metrics) ? (
          <JointAnglesTable metrics={metricsHistory.length > 0 ? metricsHistory[metricsHistory.length - 1] : metrics} />
        ) : (
          <div className="p-8 text-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="w-12 h-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No Joint Data Available</p>
            <p className="text-sm text-gray-400 mt-1">Start camera or upload video to see real-time joint angles</p>
          </div>
        )}
      </div>

      {/* Movement Tips Section */}
      {recommendations && recommendations.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.663 17h4.673a1.001 1.001 0 00.728-1.694l-2.336-2.5a1 1 0 00-1.456 0l-2.336 2.5A1 1 0 009.663 17zm2.336-8.5a1 1 0 00.728-.694L15.063 2.5A1.001 1.001 0 0014.336 1H9.663a1.001 1.001 0 00-.728 1.5l2.336 5.306a1 1 0 00.728.694z" clipRule="evenodd" />
            </svg>
            Movement Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((tip, index) => (
              <div key={index} className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                <p className="text-sm text-blue-800">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveAnalysis;
