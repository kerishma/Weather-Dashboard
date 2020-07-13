const openweathermapAPI = '187f20e284dffe8a5db97bfb4433baaa';
const latLonAPI = 'b0f5ee89c9564d9588d578cb862ebf87';
let searchedLocations = [];

// Checking if localstorage already has history
if (localStorage.getItem("locHistory") != null) {
    searchedLocations = JSON.parse(localStorage.getItem("locHistory"))
}

//Check the locations array then load if its not empty
if (searchedLocations.length != 0) {
    getLatLon(searchedLocations[searchedLocations.length - 1]);
    manageHistory();
} else {
    manageHistory();
}

//Handling the localstorage here for the searched locations
function manageHistory(cityName) {

    if (cityName != null || cityName != undefined) {
        let city = cityName.toLowerCase();
        searchedLocations.push(city);
        const uniqueArr = new Set(searchedLocations);
        searchedLocations = [...uniqueArr];
        localStorage.setItem("locHistory", JSON.stringify(searchedLocations));
    }

    $("#cityHistButtons").empty();

    for (let i = 0; i < searchedLocations.length; i++) {
        let cityBtn = $(`<button type='button' class='list-group-item list-group-item-action' id='cityHistory' onclick='getLatLon(event.target.textContent)'>${searchedLocations[i]}</button>`);
        $("#cityHistButtons").append(cityBtn);

    }

}

// This is where we get the longitude and latitude of the city by name
// Openweather map accepts lat and lon
function getLatLon(lastCity) {
    let cityName = $("#cityName").val();

    if (cityName != "") {
        $.get(`https://api.opencagedata.com/geocode/v1/json?q=${cityName}&key=${latLonAPI}`, function (data, status) {
            if (data.total_results == 0) {
                alert("City not found, please check spelling or city entered");
            } else {
                searchCity(data.results, cityName);
            }
        });
    } else {
        $.get(`https://api.opencagedata.com/geocode/v1/json?q=${lastCity}&key=${latLonAPI}`, function (data, status) {
            searchCity(data.results, lastCity);
        });
    }

}

// Handle the call to get the weather data from openweathermap api
function searchCity(data, cityName) {
    let lat = data[0].geometry.lat;
    let lon = data[0].geometry.lng;
    $.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=imperial&exclude=hourly,minutely&appid=${openweathermapAPI}`, function (data, status) {
        if (status != 'success') {
            alert("Unable to get weather data!");
        } else {
            displayCurrent(data, cityName);
        }
    });
}

// Display the current day on top
// Create the HTML elements here
function displayCurrent(data, cityName) {
    $("#cardRow").empty();

    manageHistory(cityName);

    let currentWeather = data.current;
    let daily = data.daily;
    const degree = '\u00B0';
    let curWeatherIcon = `http://openweathermap.org/img/wn/${currentWeather.weather[0].icon}@2x.png`;
    let iconElement = `<img src=${curWeatherIcon}>`;
    let currntDate = moment.unix(currentWeather.dt).format("MM/DD/YYYY");
    let uvi = currentWeather.uvi;
    let uviColor = "";
    if (uvi <= 2) {
        uviColor = "Green";
    } else if (uvi <= 5) {
        uviColor = "Yellow";
    } else if (uvi >= 6 && uvi <= 7) {
        uviColor = "Orange";
    } else {
        uviColor = "Red";
    }

    $("#currentDay").text(`${cityName} (${currntDate})`).append(iconElement);
    $("#currentTemp").text(`Temperature: ${currentWeather.temp} ${degree}F`);
    $("#currentHumidity").text(`Humidity: ${currentWeather.humidity}%`);
    $("#currentWindSpeed").text(`Wind Speed: ${currentWeather.wind_speed} MPH`);
    $("#currentUVIndex").text(`${uvi}`);
    $("#currentUVIndex").css({
        "background-color": `${uviColor}`,
        "color": "white"
    });

    displayFiveDay(daily);
}

// Create and display the five-day forecast here
function displayFiveDay(daily) {
    const degree = '\u00B0';
    for (let index = 0; index <= 5; index++) {
        const day = daily[index];
        let currntDate = moment.unix(day.dt).format("MM/DD/YYYY");
        let curWeatherIcon = `http://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
        let iconElement = `<img class='card-text img-fluid' src=${curWeatherIcon}>`;
        let col = $("<div class='col'></div>");
        let card = $("<div class='card w-100 bg-primary text-white text-left'>");
        let cardBody = $("<div class='card-body'>");
        let cardH = $("<h5 class='card-title'></h5>").text(currntDate);
        let temp = $("<p class='card-text'></p>").text(`Temp: ${day.temp.max} ${degree}F`);
        let humidity = $("<p class='card-text'></p>").text(`Humidity: ${day.humidity}%`);
        cardBody.append(cardH, iconElement, temp, humidity);
        card.append(cardBody);
        col.append(card);
        $("#cardRow").append(col);
    }
}

// Listen for the search button
$("#city-search").click(getLatLon);