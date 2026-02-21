
const express = require('express');
const router = express.Router();
const EntryLog = require('../models/EntryLog');
const { protect } = require('../middleware/auth');

router.get('/logs', protect, async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) {
      query.status = status;
    }
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.entryTime = { $gte: startDate, $lte: endDate };
    }
    const logs = await EntryLog.find(query)
      .populate('approvedBy', 'name department')
      .sort({ entryTime: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await EntryLog.countDocuments(query);
    res.json({
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      total
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/stats', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      todayVisitors,
      weekVisitors,
      monthVisitors,
      totalVisitors,
      currentlyInside,
      todayExits
    ] = await Promise.all([
      EntryLog.countDocuments({ entryTime: { $gte: today, $lt: tomorrow } }),
      EntryLog.countDocuments({ entryTime: { $gte: weekStart } }),
      EntryLog.countDocuments({ entryTime: { $gte: monthStart } }),
      EntryLog.countDocuments(),
      EntryLog.countDocuments({ status: 'inside' }),
      EntryLog.countDocuments({ exitTime: { $gte: today, $lt: tomorrow } })
    ]);

    const purposeStats = await EntryLog.aggregate([
      { $group: { _id: '$purpose', count: { $sum: 1 } } }
    ]);

    const hourlyStats = await EntryLog.aggregate([
      { $match: { entryTime: { $gte: today, $lt: tomorrow } } },
      { $group: { _id: { $hour: '$entryTime' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      todayVisitors,
      weekVisitors,
      monthVisitors,
      totalVisitors,
      currentlyInside,
      todayExits,
      purposeStats,
      hourlyStats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const log = await EntryLog.findById(req.params.id)
      .populate('approvedBy', 'name department')
      .populate('visitorId');
    if (!log) {
      return res.status(404).json({ message: 'Entry log not found' });
    }
    res.json(log);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/visitor/:visitorId', protect, async (req, res) => {
  try {
    const logs = await EntryLog.find({ visitorId: req.params.visitorId })
      .populate('approvedBy', 'name')
      .sort({ entryTime: -1 });
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

