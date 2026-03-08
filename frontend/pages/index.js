
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { FiGrid, FiCamera, FiSmile, IoFingerPrint, FiShield, FiClock, FiUsers, FiActivity } from 'react-icons/fi';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const data = await api.getHealth();
        setApiData(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchApiData();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/admin');
      } else {
        router.push('/login');
      }
    }
  }, [user, loading, router]);

  // Landing page component for non-authenticated users
  const LandingPage = () => (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">
            Smart <span>Hybrid</span> Entry System
          </h1>
          <p className="hero-subtitle">
            Advanced visitor management with QR Code, Face Recognition, and Thumbprint biometric authentication for educational institutions
          </p>
          <div className="hero-buttons">
            <a href="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '16px' }}>
              Get Started
            </a>
            <a href="#features" className="btn btn-outline" style={{ padding: '16px 32px', fontSize: '16px', borderColor: 'rgba(255,255,255,0.3)', color: 'white' }}>
              Learn More
            </a>
          </div>
          <div className="hero-features">
            <div className="hero-feature">
              <div className="hero-feature-icon"><FiCamera /></div>
              <span>QR Code Scanning</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon"><FiSmile /></div>
              <span>Face Recognition</span>
            </div>
            <div className="hero-feature">
              <div className="hero-feature-icon"><IoFingerPrint /></div>
              <span>Thumbprint Auth</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <FiCamera size={28} />
            </div>
            <h3 className="feature-title">QR Code Scanning</h3>
            <p className="feature-description">
              Quick and contactless visitor check-in using unique QR codes generated for each visitor. Fast, efficient, and paperless.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiSmile size={28} />
            </div>
            <h3 className="feature-title">Face Recognition</h3>
            <p className="feature-description">
              Advanced biometric verification using face-api.js for accurate visitor identity verification. Secure and touchless.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <IoFingerPrint size={28} />
            </div>
            <h3 className="feature-title">Thumbprint Verification</h3>
            <p className="feature-description">
              Additional biometric layer with fingerprint scanning for enhanced security and accurate visitor tracking.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiShield size={28} />
            </div>
            <h3 className="feature-title">Secure Authentication</h3>
            <p className="feature-description">
              JWT-based authentication with role-based access control for staff and administrators. Your data is safe with us.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiClock size={28} />
            </div>
            <h3 className="feature-title">Real-time Tracking</h3>
            <p className="feature-description">
              Live visitor tracking with Socket.IO integration. Monitor entry and exit in real-time from the admin dashboard.
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <FiUsers size={28} />
            </div>
            <h3 className="feature-title">Visitor Management</h3>
            <p className="feature-description">
              Complete visitor lifecycle management from registration to approval, check-in, and check-out with full audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{ padding: '80px 20px', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '24px',
            textAlign: 'center'
          }}>
            <div style={{ padding: '32px' }}>
              <FiActivity size={40} color="#3b82f6" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>3</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Verification Methods</div>
            </div>
            <div style={{ padding: '32px' }}>
              <FiUsers size={40} color="#10b981" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>100%</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Secure Entry</div>
            </div>
            <div style={{ padding: '32px' }}>
              <FiShield size={40} color="#8b5cf6" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Real-time</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Live Monitoring</div>
            </div>
            <div style={{ padding: '32px' }}>
              <FiGrid size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
              <div style={{ fontSize: '48px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Admin</div>
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Full Control</div>
            </div>
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
            © 2026 Hybrid Entry System. Built with Next.js, Node.js, and MongoDB.
          </p>
        </div>
      </footer>
    </div>
  );

  // Loading screen
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loaderContainer}>
          <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
          <p style={styles.text}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!user) {
    return <LandingPage />;
  }

  // Redirect to admin if authenticated (this happens quickly)
  return null;
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--background)',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginTop: '16px',
    color: 'var(--text-light)',
    fontSize: '14px',
  },
};

