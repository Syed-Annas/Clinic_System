import { useState, useEffect, useRef } from "react"
import { loadAppState, saveAppState, subscribeAppState } from "./appStateSync"

export function useSupabaseStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)
  const [hydrated, setHydrated] = useState(false)
  const versionRef = useRef(0)
  const valueRef = useRef(value)
  const hydratedRef = useRef(false)
  const remoteApply = useRef(false)
  const saveTimer = useRef(null)
  valueRef.current = value

  useEffect(() => {
    let cancelled = false

    function applyRemote(v, d) {
      if (v < versionRef.current) return
      if (v === versionRef.current) return
      remoteApply.current = true
      versionRef.current = v
      setValue(d)
    }

    async function hydrate() {
      const result = await loadAppState(key)
      if (cancelled) return

      if (!result.ok) {
        setTimeout(hydrate, 1500)
        return
      }

      if (!result.missing && result.v >= versionRef.current) {
        remoteApply.current = true
        versionRef.current = result.v
        setValue(result.d)
        if (result.migrated) saveAppState(key, result.v, result.d)
      } else if (result.missing && versionRef.current === 0) {
        versionRef.current = 1
      }

      hydratedRef.current = true
      setHydrated(true)
    }

    hydrate()

    const unsub = subscribeAppState(key, (payload) => {
      if (cancelled || payload == null) return
      applyRemote(payload.v, payload.d)
    })

    return () => {
      cancelled = true
      unsub()
      clearTimeout(saveTimer.current)
    }
  }, [key])

  useEffect(() => {
    if (!hydrated) return

    if (remoteApply.current) {
      remoteApply.current = false
      return
    }

    versionRef.current += 1
    const v = versionRef.current
    const snapshot = value

    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      if (v !== versionRef.current) return
      saveAppState(key, v, snapshot)
    }, 300)
  }, [key, value, hydrated])

  return [value, setValue]
}
