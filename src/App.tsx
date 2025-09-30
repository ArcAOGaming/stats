import { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout, Analytics, Loading, PasswordProtection } from './shared/components'
import { createRoute } from './utils/routing'
import { RuneRealmProvider } from './context/RuneRealmContext'
import Home from './pages/Home/Home'

// Create routes with automatic eager loading
const FLPYield = createRoute(() => import('./pages/FLPYield/FLPYield'))
const Game = createRoute(() => import('./pages/Game/Game'))
const RANDAO = createRoute(() => import('./pages/RANDAO/RANDAO'))
const PI = createRoute(() => import('./pages/PI/PI'))
const RuneRealm = createRoute(() => import('./pages/RuneRealm/RuneRealm'))
const UserSearch = createRoute(() => import('./pages/UserSearch/UserSearch'))

function App() {
  return (
    <BrowserRouter>
      <PasswordProtection>
        <Analytics>
          <RuneRealmProvider>
            <Layout>
              <Suspense fallback={<Loading />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/flp-yield" element={<FLPYield />} />
                  <Route path="/game" element={<Game />} />
                  <Route path="/randao" element={<RANDAO />} />
                  <Route path="/pi" element={<PI />} />
                  <Route path="/rune-realm" element={<RuneRealm />} />
                  <Route path="/user-search" element={<UserSearch />} />
                </Routes>
              </Suspense>
            </Layout>
          </RuneRealmProvider>
        </Analytics>
      </PasswordProtection>
    </BrowserRouter>
  )
}

export default App
