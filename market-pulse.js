/**
 * PEINF Market Pulse Logic
 * Displays a live feed of price changes detected in data.js
 */

document.addEventListener('DOMContentLoaded', () => {
    renderPulseFeed();
});

function renderPulseFeed() {
    const feed = document.getElementById('pulseFeed');
    if (!feed) return;

    // Create filter UI if it doesn't exist
    if (!document.getElementById('pulseFilters')) {
        const filterBar = document.createElement('div');
        filterBar.id = 'pulseFilters';
        filterBar.className = 'flex justify-center gap-4 mb-8';
        filterBar.innerHTML = `<button onclick="toggleSniperMode()" id="sniperBtn" class="px-6 py-2 rounded-full border border-slate-200 text-[10px] uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all">Sniper Mode (High Impact)</button>`;
        feed.before(filterBar);
    }

    const autoHistory = JSON.parse(localStorage.getItem('peinf-auto-history') || '{}');
    const changes = [];

    // Analyze history for changes
    Object.keys(autoHistory).forEach(id => {
        const petHistory = autoHistory[id];
        const petData = PETS.find(p => p.id == id);
        if (!petData || petHistory.length < 2) return;

        // Iterate backwards to find changes
        for (let i = petHistory.length - 1; i > 0; i--) {
            const current = petHistory[i];
            const previous = petHistory[i - 1];

            if (current.value !== previous.value) {
                const curVal = parseValue(current.value);
                const prevVal = parseValue(previous.value);
                const isRising = curVal > prevVal;
                
                changes.push({
                    pet: petData,
                    oldVal: previous.value,
                    newVal: current.value,
                    date: current.date,
                    isRising: isRising,
                    percentChange: Math.abs(((curVal - prevVal) / prevVal) * 100),
                    timestamp: new Date(current.date).getTime()
                });
            }
        }
    });

    // Sort by most recent change and limit to 25 max
    changes.sort((a, b) => b.timestamp - a.timestamp);

    let filteredChanges = changes;
    if (window.isSniperMode) {
        filteredChanges = changes.filter(c => c.percentChange >= 10);
    }

    const displayChanges = filteredChanges.slice(0, 25);

    if (changes.length === 0) {
        feed.innerHTML = `
            <div class="reveal p-12 bg-white border border-slate-100 rounded-[3rem] text-center">
                <p class="text-slate-400 font-normal">No recent price changes recorded yet. Market activity will appear here as you update the database.</p>
            </div>
        `;
        if (window.AnimationEngine) AnimationEngine.refresh();
        return;
    }

    feed.innerHTML = displayChanges.map((change, index) => `
        <div class="reveal p-6 bg-white border border-slate-100 rounded-[2.5rem] hover-lift flex flex-col md:flex-row items-center gap-6" style="transition-delay: ${index * 50}ms">
            <div class="w-16 h-16 flex-shrink-0 bg-slate-50 dark:bg-slate-900 rounded-2xl p-2">
                <img src="${change.pet.image}" class="w-full h-full object-contain">
            </div>
            
            <div class="flex-grow text-center md:text-left">
                <div class="flex flex-wrap justify-center md:justify-start items-center gap-3 mb-1">
                    <h3 class="text-lg font-normal text-slate-900">${change.pet.name}</h3>
                    <span class="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-md ${change.isRising ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}">
                        ${change.isRising ? 'Rising' : 'Crashing'}
                    </span>
                </div>
                <p class="text-slate-400 text-xs font-normal">${change.date}</p>
            </div>

            <div class="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 px-6 py-3 rounded-2xl">
                <span class="text-slate-400 line-through text-sm font-normal">${change.oldVal}</span>
                <svg class="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                </svg>
                <span class="${change.isRising ? 'text-emerald-500' : 'text-red-500'} text-xl font-normal">${change.newVal}</span>
            </div>
            
            <button onclick="openDetails(${change.pet.id})" class="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-normal hover:bg-indigo-700 transition-all">View Analytics</button>
        </div>
    `).join('');

    if (window.AnimationEngine) AnimationEngine.refresh();
}

window.toggleSniperMode = function() {
    window.isSniperMode = !window.isSniperMode;
    const btn = document.getElementById('sniperBtn');
    btn.classList.toggle('bg-indigo-600', window.isSniperMode);
    btn.classList.toggle('text-white', window.isSniperMode);
    btn.classList.toggle('border-indigo-600', window.isSniperMode);
    renderPulseFeed();
};