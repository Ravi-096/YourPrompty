import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { connectDB } from './config/db.js';

import authRoutes from './routes/auth.js';
import promptRoutes from './routes/prompts.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chat.js'; 
import notificationRoutes from './routes/notifications.js';
import { errorHandler } from './middleware/errorHandler.js';
const app = express();
await connectDB();



app.use(cors({
  origin: ['https://your-prompty-digs3aso6-ravi-096s-projects.vercel.app/','http://localhost:5173'], 
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(cookieParser());

// Global rate limit
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200 }));

app.use('/api/auth',    authRoutes);
app.use('/api/prompts', promptRoutes);
app.use('/api/users',   userRoutes);
app.use('/api/chat',    chatRoutes);

app.use('/api/notifications', notificationRoutes);
app.use(errorHandler);
app.listen(process.env.PORT, () =>{
  console.log(`Server on port ${process.env.PORT}`)
  console.log('running...')}
);