
import { supabase } from '../config/supabaseClient';

async function verifyConnection() {
    console.log("🔍 Verifying Supabase Connection...");

    // 1. Check misiones_diarias
    console.log("Checking 'misiones_diarias'...");
    const { data: misiones, error: errorMisiones } = await supabase
        .from('misiones_diarias')
        .select('count', { count: 'exact', head: true });

    if (errorMisiones) {
        console.error("❌ Error accessing 'misiones_diarias':", errorMisiones);
    } else {
        console.log("✅ 'misiones_diarias' accessible. Count:", misiones);
    }

    // 2. Check consejos_diarios
    console.log("Checking 'consejos_diarios'...");
    const { data: consejos, error: errorConsejos } = await supabase
        .from('consejos_diarios')
        .select('count', { count: 'exact', head: true });

    if (errorConsejos) {
        console.error("❌ Error accessing 'consejos_diarios':", errorConsejos);
    } else {
        console.log("✅ 'consejos_diarios' accessible. Count:", consejos);
    }

    // 3. Check misiones_usuario
    console.log("Checking 'misiones_usuario'...");
    const { data: musuarios, error: errorMusuarios } = await supabase
        .from('misiones_usuario')
        .select('count', { count: 'exact', head: true });

    if (errorMusuarios) {
        console.error("❌ Error accessing 'misiones_usuario':", errorMusuarios);
    } else {
        console.log("✅ 'misiones_usuario' accessible. Count:", musuarios);
    }

    // 4. Test Service Role Key Privilege (bypass RLS)
    // Try to insert a dummy log if safe? Better not modify.
    // Just select something that might be RLS protected but visible to admin.
    // We already did with count.
}

verifyConnection();
