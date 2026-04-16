import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const SYNC_SECRET = Deno.env.get('SHEET_SYNC_SECRET')!

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 })

  if (req.headers.get('x-sync-secret') !== SYNC_SECRET) {
    return new Response('Unauthorized', { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { error } = await supabase.from('posts').insert({
    name:           body.name,
    class:          body.class,
    school_year:    body.school_year,
    city:           body.city,
    country:        body.country,
    caption:        body.caption ?? null,
    image_url:      body.image_url ?? null,
    lat:            body.lat,
    lng:            body.lng,
    instagram:      body.instagram ?? null,
    facebook:       body.facebook ?? null,
    linkedin:       body.linkedin ?? null,
    secondary_class: body.secondary_class ?? null,
    approved:       true,
  })

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400 })
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 })
})
