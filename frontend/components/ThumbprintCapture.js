import { useState, useEffect, useRef } from 'react';
import { MdFingerprint } from 'react-icons/md';
import { FiCheck, FiX, FiRefreshCw } from 'react-icons/fi';

export default function ThumbprintCapture({ onCapture, onClose }) {
  const [status, setStatus] = useState('initial'); // initial, scanning, captured, error
  const [message, setMessage] = useState('');
  const [captureId] = useState(() => Math.random().toString(36).substring(7)); // Unique ID for this capture session
  const canvasRef = useRef(null);

  useEffect(() => {
    // Start scanning when component mounts
    startScanning();
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = () => {
    setStatus('scanning');
    setMessage('Place your thumb on the fingerprint scanner...');
    
    // Simulate fingerprint scanning
    // Using deterministic data based on captureId for consistent matching
    const scanDuration = 2000 + Math.random() * 1000; // 2-3 seconds
    
    setTimeout(() => {
      // Use captureId to generate consistent template for this session
      const template = generateConsistentTemplate(captureId);
      const thumbprintImage = generateConsistentThumbprint(captureId);
      
      setStatus('captured');
      setMessage('Thumbprint captured successfully!');
      
      setTimeout(() => {
        onCapture({
          thumbprint: thumbprintImage,
          thumbprintTemplate: template
        });
      }, 500);
    }, scanDuration);
  };

  const stopScanning = () => {
    // Cleanup if needed
  };

  // Generate consistent template based on session ID
  const generateConsistentTemplate = (seed) => {
    // Simple seeded random generator
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    
    // Generate deterministic values from hash
    const template = [];
    for (let i = 0; i < 64; i++) {
      // Use hash to generate consistent values between 0.3 and 0.9
      const value = 0.3 + (Math.abs((hash * (i + 1)) % 100) / 100) * 0.6;
      template.push(value);
    }
    return template;
  };

  // Generate consistent thumbprint image based on session ID
  const generateConsistentThumbprint = (seed) => {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    // Draw background
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 200, 200);
    
    // Draw fingerprint pattern using hash
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    
    const patternType = hash % 3;
    
    if (patternType === 0) {
      // Concentric arcs
      for (let i = 0; i < 10; i++) {
        ctx.beginPath();
        ctx.arc(100, 100, 20 + i * 8, Math.PI * 0.8, Math.PI * 2.2);
        ctx.stroke();
      }
    } else if (patternType === 1) {
      // Whorl pattern
      for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.arc(100, 100 + i * 5, 30 + i * 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      // U-shape pattern
      for (let i = 0; i < 8; i++) {
        ctx.beginPath();
        ctx.arc(100 - i * 10, 100, 30 + i * 5, Math.PI * 0.5, Math.PI * 1.5);
        ctx.stroke();
      }
    }
    
    // Add some lines based on hash
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(20 + i * 20, 30);
      ctx.lineTo(20 + i * 20, 170);
      ctx.stroke();
    }
    
    return canvas.toDataURL('image/png');
  };

  const handleRetry = () => {
    setStatus('initial');
    startScanning();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Thumbprint Capture</h2>
          <button onClick={onClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.scannerContainer}>
          <div style={styles.scanner}>
            {status === 'scanning' && (
              <div style={styles.scanningAnimation}>
                <div style={styles.scannerCircle}></div>
                <MdFingerprint size={80} color="#10b981" />
              </div>
            )}
            
            {status === 'captured' && (
              <div style={styles.successState}>
                <div style={styles.successIcon}>
                  <FiCheck size={60} color="white" />
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div style={styles.errorState}>
                <div style={styles.errorIcon}>
                  <FiX size={60} color="white" />
                </div>
              </div>
            )}
            
            {status === 'initial' && (
              <div style={styles.initialState}>
                <MdFingerprint size={80} color="#64748b" />
              </div>
            )}
          </div>
          
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        <div style={styles.message}>
          <p style={{
            ...styles.messageText,
            color: status === 'error' ? '#ef4444' : status === 'captured' ? '#10b981' : '#64748b'
          }}>
            {message}
          </p>
        </div>

        <div style={styles.instructions}>
          <p>Place your thumb firmly on the fingerprint scanner</p>
        </div>

        <div style={styles.actions}>
          {status === 'scanning' ? (
            <button 
              onClick={onClose} 
              className="btn btn-outline"
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          ) : status === 'captured' ? (
            <button 
              onClick={handleRetry} 
              className="btn btn-outline"
              style={styles.retryBtn}
            >
              <FiRefreshCw style={{ marginRight: '8px' }} /> Retry
            </button>
          ) : status === 'error' ? (
            <>
              <button 
                onClick={handleRetry} 
                className="btn btn-primary"
                style={styles.retryBtn}
              >
                <FiRefreshCw style={{ marginRight: '8px' }} /> Try Again
              </button>
              <button 
                onClick={onClose} 
                className="btn btn-outline"
                style={styles.cancelBtn}
              >
                Cancel
              </button>
            </>
          ) : (
            <button 
              onClick={onClose} 
              className="btn btn-outline"
              style={styles.cancelBtn}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    color: '#64748b',
    cursor: 'pointer',
    lineHeight: 1,
  },
  scannerContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  scanner: {
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    background: '#f1f5f9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '4px solid #e2e8f0',
    position: 'relative',
    overflow: 'hidden',
  },
  scanningAnimation: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerCircle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    border: '4px solid #10b981',
    animation: 'pulse 1.5s infinite',
  },
  initialState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    background: '#10b981',
    borderRadius: '50%',
  },
  successIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    background: '#ef4444',
    borderRadius: '50%',
  },
  errorIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: '16px',
  },
  messageText: {
    fontSize: '16px',
    fontWeight: '500',
  },
  instructions: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#64748b',
    fontSize: '14px',
  },
  actions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center',
  },
  cancelBtn: {
    flex: 1,
    padding: '14px',
  },
  retryBtn: {
    flex: 1,
    padding: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

