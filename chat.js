// Chat UI Elements
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');
const chatHeaderName = document.getElementById('chatHeaderName');
const chatView = document.getElementById('chatView');
const noChatSelected = document.getElementById('noChatSelected');

let activeChatId = null;

// মেসেজ পাঠানোর ফাংশন
async function sendMessage() {
    const text = messageInput.value.trim();
    if (!text || !activeChatId) return;

    try {
        await db.collection('messages').add({
            chatId: activeChatId,
            senderId: currentUser.uid,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        messageInput.value = '';
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// চ্যাট লোড করার ফাংশন
function loadMessages(chatId) {
    activeChatId = chatId;
    noChatSelected.classList.add('hidden');
    chatView.classList.remove('hidden');

    db.collection('messages')
        .where('chatId', '==', chatId)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            messagesContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const msg = doc.data();
                displayMessage(msg);
            });
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        });
}

function displayMessage(msg) {
    const div = document.createElement('div');
    div.className = `message ${msg.senderId === currentUser.uid ? 'sent' : 'received'}`;
    div.innerHTML = `<div class="message-content">${msg.text}</div>`;
    messagesContainer.appendChild(div);
}

if(sendBtn) sendBtn.addEventListener('click', sendMessage);
