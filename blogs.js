const BLOGS = [
    {
        id: 6,
        title: "Update 5-6",
        date: "April 26th, 2026 - May 1st, 2026",
        author: "@ark",
        excerpt: "🌠Mine ores, 🚀Upgrade your drill, 🔨Purchase Boosts 💎Open the giant gift! 🎁 <br> <br> 😎Combine Pets, 🥚Hatch new pets, ✨New Upgrades, 💣New Drills, Bug Fixes 🎮",
        category: "Announcement",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/Update5-6.png",
        headerImage: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/Update5-6.png",
        articleTitle: "Update 5",
        content: `
            <div class="flex gap-4 mb-10 justify-center md:justify-start">
                <button id="btn-pt1" onclick="switchMiningTab(1)" class="px-6 py-2 rounded-xl text-sm font-normal transition-all bg-indigo-600 text-white">Part 1</button>
                <button id="btn-pt2" onclick="switchMiningTab(2)" class="px-6 py-2 rounded-xl text-sm font-normal transition-all bg-slate-100 text-slate-600 hover:bg-slate-200">Part 2</button>
            </div>

            <div id="mining-pt1" class="font-normal">
                <h2 class="text-4xl font-normal mb-4 tracking-tight">Pet Extra Infinity - Mining Event!</h2>
                <p class="mb-8 text-slate-500 text-lg">🌠Mine ores, 🚀Upgrade your drill, 🔨Purchase Boosts 💎Open the giant gift! 🎁</p>
                <p class="mb-6 text-slate-400 uppercase tracking-widest text-[10px]">Featuring:</p>

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🔨Mining Event🔨</h3>
                <p class="mb-6">Use your drill to get gems! Buy fuel from the Mining Merchant!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(2).png" class="w-full h-auto rounded-3xl mb-8">
                
                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🥚Mining Eggs🥚</h3>
                <p class="mb-4 italic text-sm">🐙Hatch the brand new mining eggs for some limited time pets!🐈 Check out these new LIMITED pets!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(3).png" class="w-full h-auto rounded-3xl mb-8">
                <ul class="space-y-1 mb-6 text-slate-600 list-disc ml-5 text-sm">
                    <li>Mining Hamster - Found in the mining eggs 1, 2 & 3</li>
                    <li>Mining Dragon - Found in the mining eggs 1, 2 & 3</li>
                    <li>Minecart Bobcat - Found in the mining eggs 1, 2 & 3</li>
                    <li>Minecart Axolotl - Found in the mining eggs 1, 2 & 3</li>
                    <li>Mining Kraken - Found in the mining eggs 2 & 3</li>
                    <li>Abstract Fairy - Found in the mining eggs 2 & 3</li>
                    <li>Abyss Peacock - Found in the mining egg 3</li>
                    <li>Gift Mining Cat - Found in the mining egg 3</li>
                    <li>Huge Mining Kraken - Found in the mining egg 3</li>
                    <li>Huge Gift Mining Cat - Found in the mining egg 3</li>
                </ul>
                <p class="mb-8 text-center text-indigo-500 italic text-sm">Hurry up! These are only available for a limited time!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(2).jpg" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(1).jpg" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(4).png" class="w-full h-auto rounded-3xl mb-8">
                
                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🌌New huge!🌌</h3>
                <p class="mb-8">🚀The brand new Huge Abyss Agony is here! Get it by Drilling!🚀</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(5).png" class="w-full h-auto rounded-3xl mb-8">
                
                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🛒Mining Merchant🛒</h3>
                <p class="mb-4 font-normal">💎Purchase tons of mining goods here!👑</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(7).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(6).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🎁Mining Gift🎁</h3>
                <p class="mb-4 italic">✨Feeling lucky? Fill up the gift with luck!✨</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5">
                    <li>Sapphire Gem - Used in Mining Event Part 2!</li>
                    <li>Ruby Gem - Used to upgrade your drill speed!</li>
                    <li>Rainbow Gem - Used to upgrade your drill crit!</li>
                    <li>Amethyst Gem - Used to upgrade your drill damage!</li>
                    <li>Emerald Gem - Used to upgrade your drill luck!</li>
                    <li>Drill Damage I & II - 150% (I) and 300% (II)!</li>
                    <li>Drill Speed I & II - 150% (I) and 300% (II)!</li>
                    <li>Hellfire Crystal - Used to fuel the drill!</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(9).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(8).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🥇Depth Leaderboard🥇</h3>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5">
                    <li>Huge Mining Kraken - Given to the top 1-3!</li>
                    <li>Hellfire Gift (x25) - Given to the top 4-10!</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(10).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">💰Drill Upgrades💰</h3>
                <p class="mb-4 italic">🎉Upgrade your drill for more crystals and coins!🎉</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>Obsidian Drill - Reach 10,000m depth, Insert 500 fuel and claim 25 drill rewards!</li>
                    <li>Solar Drill - Reach 100,000m depth, Insert 2,500 fuel and claim 250 drill rewards!</li>
                    <li>Diamond Drill - Reach 1,000,000m depth, Insert 10,000 fuel and claim 1,000 drill rewards!</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(11).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">💎Drill Boost Upgrades💎</h3>
                <p class="mb-4 italic">🎉Upgrade your drill to deal more damage, be faster and more!🎉</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>+0.1x Drill Speed - Level 5 Max!</li>
                    <li>+0.1x Drill Luck - Level 5 Max!</li>
                    <li>+0.05% Drill Crit - Level 10 Max!</li>
                    <li>+5 Drill DMG - Level 50 Max!</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(13).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(12).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-indigo-600">🎫New Clan Battle🎫</h3>
                <p class="mb-4 italic">🕶Ready to watch it roll? Will KOOP or BOSH win?🕶</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>Rainbow Huge Kaiju Bearserker - Top 1 Clan!</li>
                    <li>Huge Kaiju Bearserker - Top 2 Clan!</li>
                    <li>Kaiju Bearserker - Top 3 Clan!</li>
                    <li>Clan Battle Gift #3 - Top 4-10 Clans!</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(14).png" class="w-full h-auto rounded-3xl mb-8">
                <p class="mb-8 text-sm">Clan battle ending May 1st!</p>

                <div class="mt-12 pt-8 border-t border-slate-100">
                    <h3 class="text-lg font-normal mb-2 text-slate-900">🎩Notice🎩</h3>
                    <p class="text-xs text-slate-400 mb-4">This website was NOT created by the developer himself, it was made by a HUGE fan named <span class="text-yellow-500">@coderhorror</span>.</p>
                    <p class="text-slate-500 font-normal italic">- Happy Drilling!</p>
                </div>
            </div>

            <div id="mining-pt2" class="font-normal hidden">
                <h2 class="text-4xl font-normal mb-4 tracking-tight">Pet Extra Infinity - Mining Event Part 2!</h2>
                <p class="mb-8 text-slate-500 text-lg">😎Combine Pets, 🥚Hatch new pets, ✨New Upgrades, 💣New Drills, Bug Fixes 🎮</p>
                <p class="mb-6 text-slate-400 uppercase tracking-widest text-[10px]">Featuring:</p>

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🔨Mining Event Part 2🔨</h3>
                <p class="mb-6 text-slate-600">Use the Combine-O-Matic For new gems, 5 new pets! Hatch the 2 new eggs!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(3).jpg" class="w-full h-auto rounded-3xl mb-8">
                
                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🥚New Mining Eggs🥚</h3>
                <p class="mb-4 italic">🐙Hatch the brand new mining eggs for some AWESOME pets!🐈</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5">
                    <li>Mining Noob - Found in the mining eggs 4 & 5</li>
                    <li>Mining Beaver - Found in the mining eggs 4 & 5</li>
                    <li>Minecart Zebra - Found in the mining eggs 4 & 5</li>
                    <li>Minecart Dominus Astra - Found in the mining eggs 4 & 5</li>
                    <li>Gem Wyvern - Found in the mining eggs 4 & 5</li>
                    <li>Gem Cat - Found in the mining egg 5</li>
                    <li>Broken Mining Robot - Found in the mining egg 5 & Combine-O-Matic</li>
                    <li>Huge Broken Mining Robot - Found in the mining egg 5</li>
                </ul>
                <p class="mb-10 text-emerald-500 italic text-sm">Go hatch! These are only available for a limited time aswell as the others!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(5).jpg" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(4).jpg" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(15).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🎉Combine-O-Matic!🎉</h3>
                <p class="mb-4">✨The Mining Combine-O-Matic has arrived!✨</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>Rainbow Gem - Requires 10x Sapphire Gems</li>
                    <li>Quartz Gem - Requires 3x Rainbow Gems</li>
                    <li>Onyx Gem - Requires 3x Quartz Gems</li>
                    <li>Broken Mining Robot - Requires 3x Onyx Gems</li>
                    <li>Onyx Gem Golem - Requires 5x Broken Mining Robot</li>
                    <li>Obsidian Butterfly - Requires 5x Broken Mining Robot</li>
                    <li>Huge Obsidian Butterfly - Requires 3x Obsidian Butterfly</li>
                    <li>Huge Onyx Gem Golem - Requires 5x Onyx Gem Golem</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(6).jpg" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(18).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(17).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(16).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🔨Drill Pack🔨</h3>
                <p class="mb-8 text-slate-600 text-sm">Get SPECIAL items from this bundle! Limited time and only for 59 robux!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(19).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🎫Clan Tickets!🎫</h3>
                <p class="mb-8 text-slate-600 text-sm">Do YOU want to create your own clan but don't have any tickets? Now's your chance! Purchase ONE Clan ticket for only 10,000 Diamonds!</p>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(20).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">💎New Drill Upgrades!💎</h3>
                <p class="mb-4 italic">3 Brand new Drill Upgrades have arrived!</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>+100 Drill Power - Gives +100 Power for each Quartz Gem used!</li>
                    <li>+100k Power Size - Gives +100,000 Power Size for each Onyx Gem used!</li>
                    <li>Optimize Drill - Makes your drill use less power but lets it be faster!</li>
                </ul>

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">👑New Drills!👑</h3>
                <p class="mb-4">Ready to shred the soil with these new drills?</p>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5">
                    <li>🌌Blackhole Drill - Reach 3,000,000m depth, Insert 35,000 fuel and claim 2,000 drill rewards!🌌</li>
                    <li>🌍Classic Drill - Reach 10,000,000m depth, Insert 100,000 fuel and claim 5,000 drill rewards!🌍</li>
                </ul>
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(23).png" class="w-full h-auto rounded-3xl mb-4">
                <img src="https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/unnamed%20(22).png" class="w-full h-auto rounded-3xl mb-8">

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🚀Changes🚀</h3>
                <p class="mb-4">🚨Huges in Fantasy World are now easier!🚨</p>

                <h3 class="text-2xl font-normal mb-4 text-emerald-600">🪓Bug Fixes🪓</h3>
                <ul class="space-y-1 mb-8 text-slate-600 list-disc ml-5 text-sm">
                    <li>Trading now should be not super laggy, added search to trading.</li>
                    <li>Super Magnet in Fantasy Hell Island now works.</li>
                    <li>Fixed Hoverboard on Mobile sinking you into the ground.</li>
                    <li>Fixed UIs on Mobile and Tablets.</li>
                    <li>Fixed mining merchant giving too many points to clan battle</li>
                    <li>Fixed Currency UI on phone and on PC, now event coins are moved to the bottom of the screen.</li>
                    <li>Coins now working much better + Auto Farm!</li>
                    <li>And more...</li>
                </ul>
                
                <div class="mt-10 pt-6 border-t border-slate-100">
                    <h3 class="text-sm font-normal mb-2 text-slate-900">💬Rowner's Comment💬</h3>
                    <p class="text-slate-400 text-xs italic">I hope you like the update, Admin abuse May 2nd!</p>
                </div>
            </div>
        `
    },
            {
        id: 4,
        title: "Update 4",
        date: "April 19th, 2026",
        author: "@coderhorror",
        excerpt: "🌌Unlock a new world, 🚨Get new huges, 🔥Travel through areas, New clan battle 🎫",
        category: "Announcement",
        image: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/Update4.png",
        headerImage: "https://raw.githubusercontent.com/devxgamesontop-ctrl/PEINF/main/Update4.png",
        articleTitle: "Pet Extra Infinity - Fantasy World!",
        content: `
            <p class="mb-8 text-slate-500 text-lg font-normal">🌌Unlock a new world, 🚨Get new huges, 🔥Travel through areas, New clan battle 🎫</p>
            <p class="mb-6 text-slate-400 uppercase tracking-widest text-[10px] font-normal">Featuring:</p>

            <h3 class="text-2xl font-normal mb-4 text-indigo-600">🎠Fantasy World🎠</h3>
            <p class="mb-6 font-normal">Unlock brand new areas<br>Explore the true Fantasy!</p>

            <h3 class="text-2xl font-normal mb-4 text-indigo-600">🥚Fantasy Eggs🥚</h3>
            <p class="mb-4 italic text-sm font-normal">🐙Hatch the brand new fantasy eggs for some BRAND NEW pets!🐈</p>
            
            <div class="space-y-6">
                <div>
                    <h4 class="text-indigo-500 text-sm font-normal mb-2">Fantasy Egg 1</h4>
                    <ul class="space-y-1 text-slate-600 list-disc ml-5 text-sm font-normal">
                        <li>Angel Monkey</li>
                        <li>Enchanted Chocolatik</li>
                        <li>Mossy Cat</li>
                        <li>Mossy Noob</li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-indigo-500 text-sm font-normal mb-2">Fantasy Egg 2</h4>
                    <ul class="space-y-1 text-slate-600 list-disc ml-5 text-sm font-normal">
                        <li>Glade</li>
                        <li>Wisp Capybara</li>
                        <li>Wisp Cat</li>
                        <li>Ninja Giraffe</li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-indigo-500 text-sm font-normal mb-2">Fantasy Egg 3</h4>
                    <ul class="space-y-1 text-slate-600 list-disc ml-5 text-sm font-normal">
                        <li>Lilypad Dog</li>
                        <li>Lilypad Tiger</li>
                        <li>Beegle Hamster</li>
                        <li>Beegle Deer</li>
                        <li>Fairy Floppa</li>
                        <li>Blossom Spirit Cat</li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-indigo-500 text-sm font-normal mb-2">Ember Chasm Egg</h4>
                    <ul class="space-y-1 text-slate-600 list-disc ml-5 text-sm font-normal">
                        <li>Hell Cat</li>
                        <li>Obsidian Rock</li>
                        <li>Demon Dragon</li>
                        <li>Hellish Dominus</li>
                        <li>Hellish Tanuki</li>
                        <li class="text-orange-500">Huge Hellish Dominus</li>
                    </ul>
                </div>

                <div>
                    <h4 class="text-indigo-500 text-sm font-normal mb-2">Halo Spires Egg</h4>
                    <ul class="space-y-1 text-slate-600 list-disc ml-5 text-sm font-normal">
                        <li>Angel Chocolatik</li>
                        <li>Angel Green Fish</li>
                        <li>Empyrean Cat</li>
                        <li>Empyrean Scorpion</li>
                        <li>God Wolf</li>
                        <li>Archgelus</li>
                        <li class="text-indigo-500">Huge Empyrean Scorpion</li>
                    </ul>
                </div>
            </div>
        `
    }
];

