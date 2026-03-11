
const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const Visitor = require('../models/Visitor');
const { protect, admin } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const visitors = await Visitor.find().sort({ createdAt: -1 });
    res.json(visitors);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, phone, aadharNumber, purpose, department, personToMeet, photo, faceDescriptor, thumbprint, thumbprintTemplate } = req.body;
    const uniqueId = uuidv4();
    const qrCodeData = JSON.stringify({ id: uniqueId, visitorId: null });
    const qrCodeImage = await QRCode.toDataURL(qrCodeData);

    const visitor = await Visitor.create({
      name,
      email,
      phone,
      aadharNumber,
      purpose,
      department,
      personToMeet,
      photo,
      faceDescriptor,
      thumbprint,
      thumbprintTemplate,
      qrCode: uniqueId,
      status: 'pending'
    });

    const updatedQrCodeData = JSON.stringify({ id: uniqueId, visitorId: visitor._id });
    const updatedQrCodeImage = await QRCode.toDataURL(updatedQrCodeData);

    visitor.qrCode = uniqueId;
    await visitor.save();

    res.status(201).json({
      ...visitor.toObject(),
      qrCodeImage: updatedQrCodeImage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    const { name, email, phone, aadharNumber, purpose, department, personToMeet, status } = req.body;
    visitor.name = name || visitor.name;
    visitor.email = email || visitor.email;
    visitor.phone = phone || visitor.phone;
    visitor.aadharNumber = aadharNumber || visitor.aadharNumber;
    visitor.purpose = purpose || visitor.purpose;
    visitor.department = department || visitor.department;
    visitor.personToMeet = personToMeet || visitor.personToMeet;
    if (status) visitor.status = status;
    const updatedVisitor = await visitor.save();
    res.json(updatedVisitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/approve', protect, admin, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    visitor.status = 'approved';
    await visitor.save();
    res.json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/reject', protect, admin, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    visitor.status = 'rejected';
    await visitor.save();
    res.json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const visitor = await Visitor.findById(req.params.id);
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    await visitor.deleteOne();
    res.json({ message: 'Visitor removed' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/qr/:qrCode', protect, async (req, res) => {
  try {
    const visitor = await Visitor.findOne({ qrCode: req.params.qrCode });
    if (!visitor) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.json(visitor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

