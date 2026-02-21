
import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function QRScanner({ onScan, onClose }) {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const html5QrCodeRef = useRef(null);

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError('');
      setScanning(true);

      html5QrCodeRef.current = new Html5Qrcode('qr-reader');
      
      await html5QrCodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Ignore continuous scan errors
        }
      );
    } catch (err) {
      console.error('Scanner error:', err);
      setError('Unable to start camera. Please grant permission.');
      setScanning(false);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>Scan QR Code</h2>
          <button onClick={handleClose} style={styles.closeBtn}>×</button>
        </div>

        <div style={styles.scannerContainer}>
          {error && (
            <div style={styles.errorBox}>
              <p>{error}</p>
              <button onClick={startScanner} className="btn btn-primary" style={styles.retryBtn}>
                Try Again
              </button>
            </div>
          )}
          
          <div id="qr-reader" style={styles.qrReader}></div>
          
          {!scanning && !error && (
            <div style={styles.startOverlay}>
              <button onClick={startScanner} className="btn btn-primary" style={styles.startBtn}>
                Start Scanning
              </button>
            </div>
          )}
        </div>

        <p style={styles.instructions}>
          Position the QR code within the frame
        </p>

        <button onClick={handleClose} className="btn btn-outline" style={styles.cancelBtn}>
          Cancel
        </button>
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
    maxWidth: '500px',
    width: '90%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
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
    position: 'relative',
    width: '100%',
    aspectRatio: '1',
    background: '#1e293b',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  qrReader: {
    width: '100%',
    height: '100%',
  },
  startOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(30, 41, 59, 0.9)',
  },
  startBtn: {
    padding: '14px 32px',
    fontSize: '16px',
  },
  errorBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(30, 41, 59, 0.95)',
    color: '#ef4444',
    padding: '20px',
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: '16px',
  },
  instructions: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
    marginBottom: '16px',
  },
  cancelBtn: {
    width: '100%',
    padding: '14px',
  },
};

