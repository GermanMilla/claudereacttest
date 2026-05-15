import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  AlternateEmail,
  CheckCircle,
  LocationOn,
  Public,
  Save,
  Warning,
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
  Modal,
  Paper,
  Slider,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { listenToDocument, setDocument } from '../../firebase/firestoreService'
import { uploadProfilePicture } from '../../firebase/storageService'
import { setProfile, clearProfile, profileError } from '../../store/profileSlice'
import { svGradients, svPalette } from '../../styles/designTokens'

function Home() {
  const { user } = useSelector((state) => state.auth)
  const userData = useSelector((state) => state.profile.profile)

  const [profileMissing, setProfileMissing] = useState(false)
  const [newFieldKey, setNewFieldKey] = useState('')
  const [newFieldValue, setNewFieldValue] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [photoStatusMessage, setPhotoStatusMessage] = useState('')
  const [photoPreviewURL, setPhotoPreviewURL] = useState('')
  const [photoDimensions, setPhotoDimensions] = useState(null)
  const [cropZoom, setCropZoom] = useState(1)
  const [cropOffsetX, setCropOffsetX] = useState(0)
  const [cropOffsetY, setCropOffsetY] = useState(0)
  const [cropModalOpen, setCropModalOpen] = useState(false)
  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)

  const dispatch = useDispatch()
  const dragStartRef = useRef(null)
  const profilePictureSize = 512

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

  useEffect(() => () => {
    if (photoPreviewURL) {
      URL.revokeObjectURL(photoPreviewURL)
    }
  }, [photoPreviewURL])

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

  const closeCropModal = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    setCropModalOpen(false)
    setPhotoDimensions(null)
    setCropZoom(1)
    setCropOffsetX(0)
    setCropOffsetY(0)
    setIsDraggingPhoto(false)
    dragStartRef.current = null

    if (photoPreviewURL) {
      URL.revokeObjectURL(photoPreviewURL)
      setPhotoPreviewURL('')
    }
  }

  const loadImageDimensions = (src) =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight })
      image.onerror = reject
      image.src = src
    })

  const getCroppedProfilePicture = () =>
    new Promise((resolve, reject) => {
      const image = new Image()
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = profilePictureSize
        canvas.height = profilePictureSize

        const context = canvas.getContext('2d')
        const baseScale = Math.max(
          profilePictureSize / image.naturalWidth,
          profilePictureSize / image.naturalHeight
        )
        const scale = baseScale * cropZoom
        const scaledWidth = image.naturalWidth * scale
        const scaledHeight = image.naturalHeight * scale
        const maxOffsetX = Math.max(0, (scaledWidth - profilePictureSize) / 2)
        const maxOffsetY = Math.max(0, (scaledHeight - profilePictureSize) / 2)
        const drawX = (profilePictureSize - scaledWidth) / 2 + (cropOffsetX / 100) * maxOffsetX
        const drawY = (profilePictureSize - scaledHeight) / 2 + (cropOffsetY / 100) * maxOffsetY

        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, profilePictureSize, profilePictureSize)
        context.drawImage(image, drawX, drawY, scaledWidth, scaledHeight)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Could not prepare profile picture.'))
            }
          },
          'image/jpeg',
          0.9
        )
      }
      image.onerror = reject
      image.src = photoPreviewURL
    })

  const handleProfilePictureUpload = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    event.target.blur()

    if (!file) return

    if (!file.type.startsWith('image/')) {
      setPhotoStatusMessage('Please choose an image file.')
      return
    }

    const previewURL = URL.createObjectURL(file)

    try {
      const dimensions = await loadImageDimensions(previewURL)

      if (photoPreviewURL) {
        URL.revokeObjectURL(photoPreviewURL)
      }

      setPhotoPreviewURL(previewURL)
      setPhotoDimensions(dimensions)
      setCropZoom(1)
      setCropOffsetX(0)
      setCropOffsetY(0)
      setCropModalOpen(true)
    } catch (error) {
      console.error('Error loading profile picture preview:', error)
      URL.revokeObjectURL(previewURL)
      setPhotoStatusMessage('Could not open that image. Please try another file.')
    }
  }

  const saveCroppedProfilePicture = async () => {
    if (!photoPreviewURL) return

    setUploadingPhoto(true)
    setPhotoStatusMessage('')

    try {
      const croppedPhoto = await getCroppedProfilePicture()
      const photoURL = await uploadProfilePicture(user.uid, croppedPhoto)
      await setDocument('Users', user.uid, { photoURL })
      closeCropModal()
    } catch (error) {
      console.error('Error uploading profile picture:', error)
      setPhotoStatusMessage('Could not upload profile picture. Please try again.')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const asArray = (value) => (Array.isArray(value) ? value : [])
  const name = user?.displayName || userData?.name || 'Freelancer SV'
  const initials = name.charAt(0).toUpperCase()
  const profilePhotoURL = userData?.photoURL || ''
  const previewSize = 280
  const previewGeometry = photoDimensions
    ? (() => {
        const baseScale = Math.max(previewSize / photoDimensions.width, previewSize / photoDimensions.height)
        const scale = baseScale * cropZoom
        const scaledWidth = photoDimensions.width * scale
        const scaledHeight = photoDimensions.height * scale
        const maxOffsetX = Math.max(0, (scaledWidth - previewSize) / 2)
        const maxOffsetY = Math.max(0, (scaledHeight - previewSize) / 2)

        return {
          width: scaledWidth,
          height: scaledHeight,
          maxOffsetX,
          maxOffsetY,
          left: (previewSize - scaledWidth) / 2 + (cropOffsetX / 100) * maxOffsetX,
          top: (previewSize - scaledHeight) / 2 + (cropOffsetY / 100) * maxOffsetY
        }
      })()
    : null

  const clampCropOffset = (value) => Math.max(-100, Math.min(100, value))

  const handlePhotoDragStart = (event) => {
    if (uploadingPhoto || !previewGeometry) return

    event.currentTarget.setPointerCapture(event.pointerId)
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: cropOffsetX,
      offsetY: cropOffsetY,
      maxOffsetX: previewGeometry.maxOffsetX,
      maxOffsetY: previewGeometry.maxOffsetY
    }
    setIsDraggingPhoto(true)
  }

  const handlePhotoDragMove = (event) => {
    const dragStart = dragStartRef.current

    if (!dragStart || dragStart.pointerId !== event.pointerId) return

    const nextOffsetX = dragStart.maxOffsetX
      ? dragStart.offsetX + ((event.clientX - dragStart.x) / dragStart.maxOffsetX) * 100
      : 0
    const nextOffsetY = dragStart.maxOffsetY
      ? dragStart.offsetY + ((event.clientY - dragStart.y) / dragStart.maxOffsetY) * 100
      : 0

    setCropOffsetX(clampCropOffset(nextOffsetX))
    setCropOffsetY(clampCropOffset(nextOffsetY))
  }

  const handlePhotoDragEnd = (event) => {
    if (dragStartRef.current?.pointerId === event.pointerId) {
      dragStartRef.current = null
      setIsDraggingPhoto(false)
    }
  }
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

  const editableAvatar = ({ size, fontSize, border }) => (
    <Box
      component="label"
      tabIndex={uploadingPhoto ? -1 : 0}
      aria-label="Update profile picture"
      sx={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
        borderRadius: '50%',
        cursor: uploadingPhoto ? 'default' : 'pointer',
        overflow: 'hidden',
        '&:hover .profile-avatar-overlay, &:focus-visible .profile-avatar-overlay': {
          opacity: 1
        }
      }}
    >
      <Avatar
        src={profilePhotoURL}
        alt={name}
        sx={{
          width: '100%',
          height: '100%',
          fontSize,
          bgcolor: svPalette.pupusaCorn,
          color: svPalette.deepBlue,
          fontWeight: 900,
          border
        }}
      >
        {initials}
      </Avatar>
      <Box
        className="profile-avatar-overlay"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          px: 1,
          textAlign: 'center',
          bgcolor: 'rgba(11, 47, 102, 0.74)',
          color: 'white',
          fontSize: { xs: 10, sm: 11 },
          fontWeight: 900,
          lineHeight: 1.15,
          opacity: uploadingPhoto ? 1 : 0,
          transition: 'opacity 160ms ease'
        }}
      >
        {uploadingPhoto ? 'Uploading...' : 'Update profile picture'}
      </Box>
      <input
        type="file"
        accept="image/*"
        hidden
        disabled={uploadingPhoto}
        onChange={handleProfilePictureUpload}
      />
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

  const photoCropModal = (
    <Modal
      open={cropModalOpen}
      onClose={uploadingPhoto ? undefined : closeCropModal}
      aria-labelledby="profile-photo-crop-title"
      aria-describedby="profile-photo-crop-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 'calc(100% - 32px)', sm: 520 },
          maxWidth: '100%',
          maxHeight: 'calc(100svh - 32px)',
          overflowY: 'auto',
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 2,
          border: `1px solid ${svPalette.borderBlue}`,
          bgcolor: 'white',
          boxShadow: '0 24px 80px rgba(11, 47, 102, 0.24)',
          outline: 0
        }}
      >
        <Stack spacing={2.5}>
          <Box>
            <Typography
              id="profile-photo-crop-title"
              variant="h6"
              fontWeight={950}
              color={svPalette.deepBlue}
            >
              Adjust profile picture
            </Typography>
            <Typography
              id="profile-photo-crop-description"
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              The saved image will be a centered {profilePictureSize} x {profilePictureSize} pixel square.
            </Typography>
          </Box>

          <Box
            aria-label="Profile picture preview"
            onPointerDown={handlePhotoDragStart}
            onPointerMove={handlePhotoDragMove}
            onPointerUp={handlePhotoDragEnd}
            onPointerCancel={handlePhotoDragEnd}
            sx={{
              width: previewSize,
              height: previewSize,
              mx: 'auto',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              bgcolor: '#f6fbfc',
              border: `4px solid ${svPalette.pupusaCorn}`,
              boxShadow: '0 12px 32px rgba(11, 47, 102, 0.18)',
              cursor: uploadingPhoto ? 'default' : isDraggingPhoto ? 'grabbing' : 'grab',
              touchAction: 'none'
            }}
          >
            {photoPreviewURL && previewGeometry && (
              <Box
                component="img"
                src={photoPreviewURL}
                alt="Profile preview"
                sx={{
                  position: 'absolute',
                  width: previewGeometry.width,
                  height: previewGeometry.height,
                  left: previewGeometry.left,
                  top: previewGeometry.top,
                  maxWidth: 'none',
                  userSelect: 'none',
                  pointerEvents: 'none'
                }}
              />
            )}
          </Box>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" fontWeight={850} color={svPalette.deepBlue}>
                Zoom
              </Typography>
              <Slider
                value={cropZoom}
                min={1}
                max={3}
                step={0.01}
                onChange={(_, value) => setCropZoom(value)}
                disabled={uploadingPhoto}
                sx={{ color: svPalette.flagBlue }}
              />
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={closeCropModal}
              disabled={uploadingPhoto}
              sx={{
                borderColor: svPalette.borderBlue,
                color: svPalette.deepBlue,
                textTransform: 'none',
                fontWeight: 900,
                borderRadius: 2
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={saveCroppedProfilePicture}
              disabled={uploadingPhoto}
              sx={{
                bgcolor: svPalette.flagBlue,
                textTransform: 'none',
                fontWeight: 900,
                borderRadius: 2,
                '&:hover': { bgcolor: svPalette.deepBlue }
              }}
            >
              {uploadingPhoto ? 'Saving...' : 'Save picture'}
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  )

  const photoStatusModal = (
    <Modal
      open={Boolean(photoStatusMessage)}
      onClose={() => setPhotoStatusMessage('')}
      aria-labelledby="profile-photo-status-title"
      aria-describedby="profile-photo-status-description"
    >
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: { xs: 'calc(100% - 32px)', sm: 420 },
          maxWidth: '100%',
          p: { xs: 3, sm: 3.5 },
          borderRadius: 2,
          border: '1px solid rgba(217, 74, 50, 0.28)',
          bgcolor: 'white',
          boxShadow: '0 24px 80px rgba(11, 47, 102, 0.24)',
          outline: 0
        }}
      >
        <Stack spacing={2.25} alignItems="center" textAlign="center">
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: '#fff0ed',
              color: svPalette.curtidoRed
            }}
          >
            <Warning sx={{ fontSize: 38 }} />
          </Box>
          <Box>
            <Typography
              id="profile-photo-status-title"
              variant="h6"
              fontWeight={950}
              color={svPalette.deepBlue}
              gutterBottom
            >
              Upload failed
            </Typography>
            <Typography
              id="profile-photo-status-description"
              variant="body2"
              color="text.secondary"
            >
              {photoStatusMessage}
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={() => setPhotoStatusMessage('')}
            sx={{
              bgcolor: svPalette.flagBlue,
              textTransform: 'none',
              fontWeight: 900,
              borderRadius: 2,
              px: 4,
              '&:hover': {
                bgcolor: svPalette.deepBlue
              }
            }}
          >
            Got it
          </Button>
        </Stack>
      </Box>
    </Modal>
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
                    {editableAvatar({
                      size: { xs: 88, md: 112 },
                      fontSize: 44,
                      border: '4px solid rgba(255,255,255,0.92)'
                    })}
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
      {photoCropModal}
      {photoStatusModal}
    </Box>
  )
}

export default Home
