import { supabase } from '../config/supabaseClient';

async function check() {
    console.log("Checking profiles table for email column...");
    const { data, error } = await supabase.from('profiles').select('email').limit(1);
    console.log('Data:', data);
    console.log('Error:', error);
    process.exit(0);
}

check();
