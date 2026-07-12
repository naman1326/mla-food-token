import { useState } from 'react'
import logo from '../assets/logo.png'

const CREDENTIALS = {
  entry: 'entry123',
  plate: 'plate123',
  drink: 'drink123',
  chaat: 'chaat123',
  sweet: 'sweet123'
}

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const lowerUser = username.trim().toLowerCase()
    if (CREDENTIALS[lowerUser] && CREDENTIALS[lowerUser] === password) {
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
