import { ReactNode } from 'react'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <main className="layout-content">
        {children}
      </main>
    </div>
  )
}
