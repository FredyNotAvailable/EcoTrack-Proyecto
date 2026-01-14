import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        console.log("Listing columns for 'usuarios_retos_tareas'...");
        const { data, error } = await supabase.from('usuarios_retos_tareas').select('*').limit(1);
        if (error) {
            console.error("Fetch error:", error.message);
            return;
        }
        if (data && data.length > 0) {
            console.log("Sample row:", data[0]);
            console.log("Columns:", Object.keys(data[0]));
        } else {
            console.log("Table is empty. Checking schema via RPC if possible or just assuming...");
            // If empty, let's try to insert a dummy row or something? No, let's just try to infer.
            // Wait, usually if it's empty I can't see keys.
            // Let's try to select common names.
        }
    } catch (e) {
        console.error(e);
    }
})();
