import express from 'express';
import staffController from '../../controllers/admin/staff.controller';
import passport from 'passport';
import upload from "../../libraries/multer";

export const staffRouter = express.Router();

staffRouter.get('/listing/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), staffController.listing);
staffRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), staffController.add);
staffRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), staffController.update);
staffRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), staffController.detail);
staffRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), staffController.delete);