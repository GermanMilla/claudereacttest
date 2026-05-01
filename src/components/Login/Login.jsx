import { useState } from 'react'
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { Google as GoogleIcon } from '@mui/icons-material'
import { auth } from '../../firebase/config'
import './Login.css'

function Login() {
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setError('')
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)

    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(err.message)
      }
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Welcome</h1>
        <p className="login-subtitle">Sign in to continue</p>

        {error && <p className="login-error">{error}</p>}

        <button className="login-button" onClick={handleGoogleLogin}>
          <GoogleIcon />
          Continue with Google
        </button>
      </div>
    </div>
  )
}

export default Login
