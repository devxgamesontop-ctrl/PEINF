/**
 * PETS data is loaded via data.js
 */

const petGrid = document.getElementById('petGrid');
const searchInput = document.getElementById('searchInput');
const filterRarity = document.getElementById('filterRarity');
const sortOrder = document.getElementById('sortOrder');
const totalPetsDisplay = document.getElementById('totalPets');
const marketValueDisplay = document.getElementById('marketValue');
const paginationContainer = document.getElementById('pagination');
const modal = document.getElementById('petModal');
const modalContent = document.getElementById('modalContent');
const toast = document.getElementById('toast');

let currentFilteredPets = [...PETS];
let currentPage = 1;
let activeTrend = 'all';
let activeDemand = 'all';
let showInventoryOnly = false;
let watchlist = JSON.parse(localStorage.getItem('peinf-watchlist') || '[]');
let inventory = JSON.parse(localStorage.getItem('peinf-inventory') || '{}');
let autoHistory = JSON.parse(localStorage.getItem('peinf-auto-history') || '{}');
const itemsPerPage = 16;

/**
 * World-Class Auto-Recording Logic
 * Captures value changes and maps them to real calendar dates
 */
function recordTrendSnapshots() {
    const today = new Date().toLocaleDateString('en-US');
    let updated = false;

    PETS.forEach(pet => {
        // 1. Initialize history with the current value if it doesn't exist.
        // No more "templates" - it starts with a single point.
        if (!autoHistory[pet.id]) {
            autoHistory[pet.id] = [{ value: pet.value, date: today }];
            updated = true;
        }

        const history = autoHistory[pet.id];
        const lastEntry = history[history.length - 1];

        // 2. Automatic Detection: If you change the value in data.js, the graph plots it instantly.
        if (lastEntry.value !== pet.value || lastEntry.date !== today) {
            if (lastEntry.date === today) {
                lastEntry.value = pet.value;
            } else {
                history.push({ value: pet.value, date: today });
            }

            // Rolling 14-day window
            if (history.length > 14) history.shift();
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem('peinf-auto-history', JSON.stringify(autoHistory));
    }
}

window.modifyInventory = function(e, id, delta) {
    if (e) e.stopPropagation();
    const pet = PETS.find(p => p.id === id);
    const existCount = parseInt(pet.exists) || 0;
    let current = inventory[id] || 0;
    let next = Math.min(existCount, Math.max(0, current + delta));
    inventory[id] = next;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    handleFilters();
    
    // Only refresh the modal if it's already open
    if (modal && modal.classList.contains('modal-active')) {
        openDetails(id);
    }
};

window.setInventory = function(id, val) {
    const pet = PETS.find(p => p.id === id);
    const existCount = parseInt(pet.exists) || 0;
    let amount = parseInt(val);
    if (isNaN(amount)) amount = 0;
    amount = Math.min(existCount, Math.max(1, amount));
    inventory[id] = amount;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    handleFilters();
    openDetails(id);
};

window.clearFromInventory = function(e, id) {
    e.stopPropagation();
    inventory[id] = 0;
    localStorage.setItem('peinf-inventory', JSON.stringify(inventory));
    showToast("Inventory Cleared");
    handleFilters();
    openDetails(id); // Re-render content to show immediate update
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
    if (!statsContainer) return;

    if (!showInventoryOnly) {
        statsContainer.classList.add('hidden');
        return;
    }

    const uniqueOwned = Object.keys(inventory).filter(id => inventory[id] > 0).length;
    const totalPets = PETS.length;
    const percentage = ((uniqueOwned / totalPets) * 100).toFixed(1);

    statsContainer.classList.remove('hidden');
    statsContainer.innerHTML = `
        <div class="text-[10px] uppercase tracking-widest text-slate-400 mb-2">Collection Completion: <span class="text-indigo-600">${percentage}%</span> (${uniqueOwned}/${totalPets})</div>
        <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div class="h-full bg-indigo-600 transition-all duration-1000" style="width: ${percentage}%"></div>
        </div>
    `;
}

function renderValueGraph(petId) {
    const historyEntries = autoHistory[petId] || [];
    if (historyEntries.length < 2) return '';
    
    const values = historyEntries.map(e => parseValue(e.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || (max * 0.1) || 1;

    const width = 600;
    const height = 150;
    const paddingX = 40;
    const paddingY = 40;

    const points = historyEntries.map((entry, i) => ({
        x: (i / (values.length - 1)) * (width - 2 * paddingX) + paddingX,
        y: height - (((parseValue(entry.value) - min) / range) * (height - 2 * paddingY) + paddingY),
        val: entry.value,
        date: entry.date
    }));

    // Generate Smooth Curve Path
    let pathD = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
        const cp1x = (points[i].x + points[i+1].x) / 2;
        pathD += ` C ${cp1x} ${points[i].y}, ${cp1x} ${points[i+1].y}, ${points[i+1].x} ${points[i+1].y}`;
    }

    // Generate Area Fill (Gradient)
    const areaD = `${pathD} L ${points[points.length-1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

    return `
        <div class="w-full mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <div class="flex justify-between items-center mb-4">
                <span class="text-[9px] uppercase tracking-widest text-black dark:text-white block">Price Trend</span>
                <span id="graphHoverValue" class="text-[10px] font-medium text-indigo-600 dark:text-indigo-400 opacity-0 transition-all duration-200"></span>
            </div>
            <div class="relative">
                <svg id="valueGraph" viewBox="0 0 ${width} ${height}" class="w-full h-auto overflow-visible cursor-crosshair">
                    <defs>
                        <linearGradient id="graphGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.25" />
                            <stop offset="100%" stop-color="#6366f1" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                    
                    <!-- Background Grid -->
                    <line x1="${paddingX}" y1="${height - paddingY}" x2="${width - paddingX}" y2="${height - paddingY}" stroke="currentColor" class="text-slate-200 dark:text-slate-800" stroke-width="1" />
                    
                    <!-- Area Fill -->
                    <path d="${areaD}" fill="url(#graphGradient)" />
                    
                    <!-- Curved Stroke Line -->
                    <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    
                    <!-- Interaction Guideline -->
                    <line id="graphGuideline" x1="0" y1="${paddingY}" x2="0" y2="${height - paddingY}" stroke="#6366f1" stroke-width="1.5" stroke-dasharray="4" class="opacity-0 transition-opacity duration-200" />

                    <!-- Hover Indicator Dot -->
                    <circle id="graphHoverDot" r="5" fill="white" stroke="#6366f1" stroke-width="3" class="opacity-0 transition-opacity duration-200" />

                    <!-- X-Axis Labels -->
                    ${points.map(p => `
                        <text x="${p.x}" y="${height - 8}" text-anchor="middle" class="fill-black dark:fill-white text-[9px] uppercase tracking-tight" style="font-weight: 500;">${p.date.split('/')[0] + '/' + p.date.split('/')[1]}</text>
                    `).join('')}
                    
                    <!-- Hidden Overlay for Detection -->
                    <rect id="graphOverlay" x="${paddingX}" y="0" width="${width - 2 * paddingX}" height="${height}" fill="transparent" />
                </svg>
            </div>
        </div>
    `;
}

function initGraphInteraction(petId) {
    const overlay = document.getElementById('graphOverlay');
    const svg = document.getElementById('valueGraph');
    const guideline = document.getElementById('graphGuideline');
    const hoverDot = document.getElementById('graphHoverDot');
    const hoverValue = document.getElementById('graphHoverValue');
    const historyEntries = autoHistory[petId] || [];

    if (!overlay || !svg || historyEntries.length === 0) return;

    const values = historyEntries.map(e => parseValue(e.value));
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = (max - min) || (max * 0.1) || 1;
    const width = 600;
    const height = 150;
    const paddingX = 40;
    const paddingY = 40;

    const points = historyEntries.map((entry, i) => ({
        x: (i / (historyEntries.length - 1)) * (width - 2 * paddingX) + paddingX,
        y: height - (((parseValue(entry.value) - min) / range) * (height - 2 * paddingY) + paddingY),
        val: entry.value,
        date: entry.date
    }));

    overlay.addEventListener('mousemove', (e) => {
        const rect = svg.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left) * (width / rect.width);
        
        const closest = points.reduce((prev, curr) => 
            Math.abs(curr.x - mouseX) < Math.abs(prev.x - mouseX) ? curr : prev
        );

        guideline.setAttribute('x1', closest.x);
        guideline.setAttribute('x2', closest.x);
        guideline.classList.replace('opacity-0', 'opacity-100');
        
        hoverDot.setAttribute('cx', closest.x);
        hoverDot.setAttribute('cy', closest.y);
        hoverDot.classList.replace('opacity-0', 'opacity-100');

        hoverValue.textContent = closest.val;
        hoverValue.classList.replace('opacity-0', 'opacity-100');
    });

    overlay.addEventListener('mouseleave', () => {
        guideline.classList.replace('opacity-100', 'opacity-0');
        hoverDot.classList.replace('opacity-100', 'opacity-0');
        hoverValue.classList.replace('opacity-100', 'opacity-0');
    });
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

function showToast(text) {
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

    // Logic to shuffle huge images for the benchmark
    window.startBenchmarkShuffle = function() {
        if (window.benchmarkInterval) clearInterval(window.benchmarkInterval);
        const imgElement = document.getElementById('benchmarkShuffleImage');
        if (!imgElement) return;

        const hugePets = PETS.filter(p => p.rarity === 'Huge' && p.image);
        if (hugePets.length === 0) return;

        let currentIndex = 0;
        window.benchmarkInterval = setInterval(() => {
            currentIndex = (currentIndex + 1) % hugePets.length;
            imgElement.src = hugePets[currentIndex].image;
        }, 1000);
    };

    // Sigma Benchmark: Calculate value relative to the cheapest Huge (ID 3: Shadow Sphinx)
    const baseHuge = PETS.find(p => p.id === 3);
    const baseHugeVal = baseHuge ? parseValue(baseHuge.value) : 1;
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
                 <div class="bg-white dark:bg-[#0a0a0a] p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Value</span>
                    <span class="text-sm text-indigo-600 dark:text-indigo-400">${pet.value}</span>
                </div>
                <div class="bg-white dark:bg-[#0a0a0a] p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Demand</span>
                    <span class="text-sm text-slate-700 dark:text-white font-normal">${pet.demand}</span>
                </div>
                <div class="bg-white dark:bg-[#0a0a0a] p-3 rounded-2xl border border-slate-100 flex flex-col items-center">
                    <span class="text-slate-400 dark:text-white text-[8px] uppercase mb-1 tracking-tighter text-center">Exists</span>
                    <span class="text-sm text-slate-700 dark:text-white font-normal">${pet.exists}</span>
                </div>
            </div>

            <!-- Sigma Benchmark -->
            ${petVal > 0 ? `
                <div class="flex justify-center items-center gap-4 mt-8">
                    <span class="text-3xl text-slate-900 dark:text-white font-normal tracking-tighter">~${benchmark} Base Huges</span>
                    <img id="benchmarkShuffleImage" src="${baseHuge ? baseHuge.image : ''}" class="w-10 h-10 object-contain">
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
                            class="w-16 bg-transparent text-center text-sm font-normal focus:outline-none dark:text-white"
                            min="1" max="${existCount}">
                        <button onclick="modifyInventory(event, ${pet.id}, 1)" ${invCount >= existCount ? 'disabled' : ''} class="w-8 h-8 flex items-center justify-center bg-transparent text-slate-600 dark:text-white hover:scale-110 transition-all ${invCount >= existCount ? 'opacity-50 cursor-not-allowed' : ''}">+</button>
                        ${invCount > 0 ? `
                            <button onclick="clearFromInventory(event, ${pet.id})" 
                                class="ml-2 w-8 h-8 flex items-center justify-center bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition-all text-[10px] font-bold">
                                X
                            </button>` : ''}
                    </div>
                </div>
                ${renderValueGraph(pet.id)}
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
        initGraphInteraction(pet.id);
        window.startBenchmarkShuffle();
    }, 10);
} 

function closeModal() {
    if (window.benchmarkInterval) clearInterval(window.benchmarkInterval);
    modal.classList.remove('modal-active');
    document.body.classList.remove('lock-scroll');
}

function parseValue(valStr) {
    if (!valStr || typeof valStr !== 'string') return 0;
    const cleanStr = valStr.toUpperCase();
    if (cleanStr === 'O/C' || cleanStr === 'OC') return 0;
    const val = parseFloat(cleanStr);
    if (cleanStr.includes('T')) return val * 1000000000000;
    if (cleanStr.includes('B')) return val * 1000000000;
    if (cleanStr.includes('M')) return val * 1000000;
    if (cleanStr.includes('K')) return val * 1000;
    return val || 0;
}

function formatValue(val) {
    if (val >= 1000000000000) return (val / 1000000000000).toFixed(2) + 'T';
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    return val.toLocaleString();
}

function renderCards(data) {
    const netWorth = calculateNetWorth();
    totalPetsDisplay.textContent = data.length;
    
    // Update display: if showing inventory, show net worth. Otherwise show total database market value.
    const totalMarketVal = data.reduce((acc, p) => acc + parseValue(p.value), 0);
    marketValueDisplay.textContent = showInventoryOnly ? formatValue(netWorth) : formatValue(totalMarketVal);

    renderCollectionStats(data);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const petsToRender = data.slice(startIndex, endIndex);

    petGrid.innerHTML = '';
    if (petsToRender.length === 0 && currentPage === 1) { // Only show "No items found" if no items on first page
        petGrid.innerHTML = '<div class="col-span-full py-8 text-center text-slate-400 animate-pop">No items found.</div>';
        return;
    }

    petsToRender.forEach((pet) => {
        const trendClass = `trend-${pet.trend.toLowerCase()}`;
        const isHot = pet.trend === 'Rising' ? `<span class="hot-badge flex-shrink-0 font-normal">HOT</span>` : '';
        const rarityClass = `rarity-${pet.rarity.toLowerCase()}`;
        const isFavorited = watchlist.includes(pet.id);
        const invCount = inventory[pet.id] || 0;
        
        const trendIcons = {
            'Rising': '▲',
            'Falling': '▼',
            'Stable': '●'
        };

        const card = `
            <div class="reveal tilt-card pet-card shine-effect ${rarityClass} overflow-hidden flex flex-col p-3 hover:cursor-pointer" 
                 onclick="openDetails(${pet.id})" style="transition-delay: ${(pet.id % 7) * 50}ms; opacity:0">
                <div class="relative rounded-none overflow-hidden mb-3 aspect-square">
                    ${invCount > 0 ? `<div class="inventory-badge">${invCount}x Owned</div>` : ''}
                    <button onclick="toggleWatchlist(event, ${pet.id})" class="absolute top-0 right-0 z-20 p-2 text-sm transition-colors ${isFavorited ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}">
                        ${isFavorited ? '❤' : '♡'}
                    </button>
                    <img src="${pet.image}" class="w-full h-full object-contain p-4 transition-transform duration-500 hover:scale-110" onerror="this.style.opacity='0'">
                    
                    <!-- Quick Action Bar -->
                    <div class="absolute bottom-0 left-0 right-0 bg-white/90 dark:bg-black/90 backdrop-blur-md translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex border-t border-slate-100 dark:border-slate-800">
                        <button onclick="modifyInventory(event, ${pet.id}, 1)" class="flex-grow py-2 text-[10px] uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 transition-colors">
                            + Quick Add
                        </button>
                    </div>
                </div>
                
                <div class="px-2">
                    <h3 class="text-[12px] font-normal text-slate-900 mb-3 tracking-tight flex items-center justify-between gap-2 min-w-0">
                        <span class="truncate" title="${pet.name}">${pet.name}</span>
                        ${isHot}
                    </h3>
                    
                    <div class="space-y-2">
                        <div class="flex justify-between items-center text-[10px]" onclick="copyValue(event, '${pet.value}')">
                            <span class="text-slate-400 dark:text-white" style="font-weight: 400;">Value</span>
                            <span class="text-indigo-600 font-normal text-xs cursor-copy">${pet.value}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="text-slate-400 dark:text-white" style="font-weight: 400;">Demand</span>
                            <span class="text-slate-700 dark:text-slate-300 font-normal">${pet.demand}</span>
                        </div>
                        <div class="flex justify-between items-center text-[10px]">
                            <span class="text-slate-400 dark:text-white" style="font-weight: 400;">Exists</span>
                            <span class="text-slate-700 dark:text-slate-300 font-normal">${pet.exists}</span>
                        </div>
                        <div class="flex justify-between items-center text-[8px] pt-1.5 border-t border-slate-100">
                            <span class="text-slate-500 dark:text-white uppercase font-normal" style="font-weight: 400;">Trend</span>
                            <span class="font-normal uppercase tracking-tighter ${trendClass}">${trendIcons[pet.trend]} ${pet.trend}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        petGrid.insertAdjacentHTML('beforeend', card);
    });

    renderPagination(data.length);
    if (window.AnimationEngine) {
        AnimationEngine.refresh();
    }
}

function renderPagination(totalItems) {
    paginationContainer.innerHTML = '';
    if (totalItems === 0) {
        paginationContainer.classList.add('hidden');
        return;
    }
    paginationContainer.classList.remove('hidden');
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Navigation always shows 1 page even if empty
    const displayPages = Math.max(1, totalPages); // Ensure at least 1 page is shown

    let html = `<button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="pagination-hover px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-normal disabled:opacity-50 hover:bg-slate-200 transition-colors">Prev</button>`;
    for (let i = 1; i <= displayPages; i++) {
        html += `<button onclick="changePage(${i})" class="pagination-hover px-3 py-1 rounded-lg text-xs font-normal ${currentPage === i ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} transition-colors">${i}</button>`;
    }
    html += `<button onclick="changePage(${currentPage + 1})" ${currentPage === displayPages ? 'disabled' : ''} class="pagination-hover px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-normal disabled:opacity-50 hover:bg-slate-200 transition-colors">Next</button>`;
    paginationContainer.innerHTML = html;
}

function applyQuickFilter(type, value) {
    if (type === 'rarity') filterRarity.value = value;
    if (type === 'trend') activeTrend = value;
    if (type === 'demand') activeDemand = value;
    handleFilters();
}

function changePage(page) {
    const totalPages = Math.ceil(currentFilteredPets.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderCards(currentFilteredPets);
    renderPagination(currentFilteredPets.length);
}

function handleFilters() {
    currentPage = 1;
    const query = searchInput.value.toLowerCase();
    const sort = sortOrder.value;
    const rarity = filterRarity ? filterRarity.value : 'all';
    showInventoryOnly = rarity === 'inventory';

    currentFilteredPets = PETS.filter(pet => {
        const matchesSearch = pet.name.toLowerCase().includes(query);
        const isOC = pet.value === 'O/C' || pet.value === 'OC';
        const isInInventory = !!inventory[pet.id];
        const isWatched = watchlist.includes(pet.id);

        const matchesRarity = rarity === 'all' || 
                             (rarity === 'OC' ? isOC : 
                             (rarity === 'inventory' ? isInInventory : 
                             (rarity === 'watchlist' ? isWatched : pet.rarity === rarity)));
        const matchesTrend = activeTrend === 'all' || pet.trend === activeTrend;
        const matchesDemand = activeDemand === 'all' || pet.demandLevel >= parseInt(activeDemand);
        const isHatched = pet.exists !== "0";
        return matchesSearch && matchesRarity && matchesTrend && matchesDemand && isHatched;
    });

    if (sort === 'highest') currentFilteredPets.sort((a, b) => parseValue(b.value) - parseValue(a.value));
    else if (sort === 'lowest') currentFilteredPets.sort((a, b) => parseValue(a.value) - parseValue(b.value));
    else if (sort === 'demand') currentFilteredPets.sort((a, b) => b.demandLevel - a.demandLevel);
    else if (sort === 'az') currentFilteredPets.sort((a, b) => a.name.localeCompare(b.name));

    renderCards(currentFilteredPets);
    renderPagination(currentFilteredPets.length);
}

if (searchInput) searchInput.addEventListener('input', handleFilters);
if (filterRarity) filterRarity.addEventListener('change', handleFilters);
if (sortOrder) sortOrder.addEventListener('change', handleFilters);

document.addEventListener('DOMContentLoaded', () => {
    if (petGrid) {
        recordTrendSnapshots(); // Start the auto-recorder
        handleFilters();
    }
});

function getRecentDate(index, total) {
    const date = new Date();
    date.setDate(date.getDate() - (total - 1 - index));
    return date.toLocaleDateString('en-US');
}
