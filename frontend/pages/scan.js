import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';
import { Html5QrcodeScanner } from 'html5-qrcode';
import FaceRecognition from '@/components/FaceRecognition';
import ThumbprintCapture from '@/components/ThumbprintCapture';
import { FiCamera, FiCheck, FiX, FiUser, FiClock, FiGrid, FiSmile, FiFingerprint } from 'react-icons/fi';
import * as faceapi from 'face-api.js';

export default function Scan() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  // State for verification method
  const [verificationMethod, setVerificationMethod] = useState('qr'); // 'qr', 'face', 'thumbprint'
  
  // State for scanning
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  
  // State for mode (entry/exit)
  const [mode, setMode] = useState('entry');
  
  // State for components
  const [showFaceCapture, setShowFaceCapture] = useState(false);
  const [showThumbprintCapture, setShowThumbprintCapture] = useState(false);
  
  // Refs
  const scannerRef = useRef(null);
  const html5QrcodeScannerRef = useRef(null);
  const videoRef = useRef(null);

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
      stopCamera();
    };
  }, []);

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
  };

  // ==================== QR Code Methods ====================
  const startQRScanning = () => {
    setScanning(true);
    setScanResult(null);

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
            handleQRScan(decodedText);
          },
          (error) => {
            // Ignore scan errors
          }
        );
      }
    }, 100);
  };

  const stopQRScanning = () => {
    if (html5QrcodeScannerRef.current) {
      html5QrcodeScannerRef.current.clear().catch(console.error);
    }
    setScanning(false);
  };

  const handleQRScan = async (qrData) => {
    if (processing) return;
    
    stopQRScanning();
    setProcessing(true);

    try {
      const verifyData = await api.verifyVisitor({
        qrCode: qrData
      });

      if (verifyData.verified) {
        setScanResult({
          type: 'success',
          visitor: verifyData.visitor,
          isInside: verifyData.isInside,
          verificationMethod: 'qr',
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

  // ==================== Face Verification Methods ====================
  const startFaceVerification = () => {
    setShowFaceCapture(true);
    setScanResult(null);
  };

  const handleFaceCapture = async (faceData) => {
    setShowFaceCapture(false);
    setProcessing(true);

    try {
      // Get face descriptor from captured data
      const faceDescriptor = faceData.descriptor;
      
      if (!faceDescriptor || faceDescriptor.length === 0) {
        throw new Error('No face detected');
      }

      const verifyData = await api.verifyFace(faceDescriptor);

      if (verifyData.verified) {
        setScanResult({
          type: 'success',
          visitor: verifyData.visitor,
          isInside: verifyData.isInside,
          verificationMethod: 'face',
          matchConfidence: verifyData.matchConfidence
        });
      } else {
        setScanResult({
          type: 'error',
          message: verifyData.message || 'Face not recognized'
        });
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Face verification failed'
      });
    } finally {
      setProcessing(false);
    }
  };

  // ==================== Thumbprint Verification Methods ====================
  const startThumbprintVerification = () => {
    setShowThumbprintCapture(true);
    setScanResult(null);
  };

  const handleThumbprintCapture = async (thumbprintData) => {
    setShowThumbprintCapture(false);
    setProcessing(true);

    try {
      const verifyData = await api.verifyThumbprint(
        thumbprintData.thumbprintTemplate,
        thumbprintData.thumbprint
      );

      if (verifyData.verified) {
        setScanResult({
          type: 'success',
          visitor: verifyData.visitor,
          isInside: verifyData.isInside,
          verificationMethod: 'thumbprint',
          matchConfidence: verifyData.matchConfidence
        });
      } else {
        setScanResult({
          type: 'error',
          message: verifyData.message || 'Thumbprint not recognized'
        });
      }
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Thumbprint verification failed'
      });
    } finally {
      setProcessing(false);
    }
  };

  // ==================== Entry/Exit Methods ====================
  const handleEntry = async () => {
    if (!scanResult || scanResult.type !== 'success') return;

    try {
      const data = await api.post('/scan/entry', {
        qrCode: scanResult.qrCode,
        visitorId: scanResult.visitor?._id,
        entryMethod: scanResult.verificationMethod
      });
      setScanResult({
        type: 'success',
        message: 'Entry recorded successfully!',
        visitor: data.visitor,
        verificationMethod: scanResult.verificationMethod
      });
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Entry failed',
        ...scanResult
      });
    }
  };

  const handleExit = async () => {
    if (!scanResult || scanResult.type !== 'success') return;

    try {
      const data = await api.post('/scan/exit', {
        qrCode: scanResult.qrCode,
        visitorId: scanResult.visitor?._id,
        exitMethod: scanResult.verificationMethod
      });
      setScanResult({
        type: 'success',
        message: 'Exit recorded successfully!',
        visitor: data.visitor,
        verificationMethod: scanResult.verificationMethod
      });
    } catch (error) {
      setScanResult({
        type: 'error',
        message: error.message || 'Exit failed',
        ...scanResult
      });
    }
  };

  const resetScan = () => {
    setScanResult(null);
    setScanning(false);
  };

  const handleMethodChange = (method) => {
    setVerificationMethod(method);
    resetScan();
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
        <h1 style={styles.title}>Visitor Verification</h1>
        <p style={styles.subtitle}>Verify visitor using QR Code, Face, or Thumbprint</p>
      </div>

      {/* Verification Method Selection */}
      <div style={styles.methodToggle}>
        <button
          style={{ 
            ...styles.methodBtn, 
            ...(verificationMethod === 'qr' ? styles.methodBtnActive : {}) 
          }}
          onClick={() => handleMethodChange('qr')}
        >
          <FiGrid style={{ marginRight: '8px' }} /> QR Code
        </button>
        <button
          style={{ 
            ...styles.methodBtn, 
            ...(verificationMethod === 'face' ? styles.methodBtnActive : {}) 
          }}
          onClick={() => handleMethodChange('face')}
        >
          <FiSmile style={{ marginRight: '8px' }} /> Face
        </button>
        <button
          style={{ 
            ...styles.methodBtn, 
            ...(verificationMethod === 'thumbprint' ? styles.methodBtnActive : {}) 
          }}
          onClick={() => handleMethodChange('thumbprint')}
        >
          <FiFingerprint style={{ marginRight: '8px' }} /> Thumbprint
        </button>
      </div>

      {/* Entry/Exit Mode Toggle */}
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
        {/* QR Code Mode */}
        {verificationMethod === 'qr' && !scanning && !scanResult && (
          <div style={styles.startSection}>
            <div style={styles.iconBox}>
              <FiCamera size={60} color="#2563eb" />
            </div>
            <h2 style={styles.sectionTitle}>Scan QR Code</h2>
            <p style={styles.sectionText}>
              Click the button below to start scanning visitor QR codes
            </p>
            <button onClick={startQRScanning} className="btn btn-primary" style={styles.startBtn}>
              <FiCamera style={{ marginRight: '8px' }} /> Start Scanning
            </button>
          </div>
        )}

        {verificationMethod === 'qr' && scanning && (
          <div style={styles.scannerSection}>
            <div id="qr-reader" style={styles.qrReader}></div>
            <button onClick={stopQRScanning} className="btn btn-secondary" style={styles.stopBtn}>
              Cancel
            </button>
          </div>
        )}

        {/* Face Verification Mode */}
        {verificationMethod === 'face' && !scanResult && (
          <div style={styles.startSection}>
            <div style={styles.iconBox}>
              <FiSmile size={60} color="#2563eb" />
            </div>
            <h2 style={styles.sectionTitle}>Face Verification</h2>
            <p style={styles.sectionText}>
              Use facial recognition to verify visitor identity
            </p>
            <button onClick={startFaceVerification} className="btn btn-primary" style={styles.startBtn}>
              <FiSmile style={{ marginRight: '8px' }} /> Start Face Scan
            </button>
          </div>
        )}

        {/* Thumbprint Verification Mode */}
        {verificationMethod === 'thumbprint' && !scanResult && (
          <div style={styles.startSection}>
            <div style={styles.iconBox}>
              <FiFingerprint size={60} color="#2563eb" />
            </div>
            <h2 style={styles.sectionTitle}>Thumbprint Verification</h2>
            <p style={styles.sectionText}>
              Use fingerprint scanning to verify visitor identity
            </p>
            <button onClick={startThumbprintVerification} className="btn btn-primary" style={styles.startBtn}>
              <FiFingerprint style={{ marginRight: '8px' }} /> Start Thumbprint Scan
            </button>
          </div>
        )}

        {/* Processing State */}
        {processing && (
          <div style={styles.processingSection}>
            <div className="loading-spinner" style={{ width: '40px', height: '40px' }}></div>
            <p style={{ marginTop: '16px' }}>
              {verificationMethod === 'qr' ? 'Verifying QR code...' : 
               verificationMethod === 'face' ? 'Verifying face...' : 'Verifying thumbprint...'}
            </p>
          </div>
        )}

        {/* Success Result */}
        {scanResult && scanResult.type === 'success' && !scanResult.message && (
          <div style={styles.resultSection}>
            <div style={styles.successIcon}>
              <FiCheck size={40} color="white" />
            </div>
            
            {scanResult.visitor?.photo && (
              <img 
                src={scanResult.visitor.photo} 
                alt={scanResult.visitor.name}
                style={styles.visitorPhoto}
              />
            )}
            
            <h3 style={styles.visitorName}>{scanResult.visitor?.name}</h3>
            
            <div style={styles.verificationBadge}>
              <span style={styles.badgeText}>
                Verified via: {scanResult.verificationMethod?.toUpperCase()}
              </span>
              {scanResult.matchConfidence && (
                <span style={styles.confidenceText}>
                  Confidence: {Math.round(scanResult.matchConfidence * 100)}%
                </span>
              )}
            </div>
            
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
                Verify Another
              </button>
            </div>
          </div>
        )}

        {/* Success with Message */}
        {scanResult && scanResult.message && scanResult.type === 'success' && (
          <div style={styles.resultSection}>
            <div style={styles.successIcon}>
              <FiCheck size={40} color="white" />
            </div>
            <h3>{scanResult.message}</h3>
            <button onClick={resetScan} className="btn btn-primary" style={styles.actionBtn}>
              Verify Another
            </button>
          </div>
        )}

        {/* Error Result */}
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

      {/* Face Capture Modal */}
      {showFaceCapture && (
        <FaceRecognition 
          onCapture={handleFaceCapture} 
          onClose={() => setShowFaceCapture(false)} 
        />
      )}

      {/* Thumbprint Capture Modal */}
      {showThumbprintCapture && (
        <ThumbprintCapture 
          onCapture={handleThumbprintCapture} 
          onClose={() => setShowThumbprintCapture(false)} 
        />
      )}
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
  methodToggle: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  methodBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    background: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s',
  },
  methodBtnActive: {
    borderColor: '#2563eb',
    background: '#eff6ff',
    color: '#2563eb',
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
  visitorPhoto: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '16px',
    border: '3px solid #2563eb',
  },
  visitorName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: '12px',
  },
  verificationBadge: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '16px',
  },
  badgeText: {
    fontSize: '12px',
    color: '#2563eb',
    fontWeight: '500',
    background: '#eff6ff',
    padding: '4px 12px',
    borderRadius: '12px',
    display: 'inline-block',
  },
  confidenceText: {
    fontSize: '12px',
    color: '#10b981',
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

