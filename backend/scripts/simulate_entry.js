const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ioClient = require('socket.io-client');
const fetch = global.fetch || require('node-fetch');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));
const Visitor = require(path.join(__dirname, '..', 'models', 'Visitor'));

// Load dotenv from backend if present
try { require('dotenv').config({ path: path.join(__dirname, '..', '.env') }); } catch (e) {}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-entry';
const API_BASE = process.env.API_BASE || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'college-entry-secret-key';

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB');

  // Ensure approver user
  let approver = await User.findOne({ email: 'approver@local' });
  if (!approver) {
    approver = new User({ name: 'Approver', email: 'approver@local', role: 'staff', department: 'IT', password: 'password123' });
    await approver.save();
    console.log('Created approver:', approver._id.toString());
  } else console.log('Found approver:', approver._id.toString());

  // Ensure visitor
  let visitor = await Visitor.findOne({ email: 'visitor@local' });
  if (!visitor) {
    visitor = new Visitor({ name: 'Visitor One', email: 'visitor@local', phone: '9999999999', purpose: 'meeting', department: 'IT', personToMeet: 'Approver' });
    await visitor.save();
    console.log('Created visitor:', visitor._id.toString());
  } else console.log('Found visitor:', visitor._id.toString());

  const token = jwt.sign({ id: approver._id.toString() }, JWT_SECRET, { expiresIn: '1h' });
  console.log('Signed approver JWT');

  const socket = ioClient(API_BASE, { auth: { token }, transports: ['websocket'] });

  const timer = setTimeout(() => {
    console.error('Simulation timed out');
    socket.close();
    mongoose.disconnect().then(() => process.exit(1));
  }, 15000);

  socket.on('connect', async () => {
    console.log('Socket connected as', socket.id);
    // Call scan entry endpoint as approver
    const res = await fetch(`${API_BASE}/api/scan/entry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ visitorId: visitor._id.toString(), entryMethod: 'manual' })
    });
    const body = await res.json().catch(() => ({}));
    console.log('Entry API response status:', res.status, body.message || '');
  });

  socket.on('entry', (data) => {
    console.log('Socket received entry event:', data.event || '', data);
    clearTimeout(timer);
    socket.close();
    mongoose.disconnect().then(() => process.exit(0));
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connect error:', err.message);
    clearTimeout(timer);
    process.exit(1);
  });
}

main().catch(err => { console.error(err); process.exit(1); });
