// imports
import express from 'express';
import { getCity } from './server.route.js';
import dotenv from 'dotenv';
import cors from 'cors';

// middleware
dotenv.config();
const router = express();
router.use(cors());
const PORT = process.env.PORT
router.use(express.json());

router.get('/', getCity);

router.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
});
