import express from 'express';
import { userRouter } from '../routes/admin/user.route';
import { couponRouter } from '../routes/admin/coupon.route';
import { systemVariableRouter } from '../routes/admin/systemVariable.route';
import { csvRouter } from '../routes/admin/csv.route';
import { serviceRouter } from '../routes/admin/service.route';
import { companyRouter } from '../routes/admin/company.route';
import { staffRouter } from '../routes/admin/staff.route';
import { customerRouter } from '../routes/admin/customer.route';
import { projectRouter } from '../routes/admin/project.route';
import { transactionRouter } from '../routes/admin/transaction.route';

export const adminRouter = express.Router();

adminRouter.use('/users', userRouter);
adminRouter.use('/coupons', couponRouter);
adminRouter.use('/system-variables', systemVariableRouter);
adminRouter.use('/csv', csvRouter);
adminRouter.use('/service', serviceRouter);
adminRouter.use('/company', companyRouter);
adminRouter.use('/staff', staffRouter);
adminRouter.use('/customers', customerRouter);
adminRouter.use('/projects', projectRouter);
adminRouter.use('/transactions', transactionRouter);

