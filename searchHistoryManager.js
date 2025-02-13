import fs from 'fs';

const SEARCH_HISTORY_FILE = './searchHistory.json'; // JSON file to store city searches

export const updateSearchHistory = (cityName, weatherData) => {
    let searchHistory = {};

    if (fs.existsSync(SEARCH_HISTORY_FILE)) {
        const fileData = fs.readFileSync(SEARCH_HISTORY_FILE, 'utf8');
        searchHistory = JSON.parse(fileData || "{}")
    }

    // Updated or add new city entry
    searchHistory[cityName] = {
        lastUpdated: new Date().toISOString(),
        data: weatherData
    };

    fs.writeFileSync(SEARCH_HISTORY_FILE, JSON.stringify(searchHistory, null, 4));
};

export const deleteSearchHistory = (cityName) => {
    if (fs.existsSync(SEARCH_HISTORY_FILE)) {
        const fileData = fs.readFileSync(SEARCH_HISTORY_FILE, 'utf8');
        let searchHistory = JSON.parse(fileData || "{}")

        if (searchHistory[cityName]) {
            delete searchHistory[cityName];
            fs.writeFileSync(SEARCH_HISTORY_FILE, JSON.stringify(searchHistory, null, 4));
            return true;
        }
    }

    return false; // Return flase if the city wasn't found
}