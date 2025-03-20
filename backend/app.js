// Import core modules
const express = require('express');
const app = express();
require('dotenv').config();
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

// Import models and database
const { sequelize, Chat } = require('./models');  // Fixed case issue

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const chatRoutes = require('./routes/chatRoutes');
const fileRoutes = require('./routes/fileRoutes');

// Swagger API Docs
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swagger');

// Middleware: Security and Parsing
app.use(helmet()); // Set security-related HTTP headers
app.use(cors());   // Enable CORS (configure origin in production)
app.use(express.json());  // Parse JSON request bodies
app.use(express.urlencoded({ extended: true }));  // Parse URL-encoded bodies (for form submissions)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 
// Serve static files (for file uploads, restrict via auth in routes)

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/files', fileRoutes);

// Swagger API Documentation Route
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Home Route
app.get('/', (req, res) => {
  res.send('PortHealth API is running');
});

// Create HTTP Server and Setup Socket.io
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Socket.io Authentication Middleware (JWT-based)
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error('Authentication error: No token provided'));
  }
  try {
    const user = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey');
    socket.user = user;
    return next();
  } catch (err) {
    return next(new Error('Authentication error: Invalid token'));
  }
});

// Handle WebSocket Connections
io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`Socket connected: user ${user.id}`);

  // Join a room named after the user ID for private messaging
  socket.join(String(user.id));

  // Handle chat messages
  socket.on('message', async (data) => {
    const { to, content } = data;
    if (!to || !content) return;
    try {
      // Save chat message to database
      await Chat.create({ sender_id: user.id, receiver_id: to, message: content });
      // Emit the message to the recipient
      io.to(String(to)).emit('message', { from: user.id, content, timestamp: new Date().toISOString() });
    } catch (err) {
      console.error('Chat message handling error:', err);
    }
  });

  // Handle user disconnection
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: user ${user.id}`);
  });
});

// Start the Server after Syncing Database
const PORT = process.env.PORT || 3000;
sequelize.sync()
  .then(() => {
    console.log('Database synced successfully ✅');
    // Import and start the cron job scheduler
    require('./utils/scheduler');
    server.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Failed to sync database:', err);
  });
