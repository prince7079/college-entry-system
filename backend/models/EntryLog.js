
const mongoose = require('mongoose');

const entryLogSchema = new mongoose.Schema({
  visitorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visitor',
    required: true
  },
  visitorName: {
    type: String,
    required: true
  },
  visitorPhone: {
    type: String
  },
  entryTime: {
    type: Date,
    default: Date.now
  },
  exitTime: {
    type: Date
  },
  entryMethod: {
    type: String,
    enum: ['qr', 'face', 'manual'],
    default: 'qr'
  },
  exitMethod: {
    type: String,
    enum: ['qr', 'face', 'manual'],
    default: 'qr'
  },
  entryPhoto: {
    type: String
  },
  exitPhoto: {
    type: String
  },
  purpose: {
    type: String
  },
  personToMeet: {
    type: String
  },
  status: {
    type: String,
    enum: ['inside', 'exited'],
    default: 'inside'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
entryLogSchema.index({ entryTime: -1 });
entryLogSchema.index({ visitorId: 1 });
entryLogSchema.index({ status: 1 });

module.exports = mongoose.model('EntryLog', entryLogSchema);

