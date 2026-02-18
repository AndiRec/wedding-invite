import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req) => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Create admin user
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const adminExists = existingUsers?.users?.some(u => u.email === "ajlin@wedding.com");

  if (!adminExists) {
    const { error } = await supabase.auth.admin.createUser({
      email: "ajlin@wedding.com",
      password: "1506",
      email_confirm: true,
    });
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 400 });
    }
  }

  return new Response(JSON.stringify({ success: true, message: "Admin user ready" }), {
    headers: { "Content-Type": "application/json" },
  });
});
