import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PersistAuth from './components/PersistAuth'
import Login from './components/Login/Login'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'
import Home from './components/Home/Home'
import Profile from './components/Profile/Profile'
import Navbar from './components/Navbar/Navbar'
import Blogs from './components/Blog/Blogs'

function App() {
  const { user, authReady } = useSelector((state) => state.auth)

  return (
    <BrowserRouter>
      <Navbar user={user} />
      <PersistAuth />
      {!authReady ? (
        <div className="app-loading"></div>
      ) : (
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/home" replace /> : <Navigate to="/login" replace />
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
          path="/profile/:uid"
          element={
              <Profile />
          }
        />
        <Route
          path="/blogs"
          element={
              <Blogs />
          }
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/home" replace /> : <Login />}
        />
      </Routes>
    )}
    </BrowserRouter>
  )
}

export default App
