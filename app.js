const API_KEY = "1a2d3987479491701091f863e19e3701";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

const searchBtn = document.getElementById("search-btn");
const cityInput = document.getElementById("city-input");
const weatherDisplay = document.getElementById("weather-container");

/* =========================
   🌤 GET WEATHER (ASYNC/AWAIT)
========================= */
async function getWeather(city) {

    showLoading();

    searchBtn.disabled = true;
    searchBtn.textContent = "Searching...";

    const url = `${API_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        console.log(response);
        displayWeather(response.data);

    } catch (error) {
        console.error("Error:", error);

        if (error.response && error.response.status === 404) {
            showError("City not found. Please check the spelling.");
        } else {
            showError("Something went wrong. Please try again.");
        }
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}
function displayWeather(data) {
  const weatherHTML = `
      <h2>${data.name}</h2>
      <p>🌡 Temperature: ${data.main.temp}°C</p>
      <p>🌥 ${data.weather[0].description}</p>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" />
  `;

  weatherDisplay.innerHTML = weatherHTML;

  cityInput.focus();
}

/* =========================
   ❌ ERROR HANDLING
========================= */
function showError(message) {
    const errorHTML = `
        <div class="error-message">
            <h3>⚠️ Oops!</h3>
            <p>${message}</p>
        </div>
    `;
    weatherDisplay.innerHTML = errorHTML;
}

/* =========================
   ⏳ LOADING STATE
========================= */
function showLoading() {
    const loadingHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>Loading weather data...</p>
        </div>
    `;
    weatherDisplay.innerHTML = loadingHTML;
}

/* =========================
   🔎 SEARCH FUNCTIONALITY
========================= */
function handleSearch() {
    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    if (city.length < 2) {
        showError("City name is too short.");
        return;
    }

    getWeather(city);
    cityInput.value = "";
}

searchBtn.addEventListener("click", handleSearch);

cityInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        handleSearch();
    }
});

/* =========================
   🌟 WELCOME MESSAGE
========================= */
weatherDisplay.innerHTML = `
    <div class="welcome-message">
        <h3>🌤 Welcome!</h3>
        <p>Enter a city name to get started.</p>
    </div>
`;