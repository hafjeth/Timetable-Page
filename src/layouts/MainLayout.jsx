import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import TopTabs from './TopTabs'

export default function MainLayout() {
  const [activeTab, setActiveTab] = useState('chuc-nang')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Navbar />
      <TopTabs activeTab={activeTab} onChange={setActiveTab} />
      <main style={{
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Outlet />
      </main>
    </div>
  )
}