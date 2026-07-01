// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxxx_YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-messaging-sender-id",
    appId: "1:your-app-id:web:your-web-app-id"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const messaging = firebase.messaging();

// Initialize Messaging
let notificationPermission = false;
if ('Notification' in window) {
    if (Notification.permission === 'granted') {
        notificationPermission = true;
        initializeMessaging();
    }
}

// Global Variables
let currentUser = null;
let currentUserData = null;
let recaptchaVerifier = null;

// Setup reCAPTCHA verifier
function setupRecaptcha() {
    if (typeof window.RecaptchaVerifier !== 'undefined') {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptchaContainer', {
            'size': 'normal',
            'callback': onRecaptchaSuccess,
            'expired-callback': onRecaptchaExpired
        });
        recaptchaVerifier.render().then(widgetId => {
            console.log('reCAPTCHA rendered:', widgetId);
        }).catch(err => {
            console.error('reCAPTCHA render error:', err);
        });
    }
}

function onRecaptchaSuccess() {
    console.log('reCAPTCHA verified');
}

function onRecaptchaExpired() {
    console.log('reCAPTCHA expired');
    if (recaptchaVerifier) {
        recaptchaVerifier.clear();
        recaptchaVerifier = null;
    }
}

// Phone Authentication Functions
async function sendOTP(phoneNumber) {
    try {
        if (!recaptchaVerifier) {
            setupRecaptcha();
        }

        const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        console.log('OTP sent successfully');
        return confirmationResult;
    } catch (error) {
        console.error('Error sending OTP:', error);
        throw error;
    }
}

async function verifyOTP(code) {
    try {
        if (!window.confirmationResult) {
            throw new Error('Please send OTP first');
        }
        const result = await window.confirmationResult.confirm(code);
        currentUser = result.user;
        console.log('User signed in:', currentUser.uid);
        return result.user;
    } catch (error) {
        console.error('Error verifying OTP:', error);
        throw error;
    }
}

// User Profile Functions
async function createUserProfile(name, photoURL = null) {
    try {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const userRef = db.collection('users').doc(currentUser.uid);
        const userData = {
            uid: currentUser.uid,
            phoneNumber: currentUser.phoneNumber,
            displayName: name,
            photoURL: photoURL || getDefaultAvatar(name),
            createdAt: new Date(),
            updatedAt: new Date(),
            lastSeen: new Date(),
            isOnline: true,
            status: 'Hey there! I am using ChatHub'
        };

        await userRef.set(userData);
        currentUserData = userData;
        console.log('User profile created');
        return userData;
    } catch (error) {
        console.error('Error creating user profile:', error);
        throw error;
    }
}

async function getUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        if (doc.exists) {
            return doc.data();
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        throw error;
    }
}

async function updateUserProfile(updates) {
    try {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const userRef = db.collection('users').doc(currentUser.uid);
        updates.updatedAt = new Date();
        await userRef.update(updates);
        
        currentUserData = { ...currentUserData, ...updates };
        console.log('User profile updated');
        return currentUserData;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

// Update Online Status
async function setOnlineStatus(isOnline) {
    try {
        if (!currentUser) return;

        const userRef = db.collection('users').doc(currentUser.uid);
        await userRef.update({
            isOnline: isOnline,
            lastSeen: new Date()
        });
    } catch (error) {
        console.error('Error updating online status:', error);
    }
}

// Upload Image to Storage
async function uploadImage(file, folder = 'profile') {
    try {
        if (!currentUser) {
            throw new Error('User not authenticated');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = storage.ref(`${folder}/${currentUser.uid}/${fileName}`);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        console.log('Image uploaded:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error;
    }
}

// Get Default Avatar
function getDefaultAvatar(name) {
    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
        '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
    ];
    
    const charCode = name.charCodeAt(0);
    const color = colors[charCode % colors.length];
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='${encodeURIComponent(color)}' width='100' height='100'/%3E%3Ctext x='50' y='65' font-size='40' font-weight='bold' fill='white' text-anchor='middle'%3E${encodeURIComponent(name.charAt(0).toUpperCase())}%3C/text%3E%3C/svg%3E`;
}

// Logout
async function logout() {
    try {
        await setOnlineStatus(false);
        await auth.signOut();
        currentUser = null;
        currentUserData = null;
        console.log('User logged out');
    } catch (error) {
        console.error('Error logging out:', error);
        throw error;
    }
}

// Listen to Auth State
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    
    if (user) {
        currentUser = user;
        const userData = await getUserProfile(user.uid);
        
        if (userData) {
            currentUserData = userData;
            initializeApp();
        } else {
            showProfileSetup();
        }
    } else {
        showAuthUI();
    }
});

// Initialize Messaging
function initializeMessaging() {
    try {
        messaging.onMessage((payload) => {
            console.log('Message received:', payload);
            
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification(payload.notification?.title || 'ChatHub', {
                    body: payload.notification?.body,
                    icon: payload.notification?.icon
                });
            }
        });

        messaging.getToken().then(token => {
            if (token) {
                console.log('FCM Token:', token);
            }
        });
    } catch (error) {
        console.error('Error initializing messaging:', error);
    }
}

// Request Notification Permission
async function requestNotificationPermission() {
    try {
        if ('Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notificationPermission = true;
                initializeMessaging();
            }
        }
    } catch (error) {
        console.error('Error requesting notification permission:', error);
    }
}

// Show Notification
function showNotification(title, options = {}) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            icon: '/icon.png',
            ...options
        });
    }
}

// Export for use in other files
window.firebaseAuth = {
    sendOTP,
    verifyOTP,
    logout,
    createUserProfile,
    getUserProfile,
    updateUserProfile,
    uploadImage,
    setOnlineStatus,
    requestNotificationPermission,
    showNotification
};
