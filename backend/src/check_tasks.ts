import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        console.log("Checking retos_semanales_tareas data...");
        const { data, error } = await supabase.from('retos_semanales_tareas').select('*').limit(1);
        if (data && data.length > 0) console.log("Columns retos_semanales_tareas:", Object.keys(data[0]));

        console.log("\nChecking usuarios_retos_tareas data...");
        const { data: d2, error: e2 } = await supabase.from('usuarios_retos_tareas').select('*').limit(1);
        if (e2) console.error("Error:", e2.message);
        // If empty, let's try to get all columns via a dummy query or just assuming they match the pattern

        // Actually, let's try to see if it has 'reto_semanal_id' or 'reto_id'
        const res1 = await supabase.from('usuarios_retos_tareas').select('reto_id').limit(1);
        console.log("usuarios_retos_tareas has reto_id?", !res1.error);
        const res2 = await supabase.from('usuarios_retos_tareas').select('reto_semanal_id').limit(1);
        console.log("usuarios_retos_tareas has reto_semanal_id?", !res2.error);

    } catch (e) {
        console.error(e);
    }
})();
