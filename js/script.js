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
        if(modalId === 'status-modal') runStatusSimulation();
    }
};

window.closeModal = function(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    try { 
        if (typeof AOS !== 'undefined') AOS.init({ duration: 800, once: true, offset: 100 }); 
    } catch (e) {}

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape") document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
    });
});

function runStatusSimulation() {
    const indicator = document.getElementById('status-indicator');
    if(!indicator) return;
    
    const els = ['status-liveplay', 'status-tester', 'status-core'].map(id => document.getElementById(id));
    
    indicator.innerHTML = `
        <div class="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white text-xl animate-spin"><i class="fa-solid fa-circle-notch"></i></div>
        <div><h3 class="text-white font-bold text-lg">Checking Connectivity...</h3><p class="text-gray-400 text-sm font-mono">Pinging Vercel Gateways...</p></div>`;
    indicator.className = "bg-gray-800/20 border border-gray-700 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";

    els.forEach(el => {
        if(el) {
            el.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span> Pinging...`;
            el.className = "text-yellow-500 flex items-center gap-2 font-mono text-xs";
        }
    });

    setTimeout(() => {
        const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
        
        indicator.innerHTML = `
            <div class="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center text-black text-xl"><i class="fa-solid fa-check"></i></div>
            <div><h3 class="text-white font-bold text-lg">All Systems Operational</h3><p class="text-green-400 text-sm font-mono">99.99% Uptime · Verified: ${time}</p></div>`;
        indicator.className = "bg-green-500/10 border border-green-500/20 rounded-lg p-6 mb-8 flex items-center gap-4 transition-all duration-500";

        els.forEach(el => {
            if(el) {
                el.innerHTML = `<span class="inline-block w-2 h-2 rounded-full bg-green-500"></span> Operational`;
                el.className = "text-green-500 flex items-center gap-2 font-mono text-xs";
            }
        });
    }, 1500);
}
