$(function() {
  let key = '200191727-4d10c8759879eca7e285c46e33257400' // lol
  function getUser(email) {
    let url = `https://www.mountainproject.com/data/get-user?email=${email}&key=${key}`
    return fetch(url, { method: 'GET' })
      .then(resp => {
        return resp.text()
      })
      .then(data => {
        return JSON.parse(data)
      })
  }

  function getTicks(email) {
    let url = `https://www.mountainproject.com/data/get-ticks?email=${email}&key=${key}`
    return fetch(url, { method: 'GET' })
      .then(resp => {
        return resp.text()
      })
      .then(data => {
        return JSON.parse(data)
      })
  }

  function getRoutes(routeIds) {
    let idString = routeIds.join(',')
    let url = `https://www.mountainproject.com/data/get-routes?routeIds=${idString}&key=${key}`

    return fetch(url, { method: 'GET' })
    .then(resp => {
      return resp.text()
    })
    .then(data => {
      return JSON.parse(data).routes
    })
  }

  function getDecoratedTicks(email) {
    return getTicks(email).then(tickObj => {
      let ticks = tickObj.ticks 
      let routeDict = {}
      
      ticks.forEach(tick => {
        routeDict[tick.routeId] = tick
      })

      let routeIds = ticks.map(tick => tick.routeId)

      return getRoutes(routeIds)
      .then(routes => {
        routes.forEach(route => {
          routeDict[route.id].routeData = route
        })

        return routeDict
      })
    })
  }

  function displayTimeline(ticks) {
    let timemapTicks = Object.values(ticks).map(tick => {
      let style = tick.leadStyle
      let color = 'orange'


      if (style === 'Redpoint') { color = 'red' }
      if (style === 'Onsight') { color = 'green' }
      if (style === 'Flash') { color = 'yellow' }

      return {
        start: new Date(tick.date),
        end: new Date(new Date(tick.date).valueOf()+464E5),
        point: {
          lat: tick.routeData.latitude,
          lon: tick.routeData.longitude
        },
        title: `${tick.routeData.name} | ${tick.routeData.rating}`,
        options: {
          theme: color,
          infoHtml: `
            <div>
              <h4>
                <a target="_blank" href="${tick.routeData.url}">${tick.routeData.name} | ${tick.routeData.rating}</a> 
                ${tick.leadStyle}
              </h4>
              <div class="w-40 dib">
                <img src="${tick.routeData.imgSmall}">
              </div>
              <div class="w-50 ml1 dib v-top">
                <p>${tick.notes}</p>
              </div>
            </div>`
        }
      }
    })
    let tm = TimeMap.init({
        mapId: "map",               // Id of map div element (required)
        timelineId: "timeline",     // Id of timeline div element (required)
        options: {},
        datasets: [
            {
                id: "routes",
                title: "Routes",
                // note that the lines below are now the preferred syntax
                type: "basic",
                options: {
                    items: timemapTicks
                }
            }
        ],
        bandIntervals: [
            Timeline.DateTime.DAY, 
            Timeline.DateTime.MONTH
        ]
    })
  }

  $('#emailForm').submit(event => {
    getDecoratedTicks($('#email')[0].value).then(ticks => displayTimeline(ticks))
    return false
  })    
})