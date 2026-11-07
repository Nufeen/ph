import {useEffect, useState} from 'react'

/**
 * F key toggles a fullscreen flag, meant to pull a class
 * on a chart container. Ignores presses with modifiers
 * and typing in the inputs
 */
export default function useFullscreenToggle(): boolean {
  const [fullscreen, setFullscreen] = useState(false)

  useEffect(() => {
    const onKey = e => {
      if (
        e.key.toLowerCase() !== 'f' ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return
      }

      // do not hijack typing in the inputs
      const tag = e.target?.tagName
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(tag)) return

      setFullscreen(f => !f)
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return fullscreen
}
