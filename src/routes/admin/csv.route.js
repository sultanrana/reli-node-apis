import express from 'express';
import passport from 'passport';
import csvController from "../../controllers/admin/csv.controller";
import upload from "../../libraries/multer";

export const csvRouter =  express.Router();

csvRouter.post('/upload-csv',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), csvController.uploadCsv);
csvRouter.get('/export-csv', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), csvController.exportCsv);