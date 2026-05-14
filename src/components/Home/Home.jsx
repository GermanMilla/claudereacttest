import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  AlternateEmail,
  CheckCircle,
  LocationOn,
  Public,
  Save,
  Work
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Link,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { listenToDocument, setDocument } from '../../firebase/firestoreService'
import { setProfile, clearProfile, profileError } from '../../store/profileSlice'
import { svGradients, svPalette } from '../../styles/designTokens'

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
  const name = user?.displayName || userData?.name || 'Freelancer SV'
  const initials = name.charAt(0).toUpperCase()
  const skills = asArray(userData?.skills)
  const experience = asArray(userData?.experience)
  const projects = asArray(userData?.projects)
  const education = asArray(userData?.education)
  const completedSections = [
    userData?.summary,
    skills.length,
    experience.length,
    projects.length,
    userData?.email || user?.email
  ].filter(Boolean).length

  const sectionCardSx = {
    p: 2.5,
    borderRadius: 2,
    border: '1px solid #e4ecf7',
    bgcolor: 'white'
  }

  const emptyBlock = (text) => (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: '#f7faf8',
        border: '1px dashed rgba(77, 102, 33, 0.28)'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  )

  const renderItems = (items, emptyText) =>
    asArray(items).length > 0 ? (
      <Stack spacing={2}>
        {asArray(items).map((item, index) => (
          <Box
            key={`${item.title || item.role || item.name || index}-${index}`}
            sx={{
              borderLeft: `4px solid ${index % 2 === 0 ? svPalette.flagBlue : svPalette.mangoGreen}`,
              pl: 2,
              py: 0.5
            }}
          >
            <Typography variant="subtitle1" fontWeight={800} color={svPalette.ink}>
              {item.title || item.role || item.school || item.name || 'Untitled'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              {[item.company, item.location, item.date || item.year].filter(Boolean).join(' | ')}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', color: svPalette.mutedInk }}>
              {item.details || item.description || item.summary || ''}
            </Typography>
          </Box>
        ))}
      </Stack>
    ) : (
      emptyBlock(emptyText)
    )

  const updatePanel = (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${svPalette.borderBlue}`,
        bgcolor: 'rgba(255, 255, 255, 0.88)'
      }}
    >
      <Typography variant="h6" fontWeight={900} color={svPalette.deepBlue}>
        Quick profile update
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 2 }}>
        Add one Firestore field while you keep shaping the prototype. Use keys like skills,
        title, summary, location, projects, or experience.
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
          multiline
          minRows={2}
        />
        {statusMessage && (
          <Typography
            variant="body2"
            color={statusMessage.includes('successfully') ? 'success.main' : 'error'}
          >
            {statusMessage}
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={saveProfileField}
          disabled={saving}
          sx={{
            alignSelf: { xs: 'stretch', sm: 'flex-start' },
            bgcolor: svPalette.flagBlue,
            textTransform: 'none',
            fontWeight: 800,
            borderRadius: 2,
            px: 3,
            '&:hover': { bgcolor: svPalette.deepBlue }
          }}
        >
          {saving ? 'Saving...' : 'Save profile field'}
        </Button>
      </Stack>
    </Paper>
  )

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 64px)',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background: svGradients.page
      }}
    >
      {userData ? (
        <Box sx={{ width: '100%', maxWidth: 1180, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              overflow: 'hidden',
              borderRadius: 3,
              border: `1px solid ${svPalette.borderBlue}`,
              bgcolor: 'white'
            }}
          >
            <Box
              sx={{
                p: { xs: 2, md: 4 },
                color: 'white',
                background: svGradients.flagHeader,
                position: 'relative'
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  inset: 'auto 24px 24px auto',
                  width: 180,
                  height: 180,
                  borderRadius: '50%',
                  border: '24px solid rgba(247, 226, 161, 0.24)'
                }}
              />
  
                <Grid container spacing={{ xs: 2.5, md: 3 }} alignItems="center">
                  <Grid item>
                    <Avatar
                      src={user?.photoURL || userData.photoURL || ''}
                      alt={name}
                      sx={{
                        width: { xs: 88, md: 112 },
                        height: { xs: 88, md: 112 },
                        fontSize: 44,
                        bgcolor: svPalette.pupusaCorn,
                        color: svPalette.deepBlue,
                        border: '4px solid rgba(255,255,255,0.92)'
                      }}
                    >
                      {initials}
                    </Avatar>
                  </Grid>
                  <Grid item xs={12} sm>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={950}>
                        Available for freelance work
                      </Typography>
                      <Chip
                        label="El Salvador talent"
                        size="small"
                        sx={{
                          height: 24,
                          bgcolor: 'rgba(255,255,255,0.2)',
                          color: 'white',
                          fontWeight: 900
                        }}
                      />
                    </Stack>
                    <Typography
                      variant="h2"
                      component="h1"
                      fontWeight={500}
                      sx={{ lineHeight: 1, letterSpacing: 0, textShadow: '0 1px 0 rgba(11,47,102,0.28)' }}
                    >
                      {name}
                    </Typography>
                    <Typography variant="h6" sx={{ opacity: 0.98, mt: 1.5, fontWeight: 500 }}>
                      {userData.title || 'Competency-based freelancer'}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">{userData.location || 'El Salvador'}</Typography>
                      </Stack>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <AlternateEmail fontSize="small" />
                        <Typography variant="body2">{user?.email || userData.email || 'Email pending'}</Typography>
                      </Stack>
                    </Stack>
                  </Grid>
                </Grid>

            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1fr) 320px' },
                alignItems: 'stretch'
              }}
            >
              <Box sx={{ p: { xs: 3, md: 4 }, pt: { md: 4.5 } }}>
                <Stack spacing={4}>
                  <Box>
                    <Typography
                      variant="overline"
                      fontWeight={500}
                      color={svPalette.ink}
                      sx={{ letterSpacing: 1.4 }}
                    >
                      Profile pitch
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: svPalette.mutedInk, whiteSpace: 'pre-line' }}>
                      {userData.summary ||
                        'Add a focused summary that explains what you solve, the competencies you bring, and the kind of clients you help.'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Work experience
                    </Typography>
                    {renderItems(
                      experience,
                      'Add experience entries to help clients understand your real-world practice.'
                    )}
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Projects
                    </Typography>
                    {renderItems(projects, 'Add portfolio projects that show outcomes, tools, and client value.')}
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Education
                    </Typography>
                    {renderItems(education, 'Add education, certifications, bootcamps, or local training.')}
                  </Box>
                </Stack>
              </Box>

              <Box
                sx={{
                  p: { xs: 3, md: 4 },
                  pt: { md: 4.5 },
                  bgcolor: '#f6fbfc',
                  borderTop: { xs: '1px solid rgba(21, 88, 214, 0.1)', md: 0 },
                  borderLeft: { md: '1px solid rgba(21, 88, 214, 0.12)' }
                }}
              >
                <Stack spacing={3}>
                  <Paper elevation={0} sx={sectionCardSx}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Profile strength
                        </Typography>
                        <Typography variant="h4" fontWeight={950} color={svPalette.deepBlue}>
                          {completedSections}/5
                        </Typography>
                      </Box>
                      <CheckCircle sx={{ color: svPalette.mangoGreen, fontSize: 38 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Keep it compact: the strongest profiles show a sharp pitch, skills, proof,
                      contact, and location.
                    </Typography>
                  </Paper>

                  <Paper elevation={0} sx={sectionCardSx}>
                    <Typography variant="subtitle1" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Competencies
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1}>
                      {skills.length > 0 ? (
                        skills.map((skill, index) => (
                          <Chip
                            key={skill}
                            label={skill}
                            sx={{
                              bgcolor:
                                index % 3 === 0 ? svPalette.pupusaCorn : index % 3 === 1 ? '#e6f5f8' : '#eef3e1',
                              color: svPalette.deepBlue,
                              fontWeight: 800,
                              borderRadius: 1.5
                            }}
                          />
                        ))
                      ) : (
                        emptyBlock('Add skills in Firestore.')
                      )}
                    </Stack>
                  </Paper>

                  <Paper elevation={0} sx={sectionCardSx}>
                    <Typography variant="subtitle1" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Contact and links
                    </Typography>
                    <Stack spacing={1}>
                      <Typography variant="body2">{user?.email || userData.email || 'Email not set'}</Typography>
                      {userData.phone && <Typography variant="body2">{userData.phone}</Typography>}
                      {userData.website && (
                        <Link href={userData.website} target="_blank" rel="noopener" underline="hover">
                          <Public fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                          Website
                        </Link>
                      )}
                      {userData.social?.linkedin && (
                        <Link href={userData.social.linkedin} target="_blank" rel="noopener">
                          LinkedIn
                        </Link>
                      )}
                      {userData.social?.github && (
                        <Link href={userData.social.github} target="_blank" rel="noopener">
                          GitHub
                        </Link>
                      )}
                      {userData.social?.portfolio && (
                        <Link href={userData.social.portfolio} target="_blank" rel="noopener">
                          Portfolio
                        </Link>
                      )}
                    </Stack>
                  </Paper>

                  {userData.resumeURL && (
                    <Button
                      variant="contained"
                      href={userData.resumeURL}
                      target="_blank"
                      rel="noopener"
                      startIcon={<Work />}
                      sx={{ bgcolor: svPalette.mangoGreen, textTransform: 'none', fontWeight: 900 }}
                    >
                      Download CV
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Paper>

          <Box sx={{ mt: 3 }}>{updatePanel}</Box>
        </Box>
      ) : profileMissing ? (
        <Box sx={{ maxWidth: 760, mx: 'auto' }}>
          <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, borderRadius: 3, border: '1px solid #dbe7f6' }}>
            <Typography variant="h4" fontWeight={950} color={svPalette.deepBlue} sx={{ mb: 1 }}>
              Start your freelancer profile
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Create the first field for your competency-based profile. Clients will be able to
              view public profiles without signing in.
            </Typography>
            {updatePanel}
          </Paper>
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Loading home profile...
        </Typography>
      )}
    </Box>
  )
}

export default Home
