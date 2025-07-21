import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import analyticsRoutes from './routes/analytics';
import settingsRoutes from './routes/settings';
import adminsRoutes from './routes/admins';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admins', adminsRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('API running on port', PORT)); 