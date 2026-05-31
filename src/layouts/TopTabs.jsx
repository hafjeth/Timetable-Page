import { useState } from 'react'

const TABS = [
  { key: 'tong-quan',    label: 'Tổng quan',          icon: <GridIcon /> },
  { key: 'chuc-nang',    label: 'Chức năng',          icon: <SettingsIcon /> },
  { key: 'quan-ly-diem', label: 'Quản lý điểm',       icon: <FileIcon /> },
  { key: 'hoat-dong',    label: 'Hoạt động hàng ngày', icon: <ClockIcon /> },
  { key: 'thong-ke',     label: 'Thống kê số liệu',   icon: <BarIcon /> },
]

export default function TopTabs({ activeTab = 'chuc-nang', onChange }) {
  return (
    <div style={{
      background: 'var(--color-white)',
      borderBottom: '1px solid var(--color-border)',
      paddingLeft: 16,
      height: 'var(--topbar-height)',
      display: 'flex', alignItems: 'flex-end'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: '100%' }}>
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => onChange?.(tab.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              height: '100%', padding: '0 16px',
              fontSize: 13, color: activeTab === tab.key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
              fontWeight: activeTab === tab.key ? 700 : 500,
              background: 'none', border: 'none',
              borderBottom: activeTab === tab.key ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { if (activeTab !== tab.key) e.currentTarget.style.color = 'var(--color-text)' }}
            onMouseLeave={e => { if (activeTab !== tab.key) e.currentTarget.style.color = 'var(--color-text-secondary)' }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Icons inline ──────────────────────────────────────────────────
function GridIcon() { return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.4"/></svg>) }
function SettingsIcon() { return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.4"/><path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.636 2.636l1.06 1.06M10.304 10.304l1.06 1.06M2.636 11.364l1.06-1.06M10.304 3.696l1.06-1.06" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>) }
function FileIcon() { return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 1h5.5L11 3.5V13H3V1z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M8 1v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M5 6h4M5 8.5h4M5 11h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>) }
function ClockIcon() { return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>) }
function BarIcon() { return (<svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="7" width="3" height="6" rx="0.5" fill="currentColor"/><rect x="5.5" y="4" width="3" height="9" rx="0.5" fill="currentColor"/><rect x="10" y="1" width="3" height="12" rx="0.5" fill="currentColor"/></svg>) }