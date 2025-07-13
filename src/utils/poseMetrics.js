// Utility functions for calculating pose-based metrics

export const calculateTrainingLoad = (landmarks, frameHistory) => {
  if (!landmarks || !frameHistory || frameHistory.length === 0) {
    return { overallScore: 0, color: '#3498db' };
  }

  // Calculate movement intensity based on velocity and acceleration
  const movementIntensity = calculateMovementIntensity(frameHistory);
  
  // Scale the score to 0-100 range
  const overallScore = Math.min(Math.max(movementIntensity * 100, 0), 100);

  // Determine color based on score
  const color = getColorForScore(overallScore);

  return { overallScore, color };
};

export const calculateFatigueLevel = (landmarks, frameHistory) => {
  if (!landmarks || !frameHistory || frameHistory.length === 0) {
    return { level: 'Low', color: '#4CAF50', score: 0 };
  }

  // Calculate fatigue indicators
  const movementQuality = calculateMovementQuality(frameHistory);
  const postureDeviation = calculatePostureDeviation(landmarks);
  
  // Combine indicators into overall fatigue score
  const score = (movementQuality + postureDeviation) / 2;
  
  // Determine fatigue level and color
  let level, color;
  if (score > 70) {
    level = 'High';
    color = '#F44336';
  } else if (score > 30) {
    level = 'Medium';
    color = '#FF9800';
  } else {
    level = 'Low';
    color = '#4CAF50';
  }

  return { level, color, score };
};

export const calculateReadiness = (landmarks) => {
  if (!landmarks) {
    return { level: 'Medium', color: '#FF9800' };
  }

  // Calculate stability and balance scores
  const stabilityScore = calculateStabilityScore(landmarks);
  const balanceScore = calculateBalanceScore(landmarks);
  
  // Determine readiness level and color based on combined scores
  const overallScore = (stabilityScore + balanceScore) / 2;
  
  let level, color;
  if (overallScore > 70) {
    level = 'High';
    color = '#4CAF50';
  } else if (overallScore > 30) {
    level = 'Medium';
    color = '#FF9800';
  } else {
    level = 'Low';
    color = '#F44336';
  }

  return { level, color, score: overallScore };
};

export const calculateLandingMechanics = (frameHistory) => {
  if (!frameHistory || frameHistory.length === 0) {
    return { overallScore: 0 };
  }

  // Analyze landing impact and joint alignment
  const impactScore = calculateImpactScore(frameHistory);
  const alignmentScore = calculateAlignmentScore(frameHistory);
  
  // Combine scores
  const overallScore = (impactScore + alignmentScore) / 2;

  return { overallScore };
};

export const calculateFatigueIndicators = (frameHistory) => {
  if (!frameHistory || frameHistory.length === 0) {
    return {
      movementEfficiency: 0,
      postureDeviation: 0,
      overallScore: 0
    };
  }

  // Calculate movement efficiency
  const movementEfficiency = calculateMovementEfficiency(frameHistory);
  
  // Calculate posture deviation
  const postureDeviation = calculatePostureDeviationOverTime(frameHistory);
  
  // Calculate overall fatigue score
  const overallScore = (movementEfficiency + (100 - postureDeviation)) / 2;

  return {
    movementEfficiency,
    postureDeviation,
    overallScore
  };
};

// Helper functions

const calculateMovementIntensity = (frameHistory) => {
  // Calculate average velocity between frames
  let totalVelocity = 0;
  for (let i = 1; i < frameHistory.length; i++) {
    const prevFrame = frameHistory[i - 1];
    const currentFrame = frameHistory[i];
    const velocity = calculateVelocityBetweenFrames(prevFrame, currentFrame);
    totalVelocity += velocity;
  }
  return totalVelocity / (frameHistory.length - 1);
};

