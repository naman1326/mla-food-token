export function extractToken(input) {
  if (!input) return ''
  let str = String(input).trim()
  try {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      const url = new URL(str)
      const t =
        url.searchParams.get('t') ||
        url.searchParams.get('token') ||
        url.searchParams.get('reg_no') ||
        url.searchParams.get('id') ||
        url.searchParams.get('code')
      if (t) return t.trim()
      const segments = url.pathname.split('/').filter(Boolean)
      if (segments.length > 0) return segments[segments.length - 1].trim()
    }
  } catch {
    // Ignore URL parse error
  }
  if (str.includes('?t=')) {
    str = str.split('?t=')[1].split('&')[0]
  } else if (str.includes('?token=')) {
    str = str.split('?token=')[1].split('&')[0]
  }
  return str.trim()
}

export function interpretScanResult(response) {
  const regNo =
    response?.reg_no ||
    response?.participant_reg_no ||
    response?.reg_number ||
    response?.registration_no ||
    response?.registration_number ||
    response?.participant?.reg_no ||
    response?.participant?.reg_number ||
    null

  switch (response?.status) {
    case 'confirmed':
      return {
        tone: 'confirm',
        headline: 'CONFIRMED',
        reg_no: regNo,
        detail: (response.checkpoint?.label ?? response.checkpoint ?? '')
          .replace(/\bChat\b/gi, 'Chaat')
      }
    case 'duplicate':
      return {
        tone: 'duplicate',
        headline: 'ALREADY SCANNED',
        reg_no: regNo,
        detail: formatScanTime(response.scanned_at),
      }
    case 'invalid_token':
      return {
        tone: 'error',
        headline: 'NOT FOUND',
        reg_no: null,
        detail: "This code isn't in the system",
      }
    case 'invalid_checkpoint':
      return {
        tone: 'error',
        headline: 'COUNTER ERROR',
        reg_no: null,
        detail: 'Tell the organizer — checkpoint not recognized',
      }
    case 'network_error':
      return {
        tone: 'error',
        headline: 'NO CONNECTION',
        reg_no: null,
        detail: 'Check your signal and try again',
      }
    default:
      return {
        tone: 'error',
        headline: 'SOMETHING WENT WRONG',
        reg_no: null,
        detail: 'Try scanning again',
      }
  }
}

export function formatScanTime(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}
