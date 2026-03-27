const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const ioClient = require('socket.io-client');
const fetch = global.fetch || require('node-fetch');
const path = require('path');

const User = require(path.join(__dirname, '..', 'models', 'User'));

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/college-entry';
const API_BASE = process.env.API_BASE || 'http://localhost:5001';
const JWT_SECRET = process.env.JWT_SECRET || 'college-entry-secret-key';

// Load backend .env if present so JWT_SECRET matches server
try {
  require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
} catch (e) {
  // ignore
}

// Re-read after dotenv
const JWT_SECRET_FINAL = process.env.JWT_SECRET || JWT_SECRET;

async function main() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for test');

  let user = await User.findOne({ email: 'socket-test@local' });
  if (!user) {
    user = new User({
      name: 'Socket Test',
      email: 'socket-test@local',
      role: 'staff',
      department: 'QA',
      password: 'test-password'
    });
    await user.save();
    console.log('Created test user:', user._id.toString());
  } else {
    console.log('Found test user:', user._id.toString());
  }

  const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET_FINAL, { expiresIn: '1h' });
  console.log('Signed JWT for user');

  const socket = ioClient(API_BASE, {
    auth: { token },
    transports: ['websocket']
  });

  let received = 0;
  const expected = 4;
  const timer = setTimeout(() => {
    console.warn('Test timed out');
    socket.close();
    process.exit(1);
  }, 15000);

  socket.on('connect', async () => {
    console.log('Socket connected as', socket.id);
    // Trigger emits for user, role, dept and global
    const targets = [
      { roomType: 'user', value: user._id.toString() },
      { roomType: 'role', value: user.role },
      { roomType: 'dept', value: user.department },
      { roomType: 'global', value: null }
    ];

    for (const t of targets) {
      await fetch(`${API_BASE}/socket/test-emit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomType: t.roomType, value: t.value, event: 'test', payload: { from: 'socket_test' } })
      });
      await new Promise(r => setTimeout(r, 300));
    }
  });

  socket.on('test', (data) => {
    console.log('Received test event:', data);
    received += 1;
    if (received >= expected) {
      clearTimeout(timer);
      console.log('All test messages received — success');
      socket.close();
      mongoose.disconnect().then(() => process.exit(0));
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Connect error:', err.message);
    clearTimeout(timer);
    process.exit(1);
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
