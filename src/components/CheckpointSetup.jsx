import { useState, useEffect } from 'react'
import { fetchCheckpoints } from '../supabaseClient.js'

export default function CheckpointSetup({ onChoose }) {
  const [checkpoints, setCheckpoints] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deviceLabel, setDeviceLabel] = useState('')

  useEffect(() => {
    fetchCheckpoints()
      .then(setCheckpoints)
      .catch(() => setError('Could not load counters — check your connection and reload'))
  }, [])

  function confirm() {
    if (!selected) return
    onChoose(selected.code, selected.label, deviceLabel.trim() || null)
  }

  return (
    <div className="setup-screen">
      <p className="eyebrow">Food Pass — Volunteer Scanner</p>
      <h1>Which counter is this?</h1>

      {error && <p className="setup-error">{error}</p>}
      {!checkpoints && !error && <p className="setup-loading">Loading counters…</p>}

      {checkpoints && (
        <div className="checkpoint-grid">
          {checkpoints.map((cp) => (
            <button
              key={cp.code}
              type="button"
              className={`checkpoint-card ${selected?.code === cp.code ? 'is-selected' : ''}`}
              onClick={() => setSelected(cp)}
            >
              {cp.label}
            </button>
          ))}
        </div>
      )}

      <label className="device-label-input">
        Label this device (optional)
        <input
          type="text"
          placeholder="e.g. Backup 1"
          value={deviceLabel}
          onChange={(e) => setDeviceLabel(e.target.value)}
          maxLength={30}
        />
      </label>

      <button type="button" className="primary-button" disabled={!selected} onClick={confirm}>
        Start scanning
      </button>
    </div>
  )
}
