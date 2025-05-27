// Game State
const gameState = {
    currentScene: 'start',
    inventory: [],
    stats: {
        name: "Adventurer",
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        intelligence: 12,
        agility: 11,
        gold: 50,
        level: 1,
        xp: 0,
        daysPassed: 0
    },
    flags: {
        hasTorch: false,
        metAlric: false,
        knowsAboutCult: false,
        ratDefeated: false,
        foundDagger: false,
        moonPhase: 1
    },
    quests: {
        main: ["Discover why you were imprisoned"],
        side: [],
        completed: []
    }
};

// DOM Elements
const storyContent = document.getElementById('story-content');
const choicesContainer = document.getElementById('choices-container');
const inventoryList = document.getElementById('inventory-list');
const statsDisplay = document.getElementById('stats-display');
const questDisplay = document.getElementById('quest-display');
const moonPhaseDisplay = document.getElementById('moon-phase');

// Scenes Database
const scenes = {
    start: {
        title: "The Prisoner's Awakening",
        text: `<p>Pain. That's the first sensation as consciousness returns—a throbbing ache at your skull's base pulsing with each heartbeat. Your mouth tastes of copper and ashes, tongue sticking to your parched palate. The cold stone beneath leaches warmth, its rough surface pressing against your cheek.</p>

        <p>Blinking away the fog, the dim chamber resolves into view. Flickering torchlight casts elongated shadows dancing across damp walls like restless spirits. The air is thick with mildew and something more metallic—blood perhaps?</p>
        
        <p>Your fingers brush against crumpled parchment in your pocket. Unfolding it reveals hastily scrawled words: <em>"The ritual must be completed by the blood moon."</em> The ink glistens faintly, as if still wet.</p>`,
        choices: [
            {
                text: "Examine the wooden door (listen to its creaking hinges)",
                nextScene: "door_examine"
            },
            {
                text: "Investigate the iron grate (feel its rusted edges)",
                nextScene: "grate_examine"
            },
            {
                text: "Take the torch from the wall (feel its warmth)",
                nextScene: "take_torch"
            }
        ],
        onEnter: function() {
            gameState.inventory = ["50 Gold", "Crumpled Note"];
            updateGameUI();
        }
    },

    door_examine: {
        title: "The Ancient Door",
        text: `<p>Your fingertips trace deep grooves in the oak—some from tools, others less identifiable. The iron bands are icy, their metallic scent mixing with dank corridor air whispering through the gap.</p>

        <p>Pressing your ear to the wood reveals:</p>
        <ul>
            <li>Distant <em>drip-drip-drip</em> echoing like a macabre metronome</li>
            <li>Faint scuttling—claws on stone perhaps?</li>
            <li>Occasional wet snuffling raising your neck hairs</li>
        </ul>`,
        choices: [
            {
                text: "Open the door wider (hear its groan)",
                nextScene: function() { 
                    return gameState.flags.hasTorch ? "dark_corridor_torch" : "dark_corridor"; 
                }
            },
            {
                text: "Listen more intently (focus your senses)",
                nextScene: "listen_at_door"
            },
            {
                text: "Return to chamber's center",
                nextScene: "start"
            }
        ]
    },

    take_torch: {
        title: "Claiming the Flame",
        text: `<p>The torch's rough handle warms your chilled hands as burning pitch crackles, releasing resinous perfume overwhelming the dungeon's staleness. New details emerge:</p>
        <ul>
            <li>Strange carvings beneath wall grime</li>
            <li>Dark stains radiating from the grate</li>
            <li>Dust motes dancing like fireflies</li>
        </ul>`,
        onEnter: function() {
            if (!gameState.flags.hasTorch) {
                gameState.inventory.push("Torch");
                gameState.flags.hasTorch = true;
                addXP(10);
                updateGameUI();
            }
        },
        choices: [
            {
                text: "Examine door with new light",
                nextScene: "door_examine_torch"
            },
            {
                text: "Investigate grate's surroundings",
                nextScene: "grate_examine_torch"
            }
        ]
    },

    dark_corridor_torch: {
        title: "The Illuminated Path",
        text: `<p>Torchlight reveals the corridor's glistening walls and two giant rats—each terrier-sized—gnawing on what might've been a deer leg. Their greasy fur is matted with unidentifiable substances, yellowed teeth gleaming as they freeze in your light.</p>`,
        choices: [
            {
                text: "Brandish the torch aggressively",
                nextScene: "scare_rats_torch",
                requirements: { inventory: ["Torch"] }
            },
            {
                text: "Search for a weapon among bones",
                nextScene: "search_bones"
            },
            {
                text: "Attempt to sneak past quietly",
                nextScene: "sneak_past_rats"
            }
        ]
    },

    scare_rats_torch: {
        title: "Fire and Fury",
        text: `<p>Your torch thrust makes flames leap. The rats' eyes glow red, pupils shrinking to pinpricks before they shriek and scramble away, leaving behind:</p>
        <ul>
            <li>A dagger glinting among bones</li>
            <li>A previously unnoticed side passage</li>
            <li>The main corridor continuing downward</li>
        </ul>`,
        onEnter: function() {
            gameState.flags.ratDefeated = true;
            addXP(25);
            updateGameUI();
        },
        choices: [
            {
                text: "Claim the dagger",
                nextScene: "take_dagger"
            },
            {
                text: "Explore the side passage",
                nextScene: "rat_passage"
            },
            {
                text: "Continue down main corridor",
                nextScene: "corridor_continue"
            }
        ]
    }
};

