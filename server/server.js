import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/';
const HISTORY_FILE = path.join(process.cwd(), 'data', 'searchHistory.json');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Get weather by city name
app.post('/api/weather', async (req, res) => {
    try {
        const { cityName } = req.body;
        if (!cityName) return res.status(400).json({ error: 'City name is required' });

        const weatherUrl = `${BASE_URL}weather?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`;
        const forecastUrl = `${BASE_URL}forecast?q=${encodeURIComponent(cityName)}&appid=${API_KEY}&units=imperial`;

        const weatherResponse = await fetch(weatherUrl);
        const forecastResponse = await fetch(forecastUrl);

        if (!weatherResponse.ok || !forecastResponse.ok) {
            return res.status(500).json({ error: 'Failed to fetch weather data' });
        }

        const weatherData = await weatherResponse.json();
        const forecastData = await forecastResponse.json();
        const formattedData = formatWeatherData(weatherData, forecastData);

        await addCityToHistory(cityName);
        res.json(formattedData);
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
        res.status(500).json({ error: 'Error fetching search history' });
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Helper Functions
function formatWeatherData(weatherData, forecastData) {
    return [
        {
            city: weatherData.name,
            date: new Date(weatherData.dt * 1000).toLocaleDateString(),
            icon: weatherData.weather[0].icon,
            iconDescription: weatherData.weather[0].description,
            tempF: weatherData.main.temp,
            windSpeed: weatherData.wind.speed,
            humidity: weatherData.main.humidity,
        },
        ...forecastData.list.slice(0, 5).map(day => ({
            date: new Date(day.dt * 1000).toLocaleDateString(),
            icon: day.weather[0].icon,
            iconDescription: day.weather[0].description,
            tempF: day.main.temp,
            windSpeed: day.wind.speed,
            humidity: day.main.humidity,
        })),
    ];
}

// Read search history
async function readSearchHistory() {
    try {
        return JSON.parse(await fs.readFile(HISTORY_FILE, 'utf-8'));
    } catch {
        return [];
    }
}

// Add city to search history
async function addCityToHistory(city) {
    const history = await readSearchHistory();
    if (!history.some(c => c.name === city)) {
        history.push({ id: Date.now().toString(), name: city });
        await fs.writeFile(HISTORY_FILE, JSON.stringify(history, null, 2));
    }
}
