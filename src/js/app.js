//TODO add preloader
//TODO add beautiful animations
//TODO[css] fix logo width
//todo[css] menu-burger animation

const defaultCities = [
  "Moscow",
  "London",
  "Tokyo",
  "Pekin",
  "New York",
  "Paris",
];

//TODO разделить на url &method =====================================================
const apiUrl = "https://api.weatherapi.com/v1/forecast.json?";
const url = "https://api.weatherapi.com/v1/";
const apiMethod = "forecast.json?";
const apiKey = "key=5050ce131d7f4d3ab69140830211708";
//TODO ==============================================================================
const fixedBtn = document.querySelector("#fixed-btn");
const logo = document.querySelector(".logo");
const form = document.forms.submitCity;
const search = form.elements["search"];
const autocompleateBlock = document.querySelector(".autocompleate");
const mainTitle = document.querySelector("#title");
const mainContainer = document.querySelector("#main-container");
const citiesContainer = document.querySelector("#cities-container");
const weekdaysContainer = document.querySelector("#weekdays-container");
const hoursContainer = document.querySelector("#hours-container");

document.addEventListener("scroll", function () {
  if (window.pageYOffset >= window.screen.height / 2) {
    fixedBtn.classList.add("fixed-btn");
  } else {
    fixedBtn.classList.remove("fixed-btn");
  }
});

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const cityName = search.value;
  renderCityPage(`&q=${cityName}&days=3`);
  hideAutocompleateBlock();
});

search.addEventListener("focus", function () {
  if (search.value.length >= 3) {
    autocompleateBlock.style.display = "block";
  }
});

search.addEventListener("blur", hideAutocompleateBlock);
function hideAutocompleateBlock() {
  autocompleateBlock.style.display = "none";
}

autocompleateBlock.addEventListener("mouseenter", function () {
  search.removeEventListener("blur", hideAutocompleateBlock);
});

autocompleateBlock.addEventListener("mouseleave", function () {
  search.addEventListener("blur", hideAutocompleateBlock);
});

search.addEventListener("input", async function (e) {
  const url = `https://api.weatherapi.com/v1/search.json?`;
  const value = this.value;
  const data = await getWeatherJson(`&q=${value}`, url, apiKey);

  if (search.value.length >= 3 && data.length) {
    autocompleateBlock.style.display = "block";
    renderAutocompleateBlock(data);
  } else {
    hideAutocompleateBlock();
  }

  search.value = getUpperLetter(search.value);
});

function getUpperLetter(line) {
  let wordsArray = line.split(" ");
  for (let i = 0; i < wordsArray.length; i++) {
    wordsArray[i] =
      wordsArray[i].slice(0, 1).toUpperCase() + wordsArray[i].slice(1);
  }
  return wordsArray.join(" ");
}

function renderAutocompleateBlock(data) {
  autocompleateBlock.innerHTML = "";
  for (let i = 0; i < 4; i++) {
    autocompleateBlock.append(autocompleateItemTemplate(data, i));
  }
}

function autocompleateItemTemplate(data, numberOfCity) {
  const autocompleateLink = document.createElement("a");
  autocompleateLink.classList.add("autocompleate__link");
  autocompleateLink.setAttribute("href", "#");
  autocompleateLink.innerHTML = `${selectText(data[numberOfCity].name)}`;

  const autocompleateItem = document.createElement("li");
  autocompleateItem.classList.add("autocompleate__item");
  autocompleateItem.append(autocompleateLink);

  autocompleateItem.addEventListener("click", function (e) {
    e.preventDefault();
    renderCityPage(`&q=${data[numberOfCity].name}&days=3`);
    search.value = "";
    autocompleateBlock.style.display = "none";
  });

  return autocompleateItem;
}

function selectText(line) {
  const regex = new RegExp(`${search.value}`, "i");

  return line.replace(regex, (searchStr) => {
    return `<b style="color: pink;">${searchStr}</b>`;
  });
}

async function renderCitiesWeather(citiesArr) {
  weekdaysContainer.innerHTML = "";
  hoursContainer.innerHTML = "";
  renderMainTitle();
  return citiesArr.forEach((city) => {
    return renderWeatherCard(`&q=${city}`);
  });
}

function renderMainTitle(data, dayNumber) {
  if (data) {
    const {
      forecast: { forecastday },
      location: { name },
    } = data;
    const { date } = forecastday[dayNumber];

    mainTitle.firstElementChild.textContent = `in ${name} `;
    mainTitle.lastElementChild.textContent = `on ${getDate(date)}`;
  } else {
    mainTitle.firstElementChild.textContent = ``;
    mainTitle.lastElementChild.textContent = `on ${getDate()}`;
  }
}

