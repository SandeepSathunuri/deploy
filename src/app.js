import express from 'express';
import bodyParser from 'body-parser';
import authRouter from './router/route.js';
import cors from 'cors';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors({
    origin: ['http://localhost:3000'],
    methods: 'GET,POST,PUT,DELETE',
    credentials: true
}));

app.use('/api', authRouter);

export default app;
