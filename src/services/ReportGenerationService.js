import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

class ReportGenerationService {
  constructor() {
    this.reportTemplates = {
      injury: this.generateInjuryReport,
      performance: this.generatePerformanceReport,
      team: this.generateTeamReport,
      training: this.generateTrainingReport
    };
  }

  // Generate comprehensive injury report
  async generateInjuryReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Injury Risk Assessment Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Date and time
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, yPosition);
    yPosition += 10;

    // Athlete information
    if (data.athlete) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Athlete Information', 20, yPosition);
      yPosition += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Name: ${data.athlete.name}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Age: ${data.athlete.age}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Experience Level: ${data.athlete.experience}`, 20, yPosition);
      yPosition += 10;
    }

    // Risk assessment summary
    if (data.riskAssessment) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Risk Assessment Summary', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const riskLevel = data.riskAssessment.overall || 'Unknown';
      const riskColor = riskLevel === 'High' ? '#FF0000' : riskLevel === 'Medium' ? '#FFA500' : '#00FF00';
      
      doc.setTextColor(riskColor);
      doc.text(`Overall Risk Level: ${riskLevel}`, 20, yPosition);
      yPosition += 6;
      
      doc.setTextColor('#000000');
      doc.text(`Risk Score: ${data.riskAssessment.score || 'N/A'}/100`, 20, yPosition);
      yPosition += 10;
    }

    // Detailed metrics
    if (data.metrics) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Metrics', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const metrics = [
        { name: 'Knee Angle', value: data.metrics.kneeAngle, unit: '°' },
        { name: 'Hip Rotation', value: data.metrics.hipRotation, unit: '°' },
        { name: 'Shoulder Rotation', value: data.metrics.shoulderRotation, unit: '°' },
        { name: 'Elbow Bend', value: data.metrics.elbowBend, unit: '°' }
      ];

      metrics.forEach(metric => {
        if (metric.value !== undefined) {
          doc.text(`${metric.name}: ${metric.value}${metric.unit}`, 20, yPosition);
          yPosition += 6;
        }
      });
      yPosition += 5;
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      data.recommendations.forEach((rec, index) => {
        const text = `${index + 1}. ${rec.title}: ${rec.description}`;
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        
        if (yPosition + lines.length * 5 > pageHeight - 20) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 2;
      });
    }

    // Historical data
    if (data.historicalData && data.historicalData.length > 0) {
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = 20;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Historical Trends', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const recentData = data.historicalData.slice(-5); // Last 5 entries
      recentData.forEach(entry => {
        const text = `${entry.date}: Risk Score ${entry.riskScore}`;
        doc.text(text, 20, yPosition);
        yPosition += 6;
      });
    }

    return doc;
  }

  // Generate team performance report
  async generateTeamReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Team Performance Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Team statistics
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Team Statistics', 20, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    if (data.teamStats) {
      doc.text(`Total Athletes: ${data.teamStats.totalAthletes}`, 20, yPosition);
      yPosition += 6;
      doc.text(`High Risk Athletes: ${data.teamStats.highRisk}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Average Risk Score: ${data.teamStats.averageRisk}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Active Injuries: ${data.teamStats.activeInjuries}`, 20, yPosition);
      yPosition += 10;
    }

    // Individual athlete performance
    if (data.athletes && data.athletes.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Individual Athlete Performance', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      data.athletes.forEach(athlete => {
        const text = `${athlete.name}: ${athlete.riskLevel} Risk (${athlete.performance}% performance)`;
        doc.text(text, 20, yPosition);
        yPosition += 6;
      });
    }

    return doc;
  }

  // Generate training plan report
  async generateTrainingReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Training Plan Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Training plan details
    if (data.trainingPlan) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Current Training Plan', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Plan Name: ${data.trainingPlan.name}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Duration: ${data.trainingPlan.duration}`, 20, yPosition);
      yPosition += 6;
      doc.text(`Intensity: ${data.trainingPlan.intensity}`, 20, yPosition);
      yPosition += 10;
    }

    // AI recommendations
    if (data.aiRecommendations && data.aiRecommendations.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('AI-Generated Recommendations', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      data.aiRecommendations.forEach((rec, index) => {
        const text = `${index + 1}. ${rec.title}: ${rec.description}`;
        const lines = doc.splitTextToSize(text, pageWidth - 40);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 2;
      });
    }

    return doc;
  }

  // Generate performance report
  async generatePerformanceReport(data) {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Performance Analysis Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Performance metrics
    if (data.performanceMetrics) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Performance Metrics', 20, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      Object.entries(data.performanceMetrics).forEach(([key, value]) => {
        doc.text(`${key}: ${value}`, 20, yPosition);
        yPosition += 6;
      });
    }

    return doc;
  }

  // Main method to generate any type of report
  async generateReport(type, data) {
    try {
      const template = this.reportTemplates[type];
      if (!template) {
        throw new Error(`Unknown report type: ${type}`);
      }

      const doc = await template.call(this, data);
      return doc;
    } catch (error) {
      // Remove console.error for production
    }
  }

  // Export report as PDF
  async exportToPDF(reportType, data, filename = null) {
    try {
      const doc = await this.generateReport(reportType, data);
      
      if (!filename) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        filename = `${reportType}_report_${timestamp}.pdf`;
      }

      doc.save(filename);
      return filename;
    } catch (error) {
      // Remove console.error for production
    }
  }

  // Schedule automated reports
  scheduleReport(reportType, data, schedule = 'weekly') {
    const schedules = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    const interval = schedules[schedule] || schedules.weekly;
    
    return setInterval(async () => {
      try {
        await this.exportToPDF(reportType, data);
        // Remove console.log for production
      } catch (error) {
        // Remove console.error for production
      }
    }, interval);
  }
}

export default new ReportGenerationService(); 