import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your actual Supabase project URL and anon/public key
const supabaseUrl = 'https://ryfgxpvtgqlacxirozuq.supabase.co';
const supabaseKey = 'sb_publishable__urMlzlGlw2DMKBAgCvuuQ_-203DM5_'; // <-- Publishable key provided by user

export const supabase = createClient(supabaseUrl, supabaseKey);
