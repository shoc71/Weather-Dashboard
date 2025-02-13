// imports
import express from 'express';
import { getCity } from './server.route.js';
import dotenv from 'dotenv';

// middleware
dotenv.config();
const route = express();
const PORT = process.env.PORT
route.use(express.json());

route.get('/', getCity);

route.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
});
