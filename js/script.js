// Initialize AOS Animation
document.addEventListener('DOMContentLoaded', () => {
    AOS.init({ 
        duration: 800, 
        once: true, 
        offset: 100, 
        easing: 'cubic-bezier(0.25, 1, 0.5, 1)' 
    });
});

// Mobile Menu Logic
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const icon = menuBtn ? menuBtn.querySelector('i') : null;
let isMenuOpen = false;

function toggleMenu() {
    if (!menuBtn || !mobileMenu) return;
    
    isMenuOpen = !isMenuOpen;
    if (isMenuOpen) {
        mobileMenu.classList.remove('menu-closed');
        mobileMenu.classList.add('menu-open');
        icon.classList.remove('fa-bars-staggered');
        icon.classList.add('fa-xmark');
        document.body.style.overflow = 'hidden';
    } else {
        mobileMenu.classList.remove('menu-open');
        mobileMenu.classList.add('menu-closed');
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars-staggered');
        document.body.style.overflow = '';
    }
}

if (menuBtn) {
    menuBtn.addEventListener('click', toggleMenu);
}

// Modal Logic
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Trigger Real-time simulation if it's the status modal
        if (modalId === 'status-modal') {
            runStatusSimulation();
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modals on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === "Escape") {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

// Disable Right Click
document.addEventListener('contextmenu', function(e) {
    e.preventDefault();
});

// --- REAL TIME STATUS SIMULATION ---

function runStatusSimulation() {
    // Reset UI to "Checking" state
    const indicator = document.getElementById('status-indicator');
    const liveplayStatus = document.getElementById('status-liveplay');
    const testerStatus = document.getElementById('status-tester');
    const coreStatus = document.getElementById('status-core');

    // Reset Visuals
    indicator.className = "bg-gray-800/20 border border-gray-700 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";
    indicator.innerHTML = `
        <div class="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl animate-spin"><i class="fa-solid fa-circle-notch"></i></div>
        <div>
            <h3 class="text-white font-bold text-lg">Establishing Connection...</h3>
            <p class="text-gray-400 text-sm font-mono">Pinging Vercel Edge Nodes...</p>
        </div>
    `;

    [liveplayStatus, testerStatus, coreStatus].forEach(el => {
        el.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Pinging...`;
        el.className = "text-yellow-500 flex items-center gap-2 font-mono text-xs";
    });

    // Simulate Network Latency
    setTimeout(() => {
        // Step 1: Services found
        liveplayStatus.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span> 24ms`;
        liveplayStatus.className = "text-green-500 flex items-center gap-2 font-mono text-xs";
        
        setTimeout(() => {
            testerStatus.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span> 31ms`;
            testerStatus.className = "text-green-500 flex items-center gap-2 font-mono text-xs";
        }, 400);

        setTimeout(() => {
            coreStatus.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span> 18ms`;
            coreStatus.className = "text-green-500 flex items-center gap-2 font-mono text-xs";
        }, 800);

        // Step 2: Main Status Success
        setTimeout(() => {
            const now = new Date();
            const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            indicator.className = "bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";
            indicator.innerHTML = `
                <div class="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-black text-xl"><i class="fa-solid fa-check"></i></div>
                <div>
                    <h3 class="text-white font-bold text-lg">All Systems Operational</h3>
                    <p class="text-green-400 text-sm font-mono">99.99% Uptime · Verified: ${timeString}</p>
                </div>
            `;
        }, 1500);

    }, 800);
}
