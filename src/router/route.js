import express from 'express';
import verifyToken from '../middleware/token.validation.js';
import validateUser from '../middleware/user.validation.js';
import {
    signup,
    login
} from '../controller/authController.js';
import {
    createStoryWithSlide,
    getStoryByCategory,
    getStorybyId,
    setbookmark,
    getbookmarkbyId,
    isLikedslides,
    unlikeSlides,
    likeslides,
    isbookmarked
} from '../controller/storyController.js';

const Router = express.Router; 
const authRouter = Router();

authRouter.post('/signup', validateUser, signup);
authRouter.post('/login', login);
authRouter.post('/createStoryWithSlide', createStoryWithSlide);
authRouter.get('/getStoryByCategory', getStoryByCategory);
authRouter.get('/getStorybyId', getStorybyId);
authRouter.post('/setbookmark', setbookmark);
authRouter.get('/getbookmarkbyId', getbookmarkbyId);
authRouter.get('/isbookmarked', isbookmarked);
authRouter.get('/isLikedslides', isLikedslides);
authRouter.post('/likeslides', likeslides);
authRouter.post('/unlikeSlides', unlikeSlides);

export default authRouter;