// Game Functions
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error("Scene not found:", sceneId);
        storyContent.innerHTML = `<p>Error: The path forward is obscured...</p>`;
        return;
    }

    gameState.currentScene = sceneId;
    
    // Update story display
    storyContent.innerHTML = `
        <h2>${scene.title}</h2>
        <div>${scene.text}</div>
    `;
    
    // Clear previous choices
    choicesContainer.innerHTML = '';
    
    // Run scene entry actions
    if (scene.onEnter) {
        const result = scene.onEnter();
        if (result) {
            loadScene(result);
            return;
        }
    }
    
    // Add new choices
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        
        // Check requirements
        let requirementsMet = true;
        if (choice.requirements) {
            if (choice.requirements.inventory) {
                requirementsMet = choice.requirements.inventory.every(item => 
                    gameState.inventory.includes(item)
                );
            }
        }
        
        if (!requirementsMet) {
            button.disabled = true;
        } else {
            button.addEventListener('click', () => {
                if (choice.onSelect) choice.onSelect();
                const nextScene = typeof choice.nextScene === 'function' 
                    ? choice.nextScene() 
                    : choice.nextScene;
                loadScene(nextScene);
            });
        }
        
        choicesContainer.appendChild(button);
    });
}

function updateGameUI() {
    updateInventory();
    updateStats();
    updateQuests();
    updateMoonPhase();
}

function updateInventory() {
    inventoryList.innerHTML = '';
    if (gameState.inventory.length === 0) {
        inventoryList.innerHTML = '<li>Empty</li>';
    } else {
        gameState.inventory.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            inventoryList.appendChild(li);
        });
    }
}

function updateStats() {
    statsDisplay.innerHTML = '';
    
    const stats = [
        { name: 'Health', value: `${gameState.stats.health}/${gameState.stats.maxHealth}`, class: 'health-text' },
        { name: 'Mana', value: `${gameState.stats.mana}/${gameState.stats.maxMana}`, class: 'mana-text' },
        { name: 'Gold', value: gameState.stats.gold, class: 'gold-text' },
        { name: 'Level', value: gameState.stats.level },
        { name: 'XP', value: `${gameState.stats.xp}/${gameState.stats.level * 100}` },
        { name: 'Strength', value: gameState.stats.strength },
        { name: 'Intelligence', value: gameState.stats.intelligence },
        { name: 'Agility', value: gameState.stats.agility }
    ];
    
    stats.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'stat-name';
        nameSpan.textContent = stat.name;
        
        const valueSpan = document.createElement('span');
        valueSpan.textContent = stat.value;
        if (stat.class) valueSpan.className = stat.class;
        
        div.appendChild(nameSpan);
        div.appendChild(valueSpan);
        statsDisplay.appendChild(div);
    });
}

function updateQuests() {
    questDisplay.innerHTML = '';
    
    const mainQuest = document.createElement('div');
    mainQuest.innerHTML = `<strong>Main Quest:</strong> ${gameState.quests.main.join(' • ')}`;
    questDisplay.appendChild(mainQuest);
    
    if (gameState.quests.side.length > 0) {
        const sideQuests = document.createElement('div');
        sideQuests.innerHTML = `<strong>Side Quests:</strong><ul>${
            gameState.quests.side.map(q => `<li>${q}</li>`).join('')
        }</ul>`;
        questDisplay.appendChild(sideQuests);
    }
}

function updateMoonPhase() {
    const phases = ["New", "Waxing Crescent", "First Quarter", "Waxing Gibbous", 
                   "Full", "Waning Gibbous", "Last Quarter", "Waning Crescent"];
    gameState.flags.moonPhase = (gameState.flags.moonPhase + 1) % 8;
    moonPhaseDisplay.style.boxShadow = `inset -${12 - gameState.flags.moonPhase * 1.5}px 0 0 0 var(--blood)`;
    moonPhaseDisplay.title = phases[gameState.flags.moonPhase];
}

function addXP(amount) {
    gameState.stats.xp += amount;
    const xpNeeded = gameState.stats.level * 100;
    if (gameState.stats.xp >= xpNeeded) {
        levelUp();
    }
}

function levelUp() {
    gameState.stats.level++;
    gameState.stats.xp = 0;
    gameState.stats.maxHealth += 10;
    gameState.stats.health = gameState.stats.maxHealth;
    gameState.stats.maxMana += 5;
    gameState.stats.mana = gameState.stats.maxMana;
    
    const levelUpMsg = document.createElement('div');
    levelUpMsg.className = 'combat-text';
    levelUpMsg.textContent = `LEVEL UP! You are now level ${gameState.stats.level}!`;
    storyContent.appendChild(levelUpMsg);
    
    updateStats();
}

// Initialize game
window.onload = function() {
    loadScene('start');
};