async function renderWeatherCard(path, url = apiUrl, key = apiKey) {
  const data = await getWeatherJson(path, url, key);
  const listItem = weatherCardTemplate(data);
  citiesContainer.className = "cards-container";
  citiesContainer.append(listItem);
}

async function getWeatherJson(path, url = apiUrl, key = apiKey) {
  const promise = await fetch(`${url}${key}${path}`);
  const data = promise.json();
  return data;
}

function weatherCardTemplate(data) {
  const {
    location: { name: city },
    current: { temp_c: temperature },
    current: {
      condition: { icon },
    },
    current: {
      condition: { text: textIcon },
    },
  } = data;

  const itemBody = `<h3 class="card__title">${city}</h3>
                    <div class="card__temperature">${getWholeNum(
                      temperature
                    )}&deg</div>
                    <div class="card__img" title="${textIcon}"><img src="${icon}"></div>`;
  const listItem = document.createElement("li");
  listItem.classList.add("card");
  listItem.dataset.city = city;
  listItem.insertAdjacentHTML("afterbegin", itemBody);
  listItem.addEventListener("click", renderCityOnClick);
  return listItem;
}

function renderCityOnClick(e) {
  renderCityPage(`&q=${this.dataset.city}&days=3`);
}

async function renderCityPage(path, dayNumber = 0) {
  const data = await getWeatherJson(path);
  renderMainTitle(data, dayNumber);
  citiesContainer.innerHTML = "";
  weekdaysContainer.innerHTML = "";
  hoursContainer.innerHTML = "";
  renderWeekdaysSection(dayNumber, data, path);
  renderHoursSection(dayNumber, data);
  renderBackArrow();
}

function renderWeekdaysSection(dayNumber, fullData, path) {
  weekdaysContainer.append(weekdaysRowTemplate(dayNumber, fullData, path));
}

function weekdaysRowTemplate(dayNumber, fullData, path) {
  const {
    location: { tz_id: timeZone },
    location: { localtime },
    forecast: { forecastday },
  } = fullData;

  const weekdaysRow = document.createElement("div");
  weekdaysRow.classList.add("weekdays-row");

  weekdaysRow.append(
    currentWeatherCardTemplate({ forecastday, localtime, timeZone }, path)
  );
  weekdaysRow.append(firstWeekdayTemplate(forecastday, dayNumber, path));
  weekdaysRow.append(secondWeekdayTemplate(forecastday, dayNumber, path));

  return weekdaysRow;
}

function currentWeatherCardTemplate(data, path) {
  const { forecastday, localtime, timeZone } = data;
  const { hour: hours } = forecastday[0];
  const {
    feelslike_c,
    temp_c,
    condition: { icon },
    condition: { text },
  } = hours[getHourFromDate(localtime)];

  const weekdayCardBody = `<div class="weekday-card__day">Now</div>
                            <div class="weekday-card__row">
                              <div class="weekday-card__info">
                                <time class="weekday-card__time" id="clock"></time>
                                <div class="weekday-card__col">
                                  <div class="weekday-card__temp">${getWholeNum(
                                    temp_c
                                  )}&deg</div>
                                  <div class="weekday-card__feel-temp">Feels like ${getWholeNum(
                                    feelslike_c
                                  )}&deg</div>
                                </div>
                              </div>
                              <span class="weekday-card__ico" title="${text}" style="background-image: url('${icon}')">
                              </span>
                          </div>`;

  const weekdayCard = document.createElement("div");
  weekdayCard.classList.add("weekday-card", "weekday-card_side");
  weekdayCard.insertAdjacentHTML("beforeend", weekdayCardBody);
  weekdayCard.addEventListener("click", () => {
    renderCityPageOnClick(path);
  });

  const clock = weekdayCard.querySelector("#clock");
  getClock(clock, timeZone);

  return weekdayCard;
}

function firstWeekdayTemplate(forecastday, dayNumber) {
  const { date, maxtemp, mintemp, icon, text } = getExactDay(
    forecastday,
    dayNumber
  );

  const weekdayCardBody = `<time class="weekday-card__day">${getDayFromDate(
    date
  )}</time>
                          <div class="weekday-card__row">
                            <div class="weekday-card__info">
                              <time class="weekday-card__time">${date}</time>
                              <div class="weekday-card__col">
                                <div class="weekday-card__temp">max ${getWholeNum(
                                  maxtemp
                                )}&deg</div>
                                <div class="weekday-card__temp">min ${getWholeNum(
                                  mintemp
                                )}&deg</div>
                              </div>
                            </div>
                            <span class="weekday-card__ico" title="${text}"
                              style="background-image: url('${icon}')">
                            </span>
                          </div>`;

  const weekdayCard = document.createElement("div");
  weekdayCard.classList.add("weekday-card", "weekday-card_middle");
  weekdayCard.insertAdjacentHTML("afterbegin", weekdayCardBody);

  return weekdayCard;
}

