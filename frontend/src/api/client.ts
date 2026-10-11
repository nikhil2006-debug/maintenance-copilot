import { API_BASE_URL } from '../lib/config'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...init,
    })
  } catch {
    throw new ApiError(0, 'Cannot reach the backend. Is it running?')
  }
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail // FastAPI error shape
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(res.status, String(detail))
  }
  return (await res.json()) as T
}