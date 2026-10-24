![Astrology App](docs/screen.png)

Check the live app at https://nufeen.github.io/ph/

Astro processor working as online website. 

Goal of the project is to provide free and open sourced working processor for browsers, including mobile.

## Features

Very basic set still complete enough for mobile usage

- Natal / Transit / Progressed charts
- Graphic Ephemeris (WIP)
- Basic planets and fictive points
- Traditional / Modern views
- 30 degrees panel
- Traditional day planetary hours table
- Save / load charts from IndexedDB (will get wiped with browser history)
- URL state sharing for bookmarks
- Orb correction slider

## Important Dependencies

- [astronomy-engine](https://www.npmjs.com/package/astronomy-engine) - planetary positions, coordinates
- [circular-natal-horoscope-js](https://www.npmjs.com/package/circular-natal-horoscope-js) - natal chart, houses, ascendant
- [sunrise-sunset-js](https://www.npmjs.com/package/sunrise-sunset-js) - sunrise/sunset times
- [city-timezones](https://www.npmjs.com/package/city-timezones) - city timezone lookup
- [country-city-location](https://www.npmjs.com/package/country-city-location) - country and city data
- [moment-timezone](https://www.npmjs.com/package/moment-timezone) - timezone conversions