const blogGrid = document.getElementById('blogGrid');
const featuredSection = document.getElementById('featuredSection');
const blogModal = document.getElementById('blogModal');
const modalCategory = document.getElementById('modalCategory');
const modalDate = document.getElementById('modalDate');
const blogContent = document.getElementById('blogContent');

function renderBlogs() {
    const sortedBlogs = [...BLOGS].sort((a, b) => b.id - a.id);
    const featured = sortedBlogs[0];
    const others = sortedBlogs.slice(1);

    featuredSection.innerHTML = `
        <article onclick="openBlog(${featured.id})" class="reveal flex flex-col md:flex-row gap-10 cursor-pointer group mb-16 items-center" style="opacity:0">
            <div class="md:w-3/5 featured-image-container aspect-[16/9] overflow-hidden rounded-[2rem]">
                <img src="${featured.image || 'https://placehold.co/1200x675/f8fafc/cbd5e1?text='}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-[2rem]">
            </div>
            <div class="md:w-2/5 flex flex-col items-start">
                <div class="flex justify-between items-center w-full mb-4">
                    <span class="meta-pill bg-slate-100 text-slate-500 font-normal">${featured.category}</span>
                    <span class="text-slate-400 text-[11px] uppercase tracking-widest font-normal">${featured.date}</span>
                </div>
                <h2 class="text-5xl font-normal text-slate-900 mb-6 leading-[1.1] tracking-tight">${featured.title}</h2>
                <p class="text-slate-500 text-lg leading-relaxed font-normal mb-8">${featured.excerpt}</p>
                <div class="mt-auto">
                    <span class="read-more-btn font-normal">Read More</span>
                </div>
            </div>
        </article>
    `;

    blogGrid.innerHTML = others.map((blog, index) => `
        <article onclick="openBlog(${blog.id})" class="reveal tilt-card hover-lift flex flex-col cursor-pointer group" style="transition-delay: ${index * 100}ms; opacity:0">
            <div class="aspect-[16/10] overflow-hidden rounded-[1.5rem] mb-4">
                <img src="${blog.image || 'https://placehold.co/f8fafc/cbd5e1?text='}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 rounded-[1.5rem]">
            </div>
            <div class="flex justify-between items-center w-full mb-2 px-2">
                <span class="meta-pill-sm bg-slate-100 text-slate-500 font-normal">${blog.category}</span>
                <span class="text-slate-400 text-[10px] uppercase tracking-widest font-normal">${blog.date}</span>
            </div>
            <div class="px-2">
                <h2 class="text-xl font-normal text-slate-900 leading-snug">${blog.title}</h2>
            </div>
        </article>
    `).join('');

    if (window.AnimationEngine) {
        AnimationEngine.refresh();
    }
}

