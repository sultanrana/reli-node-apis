import express from 'express';
import companyController from '../../controllers/admin/company.controller';
import passport from 'passport';
import upload from "../../libraries/multer";


export const companyRouter =  express.Router();
companyRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.listing);
companyRouter.post('/add', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.add);
companyRouter.post('/update/:id',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.update);
companyRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.detail);
companyRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.delete);
companyRouter.get('/companyDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), companyController.companyDetail);
