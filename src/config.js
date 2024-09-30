import dotenv from 'dotenv';

dotenv.config();

console.log('Loaded Environment Variables:');
console.log('SECRET_KEY:', process.env.SECRET_KEY);
console.log('DB:', process.env.DB);
console.log('PORT:', process.env.PORT);

export const config = {
    secret: process.env.SECRET_KEY,
    db: process.env.DB,
    PORT: process.env.PORT
};
