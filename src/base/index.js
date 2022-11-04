import express from 'express';
import { adminRouter } from './admin';

export const restRouter = express.Router();
restRouter.use('/admin', adminRouter);
