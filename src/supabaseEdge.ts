const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

/** POST multipart to a Supabase Edge Function (JWT required when verify_jwt is enabled). */
export async function postEdgeFunction(
  functionName: 'submit-post' | 'submit-update',
  formData: FormData
): Promise<{ ok: boolean; status: number; body: Record<string, unknown> }> {
  if (!baseUrl?.trim()) {
    throw new Error('Thiếu VITE_SUPABASE_URL (khai báo trên Vercel khi deploy).')
  }

  let res: Response
  try {
    res = await fetch(`${baseUrl.replace(/\/$/, '')}/functions/v1/${functionName}`, {
      method: 'POST',
      headers: publishableKey?.trim() ? { Authorization: `Bearer ${publishableKey.trim()}` } : {},
      body: formData,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === 'Failed to fetch' || e instanceof TypeError) {
      throw new Error(
        'Không gọi được Supabase (Failed to fetch). Thường do CORS hoặc URL sai — redeploy Edge Function submit-post / submit-update sau khi cập nhật server.'
      )
    }
    throw e
  }

  const text = await res.text()
  let body: Record<string, unknown> = {}
  try {
    body = text ? (JSON.parse(text) as Record<string, unknown>) : {}
  } catch {
    throw new Error(
      `Máy chủ trả lời không hợp lệ (${res.status}). Kiểm tra đã deploy Edge Function "${functionName}" chưa.`
    )
  }

  return { ok: res.ok, status: res.status, body }
}

export function edgeErrorMessage(status: number, body: Record<string, unknown>): string {
  const msg = body.error
  if (typeof msg === 'string' && msg.trim()) return msg
  if (status === 401) return 'Không được phép gọi API (401). Thêm VITE_SUPABASE_PUBLISHABLE_KEY trên Vercel hoặc tắt JWT verify cho function trên Supabase.'
  if (status === 404) return 'Không tìm thấy Edge Function (404). Deploy submit-post / submit-update lên đúng project Supabase.'
  if (status === 503) return 'Dịch vụ tạm ngưng (503). Kiểm tra Secrets Upstash Redis trên Supabase (Edge Functions → Secrets).'
  return `Gửi thất bại (${status}). Mở F12 → Network xem chi tiết.`
}
