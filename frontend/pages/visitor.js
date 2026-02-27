import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import FaceRecognition from '@/components/FaceRecognition';
import ThumbprintCapture from '@/components/ThumbprintCapture';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiUserCheck, FiCamera, FiFingerprint, FiCheck } from 'react-icons/fi';
import * as faceapi from 'face-api.js';

export default function VisitorForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    aadharNumber: '',
    purpose: 'official',
    department: '',
    personToMeet: ''
  });
  
  // Photo and biometric data
  const [photo, setPhoto] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [thumbprint, setThumbprint] = useState('');
  const [thumbprintTemplate, setThumbprintTemplate] = useState([]);
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCamera, setShowCamera] = useState(false);
  const [showFaceRecognition, setShowFaceRecognition] = useState(false);
  const [showThumbprintCapture, setShowThumbprintCapture] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle photo capture from simple camera
  const handlePhotoCapture = () => {
    setShowCamera(true);
  };

  const handlePhotoTaken = (photoData) => {
    setPhoto(photoData);
    setShowCamera(false);
    // Generate a placeholder face descriptor
    // In production, this would use face-api.js to detect and get the descriptor
    setFaceDescriptor(Array(128).fill(0).map(() => Math.random()));
  };

  // Handle face capture from FaceRecognition component
  const handleFaceCapture = async (faceData) => {
    setPhoto(faceData.photo);
    setFaceDescriptor(faceData.descriptor || []);
    setShowFaceRecognition(false);
  };

  // Handle thumbprint capture
  const handleThumbprintCapture = (thumbprintData) => {
    setThumbprint(thumbprintData.thumbprint);
    setThumbprintTemplate(thumbprintData.thumbprintTemplate);
    setShowThumbprintCapture(false);
  };

  // Clear all biometric data
  const clearBiometrics = () => {
    setPhoto('');
    setFaceDescriptor([]);
    setThumbprint('');
    setThumbprintTemplate([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/visitor', {
        ...formData,
        photo,
        faceDescriptor,
        thumbprint,
        thumbprintTemplate
      });
      setMessage({ type: 'success', text: 'Visitor registered successfully!' });
      setTimeout(() => {
        router.push('/visitors');
      }, 2000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  // Count how many biometric methods are captured
  const biometricsCount = [photo, thumbprint].filter(Boolean).length;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Visitor Registration</h1>
        <p style={styles.subtitle}>Please fill in your details and capture biometrics for verification</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Biometrics Section */}
          <div style={styles.biometricsSection}>
            <h3 style={styles.sectionTitle}>Biometric Verification</h3>
            <p style={styles.sectionSubtitle}>Capture face photo and/or thumbprint for hybrid verification</p>
            
            <div style={styles.biometricsGrid}>
              {/* Face Photo */}
              <div style={styles.biometricCard}>
                <div style={styles.biometricHeader}>
                  <FiCamera size={24} color="#2563eb" />
                  <span>Face Photo</span>
                </div>
                {photo ? (
                  <div style={styles.biometricPreview}>
                    <img src={photo} alt="Visitor face" style={styles.biometricImage} />
                    <div style={styles.capturedBadge}>
                      <FiCheck size={14} color="white" /> Captured
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setPhoto(''); setFaceDescriptor([]); }} 
                      style={styles.retakeLink}
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div style={styles.biometricButtons}>
                    <button 
                      type="button" 
                      onClick={() => setShowFaceRecognition(true)} 
                      className="btn btn-outline"
                      style={styles.biometricBtn}
                    >
                      <FiCamera style={{ marginRight: '8px' }} /> Capture Face
                    </button>
                  </div>
                )}
              </div>

              {/* Thumbprint */}
              <div style={styles.biometricCard}>
                <div style={styles.biometricHeader}>
                  <FiFingerprint size={24} color="#10b981" />
                  <span>Thumbprint</span>
                </div>
                {thumbprint ? (
                  <div style={styles.biometricPreview}>
                    <img src={thumbprint} alt="Thumbprint" style={styles.biometricImage} />
                    <div style={styles.capturedBadge}>
                      <FiCheck size={14} color="white" /> Captured
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setThumbprint(''); setThumbprintTemplate([]); }} 
                      style={styles.retakeLink}
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <div style={styles.biometricButtons}>
                    <button 
                      type="button" 
                      onClick={() => setShowThumbprintCapture(true)} 
                      className="btn btn-outline"
                      style={styles.biometricBtn}
                    >
                      <FiFingerprint style={{ marginRight: '8px' }} /> Capture Thumbprint
                    </button>
                  </div>
                )}
              </div>
            </div>

            {biometricsCount > 0 && (
              <div style={styles.biometricStatus}>
                <span style={styles.statusText}>
                  {biometricsCount === 2 
                    ? '✓ Both biometrics captured - Maximum security enabled'
                    : '✓ 1 biometric captured - Standard security enabled'}
                </span>
              </div>
            )}
          </div>

          {/* Personal Information */}
          <div style={styles.formSection}>
            <h3 style={styles.sectionTitle}>Personal Information</h3>
            
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiUser style={{ marginRight: '8px' }} /> Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Enter your full name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiMail style={{ marginRight: '8px' }} /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="your@email.com"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiPhone style={{ marginRight: '8px' }} /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="+91 9876543210"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Aadhar Number</label>
                <input
                  type="text"
                  name="aadharNumber"
                  value={formData.aadharNumber}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="1234 5678 9012"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  <FiBriefcase style={{ marginRight: '8px' }} /> Purpose *
                </label>
                <select
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="official">Official</option>
                  <option value="personal">Personal</option>
                  <option value="interview">Interview</option>
                  <option value="meeting">Meeting</option>
                  <option value="delivery">Delivery</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                <label style={styles.label}>
                  <FiUserCheck style={{ marginRight: '8px' }} /> Person to Meet *
                </label>
                <input
                  type="text"
                  name="personToMeet"
                  value={formData.personToMeet}
                  onChange={handleChange}
                  style={styles.input}
                  required
                  placeholder="Name of the person you want to meet"
                />
              </div>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register Visitor'}
          </button>
        </form>
      </div>

      {/* Camera Modal for simple photo capture */}
      {showCamera && (
        <CameraModal onCapture={handlePhotoTaken} onClose={() => setShowCamera(false)} />
      )}

      {/* Face Recognition Modal */}
      {showFaceRecognition && (
        <FaceRecognition 
          onCapture={handleFaceCapture} 
          onClose={() => setShowFaceRecognition(false)} 
        />
      )}

      {/* Thumbprint Capture Modal */}
      {showThumbprintCapture && (
        <ThumbprintCapture 
          onCapture={handleThumbprintCapture} 
          onClose={() => setShowThumbprintCapture(false)} 
        />
      )}
    </div>
  );
}

