import { useRef, useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  Paper,
  Popover,
  TextField,
  Tooltip,
  Typography
} from '@mui/material'
import {
  EmojiEmotions,
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  StrikethroughS
} from '@mui/icons-material'
import EmojiPicker from 'emoji-picker-react'
import { setDocument } from '../../firebase/firestoreService'
import { svPalette } from '../../styles/designTokens'

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
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null)
  const bodyInputRef = useRef(null)
  const emojiPickerOpen = Boolean(emojiAnchorEl)

  const updateBodyWithSelection = (nextBody, selectionStart, selectionEnd) => {
    setBody(nextBody)

    window.requestAnimationFrame(() => {
      bodyInputRef.current?.focus()
      bodyInputRef.current?.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const wrapSelectedText = (prefix, suffix = prefix) => {
    const input = bodyInputRef.current
    const start = input?.selectionStart ?? body.length
    const end = input?.selectionEnd ?? body.length
    const selectedText = body.slice(start, end)
    const fallbackText = 'text'
    const wrappedText = `${prefix}${selectedText || fallbackText}${suffix}`
    const nextBody = `${body.slice(0, start)}${wrappedText}${body.slice(end)}`
    const nextStart = start + prefix.length
    const nextEnd = nextStart + (selectedText || fallbackText).length

    updateBodyWithSelection(nextBody, nextStart, nextEnd)
  }

  const addBulletList = () => {
    const input = bodyInputRef.current
    const start = input?.selectionStart ?? body.length
    const end = input?.selectionEnd ?? body.length
    const selectedText = body.slice(start, end)
    const bulletText = selectedText
      ? selectedText
          .split('\n')
          .map((line) => (line.trim() ? `- ${line.replace(/^[-*]\s+/, '')}` : line))
          .join('\n')
      : '- List item'
    const nextBody = `${body.slice(0, start)}${bulletText}${body.slice(end)}`

    updateBodyWithSelection(nextBody, start, start + bulletText.length)
  }

  const addNumberedList = () => {
    const input = bodyInputRef.current
    const start = input?.selectionStart ?? body.length
    const end = input?.selectionEnd ?? body.length
    const selectedText = body.slice(start, end)
    const numberedText = selectedText
      ? selectedText
          .split('\n')
          .map((line, index) => (
            line.trim() ? `${index + 1}. ${line.replace(/^\d+\.\s+/, '')}` : line
          ))
          .join('\n')
      : '1. List item'
    const nextBody = `${body.slice(0, start)}${numberedText}${body.slice(end)}`

    updateBodyWithSelection(nextBody, start, start + numberedText.length)
  }

  const insertEmoji = (emojiData) => {
    const input = bodyInputRef.current
    const start = input?.selectionStart ?? body.length
    const end = input?.selectionEnd ?? body.length
    const emoji = emojiData.emoji
    const nextBody = `${body.slice(0, start)}${emoji}${body.slice(end)}`
    const nextCursorPosition = start + emoji.length

    updateBodyWithSelection(nextBody, nextCursorPosition, nextCursorPosition)
  }

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
        <Box
          sx={{
            display: 'flex',
            gap: 0.5,
            p: 0.5,
            border: `1px solid ${svPalette.borderBlue}`,
            borderRadius: 1,
            bgcolor: svPalette.paperCool,
            width: 'fit-content'
          }}
        >
          <Tooltip title="Bold">
            <IconButton type="button" aria-label="bold" size="small" onClick={() => wrapSelectedText('**')}>
              <FormatBold fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Italic">
            <IconButton type="button" aria-label="italic" size="small" onClick={() => wrapSelectedText('*')}>
              <FormatItalic fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Strikethrough">
            <IconButton type="button" aria-label="strikethrough" size="small" onClick={() => wrapSelectedText('~~')}>
              <StrikethroughS fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Bulleted list">
            <IconButton type="button" aria-label="bulleted list" size="small" onClick={addBulletList}>
              <FormatListBulleted fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Numbered list">
            <IconButton type="button" aria-label="numbered list" size="small" onClick={addNumberedList}>
              <FormatListNumbered fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Emoji">
            <IconButton
              type="button"
              aria-label="emoji"
              size="small"
              onClick={(event) => setEmojiAnchorEl(event.currentTarget)}
            >
              <EmojiEmotions fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Popover
          open={emojiPickerOpen}
          anchorEl={emojiAnchorEl}
          onClose={() => setEmojiAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <EmojiPicker onEmojiClick={insertEmoji} />
        </Popover>
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
