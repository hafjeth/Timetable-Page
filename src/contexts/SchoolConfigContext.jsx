import { createContext, useContext, useState } from 'react'

const SchoolConfigContext = createContext(null)

export function SchoolConfigProvider({ children }) {
  const [capHoc, setCapHoc] = useState('tieu-hoc')
  const [namHoc, setNamHoc] = useState('2025-2026')
  const [hocKy, setHocKy] = useState('hk2')

  return (
    <SchoolConfigContext.Provider value={{
      capHoc, setCapHoc,
      namHoc, setNamHoc,
      hocKy, setHocKy,
    }}>
      {children}
    </SchoolConfigContext.Provider>
  )
}

export function useSchoolConfig() {
  const ctx = useContext(SchoolConfigContext)
  if (!ctx) throw new Error('useSchoolConfig must be used inside SchoolConfigProvider')
  return ctx
}