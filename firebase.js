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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Global Variables
let currentUser = null;
let currentUserData = null;

// Listen to Auth State (এই ফাংশনটি লোডিং স্ক্রিন সরাবে)
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    try {
        if (user) {
            currentUser = user;
            const userData = await getUserProfile(user.uid);
            if (userData) {
                currentUserData = userData;
                if (typeof window.initializeApp === 'function') window.initializeApp();
            } else {
                if (typeof window.showProfileSetup === 'function') window.showProfileSetup();
            }
        } else {
            if (typeof window.showAuthUI === 'function') window.showAuthUI();
        }
    } catch (error) {
        console.error("Auth process error:", error);
        if (typeof window.showAuthUI === 'function') window.showAuthUI();
    }
});

// Profile helper function
async function getUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (e) { return null; }
}

// reCAPTCHA Verifier
window.setupRecaptcha = function() {
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptchaContainer', {
            'size': 'invisible'
        });
    }
};

// Messaging Safe Initialization
try {
    const messaging = firebase.messaging();
    // নোটিফিকেশন কোড এখানে থাকতে পারে, কিন্তু ট্রাই-ক্যাচ এর ভেতর
} catch (e) {
    console.warn("Messaging not supported.");
}
