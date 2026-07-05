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
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Services - এদেরকে window অবজেক্টে রাখা হয়েছে যাতে অন্য ফাইল (database.js) এদের খুঁজে পায়
window.auth = firebase.auth();
window.db = firebase.firestore();
window.storage = firebase.storage();

// শর্টকাট রেফারেন্স (এই ফাইলের ভেতর ব্যবহারের জন্য)
const auth = window.auth;
const db = window.db;

// Global Variables
window.currentUser = null;
window.currentUserData = null;

// Listen to Auth State (এই ফাংশনটি লোডিং স্ক্রিন সরাবে)
auth.onAuthStateChanged(async (user) => {
    console.log('Auth state changed:', user ? user.uid : 'No user');
    try {
        if (user) {
            window.currentUser = user;
            const userData = await getUserProfile(user.uid);
            if (userData) {
                window.currentUserData = userData;
                if (typeof window.initializeApp === 'function') {
                    window.initializeApp();
                }
            } else {
                if (typeof window.showProfileSetup === 'function') {
                    window.showProfileSetup();
                }
            }
        } else {
            if (typeof window.showAuthUI === 'function') {
                window.showAuthUI();
            }
        }
    } catch (error) {
        console.error("Auth process error:", error);
        // এরর হলেও যেন ইউজার লগইন স্ক্রিন দেখতে পায়
        if (typeof window.showAuthUI === 'function') {
            window.showAuthUI();
        }
    }
});

// Profile helper function
async function getUserProfile(uid) {
    try {
        const doc = await db.collection('users').doc(uid).get();
        return doc.exists ? doc.data() : null;
    } catch (e) { 
        console.error("Error fetching profile:", e);
        return null; 
    }
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
} catch (e) {
    console.warn("Messaging not supported in this browser.");
}

// Global Export
window.firebaseAuth = {
    getUserProfile
};
