import { BrowserRouter } from 'react-router-dom'
import { SchoolConfigProvider } from './contexts/SchoolConfigContext'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  return (
    <BrowserRouter>
      <SchoolConfigProvider>
        <AppRoutes />
      </SchoolConfigProvider>
    </BrowserRouter>
  )
}