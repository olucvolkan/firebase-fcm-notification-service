// src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Load environment variables
dotenv.config();

// Initialize Firebase Admin
const app = initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

// Initialize Express
const server = express();
server.use(bodyParser.json());

// Basic Auth Middleware
const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token || token !== process.env.API_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  next();
};

// Notification endpoint
server.post('/send-notification', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { tokens, topicName, title, body, data } = req.body;
    
    // Validation
    if (!title || !body) {
      return res.status(400).json({ error: 'Notification title and body are required' });
    }

    // Check if either tokens or topicName is provided
    if ((!tokens || !Array.isArray(tokens) || tokens.length === 0) && !topicName) {
      return res.status(400).json({ error: 'Either device tokens or topicName is required' });
    }

    // Base message structure
    const baseMessage = {
      notification: {
        title,
        body,
      },
      data: data || {},
    };

    // Send to topic
    if (topicName) {
      const message = {
        ...baseMessage,
        topic: topicName,
      };

      const response = await getMessaging().send(message);
      return res.status(200).json({ 
        success: true, 
        messageId: response,
        sentTo: `topic: ${topicName}`
      });
    }
    
    // Send to single token
    else if (tokens.length === 1) {
      const message = {
        ...baseMessage,
        token: tokens[0],
      };

      const response = await getMessaging().send(message);
      return res.status(200).json({ success: true, messageId: response });
    } 
    
    // Send to multiple tokens
    else {
      const messages = tokens.map(token => ({
        ...baseMessage,
        token,
      }));

      const response = await getMessaging().sendAll(messages);
      return res.status(200).json({ 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses 
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`FCM notification service running on port ${PORT}`);
});