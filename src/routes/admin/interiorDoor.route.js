import express from 'express';
import passport from 'passport';
import interiorDoor from "../../controllers/admin/interiorDoor.controller";
import upload from "../../libraries/multer";

export const interiorDoorRouter =  express.Router();

interiorDoorRouter.post('/',upload.any(), passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), interiorDoor.add);
interiorDoorRouter.get('/', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), interiorDoor.getAll);
interiorDoorRouter.get('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), interiorDoor.getOne);
interiorDoorRouter.patch('/:id', passport.authenticate('jwt', { session: false, failureRedirect: '/failure' }), interiorDoor.update);
