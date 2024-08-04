'use client';

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';
import { useRouter } from 'next/navigation';
import { Box, Button, TextField, Typography, Modal, Stack } from '@mui/material';
import Image from 'next/image';
import rusticDivider from '/public/images/wooden-texture.JPG'; // Add a decorative divider

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State for confirm password
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false);
  const [open, setOpen] = useState(false); // Modal state
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
    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err) {
      console.error('Registration error:', err);
      setError('Failed to register. Please check your credentials.');
    }
  };

  const toggleModal = () => {
    setOpen((prev) => !prev);
    setIsRegistering(!open); // Switch to registering state if modal is open
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      height="100vh"
      sx={{
        backgroundImage: 'url(/images/sibackground.JPG)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#FFF',
      }}
    >
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        padding={4}
        borderRadius={3}
        sx={{ width: '80%', maxWidth: '400px' }}
      >
        <Typography variant="h3" sx={{ color: '#8B4513', fontWeight: 'bold', marginBottom: 2 }}>
          Welcome Back!
        </Typography>
        <Image src={rusticDivider} alt="Rustic Divider" width={400} height={10} />
        <Typography variant="h6" sx={{ color: '#8B4513', marginBottom: 3 }}>
          Please sign in to continue.
        </Typography>
        {error && <Typography color="error">{error}</Typography>}
        <TextField
          label="Email"
          variant="outlined"
          fullWidth
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ marginBottom: 2, backgroundColor: 'white', borderRadius: 1 }}
        />
        <TextField
          label="Password"
          variant="outlined"
          fullWidth
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ marginBottom: 2, backgroundColor: 'white', borderRadius: 1 }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSignIn}
          sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#A0522D' }, marginBottom: 2 }}
        >
          Sign In
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={toggleModal}
          sx={{ borderColor: '#8B4513', color: '#8B4513', '&:hover': { borderColor: '#A0522D', color: '#A0522D' } }}
        >
          New here? Register
        </Button>
      </Box>

      {/* Registration Modal */}
      <Modal open={open} onClose={toggleModal}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          bgcolor="rgba(255, 255, 255, 0.95)"
          padding={4}
          borderRadius={3}
          sx={{ width: '90%', maxWidth: '450px', margin: 'auto', marginTop: '10%' }}
        >
          <Typography variant="h4" sx={{ color: '#8B4513', marginBottom: 2 }}>
            Register
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ marginBottom: 2, backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ marginBottom: 2, backgroundColor: 'white', borderRadius: 1 }}
          />
          <TextField
            label="Confirm Password"
            variant="outlined"
            fullWidth
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            sx={{ marginBottom: 2, backgroundColor: 'white', borderRadius: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleRegister}
            sx={{ backgroundColor: '#8B4513', '&:hover': { backgroundColor: '#A0522D' }, marginTop: 2 }}
          >
            Register
          </Button>
        </Box>
      </Modal>
    </Box>
  );
}
