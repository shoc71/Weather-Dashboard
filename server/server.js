import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

// middleware
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const HISTORY_FILE = 'searchHistory.json';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get weather by city name
app.post('/api/weather', async (req, res) => {
    try {
        const { cityName } = req.body;
        const url = `${BASE_URL}weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`;
        const response = await fetch(url);
        const data = await response.json();
        await addCityToHistory(cityName);
        res.json([formatWeatherData(data)]);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching weather data' });
    }
});

// Get search history
app.get('/api/weather/history', async (_req, res) => {
    try {
        const history = await readSearchHistory();
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching history' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Helper functions
function formatWeatherData(data) {
    return {
        city: data.name,
        date: new Date(data.dt * 1000).toLocaleDateString(),
        icon: data.weather[0].icon,
        tempF: data.main.temp,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
    };
}

async function readSearchHistory() {
    try {
        return JSON.parse(await fs.readFile(HISTORY_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

async function addCityToHistory(city) {
    const history = await readSearchHistory();
    history.push({ name: city });
    await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
}
