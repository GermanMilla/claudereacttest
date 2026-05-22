import { useEffect, useState } from 'react'
import { Box, Typography, Paper, Container } from '@mui/material';
import { svPalette, svGradients } from '../../styles/designTokens';
import { listenToCollectionPath } from '../../firebase/firestoreService';
import CreateNewBlog from './CreateNewBlog';
import { useSelector } from 'react-redux'
import FormattedText from '../RichText/FormattedText'

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
                <Box sx={{ mb: 2 }}>
                  <FormattedText text={blog.body} />
                </Box>
              </Paper>
            ))}

        </Box>
      </Container>
    </Box>
  );
}

export default Blogs;
