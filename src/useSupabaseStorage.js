import { useState, useEffect, useRef } from "react"
import { supabase } from "./supabase"

export function useSupabaseStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue)
  const [isInitialized, setIsInitialized] = useState(false)
  const skipSave = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const { data } = await supabase
        .from("app_state")
        .select("value")
        .eq("key", key)
        .maybeSingle()

      if (cancelled) return

      if (data && data.value !== undefined && data.value !== null) {
        skipSave.current = true
        setValue(data.value)
      }

      setIsInitialized(true)
    }

    load()

    const channel = supabase
      .channel(`app_state:${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_state",
          filter: `key=eq.${key}`,
        },
        (payload) => {
          const next = payload.new?.value
          if (next === undefined || next === null) return
          skipSave.current = true
          setValue(next)
        },
      )
      .subscribe()

    return () => {
      cancelled = true
      supabase.removeChannel(channel)
    }
  }, [key])

  useEffect(() => {
    if (!isInitialized) return

    if (skipSave.current) {
      skipSave.current = false
      return
    }

    supabase
      .from("app_state")
      .upsert({ key, value }, { onConflict: "key" })
      .then()
  }, [key, value, isInitialized])

  return [value, setValue]
}
