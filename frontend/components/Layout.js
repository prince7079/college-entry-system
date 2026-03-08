
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import { FiHome, FiUsers, FiUserCheck, FiLogOut, FiGrid, FiCamera, FiMoon, FiSun } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };

  if (!user) return null;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link href="/admin" style={styles.logo}>
          <FiGrid style={{ marginRight: '8px' }} />
          Hybrid Entry System
        </Link>
        <div style={styles.navLinks}>
          <Link href="/admin" style={{ ...styles.navLink, ...(router.pathname === '/admin' ? styles.navLinkActive : {}) }}>
            <FiHome style={{ marginRight: '4px' }} /> Dashboard
          </Link>
          <Link href="/visitors" style={{ ...styles.navLink, ...(router.pathname === '/visitors' ? styles.navLinkActive : {}) }}>
            <FiUsers style={{ marginRight: '4px' }} /> Visitors
          </Link>
          <Link href="/scan" style={{ ...styles.navLink, ...(router.pathname === '/scan' ? styles.navLinkActive : {}) }}>
            <FiCamera style={{ marginRight: '4px' }} /> Scan
          </Link>
          <button onClick={toggleDarkMode} style={styles.themeBtn} title="Toggle dark mode">
            {darkMode ? <FiSun size={18} /> : <FiMoon size={18} />}
          </button>
          <button onClick={handleLogout} style={styles.logoutBtn}>
            <FiLogOut style={{ marginRight: '4px' }} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

const Layout = ({ children }) => {
  return (
    <div style={styles.layout}>
      <Navbar />
      <main style={styles.main}>{children}</main>
    </div>
  );
};

const styles = {
  navbar: {
    background: 'var(--surface)',
    borderBottom: '1px solid var(--border)',
    padding: '12px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    backdropFilter: 'blur(10px)',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    fontSize: '18px',
    fontWeight: '700',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '10px',
    color: 'var(--text-light)',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(16, 185, 129, 0.1) 100%)',
    color: 'var(--primary)',
  },
  themeBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-light)',
    cursor: 'pointer',
    marginLeft: '8px',
    transition: 'all 0.2s ease',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    borderRadius: '10px',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginLeft: '8px',
    transition: 'all 0.2s ease',
  },
  layout: {
    minHeight: '100vh',
    background: 'var(--background)',
  },
  main: {
    padding: '24px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

export default Layout;

