
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/visitor', require('./routes/visitor'));
app.use('/api/scan', require('./routes/scan'));
app.use('/api/entry', require('./routes/entry'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'College Entry System API is running' });
});

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

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

