import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import TimetablePage from '../features/timetable/pages/TimetablePage'

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/chuc-nang/tkb" replace />} />
        <Route path="chuc-nang/tkb" element={<TimetablePage />} />
      </Route>
    </Routes>
  )
}