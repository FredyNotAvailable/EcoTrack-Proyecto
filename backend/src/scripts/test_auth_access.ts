import { supabase } from '../config/supabaseClient';

async function testAuthAccess() {
    const email = "test_user_lookup@example.com"; // dummy email
    console.log("Testing auth access methods...");

    // Method 1: Schema Access
    try {
        console.log("1. Testing supabase.schema('auth').from('users')...");
        const { data, error } = await supabase
            .schema('auth')
            .from('users')
            .select('id, email')
            .limit(1);

        if (error) {
            console.log("❌ Schema access failed:", error.message);
        } else {
            console.log("✅ Schema access success. Data:", data);
        }
    } catch (e) {
        console.log("❌ Schema access exception:", e);
    }

    // Method 2: Admin listUsers
    try {
        console.log("2. Testing supabase.auth.admin.listUsers()...");
        const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });

        if (error) {
            console.log("❌ listUsers failed:", error.message);
        } else {
            console.log("✅ listUsers success. Total users:", data.users.length);
        }
    } catch (e) {
        console.log("❌ listUsers access exception:", e);
    }

    process.exit(0);
}

testAuthAccess();
