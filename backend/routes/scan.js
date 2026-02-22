
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const EntryLog = require('../models/EntryLog');
const { protect } = require('../middleware/auth');

router.post('/entry', protect, async (req, res) => {
  try {
    const { qrCode, visitorId, photo, faceDescriptor, entryMethod } = req.body;
    let visitor;
    if (qrCode) {
      visitor = await Visitor.findOne({ qrCode });
    } else if (visitorId) {
      visitor = await Visitor.findById(visitorId);
    }
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    const existingEntry = await EntryLog.findOne({
      visitorId: visitor._id,
      status: 'inside'
    });
    if (existingEntry) {
      return res.status(400).json({ message: 'Visitor is already inside' });
    }
    if (visitor.status === 'rejected') {
      return res.status(400).json({ message: 'Visitor access denied' });
    }
    visitor.status = 'checked-in';
    visitor.checkInTime = new Date();
    await visitor.save();
    const entryLog = await EntryLog.create({
      visitorId: visitor._id,
      visitorName: visitor.name,
      visitorPhone: visitor.phone,
      entryTime: new Date(),
      entryMethod: entryMethod || 'qr',
      entryPhoto: photo,
      purpose: visitor.purpose,
      personToMeet: visitor.personToMeet,
      status: 'inside',
      approvedBy: req.user._id
    });
    // Emit realtime event to targeted rooms (user who approved, visitor dept) and global
    try {
      const io = req.app.get('io');
      if (io) {
        // Send to user who approved the entry
        if (entryLog.approvedBy) io.to(`user:${entryLog.approvedBy}`).emit('entry', { visitor, entryLog });
        // Send to department associated with the visitor (if set)
        if (visitor.department) io.to(`dept:${visitor.department}`).emit('entry', { visitor, entryLog });
        // Also notify global room for backward compatibility
        io.to('global').emit('entry', { visitor, entryLog });
      }
    } catch (e) {
      console.error('Socket emit error (entry):', e);
    }
    res.status(201).json({
      message: 'Entry recorded successfully',
      visitor,
      entryLog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/exit', protect, async (req, res) => {
  try {
    const { qrCode, visitorId, photo, exitMethod } = req.body;
    let visitor;
    if (qrCode) {
      visitor = await Visitor.findOne({ qrCode });
    } else if (visitorId) {
      visitor = await Visitor.findById(visitorId);
    }
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    const entryLog = await EntryLog.findOne({
      visitorId: visitor._id,
      status: 'inside'
    });
    if (!entryLog) {
      return res.status(400).json({ message: 'No active entry found for this visitor' });
    }
    visitor.status = 'checked-out';
    visitor.checkOutTime = new Date();
    await visitor.save();
    entryLog.exitTime = new Date();
    entryLog.exitMethod = exitMethod || 'qr';
    entryLog.exitPhoto = photo;
    entryLog.status = 'exited';
    await entryLog.save();
    // Emit realtime event to targeted rooms (user who approved, visitor dept) and global
    try {
      const io = req.app.get('io');
      if (io) {
        if (entryLog.approvedBy) io.to(`user:${entryLog.approvedBy}`).emit('exit', { visitor, entryLog });
        if (visitor.department) io.to(`dept:${visitor.department}`).emit('exit', { visitor, entryLog });
        io.to('global').emit('exit', { visitor, entryLog });
      }
    } catch (e) {
      console.error('Socket emit error (exit):', e);
    }
    res.json({
      message: 'Exit recorded successfully',
      visitor,
      entryLog
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/verify', protect, async (req, res) => {
  try {
    const { qrCode, faceDescriptor } = req.body;
    let visitor;
    if (qrCode) {
      visitor = await Visitor.findOne({ qrCode });
    } else if (faceDescriptor && faceDescriptor.length > 0) {
      visitor = await Visitor.findOne({
        faceDescriptor: { $exists: true, $ne: [] }
      });
    }
    if (!visitor) {
      return res.status(404).json({ verified: false, message: 'Visitor not found' });
    }
    const existingEntry = await EntryLog.findOne({
      visitorId: visitor._id,
      status: 'inside'
    });
    res.json({
      verified: true,
      visitor: {
        _id: visitor._id,
        name: visitor.name,
        purpose: visitor.purpose,
        personToMeet: visitor.personToMeet,
        status: visitor.status
      },
      isInside: !!existingEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

