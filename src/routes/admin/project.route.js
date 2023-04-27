import express from 'express';
import projectController from '../../controllers/admin/project.controller';
import passport from 'passport';
import upload from "../../libraries/multer";
import appController from "../../controllers/mobile/app.controller";
import {appRouter} from "../mobile/app.route";

export const projectRouter =  express.Router();
projectRouter.get('/listing', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), projectController.listing);
projectRouter.post('/assignProjectToUser', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }),  projectController.assignProjectToUser);
projectRouter.get('/detail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), projectController.detail);
//projectRouter.post('/update/:id', upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.update);

//projectRouter.post('/status/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.status);
//projectRouter.delete('/delete/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), customerController.delete);

projectRouter.get('/projectDetail/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), projectController.projectDetail);
projectRouter.post('/changeProjectStatus/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), projectController.changeProjectStatus);
