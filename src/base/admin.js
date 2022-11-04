import express from 'express';
import { userRouter } from '../routes/admin/user.route';

export const adminRouter = express.Router();

adminRouter.use('/users', userRouter);



