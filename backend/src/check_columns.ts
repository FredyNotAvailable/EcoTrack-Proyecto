import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        console.log("Checking 'usuarios_retos_semanales' columns...");
        // Try filtering by 'reto_id'
        const { error: error1 } = await supabase.from('usuarios_retos_semanales').select('*').eq('reto_id', '123-uuid').limit(1);
        if (error1) console.log("reto_id failed:", error1.message);
        else console.log("reto_id seems VALID for usuarios_retos_semanales");

        const { error: error2 } = await supabase.from('usuarios_retos_semanales').select('*').eq('reto_semanal_id', '123-uuid').limit(1);
        if (error2) console.log("reto_semanal_id failed:", error2.message);
        else console.log("reto_semanal_id seems VALID for usuarios_retos_semanales");

        console.log("\nChecking 'usuarios_retos_tareas' columns...");
        // Try filtering by 'reto_id'
        const { error: error3 } = await supabase.from('usuarios_retos_tareas').select('*').eq('reto_id', '123-uuid').limit(1);
        if (error3) console.log("reto_id failed:", error3.message);
        else console.log("reto_id seems VALID for usuarios_retos_tareas");

        const { error: error4 } = await supabase.from('usuarios_retos_tareas').select('*').eq('reto_semanal_id', '123-uuid').limit(1);
        if (error4) console.log("reto_semanal_id failed:", error4.message);
        else console.log("reto_semanal_id seems VALID for usuarios_retos_tareas");

    } catch (e) {
        console.error(e);
    }
})();
