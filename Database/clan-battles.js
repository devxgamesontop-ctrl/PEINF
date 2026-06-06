const BATTLES = [
    {
        id: 4,
        name: "Mining Battle!",
        date: "May 5 - May 12",
        status: "Active",
        endDate: "2026-05-12T12:00:00Z",
        category: "Clan Battle #4",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed (1) (1).png",
        description: "",
        leaderboard: [
            { clan: "LUCK 🥇", points: "Huge Minecart Astra Dominus" },
            { clan: "KOOP 🥈", points: "Shiny Rainbow Onyx Golem" },
            { clan: "BOSH 🥉", points: "Rainbow Onyx Golem" }
        ]
    },
    {
        id: 3,
        name: "Kaiju Battle!",
        date: "April 27 - May 4",
        status: "Completed",
        category: "Clan Battle #3",
        winner: "KOOP",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/HugeKaijuBerserker_Basic.png",
        reward: "Rainbow Huge Kaiju Bearserker"
    },
    {
        id: 2,
        name: "Sensei Battle!",
        date: "April 19 - April 26",
        status: "Completed",
        category: "Clan Battle #2",
        winner: "BOSH",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/HugeSenseiCat_Basic.png",
        reward: "Huge Sensei Cat"
    },
    {
        id: 1,
        name: "Starlight Battle!",
        date: "April 13 - April 14",
        status: "Completed",
        category: "Clan Battle #1",
        winner: "KOOP",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/HugeStarlightHamster.png",
        reward: "Huge Starlight Hamster"
    }
];

const activeBattleSection = document.getElementById('activeBattleSection');
const battleGrid = document.getElementById('battleGrid');

function startCountdown(endDateStr) {
    const timerElement = document.getElementById('countdownTimer');
    if (!timerElement) return;

    const endDate = new Date(endDateStr).getTime();

    const x = setInterval(function() {
        const now = new Date().getTime();
        const distance = endDate - now;

        if (distance < 0) {
            clearInterval(x);
            timerElement.textContent = "Battle ended!";
            return;
        }

        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timerElement.textContent = `Ending in: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

function renderBattles() {
    const sortedBattles = [...BATTLES].sort((a, b) => b.id - a.id);
    const active = sortedBattles.find(b => b.status === "Active");
    const past = sortedBattles.filter(b => b.status === "Completed");

    if (active) {
        activeBattleSection.innerHTML = `
            <div class="reveal text-center mb-12">
                <div class="flex justify-center items-center gap-3 mb-6">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                    <span class="meta-pill bg-indigo-50 text-indigo-600 font-normal ml-1">${active.category}</span>
                    <span id="countdownTimer" class="text-slate-400 text-[11px] uppercase tracking-widest font-normal">Tournament Active</span>
                </div>
                <h1 class="text-7xl font-normal text-slate-900 mb-6 tracking-tighter leading-none">${active.name}</h1>
                <p class="text-slate-500 text-xl font-normal max-w-2xl mx-auto leading-relaxed opacity-80">${active.description}</p>
            </div>

            <div class="featured-image-container mb-12">
                <img src="${active.image}" class="w-full h-auto block">
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                ${active.leaderboard.map((entry, i) => `
                    <div class="reveal p-8 flex flex-col items-center text-center" style="transition-delay: ${i * 150}ms">
                        <span class="text-slate-300 text-xs font-normal uppercase tracking-widest mb-4">Rank #${i + 1}</span>
                        <h3 class="text-2xl font-normal text-slate-900 mb-2">${entry.clan}</h3>
                        <span class="text-[11px] text-indigo-500 uppercase tracking-[0.15em] font-normal">${entry.points}</span>
                    </div>
                `).join('')}
            </div>
        `;
        startCountdown(active.endDate);
    }

    battleGrid.className = "flex flex-col border-t border-black/10"; 
    
    // Table-style Header
    let headerHtml = `
        <div class="hidden md:flex items-center gap-6 px-6 py-4 text-[10px] font-normal uppercase tracking-[0.2em] text-slate-400 dark:text-white border-b border-black/5">
            <div class="w-12">#</div>
            <div class="flex-grow">Battle Name & Series</div>
            <div class="w-48">Date</div>
            <div class="w-48 text-right">Champion</div>
        </div>
    `;

    battleGrid.innerHTML = headerHtml + past.map((battle, index) => `
        <div class="reveal tilt-card hover-lift flex flex-col md:flex-row md:items-center gap-4 md:gap-6 p-6 md:px-6 md:py-4 border-b border-slate-100 transition-colors" style="transition-delay: ${index * 50}ms; opacity:0">
            <div class="hidden md:block w-12 text-slate-300 text-sm">0${past.length - index}</div>

            <div class="flex-grow flex items-center gap-4">
                <div class="w-10 h-10 rounded-lg overflow-hidden border border-black/5 flex-shrink-0 bg-white group">
                    <img src="${battle.image}" class="w-full h-full object-cover transition-transform group-hover:scale-110">
                </div>
                <div>
                    <div class="text-indigo-500 text-[9px] uppercase tracking-widest mb-0.5">${battle.category}</div>
                    <h3 class="text-lg font-normal text-slate-900 leading-tight">${battle.name}</h3>
                </div>
            </div>

            <div class="w-48 text-slate-500 text-sm font-normal">
                ${battle.date}
            </div>

            <div class="w-48 flex md:justify-end items-center gap-3">
                <div class="flex flex-col items-end hidden md:flex">
                    <span class="text-[9px] text-slate-400 uppercase tracking-widest mb-0.5">Top Reward</span>
                    <span class="text-[11px] text-slate-600 truncate max-w-[140px]">${battle.reward}</span>
                </div>
                <span class="meta-pill bg-emerald-50 text-emerald-600 text-[10px] font-normal border border-emerald-100/50">${battle.winner}</span>
            </div>
        </div>
    `).join('');

    if (window.AnimationEngine) {
        AnimationEngine.refresh();
    }
}

document.addEventListener('DOMContentLoaded', renderBattles);