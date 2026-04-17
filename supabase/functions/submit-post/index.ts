import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { uploadToCloudinary } from '../_shared/cloudinary.ts'
import { checkRateLimit } from '../_shared/rateLimit.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Set to true to hold posts for manual approval, false to approve automatically
const REQUIRE_APPROVAL = false

const DEFAULT_IMAGE_URL = Deno.env.get('DEFAULT_IMAGE_URL') ?? ''

Deno.serve(async (req) => {
  const CORS = corsHeaders(req)
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405, headers: CORS })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if ((await checkRateLimit(ip, 'submit-post', 2, 86400)) === 'limited') {
    return new Response(
      JSON.stringify({ error: 'Too many submissions. Please try again later.' }),
      { status: 429, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  let form: FormData
  try {
    form = await req.formData()
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid request body.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  const name       = form.get('name') as string
  const cls        = form.get('class') as string
  const school_year = form.get('school_year') as string
  const city       = form.get('city') as string
  const country    = form.get('country') as string
  const caption    = form.get('caption') as string | null
  const lat        = parseFloat(form.get('lat') as string)
  const lng        = parseFloat(form.get('lng') as string)
  const instagram  = form.get('instagram') as string | null
  const facebook   = form.get('facebook') as string | null
  const linkedin   = form.get('linkedin') as string | null
  const imageFile  = form.get('image') as File | null

  if (!name?.trim() || !cls?.trim() || !school_year?.trim() || !city?.trim() || !country?.trim()) {
    return new Response(
      JSON.stringify({ error: 'Name, class, school year, city, and country are required.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  if (isNaN(lat) || isNaN(lng)) {
    return new Response(
      JSON.stringify({ error: 'Invalid location coordinates.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  if (imageFile && imageFile.size > 5 * 1024 * 1024) {
    return new Response(
      JSON.stringify({ error: 'Image must be under 5 MB.' }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  let image_url = DEFAULT_IMAGE_URL
  if (imageFile && imageFile.size > 0) {
    try {
      image_url = await uploadToCloudinary(imageFile)
    } catch (e) {
      return new Response(
        JSON.stringify({ error: (e as Error).message }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
      )
    }
  }

  const { error } = await supabase.from('posts').insert({
    name, class: cls, school_year, city, country, caption, image_url, lat, lng,
    instagram, facebook, linkedin,
    approved: !REQUIRE_APPROVAL,
  })

  if (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } }
    )
  }

  return new Response(
    JSON.stringify({ success: true, requiresApproval: REQUIRE_APPROVAL }),
    { status: 200, headers: { ...CORS, 'Content-Type': 'application/json' } }
  )
})
