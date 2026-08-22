import { supabase } from "./supabase"

const SYNC = "_cs"
const PREFIX = "v2:"

const listeners = new Map()
let channel
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
  if (value === undefined) return null
  if (isEnvelope(value)) return { v: Number(value.v) || 0, d: value.d }
  return { v: 1, d: value }
}

function wrap(v, d) {
  return { [SYNC]: 1, v, d }
}

function storageKey(key) {
  return `${PREFIX}${key}`
}

function notify(key, payload) {
  const set = listeners.get(key)
  if (!set) return
  for (const fn of set) fn(payload)
}

function pickBest(rows) {
  if (!rows.length) return null
  return rows.reduce((best, row) => (row.v >= best.v ? row : best))
}

async function readKey(dbKey) {
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
}

async function refreshAll() {
  const { data, error } = await supabase.from("app_state").select("key,value")
  if (error) {
    console.error("Failed to load clinic data", error)
    return
  }

  const byKey = new Map()
  for (const row of data || []) {
    if (!row.key?.startsWith(PREFIX)) continue
    const key = row.key.slice(PREFIX.length)
    const parsed = unwrap(row.value)
    if (!parsed) continue
    const prev = byKey.get(key)
    if (!prev || parsed.v >= prev.v) byKey.set(key, parsed)
  }

  for (const [key, payload] of byKey) {
    notify(key, payload)
  }
}

function ensureStarted() {
  if (started) return
  started = true

  channel = supabase
    .channel("clinic-app-state-v2", {
      config: { broadcast: { self: false } },
    })
    .on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload?.key == null || payload.v == null) return
      notify(payload.key, { v: payload.v, d: payload.d })
    })
    .subscribe()

  refreshAll()
  setInterval(refreshAll, 5000)

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") refreshAll()
  })
  window.addEventListener("focus", refreshAll)
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
  const current = await readKey(storageKey(key))
  if (!current.ok) return current
  if (!current.missing) return current

  const legacy = await readKey(key)
  if (!legacy.ok) return legacy
  if (legacy.missing) return { ok: true, missing: true }

  return { ...legacy, migrated: true }
}

export async function saveAppState(key, v, d) {
  ensureStarted()
  const dbKey = storageKey(key)
  const value = wrap(v, d)

  const { error: upsertError } = await supabase
    .from("app_state")
    .upsert({ key: dbKey, value }, { onConflict: "key" })

  if (upsertError) {
    const { data: updated, error: updateError } = await supabase
      .from("app_state")
      .update({ value })
      .eq("key", dbKey)
      .select("key")

    if (updateError) {
      console.error("Failed to save", key, updateError)
    } else if (!updated?.length) {
      const { error: insertError } = await supabase
        .from("app_state")
        .insert({ key: dbKey, value })
      if (insertError) console.error("Failed to save", key, insertError)
    }
  }

  await channel?.send({
    type: "broadcast",
    event: "state",
    payload: { key, v, d },
  })
}
