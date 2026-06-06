/**
 * PETS data is loaded via data.js
 */

let petGrid, totalPetsDisplay, marketValueDisplay, paginationContainer, modal, modalContent, toast;

window.currentSort = 'highest';
window.currentRarity = 'all';

// Safe Data Loaders
function safeParse(key, fallback) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : fallback;
    } catch (e) {
        console.error(`PEINF: Failed to parse ${key} from localStorage`, e);
        return fallback;
    }
}

// Ensure utility functions exist before script runs
if (typeof window.parseValue !== 'function') {
    window.parseValue = function(v) {
        if (!v || typeof v !== 'string') return 0;
        const clean = v.toUpperCase();
        const val = parseFloat(clean);
        if (clean.includes('T')) return val * 1000000000000;
        if (clean.includes('B')) return val * 1000000000;
        if (clean.includes('M')) return val * 1000000;
        if (clean.includes('K')) return val * 1000;
        return val || 0;
    };
}

if (typeof window.formatValue !== 'function') {
    window.formatValue = (v) => v.toLocaleString();
}

let currentFilteredPets = [];
let currentPage = 1;
let activeTrend = 'all';
let activeDemand = 'all';
let showInventoryOnly = false;
let watchlist = safeParse('peinf-watchlist', []);
let inventory = safeParse('peinf-inventory', {});
let autoHistory = safeParse('peinf-auto-history', {});
const itemsPerPage = 16;

/**
 * Core Logic: Auto-Recording & Inventory Management
 * Restored these functions to fix the "no cards show" crash.
 */
function recordTrendSnapshots() {
    const now = Date.now();
    let updated = false;
    const petData = window.PETS || PETS || [];
    petData.forEach(pet => {
        if (!autoHistory[pet.id]) {
            autoHistory[pet.id] = [{ value: pet.value, timestamp: now, date: new Date(now).toLocaleDateString('en-US') }];
            updated = true;
        }
        const history = autoHistory[pet.id];
        if (history[history.length - 1].value !== pet.value) {
            history.push({ value: pet.value, timestamp: now, date: new Date(now).toLocaleDateString('en-US') });
            if (history.length > 200) history.shift();
            updated = true;
        }
    });
    if (updated) localStorage.setItem('peinf-auto-history', JSON.stringify(autoHistory));
}

window.modifyInventory = function(e, id, delta) {
    if (e) e.stopPropagation();
    const pet = PETS.find(p => p.id === id);
    const existCount = parseInt(pet.exists) || 0;
    let current = inventory[id] || 0;
    let next = Math.min(existCount, Math.max(0, current + delta));
    inventory[id] = next;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    handleFilters(false);
    if (modal && modal.classList.contains('modal-active')) openDetails(id);
};

window.setInventory = function(id, val) {
    const pet = PETS.find(p => p.id === id);
    const existCount = parseInt(pet.exists) || 0;
    let amount = parseInt(val);
    if (isNaN(amount)) amount = 0;
    amount = Math.min(existCount, Math.max(1, amount));
    inventory[id] = amount;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    handleFilters(false);
    openDetails(id);
};

window.clearFromInventory = function(e, id) {
    e.stopPropagation();
    inventory[id] = 0;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    showToast("Inventory Cleared");
    handleFilters(false);
    openDetails(id);
};

function calculateNetWorth() {
    let total = 0;
    Object.keys(inventory).forEach(id => {
        const pet = PETS.find(p => p.id == id);
        if (pet) total += parseValue(pet.value) * inventory[id];
    });
    return total;
}

function renderCollectionStats(data) {
    const statsContainer = document.getElementById('collectionStats');
    if (!statsContainer || !showInventoryOnly) {
        if (statsContainer) statsContainer.classList.add('hidden');
        return;
    }
    const uniqueOwned = Object.keys(inventory).filter(id => inventory[id] > 0).length;
    const percentage = ((uniqueOwned / PETS.length) * 100).toFixed(1);
    statsContainer.classList.remove('hidden');
    statsContainer.innerHTML = `
    <div class="px-2 mb-10 modal-content-sigma-animate">
        <div class="flex justify-between items-center mb-3">
            <div class="text-[10px] uppercase tracking-widest text-slate-400">Collection Completion</div>
            <div class="text-[10px] uppercase tracking-widest text-indigo-600 font-bold">${percentage}% Unique</div>
        </div>
        <div class="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 transition-all duration-1000" style="width: ${percentage}%"></div>
        </div></div>`;
}

