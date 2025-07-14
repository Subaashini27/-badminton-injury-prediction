class TrainingPlanAdjustmentService {
  constructor() {
    this.riskThresholds = {
      knee: { low: 150, medium: 170, high: 180 },
      hip: { low: 80, medium: 90, high: 100 },
      shoulder: { low: 80, medium: 100, high: 120 },
      elbow: { low: 140, medium: 160, high: 170 }
    };

    this.trainingIntensities = {
      low: { duration: 30, intensity: 'Low', focus: 'Recovery' },
      medium: { duration: 45, intensity: 'Medium', focus: 'Maintenance' },
      high: { duration: 60, intensity: 'High', focus: 'Development' }
    };

    this.exerciseRecommendations = {
      knee: {
        low: ['Light stretching', 'Walking', 'Gentle mobility exercises'],
        medium: ['Bodyweight squats', 'Step-ups', 'Leg press with light weight'],
        high: ['Rest and recovery', 'Physiotherapy exercises', 'Low-impact cardio']
      },
      hip: {
        low: ['Hip flexor stretches', 'Gentle hip rotations', 'Walking'],
        medium: ['Dynamic leg swings', 'Figure-4 stretches', 'Hip mobility drills'],
        high: ['Rest', 'Ice therapy', 'Professional assessment needed']
      },
      shoulder: {
        low: ['Shoulder rolls', 'Wall slides', 'Light band exercises'],
        medium: ['Band pull-aparts', 'Shoulder rotations', 'Push-ups with modifications'],
        high: ['Rest', 'Ice therapy', 'Professional assessment needed']
      },
      elbow: {
        low: ['Wrist flexor stretches', 'Light grip exercises', 'Gentle elbow mobility'],
        medium: ['Resistance band exercises', 'Light dumbbell curls', 'Forearm strengthening'],
        high: ['Rest', 'Ice therapy', 'Professional assessment needed']
      }
    };
  }

  // Analyze athlete risk data and generate training adjustments
  analyzeAndAdjustTraining(athleteData, currentPlan) {
    // Add null/undefined checks for athleteData and metrics
    if (!athleteData || !athleteData.metrics) {
      // Return a default analysis if metrics are not available
      return {
        riskAnalysis: {
          overall: { level: 'low', risk: 0 }
        },
        recommendations: [],
        adjustedPlan: currentPlan || { duration: 45, intensity: 'Medium', focus: 'Maintenance' },
        priority: 'low'
      };
    }

    const riskAnalysis = this.analyzeRiskLevels(athleteData.metrics);
    const recommendations = this.generateRecommendations(riskAnalysis);
    const adjustedPlan = this.adjustTrainingPlan(currentPlan, riskAnalysis);
    
    return {
      riskAnalysis,
      recommendations,
      adjustedPlan,
      priority: this.determinePriority(riskAnalysis)
    };
  }

  // Analyze risk levels for different body parts
  analyzeRiskLevels(metrics) {
    // Add null/undefined check for metrics
    if (!metrics) {
      return {
        overall: { level: 'low', risk: 0 }
      };
    }

    const analysis = {};

    // Analyze knee risk
    if (metrics.kneeAngle !== undefined && metrics.kneeAngle !== null) {
      analysis.knee = {
        value: metrics.kneeAngle,
        level: this.getRiskLevel(metrics.kneeAngle, this.riskThresholds.knee),
        risk: this.calculateRiskPercentage(metrics.kneeAngle, this.riskThresholds.knee)
      };
    }

    // Analyze hip risk
    if (metrics.hipRotation !== undefined && metrics.hipRotation !== null) {
      analysis.hip = {
        value: metrics.hipRotation,
        level: this.getRiskLevel(metrics.hipRotation, this.riskThresholds.hip),
        risk: this.calculateRiskPercentage(metrics.hipRotation, this.riskThresholds.hip)
      };
    }

    // Analyze shoulder risk
    if (metrics.shoulderRotation !== undefined && metrics.shoulderRotation !== null) {
      analysis.shoulder = {
        value: metrics.shoulderRotation,
        level: this.getRiskLevel(metrics.shoulderRotation, this.riskThresholds.shoulder),
        risk: this.calculateRiskPercentage(metrics.shoulderRotation, this.riskThresholds.shoulder)
      };
    }

    // Analyze elbow risk
    if (metrics.elbowBend !== undefined && metrics.elbowBend !== null) {
      analysis.elbow = {
        value: metrics.elbowBend,
        level: this.getRiskLevel(metrics.elbowBend, this.riskThresholds.elbow),
        risk: this.calculateRiskPercentage(metrics.elbowBend, this.riskThresholds.elbow)
      };
    }

    // Calculate overall risk
    const riskValues = Object.values(analysis).map(a => a.risk);
    analysis.overall = {
      level: this.getOverallRiskLevel(riskValues),
      risk: riskValues.length > 0 ? riskValues.reduce((a, b) => a + b, 0) / riskValues.length : 0
    };

    return analysis;
  }

  // Get risk level based on thresholds
  getRiskLevel(value, thresholds) {
    if (value >= thresholds.high) return 'high';
    if (value >= thresholds.medium) return 'medium';
    return 'low';
  }

  // Calculate risk percentage
  calculateRiskPercentage(value, thresholds) {
    if (value <= thresholds.low) return 0;
    if (value >= thresholds.high) return 100;
    
    const range = thresholds.high - thresholds.low;
    const position = value - thresholds.low;
    return Math.min(100, (position / range) * 100);
  }

  // Get overall risk level
  getOverallRiskLevel(riskValues) {
    if (riskValues.length === 0) return 'low';
    
    const averageRisk = riskValues.reduce((a, b) => a + b, 0) / riskValues.length;
    if (averageRisk >= 70) return 'high';
    if (averageRisk >= 40) return 'medium';
    return 'low';
  }

  // Generate specific recommendations based on risk analysis
  generateRecommendations(riskAnalysis) {
    const recommendations = [];

    // Generate recommendations for each body part
    Object.entries(riskAnalysis).forEach(([bodyPart, analysis]) => {
      if (bodyPart === 'overall') return;

      const exercises = this.exerciseRecommendations[bodyPart]?.[analysis.level];
      if (exercises) {
        recommendations.push({
          bodyPart,
          riskLevel: analysis.level,
          riskValue: analysis.value,
          exercises,
          priority: analysis.level === 'high' ? 'High' : analysis.level === 'medium' ? 'Medium' : 'Low'
        });
      }
    });

    // Add general recommendations based on overall risk
    if (riskAnalysis.overall.level === 'high') {
      recommendations.push({
        type: 'general',
        title: 'Immediate Action Required',
        description: 'High overall risk detected. Consider reducing training intensity and consulting with medical professionals.',
        priority: 'High',
        actions: [
          'Reduce training intensity by 50%',
          'Increase recovery time between sessions',
          'Schedule medical assessment',
          'Focus on low-impact exercises'
        ]
      });
    } else if (riskAnalysis.overall.level === 'medium') {
      recommendations.push({
        type: 'general',
        title: 'Moderate Risk - Monitor Closely',
        description: 'Moderate risk levels detected. Adjust training to focus on injury prevention.',
        priority: 'Medium',
        actions: [
          'Reduce training intensity by 25%',
          'Add more warm-up and cool-down time',
          'Include injury prevention exercises',
          'Monitor progress closely'
        ]
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Adjust training plan based on risk analysis
  adjustTrainingPlan(currentPlan, riskAnalysis) {
    // Add null/undefined check for currentPlan
    const basePlan = currentPlan || { duration: 45, intensity: 'Medium', focus: 'Maintenance' };
    const adjustedPlan = { ...basePlan };

    // Determine new training intensity based on overall risk
    const overallRisk = riskAnalysis.overall.level;
    const intensityAdjustment = this.trainingIntensities[overallRisk];

    // Adjust plan parameters
    adjustedPlan.duration = intensityAdjustment.duration;
    adjustedPlan.intensity = intensityAdjustment.intensity;
    adjustedPlan.focus = intensityAdjustment.focus;

    // Add specific exercises based on risk areas
    adjustedPlan.exercises = this.generateCustomExercises(riskAnalysis);

    // Adjust recovery periods
    adjustedPlan.recoveryPeriod = this.calculateRecoveryPeriod(riskAnalysis);

    // Add modifications based on specific risks
    adjustedPlan.modifications = this.generateModifications(riskAnalysis);

    return adjustedPlan;
  }

  // Generate custom exercises based on risk analysis
  generateCustomExercises(riskAnalysis) {
    const exercises = [];

    Object.entries(riskAnalysis).forEach(([bodyPart, analysis]) => {
      if (bodyPart === 'overall') return;

      const bodyPartExercises = this.exerciseRecommendations[bodyPart]?.[analysis.level];
      if (bodyPartExercises) {
        exercises.push({
          category: `${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} Focus`,
          exercises: bodyPartExercises,
          duration: analysis.level === 'high' ? 15 : analysis.level === 'medium' ? 10 : 5,
          intensity: analysis.level === 'high' ? 'Low' : 'Medium'
        });
      }
    });

    return exercises;
  }

  // Calculate recovery period based on risk levels
  calculateRecoveryPeriod(riskAnalysis) {
    // Add null/undefined check
    if (!riskAnalysis || typeof riskAnalysis !== 'object') {
      return '12-24 hours';
    }

    const highRiskCount = Object.values(riskAnalysis).filter(a => a && a.level === 'high').length;
    const mediumRiskCount = Object.values(riskAnalysis).filter(a => a && a.level === 'medium').length;

    if (highRiskCount > 0) return '48-72 hours';
    if (mediumRiskCount > 1) return '24-48 hours';
    return '12-24 hours';
  }

  // Generate specific modifications for training
  generateModifications(riskAnalysis) {
    const modifications = [];

    // Add null/undefined checks
    if (!riskAnalysis || typeof riskAnalysis !== 'object') {
      return modifications;
    }

    if (riskAnalysis.knee?.level === 'high') {
      modifications.push('Avoid jumping and high-impact movements');
    }
    if (riskAnalysis.hip?.level === 'high') {
      modifications.push('Reduce lateral movements and deep squats');
    }
    if (riskAnalysis.shoulder?.level === 'high') {
      modifications.push('Avoid overhead movements and heavy lifting');
    }
    if (riskAnalysis.elbow?.level === 'high') {
      modifications.push('Reduce grip-intensive exercises');
    }

    return modifications;
  }

  // Determine priority level for recommendations
  determinePriority(riskAnalysis) {
    // Add null/undefined check
    if (!riskAnalysis || typeof riskAnalysis !== 'object') {
      return 'Low';
    }

    const highRiskCount = Object.values(riskAnalysis).filter(a => a && a.level === 'high').length;
    
    if (highRiskCount > 0) return 'High';
    if (riskAnalysis.overall?.level === 'medium') return 'Medium';
    return 'Low';
  }

  // Generate training schedule adjustments
  generateScheduleAdjustments(riskAnalysis, currentSchedule) {
    const adjustments = {
      frequency: this.adjustTrainingFrequency(riskAnalysis),
      duration: this.adjustSessionDuration(riskAnalysis),
      intensity: this.adjustTrainingIntensity(riskAnalysis),
      restDays: this.calculateRestDays(riskAnalysis)
    };

    return adjustments;
  }

  // Adjust training frequency based on risk
  adjustTrainingFrequency(riskAnalysis) {
    const overallRisk = riskAnalysis.overall.level;
    
    switch (overallRisk) {
      case 'high':
        return '2-3 sessions per week';
      case 'medium':
        return '3-4 sessions per week';
      default:
        return '4-5 sessions per week';
    }
  }

  // Adjust session duration based on risk
  adjustSessionDuration(riskAnalysis) {
    const overallRisk = riskAnalysis.overall.level;
    
    switch (overallRisk) {
      case 'high':
        return '30-45 minutes';
      case 'medium':
        return '45-60 minutes';
      default:
        return '60-90 minutes';
    }
  }

  // Adjust training intensity based on risk
  adjustTrainingIntensity(riskAnalysis) {
    const overallRisk = riskAnalysis.overall.level;
    
    switch (overallRisk) {
      case 'high':
        return 'Low intensity with focus on recovery';
      case 'medium':
        return 'Moderate intensity with injury prevention focus';
      default:
        return 'Normal intensity with performance focus';
    }
  }

  // Calculate required rest days based on risk
  calculateRestDays(riskAnalysis) {
    const highRiskCount = Object.values(riskAnalysis).filter(a => a.level === 'high').length;
    
    if (highRiskCount > 0) return '2-3 rest days between sessions';
    if (riskAnalysis.overall.level === 'medium') return '1-2 rest days between sessions';
    return '1 rest day between sessions';
  }

  // Generate long-term training plan adjustments
  generateLongTermAdjustments(historicalData, currentRisk) {
    const trends = this.analyzeTrends(historicalData);
    const adjustments = {
      shortTerm: this.generateShortTermPlan(currentRisk),
      mediumTerm: this.generateMediumTermPlan(trends, currentRisk),
      longTerm: this.generateLongTermPlan(trends, currentRisk)
    };

    return adjustments;
  }

  // Analyze trends in historical data
  analyzeTrends(historicalData) {
    if (!historicalData || historicalData.length < 3) {
      return { trend: 'insufficient_data', direction: 'stable' };
    }

    const recentData = historicalData.slice(-3);
    const riskScores = recentData.map(d => d.overallRisk || 0);
    
    const trend = riskScores[2] > riskScores[0] ? 'increasing' : 
                  riskScores[2] < riskScores[0] ? 'decreasing' : 'stable';

    return { trend, direction: trend };
  }

  // Generate short-term training plan (1-2 weeks)
  generateShortTermPlan(currentRisk) {
    return {
      duration: '1-2 weeks',
      focus: currentRisk.overall.level === 'high' ? 'Recovery and Assessment' : 'Maintenance',
      keyActions: this.getShortTermActions(currentRisk)
    };
  }

  // Generate medium-term training plan (1-2 months)
  generateMediumTermPlan(trends, currentRisk) {
    return {
      duration: '1-2 months',
      focus: trends.trend === 'increasing' ? 'Risk Reduction' : 'Performance Development',
      keyActions: this.getMediumTermActions(trends, currentRisk)
    };
  }

  // Generate long-term training plan (3-6 months)
  generateLongTermPlan(trends, currentRisk) {
    return {
      duration: '3-6 months',
      focus: 'Sustainable Performance Development',
      keyActions: this.getLongTermActions(trends, currentRisk)
    };
  }

  // Get short-term actions
  getShortTermActions(currentRisk) {
    const actions = [];
    
    if (currentRisk.overall.level === 'high') {
      actions.push('Immediate risk assessment', 'Reduce training load', 'Focus on recovery');
    } else if (currentRisk.overall.level === 'medium') {
      actions.push('Monitor progress closely', 'Adjust training intensity', 'Add prevention exercises');
    } else {
      actions.push('Maintain current training', 'Continue monitoring', 'Gradual progression');
    }

    return actions;
  }

  // Get medium-term actions
  getMediumTermActions(trends, currentRisk) {
    const actions = [];
    
    if (trends.trend === 'increasing') {
      actions.push('Implement injury prevention program', 'Regular assessments', 'Gradual intensity increase');
    } else {
      actions.push('Performance optimization', 'Skill development', 'Competition preparation');
    }

    return actions;
  }

  // Get long-term actions
  getLongTermActions(trends, currentRisk) {
    return [
      'Establish sustainable training patterns',
      'Regular health assessments',
      'Performance goal setting',
      'Long-term injury prevention strategy'
    ];
  }
}

// Assign instance to a variable before exporting as module default
const trainingPlanAdjustmentService = new TrainingPlanAdjustmentService();
export default trainingPlanAdjustmentService; 