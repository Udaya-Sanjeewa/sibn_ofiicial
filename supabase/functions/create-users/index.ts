import { createClient } from 'npm:@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const users = [
      {
        email: 'admin@sibn.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        email: 'user@sibn.com',
        password: 'user123',
        role: 'user',
      },
    ];

    const results = [];

    for (const userData of users) {
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const userExists = existingUser?.users.some(u => u.email === userData.email);

      if (userExists) {
        results.push({
          email: userData.email,
          status: 'already_exists',
        });
        continue;
      }

      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          role: userData.role,
        },
      });

      if (error) {
        results.push({
          email: userData.email,
          status: 'error',
          error: error.message,
        });
      } else {
        if (userData.role === 'admin') {
          await supabaseAdmin
            .from('admin_users')
            .insert({
              user_id: data.user.id,
              email: userData.email,
              role: 'admin',
            });
        }

        await supabaseAdmin
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email,
            full_name: userData.role === 'admin' ? 'Admin User' : 'Regular User',
          });

        results.push({
          email: userData.email,
          status: 'created',
          user_id: data.user.id,
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});