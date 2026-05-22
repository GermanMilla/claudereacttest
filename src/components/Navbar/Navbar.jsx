import * as React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Logout,
  Menu as MenuIcon,
  Work
} from '@mui/icons-material'
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material'
import { listenToDocument } from '../../firebase/firestoreService'
import { useLogout } from '../../hooks/useLogout'
import { svPalette } from '../../styles/designTokens'

function Navbar({ user }) {
  const [anchorElNav, setAnchorElNav] = React.useState(null)
  const [anchorElUser, setAnchorElUser] = React.useState(null)
  const [navbarProfile, setNavbarProfile] = React.useState({ uid: null, data: null })
  const navigate = useNavigate()
  const handleLogout = useLogout()

  React.useEffect(() => {
    if (!user?.uid) {
      return undefined
    }

    return listenToDocument(
      'Users',
      user.uid,
      (data) => setNavbarProfile({ uid: user.uid, data }),
      (error) => {
        console.error('Error fetching navbar profile:', error)
        setNavbarProfile({ uid: user.uid, data: null })
      }
    )
  }, [user?.uid])

  const pages = user
    ? [
        { label: 'My profile', action: () => navigate('/home') },
        { label: 'Public preview', action: () => navigate(`/profile/${user.uid}`) },
        { label: 'Blog', action: () => navigate('/blogs') }
      ]
    : []

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget)
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget)
  const handleCloseNavMenu = () => setAnchorElNav(null)
  const handleCloseUserMenu = () => setAnchorElUser(null)

  const runNavAction = (action) => {
    action()
    handleCloseNavMenu()
  }

  const profileData = navbarProfile.uid === user?.uid ? navbarProfile.data?.public : null
  const profilePhotoURL = profileData?.photoURL || ''
  const profileName = profileData?.name || user?.displayName || 'User'
  const profileInitial = profileName.charAt(0).toUpperCase()

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: svPalette.izalcoBlack,
        borderBottom: `4px solid ${svPalette.torogozTeal}`
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: '64px !important', gap: 2 }}>
          <Box
            component="button"
            onClick={() => navigate(user ? '/home' : '/login')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              border: 0,
              bgcolor: 'transparent',
              color: 'inherit',
              cursor: 'pointer',
              p: 0,
              minWidth: 0
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                bgcolor: svPalette.torogozTeal,
                color: 'white',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <Work fontSize="small" />
            </Box>
              
          </Box>

          {user && (
            <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
              <IconButton
                size="large"
                aria-label="open navigation menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: 'block', md: 'none' } }}
              >
                {pages.map((page) => (
                  <MenuItem key={page.label} onClick={() => runNavAction(page.action)}>
                    <Typography>{page.label}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1, ml: 2 }}>
            {pages.map((page) => (
              <Button
                key={page.label}
                onClick={page.action}
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' }
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: user ? 0 : 1 }} />

          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Tooltip title="Account menu">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={profileName}
                    src={profilePhotoURL}
                    sx={{
                      border: '2px solid rgba(255,255,255,0.75)',
                      bgcolor: svPalette.pupusaCorn,
                      color: svPalette.deepBlue,
                      fontWeight: 900
                    }}
                  >
                    {profileInitial}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: '45px' }}
                id="menu-user"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                <MenuItem
                  onClick={() => {
                    handleCloseUserMenu()
                    handleLogout()
                  }}
                >
                  <Logout fontSize="small" sx={{ mr: 1 }} />
                  <Typography>Logout</Typography>
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  )
}

export default Navbar
