// src/utils/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

// Eksport klienta Supabase do użycia w całej aplikacji
export const supabase = createClient(supabaseUrl, supabaseAnonKey)