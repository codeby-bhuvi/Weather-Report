// =========================
// 🌤 WEATHER APP (OOP)
// =========================

function WeatherApp(apiKey) {
    this.apiKey = apiKey;

    this.apiUrl = "https://api.openweathermap.org/data/2.5/weather";
    this.forecastUrl = "https://api.openweathermap.org/data/2.5/forecast";

    // Existing elements
    this.searchBtn = document.getElementById("search-btn");
    this.cityInput = document.getElementById("city-input");
    this.weatherDisplay = document.getElementById("weather-container");

    // ✅ NEW: Recent searches elements
    this.recentSearchesSection = document.getElementById("recent-searches-section");
    this.recentSearchesContainer = document.getElementById("recent-searches-container");
    this.clearHistoryBtn = document.getElementById("clear-history-btn");

    // ✅ NEW: Data storage
    this.recentSearches = [];
    this.maxRecentSearches = 5;

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

    // ✅ NEW
    this.loadRecentSearches();
    this.loadLastCity();

    if (this.clearHistoryBtn) {
        this.clearHistoryBtn.addEventListener(
            "click",
            this.clearHistory.bind(this)
        );
    }
};

// =========================
// 🌟 WELCOME
// =========================
WeatherApp.prototype.showWelcome = function () {
    this.weatherDisplay.innerHTML = `
        <div class="welcome-message">
            <h3>🌤 Welcome!</h3>
            <p>Search for a city to get started.</p>
            <p><small>Try: London, Paris, Tokyo</small></p>
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

        // ✅ NEW
        this.saveRecentSearch(city);
        localStorage.setItem("lastCity", city);

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
        <p>🌡 ${Math.round(data.main.temp)}°C</p>
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
// 💾 RECENT SEARCHES
// =========================
WeatherApp.prototype.loadRecentSearches = function () {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
        this.recentSearches = JSON.parse(saved);
    }
    this.displayRecentSearches();
};

WeatherApp.prototype.saveRecentSearch = function (city) {
    const cityName =
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();

    const index = this.recentSearches.indexOf(cityName);
    if (index !== -1) {
        this.recentSearches.splice(index, 1);
    }

    this.recentSearches.unshift(cityName);

    if (this.recentSearches.length > this.maxRecentSearches) {
        this.recentSearches.pop();
    }

    localStorage.setItem(
        "recentSearches",
        JSON.stringify(this.recentSearches)
    );

    this.displayRecentSearches();
};

WeatherApp.prototype.displayRecentSearches = function () {
    this.recentSearchesContainer.innerHTML = "";

    if (this.recentSearches.length === 0) {
        this.recentSearchesSection.style.display = "none";
        return;
    }

    this.recentSearchesSection.style.display = "block";

    this.recentSearches.forEach(function (city) {
        const btn = document.createElement("button");
        btn.className = "recent-search-btn";
        btn.textContent = city;

        btn.addEventListener("click", function () {
            this.cityInput.value = city;
            this.getWeather(city);
        }.bind(this));

        this.recentSearchesContainer.appendChild(btn);
    }.bind(this));
};

// =========================
// 🧼 CLEAR HISTORY
// =========================
WeatherApp.prototype.clearHistory = function () {
    if (confirm("Clear all recent searches?")) {
        this.recentSearches = [];
        localStorage.removeItem("recentSearches");
        this.displayRecentSearches();
    }
};

// =========================
// 🔁 LOAD LAST CITY
// =========================
WeatherApp.prototype.loadLastCity = function () {
    const lastCity = localStorage.getItem("lastCity");

    if (lastCity) {
        this.getWeather(lastCity);
    } else {
        this.showWelcome();
    }
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