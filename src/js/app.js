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
  renderCityPage(`&q=${this.dataset.city}&days=3`,)
}

async function renderCityPage(path, dayNumber = 0) {
  const data = await getWeatherJson(path)
  const { forecast: { forecastday } } = data
  citiesContainer.innerHTML = ''
  renderWeekdaysSection(dayNumber, data, path)
  renderHoursSection(forecastday[dayNumber])
  // backArrowTemplate()
}

function renderHoursSection(dayData) {
  const { hour: hours } = dayData

  for (let i = 0; i < hours.length; i += 2) {
    hoursContainer.insertAdjacentHTML('beforeend', hoursCardTemplate(hours[i]))
  }
}

function hoursCardTemplate(HourData) {
  const {
    time,
    condition: { icon },
    condition: { text: textIcon },
    temp_c: temperature,
  } = HourData

  return `<li class="hours-list__item">
            <time class="hours-list__time">
              <span>${getHourFromDate(time)}</span> 
              <sup>00</sup>
            </time>
            <div class="hours-list__image" title="${textIcon}" style="background-image: url('${icon}')"></div>
            <div class="hours-list__temperature">${getWholeNum(temperature)}&deg</div>
          </li>`
}

function renderWeekdaysSection(dayNumber, fullData, path) {
  weekdaysContainer.append(weekdaysCardsTemplate(dayNumber, fullData, path))
  const clock = document.querySelector('#clock')
  const timeZone = clock.dataset.zone
  getClock(clock, timeZone)
}

function firstWeekday(forecastday, dayNumber) {
  const { date, maxtemp, mintemp, icon, text } = getExactDay(forecastday, dayNumber)
  console.log(forecastday[dayNumber])

  const weekdayCardBody = `<time class="weekday-card__day">${getDayFromDate(date)}</time>
            <div class="weekday-card__row">
              <div class="weekday-card__info">
                <time class="weekday-card__time">${date}</time>
                <div class="weekday-card__col">
                  <div class="weekday-card__temp">max ${getWholeNum(maxtemp)}&deg</div>
                  <div class="weekday-card__temp">min ${getWholeNum(mintemp)}&deg</div>
                </div>
              </div>
              <span class="weekday-card__ico" title="${text}"
                style="background-image: url('${icon}')">
              </span>
            </div>`

  const weekdayCard = document.createElement('div')
  weekdayCard.classList.add('weekday-card', 'weekday-card_middle')
  weekdayCard.dataset.dayNumber = dayNumber
  weekdayCard.insertAdjacentHTML('afterbegin', weekdayCardBody)

  return weekdayCard
}

function secondWeekday(forecastday, dayNumber, path) {
  const { date, maxtemp, mintemp, icon, text } = getExactDay(forecastday, dayNumber + 1)
  console.log(forecastday[dayNumber + 1])

  const weekdayCardBody = `<time class="weekday-card__day">${getDayFromDate(date)}</time>
                          <div class="weekday-card__row">
                            <div class="weekday-card__info">
                              <time class="weekday-card__time">${date}</time>
                              <div class="weekday-card__col">
                                <div class="weekday-card__temp">max ${getWholeNum(maxtemp)}&deg</div>
                                <div class="weekday-card__temp">min ${getWholeNum(mintemp)}&deg</div>
                              </div>
                            </div>
                            <span class="weekday-card__ico" title="${text}"
                              style="background-image: url('${icon}')">
                            </span>
                          </div>`

  const weekdayCard = document.createElement('div')
  weekdayCard.classList.add('weekday-card', 'weekday-card_side')
  weekdayCard.dataset.dayNumber = dayNumber + 1
  weekdayCard.insertAdjacentHTML('afterbegin', weekdayCardBody)
  weekdayCard.addEventListener('click', () => {
    weekdaysContainer.innerHTML = ''
    hoursContainer.innerHTML = ''
    renderCityPage(path, dayNumber + 1)
  })

  return weekdayCard
}

function weekdaysCardsTemplate(dayNumber, fullData, path) {
  const {
    location: { tz_id: timeZone },
    location: { localtime },
    forecast: { forecastday }
  } = fullData

  const { hour: hours } = forecastday[0]
  let feelsLike, temp, img, imgDescription

  for (let hour of hours) { //TODO refactor/ объединить такой же блок в render hours
    const {
      time,
      feelslike_c,
      temp_c,
      condition: { icon },
      condition: { text }
    } = hour

    if (getHourFromDate(localtime, 'toNum') === getHourFromDate(time, 'toNum')) {
      feelsLike = feelslike_c
      temp = temp_c
      img = icon
      imgDescription = text
    }
  }

  const weekdayCard = `<div class="weekday-card weekday-card_side">
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
                      </div>`

  const weekdaysRow = document.createElement('div')
  weekdaysRow.classList.add('weekdays-row')
  weekdaysRow.insertAdjacentHTML('afterbegin', weekdayCard)
  weekdaysRow.append(firstWeekday(forecastday, dayNumber, path))
  weekdaysRow.append(secondWeekday(forecastday, dayNumber, path))

  return weekdaysRow
}

function getExactDay(forecastday, dayNumber) {
  const {
    date,
    day: { maxtemp_c: maxtemp },
    day: { mintemp_c: mintemp },
    day: { condition: { icon } },
    day: { condition: { text } },
  } = forecastday[dayNumber]
  return { date, maxtemp, mintemp, icon, text }
}

function getWholeNum(digit) {
  return Math.round(Number(digit))
}

function getClock(elem, city) {
  let date = new Date()
  elem.textContent = date.toLocaleTimeString('en-US', { hour12: false, timeZone: city })
  setTimeout(() => { getClock(elem, city) }, 1000)
}

function getHourFromDate(str, flag) {
  if (flag) {
    return Number(str.substr(-5, 2))
  }
  return str.substr(-5, 2)
}

function getDayFromDate(_date) {
  let date = new Date(_date)
  const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  return weekDays[date.getDay()]
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


