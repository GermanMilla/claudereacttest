import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { listenToDocument } from '../../firebase/firestoreService'
import { setProfile, clearProfile, profileError } from '../../store/profileSlice'
import {
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
  Stack
} from '@mui/material'

function Profile() {
  const { uid } = useParams()
  const { user } = useSelector((state) => state.auth)
  const profileData = useSelector((state) => state.profile.profile)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const dispatch = useDispatch()
  useEffect(() => {
    if (!uid) {
      dispatch(clearProfile())
      return
    }

    const unsubscribe = listenToDocument(
      'Users',
      uid,
      (data) => {
        if (data) {
          dispatch(setProfile(data))
        } else {
          dispatch(clearProfile())
        }
        setProfileLoaded(true)
      },
      (error) => {
        console.error('Error fetching profile data:', error)
        dispatch(profileError(error.message))
        dispatch(clearProfile())
        setProfileLoaded(true)
      }
    )

    return () => unsubscribe()
  }, [uid, dispatch])

  const formatValue = (value) => {
    if (value === null || value === undefined || value === '') {
      return 'Not provided'
    }

    if (typeof value === 'object') {
      return JSON.stringify(value)
    }

    return String(value)
  }

  return (
    <>
      <section id="center">
        <Paper
          elevation={3}
          sx={{ mt: 4, p: 3, width: '100%', maxWidth: 650, borderRadius: 4 }}
        >

          {profileData && (
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  src={profileData.photoURL || ''}
                  alt={profileData.name || 'User'}
                  sx={{ width: 80, height: 80, fontSize: 32, bgcolor: '#d97757' }}
                >
                  {profileData.name?.charAt(0) || 'U'}
                </Avatar>

                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {profileData.name || 'User Profile'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profileData.email || 'No email available'}
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>
                Profile Details
              </Typography>

              <Stack spacing={1.5}>
                {Object.entries(profileData).map(([key, value]) => (
                  <Box
                    key={key}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 2,
                      py: 1,
                      borderBottom: '1px solid',
                      borderColor: 'divider'
                    }}
                  >
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textTransform: 'capitalize', minWidth: 140 }}
                    >
                      {key}
                    </Typography>
                    <Typography
                      variant="body2"
                      fontWeight={500}
                      sx={{ textAlign: 'right', wordBreak: 'break-word' }}
                    >
                      {formatValue(value)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </>
          )}

          {profileLoaded && !profileData && (
            <Typography variant="body1" color="error.main">
              Profile not found. Please verify the UID and try again.
            </Typography>
          )}
        </Paper>
      </section>
    </>
  )
}

export default Profile
