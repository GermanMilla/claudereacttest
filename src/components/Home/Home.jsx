import { useSelector } from 'react-redux'
import Navbar from '../Navbar/Navbar'
import { useEffect, useState } from 'react'
import { listenToDocument } from '../../firebase/firestoreService'
import {
    Typography,
    CircularProgress,
    Box,
    Paper,
    Avatar,
    Divider,
    Chip,
    Stack
} from '@mui/material'

function Home() {
    const { user } = useSelector((state) => state.auth)
    const [userData, setUserData] = useState(null)

    useEffect(() => {   
        if (!user?.uid) {
        return
    }

    const unsubscribe = listenToDocument(
        'Users',
        user.uid,
        (data) => {
        setUserData(data)
        },
        (error) => {
            console.error('Error fetching user data:', error)
        }
    )
        return () => unsubscribe()
    }, [user])

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
      </section>
    </>
  )
}

export default Home