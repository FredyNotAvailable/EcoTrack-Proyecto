import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Usa la service_role para admin
);

async function listAuthUsers() {
  let page = 1;
  let allUsers: any[] = [];
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error('Error listing users:', error);
      break;
    }
    if (!data?.users?.length) break;
    allUsers = allUsers.concat(data.users);
    page++;
  }
  allUsers.forEach(u => {
    console.log({
      id: u.id,
      email: u.email,
      provider: u.app_metadata?.provider,
      identities: u.identities
    });
  });
}

listAuthUsers();
