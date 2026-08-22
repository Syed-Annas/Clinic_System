import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ktkxcecyykrbgjfcmism.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0a3hjZWN5eWtyYmdqZmNtaXNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODczMTQyNDYsImV4cCI6MjEwMjg5MDI0Nn0.hPOEdQGPQilpRk-ydOqffe0kERPv0jtQZSaq3VpZMlo'
export const supabase = createClient(supabaseUrl, supabaseKey)
