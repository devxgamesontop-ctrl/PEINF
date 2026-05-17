/**
 * PEINF Trade Calculator Logic
 * Created by @coderhorror
 */

let yourTrade = [];
let theirTrade = [];
let activeSide = 'your';

window.showItemPicker = function(side) {
    activeSide = side;
    document.getElementById('pickerModal').classList.add('modal-active');
    renderPickerGrid();
};

window.closePicker = function() {
    document.getElementById('pickerModal').classList.remove('modal-active');
};

window.generateShareLink = function() {
    const data = {
        y: yourTrade.map(p => p.id),
        t: theirTrade.map(p => p.id),
        yg: getGems('your'),
        tg: getGems('their')
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}${window.location.pathname}#trade=${encoded}`;
    navigator.clipboard.writeText(url);
    if (window.showToast) window.showToast("Trade link copied to clipboard!");
};

window.loadTradeFromURL = function() {
    const hash = window.location.hash;
    if (!hash.startsWith('#trade=')) return;
    try {
        const encoded = hash.split('=')[1];
        const data = JSON.parse(atob(encoded));
        yourTrade = (data.y || []).map(id => PETS.find(p => p.id === id)).filter(Boolean);
        theirTrade = (data.t || []).map(id => PETS.find(p => p.id === id)).filter(Boolean);
        if (document.getElementById('yourGems')) document.getElementById('yourGems').value = data.yg || 0;
        if (document.getElementById('theirGems')) document.getElementById('theirGems').value = data.tg || 0;
        updateTradeTotals();
    } catch (e) {
        console.error("Failed to load trade from URL", e);
    }
};

function renderPickerGrid() {
    const grid = document.getElementById('pickerGrid');
    const query = document.getElementById('pickerSearch').value.toLowerCase();
    const rarity = document.getElementById('pickerRarity')?.value || 'all';
    
    grid.innerHTML = PETS.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(query);
        const isHatched = p.exists !== "0";
        const isOC = p.value === 'O/C';
        const matchesRarity = rarity === 'all' || p.rarity === rarity;
        return matchesSearch && isHatched && matchesRarity && !isOC;
    }).map(pet => `
        <div onclick="addItemToTrade(${pet.id})" class="flex items-center justify-center cursor-pointer transition-all group aspect-square">
            <img src="${pet.image}" class="w-16 h-16 object-contain transition-transform group-hover:scale-110" onerror="this.style.opacity='0'">
        </div>
    `).join('');
}

window.addItemToTrade = function(id) {
    const pet = PETS.find(p => p.id === id);
    if (!pet) return;
    
    if (activeSide === 'your') yourTrade.push(pet);
    else theirTrade.push(pet);
    
    closePicker();
    updateTradeGrids();
    calculateVerdict();
};

window.clearTrade = function(side) {
    if (side === 'your') yourTrade = [];
    else theirTrade = [];
    updateTradeGrids();
    calculateVerdict();
};

window.removeItem = function(side, index) {
    if (side === 'your') yourTrade.splice(index, 1);
    else theirTrade.splice(index, 1);
    updateTradeGrids();
    calculateVerdict();
};

function getGems(side) {
    const el = document.getElementById(side + 'Gems');
    if (!el) return 0;
    let val = parseInt(el.value) || 0;
    if (val < 0) {
        val = 0;
        el.value = 0;
    }
    return val;
}

