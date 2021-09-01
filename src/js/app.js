//TODO add preloader
//TODO add block for the weather on the next day
//TODO add beautiful animations
//TODO при наведении на картинку хочу видеть подсказку, что означает иконка (например - пасмурно)

const defaultCities = ['Moscow', 'London', 'Tokyo', 'Pekin', 'New York', 'Paris'];
const apiUrl = 'http://api.weatherapi.com/v1/forecast.json?'
const apiKey = 'key=5050ce131d7f4d3ab69140830211708'

const mainContainer = document.querySelector('#main-container')
const citiesContainer = document.querySelector('#cities-container')
const hoursContainer = document.querySelector('#hours-container')
const weekdaysContainer = document.querySelector('#weekdays-container')
// const form = document.forms.submitCity

async function renderCitiesWeather(citiesArr) {
  return citiesArr.forEach((city) => {
    return renderWeatherCard(`&q=${city}`)
  })
}

async function renderWeatherCard(path, url = apiUrl, key = apiKey) {
  const data = await getWeatherJson(path, url, key)
  const listItem = weatherCardTemplate(data)
  citiesContainer.className = 'cards-container'
  citiesContainer.append(listItem)
}

async function getWeatherJson(path, url = apiUrl, key = apiKey) {
  const promise = await fetch(`${url}${key}${path}`)
  const data = promise.json()
  return data
}

function weatherCardTemplate(data) {
  const {
    location: { name: city },
    current: { temp_c: temperature },
    current: { condition: { icon } },
    current: { condition: { text: textIcon } }
  } = data

  const itemBody = `<h3 class="card__title">${city}</h3>
                    <div class="card__temperature">${getWholeNum(temperature)}&deg</div>
                    <div class="card__img" title="${textIcon}"><img src="${icon}"></div>`
  const listItem = document.createElement('li')
  listItem.classList.add('card')
  listItem.dataset.city = city
  listItem.insertAdjacentHTML('afterbegin', itemBody)
  listItem.addEventListener('click', onClickHandler)
  return listItem
}

function onClickHandler(e) {
  renderHoursSection(`&q=${this.dataset.city}&days=3`)
}

async function renderHoursSection(path, url = apiUrl, key = apiKey) {
  const data = await getWeatherJson(path)
  const {
    forecast: { forecastday: [day0] }
  } = data
  const { hour: hours } = day0

  citiesContainer.innerHTML = ''

  weekdaysContainer.insertAdjacentHTML('beforeend', cardDetailsTemplate(data))
  const clock = document.querySelector('#clock')
  const timeZone = clock.dataset.zone
  getClock(clock, timeZone)

  for (let i = 0; i < hours.length; i += 2) {
    hoursContainer.insertAdjacentHTML('beforeend', hoursCardTemplate(hours[i]))
  }
}

