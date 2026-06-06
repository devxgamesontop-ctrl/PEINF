let currentSide = 'your';
let selectedItem = null;
let tradeState = {
    your: { items: [], gems: 0, total: 0 },
    their: { items: [], gems: 0, total: 0 }
};

function showItemPicker(side) {
    currentSide = side;
    const modal = document.getElementById('pickerModal');
    modal.classList.remove('invisible', 'opacity-0', 'pointer-events-none');
    modal.querySelector('div').classList.remove('scale-95');
    renderPickerGrid();
}

function closePicker() {
    const modal = document.getElementById('pickerModal');
    modal.classList.add('invisible', 'opacity-0', 'pointer-events-none');
    modal.querySelector('div').classList.add('scale-95');
    cancelQuantitySelection(); // Ensure quantity selector is hidden too
}

function renderPickerGrid() {
    const searchTerm = document.getElementById('pickerSearch').value.toLowerCase();
    const rarityFilter = document.getElementById('pickerRarity').value;
    const grid = document.getElementById('pickerGrid');
    
    if (!grid) {
        console.error("Picker grid element not found.");
        return;
    }
    if (typeof PETS === 'undefined' || !Array.isArray(PETS) || PETS.length === 0) {
        grid.innerHTML = '<p class="text-center text-slate-400 dark:text-white/60 col-span-full py-8">Loading items...</p>';
        console.warn("PETS data not available or empty. Cannot render picker grid.");
        return; // Exit if PETS is truly unavailable
    }

    const filtered = PETS.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesRarity = rarityFilter === 'all' || item.rarity === rarityFilter;
        const isNotOC = item.value.toUpperCase() !== 'O/C' && item.value.toUpperCase() !== 'OC'; // Filter out O/C from picker
        const isAvailable = parseInt(item.exists) > 0; // Only show items that exist (exists > 0)
        return matchesSearch && matchesRarity && isNotOC && isAvailable;
    });

    grid.innerHTML = filtered.map(item => `
        <div onclick="selectItemForQuantity(${item.id})" class="group cursor-pointer flex flex-col items-center p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all">
            <div class="relative w-full aspect-square mb-2">
                <img src="${item.image}" class="w-full h-full object-contain group-hover:scale-110 transition-transform">
            </div>
            <span class="text-[10px] text-slate-400 uppercase tracking-tighter text-center line-clamp-1">${item.name}</span>
            <span class="text-[11px] font-semibold text-indigo-600">${item.value}</span>
        </div>
    `).join('');
}

function selectItemForQuantity(itemId) {
    selectedItem = PETS.find(i => i.id === itemId);
    if (!selectedItem) return;
    
    const qtySelector = document.getElementById('quantitySelector');
    if (!qtySelector) { console.error("Quantity selector modal not found."); return; }

    const qtyPetImage = document.getElementById('qtyPetImage');
    if (qtyPetImage) qtyPetImage.src = selectedItem.image; else console.warn("qtyPetImage element not found.");

    const qtyPetName = document.getElementById('qtyPetName');
    if (qtyPetName) qtyPetName.innerText = selectedItem.name; else console.warn("qtyPetName element not found.");

    const qtyPetValue = document.getElementById('qtyPetValue');
    if (qtyPetValue) qtyPetValue.innerText = selectedItem.value; else console.warn("qtyPetValue element not found.");

    const qtyInput = document.getElementById('itemQuantityInput');
    if (!qtyInput) { console.error("itemQuantityInput element not found."); return; }

    // Reset input state
    qtyInput.value = 1;
    qtyInput.min = 1;
    qtyInput.max = parseInt(selectedItem.exists) || 1; // Max quantity is how many exist

    // Ensure input is not disabled or read-only
    qtyInput.removeAttribute('disabled');
    qtyInput.value = 1;
    qtyInput.min = 1;
    qtyInput.max = parseInt(selectedItem.exists) || 1; // Max quantity is how many exist

    if (isNaN(parseInt(selectedItem.exists))) {
        console.warn(`Item '${selectedItem.name}' has a non-numeric 'exists' value: '${selectedItem.exists}'. Max quantity set to 1.`);
    }

    qtySelector.classList.remove('invisible', 'opacity-0', 'pointer-events-none');
    qtySelector.classList.add('visible', 'opacity-100');
}

function adjustQuantity(delta) {
    const qtyInput = document.getElementById('itemQuantityInput');
    let currentQty = parseInt(qtyInput.value) || 1;
    let newQty = currentQty + delta;

    newQty = Math.max(parseInt(qtyInput.min), newQty);
    newQty = Math.min(parseInt(qtyInput.max), newQty);

    qtyInput.value = newQty;
}

