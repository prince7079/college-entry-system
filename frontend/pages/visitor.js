
import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/services/api';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiUserCheck, FiCamera } from 'react-icons/fi';

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
  const [photo, setPhoto] = useState('');
  const [faceDescriptor, setFaceDescriptor] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showCamera, setShowCamera] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoCapture = async () => {
    setShowCamera(true);
  };

  const handlePhotoTaken = (photoData) => {
    setPhoto(photoData);
    setShowCamera(false);
    // In production, this would use face-api.js to get the descriptor
    // For now, we'll simulate it
    setFaceDescriptor([Math.random(), Math.random(), Math.random()]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await api.post('/visitor', {
        ...formData,
        photo,
        faceDescriptor
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Visitor Registration</h1>
        <p style={styles.subtitle}>Please fill in your details</p>

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.photoSection}>
            {photo ? (
              <div style={styles.photoPreview}>
                <img src={photo} alt="Visitor" style={styles.photo} />
                <button type="button" onClick={() => { setPhoto(''); setFaceDescriptor([]); }} style={styles.retakeBtn}>
                  Retake Photo
                </button>
              </div>
            ) : (
              <div style={styles.photoPlaceholder}>
                <FiCamera size={40} color="#64748b" />
                <p>No photo</p>
                <button type="button" onClick={handlePhotoCapture} className="btn btn-outline" style={styles.captureBtn}>
                  Take Photo
                </button>
              </div>
            )}
          </div>

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

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Registering...' : 'Register Visitor'}
          </button>
        </form>
      </div>

      {showCamera && (
        <CameraModal onCapture={handlePhotoTaken} onClose={() => setShowCamera(false)} />
      )}
    </div>
  );
}

function CameraModal({ onCapture, onClose }) {
  const [stream, setStream] = useState(null);
  const videoRef = React.useRef(null);

  React.useEffect(() => {
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
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const photoData = canvas.toDataURL('image/jpeg');
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
          <button onClick={onCapture} className="btn btn-primary">Capture</button>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

const styles = {
  container: {
    maxWidth: '700px',
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
  photoSection: {
    marginBottom: '24px',
    textAlign: 'center',
  },
  photoPreview: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  photo: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '3px solid #2563eb',
  },
  retakeBtn: {
    padding: '8px 16px',
    background: '#f1f5f9',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  photoPlaceholder: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    padding: '32px',
    background: '#f8fafc',
    borderRadius: '50%',
    width: '150px',
    margin: '0 auto',
  },
  captureBtn: {
    fontSize: '12px',
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
    marginTop: '24px',
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

