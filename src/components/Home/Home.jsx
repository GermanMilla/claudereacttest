import Navbar from '../Navbar/Navbar'
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
    Button
} from '@mui/material'



function Home() {
    const { user } = useSelector((state) => state.auth)
    const userData = useSelector((state) => state.profile.profile)

    const [profileMissing, setProfileMissing] = useState(false)
    const [newFieldKey, setNewFieldKey] = useState('')
    const [newFieldValue, setNewFieldValue] = useState('')
    const [statusMessage, setStatusMessage] = useState('')
    const [saving, setSaving] = useState(false)

    const dispatch = useDispatch();

    useEffect(() => {
        if (!user?.uid) {
            dispatch(clearProfile())
            setProfileMissing(false)
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
        <Navbar user={user} />

        <section id="center">

        {userData && (
          <Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 3,
              width: '100%',
              maxWidth: 650,
              borderRadius: 4
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3
              }}
            >
              <Avatar
                src={user?.photoURL || ''}
                alt={user?.displayName || 'User'}
                sx={{
                  width: 80,
                  height: 80,
                  fontSize: 32,
                  bgcolor: '#d97757'
                }}
              >
                {user?.displayName?.charAt(0) || 'U'}
              </Avatar>

              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {user?.displayName || userData.name || 'User Profile'}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  {user?.email || userData.email || 'No email available'}
                </Typography>

                <Chip
                  label="Active account"
                  size="small"
                  color="success"
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h6" sx={{ mb: 2 }}>
              Profile Details
            </Typography>

            <Stack spacing={1.5}>
              {Object.entries(userData).map(([key, value]) => (
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
                    sx={{
                      textTransform: 'capitalize',
                      minWidth: 140
                    }}
                  >
                    {key}
                  </Typography>

                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{
                      textAlign: 'right',
                      wordBreak: 'break-word'
                    }}
                  >
                    {formatValue(value)}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {profileMissing && !userData && (
          <Paper
            elevation={3}
            sx={{
              mt: 4,
              p: 3,
              width: '100%',
              maxWidth: 650,
              borderRadius: 4
            }}
          >
            <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
              No profile found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              We didn&apos;t find a profile for your account. Add a profile field below to create your profile.
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

              <Button
                variant="contained"
                onClick={saveProfileField}
                disabled={saving}
              >
                {saving ? 'Saving…' : 'Create profile field'}
              </Button>
            </Stack>
          </Paper>
        )}
      </section>
    </>
  )
}

export default Home