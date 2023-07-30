import express from 'express';
import passport from 'passport';
import doorCasing from "../../controllers/admin/doorCasing.controller";
import upload from "../../libraries/multer";

export const doorCasing =  express.Router();

doorCasing.post('/',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasing.add);
doorCasing.get('/', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasing.getAll);
doorCasing.get('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasing.getOne);
doorCasing.patch('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), doorCasing.update);
