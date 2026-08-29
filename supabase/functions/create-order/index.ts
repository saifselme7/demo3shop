import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const PROOF_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/pjpeg']);
const MAX_PROOF_SIZE = 5 * 1024 * 1024;

function proofContentType(mime: string): string {
  return mime === 'image/jpg' || mime === 'image/pjpeg' ? 'image/jpeg' : mime;
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
  const publishableKey = Deno.env.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !publishableKey) return json({ error: 'Server configuration is incomplete.' }, 500);

  try {
    const form = await request.formData();
    const orderValue = form.get('order');
    const proof = form.get('proof');
    if (typeof orderValue !== 'string' || !(proof instanceof File)) return json({ error: 'Order data and payment proof are required.' }, 400);
    const proofMime = proof.type.toLowerCase();
    if (proof.size <= 0 || proof.size > MAX_PROOF_SIZE || !PROOF_MIME_TYPES.has(proofMime)) {
      return json({ error: 'Payment proof must be a JPG, PNG, or WEBP image under 5MB.' }, 400);
    }

    const order = JSON.parse(orderValue) as Record<string, unknown>;
    const contentType = proofContentType(proofMime);
    const extension = contentType === 'image/png' ? 'png' : contentType === 'image/webp' ? 'webp' : 'jpg';
    const path = `pending/${crypto.randomUUID()}.${extension}`;
    const client = createClient(supabaseUrl, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } });
    const bytes = new Uint8Array(await proof.arrayBuffer());

    // Keep the proof private: a signed upload URL is created with the anon INSERT
    // policy and the file is written through that URL, which does not require (or
    // grant) a customer SELECT policy on storage.objects.
    const signed = await client.storage.from('payment-proofs').createSignedUploadUrl(path);
    if (signed.error || !signed.data?.token) return json({ error: signed.error?.message || 'Unable to prepare payment proof upload.' }, 500);
    const upload = await client.storage.from('payment-proofs').uploadToSignedUrl(path, signed.data.token, bytes, { contentType, cacheControl: '3600', upsert: false });
    if (upload.error) return json({ error: upload.error.message || 'Unable to store payment proof.' }, 500);

    const { data, error } = await client.rpc('create_order', {
      p_order: { ...order, payment_proof_path: path },
    });
    if (error) return json({ error: error.message }, 400);

    const record = Array.isArray(data) ? data[0] : data;
    return json({ order: record });
  } catch (error) {
    console.error('create-order failure', error);
    return json({ error: 'The order payload could not be processed.' }, 400);
  }
});
