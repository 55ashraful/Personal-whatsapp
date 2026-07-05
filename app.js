// UI Elements
const loadingScreen = document.getElementById('loadingScreen');
const authContainer = document.getElementById('authContainer');
const mainApp = document.getElementById('mainApp');
const phoneLoginSection = document.getElementById('phoneLoginSection');
const profileSetupSection = document.getElementById('profileSetupSection');

// লোডিং স্ক্রিন সরানোর ফাংশন
window.initializeApp = function() {
    if(loadingScreen) loadingScreen.classList.add('hidden');
    if(authContainer) authContainer.classList.add('hidden');
    if(mainApp) mainApp.classList.remove('hidden');
    console.log("App Started!");
};

// লগইন স্ক্রিন দেখানোর ফাংশন
window.showAuthUI = function() {
    if(loadingScreen) loadingScreen.classList.add('hidden');
    if(mainApp) mainApp.classList.add('hidden');
    if(authContainer) authContainer.classList.remove('hidden');
    if(phoneLoginSection) {
        phoneLoginSection.classList.remove('hidden');
        phoneLoginSection.classList.add('active');
    }
    console.log("Please Login");
};

// প্রোফাইল সেটআপ স্ক্রিন দেখানোর ফাংশন
window.showProfileSetup = function() {
    if(loadingScreen) loadingScreen.classList.add('hidden');
    if(authContainer) authContainer.classList.remove('hidden');
    if(phoneLoginSection) phoneLoginSection.classList.add('hidden');
    if(profileSetupSection) {
        profileSetupSection.classList.remove('hidden');
        profileSetupSection.classList.add('active');
    }
};

// ট্যাব পরিবর্তনের লজিক (Chats, Contacts, Groups)
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        const targetTab = document.getElementById(tabName + 'Tab');
        if(targetTab) targetTab.classList.remove('hidden');
        btn.classList.add('active');
    });
});
