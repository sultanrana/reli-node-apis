import express from 'express';
import { adminRouter } from './admin';
import { apiRouter } from './mobile';
import appController from '../controllers/mobile/app.controller';

export const restRouter = express.Router();

restRouter.use('/admin', adminRouter);

restRouter.use('/mobile', apiRouter);

