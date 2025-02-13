// imports
import axios from 'axios';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { updateSearchHistory, deleteSearchHistory } from './searchHistoryManager.js';

// middleware
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

// variables needed
const API_KEY = process.env.WEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';


// Function to get search history
export const getSearchHistory = () => {
    if (fs.existsSync(SEARCH_HISTORY_FILE)) {
        const fileData = fs.readFileSync(SEARCH_HISTORY_FILE, 'utf8');
        return JSON.parse(fileData || "{}"); // Parse the search history JSON
    }
    return {}; // Return empty object if file doesn't exist
};

export const getCity = async (req, res) => {
    try {
        console.log("Fetching weather data...");

        const cityName = req.query.city || 'San Diego'; // Get city from request or default to 'Brampton'
        console.log(`Fetching weather data for ${cityName}...`);

        const response = await axios.get(BASE_URL, {
            params: {
                q: cityName,
                appid: API_KEY,
                units: 'metric'
            }
        });

        // Get current date (YYYY-MM-DD format)
        const today = new Date().toISOString().split("T")[0];

        // Get the next 5 days (excluding today)
        const next5Days = Array.from({ length: 5 }, (_, i) => {
            const nextDay = new Date();
            nextDay.setDate(new Date().getDate() + (i + 1)); // Increment correctly
            return nextDay.toISOString().split("T")[0]; // Store YYYY-MM-DD
        });

        // Filter data: today's data + 9 AM for the next 5 days
        const filteredData = response.data.list
            .filter(item => {
                const [itemDate, itemTime] = item.dt_txt.split(" ");

                return (
                    itemDate === today ||
                    (next5Days.includes(itemDate) && itemTime === "09:00:00")
                );
            })
            .map(item => ({
                datetime: item.dt_txt,
                temperature: item.main.temp,
                feels_like: item.main.feels_like,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed,
                wind_direction: item.wind.deg
            }));

        // Update search history using the helper function
        updateSearchHistory(cityName, filteredData);

        res.status(200).json({ success: true, city: cityName, data: filteredData });
    } catch (error) {
        console.error("Error fetching weather data:", error.response ? error.response.data : error.message);
        res.status(error.response?.status || 500).json({
            success: false,
            message: error.response?.data?.message || "Server Error!"
        });
    }
};


export const deleteCity = async (req, res) => {
    const cityName = req.query.city;

    if (!cityName) {
        return res.status(400).json({ success: false, message: 'City name is required' });
    }

    const result = deleteSearchHistory(cityName);

    if (result) {
        res.status(200).json({ success: true, message: `Search history for ${cityName} deleted` });
    } else {
        res.status(404).json({ success: false, message: `No search history found for ${cityName}` });
    }
};