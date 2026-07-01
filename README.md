# ChatHub - Professional Messaging App

A professional WhatsApp/Telegram style chat web application built with HTML5, CSS3, JavaScript, and Firebase.

## Features

✅ **Authentication**
- Phone OTP Login with Firebase Authentication
- Secure user registration and profile creation
- Auto login for returning users
- Logout functionality

✅ **User Profile**
- Display name and phone number
- Profile picture upload
- Online/Offline status
- Last seen timestamp
- Profile editing

✅ **Private Chat**
- Real-time messaging with Firestore
- Message delivery status (sent, delivered, seen)
- Typing indicators
- Message timestamps and date separators
- Emoji support
- Automatic message sync

✅ **Group Chat**
- Create groups with multiple members
- Group profile picture
- Add/remove members
- Group messaging
- Real-time updates
- Member count display

✅ **Contacts**
- Search users by phone number
- Save contacts with custom names
- View saved contacts list
- Delete contacts
- Quick chat from contacts

✅ **Calls**
- One-to-one voice calls
- One-to-one video calls
- Call history
- Mute/unmute microphone
- Toggle camera on/off
- Switch between front/back cameras
- Speaker toggle
- Call duration timer
- Accept/reject incoming calls

✅ **Search**
- Search across chats, contacts, and messages
- Real-time search results
- Filter by conversation type

✅ **Settings**
- Edit user name
- Change profile picture
- View phone number
- Logout

✅ **Security**
- Firestore security rules
- User authentication
- Data encryption in transit
- No password storage

✅ **Offline Support**
- Service Worker integration
- Offline message queuing
- Cache management
- PWA ready

## Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Authentication**: Firebase Authentication (Phone OTP)
- **Database**: Cloud Firestore
- **Storage**: Firebase Storage
- **Hosting**: Vercel / Firebase Hosting
- **Real-time Communication**: WebRTC (for calls)
- **PWA**: Service Worker for offline support

## Project Structure

```
├── index.html          # Main HTML structure
├── style.css           # All styles and animations
├── app.js              # Main app logic and initialization
├── firebase.js         # Firebase configuration and auth
├── database.js         # Firestore database operations
├── chat.js             # Chat functionality
├── group.js            # Group chat features
├── call.js             # Audio/Video call system
├── profile.js          # User profile management
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline support
├── firebase.json       # Firebase deployment config
├── vercel.json         # Vercel deployment config
├── firestore.rules     # Firestore security rules
└── README.md           # This file
```

## Getting Started

### Prerequisites

1. Node.js and npm installed
2. Firebase project created at [firebase.google.com](https://firebase.google.com)
3. Vercel account (for deployment) or Firebase Hosting

### Setup Instructions

#### 1. Clone Repository

```bash
git clone https://github.com/55ashraful/personal-whatsapp.git
cd personal-whatsapp
```

#### 2. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication (Phone)
4. Create a Firestore database (Start in test mode)
5. Enable Storage
6. Get your Firebase config

#### 3. Update Firebase Configuration

Edit `firebase.js` and replace the config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-messaging-sender-id",
  appId: "1:your-app-id:web:your-web-app-id"
};
```

#### 4. Setup Firestore Rules

Go to Firestore > Rules and paste the content from `firestore.rules`

#### 5. Test Locally

Use a local server:

```bash
# Using Python 3
python -m http.server 8000

# Using Node.js
npx http-server
```

Then open http://localhost:8000

### Deployment

#### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

#### Deploy to Firebase Hosting

```bash
# Install Firebase CLI
npm i -g firebase-tools

# Login
firebase login

# Initialize (if not done)
firebase init

# Deploy
firebase deploy
```

## Usage

### First Time Login

1. Enter your phone number with country code
2. Click "Send OTP"
3. Enter the OTP received in your Firebase test account
4. Complete your profile (name and optional photo)
5. Start chatting!

### Starting a Chat

1. Click the "+" button in Chats tab
2. Enter phone number of the user
3. Click "Start Chat"

### Creating a Group

1. Click the "+" button in Groups tab
2. Enter group name
3. Add group photo (optional)
4. Search and add members by phone number
5. Click "Create Group"

### Making Calls

1. Open a private chat
2. Click the phone icon for voice call
3. Click the video icon for video call
4. Accept the incoming call when prompted

## Database Structure

### Users Collection
```
users/
  {userId}/
    uid: string
    phoneNumber: string
    displayName: string
    photoURL: string
    isOnline: boolean
    lastSeen: timestamp
    createdAt: timestamp
    updatedAt: timestamp
```

### Chats Collection
```
chats/
  {chatId}/
    participants: array[string]
    lastMessage: string
    lastMessageTime: timestamp
    createdAt: timestamp
    updatedAt: timestamp
    messages/
      {messageId}/
        senderId: string
        content: string
        timestamp: timestamp
        seen: boolean
        seenBy: array[string]
```

### Groups Collection
```
groups/
  {groupId}/
    name: string
    photoURL: string
    members: array[string]
    admins: array[string]
    createdBy: string
    createdAt: timestamp
    updatedAt: timestamp
    messages/
      {messageId}/
        senderId: string
        senderName: string
        senderAvatar: string
        content: string
        timestamp: timestamp
```

## Security Considerations

1. **Authentication**: Phone-based OTP authentication
2. **Firestore Rules**: Strict rules limiting access to user's own data
3. **HTTPS**: All data transmitted via HTTPS
4. **No Passwords**: Uses Firebase Phone Auth (no password vulnerabilities)
5. **User Isolation**: Each user can only access their own data

## Browser Support

- Chrome/Chromium (Latest)
- Firefox (Latest)
- Safari (Latest)
- Edge (Latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Offline Support

The app uses Service Workers for:
- Offline functionality
- Cache management
- Background sync
- Push notifications

## API Rate Limits

- Firestore: 50k reads/writes per day (free tier)
- Firebase Storage: 5GB/month (free tier)
- Phone Auth: Limited by Firebase quotas

## Troubleshooting

### OTP Not Received
- Make sure to use Firebase test phone numbers in development
- Check Firebase Console > Authentication > Phone numbers

### Messages Not Syncing
- Verify Firestore rules are properly set
- Check network connection
- Clear browser cache and reload

### Calls Not Working
- Check camera/microphone permissions
- Ensure WebRTC is supported in your browser
- Check TURN server connectivity

## Future Enhancements

- [ ] Message reactions
- [ ] File sharing
- [ ] Voice messages
- [ ] Message forwarding
- [ ] Message search in chats
- [ ] Group call support
- [ ] Message encryption
- [ ] Voice notes
- [ ] Status updates
- [ ] Payment integration

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use for commercial or personal projects

## Support

For issues and questions:
1. Check troubleshooting section
2. Review Firebase documentation
3. Check browser console for errors
4. Visit [GitHub Issues](https://github.com/55ashraful/personal-whatsapp/issues)

## Author

**55ashraful** - Personal WhatsApp Developer

---

**Happy Chatting! 🚀**