function confirmAddItem() {
    const qtyInput = document.getElementById('itemQuantityInput');
    let quantity = parseInt(qtyInput.value) || 1;
    
    // Strict clamp: Ensure manually typed numbers don't exceed exists, even if input max is bypassed
    const max = selectedItem ? (parseInt(selectedItem.exists) || 1) : 1;
    quantity = Math.min(max, Math.max(1, quantity));

    if (selectedItem && quantity > 0) {
        addItemToTrade(selectedItem, quantity);
    }
}

function cancelQuantitySelection() {
    const qtySelector = document.getElementById('quantitySelector');
    if (qtySelector) qtySelector.classList.remove('visible', 'opacity-100');
    qtySelector.classList.add('invisible', 'opacity-0');
    selectedItem = null;
}

function addItemToTrade(item, quantity) {
    if (item) {
        tradeState[currentSide].items.push({ ...item, quantity: quantity });
        updateTradeTotals();
        renderTradeSide(currentSide);
        closePicker();
    }
}

function removeItem(side, index) {
    tradeState[side].items.splice(index, 1);
    updateTradeTotals();
    renderTradeSide(side);
}

function adjustTradeItemQuantity(side, index, delta) {
    const item = tradeState[side].items[index];
    if (!item) return;

    let currentQty = item.quantity;
    let newQty = currentQty + delta;

    newQty = Math.max(1, newQty); // Minimum 1
    newQty = Math.min(parseInt(item.exists) || 1, newQty); // Max is how many exist

    item.quantity = newQty;
    updateTradeTotals();
    renderTradeSide(side);
}

function clearTrade(side) {
    tradeState[side].items = [];
    tradeState[side].gems = 0;
    document.getElementById(`${side}Gems`).value = '';
    updateTradeTotals();
    renderTradeSide(side);
}

function updateTradeTotals() {
    ['your', 'their'].forEach(side => {
        let gemsVal = 0;
        const gemsInput = document.getElementById(`${side}Gems`);
        if (gemsInput) {
            gemsVal = parseInt(gemsInput.value) || 0;
        } else {
            console.warn(`Gems input for side '${side}' not found.`);
        }
        tradeState[side].gems = gemsVal;
        
        let itemsTotal = 0;
        if (typeof window.parseValue === 'function') {
            itemsTotal = tradeState[side].items.reduce((sum, item) => sum + window.parseValue(item.value) * item.quantity, 0);
        } else {
            console.error("window.parseValue is not defined. Cannot accurately calculate item totals.");
            // Fallback to a simple sum if parseValue is missing, though it might be inaccurate for 'M', 'B' values
            itemsTotal = tradeState[side].items.reduce((sum, item) => sum + (parseFloat(item.value) || 0) * item.quantity, 0);
        }
        tradeState[side].total = itemsTotal + gemsVal;

        const sideTotalElement = document.getElementById(`${side}Total`);
        if (sideTotalElement) {
            if (typeof window.formatValue === 'function') {
                sideTotalElement.innerText = window.formatValue(tradeState[side].total);
            } else {
                sideTotalElement.innerText = tradeState[side].total.toLocaleString();
                console.warn("window.formatValue is not defined. Using default toLocaleString().");
            }
        }

        const sideItemCountElement = document.getElementById(`${side}ItemCount`);
        if (sideItemCountElement) {
            sideItemCountElement.innerText = tradeState[side].items.length;
        }

        const sideGemsDisplayElement = document.getElementById(`${side}GemsDisplay`);
        if (sideGemsDisplayElement) {
            if (typeof window.formatValue === 'function') {
                sideGemsDisplayElement.innerText = gemsVal > 0 ? window.formatValue(gemsVal) : '0';
            } else {
                sideGemsDisplayElement.innerText = gemsVal > 0 ? gemsVal.toLocaleString() : '0';
                console.warn("window.formatValue is not defined. Using default toLocaleString().");
            }
        }
    });

    calculateVerdict();
}

function renderTradeSide(side) {
    const grid = document.getElementById(`${side}TradeGrid`);
    if (!grid) {
        console.error(`Trade grid for side '${side}' not found.`);
        return;
    }
    grid.innerHTML = tradeState[side].items.map((item, index) => `
        <div class="relative group aspect-square bg-slate-50/50 dark:bg-white/5 rounded-xl p-1 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 border border-transparent hover:border-slate-200 dark:hover:border-white/20 transition-all overflow-visible">
            <span class="absolute top-0 left-0 bg-indigo-600 text-white text-[8px] px-1 py-0.5 rounded-br-lg z-10">${item.quantity}x</span>
            <button onclick="removeItem('${side}', ${index})" class="absolute -top-1.5 -right-1.5 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/20 text-slate-400 dark:text-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all z-20 flex items-center justify-center hover:text-red-500 hover:border-red-100">
                <svg class="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
            <img src="${item.image}" class="w-10 h-10 object-contain mb-1 group-hover:scale-105 transition-transform">
            <span class="text-[8px] font-semibold text-slate-500 dark:text-white">${item.value}</span>
            <div class="absolute bottom-0 left-0 right-0 bg-white/80 dark:bg-black/95 backdrop-blur-sm flex items-center justify-center py-0.5 px-0.5 rounded-b-xl opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button onclick="adjustTradeItemQuantity('${side}', ${index}, -1)" class="w-5 h-5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">-</button>
                <span class="text-[9px] font-semibold text-slate-700 dark:text-white mx-1">${item.quantity}</span>
                <button onclick="adjustTradeItemQuantity('${side}', ${index}, 1)" class="w-5 h-5 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">+</button>
            </div>
        </div>
    `).join('');
}

