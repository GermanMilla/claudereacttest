import { useState } from 'react'
import {
  Box,
  IconButton,
  Popover,
  Tooltip
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
import { svPalette } from '../../styles/designTokens'

function RichTextToolbar({ inputRef, value, onChange }) {
  const [emojiAnchorEl, setEmojiAnchorEl] = useState(null)
  const emojiPickerOpen = Boolean(emojiAnchorEl)

  const updateValueWithSelection = (nextValue, selectionStart, selectionEnd) => {
    onChange(nextValue)

    window.requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(selectionStart, selectionEnd)
    })
  }

  const wrapSelectedText = (prefix, suffix = prefix) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const selectedText = value.slice(start, end)
    const fallbackText = 'text'
    const wrappedText = `${prefix}${selectedText || fallbackText}${suffix}`
    const nextValue = `${value.slice(0, start)}${wrappedText}${value.slice(end)}`
    const nextStart = start + prefix.length
    const nextEnd = nextStart + (selectedText || fallbackText).length

    updateValueWithSelection(nextValue, nextStart, nextEnd)
  }

  const addBulletList = () => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const selectedText = value.slice(start, end)
    const bulletText = selectedText
      ? selectedText
          .split('\n')
          .map((line) => (line.trim() ? `- ${line.replace(/^[-*]\s+/, '')}` : line))
          .join('\n')
      : '- List item'
    const nextValue = `${value.slice(0, start)}${bulletText}${value.slice(end)}`

    updateValueWithSelection(nextValue, start, start + bulletText.length)
  }

  const addNumberedList = () => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const selectedText = value.slice(start, end)
    const numberedText = selectedText
      ? selectedText
          .split('\n')
          .map((line, index) => (
            line.trim() ? `${index + 1}. ${line.replace(/^\d+\.\s+/, '')}` : line
          ))
          .join('\n')
      : '1. List item'
    const nextValue = `${value.slice(0, start)}${numberedText}${value.slice(end)}`

    updateValueWithSelection(nextValue, start, start + numberedText.length)
  }

  const insertEmoji = (emojiData) => {
    const input = inputRef.current
    const start = input?.selectionStart ?? value.length
    const end = input?.selectionEnd ?? value.length
    const emoji = emojiData.emoji
    const nextValue = `${value.slice(0, start)}${emoji}${value.slice(end)}`
    const nextCursorPosition = start + emoji.length

    updateValueWithSelection(nextValue, nextCursorPosition, nextCursorPosition)
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
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
    </>
  )
}

export default RichTextToolbar
