/**
 * Script to add a test visitor with biometric data for scanner testing
 * Run with: node backend/scripts/add-test-visitor.js
 */

const mongoose = require('mongoose');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-entry';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Visitor Schema (inline to avoid import issues)
const visitorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  aadharNumber: { type: String, trim: true },
  purpose: { type: String, required: true },
  department: { type: String, default: '' },
  personToMeet: { type: String, required: true, trim: true },
  qrCode: { type: String, unique: true, sparse: true },
  photo: { type: String, default: '' },
  faceDescriptor: { type: Array, default: [] },
  thumbprint: { type: String, default: '' },
  thumbprintTemplate: { type: Array, default: [] },
  status: { type: String, default: 'approved' },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Visitor = mongoose.model('Visitor', visitorSchema);

async function createTestVisitor() {
  try {
    // Check if test visitor already exists
    const existingVisitor = await Visitor.findOne({ email: 'test@visitor.com' });
    if (existingVisitor) {
      console.log('Test visitor already exists!');
      console.log('QR Code:', existingVisitor.qrCode);
      console.log('Face Descriptor length:', existingVisitor.faceDescriptor?.length);
      console.log('Thumbprint Template length:', existingVisitor.thumbprintTemplate?.length);
      await mongoose.disconnect();
      return;
    }

    // Generate unique ID for QR code
    const uniqueId = uuidv4();
    
    // Generate QR code
    const qrCodeData = JSON.stringify({ id: uniqueId, visitorId: null });
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    // Generate a consistent face descriptor (128 values between -1 and 1)
    // This simulates real face descriptor data
    const faceDescriptor = Array(128).fill(0).map(() => (Math.random() * 2 - 1));
    
    // Generate consistent thumbprint template (64 values between 0.3 and 0.9)
    const thumbprintTemplate = Array(64).fill(0).map(() => 0.3 + Math.random() * 0.6);
    
    // Generate a placeholder photo (base64 green square)
    const photo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    // Generate a placeholder thumbprint image
    const thumbprint = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    const visitor = await Visitor.create({
      name: 'Test Visitor',
      email: 'test@visitor.com',
      phone: '+91 9876543210',
      aadharNumber: '1234 5678 9012',
      purpose: 'official',
      department: 'Computer Science',
      personToMeet: 'Dr. Smith',
      qrCode: uniqueId,
      photo,
      faceDescriptor,
      thumbprint,
      thumbprintTemplate,
      status: 'approved'
    });

    console.log('Test visitor created successfully!');
    console.log('====================');
    console.log('Name:', visitor.name);
    console.log('Email:', visitor.email);
    console.log('Phone:', visitor.phone);
    console.log('QR Code:', visitor.qrCode);
    console.log('Face Descriptor length:', visitor.faceDescriptor.length);
    console.log('Thumbprint Template length:', visitor.thumbprintTemplate.length);
    console.log('Status:', visitor.status);
    console.log('====================');
    console.log('\nYou can use this QR code to test the scanner:');
    console.log('QR Code Value:', uniqueId);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error creating test visitor:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

createTestVisitor();

