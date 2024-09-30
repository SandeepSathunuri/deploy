import { body } from 'express-validator';

const validateRegisterUser = [
    body('username').trim().notEmpty().withMessage("please Enter Username"),
    body('password').isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
    body('password').matches(/[A-Z]/).withMessage("Password must have at least one uppercase character"),
    body('password').matches(/[a-z]/).withMessage("Password must have at least one lowercase character"),
    body('password').matches(/[0-9]/).withMessage("Password must have at least one numeric value"),
    body('password').matches(/[~!@#$%^&*()+{}[\],./?]/).withMessage("Password must have at least one special character"),
];

export default validateRegisterUser;
