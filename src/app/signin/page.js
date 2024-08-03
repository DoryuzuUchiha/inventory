


'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography } from '@mui/material';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to the inventory page after successful sign-in
    } catch (err) {
      console.error('Sign-in error:', err); // Log detailed error
      setError('Failed to sign in. Please check your credentials.');
    }
  };

  const handleRegister = async () => {
    try {
      // Register the user
      await createUserWithEmailAndPassword(auth, email, password);
      // Sign in the user immediately after registration
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/'); // Redirect to the inventory page after successful sign-in
    } catch (err) {
      console.error('Registration error:', err); // Log detailed error
      setError('Failed to register. Please check your credentials.');
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" height="100vh">
      <Typography variant="h4">{isRegistering ? 'Register' : 'Sign In'}</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ marginBottom: 2, backgroundColor: 'white' }} // Set background color to white
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ marginBottom: 2, backgroundColor: 'white' }} // Set background color to white
      />
      {isRegistering ? (
        <>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setIsRegistering(false)} sx={{ marginTop: 2 }}>
            Already have an account? Sign In
          </Button>
        </>
      ) : (
        <>
          <Button variant="contained" color="primary" onClick={handleSignIn}>
            Sign In
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => setIsRegistering(true)} sx={{ marginTop: 2 }}>
            New here? Register
          </Button>
        </>
      )}
    </Box>
  );
}
