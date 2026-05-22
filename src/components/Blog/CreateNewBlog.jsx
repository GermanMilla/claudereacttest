import { useRef, useState } from 'react'
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography
} from '@mui/material'
import { setDocument } from '../../firebase/firestoreService'
import { svPalette } from '../../styles/designTokens'
import RichTextToolbar from '../RichText/RichTextToolbar'

const formatLocalTimestamp = (date) => {
  const pad = (value) => String(value).padStart(2, '0')

  return [
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  ].join(', ')
}

function CreateNewBlog({ user }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const bodyInputRef = useRef(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setMessage('')
    setError('')
    
    if (!user) {
      setError('You must be signed in to create a blog entry.')
      return
    }

    const trimmedTitle = title.trim()
    const trimmedBody = body.trim()

    if (!trimmedTitle || !trimmedBody) {
      setError('Please add a title and body before publishing.')
      return
    }

    const timestamp = formatLocalTimestamp(new Date())

    try {
      setIsSaving(true)
      await setDocument('BlogEntries', timestamp, {
        title: trimmedTitle,
        body: trimmedBody,
        createdBy: user.uid
      })
      setTitle('')
      setBody('')
      setMessage(`Blog entry created: ${timestamp}`)
    } catch (saveError) {
      console.error('Error creating blog entry:', saveError)
      setError('Could not create the blog entry. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Paper
      component="form"
      elevation={0}
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${svPalette.borderBlue}`,
        bgcolor: 'white'
      }}
    >
      <Typography variant="h5" fontWeight={900} color={svPalette.deepBlue} gutterBottom>
        Create new blog
      </Typography>

      <Box sx={{ display: 'grid', gap: 2 }}>
        <TextField
          label="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          fullWidth
          required
        />
        <RichTextToolbar inputRef={bodyInputRef} value={body} onChange={setBody} />
        <TextField
          label="Body"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          inputRef={bodyInputRef}
          fullWidth
          required
          multiline
          minRows={5}
        />
        {error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
        {message && (
          <Typography variant="body2" color={svPalette.mangoGreen}>
            {message}
          </Typography>
        )}
        <Button
          type="submit"
          variant="contained"
          disabled={isSaving}
          sx={{
            justifySelf: 'start',
            bgcolor: svPalette.deepBlue,
            textTransform: 'none',
            fontWeight: 800,
            '&:hover': { bgcolor: svPalette.flagBlue }
          }}
        >
          {isSaving ? 'Publishing...' : 'Publish blog'}
        </Button>
      </Box>
    </Paper>
  )
}
export default CreateNewBlog;
