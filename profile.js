// Profile Management Functions

// Initialize Profile UI
function initializeProfileUI() {
    setupProfileEventListeners();
    loadUserProfile();
}

// Setup Profile Event Listeners
function setupProfileEventListeners() {
    document.getElementById('uploadProfileBtn').addEventListener('click', triggerProfilePictureUpload);
    document.getElementById('profilePictureInput').addEventListener('change', handleProfilePictureChange);
    document.getElementById('completeProfileBtn').addEventListener('click', completeProfile);
    document.getElementById('settingsBtn').addEventListener('click', openSettingsModal);
    document.getElementById('updateNameBtn').addEventListener('click', updateUserName);
    document.getElementById('updatePhotoBtn').addEventListener('click', updateUserPhoto);
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
}

// Show Profile Setup
function showProfileSetup() {
    document.getElementById('loadingScreen').classList.add('hidden');
    document.getElementById('authContainer').classList.remove('hidden');
    document.getElementById('phoneLoginSection').classList.remove('active');
    document.getElementById('profileSetupSection').classList.add('active');
}

// Trigger Profile Picture Upload
function triggerProfilePictureUpload() {
    document.getElementById('profilePictureInput').click();
}

// Handle Profile Picture Change
async function handleProfilePictureChange(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const reader = new FileReader();
        reader.onload = (event) => {
            document.getElementById('profilePreview').src = event.target.result;
        };
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error handling profile picture:', error);
    }
}

// Complete Profile
async function completeProfile() {
    const name = document.getElementById('userName').value.trim();
    const fileInput = document.getElementById('profilePictureInput');
    const errorDiv = document.getElementById('profileErrorMsg');

    errorDiv.classList.add('hidden');

    if (!name) {
        showError('Please enter your name', errorDiv);
        return;
    }

    if (name.length < 2) {
        showError('Name must be at least 2 characters', errorDiv);
        return;
    }

    try {
        let photoURL = null;

        // Upload profile picture if provided
        if (fileInput.files.length > 0) {
            photoURL = await firebaseAuth.uploadImage(fileInput.files[0], 'profile');
        }

        // Create user profile
        await firebaseAuth.createUserProfile(name, photoURL);
        
        // Hide auth and show main app
        document.getElementById('authContainer').classList.add('hidden');
        document.getElementById('mainApp').classList.remove('hidden');
        
        // Initialize app
        initializeApp();
    } catch (error) {
        console.error('Error completing profile:', error);
        showError('Failed to complete profile. ' + error.message, errorDiv);
    }
}

// Load User Profile
async function loadUserProfile() {
    try {
        if (!currentUserData) return;

        document.getElementById('settingsNameInput').value = currentUserData.displayName || '';
        document.getElementById('settingsPhoneDisplay').textContent = currentUserData.phoneNumber || '';
    } catch (error) {
        console.error('Error loading user profile:', error);
    }
}

// Open Settings Modal
function openSettingsModal() {
    loadUserProfile();
    document.getElementById('settingsModal').classList.remove('hidden');
}

// Update User Name
async function updateUserName() {
    const newName = document.getElementById('settingsNameInput').value.trim();

    if (!newName || newName.length < 2) {
        showError('Name must be at least 2 characters');
        return;
    }

    try {
        await firebaseAuth.updateUserProfile({ displayName: newName });
        showSuccess('Name updated successfully');
    } catch (error) {
        console.error('Error updating name:', error);
        showError('Failed to update name');
    }
}

// Update User Photo
async function updateUserPhoto() {
    const fileInput = document.getElementById('settingsPhotoInput');

    if (!fileInput.files.length) {
        showError('Please select a photo');
        return;
    }

    try {
        const photoURL = await firebaseAuth.uploadImage(fileInput.files[0], 'profile');
        await firebaseAuth.updateUserProfile({ photoURL });
        fileInput.value = '';
        showSuccess('Photo updated successfully');
    } catch (error) {
        console.error('Error updating photo:', error);
        showError('Failed to update photo');
    }
}

// Handle Logout
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await firebaseAuth.logout();
            location.reload();
        } catch (error) {
            console.error('Error logging out:', error);
            showError('Failed to logout');
        }
    }
}

// Export for use in other files
window.profile_operations = {
    initializeProfileUI,
    showProfileSetup
};
