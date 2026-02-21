
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import { FiHome, FiUsers, FiUserCheck, FiLogOut, FiGrid, FiCamera } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link href="/admin" style={styles.logo}>
          <FiGrid style={{ marginRight: '8px' }} />
          College Entry System
        </Link>
        <div style={styles.navLinks}>
          <Link href="/admin" style={styles.navLink}>
            <FiHome style={{ marginRight: '4px' }} /> Dashboard
          </Link>
          <Link href="/visitors" style={styles.navLink}>
            <FiUsers style={{ marginRight: '4px' }} /> Visitors
          </Link>
          <Link href="/scan" style={styles.navLink}>
            <FiCamera style={{ marginRight: '4px' }} /> Scan
          </Link>
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
    background: '#ffffff',
    borderBottom: '1px solid #e2e8f0',
    padding: '12px 0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
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
    color: '#2563eb',
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
    padding: '8px 16px',
    borderRadius: '8px',
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  layout: {
    minHeight: '100vh',
    background: '#f8fafc',
  },
  main: {
    padding: '24px 20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
};

export default Layout;

