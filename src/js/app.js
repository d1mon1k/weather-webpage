//TODO add preloader
//TODO add block for the weather on the next day
//TODO add beautiful animations

const defaultCities = ['Moscow', 'London', 'Tokyo', 'Pekin', 'New York', 'Paris'];
const apiUrl = 'http://api.weatherapi.com/v1/forecast.json?'
const apiKey = 'key=5050ce131d7f4d3ab69140830211708'

const mainContainer = document.querySelector('#main-container')
const citiesContainer = document.querySelector('#cities-container')
const hoursContainer = document.querySelector('#hours-container')
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
    current: { condition: { icon } }
  } = data

  const itemBody = `<h3 class="card__title">${city}</h3>
                    <div class="card__temperature">${getWholeNum(temperature)}&deg</div>
                    <div class="card__img"><img src="${icon}"></div>`
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

  mainContainer.insertAdjacentHTML('afterbegin', cardDetailsTemplate(data))
  for (let hour of hours) {
    hoursContainer.insertAdjacentHTML('afterbegin', hoursCardTemplate(hour))
  }
}

function cardDetailsTemplate(data) {
  const {
    location: { name: city },
    location: { country },
    forecast: { forecastday: [day0] }
  } = data
  const {
    date,
    day: { maxtemp_c },
    day: { mintemp_c },
    day: { daily_chance_of_rain }
  } = day0

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
              <td class="card-details__text">${getWholeNum(maxtemp_c)}&deg<span>${getWholeNum(mintemp_c)}&deg</span></td>
            </tr>
            <tr>
              <td class="card-details__info">Daily chance of rain:</td>
              <td class="card-details__text">${daily_chance_of_rain}%</td >
            </tr >
          </table >
        </div > `
}

function hoursCardTemplate(data) {
  const {
    time,
    condition: { icon },
    temp_c: temperature,
  } = data

  return `<li class="hours-list__item" >
              <time class="hours-list__time">${time.substr(-5)}</time>
              <div class="hours-list__image" style="background-image: url('${icon}')"></div>
              <div class="hours-list__temperature">${getWholeNum(temperature)}&deg</div>
            </li> `
}

function getWholeNum(digit) {
  return Math.round(Number(digit))
}

renderCitiesWeather(defaultCities)









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


