const API_KEY = "b9e0a1dafe95d77da743df52ad0f1285";
const WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather?q=<CITY>&units=imperial&appid=<APIKEY>";
const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/onecall?lat=<LATITUDE>&lon=<LONGITUDE>&units=imperial&exclude=minutely,hourly&appid=<APIKEY>";

var searchedCities = [];
var weatherData = {
    city: "",
    latitude: "",
    longitude: "",
    curWeatherData: [],
    forecastData: [],
};
var todaysDate = moment().format("dddd, MMMM Do YYYY");

// create the weather API endpoint
function getCityWeatherAPIURL(city) {
    var cityUrl = WEATHER_URL;
    var cityWeatherAPIUrl = encodeURI(
        cityUrl.replace("<CITY>", city).replace("<APIKEY>", API_KEY)
    );
    return cityWeatherAPIUrl;
}

// create the forecast API endpoint
function getForecastAPIUrl(lat, lon) {
    var url = FORECAST_URL;
    var forecastAPIURL = encodeURI(
        url
            .replace("<LATITUDE>", lat)
            .replace("<LONGITUDE>", lon)
            .replace("<APIKEY>", API_KEY)
    );
    return forecastAPIURL;
}

// get the weather data
function getWeatherData(city) {
    var cityInfoUrl = getCityWeatherAPIURL(city);
    fetch(cityInfoUrl).then(function (cityResp) {
        if (cityResp.ok) {
            cityResp
                .json()
                .then(function (cityData) {
                    weatherData["city"] = cityData.name;
                    weatherData["latitude"] = cityData.coord.lat;
                    weatherData["longitude"] = cityData.coord.lon;
                    weatherData["curWeatherData"] = cityData;
                    return cityData;
                })
                .then(function () {
                    var forecastUrl = getForecastAPIUrl(
                        weatherData["latitude"],
                        weatherData["longitude"]
                    );
                    // get the forecast data
                    fetch(forecastUrl).then(function (forecastResp) {
                        if (forecastResp.ok) {
                            forecastResp
                                .json()
                                .then(function (foreData) {
                                    weatherData["forecastData"] = foreData;
                                })
                                .then(saveSearchedCity)
                                .then(displayWeather)
                                .then(displayForecast);
                        } else {
                            alert("Weather Forecast Info not found for City: " + city);
                        }
                    });
                })
                .catch((err) => alert(err));
        } else {
            alert("Current Weather Info not found for City: " + city);
            $("#filter").val(null);
        }
    });
}

var saveSearchedCity = function () {
    if (!(searchedCities.includes(weatherData["city"]))) {
        searchedCities.push(weatherData["city"]);
        saveCitiesToLocalStorage(searchedCities);
        displaySearchedCities(weatherData["city"]);
    }
};

function saveCitiesToLocalStorage(cities) {
    localStorage.setItem("CitiesSearched", JSON.stringify(cities));
}

function loadCities() {
    citiesLoaded = JSON.parse(localStorage.getItem("CitiesSearched"));
    if (!citiesLoaded) return false;
    for (var i = 0; i < citiesLoaded.length; i++) {
        displaySearchedCities(citiesLoaded[i]);
        searchedCities.push(citiesLoaded[i]);
    }
}

// display searched cities
var displaySearchedCities = function (city) {
    var li = $('<li />');
    var aHref = $('<a />', {
        text: city, href: '#', click: function () {
            getWeatherData(city);
        }
    });
    $('#search-history').append(li.append(aHref));
};

//displaying the city weather condition
var displayWeather = function () {
    var data = weatherData["forecastData"];
    var temperature = Math.round(data.current.temp);
    var humidity = Math.round(data.current.humidity);
    var windSpeed = data.current.wind_speed;
    var uv = data.current.uvi;
    var icon = data.current.weather[0].icon;
    var headerCityDate = $('<h2 />', { class: "text-white", text: weatherData["city"] });
    var weatherCondition = $('<h5 />', { class: "text-white", text: "The weather conditions for today, " + todaysDate + " :" });
    var imageIcon = $('<img />', {
        src: "https://openweathermap.org/img/wn/" + icon + "@2x.png"
    });
    var uvPa = $('<p />', { text: "UV Index: " });
    var uvSpan = $('<span />', {
        text: uv,
        class: function () {
            if (uv <= 4) return "bg-success text-white p-2 rounded"; else if (uv <= 8) return "bg-warning text-black p-2 rounded"; else return "bg-danger text-white p-2 rounded";
        }
    });
    var tempPa = $('<p />', { text: "Temperature: " + temperature + "°F" });
    var humidityPa = $('<p />', { text: "Humidity: " + humidity + "%" });
    var windSpeedPa = $('<p />', { text: "Wind Speed: " + windSpeed + " MPH" });
    $('#live-weather').empty().addClass("text-center").append(headerCityDate, weatherCondition, imageIcon, tempPa, humidityPa, windSpeedPa, $(uvPa).append(uvSpan));
};

// displaying hte forecast data for the next 5 days
var displayForecast = function () {
    data = weatherData["forecastData"];
    var forecast = $("#forecast").empty().append($('<h5 />', { class: "text-white", text: "The forecast of the incoming 5 days:" }), $("<div />", { class: "row justify-content-between" }));
    for (var i = 0; i < 5; i++) {
        var temperature = Math.round(data.daily[i].temp.day);
        var humidity = data.daily[i].humidity;
        var windSpeed = data.daily[i].wind_speed;
        var icon = data.daily[i].weather[0].icon;
        var card = $("<div />", { class: "card bg-transparent border-white text-center col-xl-3 col-md-5 m-3" });
        var cardBody = $("<div />", { class: "card-body" });
        var cardDate = $("<h6 />", { text: moment().add(i, "days").format("dddd, MMMM Do YYYY") });
        var cardIcon = $("<img />", { src: "https://openweathermap.org/img/wn/" + icon + "@2x.png" });
        var cardTemp = $("<p />", { class: "card-text", text: "Temperature:  " + temperature + "°F" });
        var cardWindSpeed = $("<p />", { class: "card-text", text: "Wind speed:  " + windSpeed + " MPH" });
        var cardHumidity = $("<p />", { class: "card-text", text: "Humidity:  " + humidity + "%" });
        $(card).append($(cardBody).append(cardDate, cardIcon, cardTemp, cardHumidity, cardWindSpeed));
        $(forecast).children("div").append($(card));
    }
    // empty input
    $("#filter").val(null);
};


// submitting the search form
$("#search").on("submit", function (event) {
    event.preventDefault();
    var cityInput = $('#filter').val().trim();
    if (cityInput) getWeatherData(cityInput); else alert("Please enter a valid city name.");
})


// page load
$(document).ready(function () {
    var fullHeight = function () {
        $('.js-fullheight').css('height', $(window).height());
        $(window).resize(function () {
            $('.js-fullheight').css('height', $(window).height());
        });
    };
    fullHeight();
    $('#sidebarCollapse').on('click', function () {
        $('#sidebar').toggleClass('active');
    });
    ($(window).width() < 992) ? $('#body').addClass('flex-column-reverse') : $('#body').addClass('flex-row');
    loadCities();
});

// this will run everytime the user resizes the window and arrenge the display for the screen size
$(window).on('resize', function () {
    var win = $(this);
    if (win.width() < 992) {
        $('#body').removeClass('flex-row');
        $('#body').addClass('flex-column-reverse');
    } else {
        $('#body').removeClass('flex-column-reverse');
        $('#body').addClass('flex-row');
    }
});