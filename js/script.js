// 1. MENU & UI FUNCTIONS
window.toggleMenu = function() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (!menuBtn || !mobileMenu) return;
    
    const icon = menuBtn.querySelector('i');
    const isClosed = mobileMenu.classList.contains('menu-closed');
    
    if (isClosed) {
        mobileMenu.classList.remove('menu-closed');
        mobileMenu.classList.add('menu-open');
        if(icon) { icon.classList.remove('fa-bars-staggered'); icon.classList.add('fa-xmark'); }
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.remove('menu-open');
        mobileMenu.classList.add('menu-closed');
        if(icon) { icon.classList.remove('fa-xmark'); icon.classList.add('fa-bars-staggered'); }
        document.body.style.overflow = '';
    }
};

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        if(modalId === 'status-modal') runStatusSimulation();
        // Auto scroll chat to bottom
        if(modalId === 'community-modal') {
             const box = document.getElementById('chat-box');
             if(box) setTimeout(() => box.scrollTop = box.scrollHeight, 100);
        }
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

// 2. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    try { if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 100 }); } catch (e) {}
    try { if (typeof Gun !== 'undefined') initGunChat(); } catch (e) { console.error('Gun Missing', e); }
    
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
});

// 3. FIXED CHAT LOGIC (Instant Send)
function initGunChat() {
    // Connect to faster relays
    const gun = Gun({
        peers: [
            'https://gun-manhattan.herokuapp.com/gun',
            'https://plato.design/gun'
        ]
    });

    const chatNode = gun.get('project-dev-chat-v2'); // Changed ID to start fresh
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const usernameInput = document.getElementById('chat-username');
    const displayedMessageIds = new Set();

    if (!chatInput || !sendBtn) return;

    // Load saved username
    if(localStorage.getItem('chat_username')) {
        usernameInput.value = localStorage.getItem('chat_username');
    }

    const sendMessage = () => {
        const text = chatInput.value.trim();
        const user = usernameInput.value.trim() || 'Anonymous';

        if (text) {
            console.log("Sending message:", text); // Debug log
            localStorage.setItem('chat_username', user);
            const timestamp = Date.now();
            
            // 1. SHOW IT INSTANTLY (Optimistic UI)
            // We verify if we already showed it to prevent duplicates
            const msgId = `${user}-${timestamp}`;
            if(!displayedMessageIds.has(msgId)) {
                displayedMessageIds.add(msgId);
                renderMessage(user, text, timestamp, true); // true = isMine
            }

            // 2. SEND TO SERVER
            chatNode.set({ 
                id: msgId,
                user: user, 
                text: text, 
                time: timestamp 
            });

            chatInput.value = '';
            chatInput.focus();
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Receive Messages from Others
    chatNode.map().on((data) => {
        if (!data || !data.text || !data.time) return;
        
        // Filter old messages (24h)
        if (Date.now() - data.time > 86400000) return;
        
        // Prevent duplicates (especially our own)
        const msgId = data.id || `${data.user}-${data.time}`;
        if (displayedMessageIds.has(msgId)) return;

        displayedMessageIds.add(msgId);
        
        // Render
        renderMessage(data.user, data.text, data.time, false);
    });
}

function renderMessage(user, text, time, forceMine) {
    const chatBox = document.getElementById('chat-box');
    if(!chatBox) return;

    const myName = document.getElementById('chat-username').value || 'Anonymous';
    // Check if it's me based on name or the force flag
    const isMe = forceMine || user === myName || user === localStorage.getItem('chat_username');

    const div = document.createElement('div');
    div.className = `message-bubble ${isMe ? 'message-mine' : 'message-other'} fade-in`;
    
    // Sanitize
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeUser = user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const date = new Date(time);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `<span class="message-meta">${safeUser} • ${timeStr}</span>${safeText}`;

    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// 4. STATUS SIMULATION (Keep existing)
function runStatusSimulation() {
    const indicator = document.getElementById('status-indicator');
    if(!indicator) return;
    // ... (Your existing status code logic here, omitted for brevity) ...
    // Copy the previous status function if you need it again, or let me know.
    const els = ['status-liveplay', 'status-tester', 'status-core'].map(id => document.getElementById(id));
    indicator.innerHTML = `<div class="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl animate-spin"><i class="fa-solid fa-circle-notch"></i></div><div><h3 class="text-white font-bold text-lg">Checking...</h3></div>`;
    
    setTimeout(() => {
        indicator.innerHTML = `<div class="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-black text-xl"><i class="fa-solid fa-check"></i></div><div><h3 class="text-white font-bold text-lg">Operational</h3></div>`;
        els.forEach(el => { if(el) { el.innerHTML = "Operational"; el.className = "text-green-500 text-xs"; } });
    }, 1500);
}
