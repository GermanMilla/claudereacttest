import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PersistAuth from './components/PersistAuth'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Home from './components/Home/Home'

function App() {
  const { user } = useSelector((state) => state.auth)

  return (
    
    <BrowserRouter>
      <PersistAuth />
      <Routes>
        <Route
          path="/"
          element={
              user
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
