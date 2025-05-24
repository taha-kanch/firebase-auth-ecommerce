import React from 'react';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../firebase';

function Login() {
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      localStorage.setItem('token', token);
      window.location.href = '/products';
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to Product Management
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Please sign in to continue
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGoogleLogin}
            startIcon={<img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 20, height: 20 }} />}
          >
            Sign in with Google
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export default Login; 