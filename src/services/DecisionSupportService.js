class DecisionSupportService {
  constructor() {
    this.decisionFactors = {
      riskLevel: { weight: 0.3 },
      performance: { weight: 0.25 },
      injuryHistory: { weight: 0.2 },
      trainingLoad: { weight: 0.15 },
      recovery: { weight: 0.1 }
    };

    this.actionTemplates = {
      highRisk: {
        immediate: ['Reduce training intensity', 'Schedule medical assessment', 'Focus on recovery'],
        shortTerm: ['Implement injury prevention program', 'Regular monitoring', 'Gradual progression'],
        longTerm: ['Develop sustainable training patterns', 'Regular health assessments']
      },
      mediumRisk: {
        immediate: ['Monitor closely', 'Adjust training load', 'Add prevention exercises'],
        shortTerm: ['Regular assessments', 'Gradual intensity increase', 'Skill development'],
        longTerm: ['Performance optimization', 'Competition preparation']
      },
      lowRisk: {
        immediate: ['Maintain current training', 'Continue monitoring', 'Gradual progression'],
        shortTerm: ['Performance optimization', 'Skill development', 'Competition preparation'],
        longTerm: ['Elite performance development', 'Advanced training techniques']
      }
    };
  }

  // Generate comprehensive coaching decisions based on athlete data
  generateCoachingDecisions(athleteData, teamContext = {}) {
    const analysis = this.analyzeAthleteData(athleteData);
    const recommendations = this.generateRecommendations(analysis, teamContext);
    const actions = this.generateActionPlan(analysis, recommendations);
    const priorities = this.prioritizeActions(actions);

    return {
      analysis,
      recommendations,
      actions,
      priorities,
      confidence: this.calculateConfidence(analysis),
      timeline: this.generateTimeline(priorities)
    };
  }

  // Analyze athlete data comprehensively
  analyzeAthleteData(athleteData) {
    const analysis = {
      riskAssessment: this.assessRisk(athleteData),
      performanceAnalysis: this.analyzePerformance(athleteData),
      injuryRisk: this.assessInjuryRisk(athleteData),
      trainingLoad: this.assessTrainingLoad(athleteData),
      recoveryStatus: this.assessRecovery(athleteData),
      overallScore: 0
    };

    // Calculate overall decision score
    analysis.overallScore = this.calculateOverallScore(analysis);
    analysis.priority = this.determinePriority(analysis.overallScore);

    return analysis;
  }

  // Assess current risk levels
  assessRisk(athleteData) {
    const metrics = athleteData.metrics || {};
    const riskFactors = {};

    // Analyze joint-specific risks
    if (metrics.kneeAngle !== undefined) {
      riskFactors.knee = this.calculateJointRisk(metrics.kneeAngle, { low: 150, medium: 170, high: 180 });
    }
    if (metrics.hipRotation !== undefined) {
      riskFactors.hip = this.calculateJointRisk(metrics.hipRotation, { low: 80, medium: 90, high: 100 });
    }
    if (metrics.shoulderRotation !== undefined) {
      riskFactors.shoulder = this.calculateJointRisk(metrics.shoulderRotation, { low: 80, medium: 100, high: 120 });
    }
    if (metrics.elbowBend !== undefined) {
      riskFactors.elbow = this.calculateJointRisk(metrics.elbowBend, { low: 140, medium: 160, high: 170 });
    }

    // Calculate overall risk
    const riskValues = Object.values(riskFactors).map(r => r.percentage);
    const overallRisk = riskValues.length > 0 ? riskValues.reduce((a, b) => a + b, 0) / riskValues.length : 0;

    return {
      factors: riskFactors,
      overall: {
        level: this.getRiskLevel(overallRisk),
        percentage: overallRisk,
        trend: this.analyzeRiskTrend(athleteData.historicalData)
      }
    };
  }

  // Calculate joint-specific risk
  calculateJointRisk(value, thresholds) {
    if (value <= thresholds.low) return { level: 'low', percentage: 0 };
    if (value >= thresholds.high) return { level: 'high', percentage: 100 };
    
    const range = thresholds.high - thresholds.low;
    const position = value - thresholds.low;
    const percentage = Math.min(100, (position / range) * 100);
    
    return {
      level: percentage > 50 ? 'high' : percentage > 25 ? 'medium' : 'low',
      percentage
    };
  }

  // Get risk level from percentage
  getRiskLevel(percentage) {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  }

  // Analyze risk trends from historical data
  analyzeRiskTrend(historicalData) {
    if (!historicalData || historicalData.length < 3) return 'insufficient_data';

    const recentData = historicalData.slice(-3);
    const riskScores = recentData.map(d => d.overallRisk || 0);
    
    if (riskScores[2] > riskScores[0] * 1.1) return 'increasing';
    if (riskScores[2] < riskScores[0] * 0.9) return 'decreasing';
    return 'stable';
  }

  // Analyze performance metrics
  analyzePerformance(athleteData) {
    const performance = athleteData.performance || {};
    const analysis = {
      current: this.calculatePerformanceScore(performance),
      trend: this.analyzePerformanceTrend(athleteData.historicalData),
      areas: this.identifyPerformanceAreas(performance)
    };

    return analysis;
  }

  // Calculate performance score
  calculatePerformanceScore(performance) {
    const metrics = [
      performance.shotQuality || 0,
      performance.movementEfficiency || 0,
      performance.consistency || 0,
      performance.stamina || 0
    ];

    return metrics.reduce((a, b) => a + b, 0) / metrics.length;
  }

  // Analyze performance trends
  analyzePerformanceTrend(historicalData) {
    if (!historicalData || historicalData.length < 3) return 'insufficient_data';

    const recentData = historicalData.slice(-3);
    const performanceScores = recentData.map(d => d.performanceScore || 0);
    
    if (performanceScores[2] > performanceScores[0] * 1.05) return 'improving';
    if (performanceScores[2] < performanceScores[0] * 0.95) return 'declining';
    return 'stable';
  }

  // Identify performance areas
  identifyPerformanceAreas(performance) {
    const areas = [];
    
    if ((performance.shotQuality || 0) < 70) areas.push('Shot Quality');
    if ((performance.movementEfficiency || 0) < 70) areas.push('Movement Efficiency');
    if ((performance.consistency || 0) < 70) areas.push('Consistency');
    if ((performance.stamina || 0) < 70) areas.push('Stamina');

    return areas;
  }

  // Assess injury risk based on history and current state
  assessInjuryRisk(athleteData) {
    const injuryHistory = athleteData.injuryHistory || [];
    const currentMetrics = athleteData.metrics || {};
    
    const riskFactors = {
      recentInjuries: injuryHistory.filter(i => 
        new Date(i.date) > new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
      ).length,
      highRiskMovements: this.countHighRiskMovements(currentMetrics),
      recoveryStatus: this.assessRecoveryStatus(athleteData)
    };

    const injuryRisk = (riskFactors.recentInjuries * 0.4 + 
                       riskFactors.highRiskMovements * 0.4 + 
                       riskFactors.recoveryStatus * 0.2);

    return {
      factors: riskFactors,
      overall: Math.min(100, injuryRisk * 100),
      level: this.getRiskLevel(injuryRisk * 100)
    };
  }

  // Count high-risk movements
  countHighRiskMovements(metrics) {
    let count = 0;
    if (metrics.kneeAngle > 170) count++;
    if (metrics.hipRotation > 90) count++;
    if (metrics.shoulderRotation > 100) count++;
    if (metrics.elbowBend > 160) count++;
    return count;
  }

  // Assess recovery status
  assessRecoveryStatus(athleteData) {
    const recovery = athleteData.recovery || {};
    const factors = [
      recovery.sleepQuality || 0,
      recovery.stressLevel || 0,
      recovery.nutrition || 0,
      recovery.hydration || 0
    ];

    return factors.reduce((a, b) => a + b, 0) / factors.length;
  }

  // Assess training load
  assessTrainingLoad(athleteData) {
    const training = athleteData.training || {};
    const load = {
      intensity: training.intensity || 0,
      volume: training.volume || 0,
      frequency: training.frequency || 0
    };

    const loadScore = (load.intensity * 0.4 + load.volume * 0.4 + load.frequency * 0.2);
    
    return {
      current: loadScore,
      level: loadScore > 80 ? 'high' : loadScore > 60 ? 'medium' : 'low',
      sustainable: loadScore <= 70
    };
  }

  // Assess recovery status
  assessRecovery(athleteData) {
    const recovery = athleteData.recovery || {};
    const factors = {
      sleep: recovery.sleepHours || 0,
      stress: recovery.stressLevel || 0,
      nutrition: recovery.nutritionQuality || 0,
      hydration: recovery.hydrationLevel || 0
    };

    const recoveryScore = Object.values(factors).reduce((a, b) => a + b, 0) / Object.values(factors).length;
    
    return {
      score: recoveryScore,
      level: recoveryScore > 80 ? 'excellent' : recoveryScore > 60 ? 'good' : recoveryScore > 40 ? 'fair' : 'poor',
      factors
    };
  }

  // Calculate overall decision score
  calculateOverallScore(analysis) {
    const scores = {
      risk: 100 - analysis.riskAssessment.overall.percentage,
      performance: analysis.performanceAnalysis.current,
      injury: 100 - analysis.injuryRisk.overall,
      training: analysis.trainingLoad.sustainable ? 80 : 40,
      recovery: analysis.recoveryStatus.score
    };

    return Object.entries(scores).reduce((total, [factor, score]) => {
      return total + (score * this.decisionFactors[factor].weight);
    }, 0);
  }

  // Determine priority level
  determinePriority(score) {
    if (score < 40) return 'critical';
    if (score < 60) return 'high';
    if (score < 80) return 'medium';
    return 'low';
  }

  // Generate recommendations based on analysis
  generateRecommendations(analysis, teamContext) {
    const recommendations = [];

    // Risk-based recommendations
    if (analysis.riskAssessment.overall.level === 'high') {
      recommendations.push({
        type: 'risk_management',
        priority: 'high',
        title: 'Immediate Risk Reduction Required',
        description: 'High injury risk detected. Immediate action needed to prevent injuries.',
        actions: this.actionTemplates.highRisk.immediate,
        timeline: 'immediate'
      });
    }

    // Performance-based recommendations
    if (analysis.performanceAnalysis.current < 70) {
      recommendations.push({
        type: 'performance_improvement',
        priority: 'medium',
        title: 'Performance Enhancement Needed',
        description: 'Performance below optimal levels. Focus on skill development and training optimization.',
        actions: [
          'Implement targeted skill training',
          'Optimize training intensity',
          'Focus on weak performance areas',
          'Regular performance assessments'
        ],
        timeline: 'short_term'
      });
    }

    // Training load recommendations
    if (!analysis.trainingLoad.sustainable) {
      recommendations.push({
        type: 'training_load',
        priority: 'high',
        title: 'Training Load Adjustment Required',
        description: 'Current training load is not sustainable. Adjust to prevent overtraining.',
        actions: [
          'Reduce training intensity',
          'Increase recovery periods',
          'Implement periodization',
          'Monitor training response'
        ],
        timeline: 'immediate'
      });
    }

    // Recovery recommendations
    if (analysis.recoveryStatus.level === 'poor' || analysis.recoveryStatus.level === 'fair') {
      recommendations.push({
        type: 'recovery_optimization',
        priority: 'medium',
        title: 'Recovery Optimization Needed',
        description: 'Recovery practices need improvement to support optimal performance.',
        actions: [
          'Improve sleep quality and duration',
          'Implement stress management techniques',
          'Optimize nutrition and hydration',
          'Add active recovery sessions'
        ],
        timeline: 'short_term'
      });
    }

    // Team context recommendations
    if (teamContext.teamRisk && teamContext.teamRisk > 60) {
      recommendations.push({
        type: 'team_management',
        priority: 'medium',
        title: 'Team Risk Management',
        description: 'Team has elevated injury risk. Implement team-wide prevention strategies.',
        actions: [
          'Team-wide injury prevention program',
          'Regular team assessments',
          'Adjust team training schedules',
          'Implement recovery protocols'
        ],
        timeline: 'short_term'
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  // Generate action plan
  generateActionPlan(analysis, recommendations) {
    const actions = {
      immediate: [],
      shortTerm: [],
      longTerm: []
    };

    recommendations.forEach(rec => {
      if (rec.timeline === 'immediate') {
        actions.immediate.push(...rec.actions);
      } else if (rec.timeline === 'short_term') {
        actions.shortTerm.push(...rec.actions);
      } else {
        actions.longTerm.push(...rec.actions);
      }
    });

    return actions;
  }

  // Prioritize actions
  prioritizeActions(actions) {
    const priorities = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };

    // Categorize actions by priority
    Object.entries(actions).forEach(([timeline, actionList]) => {
      actionList.forEach(action => {
        if (timeline === 'immediate') {
          priorities.critical.push(action);
        } else if (timeline === 'short_term') {
          priorities.high.push(action);
        } else {
          priorities.medium.push(action);
        }
      });
    });

    return priorities;
  }

  // Calculate confidence in recommendations
  calculateConfidence(analysis) {
    const factors = [
      analysis.riskAssessment.overall.percentage > 0 ? 1 : 0,
      analysis.performanceAnalysis.current > 0 ? 1 : 0,
      analysis.injuryRisk.overall > 0 ? 1 : 0,
      analysis.trainingLoad.current > 0 ? 1 : 0,
      analysis.recoveryStatus.score > 0 ? 1 : 0
    ];

    const dataQuality = factors.reduce((a, b) => a + b, 0) / factors.length;
    const consistency = this.assessRecommendationConsistency(analysis);
    
    return Math.round((dataQuality * 0.7 + consistency * 0.3) * 100);
  }

  // Assess recommendation consistency
  assessRecommendationConsistency(analysis) {
    const riskLevel = analysis.riskAssessment.overall.level;
    const performanceLevel = analysis.performanceAnalysis.current > 70 ? 'high' : 'low';
    const trainingLevel = analysis.trainingLoad.level;
    const recoveryLevel = analysis.recoveryStatus.level;

    // Check if recommendations are consistent across factors
    const factors = [riskLevel, performanceLevel, trainingLevel, recoveryLevel];
    const highRiskFactors = factors.filter(f => f === 'high' || f === 'poor').length;
    
    return highRiskFactors > 2 ? 0.8 : highRiskFactors > 1 ? 0.6 : 0.4;
  }

  // Generate timeline for actions
  generateTimeline(priorities) {
    return {
      immediate: {
        duration: '0-24 hours',
        actions: priorities.critical,
        focus: 'Risk mitigation and immediate safety'
      },
      shortTerm: {
        duration: '1-4 weeks',
        actions: priorities.high,
        focus: 'Performance optimization and injury prevention'
      },
      mediumTerm: {
        duration: '1-3 months',
        actions: priorities.medium,
        focus: 'Skill development and long-term planning'
      },
      longTerm: {
        duration: '3-12 months',
        actions: priorities.low,
        focus: 'Elite performance development'
      }
    };
  }

  // Generate team-level decisions
  generateTeamDecisions(teamData) {
    const teamAnalysis = {
      overallRisk: this.calculateTeamRisk(teamData),
      performanceTrends: this.analyzeTeamPerformance(teamData),
      injuryPatterns: this.analyzeInjuryPatterns(teamData),
      recommendations: this.generateTeamRecommendations(teamData)
    };

    return teamAnalysis;
  }

  // Calculate team risk
  calculateTeamRisk(teamData) {
    const athletes = teamData.athletes || [];
    const riskScores = athletes.map(a => a.riskLevel || 0);
    
    return {
      average: riskScores.reduce((a, b) => a + b, 0) / riskScores.length,
      highRiskCount: riskScores.filter(r => r > 70).length,
      distribution: {
        high: riskScores.filter(r => r > 70).length,
        medium: riskScores.filter(r => r > 40 && r <= 70).length,
        low: riskScores.filter(r => r <= 40).length
      }
    };
  }

  // Analyze team performance
  analyzeTeamPerformance(teamData) {
    const athletes = teamData.athletes || [];
    const performanceScores = athletes.map(a => a.performance || 0);
    
    return {
      average: performanceScores.reduce((a, b) => a + b, 0) / performanceScores.length,
      trend: this.calculateTeamTrend(performanceScores),
      consistency: this.calculateTeamConsistency(performanceScores)
    };
  }

  // Analyze injury patterns
  analyzeInjuryPatterns(teamData) {
    const injuries = teamData.injuries || [];
    
    return {
      total: injuries.length,
      byType: this.groupInjuriesByType(injuries),
      bySeverity: this.groupInjuriesBySeverity(injuries),
      trends: this.analyzeInjuryTrends(injuries)
    };
  }

  // Generate team recommendations
  generateTeamRecommendations(teamData) {
    const recommendations = [];
    const teamRisk = this.calculateTeamRisk(teamData);

    if (teamRisk.average > 60) {
      recommendations.push({
        type: 'team_risk_reduction',
        priority: 'high',
        title: 'Team Risk Reduction Program',
        description: 'Implement team-wide injury prevention strategies',
        actions: [
          'Team-wide injury prevention workshops',
          'Regular team assessments',
          'Adjust training schedules',
          'Implement recovery protocols'
        ]
      });
    }

    return recommendations;
  }

  // Helper methods for team analysis
  calculateTeamTrend(scores) {
    if (scores.length < 3) return 'insufficient_data';
    
    const recent = scores.slice(-3);
    if (recent[2] > recent[0] * 1.05) return 'improving';
    if (recent[2] < recent[0] * 0.95) return 'declining';
    return 'stable';
  }

  calculateTeamConsistency(scores) {
    if (scores.length < 2) return 0;
    
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length;
    const stdDev = Math.sqrt(variance);
    
    return Math.max(0, 100 - (stdDev / mean) * 100);
  }

  groupInjuriesByType(injuries) {
    return injuries.reduce((groups, injury) => {
      const type = injury.type || 'unknown';
      groups[type] = (groups[type] || 0) + 1;
      return groups;
    }, {});
  }

  groupInjuriesBySeverity(injuries) {
    return injuries.reduce((groups, injury) => {
      const severity = injury.severity || 'unknown';
      groups[severity] = (groups[severity] || 0) + 1;
      return groups;
    }, {});
  }

  analyzeInjuryTrends(injuries) {
    if (injuries.length < 3) return 'insufficient_data';
    
    const recentInjuries = injuries.filter(i => 
      new Date(i.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    
    return recentInjuries.length > injuries.length * 0.3 ? 'increasing' : 'stable';
  }
}

// Assign instance to a variable before exporting as module default
const decisionSupportService = new DecisionSupportService();
export default decisionSupportService; 