const calculateVelocityBetweenFrames = (prevFrame, currentFrame) => {
  if (!prevFrame || !currentFrame) return 0;
  
  // Calculate average movement of key points
  const keyPoints = [0, 11, 12, 23, 24]; // Head, shoulders, hips
  let totalVelocity = 0;
  
  keyPoints.forEach(index => {
    const prev = prevFrame.landmarks[index];
    const curr = currentFrame.landmarks[index];
    if (prev && curr) {
      const dx = curr.x - prev.x;
      const dy = curr.y - prev.y;
      const dz = curr.z - prev.z;
      totalVelocity += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
  });
  
  return totalVelocity / keyPoints.length;
};

const calculateMovementQuality = (frameHistory) => {
  // Analyze smoothness and consistency of movement
  let smoothnessScore = 100;
  for (let i = 2; i < frameHistory.length; i++) {
    const acceleration = calculateAccelerationBetweenFrames(
      frameHistory[i - 2],
      frameHistory[i - 1],
      frameHistory[i]
    );
    smoothnessScore -= Math.min(acceleration * 10, 5);
  }
  return Math.max(smoothnessScore, 0);
};

const calculateAccelerationBetweenFrames = (frame1, frame2, frame3) => {
  const vel1 = calculateVelocityBetweenFrames(frame1, frame2);
  const vel2 = calculateVelocityBetweenFrames(frame2, frame3);
  return Math.abs(vel2 - vel1);
};

const calculatePostureDeviation = (landmarks) => {
  if (!landmarks) return 0;
  
  // Calculate deviation from ideal posture
  const spineDeviation = calculateSpineAlignment(landmarks);
  const shoulderDeviation = calculateShoulderAlignment(landmarks);
  
  return (spineDeviation + shoulderDeviation) / 2;
};

const calculateSpineAlignment = (landmarks) => {
  // Check alignment of spine landmarks
  const spinePoints = [0, 11, 23, 24]; // Head, shoulders, hips
  let deviation = 0;
  
  for (let i = 1; i < spinePoints.length; i++) {
    const current = landmarks[spinePoints[i]];
    const prev = landmarks[spinePoints[i - 1]];
    if (current && prev) {
      deviation += Math.abs(current.x - prev.x) * 100;
    }
  }
  
  return Math.min(deviation * 10, 100);
};

const calculateShoulderAlignment = (landmarks) => {
  if (!landmarks[11] || !landmarks[12]) return 0;
  
  // Calculate shoulder height difference
  const heightDiff = Math.abs(landmarks[11].y - landmarks[12].y);
  return Math.min(heightDiff * 100, 100);
};

const getColorForScore = (score) => {
  if (score > 70) return '#F44336'; // Red for high intensity
  if (score > 30) return '#FF9800'; // Orange for medium intensity
  return '#4CAF50'; // Green for low intensity
};

const calculateStabilityScore = (landmarks) => {
  if (!landmarks) return 0;
  
  // Calculate stability based on key points movement
  const centerPoints = [23, 24]; // Hip points
  let stabilityScore = 100;
  
  centerPoints.forEach(index => {
    const point = landmarks[index];
    if (point) {
      stabilityScore -= Math.abs(point.x - 0.5) * 100; // Deviation from center
    }
  });
  
  return Math.max(stabilityScore, 0);
};

const calculateBalanceScore = (landmarks) => {
  if (!landmarks) return 0;
  
  // Calculate balance based on ankle and knee alignment
  const leftLeg = [23, 25, 27]; // Left hip, knee, ankle
  const rightLeg = [24, 26, 28]; // Right hip, knee, ankle
  
  const leftScore = calculateLegAlignment(landmarks, leftLeg);
  const rightScore = calculateLegAlignment(landmarks, rightLeg);
  
  return (leftScore + rightScore) / 2;
};

const calculateLegAlignment = (landmarks, legPoints) => {
  let alignmentScore = 100;
  
  for (let i = 1; i < legPoints.length; i++) {
    const current = landmarks[legPoints[i]];
    const prev = landmarks[legPoints[i - 1]];
    if (current && prev) {
      alignmentScore -= Math.abs(current.x - prev.x) * 100;
    }
  }
  
  return Math.max(alignmentScore, 0);
};

const calculateImpactScore = (frameHistory) => {
  if (frameHistory.length < 2) return 0;
  
  // Calculate vertical velocity changes
  let impactScore = 100;
  for (let i = 1; i < frameHistory.length; i++) {
    const prevFrame = frameHistory[i - 1].landmarks;
    const currentFrame = frameHistory[i].landmarks;
    
    // Check ankle and knee positions
    [27, 28].forEach(ankleIndex => {
      if (prevFrame[ankleIndex] && currentFrame[ankleIndex]) {
        const verticalVelocity = Math.abs(currentFrame[ankleIndex].y - prevFrame[ankleIndex].y);
        impactScore -= verticalVelocity * 200;
      }
    });
  }
  
  return Math.max(impactScore, 0);
};

const calculateAlignmentScore = (frameHistory) => {
  if (frameHistory.length === 0) return 0;
  
  // Calculate knee and ankle alignment during landing
  const currentFrame = frameHistory[frameHistory.length - 1].landmarks;
  let alignmentScore = 100;
  
  // Check knee alignment (should be over toes)
  [25, 26].forEach(kneeIndex => {
    const ankleIndex = kneeIndex + 2;
    if (currentFrame[kneeIndex] && currentFrame[ankleIndex]) {
      const horizontalDeviation = Math.abs(currentFrame[kneeIndex].x - currentFrame[ankleIndex].x);
      alignmentScore -= horizontalDeviation * 100;
    }
  });
  
  return Math.max(alignmentScore, 0);
};

const calculateMovementEfficiency = (frameHistory) => {
  if (frameHistory.length < 3) return 0;
  
  let efficiencyScore = 100;
  
  // Calculate movement smoothness and energy expenditure
  for (let i = 2; i < frameHistory.length; i++) {
    const acceleration = calculateAccelerationBetweenFrames(
      frameHistory[i - 2],
      frameHistory[i - 1],
      frameHistory[i]
    );
    
    // Penalize rapid changes in acceleration (jerkiness)
    efficiencyScore -= Math.min(acceleration * 15, 10);
  }
  
  return Math.max(efficiencyScore, 0);
};

const calculatePostureDeviationOverTime = (frameHistory) => {
  if (frameHistory.length === 0) return 0;
  
  let totalDeviation = 0;
  
  frameHistory.forEach(frame => {
    const deviation = calculatePostureDeviation(frame.landmarks);
    totalDeviation += deviation;
  });
  
  return totalDeviation / frameHistory.length;
}; 