function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(s => {
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      })
      .catch(err => console.error('Camera error:', err));

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current) return;
    
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg', 0.8);
    onCapture(photoData);
  };

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        <h3 style={modalStyles.title}>Take Photo</h3>
        <div style={modalStyles.videoContainer}>
          <video ref={videoRef} autoPlay playsInline style={modalStyles.video} />
        </div>
        <div style={modalStyles.buttons}>
          <button onClick={handleCapture} className="btn btn-primary">Capture</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '32px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  biometricsSection: {
    marginBottom: '32px',
    padding: '24px',
    background: '#f8fafc',
    borderRadius: '12px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '20px',
  },
  biometricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  biometricCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    border: '1px solid #e2e8f0',
  },
  biometricHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  biometricPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  biometricImage: {
    width: '100px',
    height: '100px',
    borderRadius: '8px',
    objectFit: 'cover',
    border: '2px solid #e2e8f0',
  },
  capturedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: '#10b981',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
  },
  retakeLink: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    fontSize: '14px',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  biometricButtons: {
    display: 'flex',
    justifyContent: 'center',
  },
  biometricBtn: {
    width: '100%',
  },
  biometricStatus: {
    marginTop: '16px',
    padding: '12px',
    background: '#ecfdf5',
    borderRadius: '8px',
    textAlign: 'center',
  },
  statusText: {
    color: '#10b981',
    fontSize: '14px',
    fontWeight: '500',
  },
  formSection: {
    marginBottom: '24px',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '6px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#1e293b',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
  },
  select: {
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
  },
  submitBtn: {
    width: '100%',
    padding: '14px',
    background: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '8px',
  },
};

const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '16px',
    textAlign: 'center',
  },
  videoContainer: {
    background: '#000',
    borderRadius: '8px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  video: {
    width: '100%',
    display: 'block',
  },
  buttons: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
};