function openBlog(id) {
    const blog = BLOGS.find(b => b.id === id);
    if (!blog) return;

    // Add Progress Bar (clean up existing first)
    const existingProgress = document.getElementById('readingProgress');
    if (existingProgress) existingProgress.remove();
    
    const progress = document.createElement('div');
    progress.id = 'readingProgress';
    progress.style.width = '0%';
    blogModal.appendChild(progress);

    modalCategory.textContent = blog.category;
    modalDate.textContent = blog.date;
    blogContent.innerHTML = `
        <div class="max-w-3xl mx-auto modal-content-sigma-animate">
            <h1 id="blogMainTitle" class="text-6xl font-normal text-slate-900 dark:text-white mb-12 leading-[1.05] tracking-tight text-center md:text-left">${blog.articleTitle || blog.title}</h1>
            <img src="${blog.headerImage || blog.image || 'https://placehold.co/1200x514/f8fafc/cbd5e1?text='}" class="article-image w-full aspect-[21/9] object-cover mb-16 rounded-[32px] block">
            <div class="article-body">
                ${blog.content}
            </div>
        </div>
    `;

    blogModal.onscroll = () => {
        const winScroll = blogModal.scrollTop;
        const height = blogModal.scrollHeight - blogModal.clientHeight;
        const scrolled = (winScroll / height) * 100;
        document.getElementById('readingProgress').style.width = scrolled + "%";
    };

    blogModal.classList.add('modal-active');
    document.body.classList.add('lock-scroll');
}

