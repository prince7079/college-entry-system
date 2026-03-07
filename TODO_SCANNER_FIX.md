# Scanner System Fix Plan

## Problems Identified:

1. **Face Recognition - Only Simulated**: The FaceRecognition component generates random face descriptors instead of using real face-api.js
2. **Thumbprint - Only Simulated**: Random templates generated each time, can't match
3. **QR Code Format**: QR code verification may fail due to format mismatch

## Fix Steps Completed:

### Step 1: Download face-api.js models ✅
- Downloaded TinyFaceDetector, FaceLandmark68Net, FaceRecognitionNet models

### Step 2: Fix FaceRecognition.js ✅
- Implemented real face detection using face-api.js
- Uses TinyFaceDetector for detection
- Uses FaceLandmark68Net for landmarks
- Uses FaceRecognitionNet for descriptor extraction

### Step 3: Fix QR Code verification ✅
- Added JSON parsing for QR codes in entry, exit, and verify endpoints
- Handles both raw QR code values and JSON format

### Step 4: Fix Thumbprint ✅
- Made thumbprint template generation consistent per session
- Uses seeded random generator for deterministic matching

### Step 5: Create test visitor data ✅
- Added script to create test visitor with valid biometric data

---

## How to Add Data for Scanner:

1. **Register a new visitor**: Go to `/visitor` page and fill in the form
2. **Capture biometrics**: 
   - Click "Capture Face" to take a photo and get face descriptor
   - Click "Capture Thumbprint" to capture fingerprint
3. **Submit the form**: The biometric data will be saved with the visitor

### Testing the Scanner:

1. **QR Code Test**:
   - Register a visitor at `/visitor`
   - Go to `/scan` page
   - Select "QR Code" method
   - Scan the visitor's QR code

2. **Face Test**:
   - Register a visitor with face capture at `/visitor`
   - Go to `/scan` page
   - Select "Face" method
   - Capture face for verification

3. **Thumbprint Test**:
   - Register a visitor with thumbprint at `/visitor`
   - Go to `/scan` page
   - Select "Thumbprint" method
   - Scan thumbprint for verification

### Test Visitor Script:
Run `node backend/scripts/add-test-visitor.js` to create a test visitor with sample biometric data.

