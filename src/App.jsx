import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login.jsx'
import CheckpointSetup from './components/CheckpointSetup.jsx'
import ScannerScreen from './components/ScannerScreen.jsx'
import { configError } from './supabaseClient.js'

const SESSION_STORAGE_KEY = 'foodpass_checkpoint_session'
const AUTH_STORAGE_KEY = 'foodpass_logged_in'

const CHECKPOINT_MAPPING = {
  entry: 'ENTRY',
  plate: 'PLATE',
  drink: 'DRINK',
  chaat: 'CHAAT',
  sweet: 'SWEET'
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null)
  const [session, setSession] = useState(null) // { checkpointCode, checkpointLabel, deviceLabel }
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const authedUser = sessionStorage.getItem(AUTH_STORAGE_KEY)
    if (authedUser && CHECKPOINT_MAPPING[authedUser]) {
      setIsLoggedIn(authedUser)

      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          if (
            parsed.checkpointCode?.trim().toUpperCase() === CHECKPOINT_MAPPING[authedUser]?.trim().toUpperCase() &&
            parsed.deviceLabel?.trim()
          ) {
            setSession(parsed)
          } else {
            sessionStorage.removeItem(SESSION_STORAGE_KEY)
            setSession(null)
          }
        } catch {
          // corrupt value — ignore and fall through to setup
        }
      }
    } else {
      setIsLoggedIn(null)
    }
    setReady(true)
  }, [])

  const handleLoginSuccess = useCallback((username) => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, username)
    setIsLoggedIn(username)
  }, [])

  const chooseCheckpoint = useCallback((checkpointCode, checkpointLabel, deviceLabel) => {
    const next = { checkpointCode, checkpointLabel, deviceLabel }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const switchCheckpoint = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    sessionStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
    setIsLoggedIn(null)
  }, [])

  if (configError) {
    return (
      <div className="fatal-screen">
        <p className="eyebrow">Setup needed</p>
        <h1 className="fatal-headline">{configError}</h1>
      </div>
    )
  }

  if (!ready) return null

  if (!isLoggedIn) {
    return <Login onLoginSuccess={handleLoginSuccess} />
  }

  return session ? (
    <ScannerScreen session={session} onSwitchCheckpoint={switchCheckpoint} />
  ) : (
    <CheckpointSetup username={isLoggedIn} onChoose={chooseCheckpoint} onLogout={switchCheckpoint} />
  )
}

