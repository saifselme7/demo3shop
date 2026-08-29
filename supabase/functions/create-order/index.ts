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

// Core allowed MIME types + common variants
const PROOF_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/pjpeg',
  'image/jpe',
  'image/jfif',
  'image/png',
  'image/x-png',
  'image/webp',
  'image/x-webp',
]);
const MAX_PROOF_SIZE = 5 * 1024 * 1024;

function normalizeMime(raw: string, fileName: string): string {
  let mime = (raw || '').toLowerCase().trim();
  // Some browsers report empty type – infer from extension
  if (!mime) {
    const lowerName = (fileName || '').toLowerCase();
    if (lowerName.endsWith('.png')) return 'image/png';
    if (lowerName.endsWith('.webp')) return 'image/webp';
    if (lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg') || lowerName.endsWith('.jpe') || lowerName.endsWith('.jfif')) {
      return 'image/jpeg';
    }
    return '';
  }
  // Strip parameters like "; charset=utf-8" if ever present
  if (mime.includes(';')) mime = mime.split(';')[0].trim();
  return mime;
}

function proofContentType(mime: string): string {
  if (mime === 'image/png' || mime === 'image/x-png') return 'image/png';
  if (mime === 'image/webp' || mime === 'image/x-webp') return 'image/webp';
  // All jpeg variants -> image/jpeg
  return 'image/jpeg';
}

