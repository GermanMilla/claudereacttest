import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  AlternateEmail,
  BusinessCenter,
  LocationOn,
  OpenInNew,
  Public,
  WorkspacePremium
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
  Typography
} from '@mui/material'
import { listenToDocument } from '../../firebase/firestoreService'
import { setProfile, clearProfile, profileError } from '../../store/profileSlice'
import { svGradients, svPalette } from '../../styles/designTokens'

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
        const publicProfile = data?.public || {}

        if (Object.keys(publicProfile).length > 0) {
          dispatch(setProfile(publicProfile))
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
      <Stack spacing={2.25}>
        {asArray(items).map((item, index) => (
          <Box
            key={`${item.title || item.role || item.name || index}-${index}`}
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: index % 2 === 0 ? '#f6fbfc' : '#fff7de',
              border: '1px solid rgba(21, 88, 214, 0.1)'
            }}
          >
            <Typography variant="subtitle1" fontWeight={900} color={svPalette.ink}>
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

  const name = profileData?.name || 'Freelancer SV'
  const initials = name.charAt(0).toUpperCase()
  const profilePhotoURL = profileData?.photoURL || ''
  const skills = asArray(profileData?.skills)

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 64px)',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background: svGradients.mangoGlow
      }}
    >
      {profileData ? (
        <Box sx={{ width: '100%', maxWidth: 1160, mx: 'auto' }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
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
                      src={profilePhotoURL}
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
                        Public freelancer profile
                      </Typography>
                      <Chip
                        label="Competency-based"
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
                      {profileData.title || 'Independent professional'}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <LocationOn fontSize="small" />
                        <Typography variant="body2">{profileData.location || 'El Salvador'}</Typography>
                      </Stack>
                      {profileData.email && (
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <AlternateEmail fontSize="small" />
                          <Typography variant="body2">{profileData.email}</Typography>
                        </Stack>
                      )}
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
                      Client-ready pitch
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1, color: svPalette.mutedInk, whiteSpace: 'pre-line' }}>
                      {profileData.summary ||
                        'This professional is still writing their profile summary. Check back soon for their pitch, competencies, and portfolio proof.'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <BusinessCenter sx={{ color: svPalette.flagBlue }} />
                      <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue}>
                        Experience
                      </Typography>
                    </Stack>
                    {renderItems(
                      profileData.experience,
                      'Experience entries have not been added yet.'
                    )}
                  </Box>

                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                      <WorkspacePremium sx={{ color: svPalette.mangoGreen }} />
                      <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue}>
                        Portfolio projects
                      </Typography>
                    </Stack>
                    {renderItems(profileData.projects, 'Portfolio projects have not been added yet.')}
                  </Box>

                  <Box>
                    <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
                      Training and education
                    </Typography>
                    {renderItems(profileData.education, 'Education or certifications have not been added yet.')}
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
                    <Typography variant="subtitle1" fontWeight={950} color={svPalette.deepBlue}>
                      Competencies
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
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
                        emptyBlock('No competencies listed yet.')
                      )}
                    </Stack>
                  </Paper>

                  <Paper elevation={0} sx={sectionCardSx}>
                    <Typography variant="subtitle1" fontWeight={950} color={svPalette.deepBlue}>
                      Contact
                    </Typography>
                    <Stack spacing={1} sx={{ mt: 1.5 }}>
                      <Typography variant="body2">{profileData.email || 'Email not set'}</Typography>
                      {profileData.phone && <Typography variant="body2">{profileData.phone}</Typography>}
                      {profileData.website && (
                        <Link href={profileData.website} target="_blank" rel="noopener" underline="hover">
                          <Public fontSize="inherit" sx={{ mr: 0.5, verticalAlign: 'text-bottom' }} />
                          Website
                        </Link>
                      )}
                      {profileData.social?.linkedin && (
                        <Link href={profileData.social.linkedin} target="_blank" rel="noopener">
                          LinkedIn
                        </Link>
                      )}
                      {profileData.social?.github && (
                        <Link href={profileData.social.github} target="_blank" rel="noopener">
                          GitHub
                        </Link>
                      )}
                      {profileData.social?.portfolio && (
                        <Link href={profileData.social.portfolio} target="_blank" rel="noopener">
                          Portfolio
                        </Link>
                      )}
                    </Stack>
                  </Paper>

                  {profileData.resumeURL && (
                    <Button
                      variant="contained"
                      href={profileData.resumeURL}
                      target="_blank"
                      rel="noopener"
                      endIcon={<OpenInNew />}
                      sx={{
                        bgcolor: svPalette.mangoGreen,
                        textTransform: 'none',
                        fontWeight: 900,
                        borderRadius: 2,
                        py: 1.2,
                        '&:hover': { bgcolor: '#3f551b' }
                      }}
                    >
                      View CV
                    </Button>
                  )}
                </Stack>
              </Box>
            </Box>
          </Paper>
        </Box>
      ) : profileLoaded ? (
        <Paper
          elevation={0}
          sx={{
            maxWidth: 680,
            mx: 'auto',
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            border: '1px solid rgba(217, 74, 50, 0.24)',
            bgcolor: 'white'
          }}
        >
          <Typography variant="h5" fontWeight={950} color={svPalette.deepBlue} sx={{ mb: 1 }}>
            Profile not found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please verify the UID and try again. Public profiles can be viewed without signing in.
          </Typography>
        </Paper>
      ) : (
        <Typography variant="body1" color="text.secondary" textAlign="center">
          Loading profile...
        </Typography>
      )}
    </Box>
  )
}

export default Profile
