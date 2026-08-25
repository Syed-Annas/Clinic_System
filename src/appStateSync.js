import { supabase } from "./supabase"

const SYNC = "_cs"
const PREFIX = "v2:"

const listeners = new Map()
let channel = null
let started = false

function isEnvelope(value) {
  return (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    value[SYNC] === 1 &&
    "v" in value &&
    "d" in value
  )
}

function unwrap(value) {
  if (value === undefined || value === null) return null
  if (isEnvelope(value)) return { v: Number(value.v) || 0, d: value.d }
  return { v: 1, d: value }
}

function wrap(v, d) {
  return { [SYNC]: 1, v, d, ts: Date.now() }
}

function notify(key, payload) {
  const set = listeners.get(key)
  if (!set) return
  for (const fn of set) {
    try {
      fn(payload)
    } catch (err) {
      console.error(`Error notifying listener for ${key}:`, err)
    }
  }
}

function pickBest(rows) {
  if (!rows.length) return null
  return rows.reduce((best, row) => (row.v >= best.v ? row : best))
}

async function readKey(dbKey) {
  try {
    const { data, error } = await supabase
      .from("app_state")
      .select("value")
      .eq("key", dbKey)

    if (error) return { ok: false, error }

    const versions = (data || [])
      .map((row) => unwrap(row.value))
      .filter(Boolean)

    if (!versions.length) return { ok: true, missing: true }
    return { ok: true, missing: false, ...pickBest(versions) }
  } catch (err) {
    return { ok: false, error: err }
  }
}

export async function refreshAll() {
  try {
    const { data, error } = await supabase.from("app_state").select("key,value")
    if (error) {
      if (error.code !== "42501") {
        console.warn("Supabase refresh warning:", error.message || error)
      }
      return
    }

    const byKey = new Map()
    for (const row of data || []) {
      if (!row.key) continue
      // Handle both "v2:appointments" and "appointments"
      const normalizedKey = row.key.startsWith(PREFIX)
        ? row.key.slice(PREFIX.length)
        : row.key

      const parsed = unwrap(row.value)
      if (!parsed) continue

      const prev = byKey.get(normalizedKey)
      if (!prev || parsed.v >= prev.v) {
        byKey.set(normalizedKey, parsed)
      }
    }

    for (const [key, payload] of byKey) {
      notify(key, payload)
    }
  } catch (err) {
    console.warn("Error refreshing clinic state from Supabase:", err)
  }
}

function setupRealtimeChannel() {
  try {
    if (channel) {
      try {
        supabase.removeChannel(channel)
      } catch {}
    }

    channel = supabase
      .channel("clinic-app-state-v2", {
        config: { broadcast: { self: false } },
      })
      .on("broadcast", { event: "state" }, ({ payload }) => {
        if (payload?.key == null || payload.v == null) return
        notify(payload.key, { v: payload.v, d: payload.d })
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          refreshAll()
        }
      })
  } catch (err) {
    console.warn("Could not subscribe to Supabase broadcast channel:", err)
  }
}

function ensureStarted() {
  if (started) return
  started = true

  setupRealtimeChannel()
  refreshAll()

  // Poll every 3 seconds for mobile devices where WebSockets sleep in background
  setInterval(refreshAll, 3000)

  // Mobile lifecycle listeners: re-sync & reconnect when mobile browser wakes up
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        setupRealtimeChannel()
        refreshAll()
      }
    })
  }

  if (typeof window !== "undefined") {
    window.addEventListener("focus", () => {
      setupRealtimeChannel()
      refreshAll()
    })
    window.addEventListener("pageshow", () => {
      setupRealtimeChannel()
      refreshAll()
    })
    window.addEventListener("online", () => {
      setupRealtimeChannel()
      refreshAll()
    })
  }
}

export function subscribeAppState(key, onValue) {
  ensureStarted()
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(onValue)
  return () => {
    listeners.get(key)?.delete(onValue)
  }
}

export async function loadAppState(key) {
  // First try direct key
  const direct = await readKey(key)
  if (direct.ok && !direct.missing) return direct

  // Next try prefixed key
  const prefixed = await readKey(`${PREFIX}${key}`)
  if (prefixed.ok && !prefixed.missing) return prefixed

  if (!direct.ok && !prefixed.ok) return direct
  return { ok: true, missing: true }
}

export async function saveAppState(key, v, d) {
  ensureStarted()
  const value = wrap(v, d)

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const { error: upsertError } = await supabase
        .from("app_state")
        .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

      if (!upsertError) {
        try {
          await channel?.send({
            type: "broadcast",
            event: "state",
            payload: { key, v, d },
          })
        } catch (err) {
          console.warn("Realtime broadcast send failed:", err)
        }
        return true
      }

      if (attempt === 3 || upsertError.code === "42501") {
        console.error("Supabase save failed:", key, upsertError)
        return false
      }
    } catch (err) {
      if (attempt === 3) {
        console.error("Supabase save exception:", key, err)
        return false
      }
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 500))
  }

  return false
}
