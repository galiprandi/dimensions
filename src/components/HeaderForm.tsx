type Props = {
  interviewId: string
  isLoading: boolean
  canCopy: boolean
  copyStatus: string
  onChangeInterviewId: (value: string) => void
  onFetch: () => void
  onCopy: () => void
}

export function HeaderForm(props: Props) {
  const {
    interviewId,
    isLoading,
    canCopy,
    copyStatus,
    onChangeInterviewId,
    onFetch,
    onCopy,
  } = props

  return (
    <div className="header">
      <div className="field fieldSmall">
        <label htmlFor="interviewId">Interview ID</label>
        <input
          id="interviewId"
          className="input"
          placeholder="4f629281-5a3b-4572-ae66-cd800baa6b3f"
          value={interviewId}
          onChange={(e) => onChangeInterviewId(e.target.value)}
        />
      </div>

      <button type="button" className="button" onClick={onFetch} disabled={isLoading}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M21 12a9 9 0 1 1-2.64-6.36"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path d="M21 3v6h-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        {isLoading ? 'Buscando...' : 'GET'}
      </button>

      <button type="button" className="button secondary" onClick={onCopy} disabled={!canCopy}>
        <svg className="icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M9 9h10v12H9V9Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        Copy
      </button>

      <div className="copyStatus">{copyStatus}</div>
    </div>
  )
}
