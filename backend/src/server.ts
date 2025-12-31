import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { db } from './config/firebase';

import authRoutes from './routes/auth';
import attendanceRoutes from './routes/attendance';
import reportRoutes from './routes/reports';
import adminRoutes from './routes/admin';
import screenshotRoutes from './routes/screenshots';
import { errorHandler, notFound } from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add permissive headers for development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://interntrack-alpha.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/screenshots', screenshotRoutes);

// Serve static files (screenshots)
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection test
db.collection('test').doc('connection').set({ connected: true, timestamp: new Date() })
  .then(() => {
    console.log('Connected to Firebase Firestore');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error: any) => {
    console.error('Firebase connection error:', error.message);
    console.log('Starting server without database...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (without database)`);
    });
  });

export default app;
