import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('8698596991@finvu');
  const [mobileNum, setMobileNum] = useState('8698596991');

  const handleLogin = () => {
    onLogin(username, mobileNum);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" component="h1" gutterBottom>
        Login
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Mobile Number"
        variant="outlined"
        fullWidth
        margin="normal"
        value={mobileNum}
        onChange={(e) => setMobileNum(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleLogin}
      >
        Send OTP
      </Button>
    </Container>
  );
};

export default Login;
