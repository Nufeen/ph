Check the app on https://nufeen.github.io/ph/

This app is an astro processor currently working as online website.

Main goals of the project are to get free processor on mac os and mobile phones

You can build electron package if needed with `build-electron` command

## Flags

Hidden (incomplete) features can be enabled via browser console:

| Flag           | Type    | Default | Description                                                |
| -------------- | ------- | ------- | ---------------------------------------------------------- |
| `barbo`        | boolean | `false` | Shows "Barbo" chart type button                            |
| `zodiacButton` | boolean | `false` | Shows zodiac type selector (Tropical/Sidereal) in settings |
| `d72`          | boolean | `false` | Shows 72 decans / quinars functionality                    |

### Usage

Open browser console and run:

```javascript
// Enable barbo chart type (broken for now)
window.localStorage.barbo = 'true'

// Enable zodiac type selector
// Note that all logic is based on western approach
// and this code is for experimantal purposes
// Only couple of needed screens work correctly
// It will probably not be supported in future
window.localStorage.zodiacButton = 'true'

// Enable 72 decans / quinars table
window.localStorage.d72 = 'true'

// Disable a flag
window.localStorage.zodiacButton = 'false'
```

Refresh the page after changing flags.
