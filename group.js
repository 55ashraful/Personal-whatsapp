// Group logic
const createGroupSubmitBtn = document.getElementById('createGroupSubmitBtn');
const groupNameInput = document.getElementById('groupNameInput');

async function createGroup() {
    const name = groupNameInput.value.trim();
    if (!name) return;

    try {
        const groupRef = await db.collection('groups').add({
            name: name,
            createdBy: currentUser.uid,
            members: [currentUser.uid],
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        alert("Group Created!");
        // ক্লোজ মডেল লজিক এখানে আসবে
    } catch (error) {
        console.error("Error creating group:", error);
    }
}

if(createGroupSubmitBtn) createGroupSubmitBtn.addEventListener('click', createGroup);
