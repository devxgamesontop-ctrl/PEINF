/**
 * PEINF Components Engine
 * Refined & Rescripted for stability.
 */

// Ensure global utilities are ready
window.parseValue = window.parseValue || ((s) => {
    if (!s || typeof s !== 'string') return 0;
    const c = s.toUpperCase();
    if (c === 'O/C' || c === 'OC') return 0;
    const v = parseFloat(c);
    if (c.includes('T')) return v * 1e12;
    if (c.includes('B')) return v * 1e9;
    if (c.includes('M')) return v * 1e6;
    if (c.includes('K')) return v * 1e3;
    return v || 0;
});

window.formatValue = window.formatValue || ((v) => {
    if (v >= 1e12) return (v / 1e12).toFixed(2) + 'T';
    if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
    if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
    return v.toLocaleString();
});

const Components = {
    bgMusic: null,

    init() {
        console.log("PEINF: Initializing Components...");
        this.renderHeader();
        this.renderFooter();
        this.renderMobileNav();
        this.initBackgroundMusic();

        // Disable right-click across the entire website
        document.addEventListener('contextmenu', e => e.preventDefault());
    },

    getCurrentPage() {
        return window.location.pathname.split("/").pop() || 'database.html';
    },

    renderHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        header.className = "glass-nav backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[70] bg-white/70 dark:bg-black/70";
        
        const page = this.getCurrentPage();
        const isActive = (p) => page === p;
        const linkClass = (active) => `text-[10px] font-normal uppercase tracking-[0.15em] ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600 transition-colors'}`;

        const robloxUser = JSON.parse(localStorage.getItem('peinf-roblox-user') || 'null');
        const isDb = isActive('database.html');
        
        header.innerHTML = `
            <div class="max-w-[1600px] mx-auto">
                <div class="px-4 py-3 flex justify-between items-center ${isDb ? 'border-b border-slate-100 dark:border-white/5' : ''}">
                    <div class="flex gap-6 items-center">
                        <div class="relative group">
                            <button class="${linkClass(isDb || isActive('market-pulse.html') || isActive('calculator.html'))} flex items-center gap-1 outline-none">
                                ${isActive('calculator.html') ? 'Calculator' : isActive('market-pulse.html') ? 'Pulse' : 'Database'}
                                <svg class="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                            </button>
                            <div class="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] py-2">
                                <a href="database.html" class="block px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Pet Database</a>
                                <a href="market-pulse.html" class="block px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Market Pulse</a>
                                <a href="calculator.html" class="block px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Calculator</a>
                            </div>
                        </div>
                        <a href="blogs.html" class="${linkClass(isActive('blogs.html'))}">Blogs</a>
                        <a href="clan-battles.html" class="${linkClass(isActive('clan-battles.html'))}">Clans</a>
                    </div>
                    <div class="flex gap-6 items-center">
                        ${robloxUser ? `
                            <button onclick="Components.openRobloxModal()" class="relative group">
                                <img src="${robloxUser.avatar}" class="w-6 h-6 rounded-full border border-slate-100 dark:border-white/10">
                                <div class="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></div>
                            </button>
                        ` : `
                            <button onclick="Components.openRobloxModal()" class="px-4 py-1.5 bg-indigo-600 text-white rounded-xl text-[9px] uppercase tracking-widest font-normal hover:bg-indigo-700 transition-all">Connect</button>
                        `}
                        <button onclick="Components.openSettingsModal()" class="text-slate-400 hover:text-indigo-600"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                        <a href="credits.html" class="${linkClass(isActive('credits.html'))}">Credits</a>
                    </div>
                </div>
                ${isDb ? this.getFilterBarHtml() : ''}
            </div>`;
    },

    getFilterBarHtml() {
        return `
            <div class="px-4 py-3 flex items-center justify-between gap-4">
                <div class="flex-grow max-w-xl relative">
                    <input type="text" id="searchInput" placeholder="Search..." class="w-full bg-white dark:bg-black px-5 py-2.5 rounded-full text-sm font-normal text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all border border-slate-200 dark:border-white/15">
                    <button onclick="window.clearSearch()" id="clearSearchBtn" class="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hidden">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
                <div class="flex items-center gap-2">
                    <div class="relative group">
                        <button id="sortDisplay" class="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-500 text-[10px] font-normal uppercase tracking-widest">
                            Highest Value
                            <svg class="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <div class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] py-2">
                            <button onclick="window.setSort('highest', 'Highest Value')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Highest Value</button>
                            <button onclick="window.setSort('lowest', 'Lowest Value')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Lowest Value</button>
                            <button onclick="window.setSort('demand', 'Highest Demand')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">Highest Demand</button>
                        </div>
                    </div>
                    <div class="relative group">
                        <button id="rarityDisplay" class="flex items-center gap-2 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 px-4 py-2.5 rounded-xl text-slate-500 text-[10px] font-normal uppercase tracking-widest">
                            All Rarities
                            <svg class="w-3 h-3 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 9l-7 7-7-7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <div class="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-black border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] py-2">
                            <button onclick="window.setRarity('all', 'All Rarities')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-slate-400 hover:text-indigo-600">All Rarities</button>
                            <button onclick="window.setRarity('inventory', 'My Inventory')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-indigo-500 hover:bg-slate-50">My Inventory</button>
                            <button onclick="window.setRarity('watchlist', 'Watchlist ❤')" class="w-full text-left px-4 py-2 text-[9px] uppercase tracking-widest text-red-400 hover:bg-slate-50">Watchlist ❤</button>
                        </div>
                    </div>
                </div>
            </div>`;
    },

    renderFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        footer.className = "max-w-2xl mx-auto px-6 py-12 border-t border-slate-100 dark:border-white/5 mt-20 text-center";
        footer.innerHTML = `
            <div class="text-slate-400 text-[10px] font-normal uppercase tracking-[0.2em] mb-2">© 2026 Offical PE:INF Website</div>
            <div class="text-slate-400 text-[11px] font-normal">Created by <span class="text-indigo-500">@coderhorror</span></div>`;
    },

    renderMobileNav() {
        const existing = document.getElementById('mobileNav');
        if (existing) existing.remove();

        const nav = document.createElement('nav');
        nav.id = 'mobileNav';
        nav.className = "md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-xl border-t border-slate-100 dark:border-white/10 z-[100] px-6 py-4 flex justify-around items-center";
        
        const page = this.getCurrentPage();
        const icon = (active) => active ? 'text-indigo-600' : 'text-slate-400';
        const label = (active, name) => `<span class="text-[8px] uppercase tracking-widest ${active ? 'text-indigo-600 font-bold' : 'text-slate-400'}">${name}</span>`;

        nav.innerHTML = `
            <a href="database.html" class="flex flex-col items-center gap-1">${label(page==='database.html','DB')}</a>
            <a href="market-pulse.html" class="flex flex-col items-center gap-1">${label(page==='market-pulse.html','Pulse')}</a>
            <a href="calculator.html" class="flex flex-col items-center gap-1">${label(page==='calculator.html','Calc')}</a>
            <a href="blogs.html" class="flex flex-col items-center gap-1">${label(page==='blogs.html','Blogs')}</a>
            <a href="clan-battles.html" class="flex flex-col items-center gap-1">${label(page==='clan-battles.html','Clans')}</a>`;
        document.body.appendChild(nav);
    },

    openSettingsModal() {
        const existing = document.getElementById('settingsModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'settingsModal';
        modal.className = "modal-active";
        modal.innerHTML = `
            <div class="bg-white dark:bg-black w-full max-w-sm rounded-[3rem] border border-slate-100 dark:border-white/20 p-8 relative overflow-hidden animate-pop shadow-2xl">
                <button onclick="Components.closeModal('settingsModal')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <h2 class="text-2xl font-normal text-slate-900 dark:text-white mb-8 tracking-tight text-center">Settings</h2>
                <div class="space-y-4">
                    <div class="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                        <div class="flex items-center justify-between mb-3">
                            <div class="flex flex-col">
                                <span class="text-[10px] uppercase tracking-widest text-slate-400">Audio</span>
                                <span id="volumePercentage" class="text-xs text-indigo-600 mt-1">${Math.round((this.bgMusic?.volume || 0) * 100)}%</span>
                            </div>
                            <button id="musicToggle" onclick="Components.toggleMusic()" class="w-10 h-10 flex items-center justify-center bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-white/20 text-indigo-600 transition-all active:scale-95"></button>
                        </div>
                        <input type="range" min="0" max="100" value="${Math.round((this.bgMusic?.volume || 0) * 100)}" class="w-full h-1.5 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-600" oninput="Components.setVolume(this.value)">
                    </div>
                    <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-white/10">
                        <div class="flex flex-col">
                            <span class="text-[10px] uppercase tracking-widest text-slate-400">Appearance</span>
                            <span class="text-xs text-slate-900 dark:text-white mt-1">Light / Dark Mode</span>
                        </div>
                        <button id="darkModeToggle" onclick="AnimationEngine.toggleDarkMode(); Components.updateSettingsIcons();" class="w-10 h-10 flex items-center justify-center bg-white dark:bg-black rounded-xl border border-slate-100 dark:border-white/20 text-indigo-600 transition-all active:scale-95"></button>
                    </div>
                </div></div>`;
        document.body.appendChild(modal);
        document.body.classList.add('lock-scroll');
        this.updateSettingsIcons();
    },

    closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) modal.remove();
        document.body.classList.remove('lock-scroll');
    },

    setVolume(val) {
        const v = val / 100;
        if (this.bgMusic) this.bgMusic.volume = v;
        localStorage.setItem('peinf-music-volume', val);
        localStorage.setItem('peinf-music-muted', v === 0 ? 'true' : 'false');

        this.updateMusicIcon();
        const disp = document.getElementById('volumePercentage');
        if (disp) disp.textContent = val + '%';
    },

    updateSettingsIcons() {
        this.updateMusicIcon();
        window.AnimationEngine?.updateModeIcon();
    },

    openRobloxModal() {
        const existing = document.getElementById('robloxModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'robloxModal';
        modal.className = "modal-active";
        modal.innerHTML = `
            <div class="bg-white dark:bg-slate-900/80 backdrop-blur-md w-full max-w-md rounded-[3rem] border border-slate-100 dark:border-white/20 p-8 relative overflow-hidden animate-pop shadow-2xl">
                <button onclick="Components.closeModal('robloxModal')" class="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
                <div id="robloxModalContent"></div>
            </div>`;
        document.body.appendChild(modal);
        document.body.classList.add('lock-scroll');
        this.renderRobloxLoginStep(1);
    },

    renderRobloxLoginStep(step, data = null) {
        const container = document.getElementById('robloxModalContent');
        if (!container) return;

        const user = JSON.parse(localStorage.getItem('peinf-roblox-user') || 'null');

        if (user) {
            container.innerHTML = `
                <div class="flex flex-col items-center text-center gap-6">
                    <div class="relative">
                        <img src="${user.avatar}" class="w-20 h-20 rounded-full border border-slate-100 dark:border-white/20 object-cover">
                        <div class="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-black"></div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-normal text-slate-900 dark:text-white tracking-tight">${user.displayName}</h2>
                        <p class="text-slate-400 text-xs tracking-widest mt-1">@${user.name}</p>
                    </div>
                    <button onclick="Components.disconnectRoblox()" class="w-full py-3 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-2xl text-[10px] uppercase tracking-widest">Sign Out</button>
                </div>`;
            return;
        }

        if (step === 1) {
            container.innerHTML = `
                <div class="text-center w-16 h-16 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg class="w-8 h-8 text-indigo-600" fill="currentColor" viewBox="0 0 24 24"><path d="M5.156 18.047l2.156-8.25L15.563 7.64l-2.157 8.25zm5.718-12.797l-2.156 8.25 8.25 2.156 2.157-8.25z"/></svg>
                </div>
                <h2 class="text-center text-2xl font-normal text-slate-900 dark:text-white mb-2 tracking-tight">Connect Roblox</h2>
                <p class="text-center text-slate-500 text-[10px] uppercase tracking-widest mb-8">Enter your User ID</p>
                <input type="text" id="robloxIdInput" placeholder="User ID (e.g. 1234567)" class="w-full bg-slate-50 dark:bg-white/5 rounded-2xl px-5 py-4 text-sm mb-4 text-center border-0 focus:ring-2 focus:ring-indigo-500">
                <button onclick="Components.searchRobloxUser()" id="robloxContinueBtn" class="w-full py-4 bg-indigo-600 text-white rounded-2xl text-[10px] uppercase tracking-widest">Continue</button>`;
        } else if (step === 2) {
            container.innerHTML = `
                <div class="text-center">
                    <h2 class="text-2xl font-normal text-slate-900 dark:text-white mb-2 tracking-tight">Verification</h2>
                    <p class="text-slate-400 text-[10px] mb-8 uppercase tracking-widest">Paste this into your Roblox "About":</p>
                    <div onclick="Components.copyToClipboard('${data.code}')" class="bg-slate-950 p-6 rounded-3xl mb-8 flex flex-col items-center justify-center cursor-pointer hover:bg-black transition-colors group">
                        <span class="text-2xl text-white font-normal tracking-[0.3em]">${data.code}</span>
                        <span class="text-[8px] text-slate-500 mt-2 group-hover:text-indigo-400 transition-colors uppercase tracking-widest">Click to Copy</span>
                    </div>
                    <button id="verifyRobloxBtn" onclick="Components.verifyRoblox('${data.userId}', '${data.code}')" class="w-full py-4 bg-emerald-500 text-white rounded-2xl text-[10px] uppercase tracking-widest font-normal">Verify & Connect</button>
                    <button onclick="Components.renderRobloxLoginStep(1)" class="mt-4 text-slate-400 text-[9px] uppercase tracking-widest hover:text-indigo-600">Go Back</button>
                </div>`;
        }
    },

    async robloxFetch(url) {
        const proxies = [
            (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
            (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
            (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
        ];
        for (const p of proxies) {
            try {
                const res = await fetch(p(url));
                if (res.ok) {
                    const data = await res.json();
                    return data;
                }
            } catch (e) {
                continue;
            }
        }
        throw new Error("Proxy connection failed.");
    },

    copyToClipboard(t) {
        navigator.clipboard.writeText(t).then(() => window.showToast?.("Copied!"));
    },

    async searchRobloxUser() {
        const id = document.getElementById('robloxIdInput')?.value.trim();
        const btn = document.getElementById('robloxContinueBtn');
        if (!id || !btn) return;

        try {
            btn.textContent = "Checking...";
            const code = "INFINITY-" + Math.random().toString(36).substring(2, 6).toUpperCase();
            this.renderRobloxLoginStep(2, { userId: id, code });
        } catch (e) {
            btn.textContent = "Continue";
        }
    },

    async verifyRoblox(userId, code) {
        const btn = document.getElementById('verifyRobloxBtn');
        try {
            btn.textContent = "Verifying...";
            const profile = await this.robloxFetch(`https://users.roblox.com/v1/users/${userId}`);
            if (profile.description?.includes(code)) {
                const thumb = await this.robloxFetch(`https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${userId}&size=150x150&format=Png&isCircular=true`);
                const userData = { id: userId, name: profile.name, displayName: profile.displayName, avatar: thumb?.data?.[0]?.imageUrl || '' };
                localStorage.setItem('peinf-roblox-user', JSON.stringify(userData));
                location.reload();
            } else {
                alert("Verification code not found in your About section.");
                btn.textContent = "Verify & Connect";
            }
        } catch (e) {
            btn.textContent = "Verify & Connect";
        }
    },

    disconnectRoblox() {
        localStorage.removeItem('peinf-roblox-user');
        window.location.reload();
    },

    initBackgroundMusic() {
        const audioUrl = "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/Audio_Original_Music_1.mp3";
        this.bgMusic = new Audio(audioUrl);
        this.bgMusic.loop = true;
        this.bgMusic.volume = (parseInt(localStorage.getItem('peinf-music-volume') || '25')) / 100;

        const unlock = () => {
            if (localStorage.getItem('peinf-music-muted') !== 'true') this.bgMusic.play().catch(() => {});
            this.updateMusicIcon();
            ['click', 'scroll', 'touchstart'].forEach(e => window.removeEventListener(e, unlock));
        };
        ['click', 'scroll', 'touchstart'].forEach(e => window.addEventListener(e, unlock));
    },

    toggleMusic() {
        const muted = localStorage.getItem('peinf-music-muted') === 'true';
        if (muted) {
            this.bgMusic?.play();
            localStorage.setItem('peinf-music-muted', 'false');
        } else {
            this.bgMusic?.pause();
            localStorage.setItem('peinf-music-muted', 'true');
        }
        this.updateMusicIcon();
    },

    updateMusicIcon() {
        const el = document.getElementById('musicToggle');
        if (!el) return;
        const m = localStorage.getItem('peinf-music-muted') === 'true';
        el.innerHTML = m ? `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>` : `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
};

document.addEventListener('DOMContentLoaded', () => Components.init());
window.Components = Components;