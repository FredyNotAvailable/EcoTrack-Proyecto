
import { supabase } from './config/supabaseClient';
import dotenv from 'dotenv';
dotenv.config();

const testEmail = 'franco@gmail.com';

async function testReset() {
    console.log(`Testing reset password for: ${testEmail}`);

    // 1. List user
    const { data: userList, error: listError } = await supabase.auth.admin.listUsers();
    if (listError) {
        console.error("List users error:", listError);
        return;
    }

    const user = userList.users.find(u => u.email === testEmail);
    if (!user) {
        console.error("User not found in list!");
        return;
    }

    // 2. Try signInWithOtp (Magic Link)
    console.log("Attempting signInWithOtp...");
    const { error } = await supabase.auth.signInWithOtp({
        email: testEmail,
        options: {
            emailRedirectTo: 'http://localhost:5173/app/profile'
        }
    });

    if (error) {
        console.error("signInWithOtp error FULL:", JSON.stringify(error, null, 2));
    } else {
        console.log("Magic Link sent successfully!");
    }
}

testReset();
