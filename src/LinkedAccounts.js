import React from 'react';
import { Container, Typography, Card, CardContent, Grid } from '@mui/material';

const LinkedAccounts = ({ linkedAccounts }) => {
  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        Linked Accounts
      </Typography>
      <Grid container spacing={2}>
        {linkedAccounts.map((account, index) => (
          <Grid item xs={12} sm={6} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">{account.fipName}</Typography>
                <Typography color="textSecondary">
                  Account: {account.maskedAccNumber}
                </Typography>
                <Typography color="textSecondary">
                  Type: {account.accType}
                </Typography>
                <Typography color="textSecondary">
                  Updated: {new Date(account.linkedAccountUpdateTimestamp).toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default LinkedAccounts;
