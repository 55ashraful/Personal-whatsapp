// Safe Element Selector Function
const getEl = (id) => document.getElementById(id);

window.initializeApp = function() {
    console.log("Attempting to Initialize App...");
    const loader = getEl('loadingScreen');
    const main = getEl('mainApp');
    const auth = getEl('authContainer');

    if (loader) loader.classList.add('hidden');
    if (auth) auth.classList.add('hidden');
    if (main) main.classList.remove('hidden');
    console.log("App Started Successfully!");
};

window.showAuthUI = function() {
    console.log("Attempting to show Auth UI...");
    const loader = getEl('loadingScreen');
    const auth = getEl('authContainer');
    const main = getEl('mainApp');

    if (loader) loader.classList.add('hidden');
    if (main) main.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
    
    const phoneSection = getEl('phoneLoginSection');
    if (phoneSection) {
        phoneSection.classList.remove('hidden');
        phoneSection.classList.add('active');
    }
};

window.showProfileSetup = function() {
    const loader = getEl('loadingScreen');
    const auth = getEl('authContainer');
    if (loader) loader.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
    
    const phoneSection = getEl('phoneLoginSection');
    const profileSection = getEl('profileSetupSection');
    if (phoneSection) phoneSection.classList.add('hidden');
    if (profileSection) {
        profileSection.classList.remove('hidden');
        profileSection.classList.add('active');
    }
};

// Tab switching with error protection
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.getAttribute('data-tab');
        document.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        
        const targetTab = getEl(tabName + 'Tab');
        if (targetTab) targetTab.classList.remove('hidden');
        btn.classList.add('active');
    });
});
