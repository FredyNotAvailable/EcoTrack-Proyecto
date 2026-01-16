import { supabase } from '../config/supabaseClient';

async function inspectUserMeta() {
    const { data: userList, error } = await supabase.auth.admin.listUsers({
        perPage: 5
    });

    if (error) {
        console.error("Error:", error.message);
        return;
    }

    userList.users.forEach(u => {
        console.log(`User: ${u.email}`);
        console.log(`- Provider: ${u.app_metadata?.provider}`);
        console.log(`- Providers list:`, u.identities?.map(i => i.provider));
        console.log(`---`);
    });

    process.exit(0);
}

inspectUserMeta();
