const defaultCities = ['Moscow', 'London', 'Tokio', 'Pekin', 'New York', 'Paris'];
const apiUrl = 'http://api.weatherapi.com/v1/forecast.json?'
const apiKey = 'key=5050ce131d7f4d3ab69140830211708'
// const path = '&q=Minsk&days=7'

const mainContainer = document.querySelector('#main-container')
const listContainer = document.querySelector('#list-container')
const form = document.forms.submitCity

async function renderCitiesWeather(citiesArr) {
  return citiesArr.forEach((city) => {
    return renderWeatherCard(`&q=${city}`)
  })
}

async function renderWeatherCard(path, url = apiUrl, key = apiKey) {
  const data = await getWeatherJson(path, url, key)
  const listItem = weatherCardTemplate(data)
  listContainer.className = 'cards-container'
  listContainer.append(listItem)
}

async function getWeatherJson(path, url = apiUrl, key = apiKey) {
  const promise = await fetch(`${url}${key}${path}`)
  const data = promise.json()
  return data
}

function weatherCardTemplate(data) { //TODO Сделать деструктуризацию
  let {
    location: { name: city },
    current: { temp_c: temperature },
    current: { condition: { icon } }
  } = data

  const itemBody = `<h3 class="card__title">${city}</h3>
                    <div class="card__temperature">${temperature}&deg</div>
                    <div class="card__img"><img src="${icon}"></div>`
  const listItem = document.createElement('li')
  listItem.classList.add('card')
  listItem.insertAdjacentHTML('afterbegin', itemBody)
  listItem.addEventListener('click', onClickHandler)
  return listItem
}

// function renderWeek(path, url = apiUrl, key = apiKey) {
//   const data = getWeatherJson(path)
//   container.innerHTML = ''
//   container.classList.remove('cards-container')
//   container.classList.add('cards-container_weekday')
//   return container.insertAdjacentHTML('afterbegin', weekdayCardTemplate(data))
// }

// function weekdayCardTemplate(data) {
//   return `<li class="card-weekday">
//             <div class="card-weekday__title">Monday</div>
//             <div class="card-weekday__image"></div>
//             <div class="card-weekday__temperature">
//               <span>22&deg</span>
//               <span>13&deg</span>
//             </div>
//           </li> `
// }


renderCitiesWeather(defaultCities)

function onClickHandler(e) {
  // renderWeek(`&q=${this.firstChild.textContent}&days=3`)
  console.log("onClickHandler")
}
// container.addEventListener('click', onClickHandler)



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