function secondWeekdayTemplate(forecastday, dayNumber, path) {
  dayNumber = dayNumber < 2 ? dayNumber + 1 : 0;
  const { date, maxtemp, mintemp, icon, text } = getExactDay(
    forecastday,
    dayNumber
  );

  const weekdayCardBody = `<time class="weekday-card__day">${getDayFromDate(
    date
  )}</time>
                          <div class="weekday-card__row">
                            <div class="weekday-card__info">
                              <time class="weekday-card__time">${date}</time>
                              <div class="weekday-card__col">
                                <div class="weekday-card__temp">max ${getWholeNum(
                                  maxtemp
                                )}&deg</div>
                                <div class="weekday-card__temp">min ${getWholeNum(
                                  mintemp
                                )}&deg</div>
                              </div>
                            </div>
                            <span class="weekday-card__ico" title="${text}"
                              style="background-image: url('${icon}')">
                            </span>
                          </div>`;

  const weekdayCard = document.createElement("div");
  weekdayCard.classList.add("weekday-card", "weekday-card_side");
  weekdayCard.insertAdjacentHTML("afterbegin", weekdayCardBody);
  weekdayCard.addEventListener("click", () => {
    renderCityPageOnClick(path, dayNumber);
  });

  return weekdayCard;
}

function renderHoursSection(dayNumber, data) {
  const {
    forecast: { forecastday },
  } = data;
  const { hour: hours } = forecastday[dayNumber];

  for (let i = 0; i < hours.length; i += 2) {
    hoursContainer.insertAdjacentHTML("beforeend", hoursCardTemplate(hours[i]));
  }
}

function hoursCardTemplate(HourData) {
  const {
    time,
    condition: { icon },
    condition: { text },
    temp_c,
  } = HourData;

  return `<li class="hours-list__item">
            <time class="hours-list__time">
              <span>${getHourFromDate(time)}</span> 
              <sup>00</sup>
            </time>
            <div class="hours-list__image" title="${text}" style="background-image: url('${icon}')"></div>
            <div class="hours-list__temperature">${getWholeNum(
              temp_c
            )}&deg</div>
          </li>`;
}

function renderBackArrow() {
  const oldBackArrow = document.querySelector(".back-arrow");
  if (oldBackArrow) {
    oldBackArrow.remove();
  }

  const backArrow = document.createElement("div");
  backArrow.classList.add("back-arrow");
  backArrow.addEventListener("click", renderCitiesWeatherOnClick);
  mainContainer.append(backArrow);
}

function renderCitiesWeatherOnClick() {
  citiesContainer.innerHTML = "";
  const oldBackArrow = document.querySelector(".back-arrow");
  if (oldBackArrow) {
    oldBackArrow.remove();
  }
  renderCitiesWeather(defaultCities);
}

function renderCityPageOnClick(path, dayNumber) {
  weekdaysContainer.innerHTML = "";
  hoursContainer.innerHTML = "";
  renderCityPage(path, dayNumber);
}

function getExactDay(forecastday, dayNumber) {
  const {
    date,
    day: { maxtemp_c: maxtemp },
    day: { mintemp_c: mintemp },
    day: {
      condition: { icon },
    },
    day: {
      condition: { text },
    },
  } = forecastday[dayNumber];
  return { date, maxtemp, mintemp, icon, text };
}

function getWholeNum(digit) {
  return Math.round(Number(digit));
}

function getClock(elem, city) {
  //TODO протестировать регионы со временем после полуночи (24:00)
  let date = new Date();
  elem.textContent = date.toLocaleTimeString("en-US", {
    hour12: false,
    timeZone: city,
  });
  setTimeout(() => {
    getClock(elem, city);
  }, 1000);
}

function getHourFromDate(str) {
  return Number(str.substr(-5, 2));
}

function getDayFromDate(_date) {
  let date = new Date(_date);
  const weekDays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return weekDays[date.getDay()];
}

function getMonthFromDate(_date) {
  const date = new Date(_date);
  const month = date.getMonth();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[month];
}

function getDate(_date) {
  const date = _date ? new Date(_date) : new Date();
  const day = date.getDate();
  return `${day} of ${getMonthFromDate(date)}`;
}

logo.addEventListener("click", renderCitiesWeatherOnClick);

renderCitiesWeather(defaultCities);

// renderCityPage(`&q=London&days=3`);
