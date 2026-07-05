// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDVavo9JjW3HmmTU2U78w5w6FJPTiuIipo",
    authDomain: "personal-call-659a4.firebaseapp.com",
    databaseURL: "https://personal-call-659a4-default-rtdb.firebaseio.com",
    projectId: "personal-call-659a4",
    storageBucket: "personal-call-659a4.firebasestorage.app",
    messagingSenderId: "855478489325",
    appId: "1:855478489325:web:3df677bfc5cb5c2e5efce4",
    measurementId: "G-K4CV4TGZJN"
};

// ZEGO Configuration
const ZEGO_APP_ID = 2112042448;
const ZEGO_SERVER_SECRET = ""; 

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Services (Safe Initialization)
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
let messaging;

try {
    // কিছু ব্রাউজারে মেসেজিং সাপোর্ট করে না, তাই এটি try-catch এ রাখা ভালো
    messaging = firebase.messaging();
} catch (e) {
    console.log("Firebase Messaging not supported in this browser.");
}

// Global Variables
let currentUser = null;
let currentUserData = null;
let recaptchaVerifier = null;

// Listen to Auth State (এটিই লোডিং স্ক্রিন সরানোর জন্য দায়ী)
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    
    try {
        if (user) {
            currentUser = user;
            const userData = await getUserProfile(user.uid);
            
            if (userData) {
                currentUserData = userData;
                if(typeof window.initializeApp === 'function') window.initializeApp();
            } else {
                if(typeof window.showProfileSetup === 'function') window.showProfileSetup();
            }
        } else {
            if(typeof window.showAuthUI === 'function') window.showAuthUI();
        }
    } catch (error) {
        console.error("Error in Auth State Change:", error);
        // এরর হলেও যেন ইউজার লগইন স্ক্রিন দেখতে পায়
        if(typeof window.showAuthUI === 'function') window.showAuthUI();
    }
});

// --- বাকি সব ফাংশন আগের মতোই থাকবে ---

async function sendOTP(phoneNumber) {
    try {
        if (!recaptchaVerifier) setupRecaptcha();
        const confirmationResult = await auth.signInWithPhoneNumber(phoneNumber, recaptchaVerifier);
        window.confirmationResult = confirmationResult;
        return confirmationResult;
    } catch (error) { console.error('OTP error:', error); throw error; }
}

async function verifyOTP(code) {
    try {
        const result = await window.confirmationResult.confirm(code);
        currentUser = result.user;
        return result.user;
    } catch (error) { throw error; }
}

async function getUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (error) { return null; }
}

// প্রোফাইল তৈরির সময় default avatar ফাংশন কল করা নিশ্চিত করুন
async function createUserProfile(name, photoURL = null) {
    try {
        const userRef = db.collection('users').doc(currentUser.uid);
        const userData = {
            uid: currentUser.uid,
            phoneNumber: currentUser.phoneNumber,
            displayName: name,
            photoURL: photoURL || getDefaultAvatar(name),
            createdAt: new Date(),
            isOnline: true
        };
        await userRef.set(userData);
        currentUserData = userData;
        return userData;
    } catch (error) { throw error; }
}

function getDefaultAvatar(name) {
    const color = '#075E54';
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='${encodeURIComponent(color)}' width='100' height='100'/%3E%3Ctext x='50' y='65' font-size='40' fill='white' text-anchor='middle'%3E${name.charAt(0).toUpperCase()}%3C/text%3E%3C/svg%3E`;
}

function setupRecaptcha() {
    if (!recaptchaVerifier) {
        recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptchaContainer', { 'size': 'invisible' });
    }
}

// Export for window
window.firebaseAuth = { sendOTP, verifyOTP, createUserProfile, getUserProfile };
