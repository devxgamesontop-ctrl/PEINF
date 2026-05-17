/**
 * PEINF Animations Engine
 * Created by @coderhorror
 */

const AnimationEngine = {
    init() {
        this.injectStyles();
        this.observeElements();
        this.initStickyNav();
        this.initTilt();
        this.initDarkMode();
        window.AnimationEngine = this; // Ensure global access
        console.log("PEINF Animation Engine Initialized");
    },

    injectStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            * {
                font-family: 'Fredoka', sans-serif !important;
            }

            body {
                max-width: 100%;
                overflow-x: hidden;
                background-color: #f8fafc !important;
            }

            /* Transparent backgrounds for listing items (Blogs/Battles) before click */
            article, .tilt-card:not(.pet-card), .featured-image-container {
                background-color: transparent !important;
                background: transparent !important;
                backdrop-filter: none !important;
                border: none !important;
                box-shadow: none !important;
            }

            /* Global Glassmorphism & Border Fixes */
            header {
                background-color: rgba(255, 255, 255, 0.5) !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
                backdrop-filter: blur(20px) !important;
                -webkit-backdrop-filter: blur(20px) !important;
            }

            .bg-white, 
            .pet-card,
            .modal-active .bg-white,
            .modal-content-sigma-animate {
                background-color: #ffffff !important;
                border-color: rgba(0, 0, 0, 0.1) !important;
            }

            /* Dark Mode Black Backgrounds */
            .dark-mode body, 
            .dark-mode .mesh-bg, 
            .dark-mode header, 
            .dark-mode .bg-white, 
            .dark-mode .pet-card, 
            .dark-mode .modal-content-sigma-animate,
            .dark-mode [class*="bg-slate-"], 
            .dark-mode [class*="bg-gray-"],
            .dark-mode [class*="bg-indigo-50"],
            .dark-mode .bg-slate-50, .dark-mode .bg-slate-100 {
                background-color: #000000 !important;
            }

            /* Modal Positioning Fix - Locked to Viewport Center */
            .modal-active {
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                width: 100vw !important;
                height: 100vh !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                z-index: 10000 !important;
                background-color: rgba(0, 0, 0, 0.8) !important; /* Dark overlay for modals */
            }

            /* FORCE WHITE LINES ON EVERYTHING IN DARK MODE */
            .dark-mode [class*="border"], 
            .dark-mode div, 
            .dark-mode header, 
            .dark-mode footer,
            .dark-mode nav, 
            .dark-mode section,
            .dark-mode button,
            .dark-mode input {
                border-color: rgba(255, 255, 255, 0.25) !important;
            }

            /* Text Visibility in Dark Mode */
            .dark-mode .text-slate-900, .dark-mode h1, .dark-mode h2, .dark-mode h3, .dark-mode h4, .dark-mode .text-black { 
                color: #ffffff !important; 
            }
            .dark-mode .text-slate-500, .dark-mode .text-slate-400, .dark-mode .text-slate-600, .dark-mode .text-slate-700, .dark-mode .fill-black { 
                color: #ffffff !important; 
                fill: #ffffff !important;
            }

            /* Input and Select Backgrounds in Dark Mode */
            .dark-mode input, .dark-mode select {
                background-color: #000000 !important;
                color: #ffffff !important;
            }

            /* Trade Verdict Glow & Meter Track Fix */
            .dark-mode #verdictText {
                text-shadow: 0 0 20px currentColor !important;
            }

            /* Remove grey from 'F' (empty state) */
            .dark-mode #verdictText.opacity-10 {
                opacity: 0.5 !important;
            }

            /* Trade Calculator Overlays & Specific Shades */
            .dark-mode .absolute.bg-white\\/40 {
                background-color: rgba(0, 0, 0, 0.7) !important;
            }

            /* Dark Mode Scrollbar - Black Theme */
            .dark-mode::-webkit-scrollbar-track, .dark-mode ::-webkit-scrollbar-track { background: #000000; }
            .dark-mode::-webkit-scrollbar-thumb, .dark-mode ::-webkit-scrollbar-thumb { 
                background: #1a1a1a; 
                border-color: #000000;
            }

            .lock-scroll { 
                overflow: hidden !important;
                touch-action: none;
            }

            /* Custom Sleek Scrollbar */
            ::-webkit-scrollbar { width: 8px; }
            ::-webkit-scrollbar-track { background: #f8fafc; }
            ::-webkit-scrollbar-thumb { 
                background: #e2e8f0; 
                border-radius: 10px;
                border: 2px solid #f8fafc;
            }
            ::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }

            .reveal {
                opacity: 0;
                transform: translateY(50px) scale(0.95) rotateX(-10deg);
                transition: all 0.7s cubic-bezier(0.15, 0.85, 0.35, 1.1);
                will-change: transform, opacity;
            }
            .reveal-visible {
                opacity: 1 !important;
                transform: translateY(0) scale(1) rotateX(0deg) !important;
            }

            /* Sigma Sharp Shine Effect */
            .shine-effect {
                position: relative;
                overflow: hidden;
            }
            .shine-effect::after {
                content: '';
                position: absolute;
                top: -50%;
                left: -150%;
                width: 20%; /* Narrower for a sharper look */
                height: 200%;
                background: rgba(255, 255, 255, 0.4); /* Solid white flash, no gradient fade */
                transform: rotate(30deg);
                pointer-events: none;
                z-index: 10;
            }
            .shine-effect:hover::after {
                left: 150%;
                transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
            }

            /* Force Clan Battles link visibility */
            .clan-battles-nav-link {
                display: inline-block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }

            .dark-mode .shine-effect::after {
                display: none !important;
            }
            
            /* Sigma Text Reveal */
            .text-reveal {
                display: inline-block;
                overflow: hidden;
                vertical-align: bottom;
            }
            .text-reveal-content {
                display: inline-block;
                transform: translateY(100%);
                animation: textSlideUp 0.8s cubic-bezier(0.2, 1, 0.3, 1) forwards;
            }
            @keyframes textSlideUp { to { transform: translateY(0); } }
            
            /* Modal Core Logic */
            .modal-active {
                position: fixed !important;
                inset: 0 !important;
                width: 100% !important;
                height: 100% !important;
                opacity: 1 !important;
                visibility: visible !important;
                pointer-events: auto !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                transition: opacity 0.2s ease, visibility 0.2s ease;
                z-index: 10000 !important;
            }

            /* Luxury Navigation Links */
            .nav-link { position: relative; }
            .dark-mode .nav-link {
                color: #e2e8f0 !important;
            }
            .dark-mode .nav-link:hover { color: #818cf8 !important; }

            /* Animated Mesh Background */
            .mesh-bg {
                display: none !important;
            }

            /* Sticky Nav - Solid White */
            .glass-nav {
                background: #ffffff !important;
                background-color: #ffffff !important;
                opacity: 1 !important;
            }

            /* Reading Progress Bar */
            #readingProgress {
                position: fixed;
                top: 0;
                left: 0;
                height: 3px;
                background: #6366f1; /* Solid Indigo */
                z-index: 100;
                transition: width 0.1s ease;
            }

            .modal-content-animate {
                animation: modalSlideUp 0.5s cubic-bezier(0.2, 1, 0.3, 1) forwards;
            }

            @keyframes modalSlideUp {
                from { opacity: 0; transform: translateY(40px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            /* Sigma Modal Content Animation */
            .modal-content-sigma-animate {
                animation: sigmaModalSlideUp 0.3s cubic-bezier(0.2, 1, 0.3, 1) forwards;
            }
            @keyframes sigmaModalSlideUp {
                from { opacity: 0; transform: translateY(10px) scale(0.98); }
                to { opacity: 1; transform: translateY(0) scale(1); }
            }

            @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
            }
            .animate-float { animation: float 6s ease-in-out infinite; }
            
            /* Search Bar Focus Effect */
            .focus-expand input:focus {
                width: 100%;
                border-color: #6366f1;
            }

            /* Hover Lift Luxury */
            .hover-lift {
                transition: transform 0.5s cubic-bezier(0.2, 1, 0.3, 1), border-color 0.5s ease;
            }
            .hover-lift:hover {
                transform: translateY(-12px) scale(1.04);
            }

            /* 3D Tilt */
            .tilt-card {
                transform-style: preserve-3d;
                transition: transform 0.15s ease-out;
            }

            /* Demand Bar Styling */
            .demand-fill {
                background: #6366f1; /* Solid Indigo */
                transition: width 1.2s cubic-bezier(0.2, 1, 0.3, 1);
            }

            @keyframes bounceIn {
                0% { transform: scale(0.3); opacity: 0; }
                50% { transform: scale(1.05); }
                70% { transform: scale(0.9); }
                100% { transform: scale(1); opacity: 1; }
            }
            .animate-pop { animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; } /* For close button */

            /* Pagination Hover */
            .pagination-hover { transition: transform 0.2s ease, background-color 0.2s ease; }
            .pagination-hover:hover:not(:disabled) { transform: translateY(-2px); }
            
            html { scroll-behavior: smooth; }
        `;
        document.head.appendChild(style);
    },

    observer: null,
    observeElements() {
        if (!this.observer) {
            this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal-visible');
                        this.observer.unobserve(entry.target);
                }
            });
            }, { threshold: 0, rootMargin: '50px' });
        }

        document.querySelectorAll('.reveal:not(.reveal-visible)').forEach(el => {
            this.observer.observe(el);
        });
    },

    initTilt() {
        const handleMove = (e) => {
            const el = e.currentTarget;
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const px = x / rect.width;
            const py = y / rect.height;
            const rx = (py - 0.5) * 25; 
            const ry = (px - 0.5) * -25;
            el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.05, 1.05, 1.05)`;
        };

        const handleLeave = (e) => {
            e.currentTarget.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        };

        document.querySelectorAll('.tilt-card').forEach(el => {
            el.removeEventListener('mousemove', handleMove);
            el.removeEventListener('mouseleave', handleLeave);
            el.addEventListener('mousemove', handleMove);
            el.addEventListener('mouseleave', handleLeave);
        });
    },

    toggleDarkMode() {
        document.documentElement.classList.toggle('dark'); // Enable Tailwind dark: utilities
        const isDark = document.documentElement.classList.toggle('dark-mode'); 
        localStorage.setItem('peinf-dark-mode', isDark);
        this.updateModeIcon();
    },

    initDarkMode() {
        const saved = localStorage.getItem('peinf-dark-mode') === 'true';
        if (saved) {
            document.documentElement.classList.add('dark', 'dark-mode');
        }
        this.updateModeIcon();
    },

    updateModeIcon() {
        const btn = document.getElementById('darkModeToggle');
        if (!btn) return;
        
        const isDark = document.documentElement.classList.contains('dark-mode');
        
        // Sun Icon for Dark Mode (to switch to light)
        const sunIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z"></path></svg>`;
        
        // Moon Icon for Light Mode (to switch to dark)
        const moonIcon = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
        
        btn.innerHTML = isDark ? sunIcon : moonIcon;
    },

    initStickyNav() {
        // Scroll-based resizing removed to maintain a consistent navigation height
    },

    refresh() {
        // Small delay ensures DOM is fully painted
        setTimeout(() => {
            this.observeElements();
            this.initTilt();
            console.log("Animations refreshed");
        }, 100);
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    AnimationEngine.init();
});