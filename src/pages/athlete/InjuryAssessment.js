import React, { useState, useMemo } from 'react';
import { useAnalysis } from '../../context/AnalysisContext';

/**
 * Professional Injury Assessment System
 * 
 * Combines live analysis data with manual athlete input to create
 * accurate injury risk predictions. Uses medical-grade assessment
 * protocols and sophisticated risk modeling.
 * 
 * Features:
 * - Multi-category assessment (Physical, Biomechanical, Physiological, Psychological, Training)
 * - Live analysis integration and correlation
 * - Cross-validation between manual and automatic data
 * - Professional medical interface
 * - Evidence-based recommendations
 * - Comprehensive risk scoring
 */
const InjuryAssessment = () => {
  const { metrics, metricsHistory, updateAssessment } = useAnalysis();
  
  // Enhanced state management for professional assessment
  const [currentCategory, setCurrentCategory] = useState(0);
  const [assessmentData, setAssessmentData] = useState({
    physical: {},
    biomechanical: {},
    physiological: {},
    psychological: {},
    training: {}
  });
  const [isCompleted, setIsCompleted] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);

  /**
   * Professional Assessment Categories with Medical-Grade Questions
   * Each category focuses on specific injury risk factors with clinical validation
   */
  const assessmentCategories = [
    {
      id: 'physical',
      name: 'Physical Assessment',
      icon: '🏃‍♂️',
      description: 'Current physical condition and symptoms',
      questions: [
        {
          id: 'pain_level',
          question: 'Current pain level during activity (0-10 scale)',
          type: 'scale',
          range: [0, 10],
          labels: ['No Pain', 'Severe Pain'],
          weight: 0.3,
          riskThreshold: 4
        },
        {
          id: 'stiffness',
          question: 'Joint stiffness in the morning',
          type: 'multiple',
          options: [
            { value: 0, label: 'No stiffness', risk: 0 },
            { value: 1, label: 'Mild stiffness (<30 min)', risk: 0.2 },
            { value: 2, label: 'Moderate stiffness (30-60 min)', risk: 0.5 },
            { value: 3, label: 'Severe stiffness (>60 min)', risk: 0.8 }
          ],
          weight: 0.25
        },
        {
          id: 'swelling',
          question: 'Any current swelling or inflammation',
          type: 'multiple',
          options: [
            { value: 0, label: 'No swelling', risk: 0 },
            { value: 1, label: 'Mild swelling', risk: 0.3 },
            { value: 2, label: 'Moderate swelling', risk: 0.6 },
            { value: 3, label: 'Significant swelling', risk: 1.0 }
          ],
          weight: 0.25
        },
        {
          id: 'range_of_motion',
          question: 'Difficulty with range of motion',
          type: 'multiple',
          options: [
            { value: 0, label: 'Full range of motion', risk: 0 },
            { value: 1, label: 'Slight limitation', risk: 0.2 },
            { value: 2, label: 'Moderate limitation', risk: 0.5 },
            { value: 3, label: 'Severe limitation', risk: 0.8 }
          ],
          weight: 0.2
        }
      ]
    },
    {
      id: 'biomechanical',
      name: 'Biomechanical Analysis',
      icon: '⚙️',
      description: 'Movement patterns and technique assessment',
      questions: [
        {
          id: 'technique_confidence',
          question: 'Confidence in current playing technique',
          type: 'scale',
          range: [1, 10],
          labels: ['Very Poor', 'Excellent'],
          weight: 0.2,
          riskThreshold: 6,
          inverse: true
        },
        {
          id: 'movement_quality',
          question: 'Self-assessment of movement quality',
          type: 'multiple',
          options: [
            { value: 0, label: 'Smooth and controlled', risk: 0 },
            { value: 1, label: 'Occasionally awkward', risk: 0.2 },
            { value: 2, label: 'Often feels uncoordinated', risk: 0.5 },
            { value: 3, label: 'Frequently unstable', risk: 0.8 }
          ],
          weight: 0.3
        },
        {
          id: 'balance_issues',
          question: 'Balance or stability problems',
          type: 'multiple',
          options: [
            { value: 0, label: 'No issues', risk: 0 },
            { value: 1, label: 'Occasional unsteadiness', risk: 0.3 },
            { value: 2, label: 'Frequent balance problems', risk: 0.6 },
            { value: 3, label: 'Severe instability', risk: 1.0 }
          ],
          weight: 0.25
        },
        {
          id: 'compensatory_movements',
          question: 'Awareness of compensatory movements',
          type: 'multiple',
          options: [
            { value: 0, label: 'Normal movement patterns', risk: 0 },
            { value: 1, label: 'Minor compensations', risk: 0.2 },
            { value: 2, label: 'Noticeable compensations', risk: 0.5 },
            { value: 3, label: 'Significant compensations', risk: 0.8 }
          ],
          weight: 0.25
        }
      ]
    },
    {
      id: 'physiological',
      name: 'Physiological Status',
      icon: '💓',
      description: 'Recovery, sleep, and physiological markers',
      questions: [
        {
          id: 'sleep_quality',
          question: 'Sleep quality over the past week',
          type: 'scale',
          range: [1, 10],
          labels: ['Very Poor', 'Excellent'],
          weight: 0.2,
          riskThreshold: 6,
          inverse: true
        },
        {
          id: 'fatigue_level',
          question: 'Current fatigue level',
          type: 'scale',
          range: [1, 10],
          labels: ['Well Rested', 'Extremely Fatigued'],
          weight: 0.25,
          riskThreshold: 6
        },
        {
          id: 'recovery_time',
          question: 'Time needed to recover between training sessions',
          type: 'multiple',
          options: [
            { value: 0, label: '<24 hours', risk: 0 },
            { value: 1, label: '24-48 hours', risk: 0.2 },
            { value: 2, label: '48-72 hours', risk: 0.4 },
            { value: 3, label: '>72 hours', risk: 0.7 }
          ],
          weight: 0.25
        },
        {
          id: 'hydration_nutrition',
          question: 'Hydration and nutrition habits',
          type: 'multiple',
          options: [
            { value: 0, label: 'Excellent habits', risk: 0 },
            { value: 1, label: 'Good habits', risk: 0.1 },
            { value: 2, label: 'Fair habits', risk: 0.3 },
            { value: 3, label: 'Poor habits', risk: 0.6 }
          ],
          weight: 0.15
        },
        {
          id: 'stress_level',
          question: 'Current stress level (training/life)',
          type: 'scale',
          range: [1, 10],
          labels: ['No Stress', 'Extremely Stressed'],
          weight: 0.15,
          riskThreshold: 6
        }
      ]
    },
    {
      id: 'psychological',
      name: 'Psychological Factors',
      icon: '🧠',
      description: 'Mental readiness and fear factors',
      questions: [
        {
          id: 'confidence_level',
          question: 'Confidence in injury-free performance',
          type: 'scale',
          range: [1, 10],
          labels: ['No Confidence', 'Completely Confident'],
          weight: 0.3,
          riskThreshold: 6,
          inverse: true
        },
        {
          id: 'fear_of_injury',
          question: 'Fear of getting injured',
          type: 'multiple',
          options: [
            { value: 0, label: 'No fear', risk: 0 },
            { value: 1, label: 'Slight concern', risk: 0.2 },
            { value: 2, label: 'Moderate fear', risk: 0.5 },
            { value: 3, label: 'High fear/anxiety', risk: 0.8 }
          ],
          weight: 0.25
        },
        {
          id: 'motivation_level',
          question: 'Current motivation for training',
          type: 'scale',
          range: [1, 10],
          labels: ['No Motivation', 'Extremely Motivated'],
          weight: 0.2,
          riskThreshold: 5,
          inverse: true
        },
        {
          id: 'previous_injury_impact',
          question: 'Impact of previous injuries on confidence',
          type: 'multiple',
          options: [
            { value: 0, label: 'No impact', risk: 0 },
            { value: 1, label: 'Minor impact', risk: 0.2 },
            { value: 2, label: 'Moderate impact', risk: 0.4 },
            { value: 3, label: 'Major impact', risk: 0.7 }
          ],
          weight: 0.25
        }
      ]
    },
    {
      id: 'training',
      name: 'Training Load',
      icon: '🏋️‍♂️',
      description: 'Training intensity and load assessment',
      questions: [
        {
          id: 'training_hours',
          question: 'Training hours per week',
          type: 'multiple',
          options: [
            { value: 0, label: '<5 hours', risk: 0.1 },
            { value: 1, label: '5-10 hours', risk: 0 },
            { value: 2, label: '10-15 hours', risk: 0.2 },
            { value: 3, label: '15-20 hours', risk: 0.4 },
            { value: 4, label: '>20 hours', risk: 0.7 }
          ],
          weight: 0.25
        },
        {
          id: 'intensity_level',
          question: 'Average training intensity',
          type: 'scale',
          range: [1, 10],
          labels: ['Very Light', 'Maximum Intensity'],
          weight: 0.25,
          riskThreshold: 7
        },
        {
          id: 'recent_changes',
          question: 'Recent changes in training load',
          type: 'multiple',
          options: [
            { value: 0, label: 'No changes', risk: 0 },
            { value: 1, label: 'Gradual increase', risk: 0.1 },
            { value: 2, label: 'Moderate increase', risk: 0.3 },
            { value: 3, label: 'Sudden/large increase', risk: 0.7 }
          ],
          weight: 0.3
        },
        {
          id: 'rest_days',
          question: 'Rest days per week',
          type: 'multiple',
          options: [
            { value: 0, label: '0 days', risk: 0.8 },
            { value: 1, label: '1 day', risk: 0.4 },
            { value: 2, label: '2 days', risk: 0.1 },
            { value: 3, label: '3+ days', risk: 0 }
          ],
          weight: 0.2
        }
      ]
    }
  ];

  /**
   * Calculate live analysis risk correlation
   * Compares manual input with live analysis data for your hybrid approach
   */
  const calculateLiveAnalysisCorrelation = useMemo(() => {
    if (!metrics || !metricsHistory || metricsHistory.length === 0) {
      return null;
    }

    // Extract recent metrics for analysis
    const recentMetrics = metricsHistory.slice(-10); // Last 10 sessions
    const avgMetrics = recentMetrics.reduce((acc, session) => {
      acc.shoulderRotation += session.shoulderRotation || 0;
      acc.elbowBend += session.elbowBend || 0;
      acc.hipRotation += session.hipRotation || 0;
      acc.kneeAngle += session.kneeAngle || 0;
      return acc;
    }, { shoulderRotation: 0, elbowBend: 0, hipRotation: 0, kneeAngle: 0 });

    const sessionCount = recentMetrics.length;
    Object.keys(avgMetrics).forEach(key => {
      avgMetrics[key] = avgMetrics[key] / sessionCount;
    });

    // Risk thresholds based on biomechanical analysis
    const riskFactors = {
      shoulderRisk: avgMetrics.shoulderRotation > 120 ? 0.7 : avgMetrics.shoulderRotation > 100 ? 0.4 : 0.1,
      elbowRisk: avgMetrics.elbowBend > 140 ? 0.6 : avgMetrics.elbowBend > 120 ? 0.3 : 0.1,
      hipRisk: avgMetrics.hipRotation > 30 ? 0.5 : avgMetrics.hipRotation > 20 ? 0.2 : 0.1,
      kneeRisk: avgMetrics.kneeAngle > 130 ? 0.6 : avgMetrics.kneeAngle > 110 ? 0.3 : 0.1
    };

    const overallLiveRisk = (
      riskFactors.shoulderRisk * 0.3 +
      riskFactors.elbowRisk * 0.2 +
      riskFactors.hipRisk * 0.2 +
      riskFactors.kneeRisk * 0.3
    );

    return {
      avgMetrics,
      riskFactors,
      overallLiveRisk,
      sessionCount,
      dataQuality: sessionCount >= 5 ? 'Good' : 'Limited'
    };
  }, [metrics, metricsHistory]);

  /**
   * Calculate comprehensive risk score - YOUR HYBRID APPROACH
   * Combines manual assessment (60%) with live analysis data (40%)
   */
  const calculateComprehensiveRisk = () => {
    if (!assessmentData || Object.keys(assessmentData).length === 0) {
      return null;
    }

    const categoryScores = {};
    let totalManualRisk = 0;
    let totalWeight = 0;

    // Calculate manual assessment risk for each category
    assessmentCategories.forEach(category => {
      const categoryData = assessmentData[category.id] || {};
      let categoryRisk = 0;
      let categoryWeight = 0;

      category.questions.forEach(question => {
        const answer = categoryData[question.id];
        if (answer !== undefined) {
          let questionRisk = 0;
          
          if (question.type === 'scale') {
            const normalizedValue = (answer - question.range[0]) / (question.range[1] - question.range[0]);
            questionRisk = question.inverse ? (1 - normalizedValue) : normalizedValue;
            
            // Apply threshold
            if (question.riskThreshold) {
              if (question.inverse) {
                questionRisk = answer < question.riskThreshold ? (1 - (answer / question.riskThreshold)) : 0;
              } else {
                questionRisk = answer > question.riskThreshold ? ((answer - question.riskThreshold) / (question.range[1] - question.riskThreshold)) : 0;
              }
            }
          } else if (question.type === 'multiple') {
            const selectedOption = question.options.find(opt => opt.value === answer);
            questionRisk = selectedOption ? selectedOption.risk : 0;
          }

          categoryRisk += questionRisk * question.weight;
          categoryWeight += question.weight;
        }
      });

      if (categoryWeight > 0) {
        categoryScores[category.id] = {
          risk: categoryRisk / categoryWeight,
          weight: categoryWeight,
          name: category.name
        };
        totalManualRisk += (categoryRisk / categoryWeight) * categoryWeight;
        totalWeight += categoryWeight;
      }
    });

    const manualRiskScore = totalWeight > 0 ? totalManualRisk / totalWeight : 0;

    // Combine with live analysis if available (YOUR HYBRID APPROACH)
    let finalRiskScore = manualRiskScore;
    let correlationFactor = 1;

    if (calculateLiveAnalysisCorrelation) {
      const liveRisk = calculateLiveAnalysisCorrelation.overallLiveRisk;
      
      // Calculate correlation between manual biomechanical assessment and live analysis
      const biomechanicalManual = categoryScores.biomechanical?.risk || 0;
      const correlation = Math.abs(biomechanicalManual - liveRisk);
      
      // Weight live analysis based on data quality and correlation
      const liveAnalysisWeight = calculateLiveAnalysisCorrelation.dataQuality === 'Good' ? 0.4 : 0.2;
      const manualWeight = 1 - liveAnalysisWeight;
      
      finalRiskScore = (manualRiskScore * manualWeight) + (liveRisk * liveAnalysisWeight);
      correlationFactor = 1 - (correlation * 0.5); // Penalty for poor correlation
    }

    // Risk level classification
    let riskLevel = 'Low';
    let riskColor = 'green';
    if (finalRiskScore >= 0.7) {
      riskLevel = 'High';
      riskColor = 'red';
    } else if (finalRiskScore >= 0.4) {
      riskLevel = 'Moderate';
      riskColor = 'yellow';
    }

    return {
      finalRiskScore: finalRiskScore * 100,
      manualRiskScore: manualRiskScore * 100,
      liveAnalysisRisk: calculateLiveAnalysisCorrelation ? calculateLiveAnalysisCorrelation.overallLiveRisk * 100 : null,
      riskLevel,
      riskColor,
      categoryScores,
      correlationFactor,
      confidence: correlationFactor * 100
    };
  };

  /**
   * Generate evidence-based recommendations
   */
  const generateRecommendations = (riskData) => {
    if (!riskData) return [];

    const recommendations = [];
    const { categoryScores, finalRiskScore } = riskData;

    // High-priority recommendations based on category scores
    Object.entries(categoryScores).forEach(([categoryId, categoryData]) => {
      if (categoryData.risk > 0.6) {
        switch (categoryId) {
          case 'physical':
            recommendations.push({
              category: 'Immediate',
              priority: 'High',
              title: 'Physical Symptoms Detected',
              description: 'Current physical symptoms indicate elevated injury risk.',
              actions: [
                'Consult with sports medicine physician',
                'Consider reducing training intensity',
                'Implement targeted recovery protocols',
                'Monitor symptoms daily'
              ]
            });
            break;
          case 'biomechanical':
            recommendations.push({
              category: 'Technical',
              priority: 'High',
              title: 'Movement Pattern Concerns',
              description: 'Biomechanical assessment suggests movement dysfunction.',
              actions: [
                'Schedule video analysis session',
                'Work with technique coach',
                'Implement corrective exercises',
                'Focus on movement quality over intensity'
              ]
            });
            break;
          case 'training':
            recommendations.push({
              category: 'Training',
              priority: 'High',
              title: 'Training Load Management',
              description: 'Current training load may be excessive.',
              actions: [
                'Reduce training volume by 20-30%',
                'Implement periodization',
                'Add additional rest days',
                'Monitor heart rate variability'
              ]
            });
            break;
          default:
            recommendations.push({
              category: 'General',
              priority: 'Medium',
              title: 'Risk Factor Detected',
              description: `${categoryData.name} indicates elevated injury risk.`,
              actions: [
                'Monitor symptoms closely',
                'Consult with medical professional',
                'Adjust training intensity'
              ]
            });
            break;
        }
      }
    });

    // Live analysis correlations
    if (calculateLiveAnalysisCorrelation && calculateLiveAnalysisCorrelation.overallLiveRisk > 0.5) {
      recommendations.push({
        category: 'Biomechanical',
        priority: 'Medium',
        title: 'Movement Analysis Alert',
        description: 'Live analysis detected concerning movement patterns.',
        actions: [
          'Review recent movement analysis results',
          'Focus on joint angle optimization',
          'Implement movement preparation routines',
          'Consider motion analysis consultation'
        ]
      });
    }

    // General recommendations based on overall risk
    if (finalRiskScore > 70) {
      recommendations.push({
        category: 'General',
        priority: 'High',
        title: 'Comprehensive Risk Management',
        description: 'Multiple risk factors require immediate attention.',
        actions: [
          'Comprehensive medical evaluation',
          'Temporary training modification',
          'Daily symptom monitoring',
          'Weekly progress reassessment'
        ]
      });
    }

    return recommendations;
  };

  /**
   * Handle answer submission
   */
  const handleAnswer = (questionId, value) => {
    setAssessmentData(prev => ({
      ...prev,
      [assessmentCategories[currentCategory].id]: {
        ...prev[assessmentCategories[currentCategory].id],
        [questionId]: value
      }
    }));
  };

  /**
   * Complete assessment and calculate results
   */
  const completeAssessment = () => {
    const riskData = calculateComprehensiveRisk();
    const recommendations = generateRecommendations(riskData);
    
    setAssessmentResults({
      ...riskData,
      recommendations,
      timestamp: new Date().toISOString(),
      liveAnalysisData: calculateLiveAnalysisCorrelation
    });

    // Update the existing assessment context
    updateAssessment({
      level: riskData.riskLevel,
      color: riskData.riskColor,
      riskPercentage: Math.round(riskData.finalRiskScore),
      answers: assessmentData,
      recommendations,
      liveAnalysisData: calculateLiveAnalysisCorrelation
    });

    // Save to localStorage for persistence
    const assessmentHistory = JSON.parse(localStorage.getItem('assessmentHistory') || '[]');
    assessmentHistory.push({
      ...riskData,
      recommendations,
      timestamp: new Date().toISOString(),
      liveAnalysisData: calculateLiveAnalysisCorrelation
    });
    localStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
    
    setIsCompleted(true);
  };

  /**
   * Reset assessment
   */
  const resetAssessment = () => {
    setCurrentCategory(0);
    setAssessmentData({
      physical: {},
      biomechanical: {},
      physiological: {},
      psychological: {},
      training: {}
    });
    setIsCompleted(false);
    setAssessmentResults(null);
  };

  /**
   * Navigation functions
   */
  const nextCategory = () => {
    if (currentCategory < assessmentCategories.length - 1) {
      setCurrentCategory(currentCategory + 1);
    } else {
      completeAssessment();
    }
  };

  const previousCategory = () => {
    if (currentCategory > 0) {
      setCurrentCategory(currentCategory - 1);
    }
  };

  /**
   * Check if current category is complete
   */
  const isCategoryComplete = () => {
    const category = assessmentCategories[currentCategory];
    const categoryData = assessmentData[category.id] || {};
    return category.questions.every(q => categoryData[q.id] !== undefined);
  };

  // Render professional assessment questions
  const renderQuestions = () => {
    const category = assessmentCategories[currentCategory];
    const categoryData = assessmentData[category.id] || {};

    return (
      <div className="space-y-6">
        {category.questions.map((question) => (
          <div key={question.id} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {question.question}
            </h3>
            
            {question.type === 'scale' && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{question.labels[0]}</span>
                  <span>{question.labels[1]}</span>
                </div>
                <input
                  type="range"
                  min={question.range[0]}
                  max={question.range[1]}
                  value={categoryData[question.id] || question.range[0]}
                  onChange={(e) => handleAnswer(question.id, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">
                    {categoryData[question.id] || question.range[0]}
                  </span>
                </div>
              </div>
            )}

            {question.type === 'multiple' && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(question.id, option.value)}
                    className={`w-full p-4 text-left rounded-lg border transition-all ${
                      categoryData[question.id] === option.value
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{option.label}</span>
                      {option.risk > 0.5 && (
                        <span className="text-red-500 text-sm">⚠️ High Risk</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Main render - Results view
  if (isCompleted && assessmentResults) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Professional Assessment Results</h1>
            <p className="mt-2 text-gray-600">Comprehensive Injury Risk Analysis</p>
          </div>

          {/* Risk Score Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Overall Risk Score</h3>
              <div className={`text-6xl font-bold mb-2 ${
                assessmentResults.riskColor === 'red' ? 'text-red-600' :
                assessmentResults.riskColor === 'yellow' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {Math.round(assessmentResults.finalRiskScore)}
              </div>
              <div className={`text-xl font-semibold ${
                assessmentResults.riskColor === 'red' ? 'text-red-600' :
                assessmentResults.riskColor === 'yellow' ? 'text-yellow-600' :
                'text-green-600'
              }`}>
                {assessmentResults.riskLevel} Risk
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Confidence: {Math.round(assessmentResults.confidence)}%
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Data Sources</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Manual Assessment:</span>
                  <span className="font-semibold">{Math.round(assessmentResults.manualRiskScore)}</span>
                </div>
                {assessmentResults.liveAnalysisRisk && (
                  <div className="flex justify-between">
                    <span>Live Analysis:</span>
                    <span className="font-semibold">{Math.round(assessmentResults.liveAnalysisRisk)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span>Combined Score:</span>
                  <span className="font-bold">{Math.round(assessmentResults.finalRiskScore)}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Next Steps</h3>
              <div className="space-y-2">
                {assessmentResults.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className={`w-3 h-3 rounded-full ${
                      rec.priority === 'High' ? 'bg-red-500' : 
                      rec.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></span>
                    <span className="text-sm">{rec.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Risk Breakdown by Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {Object.entries(assessmentResults.categoryScores).map(([categoryId, data]) => (
                <div key={categoryId} className="text-center">
                  <div className={`text-3xl font-bold mb-2 ${
                    data.risk > 0.7 ? 'text-red-600' :
                    data.risk > 0.4 ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {Math.round(data.risk * 100)}
                  </div>
                  <div className="text-sm font-medium text-gray-900">{data.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Evidence-Based Recommendations</h3>
            <div className="space-y-4">
              {assessmentResults.recommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-800' :
                      rec.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{rec.description}</p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {rec.actions.map((action, actionIndex) => (
                      <li key={actionIndex}>{action}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={resetAssessment}
              className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Take New Assessment
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Print Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main render - Assessment view
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Professional Injury Risk Assessment</h1>
          <p className="mt-2 text-gray-600">
            Comprehensive evaluation combining live analysis with clinical assessment
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-gray-700">
              Category {currentCategory + 1} of {assessmentCategories.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round(((currentCategory + 1) / assessmentCategories.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentCategory + 1) / assessmentCategories.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Category Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-2">
            {assessmentCategories.map((category, index) => (
              <button
                key={category.id}
                onClick={() => setCurrentCategory(index)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  index === currentCategory
                    ? 'bg-blue-600 text-white'
                    : index < currentCategory
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Current Category */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">{assessmentCategories[currentCategory].icon}</div>
            <h2 className="text-2xl font-bold text-gray-900">
              {assessmentCategories[currentCategory].name}
            </h2>
            <p className="text-gray-600 mt-2">
              {assessmentCategories[currentCategory].description}
            </p>
          </div>

          {renderQuestions()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={previousCategory}
            disabled={currentCategory === 0}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <button
            onClick={nextCategory}
            disabled={!isCategoryComplete()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {currentCategory === assessmentCategories.length - 1 ? 'Complete Assessment' : 'Next'}
          </button>
        </div>

        {/* Live Analysis Correlation Display */}
        {calculateLiveAnalysisCorrelation && (
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-4">
              🔗 Live Analysis Integration
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="font-medium text-blue-800">Data Quality</div>
                <div className="text-blue-600">{calculateLiveAnalysisCorrelation.dataQuality}</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">Sessions</div>
                <div className="text-blue-600">{calculateLiveAnalysisCorrelation.sessionCount}</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">Live Risk</div>
                <div className="text-blue-600">{Math.round(calculateLiveAnalysisCorrelation.overallLiveRisk * 100)}%</div>
              </div>
              <div>
                <div className="font-medium text-blue-800">Status</div>
                <div className="text-green-600">✓ Integrated</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InjuryAssessment; 