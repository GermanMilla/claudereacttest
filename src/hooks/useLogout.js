import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'
import { logout } from '../store/authSlice'
import { useDispatch } from 'react-redux'

export function useLogout() {
    const dispatch = useDispatch()

    const handleLogout = async () => {
        await signOut(auth)
        dispatch(logout())
    }

    return handleLogout
}
