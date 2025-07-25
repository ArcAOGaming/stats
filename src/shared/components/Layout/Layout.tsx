import { ReactNode } from 'react'
import Navbar from '../Navbar'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <Navbar />
      <main className="layout-content">
        {children}
      </main>
    </div>
  )
}
