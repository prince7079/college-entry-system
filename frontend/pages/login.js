
import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FiGrid, FiMail, FiLock, FiArrowRight } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin' || user.role === 'staff') {
        router.push('/admin');
      } else {
        router.push('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Login failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card animate-slide-up">
        <div className="login-header">
          <div className="login-logo">
            <FiGrid size={28} />
          </div>
          <h1 className="login-title">Hybrid Entry System</h1>
          <p className="login-subtitle">Sign in to manage visitors</p>
        </div>

        {error && (
          <div className="alert alert-error animate-slide-up">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div style={styles.inputContainer}>
              <FiMail style={styles.inputIcon} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
                style={styles.inputWithIcon}
                required
                placeholder="admin@college.com"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={styles.inputContainer}>
              <FiLock style={styles.inputIcon} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                style={styles.inputWithIcon}
                required
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={styles.button}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
            ) : (
              <>
                Sign In <FiArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div style={styles.footer}>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            Demo: admin@college.com / password123
          </p>
        </div>
        
        <div style={styles.backLink}>
          <a href="/" style={styles.backLinkText}>← Back to Home</a>
        </div>
      </div>
    </div>
  );
}

const styles = {
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '14px',
    color: 'var(--text-light)',
    zIndex: 1,
  },
  inputWithIcon: {
    paddingLeft: '42px',
  },
  button: {
    width: '100%',
    padding: '14px',
    marginTop: '8px',
    fontSize: '16px',
  },
  footer: {
    marginTop: '24px',
    textAlign: 'center',
    padding: '16px',
    background: 'var(--background)',
    borderRadius: '12px',
  },
  backLink: {
    marginTop: '20px',
    textAlign: 'center',
  },
  backLinkText: {
    color: 'var(--text-light)',
    fontSize: '14px',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};

