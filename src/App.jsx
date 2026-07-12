import { useState, useEffect, useCallback } from 'react'
import Login from './components/Login.jsx'
import CheckpointSetup from './components/CheckpointSetup.jsx'
import ScannerScreen from './components/ScannerScreen.jsx'
import { configError } from './supabaseClient.js'

const SESSION_STORAGE_KEY = 'foodpass_checkpoint_session'
const AUTH_STORAGE_KEY = 'foodpass_logged_in'

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [session, setSession] = useState(null) // { checkpointCode, checkpointLabel, deviceLabel }
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const authed = sessionStorage.getItem(AUTH_STORAGE_KEY) === 'true'
    setIsLoggedIn(authed)

    const saved = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (saved) {
      try {
        setSession(JSON.parse(saved))
      } catch {
        // corrupt value — ignore and fall through to setup
      }
    }
    setReady(true)
  }, [])

  const handleLoginSuccess = useCallback(() => {
    sessionStorage.setItem(AUTH_STORAGE_KEY, 'true')
    setIsLoggedIn(true)
  }, [])

  const chooseCheckpoint = useCallback((checkpointCode, checkpointLabel, deviceLabel) => {
    const next = { checkpointCode, checkpointLabel, deviceLabel }
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(next))
    setSession(next)
  }, [])

  const switchCheckpoint = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY)
    setSession(null)
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
    <CheckpointSetup onChoose={chooseCheckpoint} />
  )
}