function calculateVerdict() {
    const yourVal = yourTrade.reduce((s, p) => s + parseValue(p.value), 0) + getGems('your');
    const theirVal = theirTrade.reduce((s, p) => s + parseValue(p.value), 0) + getGems('their');
    const text = document.getElementById('verdictText');
    const meter = document.getElementById('fairnessMeter');
    if (!text) return;

    // Create or find profit display
    let profitDisplay = document.getElementById('profitDisplay');
    if (!profitDisplay) {
        profitDisplay = document.createElement('div');
        profitDisplay.id = 'profitDisplay';
        profitDisplay.className = 'text-[11px] font-normal mt-2 transition-all duration-300';
        text.after(profitDisplay);
    }

    if (yourVal === 0 && theirVal === 0) {
        text.textContent = 'F';
        text.className = 'text-6xl font-normal tracking-tighter text-indigo-600 opacity-10';
        if (meter) meter.style.width = '50%';
        profitDisplay.textContent = '';
        return;
    }

    const diff = theirVal - yourVal;

    // Fairness Meter Logic
    if (meter) {
        const ratio = yourVal === 0 ? 0 : (theirVal / yourVal);
        const percentage = Math.min(100, Math.max(0, ratio * 50));
        meter.style.width = percentage + '%';
        meter.style.backgroundColor = percentage < 40 ? '#ef4444' : (percentage > 60 ? '#10b981' : '#6366f1');
    }

    if (theirVal > yourVal) {
        text.textContent = 'W';
        text.className = 'text-6xl font-normal tracking-tighter text-emerald-500 scale-110';
        profitDisplay.textContent = `+${formatValue2DP(diff)}`;
        profitDisplay.className = 'text-[11px] font-normal mt-2 text-emerald-500';
    } else if (yourVal > theirVal) {
        text.textContent = 'L';
        text.className = 'text-6xl font-normal tracking-tighter text-red-500 scale-95';
        profitDisplay.textContent = formatValue2DP(diff);
        profitDisplay.className = 'text-[11px] font-normal mt-2 text-red-500';
    } else {
        text.textContent = 'F';
        text.className = 'text-6xl font-normal tracking-tighter text-indigo-600';
        profitDisplay.textContent = 'Fair Trade';
        profitDisplay.className = 'text-[11px] font-normal mt-2 text-indigo-400';
    }
}

window.updateTradeTotals = function() {
    ['your', 'their'].forEach(side => {
        const val = getGems(side);
        const display = document.getElementById(side + 'GemsDisplay');
        if (display) {
            display.textContent = val > 0 ? formatValue2DP(val) : '';
        }
    });
    updateTradeGrids();
    calculateVerdict();
};

function formatValue2DP(val) {
    if (val === 0) return "0";
    if (val >= 1000000000) return (val / 1000000000).toFixed(2) + 'B';
    if (val >= 1000000) return (val / 1000000).toFixed(2) + 'M';
    if (val >= 1000) return (val / 1000).toFixed(2) + 'K';
    return val.toLocaleString();
}

function updateTradeGrids() {
    const yourGrid = document.getElementById('yourTradeGrid');
    const theirGrid = document.getElementById('theirTradeGrid');
    
    const itemHTML = (pet, i, side) => `
        <div onclick="removeItem('${side}', ${i})" class="relative aspect-square flex items-center justify-center cursor-pointer group">
            <img src="${pet.image}" class="w-full h-full object-contain transition-transform group-hover:scale-110" onerror="this.style.opacity='0'">
            <div class="absolute inset-0 bg-white/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span class="text-red-500 text-3xl font-normal">&times;</span>
            </div>
        </div>
    `;

    yourGrid.innerHTML = yourTrade.map((pet, i) => itemHTML(pet, i, 'your')).join('');
    theirGrid.innerHTML = theirTrade.map((pet, i) => itemHTML(pet, i, 'their')).join('');

    const yourVal = yourTrade.reduce((s, p) => s + parseValue(p.value), 0) + getGems('your');
    const theirVal = theirTrade.reduce((s, p) => s + parseValue(p.value), 0) + getGems('their');

    // Update Item Counts
    document.getElementById('yourItemCount').textContent = yourTrade.length;
    document.getElementById('theirItemCount').textContent = theirTrade.length;

    document.getElementById('yourTotal').textContent = formatValue2DP(yourVal);
    document.getElementById('theirTotal').textContent = formatValue2DP(theirVal);
    
    if (window.AnimationEngine) window.AnimationEngine.refresh();
}

// Initialize listeners
document.addEventListener('DOMContentLoaded', () => {
    const pickerSearch = document.getElementById('pickerSearch');
    if (pickerSearch) {
        pickerSearch.addEventListener('input', renderPickerGrid);
    }
    loadTradeFromURL();
});