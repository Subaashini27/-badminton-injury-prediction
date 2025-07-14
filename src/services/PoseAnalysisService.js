// Utility functions for pose analysis
// This service provides helper functions for pose detection and analysis

// Browser compatibility check
function checkBrowserCompatibility() {
  const issues = [];
  
  // Check WebGL support
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      issues.push('WebGL not supported - MediaPipe requires WebGL');
    }
  } catch (e) {
    issues.push('WebGL context creation failed');
  }
  
  // Check WebAssembly support
  if (typeof WebAssembly === 'undefined') {
    issues.push('WebAssembly not supported - MediaPipe requires WebAssembly');
  }
  
  // Check getUserMedia support
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    issues.push('Camera API not supported');
  }
  
  // Check for HTTPS (required for camera access in most browsers)
  // eslint-disable-next-line no-restricted-globals
  const isHttps = window.location.protocol === 'https:';
  // eslint-disable-next-line no-restricted-globals
  const isLocalhost = window.location.hostname === 'localhost';
  
  if (!isHttps && !isLocalhost) {
    issues.push('HTTPS required for camera access (except on localhost)');
  }
  
  return issues;
}

// Check compatibility on load
const compatibilityIssues = checkBrowserCompatibility();
if (compatibilityIssues.length > 0) {
  // console.warn('Browser compatibility issues detected:', compatibilityIssues);
} else {
  // console.log('Browser compatibility check passed');
}

// Utility class for pose analysis
class PoseAnalysisService {
  constructor() {
    this.confidenceThreshold = 0.5;
  }

  // Calculate joint angles from pose keypoints
  calculateJointAngles(pose) {
    if (!pose || !pose.keypoints) return null;

    const getKeypoint = (name) => pose.keypoints.find(kp => kp.name === name);
    
    const calculateAngle = (point1, point2, point3) => {
      if (!point1 || !point2 || !point3 || 
          point1.score < this.confidenceThreshold || 
          point2.score < this.confidenceThreshold || 
          point3.score < this.confidenceThreshold) {
        return null;
      }
      
      const vector1 = { x: point1.x - point2.x, y: point1.y - point2.y };
      const vector2 = { x: point3.x - point2.x, y: point3.y - point2.y };
      
      const dot = vector1.x * vector2.x + vector1.y * vector2.y;
      const mag1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
      const mag2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
      
      if (mag1 === 0 || mag2 === 0) return null;
      
      const cosAngle = dot / (mag1 * mag2);
      const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
      
      return angle;
    };

    const leftShoulder = getKeypoint('left_shoulder');
    const rightShoulder = getKeypoint('right_shoulder');
    const leftElbow = getKeypoint('left_elbow');
    const rightElbow = getKeypoint('right_elbow');
    const leftWrist = getKeypoint('left_wrist');
    const rightWrist = getKeypoint('right_wrist');
    const leftHip = getKeypoint('left_hip');
    const rightHip = getKeypoint('right_hip');
    const leftKnee = getKeypoint('left_knee');
    const rightKnee = getKeypoint('right_knee');
    const leftAnkle = getKeypoint('left_ankle');
    const rightAnkle = getKeypoint('right_ankle');

    return {
      leftShoulder: calculateAngle(leftElbow, leftShoulder, leftHip),
      rightShoulder: calculateAngle(rightElbow, rightShoulder, rightHip),
      leftElbow: calculateAngle(leftShoulder, leftElbow, leftWrist),
      rightElbow: calculateAngle(rightShoulder, rightElbow, rightWrist),
      leftKnee: calculateAngle(leftHip, leftKnee, leftAnkle),
      rightKnee: calculateAngle(rightHip, rightKnee, rightAnkle),
      leftHip: calculateAngle(leftShoulder, leftHip, leftKnee),
      rightHip: calculateAngle(rightShoulder, rightHip, rightKnee)
    };
  }

  // Analyze risk based on joint angles
  analyzeRisk(jointAngles) {
    if (!jointAngles) return { overall: 'low', areas: [] };

    const riskAreas = [];
    let highRiskCount = 0;
    let mediumRiskCount = 0;

    const checkAngle = (name, angle, minSafe, maxSafe, displayName) => {
      if (angle === null) return;
      
      let level = 'low';
      if (angle < minSafe || angle > maxSafe) {
        level = angle < minSafe * 0.8 || angle > maxSafe * 1.2 ? 'high' : 'medium';
        if (level === 'high') highRiskCount++;
        else mediumRiskCount++;
        
        riskAreas.push({
          area: displayName,
          angle: Math.round(angle),
          level: level
        });
      }
    };

    // Define safe angle ranges for badminton movements
    checkAngle('leftShoulder', jointAngles.leftShoulder, 80, 140, 'Left Shoulder');
    checkAngle('rightShoulder', jointAngles.rightShoulder, 80, 140, 'Right Shoulder');
    checkAngle('leftElbow', jointAngles.leftElbow, 90, 170, 'Left Elbow');
    checkAngle('rightElbow', jointAngles.rightElbow, 90, 170, 'Right Elbow');
    checkAngle('leftKnee', jointAngles.leftKnee, 120, 180, 'Left Knee');
    checkAngle('rightKnee', jointAngles.rightKnee, 120, 180, 'Right Knee');
    checkAngle('leftHip', jointAngles.leftHip, 80, 120, 'Left Hip');
    checkAngle('rightHip', jointAngles.rightHip, 80, 120, 'Right Hip');

    const overall = highRiskCount > 0 ? 'high' : mediumRiskCount > 0 ? 'medium' : 'low';

    return { overall, areas: riskAreas };
  }

  // Draw pose skeleton and keypoints
  drawPose(ctx, pose) {
    if (!pose || !pose.keypoints) return;

    // Draw skeleton connections
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 2;
    
    const connections = [
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'],
      ['left_elbow', 'left_wrist'],
      ['right_shoulder', 'right_elbow'],
      ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'],
      ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'],
      ['left_knee', 'left_ankle'],
      ['right_hip', 'right_knee'],
      ['right_knee', 'right_ankle']
    ];

    connections.forEach(([start, end]) => {
      const startPoint = pose.keypoints.find(kp => kp.name === start);
      const endPoint = pose.keypoints.find(kp => kp.name === end);
      
      if (startPoint && endPoint && startPoint.score > this.confidenceThreshold && endPoint.score > this.confidenceThreshold) {
        ctx.beginPath();
        ctx.moveTo(startPoint.x, startPoint.y);
        ctx.lineTo(endPoint.x, endPoint.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > this.confidenceThreshold) {
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 4, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  }

  // Get available cameras
  async getAvailableCameras() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error getting available cameras:', error);
      return [];
    }
  }

  // Check if full body is detected
  checkFullBodyDetection(pose) {
    if (!pose || !pose.keypoints) return false;
    
    const requiredKeypoints = [
      'left_shoulder', 'right_shoulder', 'left_hip', 'right_hip',
      'left_knee', 'right_knee', 'left_ankle', 'right_ankle'
    ];
    
    const detectedKeypoints = requiredKeypoints.filter(name => {
      const keypoint = pose.keypoints.find(kp => kp.name === name);
      return keypoint && keypoint.score > this.confidenceThreshold;
    });
    
    return detectedKeypoints.length >= 6; // At least 6 out of 8 keypoints
  }
}

// Export singleton instance
const poseAnalysisService = new PoseAnalysisService();
export default poseAnalysisService;