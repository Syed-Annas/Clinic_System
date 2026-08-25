import { useState, useEffect, useRef, useCallback } from "react"
import { loadAppState, saveAppState, subscribeAppState } from "./appStateSync"

const LOCAL_STORAGE_PREFIX = "cs_cache:"
const LOCAL_STORAGE_VERSION_PREFIX = "cs_ver:"

function getLocalItem(key, fallback) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return typeof fallback === "function" ? fallback() : fallback
    }
    const stored = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${key}`)
    if (stored !== null) {
      return JSON.parse(stored)
    }
    // Also check legacy key in localStorage
    const legacy = localStorage.getItem(key)
    if (legacy !== null) {
      return JSON.parse(legacy)
    }
  } catch (e) {
    console.error(`Error reading localStorage for ${key}`, e)
  }
  return typeof fallback === "function" ? fallback() : fallback
}

function getLocalVersion(key) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return 0
    const v = localStorage.getItem(`${LOCAL_STORAGE_VERSION_PREFIX}${key}`)
    return v ? Number(v) || 0 : 0
  } catch {
    return 0
  }
}

function setLocalItem(key, value, version) {
  try {
    if (typeof window === "undefined" || !window.localStorage) return
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${key}`, JSON.stringify(value))
    if (version !== undefined) {
      localStorage.setItem(`${LOCAL_STORAGE_VERSION_PREFIX}${key}`, String(version))
    }
  } catch (e) {
    console.error(`Error saving to localStorage for ${key}`, e)
  }
}

export function useSupabaseStorage(key, initialValue) {
  // Initialize from local cache immediately to prevent blank/empty flashes
  const [value, setValueState] = useState(() => getLocalItem(key, initialValue))

  const valueRef = useRef(value)
  valueRef.current = value

  const versionRef = useRef(getLocalVersion(key))
  const isHydratedRef = useRef(false)
  const saveTimerRef = useRef(null)
  const retryTimerRef = useRef(null)
  const pendingSaveRef = useRef(null)

  const persistPendingSave = useCallback(async () => {
    const pending = pendingSaveRef.current
    if (!pending) return

    const saved = await saveAppState(key, pending.version, pending.value)
    if (saved && pendingSaveRef.current?.version === pending.version) {
      pendingSaveRef.current = null
    } else if (!saved) {
      console.error(`Cloud sync failed for ${key}; local data was preserved.`)
      if (!retryTimerRef.current) {
        retryTimerRef.current = setTimeout(() => {
          retryTimerRef.current = null
          const retryPending = pendingSaveRef.current
          if (retryPending) {
            saveAppState(key, retryPending.version, retryPending.value).then((retrySaved) => {
              if (retrySaved && pendingSaveRef.current?.version === retryPending.version) {
                pendingSaveRef.current = null
              }
            })
          }
        }, 5000)
      }
    }
  }, [key])

  useEffect(() => {
    const retry = () => {
      persistPendingSave()
    }

    window.addEventListener("online", retry)
    window.addEventListener("focus", retry)
    window.addEventListener("pageshow", retry)

    return () => {
      window.removeEventListener("online", retry)
      window.removeEventListener("focus", retry)
      window.removeEventListener("pageshow", retry)
    }
  }, [persistPendingSave])

  useEffect(() => {
    let cancelled = false

    // Apply remote incoming update (from Supabase Realtime broadcast or polling)
    function applyRemote(v, d) {
      if (v == null || d === undefined) return
      if (v <= versionRef.current) return

      versionRef.current = v
      valueRef.current = d
      setValueState(d)
      setLocalItem(key, d, v)
    }

    async function hydrate() {
      const result = await loadAppState(key)
      if (cancelled) return

      if (!result.ok) {
        // If Supabase query fails (e.g. 401 permission or offline),
        // keep using local cache and do not broadcast anything
        isHydratedRef.current = true
        return
      }

      if (!result.missing) {
        // Remote data exists in Supabase
        if (result.v > versionRef.current) {
          applyRemote(result.v, result.d)
        } else if (versionRef.current > result.v) {
          // Local data is newer than remote, sync to remote
          pendingSaveRef.current = { version: versionRef.current, value: valueRef.current }
          persistPendingSave()
        }
      } else {
        // Remote key does not exist yet in Supabase.
        // If we have local data, initialize remote with version 1
        if (versionRef.current === 0) {
          versionRef.current = 1
          setLocalItem(key, valueRef.current, 1)
          saveAppState(key, 1, valueRef.current)
        }
      }

      isHydratedRef.current = true
    }

    hydrate()

    // Subscribe to realtime broadcasts from other tabs/devices
    const unsub = subscribeAppState(key, (payload) => {
      if (cancelled || !payload) return
      applyRemote(payload.v, payload.d)
    })

    return () => {
      cancelled = true
      unsub()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (retryTimerRef.current) clearTimeout(retryTimerRef.current)
    }
  }, [key, persistPendingSave])

  // Custom setter that updates state, localStorage, and syncs to Supabase
  const setValue = useCallback(
    (action) => {
      setValueState((prev) => {
        const nextValue = typeof action === "function" ? action(prev) : action

        // Increment version on user modification
        versionRef.current = (versionRef.current || 0) + 1
        const newVersion = versionRef.current
        valueRef.current = nextValue
        pendingSaveRef.current = { version: newVersion, value: nextValue }

        // Save immediately to localStorage
        setLocalItem(key, nextValue, newVersion)

        // Debounce cloud saving & broadcast to other tabs
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
        saveTimerRef.current = setTimeout(() => {
          persistPendingSave()
        }, 300)

        return nextValue
      })
    },
    [key, persistPendingSave]
  )

  return [value, setValue]
}
