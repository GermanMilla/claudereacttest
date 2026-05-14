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
  Stack,
  Grid,
  Chip,
  Link,
  Button
} from '@mui/material'

function Profile() {
  const { uid } = useParams()
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

  const asArray = (value) => (Array.isArray(value) ? value : [])

  const renderItems = (items) => {
    return asArray(items).map((item, index) => (
      <Box key={index} sx={{ mb: 2 }}>
        <Typography variant="subtitle1" fontWeight={600}>
          {item.title || item.role || item.school || item.name || 'Untitled'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
          {item.company || item.location || item.date || item.year || ''}
        </Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {item.details || item.description || item.summary || ''}
        </Typography>
      </Box>
    ))
  }

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper
        elevation={3}
        sx={{ width: '100%', maxWidth: 1100, p: { xs: 3, md: 4 }, borderRadius: 4 }}
      >
        {profileData ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Avatar
                  src={profileData.photoURL || ''}
                  alt={profileData.name || 'Profile'}
                  sx={{ width: 120, height: 120, mx: 'auto', mb: 2, fontSize: 48, bgcolor: '#286730' }}
                >
                  {profileData.name?.charAt(0) || 'U'}
                </Avatar>
                <Typography variant="h4" fontWeight="bold" gutterBottom>
                  {profileData.name || 'Your Name'}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                  {profileData.title || 'Full Stack Developer'}
                </Typography>
                {profileData.location && (
                  <Typography variant="body2" color="text.secondary">
                    {profileData.location}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Contact
                </Typography>
                <Typography variant="body2">{profileData.email || 'Email not set'}</Typography>
                {profileData.phone && <Typography variant="body2">{profileData.phone}</Typography>}
                {profileData.website && (
                  <Link href={profileData.website} target="_blank" rel="noopener" display="block">
                    {profileData.website}
                  </Link>
                )}
              </Box>

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {asArray(profileData.skills).length > 0 ? (
                    asArray(profileData.skills).map((skill) => (
                      <Chip key={skill} label={skill} size="small" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Add skills in Firestore to show them here.
                    </Typography>
                  )}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Links
                </Typography>
                {profileData.social?.linkedin && (
                  <Link
                    href={profileData.social.linkedin}
                    target="_blank"
                    rel="noopener"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    LinkedIn
                  </Link>
                )}
                {profileData.social?.github && (
                  <Link
                    href={profileData.social.github}
                    target="_blank"
                    rel="noopener"
                    display="block"
                    sx={{ mb: 1 }}
                  >
                    GitHub
                  </Link>
                )}
                {profileData.social?.portfolio && (
                  <Link
                    href={profileData.social.portfolio}
                    target="_blank"
                    rel="noopener"
                    display="block"
                  >
                    Portfolio
                  </Link>
                )}
              </Box>

              {profileData.resumeURL && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component="a"
                    href={profileData.resumeURL}
                    target="_blank"
                    rel="noopener"
                  >
                    Download CV
                  </Button>
                </Box>
              )}
            </Grid>

            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {profileData.summary ||
                    'Write a short professional summary that highlights your experience, technical strengths, and career goals.'}
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Experience
                </Typography>
                {asArray(profileData.experience).length > 0 ? (
                  renderItems(profileData.experience)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add work experience entries in Firestore to show them here.
                  </Typography>
                )}
              </Box>

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Education
                </Typography>
                {asArray(profileData.education).length > 0 ? (
                  renderItems(profileData.education)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add education entries in Firestore to show them here.
                  </Typography>
                )}
              </Box>

              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Projects
                </Typography>
                {asArray(profileData.projects).length > 0 ? (
                  renderItems(profileData.projects)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add portfolio projects in Firestore to show them here.
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
        ) : profileLoaded ? (
          <Typography variant="body1" color="error.main">
            Profile not found. Please verify the UID and try again.
          </Typography>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Loading profile...
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default Profile
