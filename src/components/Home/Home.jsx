import { useEffect, useState } from 'react'
import { listenToDocument, setDocument } from '../../firebase/firestoreService'
import { useSelector, useDispatch } from 'react-redux'
import { setProfile, clearProfile, profileError } from '../../store/profileSlice'
import {
  Typography,
  Box,
  Paper,
  Avatar,
  Divider,
  Chip,
  Stack,
  TextField,
  Button,
  Grid,
  Link
} from '@mui/material'

function Home() {
  const { user } = useSelector((state) => state.auth)
  const userData = useSelector((state) => state.profile.profile)

  const [profileMissing, setProfileMissing] = useState(false)
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const dispatch = useDispatch()

  useEffect(() => {
    if (!user?.uid) {
      dispatch(clearProfile())
      return
    }

    const unsubscribe = listenToDocument(
      'Users',
      user.uid,
      (data) => {
        if (data) {
          dispatch(setProfile(data))
          setProfileMissing(false)
        } else {
          dispatch(clearProfile())
          setProfileMissing(true)
        }
      },
      (error) => {
        console.error('Error fetching user data:', error)
        dispatch(profileError(error.message))
      }
    )

    return () => unsubscribe()
  }, [user, dispatch])

  const saveProfileField = async () => {
    if (!newFieldKey.trim()) {
      setStatusMessage('Please enter a profile key.')
      return
    }

    setSaving(true)
    setStatusMessage('')

    try {
      await setDocument('Users', user.uid, {
        [newFieldKey.trim()]: newFieldValue
      })
      setStatusMessage('Profile field saved successfully.')
      setNewFieldKey('')
      setNewFieldValue('')
    } catch (error) {
      console.error('Error saving profile field:', error)
      setStatusMessage('Could not save profile field. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const asArray = (value) => (Array.isArray(value) ? value : [])

  const renderItems = (items) =>
    asArray(items).map((item, index) => (
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

  return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 1100, p: { xs: 3, md: 4 }, borderRadius: 4 }}>
        {userData ? (
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                  <Avatar
                    src={user?.photoURL || userData.photoURL || ''}
                    alt={user?.displayName || userData.name || 'User'}
                    sx={{ width: 100, height: 100, fontSize: 40, bgcolor: '#286730' }}
                  >
                    {(user?.displayName || userData.name || 'User').charAt(0).toUpperCase()}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {user?.displayName || userData.name || 'Your Name'}
                    </Typography>
                    <Typography variant="subtitle1" color="text.secondary">
                      {userData.title || 'Full Stack Developer'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {userData.location || 'Location not set'}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Summary
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                  {userData.summary || 'Add a professional summary in Firestore to make your homepage look like a portfolio.'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Experience
                </Typography>
                {asArray(userData.experience).length > 0 ? (
                  renderItems(userData.experience)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add work experience entries in Firestore to show them here.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Education
                </Typography>
                {asArray(userData.education).length > 0 ? (
                  renderItems(userData.education)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add education entries in Firestore to show them here.
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 4 }} />

              <Box>
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  Projects
                </Typography>
                {asArray(userData.projects).length > 0 ? (
                  renderItems(userData.projects)
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Add project entries in Firestore to show them here.
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                  Profile overview
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Email
                  </Typography>
                  <Typography variant="body1">{user?.email || userData.email || 'Not set'}</Typography>
                </Box>

                {userData.phone && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Phone
                    </Typography>
                    <Typography variant="body1">{userData.phone}</Typography>
                  </Box>
                )}

                {userData.website && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Website
                    </Typography>
                    <Link href={userData.website} target="_blank" rel="noopener" underline="hover">
                      {userData.website}
                    </Link>
                  </Box>
                )}

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Skills
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={1}>
                  {asArray(userData.skills).length > 0 ? (
                    asArray(userData.skills).map((skill) => <Chip key={skill} label={skill} size="small" />)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Add skills in Firestore.
                    </Typography>
                  )}
                </Stack>

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                  Links
                </Typography>
                {userData.social?.linkedin && (
                  <Link href={userData.social.linkedin} target="_blank" rel="noopener" display="block" sx={{ mb: 0.75 }}>
                    LinkedIn
                  </Link>
                )}
                {userData.social?.github && (
                  <Link href={userData.social.github} target="_blank" rel="noopener" display="block" sx={{ mb: 0.75 }}>
                    GitHub
                  </Link>
                )}
                {userData.social?.portfolio && (
                  <Link href={userData.social.portfolio} target="_blank" rel="noopener" display="block">
                    Portfolio
                  </Link>
                )}

                {userData.resumeURL && (
                  <Button
                    variant="contained"
                    color="primary"
                    href={userData.resumeURL}
                    target="_blank"
                    rel="noopener"
                    fullWidth
                    sx={{ mt: 3 }}
                  >
                    Download CV
                  </Button>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, mt: 1 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  Quick profile update
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add a new field to your Firestore profile without changing code. Use array fields for `skills`, `experience`, `education`, or `projects`.
                </Typography>
                <Stack spacing={2}>
                  <TextField
                    label="Profile field key"
                    value={newFieldKey}
                    onChange={(event) => setNewFieldKey(event.target.value)}
                    fullWidth
                  />
                  <TextField
                    label="Profile field value"
                    value={newFieldValue}
                    onChange={(event) => setNewFieldValue(event.target.value)}
                    fullWidth
                  />
                  {statusMessage && (
                    <Typography variant="body2" color={statusMessage.includes('successfully') ? 'success.main' : 'error'}>
                      {statusMessage}
                    </Typography>
                  )}
                  <Button variant="contained" onClick={saveProfileField} disabled={saving}>
                    {saving ? 'Saving…' : 'Save profile field'}
                  </Button>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        ) : profileMissing ? (
          <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              No profile found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We didn't find a profile for your account. Add a profile field below to create your portfolio.
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Profile field key"
                value={newFieldKey}
                onChange={(event) => setNewFieldKey(event.target.value)}
                fullWidth
              />
              <TextField
                label="Profile field value"
                value={newFieldValue}
                onChange={(event) => setNewFieldValue(event.target.value)}
                fullWidth
              />
              {statusMessage && (
                <Typography variant="body2" color={statusMessage.includes('successfully') ? 'success.main' : 'error'}>
                  {statusMessage}
                </Typography>
              )}
              <Button variant="contained" onClick={saveProfileField} disabled={saving}>
                {saving ? 'Saving…' : 'Create profile field'}
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Typography variant="body1" color="text.secondary">
            Loading home profile...
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default Home