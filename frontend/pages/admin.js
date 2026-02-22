
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { FiUsers, FiUserCheck, FiUserX, FiActivity, FiCalendar } from 'react-icons/fi';

export default function AdminDashboard() {
  const { user, loading: authLoading, socket } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  // Realtime updates
  useEffect(() => {
    if (!socket) {
      return;
    }

    const onEntry = (payload) => {
      setRecentLogs((prev) => [payload.entryLog, ...(prev || []).slice(0, 9)]);
      fetchData();
    };

    const onExit = () => {
      fetchData();
    };

    socket.on('entry', onEntry);
    socket.on('exit', onExit);

    return () => {
      socket.off('entry', onEntry);
      socket.off('exit', onExit);
    };
  }, [socket]);

  const fetchData = async () => {
    try {
      const [statsData, logsData] = await Promise.all([
        api.get('/entry/stats'),
        api.get('/entry/logs?limit=10')
      ]);
      setStats(statsData);
      setRecentLogs(logsData.logs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div style={styles.loading}>
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.header}>
        <h1 style={styles.title}>Dashboard</h1>
        <p style={styles.subtitle}>Welcome back, {user.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3><FiActivity style={{ marginRight: '8px' }} />Today&apos;s Visitors</h3>
          <div className="value">{stats?.todayVisitors || 0}</div>
        </div>
        <div className="stat-card">
          <h3><FiUserCheck style={{ marginRight: '8px' }} />Currently Inside</h3>
          <div className="value">{stats?.currentlyInside || 0}</div>
        </div>
        <div className="stat-card">
          <h3><FiCalendar style={{ marginRight: '8px' }} />This Week</h3>
          <div className="value">{stats?.weekVisitors || 0}</div>
        </div>
        <div className="stat-card">
          <h3><FiUsers style={{ marginRight: '8px' }} />Total Visitors</h3>
          <div className="value">{stats?.totalVisitors || 0}</div>
        </div>
      </div>

      <div className="card">
        <h2 style={styles.sectionTitle}>Recent Entries</h2>
        {loading ? (
          <p>Loading...</p>
        ) : recentLogs.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Purpose</th>
                <th>Person to Meet</th>
                <th>Entry Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.visitorName}</td>
                  <td>{log.purpose}</td>
                  <td>{log.personToMeet}</td>
                  <td>{new Date(log.entryTime).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${log.status === 'inside' ? 'status-checked-in' : 'status-checked-out'}`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b' }}>No entries yet</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '16px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: '#64748b',
  },
};
