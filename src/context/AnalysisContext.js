import React, { createContext, useContext, useState, useCallback } from 'react';

const AnalysisContext = createContext();

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};

export const AnalysisProvider = ({ children }) => {
  const [analysisResults, setAnalysisResults] = useState({
    currentPose: null,
    metrics: null,
    riskLevel: 'low',
    timestamp: null
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metricsHistory, setMetricsHistory] = useState([]);
  
  // Process raw metrics into risk levels
  const processMetrics = (rawMetrics) => {
    if (!rawMetrics) return null;
    
    // Define risk thresholds for each metric
    const thresholds = {
      knee: { safe: 140, medium: 160, high: 180 },
      hip: { safe: 80, medium: 90, high: 100 },
      shoulder: { safe: 90, medium: 110, high: 130 },
      elbow: { safe: 160, medium: 170, high: 180 }
    };
    
    // Calculate risk levels
    const kneeRisk = rawMetrics.kneeAngle <= thresholds.knee.safe ? 'Safe' : 
                    rawMetrics.kneeAngle <= thresholds.knee.medium ? 'Medium Risk' : 'High Risk';
                    
    const hipRisk = rawMetrics.hipRotation <= thresholds.hip.safe ? 'Safe' : 
                   rawMetrics.hipRotation <= thresholds.hip.medium ? 'Medium Risk' : 'High Risk';
                   
    const shoulderRisk = rawMetrics.shoulderRotation <= thresholds.shoulder.safe ? 'Safe' : 
                         rawMetrics.shoulderRotation <= thresholds.shoulder.medium ? 'Medium Risk' : 'High Risk';
                         
    const elbowRisk = rawMetrics.elbowBend <= thresholds.elbow.safe ? 'Safe' : 
                     rawMetrics.elbowBend <= thresholds.elbow.medium ? 'Medium Risk' : 'High Risk';
    
    // Calculate overall risk (simplified approach)
    const riskScores = {
      'Safe': 0,
      'Medium Risk': 1,
      'High Risk': 2
    };
    
    const totalRiskScore = riskScores[kneeRisk] + riskScores[hipRisk] + 
                           riskScores[shoulderRisk] + riskScores[elbowRisk];
    
    let overallRisk = 'Safe';
    if (totalRiskScore >= 5) {
      overallRisk = 'High Risk';
    } else if (totalRiskScore >= 2) {
      overallRisk = 'Medium Risk';
    }
    
    return {
      ...rawMetrics,
      kneeRisk,
      hipRisk,
      shoulderRisk,
      elbowRisk,
      overallRisk
    };
  };

  const updateMetricsHistory = useCallback((newMetric) => {
    if (!newMetric) return;
    
    setMetricsHistory(prevMetrics => {
      const updatedMetrics = [...prevMetrics, {
        ...newMetric,
        timestamp: Date.now()
      }];
      // Keep only the last 100 metrics to prevent memory issues
      return updatedMetrics.slice(-100);
    });
  }, []);

  const updateAnalysis = useCallback((newResults) => {
    setAnalysisResults(prev => {
      const updated = {
        ...prev,
        ...newResults,
        timestamp: newResults.timestamp || Date.now()
      };
      
      return updated;
    });
    
    // Add to metrics history if we have new metrics (moved outside to avoid circular dependency)
    if (newResults.metrics) {
      const processedMetrics = processMetrics(newResults.metrics);
      updateMetricsHistory(processedMetrics);
    }
  }, [updateMetricsHistory]);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  const stopAnalysis = useCallback(() => {
    setIsAnalyzing(false);
  }, []);

  const clearMetrics = useCallback(() => {
    setMetricsHistory([]);
  }, []);

  const getSessionStats = useCallback(() => {
    if (!metricsHistory || metricsHistory.length === 0) {
      return {
        totalSessions: 0,
        daysSinceHighRisk: 0,
        mostImprovedArea: 'None',
        averageRisk: 0
      };
    }

    // Calculate days since last high risk
    const highRiskEntries = metricsHistory
      .filter(m => m.overallRisk === 'High Risk')
      .sort((a, b) => b.timestamp - a.timestamp);
    
    const daysSinceHighRisk = highRiskEntries.length > 0 
      ? Math.floor((Date.now() - highRiskEntries[0].timestamp) / (1000 * 60 * 60 * 24))
      : 7; // Default if no high risk
    
    // Calculate most improved area by comparing first and last metrics
    const firstMetrics = metricsHistory[0];
    const lastMetrics = metricsHistory[metricsHistory.length - 1];
    
    const areas = ['knee', 'hip', 'shoulder', 'elbow'];
    const improvements = areas.map(area => {
      const firstRisk = firstMetrics[`${area}Risk`];
      const lastRisk = lastMetrics[`${area}Risk`];
      const riskValues = { 'Safe': 0, 'Medium Risk': 1, 'High Risk': 2 };
      return {
        area,
        improvement: riskValues[firstRisk] - riskValues[lastRisk]
      };
    });
    
    improvements.sort((a, b) => b.improvement - a.improvement);
    const mostImprovedArea = improvements[0].improvement > 0 ? improvements[0].area : 'None';
    
    return {
      totalSessions: metricsHistory.length,
      daysSinceHighRisk,
      mostImprovedArea,
      averageRisk: calculateAverageRisk(metricsHistory)
    };
  }, [metricsHistory]);

  const calculateAverageRisk = (metrics) => {
    if (!metrics || metrics.length === 0) return 0;
    
    const riskValues = { 'Safe': 0, 'Medium Risk': 50, 'High Risk': 100 };
    const overallRisks = metrics.map(m => riskValues[m.overallRisk] || 0);
    return overallRisks.reduce((sum, val) => sum + val, 0) / overallRisks.length;
  };

  const getRecommendations = useCallback((metrics) => {
    if (!metrics) return [];
    
    const recommendations = [];
    
    if (metrics.kneeRisk === 'Medium Risk' || metrics.kneeRisk === 'High Risk') {
      recommendations.push('Focus on proper knee alignment during lunges and jumps');
    }
    
    if (metrics.hipRisk === 'Medium Risk' || metrics.hipRisk === 'High Risk') {
      recommendations.push('Improve hip mobility and rotation with targeted exercises');
    }
    
    if (metrics.shoulderRisk === 'Medium Risk' || metrics.shoulderRisk === 'High Risk') {
      recommendations.push('Work on shoulder stability and proper racket motion');
    }
    
    if (metrics.elbowRisk === 'Medium Risk' || metrics.elbowRisk === 'High Risk') {
      recommendations.push('Check your grip technique to reduce elbow strain');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Maintain your excellent form and technique');
    }
    
    return recommendations;
  }, []);

  const calculateOverallScore = useCallback((metrics) => {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return 0;
    }

    const riskValues = { 'Safe': 0, 'Medium Risk': 50, 'High Risk': 100 };
    const overallRisks = metrics.map(m => riskValues[m.overallRisk] || 0);
    return overallRisks.reduce((sum, val) => sum + val, 0) / overallRisks.length;
  }, []);

  const value = {
    analysisResults,
    isAnalyzing,
    metricsHistory,
    processMetrics,
    updateAnalysis,
    startAnalysis,
    stopAnalysis,
    clearMetrics,
    getSessionStats,
    getRecommendations,
    calculateOverallScore
  };

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  );
};

export default AnalysisContext; 