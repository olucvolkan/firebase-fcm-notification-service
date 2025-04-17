# Firebase FCM Notification Service

A simple Express service built with TypeScript to send push notifications via Firebase Cloud Messaging (FCM).

## Features

- Single endpoint for sending push notifications
- Support for single or multiple device tokens
- Support for topic-based notifications
- Basic authentication with token
- TypeScript for type safety

## Setup

1. Clone the repository
   ```
   git clone https://github.com/olucvolkan/firebase-fcm-notification-service.git
   cd firebase-fcm-notification-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file based on the provided `.env.template`:
   ```
   cp .env.template .env
   ```

4. Update the `.env` file with your Firebase credentials and API token
5. Build the project:
   ```
   npm run build
   ```

6. Start the server:
   ```
   npm start
   ```

## Firebase Setup

1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com/)
2. Go to Project Settings > Service Accounts
3. Generate a new private key (this will download a JSON file)
4. Use the values from this JSON file to fill in your `.env` file:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`

## API Documentation

### Send Notification

**Endpoint:** `POST /send-notification`

**Authentication:**
- Basic Auth with token in header:
  ```
  Authorization: Bearer YOUR_API_TOKEN
  ```

**Request Parameters:**
```json
{
  "tokens": ["device_token_1", "device_token_2"],  // Optional if topicName is provided
  "topicName": "news",  // Optional if tokens are provided
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key1": "value1",
    "key2": "value2"
  }
}
```

**Response:**
- For topic:
  ```json
  {
    "success": true,
    "messageId": "projects/your-project/messages/message-id",
    "sentTo": "topic: news"
  }
  ```
- For single token:
  ```json
  {
    "success": true,
    "messageId": "projects/your-project/messages/message-id"
  }
  ```
- For multiple tokens:
  ```json
  {
    "success": true,
    "successCount": 2,
    "failureCount": 0,
    "responses": [
      { "messageId": "projects/your-project/messages/message-id-1", "success": true },
      { "messageId": "projects/your-project/messages/message-id-2", "success": true }
    ]
  }
  ```

## Error Handling

- 400 Bad Request: Missing or invalid request parameters
- 401 Unauthorized: Invalid or missing API token
- 500 Internal Server Error: Server-side errors

## Development

To run in development mode with hot reloading:
```
npm run dev
```