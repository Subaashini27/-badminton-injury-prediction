import React, { useRef, useEffect, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

const connections = [
  [11, 13], [13, 15], [12, 14], [14, 16], // arms
  [11, 12], [23, 24], // shoulders/hips
  [11, 23], [12, 24], // torso
  [23, 25], [25, 27], [24, 26], [26, 28], // legs
  [27, 29], [29, 31], [28, 30], [30, 32] // lower legs/feet
];

const keypointNames = [
  'nose', 'left_eye_inner', 'left_eye', 'left_eye_outer', 'right_eye_inner', 'right_eye', 'right_eye_outer',
  'left_ear', 'right_ear', 'mouth_left', 'mouth_right',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow', 'left_wrist', 'right_wrist',
  'left_pinky', 'right_pinky', 'left_index', 'right_index', 'left_thumb', 'right_thumb',
  'left_hip', 'right_hip', 'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
  'left_heel', 'right_heel', 'left_foot_index', 'right_foot_index'
];

const RISK_COLORS = {
  high: '#ff0000',
  medium: '#ffd600',
  low: '#00c853'
};

function getRiskLevel(angle, min, max) {
  if (angle == null) return 'low';
  if (angle < min * 0.8 || angle > max * 1.2) return 'high';
  if (angle < min || angle > max) return 'medium';
  return 'low';
}

function calculateAngle(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.sqrt(ab.x * ab.x + ab.y * ab.y);
  const magCB = Math.sqrt(cb.x * cb.x + cb.y * cb.y);
  if (magAB === 0 || magCB === 0) return null;
  let angle = Math.acos(dot / (magAB * magCB));
  return angle * (180 / Math.PI);
}

const MediaPipeClassicAnalysis = ({
  mode = 'camera',
  onModeChange,
  className = '',
  onRiskUpdate,
}) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const poseRef = useRef(null);
  const streamRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [risk, setRisk] = useState({});
  const [videoFile, setVideoFile] = useState(null);

  // Minimal fix: always cleanup before starting new analysis
  const stopAnalysis = () => {
    if (poseRef.current) {
      poseRef.current.close();
      poseRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = '';
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx && ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setIsLoading(false);
    setError(null);
    setVideoFile(null);
  };

  useEffect(() => {
    stopAnalysis();
    if (mode === 'camera') {
      startCamera();
    }
    // For video mode, wait for user to upload
    // eslint-disable-next-line
  }, [mode]);

  const startCamera = async () => {
    stopAnalysis();
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play();
          initPose();
        };
      }
    } catch (err) {
      setError('Failed to access camera: ' + err.message);
      setIsLoading(false);
    }
  };

  const handleVideoUpload = (e) => {
    stopAnalysis();
    setIsLoading(true);
    setError(null);
    const file = e.target.files[0];
    if (!file) return setIsLoading(false);
    setVideoFile(file);
    const url = URL.createObjectURL(file);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.src = url;
      videoRef.current.onloadeddata = () => {
        videoRef.current.play();
        initPose();
      };
      videoRef.current.onerror = () => setError('Failed to load video.');
    }
  };

  const initPose = () => {
    if (poseRef.current) poseRef.current.close();
    const pose = new Pose({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.5.1675469404/${file}`
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    pose.onResults(onResults);
    poseRef.current = pose;
    runPoseDetection();
  };

  const runPoseDetection = async () => {
    if (!videoRef.current || !poseRef.current) return;
    setIsLoading(false);
    const detect = async () => {
      if (
        !videoRef.current ||
        videoRef.current.paused ||
        videoRef.current.ended ||
        videoRef.current.videoWidth === 0 ||
        videoRef.current.videoHeight === 0
      ) {
        requestAnimationFrame(detect);
        return;
      }
      try {
        await poseRef.current.send({ image: videoRef.current });
      } catch (err) {
        // Optionally log or handle error
      }
      requestAnimationFrame(detect);
    };
    detect();
  };

  const onResults = (results) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Always match canvas size to video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    if (results.poseLandmarks) {
      drawConnectors(ctx, results.poseLandmarks, connections, '#00ff00');
      drawLandmarks(ctx, results.poseLandmarks, { color: '#ff0000', lineWidth: 2 });
      // Risk calculation (shoulders, elbows, hips, knees)
      const kp = results.poseLandmarks;
      const riskLevels = {
        shoulders: getRiskLevel(calculateAngle(kp[13], kp[11], kp[23]), 80, 140),
        elbows: getRiskLevel(calculateAngle(kp[11], kp[13], kp[15]), 90, 170),
        hips: getRiskLevel(calculateAngle(kp[11], kp[23], kp[25]), 80, 120),
        knees: getRiskLevel(calculateAngle(kp[23], kp[25], kp[27]), 120, 180)
      };
      setRisk(riskLevels);
      if (onRiskUpdate) onRiskUpdate(riskLevels);
    }
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Blue Info Bar */}
      <div className="bg-blue-100 text-blue-900 px-4 py-2 rounded mb-2 flex items-center">
        <span className="font-semibold mr-2">{mode === 'camera' ? 'Live Camera Active' : videoFile ? 'Video Analysis Active' : 'Ready'}</span>
        <span className="ml-auto text-xs">MediaPipe Running</span>
      </div>
      {/* Mode Toggle */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${mode === 'camera' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { stopAnalysis(); onModeChange && onModeChange('camera'); }}
          disabled={mode === 'camera'}
        >
          Live Camera
        </button>
        <button
          className={`px-4 py-2 rounded ${mode === 'video' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => { stopAnalysis(); onModeChange && onModeChange('video'); }}
          disabled={mode === 'video'}
        >
          Upload Video
        </button>
        <button
          className="px-4 py-2 rounded bg-red-600 text-white ml-auto"
          onClick={stopAnalysis}
        >
          Stop Analysis
        </button>
      </div>
      {/* Video Upload Input */}
      {mode === 'video' && (
        <div className="mb-4">
          <input
            type="file"
            accept="video/*"
            onChange={handleVideoUpload}
            className="block"
          />
        </div>
      )}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Initializing {mode === 'camera' ? 'camera' : 'video'} and pose detection...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 z-10">
          <div className="text-white text-center p-4 bg-red-600 rounded-lg">
            <p className="font-bold mb-2">Error</p>
            <p>{error}</p>
            <button
              className="mt-4 px-4 py-2 bg-white text-red-600 rounded hover:bg-gray-100"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          playsInline
          muted
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none"
        />
      </div>
    </div>
  );
};

export default MediaPipeClassicAnalysis; 