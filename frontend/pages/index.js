
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);

  // Example: Fetch data from backend
  useEffect(() => {
    const fetchApiData = async () => {
      try {
        // Example: Fetch health status from backend
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

  return (
    <div style={styles.container}>
      <div style={styles.loader}></div>
      <p style={styles.text}>Loading...</p>
      
      {/* Example: Display API response */}
      {apiData && (
        <div style={styles.apiData}>
          <h3>API Health Check:</h3>
          <pre>{JSON.stringify(apiData, null, 2)}</pre>
        </div>
      )}
      
      {error && (
        <div style={styles.error}>
          <h3>API Error:</h3>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8fafc',
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '3px solid #e2e8f0',
    borderTop: '3px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginTop: '16px',
    color: '#64748b',
    fontSize: '14px',
  },
  apiData: {
    marginTop: '20px',
    padding: '16px',
    background: '#dcfce7',
    borderRadius: '8px',
    color: '#166534',
    textAlign: 'center',
  },
  error: {
    marginTop: '20px',
    padding: '16px',
    background: '#fee2e2',
    borderRadius: '8px',
    color: '#991b1b',
  },
};

