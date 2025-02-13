document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("search-input");
    const searchButton = document.getElementById("search-button");
    const historyContainer = document.getElementById("history-container");

    const cityNameEl = document.getElementById("city-name");
    const tempEl = document.getElementById("temp");
    const windEl = document.getElementById("wind");
    const humidityEl = document.getElementById("humidity");
    const weatherIconEl = document.getElementById("weather-icon");

    const forecastContainer = document.getElementById("forecast-container");

    const API_BASE_URL = "http://localhost:3000/"; // Adjust as needed

    // Fetch weather data
    const fetchWeather = async (city) => {
        try {
            const response = await fetch(`${API_BASE_URL}?city=${city}`);
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.message || "Error fetching weather data");
            }

            // Update current weather section
            cityNameEl.textContent = data.city;
            tempEl.textContent = `Temperature: ${data.data[0].temperature}°C`;
            windEl.textContent = `Wind: ${data.data[0].wind_speed} m/s`;
            humidityEl.textContent = `Humidity: ${data.data[0].humidity}%`;

            // Set weather icon (if applicable)
            if (data.data[0].icon) {
                weatherIconEl.src = `http://openweathermap.org/img/wn/${data.data[0].icon}.png`;
            }

            // Update 5-day forecast
            forecastContainer.innerHTML = "";
            data.data.slice(1).forEach(day => {
                const card = document.createElement("div");
                card.classList.add("forecast-card");
                card.innerHTML = `
                    <p>${day.datetime.split(" ")[0]}</p>
                    <p>Temp: ${day.temperature}°C</p>
                    <p>Wind: ${day.wind_speed} m/s</p>
                    <p>Humidity: ${day.humidity}%</p>
                `;
                forecastContainer.appendChild(card);
            });

            // Update search history in the frontend
            updateSearchHistory(city);
        } catch (error) {
            console.error("Error:", error.message);
            alert("Failed to fetch weather data. Please try again.");
        }
    };

    // Load search history from local JSON file
    const loadSearchHistory = () => {
        fetch("./searchHistory.json")
            .then(response => response.json())
            .then(historyData => {
                historyContainer.innerHTML = "";
                Object.keys(historyData).forEach(city => {
                    const btn = document.createElement("button");
                    btn.textContent = city;
                    btn.addEventListener("click", () => fetchWeather(city));
                    historyContainer.appendChild(btn);
                });
            })
            .catch(error => console.error("Error loading history:", error.message));
    };

    // Update search history (adds button dynamically)
    const updateSearchHistory = (city) => {
        const existingButtons = Array.from(historyContainer.children).map(btn => btn.textContent);
        if (!existingButtons.includes(city)) {
            const btn = document.createElement("button");
            btn.textContent = city;
            btn.addEventListener("click", () => fetchWeather(city));
            historyContainer.appendChild(btn);
        }
    };

    // Event listeners
    searchButton.addEventListener("click", () => {
        event.preventDefault(); 
        const city = searchInput.value.trim();
        if (city) fetchWeather(city);
    });

    searchInput.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            searchButton.click();
        }
    });

    // Load previous history on page load
    loadSearchHistory();
});