/**
 * Core Graph Engine (Unified Rewrite)
 */
function getGraphPoints(petId, range) {
    const history = autoHistory[petId] || [];
    const now = Date.now();
    const durMap = { '3d': 259200000, '1w': 604800000, '1m': 2592000000, '1y': 31536000000 };
    const windowSize = durMap[range] || durMap['1w'];
    const startTime = now - windowSize;

    // 1. Filter history for window + include the last point before window for context
    let data = history.filter(e => (e.timestamp || new Date(e.date).getTime()) >= startTime);
    const prev = history.filter(e => (e.timestamp || new Date(e.date).getTime()) < startTime).pop();
    
    if (prev) data.unshift(prev);

    // 2. Fallback: If no data exists, show a flat line of current value
    if (data.length === 0) {
        const pet = PETS.find(p => p.id == petId);
        data = [{ value: pet.value }, { value: pet.value }];
    } else if (data.length === 1) {
        // Ensure we have at least 2 points to draw a valid line segment
        data.push({...data[0]});
    }

    const vals = data.map(e => parseValue(e.value));
    const minV = Math.min(...vals), maxV = Math.max(...vals), vDiff = (maxV - minV) || (maxV * 0.1) || 1;
    const [W, H, pX, pY] = [600, 150, 50, 30];

    // 3. EQUAL SPACING: Map points by their index (i) instead of timestamp
    return data.map((e, i) => ({
        x: pX + (i / (data.length - 1)) * (W - pX * 2),
        y: (H - pY) - ((parseValue(e.value) - minV) / vDiff) * (H - pY * 2),
        val: e.value
    }));
}

function renderValueGraph(petId, range = '1w') {
    const points = getGraphPoints(petId, range);
    let path = `M ${points[0].x} ${points[0].y}`;
    for(let i=1; i<points.length; i++) {
        const cpX = (points[i-1].x + points[i].x) / 2;
        path += ` C ${cpX} ${points[i-1].y}, ${cpX} ${points[i].y}, ${points[i].x} ${points[i].y}`;
    }

    const area = `${path} L ${points[points.length-1].x} 120 L ${points[0].x} 120 Z`;
    const btn = (r) => `px-3 py-1 rounded-lg text-[8px] uppercase tracking-widest transition-all ${range === r ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 dark:bg-white/5'}`;

    return `
        <div class="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div class="flex justify-between items-center mb-6">
                <span id="graphHoverValue" class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 transition-opacity">---</span>
                <div class="flex gap-1.5 bg-slate-50 dark:bg-white/5 p-1 rounded-xl">
                    <button onclick="window.setGraphRange(${petId}, '3d')" class="${btn('3d')}">3D</button>
                    <button onclick="window.setGraphRange(${petId}, '1w')" class="${btn('1w')}">1W</button>
                    <button onclick="window.setGraphRange(${petId}, '1m')" class="${btn('1m')}">1M</button>
                    <button onclick="window.setGraphRange(${petId}, '1y')" class="${btn('1y')}">1Y</button>
                </div>
            </div>
            <svg id="valueGraph" viewBox="0 0 600 150" class="w-full h-auto overflow-visible cursor-crosshair">
                <defs><linearGradient id="gGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#6366f1" stop-opacity="0.2"/><stop offset="100%" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs>
                <line x1="50" y1="120" x2="550" y2="120" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1" />
                <path d="${area}" fill="url(#gGrad)" class="graph-path-animate" />
                <path d="${path}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" class="graph-path-animate" />
                <line id="graphLine" x1="0" y1="30" x2="0" y2="120" stroke="#6366f1" stroke-width="1" stroke-dasharray="4" class="opacity-0" />
                <circle id="graphDot" r="4" fill="white" stroke="#6366f1" stroke-width="2.5" class="opacity-0" />
                <rect id="graphHitbox" x="50" y="0" width="500" height="150" fill="transparent" />
            </svg>
        </div>`;
}

