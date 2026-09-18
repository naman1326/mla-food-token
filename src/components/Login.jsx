import { useState } from 'react'
import logo from '../assets/logo.png'
import { entryIcon, plateIcon, sweetIcon, drinkIcon } from '../counterIcons.js'

const CREDENTIALS = {
  entry: 'entry123',
  plate: 'plate123',
  sweet: 'sweet123',
  drink: 'drink123',
  modak: 'modak123',
  malpua: 'malpua123',
  malpoha: 'malpua123'
}

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    let lowerUser = username.trim().toLowerCase()
    if (lowerUser === 'malpoha') lowerUser = 'malpua'
    const expectedPassword = CREDENTIALS[lowerUser]
    if (expectedPassword && (password === expectedPassword || (lowerUser === 'malpua' && password === 'malpoha123'))) {
      onLoginSuccess(lowerUser)
    } else {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="brand-logo-container">
          <img src={logo} alt="Club Logo" className="brand-logo" />
        </div>
        <p className="eyebrow">Attendant Portal</p>
        <h1 className="login-title">Food Pass Scanner</h1>
        <p className="login-subtitle">Sign in to access volunteer scanning checkpoint tools.</p>
        <div className="login-counter-chips" aria-label="Available Counters">
          <div className="counter-chip">
            <img src={entryIcon} alt="" />
            <span>Entry</span>
          </div>
          <div className="counter-chip">
            <img src={plateIcon} alt="" />
            <span>Plate</span>
          </div>
          <div className="counter-chip">
            <img src={sweetIcon} alt="" />
            <span>Sweet</span>
          </div>
          <div className="counter-chip">
            <img src={drinkIcon} alt="" />
            <span>Drink</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="login-error-box">{error}</div>}

          <div className="input-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value)
                setError('')
              }}
              required
              autoFocus
              autoComplete="username"
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="primary-button login-button">
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