function calculateVerdict() {
    const yourVal = tradeState.your.total;
    const theirVal = tradeState.their.total;
    const verdictTextElement = document.getElementById('verdictText');
    const meter = document.getElementById('fairnessMeter');

    if (!verdictTextElement || !meter) {
        console.error("Verdict elements not found.");
        return;
    }

    if (yourVal === 0 && theirVal === 0) { // No items on either side
        verdictTextElement.innerText = '-';
        verdictTextElement.className = "text-4xl font-normal tracking-tighter transition-all duration-500 text-slate-400 dark:text-white";
        meter.style.width = '50%';
        if (document.documentElement.classList.contains('dark-mode')) {
            meter.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        } else {
            meter.style.backgroundColor = '#e2e8f0';
        }
        return;
    }

    // Pure value-wise ratio comparison
    const ratio = theirVal / (yourVal || 1);
    let verdict = "FAIR";
    let color = "text-indigo-600";
    let bgColor = "#6366f1";
    let percent = 50;

    if (yourVal === 0) { // Getting items for free
        verdict = "BIG WIN"; color = "text-emerald-500"; bgColor = "#10b981"; percent = 95;
    } else if (theirVal === 0) { // Giving items for free
        verdict = "BIG LOSS"; color = "text-red-500"; bgColor = "#ef4444"; percent = 5;
    } else if (ratio >= 1.2) {
        verdict = "BIG WIN"; color = "text-emerald-500"; bgColor = "#10b981"; percent = 95;
    } else if (ratio >= 1.05) {
        verdict = "WIN"; color = "text-emerald-400"; bgColor = "#34d399"; percent = 75;
    } else if (ratio >= 0.95) {
        verdict = "FAIR"; color = "text-indigo-600"; bgColor = "#6366f1"; percent = 50;
    } else if (ratio >= 0.8) {
        verdict = "LOSS"; color = "text-orange-400"; bgColor = "#fb923c"; percent = 25;
    } else {
        verdict = "BIG LOSS"; color = "text-red-500"; bgColor = "#ef4444"; percent = 5;
    }

    verdictTextElement.innerText = verdict;
    verdictTextElement.className = `text-4xl font-normal tracking-tighter transition-all duration-500 ${color}`;
    meter.style.width = `${percent}%`;
    meter.style.backgroundColor = bgColor;
}

function generateShareLink() {
    const state = {
        yI: tradeState.your.items.map(i => ({ name: i.name, qty: i.quantity })),
        yG: tradeState.your.gems,
        tI: tradeState.their.items.map(i => ({ name: i.name, qty: i.quantity })),
        tG: tradeState.their.gems
    };
    
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?trade=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
        if (typeof window.showToast === 'function') {
            window.showToast("Trade link copied!");
        }
    });
}

function loadTradeFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const tradeData = params.get('trade');
    if (tradeData && typeof PETS !== 'undefined' && Array.isArray(PETS)) { // Ensure PETS is an array
        try {
            const decoded = JSON.parse(atob(tradeData));
            
            const loadSide = (side, dataItems, dataGems) => {
                if (dataItems && Array.isArray(dataItems)) {
                    dataItems.forEach(obj => { // PETS is guaranteed to be an array here
                        const item = PETS.find(p => p.name === obj.name);
                        if (item) tradeState[side].items.push({...item, quantity: obj.qty || 1});
                    });
                }
                if (dataGems) {
                    tradeState[side].gems = parseInt(dataGems);
                    document.getElementById(`${side}Gems`).value = dataGems;
                }
                renderTradeSide(side);
            };

            loadSide('your', decoded.yI, decoded.yG);
            loadSide('their', decoded.tI, decoded.tG);
            updateTradeTotals();
        } catch (e) {
            console.error("Failed to load trade link", e);
        }
    } else if (tradeData) {
        console.warn("PETS data not available or not an array when trying to load trade from URL.");
    }
}

// Close modal on escape key
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePicker();
});


function initCalculator() {
    const checkReady = () => {
        if (typeof PETS !== 'undefined' && Array.isArray(PETS)) {
            loadTradeFromUrl();
            updateTradeTotals();
            console.log("Calculator Initialized Successfully");
        } else {
            setTimeout(checkReady, 100);
        }
    };
    checkReady();
}

window.addEventListener('load', initCalculator);