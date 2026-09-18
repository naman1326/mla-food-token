import { useState, useEffect } from 'react'
import { fetchCheckpoints } from '../supabaseClient.js'
import logo from '../assets/logo.png'
import { getCounterIcon } from '../counterIcons.js'

const CHECKPOINT_MAPPING = {
  entry: 'ENTRY',
  plate: 'PLATE',
  sweet: 'SWEET',
  drink: 'DRINK',
  modak: 'MODAK',
  malpua: 'MALPUA',
  malpoha: 'MALPUA'
}

export default function CheckpointSetup({ username, onChoose, onLogout }) {
  const [checkpoints, setCheckpoints] = useState(null)
  const [error, setError] = useState(null)
  const [selected, setSelected] = useState(null)
  const [deviceLabel, setDeviceLabel] = useState(() => {
    return localStorage.getItem('foodpass_device_label') || ''
  })

  useEffect(() => {
    fetchCheckpoints()
      .then((data) => {
        const expectedCode = (CHECKPOINT_MAPPING[username] || username)?.trim().toUpperCase()

        // Filter strictly to the logged-in attendant's assigned counter
        const filtered = (data || [])
          .filter((cp) => {
            const code = cp.code?.trim().toUpperCase()
            if (expectedCode === 'MALPUA') {
              return code === 'MALPUA' || code === 'MALPOHA'
            }
            if (expectedCode === 'SWEET') {
              return code === 'SWEET' || code === 'MODAK' || code === 'MALPUA' || code === 'MALPOHA'
            }
            if (expectedCode === 'DRINK') {
              return code === 'DRINK' || code === 'BEVERAGE'
            }
            if (expectedCode === 'MODAK') {
              return code === 'MODAK' || code === 'SWEET'
            }
            return code === expectedCode
          })
          .map((cp) => {
            if (cp.code?.trim().toUpperCase() === 'MALPOHA') {
              return { ...cp, code: 'MALPUA', label: 'Malpua' }
            }
            return cp
          })

        if (filtered.length === 0) {
          setError(`No counter found for "${username}". Please ensure the database has counter code "${expectedCode}".`)
        } else {
          setCheckpoints(filtered)
          setSelected(filtered[0])
        }
      })
      .catch((err) => {
        console.error('Error loading checkpoints:', err)
        setError('Could not load counters — check your connection and reload')
      })
  }, [username])

  function confirm() {
    if (!selected || !deviceLabel.trim()) return
    const trimmedLabel = deviceLabel.trim()
    localStorage.setItem('foodpass_device_label', trimmedLabel)
    onChoose(selected.code, selected.label, trimmedLabel)
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
          {checkpoints.map((cp) => {
            const icon = getCounterIcon(cp.code || cp.label)
            return (
              <button
                key={cp.code}
                type="button"
                className={`checkpoint-card ${selected?.code === cp.code ? 'is-selected' : ''}`}
                onClick={() => setSelected(cp)}
              >
                {icon && <img src={icon} alt="" className="checkpoint-icon-emoji" />}
                <span className="checkpoint-label-text">{cp.label}</span>
              </button>
            )
          })}
        </div>
      )}

      <label className="device-label-input">
        Label this device
        <input
          type="text"
          placeholder="e.g. Backup 1 (required)"
          value={deviceLabel}
          onChange={(e) => setDeviceLabel(e.target.value)}
          maxLength={30}
          required
        />
      </label>

      <button
        type="button"
        className="primary-button"
        disabled={!selected || !deviceLabel.trim()}
        onClick={confirm}
      >
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
