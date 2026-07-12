import { useState, useEffect } from 'react'
import { fetchCheckpoints } from '../supabaseClient.js'
import logo from '../assets/logo.png'

const CHECKPOINT_MAPPING = {
  entry: 'ENTRY',
  plate: 'PLATE',
  drink: 'DRINK',
  chaat: 'CHAAT',
  sweet: 'SWEET'
}

export default function CheckpointSetup({ username, onChoose, onLogout }) {
  const [checkpoints, setCheckpoints] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deviceLabel, setDeviceLabel] = useState('')

  useEffect(() => {
    console.log('CheckpointSetup: fetching checkpoints for username:', username)
    fetchCheckpoints()
      .then((data) => {
        console.log('Fetched checkpoints from DB:', data)
        const formatted = data.map(cp => {
          const uppercaseCode = cp.code?.trim().toUpperCase()
          if (uppercaseCode === 'CHAT' || uppercaseCode === 'CHAAT') {
            return { ...cp, label: 'Chaat' }
          }
          return cp
        })

        const allowedCode = CHECKPOINT_MAPPING[username]?.trim().toUpperCase()
        console.log('Allowed code matching username:', allowedCode)
        const filtered = formatted.filter(cp => cp.code?.trim().toUpperCase() === allowedCode)
        console.log('Filtered checkpoints:', filtered)

        setCheckpoints(filtered)
        if (filtered.length === 1) {
          setSelected(filtered[0])
        }
      })
      .catch((err) => {
        console.error('Error loading checkpoints:', err)
        setError('Could not load counters — check your connection and reload')
      })
  }, [username])

  function confirm() {
    if (!selected) return
    onChoose(selected.code, selected.label, deviceLabel.trim() || null)
  }

  return (
    <div className="setup-screen">
      <div className="brand-logo-container">
        <img src={logo} alt="Club Logo" className="brand-logo" />
      </div>
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

      {onLogout && (
        <button type="button" className="link-button logout-adjust" onClick={onLogout}>
          Back to login
        </button>
      )}
    </div>
  )
}
