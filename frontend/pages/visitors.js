
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { FiPlus, FiSearch, FiCheck, FiX, FiTrash2, FiSmile, FiFingerprint } from 'react-icons/fi';

export default function Visitors() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchVisitors();
    }
  }, [user]);

  const fetchVisitors = async () => {
    try {
      const data = await api.get('/visitor');
      setVisitors(data);
    } catch (error) {
      console.error('Error fetching visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await api.put(`/visitor/${id}/approve`);
      fetchVisitors();
    } catch (error) {
      console.error('Error approving visitor:', error);
    }
  };

  const handleReject = async (id) => {
    try {
      await api.put(`/visitor/${id}/reject`);
      fetchVisitors();
    } catch (error) {
      console.error('Error rejecting visitor:', error);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this visitor?')) {
      try {
        await api.delete(`/visitor/${id}`);
        fetchVisitors();
      } catch (error) {
        console.error('Error deleting visitor:', error);
      }
    }
  };

  const filteredVisitors = visitors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.phone.includes(searchTerm) ||
      v.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || v.status === filter;
    return matchesSearch && matchesFilter;
  });

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
        <div>
          <h1 style={styles.title}>Visitors</h1>
          <p style={styles.subtitle}>Manage visitor registrations</p>
        </div>
        <button className="btn btn-primary" onClick={() => router.push('/visitor')}>
          <FiPlus style={{ marginRight: '8px' }} /> New Visitor
        </button>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <FiSearch style={{ marginRight: '8px', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search visitors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="checked-in">Checked In</option>
          <option value="checked-out">Checked Out</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : filteredVisitors.length > 0 ? (
          <table className="table">
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Purpose</th>
                <th>Biometrics</th>
                <th>Person to Meet</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisitors.map((visitor) => (
                <tr key={visitor._id}>
                  <td>
                    {visitor.photo ? (
                      <img 
                        src={visitor.photo} 
                        alt={visitor.name} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: '#e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        color: '#64748b'
                      }}>
                        {visitor.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: '500' }}>{visitor.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{visitor.email}</div>
                    </div>
                  </td>
                  <td>{visitor.phone}</td>
                  <td>{visitor.purpose}</td>
                  <td>
                    <div style={styles.biometricIcons}>
                      {visitor.photo && (
                        <span style={styles.biometricIcon} title="Face registered">
                          <FiSmile size={16} color="#2563eb" />
                        </span>
                      )}
                      {(visitor.thumbprint || (visitor.thumbprintTemplate && visitor.thumbprintTemplate.length > 0)) && (
                        <span style={styles.biometricIcon} title="Thumbprint registered">
                          <FiFingerprint size={16} color="#10b981" />
                        </span>
                      )}
                      {!visitor.photo && !visitor.thumbprint && !(visitor.thumbprintTemplate && visitor.thumbprintTemplate.length > 0) && (
                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>None</span>
                      )}
                    </div>
                  </td>
                  <td>{visitor.personToMeet}</td>
                  <td>
                    <span className={`status-badge status-${visitor.status}`}>
                      {visitor.status}
                    </span>
                  </td>
                  <td>
                    <div style={styles.actions}>
                      {visitor.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(visitor._id)}
                            style={styles.actionBtn}
                            title="Approve"
                          >
                            <FiCheck color="#10b981" />
                          </button>
                          <button
                            onClick={() => handleReject(visitor._id)}
                            style={styles.actionBtn}
                            title="Reject"
                          >
                            <FiX color="#ef4444" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(visitor._id)}
                        style={styles.actionBtn}
                        title="Delete"
                      >
                        <FiTrash2 color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b', textAlign: 'center', padding: '40px' }}>
            No visitors found
          </p>
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
    fontSize: '28px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '4px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    padding: '8px 16px',
    flex: 1,
    maxWidth: '400px',
  },
searchInput: {
    border: 'none',
    outline: 'none',
    flex: 1,
    fontSize: '14px',
  },
  select: {
    padding: '10px 16px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '14px',
    background: 'white',
    minWidth: '150px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
  },
  actionBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  biometricIcons: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  biometricIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px',
    background: '#f1f5f9',
    borderRadius: '4px',
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

