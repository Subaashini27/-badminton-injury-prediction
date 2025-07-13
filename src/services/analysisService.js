import { RISK_THRESHOLDS } from '../utils/liveAnalysisUtils';

class AnalysisService {
  constructor() {
    this.metrics = [];
    this.sessionData = [];
  }

  calculateOverallScore(metrics) {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return 0;
    }

    // Calculate average of recent metrics (last 10 or all if less than 10)
    const recentMetrics = metrics.slice(-10);
    const overallScore = recentMetrics.reduce((acc, metric) => {
      const score = 100 * (1 - metric.overallRisk); // Convert risk to score (0-100)
      return acc + score;
    }, 0) / recentMetrics.length;

    return Math.round(overallScore);
  }

  calculateMetricTrend(metrics, metricName) {
    if (!metrics || !Array.isArray(metrics) || metrics.length < 2) {
      return 'stable';
    }

    const recentMetrics = metrics.slice(-5); // Look at last 5 measurements
    const firstValue = recentMetrics[0][metricName];
    const lastValue = recentMetrics[recentMetrics.length - 1][metricName];
    
    const difference = lastValue - firstValue;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'improving' : 'declining';
  }

  getPerformanceInsights(metrics) {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return [];
    }

    const insights = [];
    const latestMetric = metrics[metrics.length - 1];

    // Check knee risk
    if (latestMetric.kneeRisk > 0.6) {
      insights.push({
        type: 'warning',
        message: 'High knee stress detected. Consider adjusting your landing technique.',
        area: 'knee'
      });
    }

    // Check hip risk
    if (latestMetric.hipRisk > 0.6) {
      insights.push({
        type: 'warning',
        message: 'Hip rotation exceeds safe range. Focus on controlled movements.',
        area: 'hip'
      });
    }

    // Check shoulder risk
    if (latestMetric.shoulderRisk > 0.6) {
      insights.push({
        type: 'warning',
        message: 'Excessive shoulder rotation. Maintain proper form during overhead movements.',
        area: 'shoulder'
      });
    }

    // Check back risk
    if (latestMetric.backRisk > 0.6) {
      insights.push({
        type: 'warning',
        message: 'High back stress detected. Focus on maintaining neutral spine position.',
        area: 'back'
      });
    }

    // Add positive insights
    const goodAreas = Object.entries({
      knee: latestMetric.kneeRisk,
      hip: latestMetric.hipRisk,
      shoulder: latestMetric.shoulderRisk,
      back: latestMetric.backRisk
    }).filter(([_, risk]) => risk < 0.3);

    if (goodAreas.length > 0) {
      insights.push({
        type: 'success',
        message: `Good form maintained in ${goodAreas.map(([area]) => area).join(', ')}`,
        area: 'overall'
      });
    }

    return insights;
  }

  calculateAreaScore(metrics, area) {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return 0;
    }

    const recentMetrics = metrics.slice(-10);
    const areaRiskKey = `${area}Risk`;
    
    const score = recentMetrics.reduce((acc, metric) => {
      const areaScore = 100 * (1 - metric[areaRiskKey]); // Convert risk to score (0-100)
      return acc + areaScore;
    }, 0) / recentMetrics.length;

    return Math.round(score);
  }

  getSessionStats(metrics) {
    if (!metrics || !Array.isArray(metrics) || metrics.length === 0) {
      return {
        totalSessions: 0,
        averageScore: 0,
        bestArea: null,
        worstArea: null
      };
    }

    const areas = ['knee', 'hip', 'shoulder', 'back'];
    const areaScores = areas.map(area => ({
      area,
      score: this.calculateAreaScore(metrics, area)
    }));

    const bestArea = areaScores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    const worstArea = areaScores.reduce((worst, current) => 
      current.score < worst.score ? current : worst
    );

    return {
      totalSessions: metrics.length,
      averageScore: this.calculateOverallScore(metrics),
      bestArea: bestArea.area,
      worstArea: worstArea.area
    };
  }
}

export default new AnalysisService(); 