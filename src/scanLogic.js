// Turns a record_scan() response into something a screen can render.
// Kept as a pure function (no React, no network) so it's cheap to unit test.

export function interpretScanResult(response) {
  switch (response?.status) {
    case 'confirmed':
      return {
        tone: 'confirm',
        headline: 'CONFIRMED',
        name: response.name,
        detail: response.checkpoint,
      }
    case 'duplicate':
      return {
        tone: 'duplicate',
        headline: 'ALREADY SCANNED',
        name: response.name,
        detail: formatScanTime(response.scanned_at),
      }
    case 'invalid_token':
      return {
        tone: 'error',
        headline: 'NOT FOUND',
        name: null,
        detail: "This code isn't in the system",
      }
    case 'invalid_checkpoint':
      return {
        tone: 'error',
        headline: 'COUNTER ERROR',
        name: null,
        detail: 'Tell the organizer — checkpoint not recognized',
      }
    case 'network_error':
      return {
        tone: 'error',
        headline: 'NO CONNECTION',
        name: null,
        detail: 'Check your signal and try again',
      }
    default:
      return {
        tone: 'error',
        headline: 'SOMETHING WENT WRONG',
        name: null,
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
