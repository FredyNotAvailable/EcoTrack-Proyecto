import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        console.log("Inspecting 'usuarios_retos_semanales'...");
        const { error: e1 } = await supabase.from('usuarios_retos_semanales').select('*').limit(1);
        if (e1) console.log("Fetch error:", e1.message);

        console.log("Testing columns for 'usuarios_retos_semanales'...");
        const res1 = await supabase.from('usuarios_retos_semanales').select('reto_id').limit(1);
        console.log("reto_id exists in usuarios_retos_semanales?", !res1.error);
        const res2 = await supabase.from('usuarios_retos_semanales').select('reto_semanal_id').limit(1);
        console.log("reto_semanal_id exists in usuarios_retos_semanales?", !res2.error);

        console.log("\nInspecting 'usuarios_retos_tareas'...");
        const res3 = await supabase.from('usuarios_retos_tareas').select('reto_id').limit(1);
        console.log("reto_id exists in usuarios_retos_tareas?", !res3.error);
        const res4 = await supabase.from('usuarios_retos_tareas').select('reto_semanal_id').limit(1);
        console.log("reto_semanal_id exists in usuarios_retos_tareas?", !res4.error);

    } catch (e) {
        console.error(e);
    }
})();
