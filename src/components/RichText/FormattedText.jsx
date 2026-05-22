import { Box, Typography } from '@mui/material'

const renderInlineFormatting = (text) => {
  const parts = text.split(/(\*\*.+?\*\*|\*.+?\*|~~.+?~~)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={`${part}-${index}`}>{part.slice(2, -2)}</strong>
    }

    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={`${part}-${index}`}>{part.slice(1, -1)}</em>
    }

    if (part.startsWith('~~') && part.endsWith('~~')) {
      return <s key={`${part}-${index}`}>{part.slice(2, -2)}</s>
    }

    return part
  })
}

function FormattedText({ text = '', variant = 'body2', color = 'text.secondary', sx }) {
  const lines = text.split('\n')
  const blocks = []
  let bulletItems = []
  let numberedItems = []

  const flushBulletItems = () => {
    if (!bulletItems.length) return

    blocks.push(
      <Box component="ul" key={`list-${blocks.length}`} sx={{ my: 1, pl: 3 }}>
        {bulletItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineFormatting(item)}</li>
        ))}
      </Box>
    )
    bulletItems = []
  }

  const flushNumberedItems = () => {
    if (!numberedItems.length) return

    blocks.push(
      <Box component="ol" key={`numbered-list-${blocks.length}`} sx={{ my: 1, pl: 3 }}>
        {numberedItems.map((item, index) => (
          <li key={`${item}-${index}`}>{renderInlineFormatting(item)}</li>
        ))}
      </Box>
    )
    numberedItems = []
  }

  lines.forEach((line, index) => {
    const bulletMatch = line.match(/^\s*[-*]\s+(.+)$/)
    const numberedMatch = line.match(/^\s*\d+\.\s+(.+)$/)

    if (bulletMatch) {
      flushNumberedItems()
      bulletItems.push(bulletMatch[1])
      return
    }

    if (numberedMatch) {
      flushBulletItems()
      numberedItems.push(numberedMatch[1])
      return
    }

    flushBulletItems()
    flushNumberedItems()

    if (!line.trim()) {
      blocks.push(<Box key={`space-${index}`} sx={{ height: 8 }} />)
      return
    }

    blocks.push(
      <Typography key={`paragraph-${index}`} variant={variant} color={color} sx={{ mb: 1 }}>
        {renderInlineFormatting(line)}
      </Typography>
    )
  })

  flushBulletItems()
  flushNumberedItems()

  return <Box sx={sx}>{blocks}</Box>
}

export default FormattedText
