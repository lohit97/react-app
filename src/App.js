import React, { useState, useEffect, useRef } from 'react';
import Login from './Login';
import OTPVerification from './OTPVerification';
import LinkedAccounts from './LinkedAccounts';
import { CssBaseline } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const generateUUID = () => uuidv4();

function App() {
  const [currentScreen, setCurrentScreen] = useState('login');
  const [userId, setUserId] = useState('8698596991@finvu');
  const [otpDetails, setOtpDetails] = useState({ mobileNum: '8698596991', otpReference: '' });
  const [linkedAccounts, setLinkedAccounts] = useState([]);
  const [DiscoveredAccounts, setDiscoveredAccounts] = useState([]);
  const socket = useRef(null);
  const [newAccountToLink, setNewAccountToLink] = useState({});
  const [messageId, setMessageId] = useState('');

  useEffect(() => {
    const connectWebSocket = () => {
      const newSocket = new WebSocket('wss://webvwdev.finvu.in/consentapi');

      newSocket.onopen = () => {
        console.log('WebSocket Connected');
        socket.current = newSocket; // Set the socket here to ensure it's only set when the connection is open

        // Send any pending data that might have been queued due to WebSocket being disconnected
        // You might need a queue mechanism to store pending messages
      };

      newSocket.onclose = () => {
        console.log('WebSocket Disconnected, attempting to reconnect...');
        setTimeout(connectWebSocket, 3000); // Attempt to reconnect every 3 seconds
      };

      newSocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('Message from server:', data);
        handleMessage(data);
      };

      newSocket.onerror = (error) => {
        console.error('WebSocket Error:', error);
      };

      // Override the send function with logging
      const originalSend = newSocket.send;
      newSocket.send = function (data) {
        console.log('Sending data:', data);
        originalSend.call(newSocket, data);
      };
    };

    connectWebSocket(); // Initial connection attempt

    // return () => socket?.close(); // Cleanup function to close WebSocket connection when the component unmounts
  }, []);

  const handleMessage = (data) => {
    if (data.header.type === 'urn:finvu:in:app:res.loginOtp.01' && data.payload.status === 'SEND') {
      setOtpDetails({ mobileNum: data.payload.maskedId, otpReference: data.payload.otpReference });
      setCurrentScreen('otpVerification');
    } else if (data.header.type === 'urn:finvu:in:app:res.loginOtpVerify.01' && data.payload.status === 'SUCCESS') {
      fetchLinkedAccounts(data.payload.userId, data.header.sid);
    } else if (data.header.type === 'urn:finvu:in:app:res.userLinkedAccount.01' && data.payload.status === 'SUCCESS') {
      setLinkedAccounts(data.payload.LinkedAccounts);
      // discoverAccounts
      // discoverAccounts(data.header.sid);
      setCurrentScreen('linkedAccounts');
    } else if (data.header.type === 'urn:finvu:in:app:res.userLinkedAccount.01' && data.payload.status === 'RECORD-NOT-FOUND') {
      // do account discovery
      setLinkedAccounts([]);
      // call discover accounts for each bank.
      discoverAccounts(data.header.sid, data.payload.userId);
      setCurrentScreen('linkedAccounts');
    }
      // setCurrentScreen('discoveredAccounts');
    // } else if (data.header.type === 'urn:finvu:in:app:res.discover.01' && data.payload.status === 'SUCCESS'){
    //   setDiscoveredAccounts(data.payload.DiscoveredAccounts);
    //     //show linked and discovered accounts
    // } else if (data.header.type === 'urn:finvu:in:app:res.discover.01' && data.payload.status === 'RECORD-NOT-FOUND'){
    //   setDiscoveredAccounts([]);
    //     // display any linked accounts, inform user no new accounts were discovered
    // }
    // Handle other message types as needed
  };

  const handleLogin = (username, mobileNum) => {
    const loginMid = generateUUID(); // Generate MID here
    setMessageId(loginMid); // Store the MID in the state
    setUserId(username);
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        header: {
          mid: loginMid, // Use the generated MID
          ts: new Date().toISOString(),
          sid: "",
          dup: false,
          type: "urn:finvu:in:app:req.loginOtp.01"
        },
        payload: {
          "username": username,
          mobileNum,
          "handleId": "a3119f4d-0693-4418-a219-8b51a55d60c0"
        }
      }));
    } else {
      console.log('WebSocket is not open. Cannot send login data.');
    }
  };
  

  const handleVerifyOTP = (otp, otpReference) => {
    // console.log(socket, socket.readyState)
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        header: {
          mid: messageId, // Use the stored MID
          ts: new Date().toISOString(),
          sid: "",
          dup: false,
          type: "urn:finvu:in:app:req.loginOtpVerify.01"
        },
        payload: {
          otpReference,
          otp
        }
      }));
    } else {
      console.log('WebSocket is not open. Cannot send OTP verification data.');
    }
  };

  const fetchLinkedAccounts = (userId, sid) => {
    console.log(socket, socket.readyState)
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({
        header: {
          mid: messageId, // Use the stored MID
          ts: new Date().toISOString(),
          sid,
          dup: false,
          type: "urn:finvu:in:app:req.userLinkedAccount.01"
        },
        payload: {
          userId
        }
      }));
    } else {
      console.log('WebSocket is not open. Cannot fetch linked accounts.');
    }
  };

  const discoverAccounts = (sid, userId) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      const payload = {
        ver: "1.1.2",
        timestamp: new Date().toISOString(),
        txnid: generateUUID(),
        Customer: {
          id: "8698596991@finvu",
          Identifiers: [{ category: "STRONG", type: "MOBILE", value: "8698596991" }]
        },
        FIPDetails: { fipId: "BARB0KIMXXX", fipName: "Finvu Bank" },
        FITypes: ["DEPOSIT", "RECURRING_DEPOSIT", "TERM-DEPOSIT"]
      };

      socket.current.send(JSON.stringify({
        header: {
          mid: generateUUID(),
          ts: new Date().toISOString(),
          sid,
          dup: false,
          type: "urn:finvu:in:app:req.discover.01"
        },
        payload
      }));

      console.log('Account discovery request sent:', payload);
    }
  };

  const linkNewAccount = (sid) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      const payload = {
        ver: "1.1.2",
        timestamp: new Date().toISOString(),
        txnid: generateUUID(),
        "FIPDetails": {
          "fipId": "BARB0KIMXXX",
          "fipName": "Finvu Bank"
          },
          "Customer": {
          "id": "webdemo@finvu",
          "Accounts": [
          {
          "maskedAccNumber": "XXXXXX1068",
          "accRefNumber": "REF8421068",
          "FIType": "DEPOSIT",
          "accType": "SAVINGS"
          }
          ]
          }
      };

      socket.current.send(JSON.stringify({
        header: {
          mid: generateUUID(),
          ts: new Date().toISOString(),
          sid,
          dup: false,
          type: "urn:finvu:in:app:req.linking.01"
        },
        payload
      }));

      console.log('Account discovery request sent:', payload);
    }
  };

  const VerifyAccount = (sid) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      const payload = {
        ver: "1.1.2",
        timestamp: new Date().toISOString(),
        txnid: generateUUID(),
        "AccountsLinkingRefNumber": "071740e5-c489-4dbc-b846-abaef3b2eb31",
        "token": 169888
      };

      socket.current.send(JSON.stringify({
        header: {
          mid: generateUUID(),
          ts: new Date().toISOString(),
          sid,
          dup: false,
          type: "urn:finvu:in:app:req.confirm-token.01"
        },
        payload
      }));

      console.log('Account discovery request sent:', payload);
    }
  };

  return (
    <div className="App">
      <CssBaseline />
      {currentScreen === 'login' && <Login onLogin={handleLogin} />}
      {currentScreen === 'otpVerification' && (
        <OTPVerification
          mobileNum={otpDetails.mobileNum}
          otpReference={otpDetails.otpReference}
          onVerifyOTP={handleVerifyOTP}
        />
      )}
      {currentScreen === 'linkedAccounts' && <LinkedAccounts linkedAccounts={linkedAccounts} />}
    </div>
  );
}

export default App;
