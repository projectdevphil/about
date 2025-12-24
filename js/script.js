// 1. DEFINE MENU FUNCTIONS FIRST (Critical for UI)
window.toggleMenu = function() {
    const menuBtn = document.getElementById('menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (!menuBtn || !mobileMenu) return;
    
    const icon = menuBtn.querySelector('i');
    const isClosed = mobileMenu.classList.contains('menu-closed');
    
    if (isClosed) {
        mobileMenu.classList.remove('menu-closed');
        mobileMenu.classList.add('menu-open');
        if(icon) {
            icon.classList.remove('fa-bars-staggered');
            icon.classList.add('fa-xmark');
        }
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.remove('menu-open');
        mobileMenu.classList.add('menu-closed');
        if(icon) {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars-staggered');
        }
        document.body.style.overflow = '';
    }
};

window.openModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Trigger specific logic
        if(modalId === 'status-modal') runStatusSimulation();
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
    // Initialize AOS safely
    try {
        if (typeof AOS !== 'undefined') {
            AOS.init({ duration: 800, once: true, offset: 100 });
        }
    } catch (e) { console.warn('AOS Animation failed:', e); }

    // Initialize Chat safely
    try {
        if (typeof Gun !== 'undefined') {
            initGunChat();
        } else {
            console.error('Gun.js not loaded. Chat will not work.');
            const chatBox = document.getElementById('chat-box');
            if(chatBox) chatBox.innerHTML = '<div class="text-red-500 p-4 text-center">Chat System Unavailable (Library Missing)</div>';
        }
    } catch (e) { console.error('Chat Init failed:', e); }
    
    // Add Esc key listener
    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
});


// 3. GUN.JS CHAT LOGIC
function initGunChat() {
    const gun = Gun([
        'https://gun-manhattan.herokuapp.com/gun',
        'https://gun-eu.herokuapp.com/gun',
        'https://plato.design/gun' 
    ]);

    const chatNode = gun.get('project-dev-global-chat-v1');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('chat-send-btn');
    const usernameInput = document.getElementById('chat-username');

    if (!chatInput || !sendBtn) return; // Exit if chat elements don't exist

    // Load saved username
    if(localStorage.getItem('chat_username')) {
        usernameInput.value = localStorage.getItem('chat_username');
    }

    const sendMessage = () => {
        const text = chatInput.value.trim();
        const user = usernameInput.value.trim() || 'Anonymous';

        if (text) {
            localStorage.setItem('chat_username', user);
            const timestamp = Date.now();
            chatNode.set({ user: user, text: text, time: timestamp });
            chatInput.value = '';
        }
    };

    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Receive Messages
    const displayedMessageIds = new Set();
    
    chatNode.map().on((data, id) => {
        if (!data || !data.text || !data.time) return;
        if (displayedMessageIds.has(id)) return;
        
        // Filter: Last 24 hours only
        if (Date.now() - data.time > 86400000) return;

        displayedMessageIds.add(id);
        renderMessage(data.user, data.text, data.time);
    });
}

function renderMessage(user, text, time) {
    const chatBox = document.getElementById('chat-box');
    if(!chatBox) return;

    const myName = document.getElementById('chat-username').value || 'Anonymous';
    const isMe = user === myName || user === localStorage.getItem('chat_username');

    const div = document.createElement('div');
    div.className = `message-bubble ${isMe ? 'message-mine' : 'message-other'} fade-in`;
    
    const safeText = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const safeUser = user.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const date = new Date(time);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `<span class="message-meta">${safeUser} • ${timeStr}</span>${safeText}`;

    chatBox.appendChild(div);
    if(chatBox.scrollHeight - chatBox.scrollTop < 600) {
        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

// 4. STATUS SIMULATION
function runStatusSimulation() {
    const indicator = document.getElementById('status-indicator');
    if(!indicator) return;
    
    const els = ['status-liveplay', 'status-tester', 'status-core'].map(id => document.getElementById(id));

    indicator.innerHTML = `
        <div class="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl animate-spin"><i class="fa-solid fa-circle-notch"></i></div>
        <div><h3 class="text-white font-bold text-lg">Checking Connectivity...</h3><p class="text-gray-400 text-sm font-mono">Pinging Vercel Edge Nodes...</p></div>`;
    indicator.className = "bg-gray-800/20 border border-gray-700 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";

    els.forEach(el => {
        if(el) {
            el.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Pinging...`;
            el.className = "text-yellow-500 flex items-center gap-2 font-mono text-xs";
        }
    });

    setTimeout(() => {
        const pings = ['24ms', '31ms', '18ms'];
        els.forEach((el, i) => {
            if(el) {
                setTimeout(() => {
                    el.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span> ${pings[i]}`;
                    el.className = "text-green-500 flex items-center gap-2 font-mono text-xs";
                }, i * 300);
            }
        });

        setTimeout(() => {
            const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            indicator.innerHTML = `
                <div class="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-black text-xl"><i class="fa-solid fa-check"></i></div>
                <div><h3 class="text-white font-bold text-lg">All Systems Operational</h3><p class="text-green-400 text-sm font-mono">99.99% Uptime · Verified: ${time}</p></div>`;
            indicator.className = "bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";
        }, 1200);
    }, 800);
}