function initGraphInteraction(petId, range = '1w') {
    const hitbox = document.getElementById('graphHitbox'), svg = document.getElementById('valueGraph');
    const line = document.getElementById('graphLine'), dot = document.getElementById('graphDot'), label = document.getElementById('graphHoverValue');
    if(!hitbox) return;

    const points = getGraphPoints(petId, range);

    hitbox.onmousemove = (e) => {
        const rect = svg.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (600 / rect.width);
        const closest = points.reduce((a, b) => Math.abs(b.x - mouseX) < Math.abs(a.x - mouseX) ? b : a);
        
        line.setAttribute('x1', closest.x); line.setAttribute('x2', closest.x);
        dot.setAttribute('cx', closest.x); dot.setAttribute('cy', closest.y);
        line.classList.remove('opacity-0'); dot.classList.remove('opacity-0');
        label.textContent = closest.val; label.classList.remove('opacity-0');
    };

    hitbox.onmouseleave = () => {
        line.classList.add('opacity-0'); dot.classList.add('opacity-0'); label.classList.add('opacity-0');
    };
}

window.toggleWatchlist = function(e, id) {
    e.stopPropagation();
    const index = watchlist.indexOf(id);
    if (index > -1) {
        watchlist.splice(index, 1);
        showToast("Removed from Watchlist");
    } else {
        watchlist.push(id);
        showToast("Added to Watchlist");
    }
    localStorage.setItem('peinf-watchlist', JSON.stringify(watchlist));
    handleFilters();
};

window.showToast = function(text) {
    if (!toast) return;
    // Clear existing timeouts to prevent "sticky" behavior
    if (window.toastTimeout) clearTimeout(window.toastTimeout);

    toast.textContent = text;
    toast.classList.remove('invisible', 'opacity-0', 'translate-y-10');
    toast.classList.add('opacity-100', 'translate-y-0');
    
    window.toastTimeout = setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => toast.classList.add('invisible'), 300);
    }, 2000);
}

function copyValue(e, val) {
    e.stopPropagation();
    navigator.clipboard.writeText(val);
    showToast("Copied!");
}


