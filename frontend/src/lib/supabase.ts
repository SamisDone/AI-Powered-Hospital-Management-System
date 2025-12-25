import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lrahdwirffpkgnhmjhch.supabase.co'
const supabaseKey = 'sb_publishable_eKRLFU5b_I_eEc3ynWspHA_YOojuot5'

export const supabase = createClient(supabaseUrl, supabaseKey)