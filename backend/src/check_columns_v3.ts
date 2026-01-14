import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });
const { supabase } = require('./config/supabaseClient');

(async () => {
    try {
        const check = async (table: string, col: string) => {
            const { error } = await supabase.from(table).select(col).limit(1);
            return !error;
        };

        const tables = ['usuarios_retos_semanales', 'usuarios_retos_tareas'];
        const cols = ['reto_id', 'reto_semanal_id', 'reto_semanales_id'];

        for (const t of tables) {
            console.log(`--- Table: ${t} ---`);
            for (const c of cols) {
                const ok = await check(t, c);
                console.log(`${c}: ${ok ? 'YES' : 'NO'}`);
            }
        }
    } catch (e) {
        console.error(e);
    }
})();
