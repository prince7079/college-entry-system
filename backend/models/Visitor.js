
const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  aadharNumber: {
    type: String,
    trim: true
  },
  purpose: {
    type: String,
    required: true,
    enum: ['official', 'personal', 'interview', 'meeting', 'delivery', 'other']
  },
  department: {
    type: String,
    default: ''
  },
  personToMeet: {
    type: String,
    required: true,
    trim: true
  },
  qrCode: {
    type: String,
    unique: true,
    sparse: true
  },
  photo: {
    type: String,
    default: ''
  },
  faceDescriptor: {
    type: Array,
    default: []
  },
  thumbprint: {
    type: String,
    default: ''
  },
  thumbprintTemplate: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'checked-in', 'checked-out'],
    default: 'pending'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Visitor', visitorSchema);

