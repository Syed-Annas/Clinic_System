import { useState, useEffect, useRef } from "react"
import { loadAppState, saveAppState, subscribeAppState } from "./appStateSync"

export function useSupabaseStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)
  const [ready, setReady] = useState(false)
  const skipSave = useRef(false)
  const valueRef = useRef(value)
  valueRef.current = value

  useEffect(() => {
    let cancelled = false

    loadAppState(key).then((remote) => {
      if (cancelled) return
      if (remote !== undefined) {
        skipSave.current = true
        setValue(remote)
      }
      setReady(true)
    })

    const unsub = subscribeAppState(key, (next) => {
      if (JSON.stringify(next) === JSON.stringify(valueRef.current)) return
      skipSave.current = true
      setValue(next)
    })

    return () => {
      cancelled = true
      unsub()
    }
  }, [key])

  useEffect(() => {
    if (!ready) return

    if (skipSave.current) {
      skipSave.current = false
      return
    }

    saveAppState(key, value)
  }, [key, value, ready])

  return [value, setValue]
}
