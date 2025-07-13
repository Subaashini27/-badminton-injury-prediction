import { useState, useCallback } from 'react';

export const usePoseAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentPose, setCurrentPose] = useState(null);
  const [jointAngles, setJointAngles] = useState({
    leftShoulder: null,
    rightShoulder: null,
    leftElbow: null,
    rightElbow: null,
    leftKnee: null,
    rightKnee: null,
    leftHip: null,
    rightHip: null
  });
  const [riskAnalysis, setRiskAnalysis] = useState({
    overall: 'low',
    areas: []
  });

  const handlePoseData = useCallback((pose) => {
    setCurrentPose(pose);
    setIsAnalyzing(!!pose);
  }, []);

  const handleJointAngles = useCallback((angles) => {
    setJointAngles(prev => ({
      ...prev,
      ...angles
    }));
  }, []);

  const handleRiskAnalysis = useCallback((analysis) => {
    setRiskAnalysis(analysis);
  }, []);

  const resetAnalysis = useCallback(() => {
    setIsAnalyzing(false);
    setCurrentPose(null);
    setJointAngles({
      leftShoulder: null,
      rightShoulder: null,
      leftElbow: null,
      rightElbow: null,
      leftKnee: null,
      rightKnee: null,
      leftHip: null,
      rightHip: null
    });
    setRiskAnalysis({
      overall: 'low',
      areas: []
    });
  }, []);

  return {
    isAnalyzing,
    currentPose,
    jointAngles,
    riskAnalysis,
    handlePoseData,
    handleJointAngles,
    handleRiskAnalysis,
    resetAnalysis
  };
};

export default usePoseAnalysis;
