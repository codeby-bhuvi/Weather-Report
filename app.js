// Step 1: Add your API key
const apiKey = "1a2d3987479491701091f863e19e3701";

// Step 2: Choose a city
const city = "Mangalore";

// Step 3: Create API URL
const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

// Step 4: Fetch weather data
axios.get(url)
  .then(function (response) {
    // Step 5: Get data from response
    const data = response.data;

    // Step 6: Update HTML elements
    document.getElementById("city").textContent = data.name;
    document.getElementById("temperature").textContent =
      "Temperature: " + data.main.temp + "°C";
    document.getElementById("description").textContent =
      data.weather[0].description;

    const iconCode = data.weather[0].icon;
    document.getElementById("icon").src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
  })
  .catch(function (error) {
    console.log("Error:", error);
  });