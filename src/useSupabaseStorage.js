import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export function useSupabaseStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from Supabase on mount
  useEffect(() => {
    supabase.from('app_state').select('value').eq('key', key).single()
      .then(({ data, error }) => {
        if (data && data.value) {
          setValue(data.value);
        }
        setIsInitialized(true);
      })
      .catch((err) => {
        setIsInitialized(true);
      });

    // We could add real-time subscriptions here if we wanted!
    // But this is enough to load centralized data on mount.
  }, [key]);

  // Save to Supabase on change
  useEffect(() => {
    if (isInitialized) {
      supabase.from('app_state').upsert({ key, value }).then();
    }
  }, [key, value, isInitialized]);

  return [value, setValue];
}
