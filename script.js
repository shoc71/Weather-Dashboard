document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = "https://weather-dashboard-ymxb.onrender.com"; // Replace with your actual backend URL

    const searchButton = document.getElementById('search-button');
    const searchInput = document.getElementById('search-input');
    const cityNameEl = document.getElementById('city-name');
    const weatherIcon = document.getElementById('weather-icon');
    const tempEl = document.getElementById('temp');
    const windEl = document.getElementById('wind');
    const humidityEl = document.getElementById('humidity');
    const forecastContainer = document.getElementById('forecast-container');
    const historyContainer = document.getElementById('history-container');

    // Event Listener for Search Button
    searchButton.addEventListener('click', () => {
        const city = searchInput.value.trim();
        if (city) {
            fetchWeather(city);
        }
    });

    // Fetch Weather Data from Backend
    async function fetchWeather(city) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/weather`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cityName: city })
            });

            if (!response.ok) throw new Error('Failed to fetch weather data');

            const data = await response.json();
            displayWeather(data);
            fetchSearchHistory();
        } catch (error) {
            console.error('Error fetching weather:', error);
        }
    }

    // Display Weather Data
    function displayWeather(data) {
        const currentWeather = data[0];

        cityNameEl.textContent = `${currentWeather.city} (${currentWeather.date})`;
        weatherIcon.src = `https://openweathermap.org/img/w/${currentWeather.icon}.png`;
        weatherIcon.alt = currentWeather.iconDescription;
        tempEl.textContent = `Temperature: ${currentWeather.tempF}°F`;
        windEl.textContent = `Wind: ${currentWeather.windSpeed} MPH`;
        humidityEl.textContent = `Humidity: ${currentWeather.humidity}%`;

        forecastContainer.innerHTML = '';
        data.slice(1).forEach(day => {
            const card = document.createElement('div');
            card.classList.add('forecast-card');
            card.innerHTML = `
        <h4>${day.date}</h4>
        <img src="https://openweathermap.org/img/w/${day.icon}.png" alt="${day.iconDescription}">
        <p>Temp: ${day.tempF}°F</p>
        <p>Wind: ${day.windSpeed} MPH</p>
        <p>Humidity: ${day.humidity}%</p>
      `;
            forecastContainer.appendChild(card);
        });
    }

    // Fetch Search History from Backend
    async function fetchSearchHistory() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/weather/history`);
            if (!response.ok) throw new Error('Failed to fetch history');

            const history = await response.json();
            historyContainer.innerHTML = '';

            history.forEach(city => {
                const button = document.createElement('button');
                button.textContent = city.name;
                button.addEventListener('click', () => fetchWeather(city.name));
                historyContainer.appendChild(button);
            });
        } catch (error) {
            console.error('Error fetching history:', error);
        }
    }

    // Initial fetch of search history
    fetchSearchHistory();
});
