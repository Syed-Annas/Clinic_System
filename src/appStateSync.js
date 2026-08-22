import { supabase } from "./supabase"

const listeners = new Map()
let channel
let started = false

function notify(key, value) {
  const set = listeners.get(key)
  if (!set) return
  for (const fn of set) fn(value)
}

async function refreshAll() {
  const { data, error } = await supabase.from("app_state").select("key,value")
  if (error) {
    console.error("Failed to load clinic data", error)
    return
  }
  for (const row of data || []) {
    notify(row.key, row.value)
  }
}

function ensureStarted() {
  if (started) return
  started = true

  channel = supabase
    .channel("clinic-app-state", {
      config: { broadcast: { self: false } },
    })
    .on("broadcast", { event: "state" }, ({ payload }) => {
      if (payload?.key == null) return
      notify(payload.key, payload.value)
    })
    .subscribe()

  refreshAll()
  setInterval(refreshAll, 2000)

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
  const { data, error } = await supabase
    .from("app_state")
    .select("value")
    .eq("key", key)
    .limit(1)

  if (error) {
    console.error("Failed to load", key, error)
    return undefined
  }

  return data?.[0]?.value
}

export async function saveAppState(key, value) {
  ensureStarted()
  const { error } = await supabase
    .from("app_state")
    .upsert({ key, value }, { onConflict: "key" })

  if (error) {
    console.error("Failed to save", key, error)
  }

  await channel?.send({
    type: "broadcast",
    event: "state",
    payload: { key, value },
  })
}
