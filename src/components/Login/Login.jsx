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
      <section className="login-hero">
        <span className="login-pill">Freelance talent from El Salvador</span>
        <h1>Talento SV</h1>
        <p>
          Build a competency-first profile, show proof of work, and let clients view your
          public profile without an account.
        </p>
        <div className="login-highlights" aria-label="Platform highlights">
          <span>Skills</span>
          <span>Projects</span>
          <span>Local trust</span>
        </div>
      </section>
      <div className="login-card">
        <h2 className="login-title">Create your profile</h2>
        <p className="login-subtitle">Sign in to manage your Salvadoran freelance portfolio.</p>

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