function openDetails(id) {
    const pet = PETS.find(p => p.id === id);
    const demandPercent = (pet.demandLevel / 5) * 100;
    const invCount = inventory[id] || 0;
    const existCount = parseInt(pet.exists) || 0;
    const petVal = parseValue(pet.value);

    // Capture current scroll position of the modal's content frame
    const scrollFrame = modalContent.querySelector('.modal-scroll-frame');
    const currentModalScrollPos = scrollFrame ? scrollFrame.scrollTop : 0;

    // Logic to shuffle huge images for the benchmark
    window.startBenchmarkShuffle = function() {
        if (window.benchmarkInterval) clearInterval(window.benchmarkInterval);
        const imgElement = document.getElementById('benchmarkShuffleImage');
        if (!imgElement || !PETS) return;

        const hugePets = PETS.filter(p => p.rarity === 'Huge' && p.image);
        if (hugePets.length === 0) return;

        let currentIndex = 0;
        window.benchmarkInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % hugePets.length;
            imgElement.src = hugePets[currentIndex].image;
        }, 1000);
    };

    // Sigma Benchmark: Automatically find the cheapest Huge pet as the reference
    const hugePets = PETS.filter(p => p.rarity === 'Huge' && parseValue(p.value) > 0);
    const baseHuge = hugePets.length > 0 
        ? hugePets.reduce((prev, curr) => parseValue(prev.value) < parseValue(curr.value) ? prev : curr)
        : null;
        
    const baseHugeVal = (baseHuge && parseValue(baseHuge.value) > 0) ? parseValue(baseHuge.value) : 1;
    const benchmark = (petVal / baseHugeVal).toFixed(1);

    // Trade Matcher: Find 4 pets with similar values (+/- 15%)
    const similarPets = PETS.filter(p => 
        p.id !== pet.id && 
        p.exists !== "0" &&
        Math.abs(parseValue(p.value) - petVal) / (petVal || 1) < 0.15
    ).slice(0, 4);

    modalContent.innerHTML = `
        <div class="flex flex-col items-center modal-scroll-frame">
            <div class="w-48 h-48 mb-4 p-4 flex items-center justify-center">
                <img src="${pet.image}" class="w-full h-full object-contain" onerror="this.style.opacity='0'">
            </div>
            <h2 class="text-2xl font-normal mb-1 text-slate-900 dark:text-white text-center" style="font-weight: 400;">${pet.name}</h2>
            <span class="px-3 py-1 bg-slate-100 dark:bg-slate-800/50 rounded-full text-[9px] tracking-widest uppercase text-slate-500 dark:text-white mb-6" style="font-weight: 400;">${pet.rarity}</span>
            
            <div class="grid grid-cols-3 gap-3 w-full">
                 <div class="bg-white dark:bg-[#0a0a0a] p-2 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Value</span>
                    <span class="text-sm text-indigo-600 dark:text-indigo-400">${pet.value}</span>
                </div>
                <div class="bg-white dark:bg-[#0a0a0a] p-2 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Demand</span>
                    <span class="text-sm text-slate-700 dark:text-white font-normal">${pet.demand}</span>
                </div>
                <div class="bg-white dark:bg-[#0a0a0a] p-2 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Exists</span>
                    <span class="text-sm text-slate-700 dark:text-white font-normal">${pet.exists}</span>
                </div>
            </div>

            <!-- Sigma Benchmark -->
            ${petVal > 0 ? `
                <div class="flex justify-center items-center gap-4 mt-8 py-4 px-8 bg-slate-50 dark:bg-white/5 rounded-[2rem] shadow-xl shadow-indigo-500/5">
                    <span class="text-3xl text-slate-900 dark:text-white font-normal tracking-tighter">~${benchmark} Base Huges</span>
                    <div class="w-12 h-12 flex items-center justify-center">
                        <img id="benchmarkShuffleImage" src="${baseHuge ? baseHuge.image : ''}" class="w-full h-full object-contain">
                    </div>
                </div>
            ` : ''}

            <div class="w-full mt-6">
                <div class="flex justify-between items-center mb-1">
                    <span class="text-black dark:text-white text-[9px] uppercase">Demand Rating</span>
                    <span class="text-indigo-600 dark:text-indigo-400 text-[10px]" style="font-weight: 400;">${pet.demand}</span>
                </div>
                <div class="demand-bg bg-slate-100 dark:bg-slate-800"><div class="demand-fill" style="width: ${demandPercent}%"></div></div>
            </div>

            <div class="w-full mt-8 flex flex-col gap-2">
                <div class="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <span class="text-[10px] uppercase tracking-widest text-slate-400 dark:text-white font-normal">Owned</span>
                    <div class="flex items-center gap-2">
                        <button onclick="modifyInventory(event, ${pet.id}, -1)" ${invCount <= 0 ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center bg-transparent text-slate-600 dark:text-white hover:scale-110 transition-all ${invCount <= 0 ? 'opacity-50 cursor-not-allowed' : ''}">-</button>
                        <input type="number" value="${invCount}" 
                            onchange="setInventory(${pet.id}, this.value)"
                            class="w-16 bg-transparent text-center text-sm font-normal focus:outline-none dark:text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="1" max="${existCount}">
                        <button onclick="modifyInventory(event, ${pet.id}, 1)" ${invCount >= existCount ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center bg-transparent text-slate-600 dark:text-white hover:scale-110 transition-all ${invCount >= existCount ? 'opacity-50 cursor-not-allowed' : ''}">+</button>
                        ${invCount > 0 ? `
                            <button onclick="clearFromInventory(event, ${pet.id})" 
                                class="ml-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all text-[10px] font-bold">
                                X
                            </button>` : ''}
                    </div>
                </div>
                <div id="graphSectionContainer">${renderValueGraph(pet.id, '1w')}</div>
            </div>

            <!-- Trade Matcher -->
            ${similarPets.length > 0 ? `
            <div class="w-full mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <span class="text-[9px] uppercase tracking-widest text-black dark:text-white block mb-4">Similar Value Alternatives</span>
                <div class="grid grid-cols-4 gap-4">
                    ${similarPets.map(p => `
                        <div onclick="openDetails(${p.id})" class="flex flex-col items-center gap-2 cursor-pointer group">
                            <img src="${p.image}" class="w-10 h-10 object-contain group-hover:scale-110 transition-transform">
                            <span class="text-[8px] text-slate-400 dark:text-slate-500 text-center truncate w-full">${p.name}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
    modal.classList.add('modal-active');
    document.body.classList.add('lock-scroll');

    // Initialize graph events and benchmark shuffle
    setTimeout(() => {
        initGraphInteraction(pet.id, '1w');
        window.startBenchmarkShuffle();
    }, 10);

    // Restore modal scroll position
    const newScrollFrame = modalContent.querySelector('.modal-scroll-frame');
    if (newScrollFrame) newScrollFrame.scrollTop = currentModalScrollPos;
} 

window.setGraphRange = function(petId, range) {
    const container = document.getElementById('graphSectionContainer');
    if (container) {
        container.innerHTML = renderValueGraph(petId, range);
        // Small delay ensures DOM is painted before attaching listeners
        setTimeout(() => initGraphInteraction(petId, range), 10);
    }
};

function closeModal() {
    if (window.benchmarkInterval) clearInterval(window.benchmarkInterval);
    modal.classList.remove('modal-active');
    document.body.classList.remove('lock-scroll');
}

function renderCards(data) {
    if (!petGrid) return;
    petGrid.classList.add('reveal-visible'); // Force visible to stop "billboard" effect
    
    const netWorth = calculateNetWorth();
    if (totalPetsDisplay) totalPetsDisplay.textContent = data.length;
    
    const totalMarketVal = data.reduce((acc, p) => acc + parseValue(p.value), 0);
    if (marketValueDisplay) marketValueDisplay.textContent = showInventoryOnly ? formatValue(netWorth) : formatValue(totalMarketVal);

    // Update stat label based on filter mode
    const label = document.getElementById('marketLabel');
    if (label) label.textContent = showInventoryOnly ? 'Inventory Net Worth' : 'Database Market';

    renderCollectionStats(data);

    const petsToRender = data.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    petGrid.innerHTML = '';
    if (petsToRender.length === 0) {
        petGrid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400 animate-pop">No items found.</div>';
        return;
    }

    petsToRender.forEach((pet) => {
        const trendClass = `trend-${(pet.trend || 'Stable').toLowerCase()}`;
        const isHot = pet.trend === 'Rising' ? `<span class="hot-badge flex-shrink-0 font-normal">HOT</span>` : '';
        const rarityClass = `rarity-${(pet.rarity || 'Common').toLowerCase()}`;
        const isFavorited = watchlist.includes(pet.id);
        const invCount = inventory[pet.id] || 0;
        const existCount = parseInt(pet.exists) || 0;
        const stackValue = invCount > 1 ? parseValue(pet.value) * invCount : 0;
        const isMaxed = invCount >= existCount;
        
        const trendIcons = {
            'Rising': '▲',
            'Falling': '▼',
            'Stable': '●'
        };

        const card = `
            <div class="reveal tilt-card pet-card shine-effect ${rarityClass} overflow-hidden flex flex-col p-2 cursor-pointer transition-all" 
                 onclick="openDetails(${pet.id})" style="transition-delay: ${(pet.id % 8) * 40}ms">
                <div class="relative rounded-none overflow-hidden mb-3 aspect-square">
                    ${invCount > 0 ? `
                        <div class="inventory-badge"><span>x${invCount}</span></div>` : ''}
                    <button onclick="toggleWatchlist(event, ${pet.id})" class="absolute top-0 right-0 z-20 p-2 text-sm transition-colors ${isFavorited ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}">
                        ${isFavorited ? '❤' : '♡'}
                    </button>
                    <img src="${pet.image}" class="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-110" onerror="this.style.opacity='0'">
                    
                    ${!isMaxed ? `
                    <div onclick="event.stopPropagation()" 
                         class="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex border-t border-slate-100 dark:border-white/10">
                        <button onclick="modifyInventory(event, ${pet.id}, 1)" class="flex-grow py-2 text-[10px] uppercase tracking-widest text-slate-900 dark:text-white transition-colors hover:bg-slate-100 dark:hover:bg-white/10">
                            + Quick Add
                        </button>
                    </div>
                    ` : ''}
                </div>
                
                <div class="px-2 pb-2">
                    <h3 class="text-[12px] font-normal text-slate-900 mb-3 tracking-tight flex items-center justify-between gap-2 min-w-0">
                        <span class="truncate" title="${pet.name}">${pet.name}</span>
                        ${isHot}
                    </h3>
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px]" onclick="copyValue(event, '${pet.value}')">
                            <span class="text-slate-400">Value</span>
                            <span class="text-indigo-600 text-xs">${pet.value}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="text-slate-400">Demand</span>
                            <span class="text-slate-700 dark:text-slate-300">${pet.demand}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="text-slate-400">Exists</span>
                            <span class="text-slate-700 dark:text-slate-300">${pet.exists}</span>
                        </div>
                        <div class="flex justify-between items-center text-[8px] pt-2 border-t border-slate-100 dark:border-white/5">
                            <span class="text-slate-400 uppercase">Trend</span>
                            <span class="uppercase tracking-tighter ${trendClass}">${trendIcons[pet.trend] || '●'} ${pet.trend}</span>
                        </div>
                    </div>
                </div>
            </div>`;
        petGrid.insertAdjacentHTML('beforeend', card);
    });

    renderPagination(data.length);
    
    // Crucial: Refresh animations to make the new cards visible
    window.AnimationEngine?.refresh();
}

function renderPagination(totalItems) {
    paginationContainer.innerHTML = '';
    if (totalItems <= itemsPerPage) {
        paginationContainer.classList.add('hidden');
        return;
    }
    paginationContainer.classList.remove('hidden');
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    paginationContainer.innerHTML = `
        <div class="flex items-center gap-4 bg-white dark:bg-black border border-slate-200 dark:border-white/10 px-4 py-2 rounded-2xl shadow-sm">
            <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} 
                class="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <div class="flex items-center gap-2">
                <input type="number" value="${currentPage}" min="1" max="${totalPages}"
                    onkeydown="if(['e','E','+','-','.'].includes(event.key)) event.preventDefault();"
                    oninput="this.value = this.value.replace(/^0+/, ''); if(this.value !== '' && parseInt(this.value) > ${totalPages}) this.value = ${totalPages}; if(this.value !== '' && parseInt(this.value) < 1) this.value = '';"
                    onchange="if(this.value === '' || this.value === '0') this.value = 1; changePage(parseInt(this.value))"
                class="w-12 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-lg text-center text-sm py-1 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white">
                <span class="text-slate-400 text-xs uppercase tracking-widest">of ${totalPages}</span>
            </div>

            <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} 
                class="p-2 text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
        </div>`;
}

window.clearSearch = function() {
    searchInput.value = '';
    handleFilters();
};

window.resetFilters = function() {
    window.currentSort = 'highest';
    window.currentRarity = 'all';
    activeTrend = 'all';
    activeDemand = 'all';
    searchInput.value = '';
    window.setSort('highest', 'Highest Value');
    window.setRarity('all', 'All Rarities');
};

window.applyQuickFilter = function(type, value) {
    if (type === 'rarity') window.setRarity(value, value);
    if (type === 'trend') activeTrend = value;
    if (type === 'demand') activeDemand = value;
    handleFilters();
};

window.setSort = function(val, label) {
    window.currentSort = val;
    const display = document.getElementById('sortDisplay');
    if (display) display.innerHTML = `${label} <svg class="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
    handleFilters();
};

