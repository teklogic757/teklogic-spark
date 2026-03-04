
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load env vars
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing Supabase URL or Service Role Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function resetPassword() {
    const email = 'teklogic757@gmail.com';
    const newPassword = 'RUn22llamas!';

    console.log(`Resetting password for ${email}...`);

    // 1. Get User ID from Auth to confirm existence
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('Error listing users:', listError);
        return;
    }

    const user = users.find(u => u.email === email);

    if (!user) {
        console.error('User not found in Auth system!');
        return;
    }

    console.log(`Found Auth User: ${user.id}`);

    // 2. Update Password
    const { data, error } = await supabase.auth.admin.updateUserById(
        user.id,
        { password: newPassword }
    );

    if (error) {
        console.error('Error updating password:', error);
    } else {
        console.log('✅ Password successfully updated to: RUn22llamas!');
        console.log('User ID:', data.user.id);
    }
}

resetPassword();
