
import { useState, useRef, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export default function FaceRecognition({ onCapture, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('initializing');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    loadModels();
    return () => {
      stopCamera();
    };
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      setStatus('loading-models');
      
      const MODEL_URL = '/models';
      
      // Load all required models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
      ]);
      
      setModelsLoaded(true);
      setLoading(false);
      // Start camera after models load
      initializeCamera();
    } catch (err) {
      console.error('Error loading models:', err);
      setError('Failed to load face detection models. Please refresh and try again.');
      setLoading(false);
    }
  };

  const initializeCamera = async () => {
    try {
      setStatus('starting-camera');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('ready');
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Unable to access camera. Please grant permission.');
      setLoading(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !modelsLoaded) return;

    setStatus('detecting');

    try {
      // Detect face with landmarks and descriptor
      const detections = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detections) {
        setStatus('ready');
        alert('No face detected! Please position your face within the frame.');
        return;
      }

      // Capture photo from video
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      
      const photoData = canvas.toDataURL('image/jpeg', 0.8);

      // Get the face descriptor (128 floating point numbers)
      const faceDescriptor = Array.from(detections.descriptor);

      stopCamera();
      onCapture({
        photo: photoData,
        descriptor: faceDescriptor
      });
    } catch (err) {
      console.error('Face detection error:', err);
      setStatus('ready');
      alert('Face detection failed. Please try again.');
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Face Recognition</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.videoContainer}>
          {loading && (
            <div style={styles.loadingOverlay}>
              <div className="loading-spinner"></div>
              <p style={styles.loadingText}>
                {status === 'loading-models' ? 'Loading face models...' : 'Starting camera...'}
              </p>
            </div>
          )}
          
          {error && (
            <div style={styles.errorOverlay}>
              <p style={styles.errorText}>{error}</p>
            </div>
          )}
          
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={styles.video}
          />
          <canvas ref={canvasRef} style={styles.canvas} />
          
          <div style={styles.faceGuide}></div>
        </div>

        <div style={styles.instructions}>
          {status === 'detecting' ? (
            <p style={{ color: '#2563eb' }}>Detecting face...</p>
          ) : (
            <p>Position your face within the circle</p>
          )}
        </div>

        <div style={styles.actions}>
          <button 
            onClick={capturePhoto} 
            disabled={loading || !!error || status !== 'ready'}
            className="btn btn-primary"
            style={styles.captureBtn}
          >
            Capture
          </button>
          <button 
            onClick={onClose} 
            className="btn btn-outline"
            style={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#64748b',
    cursor: 'pointer',
    lineHeight: 1,
  },
  videoContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4/3',
    background: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  video: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  canvas: {
    display: 'none',
  },
  faceGuide: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '200px',
    height: '200px',
    border: '3px solid #2563eb',
    borderRadius: '50%',
    pointerEvents: 'none',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(30, 41, 59, 0.9)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: 'white',
    marginTop: '12px',
    fontSize: '14px',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(30, 41, 59, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    padding: '20px',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  captureBtn: {
    flex: 1,
    padding: '14px',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
  },
};

