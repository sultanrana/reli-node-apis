import express from 'express';
import passport from 'passport';
import doorCasingController from "../../controllers/admin/doorCasing.controller";
import upload from "../../libraries/multer";

export const doorCasing =  express.Router();

doorCasing.post('/',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasingController.add);
doorCasing.get('/', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasingController.getAll);
doorCasing.get('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasingController.getOne);
doorCasing.patch('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasingController.update);
