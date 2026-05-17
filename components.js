/**
 * PEINF Components Engine
 * Manages global UI elements like Header, Footer, and Mobile Navigation
 */
const Components = {
    init() {
        this.renderHeader();
        this.renderFooter();
        this.renderMobileNav();
    },

    getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split("/").pop();
        return page || 'index.html';
    },

    renderHeader() {
        const header = document.querySelector('header');
        if (!header) return;

        header.className = "glass-nav backdrop-blur-xl border-b border-slate-100 sticky top-0 z-[70] transition-all bg-white/70";
        
        const page = this.getCurrentPage();
        const isDb = page === 'index.html' || page === '';
        const isBlogs = page === 'blogs.html';
        const isClan = page === 'clan-battles.html';
        const isCredits = page === 'credits.html';
        const isPulse = page === 'market-pulse.html';

        const linkClass = (active) => `text-[10px] font-normal uppercase tracking-[0.15em] ${active ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600 transition-colors'}`;

        let tier1 = `
            <div class="px-4 py-3 flex justify-between items-center ${isDb ? 'border-b border-slate-50' : ''}">
                <div class="flex gap-8">
                    <a href="index.html" class="${linkClass(isDb)}">Database</a>
                    <a href="blogs.html" class="${linkClass(isBlogs)}">Blogs</a>
                    <a href="clan-battles.html" class="${linkClass(isClan)}">Clan Battles</a>
                    <a href="market-pulse.html" class="${linkClass(isPulse)}">Market Pulse</a>
                </div>
                <div class="flex gap-6 items-center">
                    <button id="darkModeToggle" onclick="AnimationEngine.toggleDarkMode()" class="text-slate-400 hover:text-indigo-600 transition-colors flex items-center justify-center"></button>
                    <a href="credits.html" class="${linkClass(isCredits)}">Credits</a>
                </div>
            </div>
        `;

        let tier2 = '';
        if (isDb) {
            tier2 = `
                <div class="px-4 py-3 flex items-center justify-between gap-4">
                    <div class="flex-grow max-w-xl relative">
                        <input type="text" id="searchInput" placeholder="Search values..."
                            class="w-full bg-slate-50 hover:bg-white px-5 py-2.5 rounded-2xl text-sm font-normal text-slate-900 placeholder-slate-400 focus:outline-none border border-transparent focus:border-indigo-100 transition-all">
                    </div>
                    <div class="flex items-center gap-4 md:gap-8">
                        <a href="calculator.html" class="hidden md:flex items-center gap-2.5 px-5 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-normal hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all">
                            <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                            Calculator
                        </a>
                        <div class="hidden sm:flex items-center gap-6">
                            <select id="sortOrder" class="bg-transparent text-slate-500 text-[11px] font-normal uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none">
                                <option value="highest">Highest Value</option>
                                <option value="lowest">Lowest Value</option>
                                <option value="demand">Highest Demand</option>
                                <option value="az">A-Z</option>
                            </select>
                            <select id="filterRarity" class="bg-transparent text-slate-500 text-[11px] font-normal uppercase tracking-wider cursor-pointer hover:text-indigo-600 transition-colors focus:outline-none">
                                <option value="all">All Rarities</option>
                                <option value="inventory" class="text-indigo-600 font-bold">My Inventory</option>
                                <option value="watchlist" class="text-red-500 font-bold">Watchlist ❤</option>
                                <option value="Huge">Huge</option>
                                <option value="Secret">Secret</option>
                                <option value="Egg">Egg</option>
                                <option value="OC">O/C Pets</option>
                            </select>
                        </div>
                    </div>
                </div>
            `;
        }

        header.innerHTML = `<div class="max-w-[1600px] mx-auto">${tier1}${tier2}</div>`;
    },

    renderFooter() {
        const footer = document.querySelector('footer');
        if (!footer) return;
        footer.className = "max-w-2xl mx-auto px-6 py-8 border-t border-slate-200 mt-10 mb-20 md:mb-8 text-center";
        const page = this.getCurrentPage();
        let name = "Database";
        if (page.includes('blog')) name = "Blogs";
        if (page.includes('calc')) name = "Calculator";
        if (page.includes('credits')) name = "Website";
        footer.innerHTML = `
            <div class="flex flex-col items-center gap-2">
                <div class="text-slate-400 text-[10px] font-normal uppercase tracking-[0.2em]">© 2026 PEINF ${name}</div>
                <div class="text-slate-400 text-[11px] font-normal">Created by <span class="text-blue-500 font-normal">@coderhorror</span></div>
            </div>
        `;
    },

    renderMobileNav() {
        const nav = document.createElement('div');
        nav.className = "md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-[100] px-6 py-4 flex justify-around items-center";
        const page = this.getCurrentPage();
        const icon = (active) => active ? 'text-indigo-600' : 'text-slate-400';
        nav.innerHTML = `
            <a href="index.html" class="${icon(page==='index.html')} flex flex-col items-center gap-1"><span class="text-[9px] uppercase tracking-widest">Database</span></a>
            <a href="market-pulse.html" class="${icon(page==='market-pulse.html')} flex flex-col items-center gap-1"><span class="text-[9px] uppercase tracking-widest">Pulse</span></a>
            <a href="calculator.html" class="${icon(page==='calculator.html')} flex flex-col items-center gap-1"><span class="text-[9px] uppercase tracking-widest">Calc</span></a>
            <a href="blogs.html" class="${icon(page==='blogs.html')} flex flex-col items-center gap-1"><span class="text-[9px] uppercase tracking-widest">Blogs</span></a>
        `;
        document.body.appendChild(nav);
    }
};
Components.init();