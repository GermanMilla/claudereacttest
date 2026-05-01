import { signOut } from 'firebase/auth'
import { auth } from '../../firebase/config'
import { logout } from '../../store/authSlice'
import { useSelector, useDispatch } from 'react-redux'
import heroImg from '../../assets/hero.png'
import reactLogo from '../../assets/react.svg'
import viteLogo from '../../assets/vite.svg'
import Navbar from '../Navbar/Navbar'

function Home() {
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()

    const handleLogout = async () => {
        await signOut(auth)
        dispatch(logout())
    }

    return (
    
    
    <>
        <Navbar user={user} />
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
    
    </>


)}

export default Home
