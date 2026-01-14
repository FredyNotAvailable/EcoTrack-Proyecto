import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        console.log("Checking usuarios_retos_semanales data...");
        const { data, error } = await supabase.from('usuarios_retos_semanales').select('*').limit(5);
        if (error) {
            console.error("Error:", error.message);
        } else {
            console.log("Data found:", data);
            if (data.length > 0) console.log("Columns:", Object.keys(data[0]));
        }

        console.log("\nChecking retos_semanales data...");
        const { data: d2, error: e2 } = await supabase.from('retos_semanales').select('*').limit(1);
        if (e2) console.error("Error:", e2.message);
        else if (d2.length > 0) console.log("Columns:", Object.keys(d2[0]));

    } catch (e) {
        console.error(e);
    }
})();
