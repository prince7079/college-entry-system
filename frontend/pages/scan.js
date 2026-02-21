
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { FiCamera, FiCheck, FiX, FiUser, FiClock } from 'react-icons/fi';

export default function Scan() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [mode, setMode] = useState('entry'); // 'entry' or 'exit'
  const [cameraError, setCameraError] = useState('');
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    return () => {
      if (html5QrcodeScannerRef.current) {
        html5QrcodeScannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setScanResult(null);
    setCameraError('');

    setTimeout(() => {
      if (scannerRef.current) {
        html5QrcodeScannerRef.current = new Html5QrcodeScanner(
          'qr-reader',
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
          },
          false
        );

        html5QrcodeScannerRef.current.render(
          (decodedText) => {
            handleScan(decodedText);
          },
          (error) => {
            // Ignore scan errors
          }
        );
      }
    }, 100);
  };

  const stopScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
    }
    setScanning(false);
  };

  const handleScan = async (qrData) => {
    if (processing) return;
    
    stopScanning();
    setProcessing(true);

    try {
      // Verify the QR code first
      const verifyData = await api.post('/scan/verify', {
        qrCode: qrData
      });

      if (verifyData.verified) {
        setScanResult({
          type: 'success',
          visitor: verifyData.visitor,
          isInside: verifyData.isInside,
          qrCode: qrData
        });
      } else {
        setScanResult({
          type: 'error',
          message: 'Invalid QR code'
        });
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Verification failed'
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleEntry = async () => {
    if (!scanResult || scanResult.type !== 'success') return;

    try {
      const data = await api.post('/scan/entry', {
        qrCode: scanResult.qrCode,
        entryMethod: 'qr'
      });
      setScanResult({
        type: 'success',
        message: 'Entry recorded successfully!',
        visitor: data.visitor
      });
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Entry failed'
      });
    }
  };

  const handleExit = async () => {
    if (!scanResult || scanResult.type !== 'success') return;

    try {
      const data = await api.post('/scan/exit', {
        qrCode: scanResult.qrCode,
        exitMethod: 'qr'
      });
      setScanResult({
        type: 'success',
        message: 'Exit recorded successfully!',
        visitor: data.visitor
      });
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Exit failed'
      });
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setScanning(false);
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
        <h1 style={styles.title}>QR Scanner</h1>
        <p style={styles.subtitle}>Scan visitor QR code for entry/exit</p>
      </div>

      <div style={styles.modeToggle}>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'entry' ? styles.modeBtnActive : {}) }}
          onClick={() => { setMode('entry'); resetScan(); }}
        >
          <FiCheck style={{ marginRight: '8px' }} /> Entry
        </button>
        <button
          style={{ ...styles.modeBtn, ...(mode === 'exit' ? styles.modeBtnActive : {}) }}
          onClick={() => { setMode('exit'); resetScan(); }}
        >
          <FiX style={{ marginRight: '8px' }} /> Exit
        </button>
      </div>

      <div style={styles.container}>
        {!scanning && !scanResult && (
          <div style={styles.startSection}>
            <div style={styles.iconBox}>
              <FiCamera size={60} color="#2563eb" />
            </div>
            <h2 style={styles.sectionTitle}>Ready to Scan</h2>
            <p style={styles.sectionText}>
              Click the button below to start scanning visitor QR codes
            </p>
            <button onClick={startScanning} className="btn btn-primary" style={styles.startBtn}>
              <FiCamera style={{ marginRight: '8px' }} /> Start Scanning
            </button>
          </div>
        )}

        {scanning && (
          <div style={styles.scannerSection}>
            <div id="qr-reader" style={styles.qrReader}></div>
            <button onClick={stopScanning} className="btn btn-secondary" style={styles.stopBtn}>
              Cancel
            </button>
          </div>
        )}

        {processing && (
          <div style={styles.processingSection}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
            <p>Processing...</p>
          </div>
        )}

        {scanResult && scanResult.type === 'success' && !scanResult.message && (
          <div style={styles.resultSection}>
            <div style={styles.successIcon}>
              <FiCheck size={40} color="white" />
            </div>
            <h3 style={styles.visitorName}>{scanResult.visitor?.name}</h3>
            
            <div style={styles.visitorDetails}>
              <div style={styles.detailItem}>
                <FiUser style={{ marginRight: '8px' }} />
                <span>Purpose: {scanResult.visitor?.purpose}</span>
              </div>
              <div style={styles.detailItem}>
                <FiClock style={{ marginRight: '8px' }} />
                <span>Meeting: {scanResult.visitor?.personToMeet}</span>
              </div>
            </div>

            {scanResult.isInside ? (
              <p style={styles.statusText}>Visitor is currently inside</p>
            ) : (
              <p style={styles.statusText}>Visitor is outside</p>
            )}

            <div style={styles.actionButtons}>
              {mode === 'entry' && !scanResult.isInside ? (
                <button onClick={handleEntry} className="btn btn-success" style={styles.actionBtn}>
                  Record Entry
                </button>
              ) : mode === 'exit' && scanResult.isInside ? (
                <button onClick={handleExit} className="btn btn-primary" style={styles.actionBtn}>
                  Record Exit
                </button>
              ) : (
                <p style={styles.errorText}>
                  {mode === 'entry' ? 'Visitor is already inside' : 'Visitor is not inside'}
                </p>
              )}
              <button onClick={resetScan} className="btn btn-outline" style={styles.actionBtn}>
                Scan Another
              </button>
            </div>
          </div>
        )}

        {scanResult && scanResult.message && (
          <div style={styles.resultSection}>
            <div style={styles.errorIcon}>
              <FiX size={40} color="white" />
            </div>
            <h3>{scanResult.message}</h3>
            <button onClick={resetScan} className="btn btn-primary" style={styles.actionBtn}>
              Try Again
            </button>
          </div>
        )}

        {scanResult && scanResult.type === 'error' && (
          <div style={styles.resultSection}>
            <div style={styles.errorIcon}>
              <FiX size={40} color="white" />
            </div>
            <h3>{scanResult.message}</h3>
            <button onClick={resetScan} className="btn btn-primary" style={styles.actionBtn}>
              Try Again
            </button>
          </div>
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
  modeToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  modeBtn: {
    flex: 1,
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  modeBtnActive: {
    borderColor: '#2563eb',
    background: '#eff6ff',
    color: '#2563eb',
  },
  container: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  startSection: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  iconBox: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: '#eff6ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 24px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: '8px',
  },
  sectionText: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '24px',
  },
  startBtn: {
    padding: '14px 32px',
    fontSize: '16px',
  },
  scannerSection: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  qrReader: {
    width: '100%',
    marginBottom: '16px',
  },
  stopBtn: {
    width: '100%',
  },
  processingSection: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  resultSection: {
    textAlign: 'center',
    padding: '40px 20px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  successIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  errorIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
  },
  visitorName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '16px',
  },
  visitorDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  statusText: {
    fontSize: '16px',
    color: '#2563eb',
    marginBottom: '24px',
  },
  errorText: {
    fontSize: '14px',
    color: '#ef4444',
    marginBottom: '16px',
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  actionBtn: {
    width: '100%',
    padding: '14px',
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