window.setRarity = function(val, label) {
    window.currentRarity = val;
    const display = document.getElementById('rarityDisplay');
    if (display) display.innerHTML = `${label} <svg class="w-3 h-3 transition-transform group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>`;
    handleFilters();
};

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredPets.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCards(currentFilteredPets);
    renderPagination(currentFilteredPets.length);
}

function handleFilters(resetPage = true) {
    if (resetPage) currentPage = 1;
    const searchInput = document.getElementById('searchInput');
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const clearBtn = document.getElementById('clearSearchBtn');
    if (clearBtn) clearBtn.style.display = query.length > 0 ? 'block' : 'none';
    showInventoryOnly = window.currentRarity === 'inventory';

    currentFilteredPets = (window.PETS || PETS || []).filter(pet => {
        const isOC = pet.value === 'O/C' || pet.value === 'OC';
        const isInInventory = !!inventory[pet.id];
        const isWatched = watchlist.includes(pet.id);
        const petNumericValue = parseValue(pet.value);

        if (!pet.name) return false;
        let matchesSearch = pet.name.toLowerCase().includes(query);
        
        // Support for value range filtering (e.g., ">10m", "<500k")
        if (query.startsWith('>') || query.startsWith('<') || query.startsWith('=')) {
            const operator = query[0];
            const searchVal = parseValue(query.substring(1));
            if (searchVal > 0) {
                if (operator === '>') matchesSearch = petNumericValue > searchVal;
                else if (operator === '<') matchesSearch = petNumericValue < searchVal;
                else if (operator === '=') matchesSearch = petNumericValue === searchVal;
            }
        } 
        // Support for rarity short-codes in search
        else if (query === 'huge' || query === 'secret' || query === 'egg') {
            matchesSearch = (pet.rarity || '').toLowerCase() === query;
        }

        const matchesRarity = window.currentRarity === 'all' || 
                             (window.currentRarity === 'OC' ? isOC : 
                             (window.currentRarity === 'inventory' ? isInInventory : 
                             (window.currentRarity === 'watchlist' ? isWatched : pet.rarity === window.currentRarity)));
        const matchesTrend = activeTrend === 'all' || pet.trend === activeTrend;
        const matchesDemand = activeDemand === 'all' || pet.demandLevel >= parseInt(activeDemand);
        const isHatched = pet.exists !== "0";
        return matchesSearch && matchesRarity && matchesTrend && matchesDemand && isHatched;
    });

    if (window.currentSort === 'highest') currentFilteredPets.sort((a, b) => parseValue(b.value) - parseValue(a.value));
    else if (window.currentSort === 'lowest') currentFilteredPets.sort((a, b) => parseValue(a.value) - parseValue(b.value));
    else if (window.currentSort === 'demand') currentFilteredPets.sort((a, b) => b.demandLevel - a.demandLevel);
    else if (window.currentSort === 'az') currentFilteredPets.sort((a, b) => a.name.localeCompare(b.name));

    renderCards(currentFilteredPets);
    renderPagination(currentFilteredPets.length);
}

// Power-User Keyboard Shortcuts
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
        if (window.closePicker) window.closePicker();
        if (window.closeBlog) window.closeBlog();
    }
    if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        document.getElementById('searchInput')?.focus();
    }
});

// Listen for search input even if it's added to DOM later
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchInput') handleFilters();
});

// Initialize only when DOM and components are ready
document.addEventListener('DOMContentLoaded', () => {
    // Refresh selectors after components render
    petGrid = document.getElementById('petGrid');
    totalPetsDisplay = document.getElementById('totalPets');
    marketValueDisplay = document.getElementById('marketValue');
    paginationContainer = document.getElementById('pagination');
    modal = document.getElementById('petModal');
    modalContent = document.getElementById('modalContent');
    toast = document.getElementById('toast');

    const petData = window.PETS || (typeof PETS !== 'undefined' ? PETS : null);
    if (!petData || !Array.isArray(petData)) {
        console.error("PEINF: No PETS data found.");
        return;
    }

    // Always record snapshots so Pulse stays updated regardless of which page is viewed
    recordTrendSnapshots();

    if (petGrid) {
        setTimeout(() => handleFilters(), 100); // Slight delay to ensure components rendered the search bar
    }
});
