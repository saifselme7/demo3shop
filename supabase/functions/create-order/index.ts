import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceRoleKey) return json({ error: 'Server configuration is incomplete.' }, 500);

  try {
    const form = await request.formData();
    const orderValue = form.get('order');
    const proof = form.get('proof');
    if (typeof orderValue !== 'string' || !(proof instanceof File)) return json({ error: 'Order data and payment proof are required.' }, 400);
    if (proof.size <= 0 || proof.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(proof.type)) {
      return json({ error: 'Payment proof must be a JPG, PNG, or WEBP image under 5MB.' }, 400);
    }

    const order = JSON.parse(orderValue) as Record<string, unknown>;
    const extension = proof.type === 'image/png' ? 'png' : proof.type === 'image/webp' ? 'webp' : 'jpg';
    const path = `pending/${crypto.randomUUID()}.${extension}`;
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const bytes = new Uint8Array(await proof.arrayBuffer());
    const upload = await admin.storage.from('payment-proofs').upload(path, bytes, { contentType: proof.type, cacheControl: '3600', upsert: false });
    if (upload.error) return json({ error: 'Unable to store payment proof.' }, 500);

    const { data, error } = await admin.rpc('create_order', {
      p_order: { ...order, payment_proof_path: path },
    });
    if (error) {
      await admin.storage.from('payment-proofs').remove([path]);
      return json({ error: error.message }, 400);
    }

    const record = Array.isArray(data) ? data[0] : data;
    return json({ order: record });
  } catch {
    return json({ error: 'The order payload could not be processed.' }, 400);
  }
});
