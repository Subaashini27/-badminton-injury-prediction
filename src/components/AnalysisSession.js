import React, { useRef, useEffect } from 'react';

// Helper function to calculate the angle at a joint given three points
function calculateAngle(A, B, C) {
  // A, B, C are {x, y} objects. B is the vertex.
  const AB = { x: A.x - B.x, y: A.y - B.y };
  const CB = { x: C.x - B.x, y: C.y - B.y };
  const dot = AB.x * CB.x + AB.y * CB.y;
  const magAB = Math.sqrt(AB.x * AB.x + AB.y * AB.y);
  const magCB = Math.sqrt(CB.x * CB.x + CB.y * CB.y);
  const angleRad = Math.acos(dot / (magAB * magCB));
  return Math.round((angleRad * 180) / Math.PI);
}

// Helper function to assess risk based on angle and joint type
function getAngleRisk(joint, angle) {
  // Example thresholds (customize as needed)
  if (joint === 'knee') {
    if (angle > 170) return 'High Risk';
    if (angle > 150) return 'Medium Risk';
    return 'Safe';
  }
  if (joint === 'hip') {
    if (angle > 120) return 'High Risk';
    if (angle > 100) return 'Medium Risk';
    return 'Safe';
  }
  if (joint === 'shoulder') {
    if (angle > 120) return 'High Risk';
    if (angle > 90) return 'Medium Risk';
    return 'Safe';
  }
  if (joint === 'elbow') {
    if (angle > 160) return 'High Risk';
    if (angle > 140) return 'Medium Risk';
    return 'Safe';
  }
  return 'Safe';
}

// Helper function to get color for risk
function getRiskColor(risk) {
  if (risk === 'High Risk') return 'red';
  if (risk === 'Medium Risk') return 'orange';
  return 'green';
}

const AnalysisSession = ({ 
  isAnalyzing, 
  timeRemaining, 
  onEndAnalysis, 
  poseAnalysisService 
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Add video element load handler
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', () => {
        if (canvasRef.current) {
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
        }
      });
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('loadedmetadata', () => {});
      }
    };
  }, []);

  // Draw pose on canvas, including angles and risk
  const drawPose = (pose) => {
    if (!canvasRef.current || !videoRef.current || videoRef.current.readyState !== 4) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Draw keypoints
    pose.keypoints.forEach(keypoint => {
      if (keypoint.score > 0.3) {
        ctx.beginPath();
        ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
      }
    });

    // Draw skeleton
    drawSkeleton(ctx, pose.keypoints);

    // --- Calculate and draw angles with risk label ---
    // Map keypoints by name for easy access
    const kp = {};
    pose.keypoints.forEach(k => { kp[k.name] = k; });

    // Calculate angles for left and right joints
    const joints = [
      {
        name: 'knee',
        left: ['left_hip', 'left_knee', 'left_ankle'],
        right: ['right_hip', 'right_knee', 'right_ankle']
      },
      {
        name: 'hip',
        left: ['left_shoulder', 'left_hip', 'left_knee'],
        right: ['right_shoulder', 'right_hip', 'right_knee']
      },
      {
        name: 'shoulder',
        left: ['left_elbow', 'left_shoulder', 'left_hip'],
        right: ['right_elbow', 'right_shoulder', 'right_hip']
      },
      {
        name: 'elbow',
        left: ['left_shoulder', 'left_elbow', 'left_wrist'],
        right: ['right_shoulder', 'right_elbow', 'right_wrist']
      }
    ];

    joints.forEach(joint => {
      ['left', 'right'].forEach(side => {
        const [A, B, C] = joint[side].map(j => kp[j]);
        if (A && B && C && A.score > 0.3 && B.score > 0.3 && C.score > 0.3) {
          const angle = calculateAngle(A, B, C);
          const risk = getAngleRisk(joint.name, angle);
          const color = getRiskColor(risk);
          // Draw the angle value near the joint
          ctx.font = '16px Arial';
          ctx.fillStyle = color;
          ctx.fillText(`${angle}°`, B.x + 10, B.y - 10);
          // Draw the risk label below the angle
          ctx.font = 'bold 14px Arial';
          ctx.fillText(risk, B.x + 10, B.y + 10);
          // Optionally, draw a colored circle to highlight risk
          ctx.beginPath();
          ctx.arc(B.x, B.y, 10, 0, 2 * Math.PI);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    });
    // --- End angle/risk overlay ---
  };
  
  // Draw pose skeleton (unchanged)
  const drawSkeleton = (ctx, keypoints) => {
    const connections = [
      ['nose', 'left_eye'], ['nose', 'right_eye'],
      ['left_eye', 'left_ear'], ['right_eye', 'right_ear'],
      ['left_shoulder', 'right_shoulder'],
      ['left_shoulder', 'left_elbow'], ['right_shoulder', 'right_elbow'],
      ['left_elbow', 'left_wrist'], ['right_elbow', 'right_wrist'],
      ['left_shoulder', 'left_hip'], ['right_shoulder', 'right_hip'],
      ['left_hip', 'right_hip'],
      ['left_hip', 'left_knee'], ['right_hip', 'right_knee'],
      ['left_knee', 'left_ankle'], ['right_knee', 'right_ankle']
    ];
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    connections.forEach(([p1Name, p2Name]) => {
      const p1 = keypoints.find(kp => kp.name === p1Name);
      const p2 = keypoints.find(kp => kp.name === p2Name);
      if (p1 && p2 && p1.score > 0.3 && p2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      }
    });
  };

  if (!isAnalyzing) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <h2 className="text-lg font-semibold mb-4">
        Analyzing Performance... {timeRemaining}s remaining
      </h2>
      <div className="relative mb-4">
        <video 
          ref={videoRef} 
          width={640}
          height={480}
          className="rounded"
          style={{ display: 'block' }}
          playsInline
          muted
          autoPlay
        />
        <canvas 
          ref={canvasRef} 
          width={640}
          height={480}
          className="absolute top-0 left-0"
        />
      </div>
      <div className="flex justify-between">
        <button 
          onClick={onEndAnalysis} 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          End Analysis Early
        </button>
        <div className="text-gray-500">
          Move around and perform badminton shots
        </div>
      </div>
    </div>
  );
};

export default AnalysisSession; 