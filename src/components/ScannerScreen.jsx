import { useEffect, useRef, useState, useCallback } from 'react'
import { recordScan } from '../supabaseClient.js'
import { interpretScanResult } from '../scanLogic.js'
import ResultOverlay from './ResultOverlay.jsx'
import ManualSearch from './ManualSearch.jsx'

const SCAN_REGION_ID = 'qr-scan-region'

export default function ScannerScreen({ session, onSwitchCheckpoint }) {
  const [result, setResult] = useState(null)
  const [manualMode, setManualMode] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const [sessionCount, setSessionCount] = useState(0)

  const scannerRef = useRef(null)
  const busyRef = useRef(false) // blocks overlapping scans while one request is in flight or its result is showing
  const sessionRef = useRef(session)
  sessionRef.current = session // read fresh in the camera callback below, never a stale value

  const handleDismissResult = useCallback(() => {
    setResult(null)
    busyRef.current = false
    if (scannerRef.current) {
      try {
        scannerRef.current.resume()
      } catch {
        // scanner may have been torn down (e.g. switched to manual mode mid-timeout)
      }
    }
  }, [])

  const handleDecoded = useCallback(async (decodedText) => {
    if (busyRef.current) return
    busyRef.current = true

    if (scannerRef.current) {
      try {
        await scannerRef.current.pause(true)
      } catch {
        // already paused or torn down — fine
      }
    }

    const token = decodedText.trim()
    const response = await recordScan(
      token,
      sessionRef.current.checkpointCode,
      'qr',
      sessionRef.current.deviceLabel
    )
    const interpreted = interpretScanResult(response)
    setResult(interpreted)
    if (interpreted.tone === 'confirm') setSessionCount((n) => n + 1)
  }, [])

  useEffect(() => {
    if (manualMode) return undefined // camera isn't needed while the manual panel is open

    let cancelled = false

    // Loaded on demand rather than bundled up front — it's the single biggest
    // dependency in this app, and the checkpoint-selector screen shouldn't
    // have to wait on it before it can even paint.
    import('html5-qrcode').then(({ Html5Qrcode }) => {
      if (cancelled) return
      const qr = new Html5Qrcode(SCAN_REGION_ID)
      scannerRef.current = qr

      qr.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        (decodedText) => {
          if (!cancelled) handleDecoded(decodedText)
        },
        () => {
          /* fires continuously while no code is in frame — not an error, deliberately ignored */
        }
      ).catch(() => {
        if (!cancelled) setCameraError('Camera unavailable — allow camera access, or use manual search below')
      })
    })

    return () => {
      cancelled = true
      const current = scannerRef.current
      scannerRef.current = null
      if (current) {
        current
          .stop()
          .then(() => current.clear())
          .catch(() => {})
      }
    }
  }, [manualMode, handleDecoded])

  function handleManualConfirm(token) {
    setManualMode(false)
    handleDecoded(token)
  }

  return (
    <div className="scanner-screen">
      <header className="scanner-header">
        <div>
          <p className="eyebrow">Scanning for</p>
          <h2>{session.checkpointLabel}</h2>
        </div>
        <div className="header-actions">
          <span className="session-count">{sessionCount} scanned</span>
          <button type="button" className="link-button" onClick={onSwitchCheckpoint}>
            Switch counter
          </button>
        </div>
      </header>

      {!manualMode && (
        <div className="camera-wrap">
          <div id={SCAN_REGION_ID} className="camera-region" />
          <div className="scan-reticle" aria-hidden="true" />
          {cameraError && <p className="camera-error">{cameraError}</p>}
          {!cameraError && <p className="scan-hint">Point at the participant's QR code</p>}
        </div>
      )}

      {manualMode && <ManualSearch onConfirm={handleManualConfirm} onCancel={() => setManualMode(false)} />}

      {!manualMode && (
        <button type="button" className="manual-toggle" onClick={() => setManualMode(true)}>
          Can't scan? Search by name
        </button>
      )}

      {result && <ResultOverlay result={result} onDismiss={handleDismissResult} />}
    </div>
  )
}
