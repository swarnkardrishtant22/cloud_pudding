
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const temperature = document.getElementById("temperature");
const cityName = document.getElementById("cityName");
const condition = document.getElementById("condition");
const celsius = document.getElementById("celsius");
const fahrenheit = document.getElementById("fahrenheit");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const feelsLike = document.getElementById("feelsLike");
const uvIndex = document.getElementById("uvIndex");

let currentTemp = 0;
let currentFeelsLike = 0;
let currentUnit = "C";

function getWeatherCondition(code) {
    if (code === 0) return "CLEAR SKY";
    if (code === 1) return "MAINLY CLEAR";
    if (code === 2) return "PARTLY CLOUDY";
    if (code === 3) return "OVERCAST";
    if ([45, 48].includes(code)) return "FOGGY";
    if ([51, 53, 55, 56, 57].includes(code)) return "DRIZZLE";
    if ([61, 63, 65, 66, 67].includes(code)) return "RAINY";
    if ([71, 73, 75, 77].includes(code)) return "SNOWFALL";
    if ([80, 81, 82].includes(code)) return "RAIN SHOWERS";
    if ([85, 86].includes(code)) return "SNOW SHOWERS";
    if ([95, 96, 99].includes(code)) return "THUNDERSTORM";
    return "WEATHER UPDATE";
}
async function searchWeather() {
    const city = cityInput.value.trim();

    if (city === "") {
        alert("Please enter a city name!");
        return;
    }

    searchBtn.disabled = true;
    searchBtn.textContent = "Loading...";

    try {

        const geoURL =
            "https://geocoding-api.open-meteo.com/v1/search?name=" +
            encodeURIComponent(city) +
            "&count=1&language=en&format=json";

        const geoResponse = await fetch(geoURL);

        if (!geoResponse.ok) {
            throw new Error("Could not search for this city.");
        }

        const geoData = await geoResponse.json();

        if (!geoData.results || geoData.results.length === 0) {
            alert("City not found. Please check the spelling.");
            return;
        }

        const place = geoData.results[0];


        const weatherURL =
            "https://api.open-meteo.com/v1/forecast" +
            "?latitude=" + place.latitude +
            "&longitude=" + place.longitude +
            "&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code" +
            "&daily=uv_index_max" +
            "&timezone=auto";

        const weatherResponse = await fetch(weatherURL);

        if (!weatherResponse.ok) {
            throw new Error("Could not fetch weather data.");
        }

        const weatherData = await weatherResponse.json();
        const current = weatherData.current;


        currentTemp = current.temperature_2m;
        currentFeelsLike = current.apparent_temperature;


        cityName.textContent = place.name + ", " + place.country;
        condition.textContent = getWeatherCondition(current.weather_code);

        humidity.textContent = current.relative_humidity_2m + "%";
        windSpeed.textContent = current.wind_speed_10m + " km/h";

        if (weatherData.daily.uv_index_max[0] != null) {
            uvIndex.textContent = weatherData.daily.uv_index_max[0];
        } else {
            uvIndex.textContent = "N/A";
        }

        updateTemperature();

    } catch (error) {
        console.error(error);
        alert("Weather load nahi hua. Internet connection check karke try again.");
    } finally {
        searchBtn.disabled = false;
        searchBtn.textContent = "Search";
    }
}

function updateTemperature() {
    let temp = currentTemp;
    let feels = currentFeelsLike;

    if (currentUnit === "F") {
        temp = (temp * 9 / 5) + 32;
        feels = (feels * 9 / 5) + 32;
    }

    temperature.textContent = Math.round(temp) + "°";
    feelsLike.textContent = Math.round(feels) + "°";

    celsius.classList.toggle("active-unit", currentUnit === "C");
    fahrenheit.classList.toggle("active-unit", currentUnit === "F");
}

searchBtn.addEventListener("click", searchWeather);

cityInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        searchWeather();
    }
});

celsius.addEventListener("click", function() {
    currentUnit = "C";
    updateTemperature();
});

fahrenheit.addEventListener("click", function() {
    currentUnit = "F";
    updateTemperature();
});

cityInput.value = "Chennai";
searchWeather();
