// =========================
// 🌤 WEATHER APP (OOP)
// =========================

function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-container");

    this.init();
}

// =========================
// 🔁 INIT
// =========================
WeatherApp.prototype.init = function () {
    this.searchBtn.addEventListener(
        "click",
        this.handleSearch.bind(this)
    );

    this.cityInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            this.handleSearch();
        }
    });

    this.showWelcome();
};

// =========================
// 🌟 WELCOME
// =========================
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <h3>🌤 Welcome!</h3>
            <p>Enter a city name to get started.</p>
        </div>
    `;
};

// =========================
// 🔎 HANDLE SEARCH
// =========================
WeatherApp.prototype.handleSearch = function () {
    const city = this.cityInput.value.trim();

    if (!city) {
        this.showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        this.showError("City name is too short.");
        return;
    }

    this.getWeather(city);
    this.cityInput.value = "";
};

// =========================
// 🌤 GET WEATHER + FORECAST
// =========================
WeatherApp.prototype.getWeather = async function (city) {
    this.showLoading();

    this.searchBtn.disabled = true;
    this.searchBtn.textContent = "Searching...";

    const currentUrl = `${this.apiUrl}?q=${city}&appid=${this.apiKey}&units=metric`;

    try {
        const [currentWeather, forecastData] = await Promise.all([
            axios.get(currentUrl),
            this.getForecast(city)
        ]);

        this.displayWeather(currentWeather.data);
        this.displayForecast(forecastData);

    } catch (error) {
        console.error(error);
        this.showError("City not found. Please check spelling.");
    } finally {
        this.searchBtn.disabled = false;
        this.searchBtn.textContent = "Search";
    }
};

// =========================
// 📅 GET FORECAST
// =========================
WeatherApp.prototype.getForecast = async function (city) {
    const url = `${this.forecastUrl}?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await axios.get(url);
    return response.data;
};

// =========================
// 🧠 PROCESS FORECAST
// =========================
WeatherApp.prototype.processForecastData = function (data) {
    return data.list
        .filter(item => item.dt_txt.includes("12:00:00"))
        .slice(0, 5);
};

// =========================
// 🖼 DISPLAY WEATHER
// =========================
WeatherApp.prototype.displayWeather = function (data) {
    this.weatherDisplay.innerHTML = `
        <h2>${data.name}</h2>
        <p>🌡 Temperature: ${Math.round(data.main.temp)}°C</p>
        <p>🌥 ${data.weather[0].description}</p>
        <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
    `;
};

// =========================
// 🗓 DISPLAY FORECAST
// =========================
WeatherApp.prototype.displayForecast = function (data) {
    const days = this.processForecastData(data);

    const cards = days.map(day => {
        const date = new Date(day.dt * 1000);
        const name = date.toLocaleDateString("en-US", { weekday: "short" });

        return `
            <div class="forecast-card">
                <h4>${name}</h4>
                <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png">
                <p>${Math.round(day.main.temp)}°C</p>
                <small>${day.weather[0].description}</small>
            </div>
        `;
    }).join("");

    this.weatherDisplay.innerHTML += `
        <div class="forecast-section">
            <h3>5-Day Forecast</h3>
            <div class="forecast-container">
                ${cards}
            </div>
        </div>
    `;
};

// =========================
// ⏳ LOADING
// =========================
WeatherApp.prototype.showLoading = function () {
    this.weatherDisplay.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
};

// =========================
// ❌ ERROR
// =========================
WeatherApp.prototype.showError = function (message) {
    this.weatherDisplay.innerHTML = `
        <div class="error-message">
            <h3>⚠️ Oops!</h3>
            <p>${message}</p>
        </div>
    `;
};

// =========================
// 🚀 CREATE APP INSTANCE
// =========================
const app = new WeatherApp("1a2d3987479491701091f863e19e3701");