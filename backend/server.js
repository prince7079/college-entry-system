
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const helmet = require('helmet');
const morgan = require('morgan');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

const parseAllowedOrigins = () => {
  const raw = process.env.FRONTEND_ORIGIN;
  if (!raw) return process.env.NODE_ENV === 'production' ? [] : ['*'];
  return raw.split(',').map((item) => item.trim()).filter(Boolean);
};

const allowedOrigins = parseAllowedOrigins();
const corsOrigin =
  allowedOrigins.includes('*') || allowedOrigins.length === 0
    ? allowedOrigins.length === 0
      ? false
      : '*'
    : allowedOrigins;

// Middleware
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Configure CORS allowed origins from env (comma-separated)
app.use(cors(corsOrigin ? { origin: corsOrigin } : {}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/visitor', require('./routes/visitor'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/entry', require('./routes/entry'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

  // Test-only endpoint: emit an event to a room (useful for verifying socket room delivery)
  if (process.env.NODE_ENV !== 'production') {
    app.post('/socket/test-emit', express.json(), (req, res) => {
      const { roomType, value, event = 'test', payload = {} } = req.body || {};
      if (!io) return res.status(500).json({ error: 'socket not initialized' });
      try {
        if (roomType === 'global') {
          io.emit(event, { roomType: 'global', payload });
        } else {
          io.to(`${roomType}:${value}`).emit(event, { roomType, value, payload });
        }
        return res.json({ ok: true });
      } catch (err) {
        console.error('Test emit error:', err);
        return res.status(500).json({ error: err.message });
      }
    });
  } else {
    // In production the test helper is disabled
    app.post('/socket/test-emit', (req, res) => res.status(404).json({ error: 'Not found' }));
  }

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'College Entry System API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      visitor: '/api/visitor',
      scan: '/api/scan',
      entry: '/api/entry',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Socket.IO for realtime
const jwt = require('jsonwebtoken');
const { Server: IOServer } = require('socket.io');
const io = new IOServer(server, {
  cors: {
    origin: corsOrigin || '*',
    methods: ['GET', 'POST']
  }
});

// Socket auth middleware: expect token in `socket.handshake.auth.token`
const User = require('./models/User');
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth && socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error: token required'));
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'college-entry-secret-key');
    // Fetch full user from DB to get role/department
    User.findById(decoded.id).select('-password').then((user) => {
      if (!user) return next(new Error('Authentication error: user not found'));
      socket.user = user;
      return next();
    }).catch((err) => {
      console.error('Socket auth DB error:', err);
      return next(new Error('Authentication error'));
    });
  } catch (err) {
    console.error('Socket auth error:', err.message);
    return next(new Error('Authentication error'));
  }
});

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id, 'user:', socket.user && socket.user._id);
  // Join default rooms: global, role, department, user-specific
  try {
    socket.join('global');
    if (socket.user && socket.user.role) socket.join(`role:${socket.user.role}`);
    if (socket.user && socket.user.department) socket.join(`dept:${socket.user.department}`);
    if (socket.user && socket.user._id) socket.join(`user:${socket.user._id}`);
  } catch (e) {
    console.warn('Error joining rooms for socket', e);
  }
  socket.on('disconnect', () => console.log('Socket disconnected:', socket.id));
});

// Make io available to routes via app
app.set('io', io);

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  io.close();
  server.close(() => {
    console.log('Closed out remaining connections');
    process.exit(0);
  });
  // Force shutdown after 10s
  setTimeout(() => {
    console.error('Forcing shutdown');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
