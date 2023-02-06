import express from 'express';
import systemVariableController from '../../controllers/admin/systemVariable.controller';
import passport from 'passport';

export const systemVariableRouter = express.Router();

systemVariableRouter.post('/update/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), systemVariableController.update);
systemVariableRouter.get('/detail', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), systemVariableController.detail);