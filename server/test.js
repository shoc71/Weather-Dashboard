// imports
import express from 'express';
import { getCity } from './server.route.js';

// middleware
const route = express();
route.use(express.json());

route.get('/', getCity);

route.listen(3000, () => {
    console.log('Server is running on port 3000');
});