function closeBlog() {
    const progress = document.getElementById('readingProgress');
    if (progress) progress.remove();
    blogModal.classList.remove('modal-active');
    document.body.classList.remove('lock-scroll');
}

window.switchMiningTab = function(part) {
    const pt1 = document.getElementById('mining-pt1');
    const pt2 = document.getElementById('mining-pt2');
    const btn1 = document.getElementById('btn-pt1');
    const btn2 = document.getElementById('btn-pt2');
    const mainTitle = document.getElementById('blogMainTitle');
    
    if(part === 1) {
        pt1.classList.remove('hidden');
        pt2.classList.add('hidden');
        btn1.className = "px-6 py-2 rounded-xl text-sm font-normal transition-all bg-indigo-600 text-white";
        btn2.className = "px-6 py-2 rounded-xl text-sm font-normal transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
        if (mainTitle) mainTitle.textContent = "Update 5";
    } else {
        pt1.classList.add('hidden');
        pt2.classList.remove('hidden');
        btn2.className = "px-6 py-2 rounded-xl text-sm font-normal transition-all bg-indigo-600 text-white";
        btn1.className = "px-6 py-2 rounded-xl text-sm font-normal transition-all bg-slate-100 text-slate-600 hover:bg-slate-200";
        if (mainTitle) mainTitle.textContent = "Update 6";
    }
};

document.addEventListener('DOMContentLoaded', renderBlogs);