/**
 * Browsers treat cross-origin requests with an `Authorization` header as non-wildcard CORS:
 * `Access-Control-Allow-Origin: *` is rejected → `fetch` throws "Failed to fetch".
 * Echo the request `Origin` when present (typical browser); fall back to `*` otherwise.
 */
export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin')
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type, accept, accept-language',
    'Access-Control-Max-Age': '86400',
  }
  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
    headers['Vary'] = 'Origin'
  } else {
    headers['Access-Control-Allow-Origin'] = '*'
  }
  return headers
}
