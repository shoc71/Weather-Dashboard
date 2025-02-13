// imports
import express from 'express';
import { getCity } from './server.route.js';
import dotenv from 'dotenv';
import cors from 'cors';

// middleware
dotenv.config();
const router = express();
router.use(cors());
router.use(express.static(path.join(__dirname))); // Serve files from the root directory
const PORT = process.env.PORT || 3000;
router.use(express.json());

router.get('/', getCity);

// Serve index.html by default when visiting the root ("/") route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from the root directory
});

router.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
});
