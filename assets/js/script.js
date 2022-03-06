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

// get the weather data for a  city
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

var displaySearchedCities = function (city) {
    var li = $('<li />');
    var ahref = $('<a />', {
        text: city, href: '#', click: function () {
            getWeatherData(city);
        }
    });
    $('#search-history').append(li.append(ahref));
};

var displayWeather = function () {
    var city = weatherData["city"];
    var data = weatherData["forecastData"];
    console.log("display weather", city, data);
};

var displayForecast = function () {
    data = weatherData["forecastData"];
    console.log("display forecast", data);
    // empty input
    $("#filter").val(null);
};

$("#search").on("submit", function (event) {
    event.preventDefault();
    var cityInput = $('#filter').val().trim();
    if (cityInput) {
        getWeatherData(cityInput);
    }
})

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