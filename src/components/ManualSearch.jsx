import { useState, useEffect, useRef } from 'react'
import { searchParticipants } from '../supabaseClient.js'

export default function ManualSearch({ onConfirm, onCancel }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [picked, setPicked] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length < 2) {
      setResults([])
      return undefined
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await searchParticipants(query)
        setResults(data)
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  return (
    <div className="manual-search">
      <div className="manual-search-header">
        <h3>Search by name or reg. no.</h3>
        <button type="button" className="link-button" onClick={onCancel}>
          Back to camera
        </button>
      </div>

      <input
        type="text"
        autoFocus
        placeholder="Start typing…"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value)
          setPicked(null)
        }}
      />

      {loading && <p className="manual-hint">Searching…</p>}
      {!loading && query.trim().length >= 2 && results.length === 0 && (
        <p className="manual-hint">No matches</p>
      )}

      <ul className="manual-results">
        {results.map((p) => (
          <li key={p.token}>
            <button
              type="button"
              className={`manual-result-row ${picked?.token === p.token ? 'is-picked' : ''}`}
              onClick={() => setPicked(p)}
            >
              <span className="manual-result-name">{p.name}</span>
              <span className="manual-result-reg">{p.reg_no}</span>
            </button>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="primary-button"
        disabled={!picked}
        onClick={() => picked && onConfirm(picked.token)}
      >
        {picked ? `Confirm for ${picked.name}` : 'Pick someone above'}
      </button>
    </div>
  )
}
