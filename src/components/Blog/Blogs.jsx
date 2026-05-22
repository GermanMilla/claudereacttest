import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Container } from '@mui/material';
import { svPalette, svGradients } from '../../styles/designTokens';
import { listenToCollectionPath } from '../../firebase/firestoreService';
import CreateNewBlog from './CreateNewBlog';
import { useSelector } from 'react-redux'

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

const renderBlogBody = (body = '') => {
  const lines = body.split('\n')
  const blocks = []
  let bulletItems = []
  let numberedItems = []

  const flushBulletItems = () => {
    if (!bulletItems.length) {
      return
    }

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
    if (!numberedItems.length) {
      return
    }

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
      <Typography key={`paragraph-${index}`} variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {renderInlineFormatting(line)}
      </Typography>
    )
  })

  flushBulletItems()
  flushNumberedItems()
  return blocks
}

function Blogs() {

  const [blogs, setBlogs] = useState([]);
  const user = useSelector((state) => state.auth.user);
  

  useEffect(() => {
    
    const unsubscribe = listenToCollectionPath('BlogEntries', (data) => {
      
      setBlogs(data);
      
    }, (error) => {
      console.error('Error fetching blogs:', error);
    });

    return () => unsubscribe()

  }, []) 

  return (
    <Box
      sx={{
        minHeight: 'calc(100svh - 64px)',
        px: { xs: 2, md: 4 },
        py: { xs: 3, md: 5 },
        background: svGradients.page,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h3" fontWeight={950} color={svPalette.deepBlue} gutterBottom>
          Blog
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Stay updated with the latest insights and stories from our community.
        </Typography>

        {user ? (
          <Box sx={{ mb: 4 }}>
            <CreateNewBlog user={user} />
          </Box>
        ) : null}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Placeholder Blog Post 1 */}

            {blogs.map((blog) => (
              <Paper
              key={blog.id}
              elevation={0}
              sx={{
              p: 3,
              borderRadius: 2,
              border: `1px solid ${svPalette.borderBlue}`,
              bgcolor: 'white',
            }}
              >
                <Typography variant="h5" fontWeight={800} color={svPalette.deepBlue} gutterBottom>
                  {blog.title} <Typography variant="subtitle2" color="text.secondary" component="span">Created on: {blog.id}</Typography>
                </Typography>
                <Box sx={{ color: 'text.secondary', mb: 2 }}>
                  {renderBlogBody(blog.body)}
                </Box>
              </Paper>
            ))}

        </Box>
      </Container>
    </Box>
  );
}

export default Blogs;
