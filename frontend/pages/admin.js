
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { FiUsers, FiUserCheck, FiUserX, FiActivity, FiCalendar, FiTrendingUp, FiClock } from 'react-icons/fi';

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
        <div className="loading-spinner" style={{ width: '50px', height: '50px' }}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>Welcome back, {user.name} 👋</p>
        </div>
        <div style={styles.headerActions}>
          <button className="btn btn-outline" onClick={fetchData}>
            <FiActivity size={16} /> Refresh
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div style={styles.statIcon}>
            <FiCalendar size={24} />
          </div>
          <h3>Today&apos;s Visitors</h3>
          <div className="value">{stats?.todayVisitors || 0}</div>
          <div style={styles.statTrend}>
            <FiTrendingUp size={14} /> +12% from yesterday
          </div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div style={{ ...styles.statIcon, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <FiUserCheck size={24} />
          </div>
          <h3>Currently Inside</h3>
          <div className="value">{stats?.currentlyInside || 0}</div>
          <div style={styles.statTrend}>
            <FiClock size={14} /> Active now
          </div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div style={{ ...styles.statIcon, background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}>
            <FiActivity size={24} />
          </div>
          <h3>This Week</h3>
          <div className="value">{stats?.weekVisitors || 0}</div>
          <div style={styles.statTrend}>
            <FiTrendingUp size={14} /> +8% from last week
          </div>
        </div>
        <div className="stat-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div style={{ ...styles.statIcon, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <FiUsers size={24} />
          </div>
          <h3>Total Visitors</h3>
          <div className="value">{stats?.totalVisitors || 0}</div>
          <div style={styles.statTrend}>
            <FiTrendingUp size={14} /> All time
          </div>
        </div>
      </div>

      <div className="card animate-slide-up" style={{ animationDelay: '0.5s' }}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Entries</h2>
          <span style={styles.entryCount}>{recentLogs.length} entries</span>
        </div>
        {loading ? (
          <div style={styles.loadingState}>
            <div className="loading-spinner"></div>
          </div>
        ) : recentLogs.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Purpose</th>
                <th>Person to Meet</th>
                <th>Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.map((log, index) => (
                <tr key={log._id} className="animate-slide-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  <td>
                    <div style={styles.visitorCell}>
                      <div style={styles.avatar}>
                        {log.visitorName?.charAt(0).toUpperCase()}
                      </div>
                      <span style={styles.visitorName}>{log.visitorName}</span>
                    </div>
                  </td>
                  <td>{log.purpose}</td>
                  <td>{log.personToMeet}</td>
                  <td>
                    <div style={styles.timeCell}>
                      <span>{new Date(log.entryTime).toLocaleDateString()}</span>
                      <span style={styles.time}>{new Date(log.entryTime).toLocaleTimeString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${log.status === 'inside' ? 'status-checked-in' : 'status-checked-out'}`}>
                      {log.status === 'inside' ? 'Inside' : 'Exited'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={styles.emptyState}>
            <FiUsers size={48} color="#94a3b8" />
            <p>No entries yet</p>
            <span>Start scanning visitors to see entries here</span>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '32px',
    fontWeight: '800',
    color: 'var(--text)',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '16px',
    color: 'var(--text-light)',
  },
  headerActions: {
    display: 'flex',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'var(--text)',
  },
  entryCount: {
    fontSize: '14px',
    color: 'var(--text-light)',
    background: 'var(--background)',
    padding: '4px 12px',
    borderRadius: '20px',
  },
  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '400px',
    color: 'var(--text-light)',
  },
  loadingState: {
    display: 'flex',
    justifyContent: 'center',
    padding: '40px',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'var(--text-light)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(37, 99, 235, 0.1)',
    color: '#2563eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  statTrend: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--text-light)',
    marginTop: '8px',
  },
  visitorCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
  },
  visitorName: {
    fontWeight: '500',
    color: 'var(--text)',
  },
  timeCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  time: {
    fontSize: '12px',
    color: 'var(--text-light)',
  },
};
