import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { signOut } from 'firebase/auth'
import { auth } from './firebase/config'
import { logout } from './store/authSlice'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import PersistAuth from './components/PersistAuth'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function Home() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()

  const handleLogout = async () => {
    await signOut(auth)
    dispatch(logout())
  }

  return (
    <section id="center">
      <div className="hero">
        <img src={heroImg} className="base" width="170" height="179" alt="" />
        <img src={reactLogo} className="framework" alt="React logo" />
        <img src={viteLogo} className="vite" alt="Vite logo" />
      </div>
      <div>
        <h1>Welcome, {user?.displayName || 'User'}!</h1>
        <h2 style={{ color: '#d97757' }}>You are logged in</h2>
        <button className="counter" onClick={handleLogout}>Sign Out</button>
      </div>
    </section>
  )
}

function App() {
  const { user, loading } = useSelector((state) => state.auth)

  return (
    <BrowserRouter>
      <PersistAuth />
      <Routes>
        <Route
          path="/"
          element={
            loading
              ? <div className="loading">Loading...</div>
              : user
                ? <Navigate to="/home" replace />
                : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
