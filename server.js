// imports
import express from 'express';
import { getCity } from './server.route.js';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
dotenv.config();
const router = express();
router.use(cors({
    origin: '*', // Change to frontend URL if needed
    methods: 'GET,POST'
})); // Allow all origins
router.use(express.static(__dirname)); // Serve files from the root directory
const PORT = process.env.PORT || 3000;
router.use(express.json());

router.get('/weather', getCity);

// Serve index.html by default when visiting the root ("/") route
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // Serve index.html from the root directory
});

router.listen(PORT, () => {
    console.log('Server is running on port ', PORT);
});
