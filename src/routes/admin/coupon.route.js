import express from 'express';
import couponController from '../../controllers/admin/coupon.controller';
import passport from 'passport';
import upload from "../../libraries/multer";


export const couponRouter =  express.Router();
couponRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), couponController.listing);
couponRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), couponController.add);
couponRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), couponController.update);
couponRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), couponController.detail);
couponRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), couponController.delete);