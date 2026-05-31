import { SUBJECT_COLORS } from '../../../utils/colors'

export default function SubjectLegend() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '6px 16px',
      padding: '10px var(--spacing-md)',
      borderTop: '1px solid var(--color-border)',
      background: 'var(--color-white)',
    }}>
      {Object.entries(SUBJECT_COLORS).map(([name, color]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{
            width: 8, height: 8,
            borderRadius: '50%',
            background: color.dot,
            flexShrink: 0,
          }} />
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            {name}
          </span>
        </div>
      ))}
    </div>
  )
}