function extensionFromMimeOrName(mime: string, fileName: string): string {
  const contentType = proofContentType(mime);
  if (contentType === 'image/png') return 'png';
  if (contentType === 'image/webp') return 'webp';
  // jpeg fallback – try to preserve original extension hint if available
  const lowerName = (fileName || '').toLowerCase();
  if (lowerName.endsWith('.png')) return 'png';
  if (lowerName.endsWith('.webp')) return 'webp';
  return 'jpg';
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // Support both legacy NEXT_PUBLIC_ names and the default Supabase-injected names
  const supabaseUrl =
    Deno.env.get('SUPABASE_URL') ||
    Deno.env.get('NEXT_PUBLIC_SUPABASE_URL') ||
    '';
  const anonKey =
    Deno.env.get('SUPABASE_ANON_KEY') ||
    Deno.env.get('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY') ||
    Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ||
    Deno.env.get('NEXT_PUBLIC_SUPABASE_ANON_KEY') ||
    '';
  const serviceRoleKey =
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ||
    Deno.env.get('SERVICE_ROLE_KEY') ||
    Deno.env.get('SUPABASE_SECRET_KEY') ||
    '';

  // We need URL + at least one key. Prefer service_role for storage if available.
  const hasAnon = Boolean(supabaseUrl && anonKey);
  const hasService = Boolean(supabaseUrl && serviceRoleKey);
  if (!supabaseUrl || (!hasAnon && !hasService)) {
    console.error('create-order: missing env', {
      hasUrl: Boolean(supabaseUrl),
      hasAnon,
      hasService,
      envKeys: Object.keys(Deno.env.toObject()).filter((k) => k.toLowerCase().includes('supabase')),
    });
    return json({ error: 'Server configuration is incomplete. Missing SUPABASE_URL / ANON or SERVICE_ROLE.' }, 500);
  }

  try {
    const form = await request.formData();
    const orderValue = form.get('order');
    const proof = form.get('proof');
    if (typeof orderValue !== 'string' || !(proof instanceof File)) {
      return json({ error: 'Order data and payment proof are required.' }, 400);
    }

    const rawMime = proof.type || '';
    const fileName = (proof as File).name || 'proof.jpg';
    const proofMime = normalizeMime(rawMime, fileName);

    if (!proofMime || !PROOF_MIME_TYPES.has(proofMime)) {
      console.error('create-order: invalid mime', { rawMime, normalized: proofMime, fileName, size: proof.size });
      return json(
        {
          error: `Payment proof must be a JPG, PNG, or WEBP image under 5MB. Received type: ${rawMime || 'empty'} (${fileName})`,
          code: 'INVALID_MIME',
          receivedMime: rawMime,
          fileName,
        },
        400,
      );
    }

    if (proof.size <= 0 || proof.size > MAX_PROOF_SIZE) {
      console.error('create-order: invalid size', { size: proof.size, fileName });
      return json(
        {
          error: `Payment proof must be under 5MB. Received ${proof.size} bytes.`,
          code: 'INVALID_SIZE',
          size: proof.size,
        },
        400,
      );
    }

    let order: Record<string, unknown>;
    try {
      order = JSON.parse(orderValue) as Record<string, unknown>;
    } catch (parseError) {
      console.error('create-order: order JSON parse failed', parseError, orderValue.slice(0, 500));
      return json({ error: 'Order payload is not valid JSON.', code: 'INVALID_ORDER_JSON' }, 400);
    }

    const contentType = proofContentType(proofMime);
    const extension = extensionFromMimeOrName(proofMime, fileName);
    const path = `pending/${crypto.randomUUID()}.${extension}`;

    // Client for RPC – anon is fine (RPC is SECURITY DEFINER, granted to anon)
    const rpcClient = createClient(supabaseUrl, hasAnon ? anonKey : serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    // Storage client – prefer service_role to bypass RLS issues, fallback to anon with signed URL
    let uploadPath: string | null = null;

    if (hasService) {
      // Direct upload with service_role – most reliable, still keeps bucket private
      const storageClient = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      console.log('create-order: uploading with service_role', { path, contentType, size: proof.size, mime: proofMime });
      const { error: uploadError } = await storageClient.storage
        .from('payment-proofs')
        .upload(path, proof, { contentType, cacheControl: '3600', upsert: false });
      if (uploadError) {
        console.error('create-order: service_role upload failed', {
          message: uploadError.message,
          name: (uploadError as any).name,
          status: (uploadError as any).status,
          statusCode: (uploadError as any).statusCode,
          path,
        });
        return json(
          {
            error: uploadError.message || 'Unable to store payment proof.',
            code: 'STORAGE_UPLOAD_FAILED',
            details: uploadError.message,
            storageError: (uploadError as any).message,
            status: (uploadError as any).status,
          },
          500,
        );
      }
      uploadPath = path;
    } else {
      // Fallback: anon + signed upload URL (original secure architecture)
      const anonClient = createClient(supabaseUrl, anonKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      console.log('create-order: creating signed upload URL with anon', { path });
      const signed = await anonClient.storage.from('payment-proofs').createSignedUploadUrl(path);
      if (signed.error || !signed.data?.token) {
        console.error('create-order: createSignedUploadUrl failed', {
          error: signed.error,
          message: signed.error?.message,
          path,
        });
        return json(
          {
            error: signed.error?.message || 'Unable to prepare payment proof upload.',
            code: 'SIGNED_URL_FAILED',
            details: signed.error?.message,
          },
          500,
        );
      }
      console.log('create-order: uploading to signed URL', { path, tokenPresent: Boolean(signed.data.token) });
      // Use the File directly – more compatible than Uint8Array
      const upload = await anonClient.storage
        .from('payment-proofs')
        .uploadToSignedUrl(path, signed.data.token, proof, { contentType, cacheControl: '3600', upsert: false });
      if (upload.error) {
        console.error('create-order: uploadToSignedUrl failed', {
          message: upload.error.message,
          name: (upload.error as any).name,
          status: (upload.error as any).status,
          path,
        });
        return json(
          {
            error: upload.error.message || 'Unable to store payment proof.',
            code: 'SIGNED_UPLOAD_FAILED',
            details: upload.error.message,
            status: (upload.error as any).status,
          },
          500,
        );
      }
      uploadPath = path;
    }

    if (!uploadPath) {
      return json({ error: 'Upload path not set after storage operation.', code: 'UPLOAD_PATH_MISSING' }, 500);
    }

    console.log('create-order: calling create_order RPC', { path: uploadPath });
    const { data, error } = await rpcClient.rpc('create_order', {
      p_order: { ...order, payment_proof_path: uploadPath },
    });
    if (error) {
      console.error('create-order: RPC create_order failed', {
        message: error.message,
        code: error.code,
        details: (error as any).details,
        hint: (error as any).hint,
        path: uploadPath,
      });
      // Attempt cleanup of uploaded proof if order creation fails to avoid orphaned files
      try {
        if (hasService) {
          const cleanupClient = createClient(supabaseUrl, serviceRoleKey, {
            auth: { persistSession: false, autoRefreshToken: false },
          });
          await cleanupClient.storage.from('payment-proofs').remove([uploadPath]);
        }
      } catch (cleanupErr) {
        console.error('create-order: cleanup after RPC failure failed', cleanupErr);
      }
      return json(
        {
          error: error.message,
          code: 'RPC_FAILED',
          details: error.message,
          rpcCode: (error as any).code,
        },
        400,
      );
    }

    const record = Array.isArray(data) ? data[0] : data;
    console.log('create-order: success', { order_number: (record as any)?.order_number, path: uploadPath });
    return json({ order: record });
  } catch (error) {
    console.error('create-order: unhandled failure', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return json(
      {
        error: `The order payload could not be processed. ${message}`,
        code: 'UNHANDLED',
        details: message,
      },
      400,
    );
  }
});
