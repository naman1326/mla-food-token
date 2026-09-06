import { getCounterIcon } from '../counterIcons.js'

export default function ResultOverlay({ result, onDismiss }) {
  const icon = getCounterIcon(result.checkpointCode || result.detail)

  return (
    <div className={`result-overlay tone-${result.tone}`} role="status" aria-live="assertive">
      <div className="result-stamp">
        <p className="result-headline">{result.headline}</p>
        {result.reg_no && <p className="result-name">{result.reg_no}</p>}
        {result.detail && (
          <p className="result-detail">
            {icon && <img src={icon} alt="" className="result-detail-emoji" />}
            <span>{result.detail}</span>
          </p>
        )}
        <button type="button" className="overlay-dismiss-button" onClick={onDismiss}>
          OK
        </button>
      </div>
    </div>
  )
}

