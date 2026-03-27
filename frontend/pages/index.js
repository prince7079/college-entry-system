import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { FiGrid, FiCamera, FiSmile, FiShield, FiClock, FiUsers, FiActivity, FiUserPlus } from 'react-icons/fi';
import { IoFingerPrint } from 'react-icons/io5';

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  // Don't auto-redirect for landing page with form - stay here for public registration
  useEffect(() => {}, []);

  // Loading styles (moved to top)
  const loadingStyles = {
    container: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8fafc',
    },
    loaderContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      marginTop: '16px',
      color: '#64748b',
      fontSize: '14px',
    },
  };

  if (authLoading) {
    return (
      <div style={loadingStyles.container}>
        <div style={loadingStyles.loaderContainer}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
          <p style={loadingStyles.text}>Loading...</p>
        </div>
      </div>
    );
  }

  // Landing page component for all users (public registration)
  const LandingPage = () => {
    const [formData, setFormData] = useState({
      name: '',
      email: '',
      phone: '',
      purpose: '',
      personToMeet: ''
    });
    const [file, setFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [error, setError] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const handleFileChange = (e) => {
      const selectedFile = e.target.files[0];
      if (selectedFile) {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPhotoPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
      }
    };

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        setError('Camera access denied or not available');
      }
    };

    const capturePhoto = () => {
      if (videoRef.current && canvasRef.current) {
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setPhotoPreview(dataUrl);
        // Convert to blob for file
        canvas.toBlob((blob) => {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          setFile(file);
        });
        stopCamera();
      }
    };

    const stopCamera = () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        setCameraActive(false);
      }
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError('');
      try {
        const data = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          purpose: formData.purpose,
          personToMeet: formData.personToMeet
        };
        if (file) {
          // Convert file to base64 for photo
          const reader = new FileReader();
          reader.onloadend = async () => {
            data.photo = reader.result;
            await submitVisitor(data);
          };
          reader.readAsDataURL(file);
        } else {
          await submitVisitor(data);
        }
      } catch (err) {
        setError('Registration failed. Please try again.');
        setLoading(false);
      }
    };

    const submitVisitor = async (data) => {
      const response = await api.post('/visitor', data);
      setSuccess('Visitor registered successfully!');
      setQrCode(response.qrCodeImage);
      setFormData({ name: '', email: '', phone: '', purpose: '', personToMeet: '' });
      setFile(null);
      setPhotoPreview(null);
    };

    // Form styles
    const formSectionStyle = {
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    };

    const formContainerStyle = {
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      padding: '48px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
    };

    const formTitleStyle = {
      fontSize: '28px',
      fontWeight: '800',
      color: '#1e293b',
      margin: '0 0 8px 0',
    };

    const formSubtitleStyle = {
      fontSize: '16px',
      color: '#64748b',
      margin: '0 0 32px 0',
    };

    const formStyle = {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    };

    const inputGroupStyle = {
      display: 'flex',
      flexDirection: 'column',
    };

    const inputStyle = {
      padding: '16px',
      border: '2px solid #e2e8f0',
      borderRadius: '12px',
      fontSize: '16px',
      transition: 'all 0.2s',
      background: 'white',
    };

    const gridStyle = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
    };

    const fileLabelStyle = {
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
      fontSize: '14px',
    };

    const fileInputStyle = {
      padding: '12px',
      border: '2px dashed #cbd5e1',
      borderRadius: '12px',
      background: '#f8fafc',
      cursor: 'pointer',
    };

    const previewStyle = {
      marginTop: '12px',
      width: '120px',
      height: '120px',
      borderRadius: '12px',
      objectFit: 'cover',
      border: '2px solid #e2e8f0',
    };

    const submitBtnStyle = {
      padding: '18px',
      fontSize: '16px',
      fontWeight: '600',
      borderRadius: '12px',
      background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
      color: 'white',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    };

    const errorStyle = {
      padding: '12px',
      background: '#fee2e2',
      color: '#dc2626',
      borderRadius: '8px',
      borderLeft: '4px solid #dc2626',
    };

    const successSectionStyle = {
      padding: '80px 20px',
      background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
    };

    const successContainerStyle = {
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '20px',
      padding: '48px',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
      textAlign: 'center',
    };

    const successIconStyle = {
      fontSize: '64px',
      marginBottom: '16px',
    };

    const successTitleStyle = {
      fontSize: '28px',
      fontWeight: '800',
      color: '#166534',
      margin: '0 0 12px 0',
    };

    const successTextStyle = {
      fontSize: '18px',
      color: '#166534',
      margin: '0 0 8px 0',
    };

    const pendingTextStyle = {
      fontSize: '16px',
      color: '#64748b',
      fontStyle: 'italic',
    };

    const qrContainerStyle = {
      margin: '40px 0',
      padding: '32px',
      background: '#f8fafc',
      borderRadius: '16px',
      border: '2px solid #e2e8f0',
    };

    const qrTitleStyle = {
      fontSize: '20px',
      fontWeight: '700',
      color: '#1e293b',
      margin: '0 0 8px 0',
    };

    const qrSubtitleStyle = {
      color: '#64748b',
      margin: '0 0 24px 0',
    };

    const qrWrapperStyle = {
      display: 'flex',
      justifyContent: 'center',
      marginBottom: '20px',
    };

    const qrImageStyle = {
      width: '200px',
      height: '200px',
      borderRadius: '12px',
    };

    const qrDownloadStyle = {
      marginTop: '20px',
    };

    const downloadBtnStyle = {
      padding: '12px 24px',
    };

    const newRegBtnStyle = {
      padding: '16px 32px',
      fontSize: '16px',
      marginTop: '24px',
    };

    return (
      <div>
        {/* Hero Section */}
        <section className="hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Smart <span>Hybrid</span> Entry System
            </h1>
            <p className="hero-subtitle">
              Advanced visitor management with QR Code, Face Recognition, and Thumbprint biometric authentication
            </p>
            <div className="hero-buttons">
              <a href="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
                Admin Login
              </a>
              <a href="#register" className="btn btn-success" style={{ padding: '16px 32px', fontSize: '16px' }}>
                Register Visitor
              </a>
            </div>
            <div className="hero-features">
              <div className="hero-feature">
                <div className="hero-feature-icon"><FiCamera /></div>
                <span>QR Code</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon"><FiSmile /></div>
                <span>Face ID</span>
              </div>
              <div className="hero-feature">
                <div className="hero-feature-icon"><IoFingerPrint /></div>
                <span>Thumbprint</span>
              </div>
            </div>
          </div>
        </section>

        {/* Visitor Registration Form */}
        {!success ? (
          <section id="register" style={formSectionStyle}>
            <div style={formContainerStyle}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                <FiUserPlus size={32} style={{ marginRight: '12px', color: '#2563eb' }} />
                <h2 style={formTitleStyle}>Register New Visitor</h2>
              </div>
              <p style={formSubtitleStyle}>Complete form below. After admin approval, you'll receive QR code for entry.</p>
              <form onSubmit={handleSubmit} style={formStyle}>
                <div style={gridStyle}>
                  <div style={inputGroupStyle}>
                    <input
                      required
                      type="text"
                      placeholder="Full Name *"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                  <div style={inputGroupStyle}>
                    <input
                      required
                      type="tel"
                      placeholder="Phone Number *"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div style={inputGroupStyle}>
                  <input
                    required
                    type="email"
                    placeholder="Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <select
                    required
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="">Select Purpose *</option>
                    <option value="official">Official</option>
                    <option value="personal">Personal</option>
                    <option value="interview">Interview</option>
                    <option value="meeting">Meeting</option>
                    <option value="delivery">Delivery</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div style={inputGroupStyle}>
                  <input
                    type="text"
                    placeholder="Person/Department to Meet *"
                    value={formData.personToMeet}
                    onChange={(e) => setFormData({ ...formData, personToMeet: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div style={inputGroupStyle}>
                  <label style={fileLabelStyle}>Photo (for face recognition):</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      style={{ ...fileInputStyle, flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={cameraActive ? stopCamera : startCamera}
                      style={{
                        padding: '12px',
                        border: '2px dashed #cbd5e1',
                        borderRadius: '12px',
                        background: cameraActive ? '#fee2e2' : '#f8fafc',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {cameraActive ? 'Stop Camera' : '📷 Camera'}
                    </button>
                  </div>
                  {cameraActive && (
                    <div style={{ marginBottom: '10px' }}>
                      <video
                        ref={videoRef}
                        autoPlay
                        style={{
                          width: '100%',
                          maxWidth: '300px',
                          borderRadius: '12px',
                          border: '2px solid #e2e8f0'
                        }}
                      />
                      <br />
                      <button
                        type="button"
                        onClick={capturePhoto}
                        style={{
                          marginTop: '10px',
                          padding: '8px 16px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer'
                        }}
                      >
                        Capture Photo
                      </button>
                    </div>
                  )}
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" style={previewStyle} />
                  )}
                </div>
                {error && <div style={errorStyle}>{error}</div>}
                <button 
                  type="submit" 
                  disabled={loading || !formData.name || !formData.email || !formData.phone || !formData.purpose || !formData.personToMeet} 
                  style={{
                    ...submitBtnStyle,
                    opacity: loading || !formData.name || !formData.email || !formData.phone || !formData.purpose || !formData.personToMeet ? 0.6 : 1,
                    cursor: loading || !formData.name || !formData.email || !formData.phone || !formData.purpose || !formData.personToMeet ? 'not-allowed' : 'pointer'
                  }}
                  className="btn btn-primary"
                >
                  {loading ? 'Submitting...' : 'Register Visitor'}
                </button>
              </form>
            </div>
          </section>
        ) : (
          <section style={successSectionStyle}>
            <div style={successContainerStyle}>
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={successIconStyle}>✅</div>
                <h2 style={successTitleStyle}>Registration Successful!</h2>
                <p style={successTextStyle}>Visitor <strong>{formData.name}</strong> has been registered.</p>
                <p style={pendingTextStyle}>Status: Pending admin approval</p>
              </div>
              {qrCode && (
                <div style={qrContainerStyle}>
                  <h3 style={qrTitleStyle}>Your QR Code</h3>
                  <p style={qrSubtitleStyle}>Save or print this for entry (after approval)</p>
                  <div style={qrWrapperStyle}>
                    <img src={qrCode} alt="Visitor QR Code" style={qrImageStyle} />
                  </div>
                  <div style={qrDownloadStyle}>
                    <a href={qrCode} download={`visitor-qr-${Date.now()}.png`} style={downloadBtnStyle} className="btn btn-primary">
                      Download QR
                    </a>
                  </div>
                </div>
              )}
              <button onClick={() => { setSuccess(null); setQrCode(null); }} style={newRegBtnStyle} className="btn btn-outline">
                Register Another Visitor
              </button>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section className="features-section" id="features" style={{ marginTop: '80px' }}>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FiCamera size={28} />
              </div>
              <h3 className="feature-title">QR Code Scanning</h3>
              <p className="feature-description">
                Quick check-in using unique QR codes generated after registration.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiSmile size={28} />
              </div>
              <h3 className="feature-title">Face Recognition</h3>
              <p className="feature-description">
                Upload photo during registration for secure face verification.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <IoFingerPrint size={28} />
              </div>
              <h3 className="feature-title">Thumbprint</h3>
              <p className="feature-description">
                Additional biometric verification at entry points.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <FiShield size={28} />
              </div>
              <h3 className="feature-title">Admin Control</h3>
              <p className="feature-description">
                Complete approval workflow and real-time monitoring dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ padding: '40px 20px', background: '#0f172a', textAlign: 'center' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
              <FiGrid size={24} color="#3b82f6" />
              <span style={{ fontSize: '18px', fontWeight: '700', color: 'white' }}>Hybrid Entry System</span>
            </div>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              © 2024 Hybrid Entry System. Built with Next.js, Node.js, and MongoDB.
            </p>
          </div>
        </footer>
      </div>
    );
  };

  // Always show landing page (public registration)
  return <LandingPage />;
};
