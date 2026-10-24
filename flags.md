## Flags

Hidden (not ready) features enabled via browser console:

| Flag           | Default | Description                      |
| -------------- | ------- | -------------------------------- |
| `barbo`        | false   | Shows Barbo chart type           |
| `zodiacButton` | false   | Shows Tropical/Sidereal selector |
| `d72`          | false   | Shows 72 decans table            |

### Usage

```javascript
// Enable barbo chart type
window.localStorage.barbo = 'true'

// Enable zodiac type selector
// Logic based on western approach, experimental
window.localStorage.zodiacButton = 'true'

// Enable 72 decans / quinars table
window.localStorage.d72 = 'true'

// Disable a flag
window.localStorage.zodiacButton = 'false'
```

Refresh the page after changing flags.
