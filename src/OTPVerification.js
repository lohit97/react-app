import React, { useState } from 'react';
import { TextField, Button, Typography, Container } from '@mui/material';

const OTPVerification = ({ mobileNum, otpReference, onVerifyOTP }) => {
  const [otp, setOtp] = useState('');

  const handleVerify = () => {
    onVerifyOTP(otp, otpReference);
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h5" component="h2" gutterBottom>
        Enter OTP
      </Typography>
      <Typography variant="subtitle1" gutterBottom>
        OTP sent to: {mobileNum}
      </Typography>
      <TextField
        label="OTP"
        variant="outlined"
        fullWidth
        margin="normal"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        fullWidth
        onClick={handleVerify}
      >
        Verify OTP
      </Button>
    </Container>
  );
};

export default OTPVerification;