function cardDetailsTemplate(data) { //TODO rename function
  console.log(data)
  let feelsLike, temp, img, imgDescription

  const {
    location: { tz_id: timeZone },
    location: { name: city },
    location: { country },
    location: { localtime },
    forecast: { forecastday: [day0, day1, day2] }
  } = data

  function getExactDay() {

  }

  const {
    date,
    day: { maxtemp_c },
    day: { mintemp_c },
    day: { daily_chance_of_rain },
    hour: hours,
  } = day0

  for (let hour of hours) { //TODO refactor?
    const {
      time,
      feelslike_c,
      temp_c,
      condition: { icon },
      condition: { text }
    } = hour
    if (Number(localtime.substr(-5, 2)) === Number(time.substr(-5, 2))) { //TODO add new function for strings
      feelsLike = feelslike_c
      temp = temp_c
      img = icon
      imgDescription = text
    }
  }

  return `<div class="weekdays-row">
            <div class="weekday-card weekday-card_side">
              <div class="weekday-card__day">Now</div>
              <div class="weekday-card__row">
                <div class="weekday-card__info">
                  <time class="weekday-card__time" id="clock" data-zone="${timeZone}"></time>
                  <div class="weekday-card__col">
                    <div class="weekday-card__temp">${getWholeNum(temp)}&deg</div>
                    <div class="weekday-card__feel-temp">Feels like ${getWholeNum(feelsLike)}&deg</div>
                  </div>
                </div>
                <span class="weekday-card__ico" title="${imgDescription}" style="background-image: url('${img}')">
                </span>
              </div>
            </div>
            <div class="weekday-card weekday-card_middle">
              <time class="weekday-card__day">Sunday</time>
              <div class="weekday-card__row">
                <div class="weekday-card__info">
                  <time class="weekday-card__time">22-08-2021</time>
                  <div class="weekday-card__col">
                    <div class="weekday-card__temp">max 20&deg</div>
                    <div class="weekday-card__temp">min 18&deg</div>
                  </div>
                </div>
                <span class="weekday-card__ico"
                  style="background-image: url('https://cdn.weatherapi.com/weather/64x64/day/176.png')">
                </span>
              </div>
            </div>
            <div class="weekday-card weekday-card_side">
              <time class="weekday-card__day">Monday</time>
              <div class="weekday-card__row">
                <div class="weekday-card__info">
                  <time class="weekday-card__time">23-08-2021</time>
                  <div class="weekday-card__col">
                    <div class="weekday-card__temp">max 23&deg</div>
                    <div class="weekday-card__temp">min 13&deg</div>
                  </div>
                </div>
                <span class="weekday-card__ico"
                  style="background-image: url('https://cdn.weatherapi.com/weather/64x64/day/179.png')">
                </span>
              </div>
            </div>
        </div>`

  return `<div class="card-details">
          <table class="card-details__table">
            <tr>
              <td class="card-details__info">Country:</td>
              <td class="card-details__text">${country}</td>
            </tr>
            <tr>
              <td class="card-details__info">City:</td>
              <td class="card-details__text">${city}</td>
            </tr>
            <tr>
              <td class="card-details__info">Date:</td>
              <td class="card-details__text">${date}</td>
            </tr>
            <tr>
              <td class="card-details__info">Temperature:</td>
              <td class="card-details__text">${getWholeNum(maxtemp_c)}&deg <span>${getWholeNum(mintemp_c)}&deg</span></td>
            </tr>
            <tr>
              <td class="card-details__info">Daily chance of rain:</td>
              <td class="card-details__text">${daily_chance_of_rain}%</td >
            </tr >
          </table >
        </div > `
}

function hoursCardTemplate(data) { //TODO add new function for strings
  const {
    time,
    condition: { icon },
    condition: { text: textIcon },
    temp_c: temperature,
  } = data
  return `<li class="hours-list__item">
            <time class="hours-list__time">
              <span>${time.substr(-5, 2)}</span> 
              <sup>00</sup>
            </time>
            <div class="hours-list__image" title="${textIcon}" style="background-image: url('${icon}')"></div>
            <div class="hours-list__temperature">${getWholeNum(temperature)}&deg</div>
          </li>`
}

function getWholeNum(digit) {
  return Math.round(Number(digit))
}

function getClock(elem, city) {
  let date = new Date()
  elem.textContent = date.toLocaleTimeString('en-US', { hour12: false, timeZone: city })
  setTimeout(() => { getClock(elem, city) }, 1000)
  // let seconds = date.getSeconds() < 10 ? `0${date.getSeconds()}` : date.getSeconds()
  // let minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes()
  // let hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  // elem.textContent = hour + ':' + minutes + ':' + seconds
  // elem.textContent = date.substr(-12, 8)
}

renderCitiesWeather(defaultCities)

// let clock = document.createElement('div')
// document.body.append(clock)
// getClock(clock, 'America/New_York')







//====================================================================
// let obj = {
//   name: 'Artyom',
//   foo: {
//     bar: {
//       fus: 'ra dah!!!'
//     }
//   },
//   surname: 'Ostrovskiy',
//   age: 23,
// }

// let { foo: { bar: { fus } }, foo } = obj
// fus //?



// container.addEventListener('transitionend', function (e) {
//   console.log(e.propertyName)
// })


//======================================== Ajax
// `${ apiUrl } ${ apiKey } ${ path } `

// let xhr = new XMLHttpRequest()
// xhr.open('GET', apiUrl)

// xhr.addEventListener('load', () => {
//   let response = JSON.parse(xhr.responseText)
//   console.log(response)
// })

// xhr.send()


