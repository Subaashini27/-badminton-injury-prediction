// Risk thresholds for different joint types
export const RISK_THRESHOLDS = {
  low: 0.3,
  medium: 0.6,
  high: 0.8
};

// Joint angle thresholds for risk assessment
export const JOINT_THRESHOLDS = {
  knee: { safe: 140, medium: 160, high: 180 },
  hip: { safe: 80, medium: 90, high: 100 },
  shoulder: { safe: 90, medium: 110, high: 130 },
  elbow: { safe: 160, medium: 170, high: 180 }
};

// Get risk level for a given joint angle
export const getRiskLevel = (value, type) => {
  const threshold = JOINT_THRESHOLDS[type];
  if (!threshold || value === undefined || value === null) return 'Safe';
  
  if (value <= threshold.safe) return 'Safe';
  if (value <= threshold.medium) return 'Medium Risk';
  return 'High Risk';
};

// Get color class for risk level
export const getRiskColor = (riskLevel) => {
  switch (riskLevel) {
    case 'High Risk':
      return 'text-red-600 font-medium';
    case 'Medium Risk':
      return 'text-yellow-600 font-medium';
    default:
      return 'text-green-600 font-medium';
  }
};

// Get background color for risk level bars
export const getRiskBackgroundColor = (value, type) => {
  const risk = getRiskLevel(value, type);
  switch (risk) {
    case 'High Risk':
      return 'bg-red-600';
    case 'Medium Risk':
      return 'bg-yellow-500';
    default:
      return 'bg-green-500';
  }
};

// Validate if a metric value is valid
export const isValidMetric = (value) => {
  return value !== undefined && value !== null && !isNaN(value) && value >= 0;
};

// Format metric value for display
export const formatMetric = (value) => {
  return value ? Math.round(value) : 0;
};

// Check if at least one metric is valid
export const hasValidMetrics = (metrics) => {
  if (!metrics) return false;
  return (
    isValidMetric(metrics.kneeAngle) ||
    isValidMetric(metrics.hipRotation) ||
    isValidMetric(metrics.shoulderRotation) ||
    isValidMetric(metrics.elbowBend)
  );
};

// Default initial metrics
export const INITIAL_METRICS = {
  kneeAngle: 0,
  hipRotation: 0,
  shoulderRotation: 0,
  elbowBend: 0
};

// Camera constraints for different quality levels
export const CAMERA_CONSTRAINTS = {
  high: {
    video: {
      width: { ideal: 1920, min: 1280 },
      height: { ideal: 1080, min: 720 },
      facingMode: 'user'
    }
  },
  medium: {
    video: {
      width: { ideal: 1280, min: 640 },
      height: { ideal: 720, min: 480 },
      facingMode: 'user'
    }
  },
  low: {
    video: {
      width: { ideal: 640, min: 320 },
      height: { ideal: 480, min: 240 },
      facingMode: 'user'
    }
  }
};
