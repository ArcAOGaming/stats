import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout, Analytics, Loading, PasswordProtection } from './shared/components'
import { createRoute } from './utils/routing'
import Home from './pages/Home/Home'

// Create routes with automatic eager loading
const FLPYield = createRoute(() => import('./pages/FLPYield/FLPYield'))
const Game = createRoute(() => import('./pages/Game/Game'))

function App() {
  return (
    <BrowserRouter>
      <PasswordProtection>
        <Analytics>
          <Layout>
            <Suspense fallback={<Loading />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/flp-yield" element={<FLPYield />} />
                <Route path="/game" element={<Game />} />
              </Routes>
            </Suspense>
          </Layout>
        </Analytics>
      </PasswordProtection>
    </BrowserRouter>
  )
}

export default App
