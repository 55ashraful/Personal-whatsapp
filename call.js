// Call logic
const callBtn = document.getElementById('callBtn');
const videoCallBtn = document.getElementById('videoCallBtn');
const callModal = document.getElementById('callModal');
const endCallBtn = document.getElementById('endCallBtn');

function startCall(type) {
    if(!callModal) return;
    callModal.classList.remove('hidden');
    document.getElementById('callOutgoing').classList.remove('hidden');
    console.log(`Starting ${type} call...`);
}

if(callBtn) callBtn.addEventListener('click', () => startCall('voice'));
if(videoCallBtn) videoCallBtn.addEventListener('click', () => startCall('video'));
if(endCallBtn) endCallBtn.addEventListener('click', () => callModal.classList.add('hidden'));
