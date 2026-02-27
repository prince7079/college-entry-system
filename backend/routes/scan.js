
const express = require('express');
const router = express.Router();
const Visitor = require('../models/Visitor');
const EntryLog = require('../models/EntryLog');
const { protect } = require('../middleware/auth');

// Euclidean distance for face descriptor matching
const euclideanDistance = (arr1, arr2) => {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < arr1.length; i++) {
    sum += Math.pow(arr1[i] - arr2[i], 2);
  }
  return Math.sqrt(sum);
};

// Face verification threshold (0.6 is standard for face-api.js)
const FACE_THRESHOLD = 0.6;

// Fingerprint matching threshold (similarity score)
const FINGERPRINT_THRESHOLD = 0.7;

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

// Face verification endpoint with proper matching
router.post('/verify/face', protect, async (req, res) => {
  try {
    const { faceDescriptor } = req.body;
    
    if (!faceDescriptor || faceDescriptor.length === 0) {
      return res.status(400).json({ verified: false, message: 'No face descriptor provided' });
    }

    // Find visitors with face descriptors
    const visitors = await Visitor.find({
      faceDescriptor: { $exists: true, $ne: [] }
    });

    if (visitors.length === 0) {
      return res.status(404).json({ verified: false, message: 'No registered visitors with face data' });
    }

    // Find best match
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const visitor of visitors) {
      const distance = euclideanDistance(faceDescriptor, visitor.faceDescriptor);
      if (distance < bestDistance && distance <= FACE_THRESHOLD) {
        bestDistance = distance;
        bestMatch = visitor;
      }
    }

    if (!bestMatch) {
      return res.status(404).json({ verified: false, message: 'Face not recognized' });
    }

    const existingEntry = await EntryLog.findOne({
      visitorId: bestMatch._id,
      status: 'inside'
    });

    res.json({
      verified: true,
      matchConfidence: 1 - (bestDistance / FACE_THRESHOLD),
      visitor: {
        _id: bestMatch._id,
        name: bestMatch.name,
        phone: bestMatch.phone,
        email: bestMatch.email,
        purpose: bestMatch.purpose,
        personToMeet: bestMatch.personToMeet,
        status: bestMatch.status,
        photo: bestMatch.photo
      },
      isInside: !!existingEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Thumbprint verification endpoint
router.post('/verify/thumbprint', protect, async (req, res) => {
  try {
    const { thumbprintTemplate, thumbprint } = req.body;
    
    if ((!thumbprintTemplate || thumbprintTemplate.length === 0) && !thumbprint) {
      return res.status(400).json({ verified: false, message: 'No thumbprint data provided' });
    }

    // Find visitors with thumbprint templates
    const visitors = await Visitor.find({
      $or: [
        { thumbprintTemplate: { $exists: true, $ne: [] } },
        { thumbprint: { $exists: true, $ne: '' } }
      ]
    });

    if (visitors.length === 0) {
      return res.status(404).json({ verified: false, message: 'No registered visitors with thumbprint data' });
    }

    let bestMatch = null;
    let bestScore = 0;

    for (const visitor of visitors) {
      let score = 0;
      
      // If client sends template, compare with stored template
      if (thumbprintTemplate && thumbprintTemplate.length > 0 && visitor.thumbprintTemplate && visitor.thumbprintTemplate.length > 0) {
        // Simple comparison - count matching elements
        const matches = thumbprintTemplate.filter((val, idx) => 
          visitor.thumbprintTemplate[idx] === val
        ).length;
        score = matches / Math.max(thumbprintTemplate.length, visitor.thumbprintTemplate.length);
      } 
      // If client sends base64 image, compare with stored image (simple comparison)
      else if (thumbprint && visitor.thumbprint && thumbprint === visitor.thumbprint) {
        score = 1;
      }

      if (score > bestScore && score >= FINGERPRINT_THRESHOLD) {
        bestScore = score;
        bestMatch = visitor;
      }
    }

    if (!bestMatch) {
      return res.status(404).json({ verified: false, message: 'Thumbprint not recognized' });
    }

    const existingEntry = await EntryLog.findOne({
      visitorId: bestMatch._id,
      status: 'inside'
    });

    res.json({
      verified: true,
      matchConfidence: bestScore,
      visitor: {
        _id: bestMatch._id,
        name: bestMatch.name,
        phone: bestMatch.phone,
        email: bestMatch.email,
        purpose: bestMatch.purpose,
        personToMeet: bestMatch.personToMeet,
        status: bestMatch.status,
        photo: bestMatch.photo
      },
      isInside: !!existingEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Enhanced verify endpoint with multiple methods
router.post('/verify', protect, async (req, res) => {
  try {
    const { qrCode, faceDescriptor, thumbprintTemplate, thumbprint, method } = req.body;
    
    let visitor = null;
    let verificationMethod = '';

    // QR Code verification
    if (qrCode) {
      visitor = await Visitor.findOne({ qrCode });
      verificationMethod = 'qr';
    }
    // Face verification
    else if (method === 'face' || (faceDescriptor && faceDescriptor.length > 0)) {
      const visitors = await Visitor.find({
        faceDescriptor: { $exists: true, $ne: [] }
      });
      
      let bestMatch = null;
      let bestDistance = Infinity;

      for (const v of visitors) {
        const distance = euclideanDistance(faceDescriptor, v.faceDescriptor);
        if (distance < bestDistance && distance <= FACE_THRESHOLD) {
          bestDistance = distance;
          bestMatch = v;
        }
      }
      
      if (bestMatch) {
        visitor = bestMatch;
        verificationMethod = 'face';
      }
    }
    // Thumbprint verification
    else if (method === 'thumbprint' || thumbprint || (thumbprintTemplate && thumbprintTemplate.length > 0)) {
      const visitors = await Visitor.find({
        $or: [
          { thumbprintTemplate: { $exists: true, $ne: [] } },
          { thumbprint: { $exists: true, $ne: '' } }
        ]
      });

      let bestMatch = null;
      let bestScore = 0;

      for (const v of visitors) {
        let score = 0;
        
        if (thumbprintTemplate && thumbprintTemplate.length > 0 && v.thumbprintTemplate && v.thumbprintTemplate.length > 0) {
          const matches = thumbprintTemplate.filter((val, idx) => 
            v.thumbprintTemplate[idx] === val
          ).length;
          score = matches / Math.max(thumbprintTemplate.length, v.thumbprintTemplate.length);
        } 
        else if (thumbprint && v.thumbprint && thumbprint === v.thumbprint) {
          score = 1;
        }

        if (score > bestScore && score >= FINGERPRINT_THRESHOLD) {
          bestScore = score;
          bestMatch = v;
        }
      }
      
      if (bestMatch) {
        visitor = bestMatch;
        verificationMethod = 'thumbprint';
      }
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
      verificationMethod,
      visitor: {
        _id: visitor._id,
        name: visitor.name,
        phone: visitor.phone,
        email: visitor.email,
        purpose: visitor.purpose,
        personToMeet: visitor.personToMeet,
        status: visitor.status,
        photo: visitor.photo
      },
      isInside: !!existingEntry
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

