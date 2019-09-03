import { Router } from 'express';
import multer from 'multer';
import UserController from './app/controllers/UserController';
import SessionController from './app/controllers/SessionController';
import Filecontroller from './app/controllers/FileController';
import MeetupController from './app/controllers/MeetupController';
import RegisterController from './app/controllers/RegisterController';
import authMiddleware from './middlewares/auth';
import multerConfig from './config/multer';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/session', SessionController.store);

routes.use(authMiddleware);
routes.post('/files/:meetupID', upload.single('avatar'), Filecontroller.store);

routes.put('/users', UserController.update);

routes.get('/meetup', MeetupController.index);
routes.post('/meetup', MeetupController.store);
routes.put('/meetup/:meetupID', MeetupController.update);
routes.delete('/meetup/:meetupID', MeetupController.delete);

routes.post('/registration/:meetupID', RegisterController.store);

export default routes;
