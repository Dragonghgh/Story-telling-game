// ========================
// **GAME STATE & CONFIG**
// ========================
const gameState = {
    currentScene: 'start',
    inventory: [],
    stats: {
        name: "",
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 12,
        intelligence: 14,
        agility: 10,
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
        knowsTrueName: false,
        moonPhase: 1, // 0-7 (New Moon to Waning Crescent)
        helpedPrisoners: false,
        ritualStopped: false,
        spellLearned: false
    },
    quests: {
        main: ["Discover why you were imprisoned"],
        side: [],
        completed: []
    },
    knownSpells: [],
    companions: []
};

// Moon phases (affects story events)
const moonPhases = [
    { name: "New Moon", description: "The night is darkest—perfect for hidden deeds." },
    { name: "Waxing Crescent", description: "A sliver of light returns to the sky." },
    { name: "First Quarter", description: "Half the moon watches silently." },
    { name: "Waxing Gibbous", description: "The Blood Moon draws near..." },
    { name: "Full Moon", description: "The Crimson Maw hungers." },
    { name: "Waning Gibbous", description: "The moon’s power fades slowly." },
    { name: "Last Quarter", description: "The night grows quiet again." },
    { name: "Waning Crescent", description: "The cycle nears its end." }
];

// Spells the player can learn
const spells = {
    emberSpark: {
        name: "Ember Spark",
        cost: 10,
        effect: "Deals 15 fire damage",
        description: "A flicker of flame that burns foes."
    },
    shadowVeil: {
        name: "Shadow Veil",
        cost: 15,
        effect: "Boosts agility by 5 for 3 turns",
        description: "Cloaks you in darkness."
    }
};

// Enemies
const enemies = {
    giantRat: {
        name: "Giant Rat",
        health: 30,
        maxHealth: 30,
        damage: "1d6 + 2",
        loot: ["Rat Tail", "5 Gold"]
    },
    cultistAcolyte: {
        name: "Cultist Acolyte",
        health: 50,
        maxHealth: 50,
        damage: "1d8 + 3",
        loot: ["Cultist Robe", "10 Gold"]
    }
};

// ========================
// **CORE GAME FUNCTIONS**
// ========================
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error(`Scene not found: ${sceneId}`);
        storyContent.innerHTML = `<p>The path forward is obscured by mist...</p>`;
        return;
    }

    gameState.currentScene = sceneId;
    storyContent.innerHTML = `<h2>${scene.title}</h2><div>${scene.text}</div>`;
    choicesContainer.innerHTML = '';

    // Run scene entry actions
    if (scene.onEnter) scene.onEnter();

    // Add choices
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;

        // Check requirements
        let canChoose = true;
        if (choice.requirements) {
            if (choice.requirements.inventory) {
                canChoose = choice.requirements.inventory.every(item => 
                    gameState.inventory.includes(item)
                );
            }
            if (choice.requirements.stats) {
                for (const stat in choice.requirements.stats) {
                    if (gameState.stats[stat] < choice.requirements.stats[stat]) {
                        canChoose = false;
                        break;
                    }
                }
            }
        }

        if (!canChoose) {
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
    inventoryList.innerHTML = gameState.inventory.map(item => `<li>${item}</li>`).join('') || '<li>Empty</li>';
}

function updateStats() {
    statsDisplay.innerHTML = `
        <div class="stat-item"><span>Health:</span> <span class="health-text">${gameState.stats.health}/${gameState.stats.maxHealth}</span></div>
        <div class="stat-item"><span>Mana:</span> <span class="mana-text">${gameState.stats.mana}/${gameState.stats.maxMana}</span></div>
        <div class="stat-item"><span>Gold:</span> <span class="gold-text">${gameState.stats.gold}</span></div>
        <div class="stat-item"><span>Level:</span> ${gameState.stats.level}</div>
    `;
}

function updateQuests() {
    questDisplay.innerHTML = `
        <div><strong>Main Quest:</strong> ${gameState.quests.main.join(' → ')}</div>
        ${gameState.quests.side.length ? `<div><strong>Side Quests:</strong> ${gameState.quests.side.join(', ')}</div>` : ''}
    `;
}

function updateMoonPhase() {
    const phase = moonPhases[gameState.flags.moonPhase];
    moonPhaseDisplay.style.boxShadow = `inset -${15 - gameState.flags.moonPhase * 2}px 0 0 0 var(--blood)`;
    moonPhaseDisplay.title = `${phase.name}\n${phase.description}`;
}

// ========================
// **COMBAT SYSTEM**
// ========================
function startCombat(enemyType) {
    const enemy = { ...enemies[enemyType] };
    let combatLog = [];

    function renderCombat() {
        storyContent.innerHTML = `
            <h2>Combat: ${enemy.name}</h2>
            <div class="combatant">
                <span>${gameState.stats.name}</span>
                <div class="combat-health"><div class="combat-health-fill" style="width:${(gameState.stats.health / gameState.stats.maxHealth) * 100}%"></div></div>
            </div>
            <div class="combatant">
                <span>${enemy.name}</span>
                <div class="combat-health"><div class="combat-health-fill" style="width:${(enemy.health / enemy.maxHealth) * 100}%"></div></div>
            </div>
            <div class="combat-log">
                ${combatLog.map(msg => `<p>${msg}</p>`).join('')}
            </div>
        `;

        choicesContainer.innerHTML = `
            <button class="combat-btn" onclick="playerAttack()">Attack</button>
            <button class="combat-btn" onclick="castSpell()">Cast Spell</button>
            <button class="combat-btn" onclick="fleeCombat()">Flee</button>
        `;
    }

    window.playerAttack = function() {
        const damage = Math.floor(Math.random() * 6) + gameState.stats.strength;
        enemy.health -= damage;
        combatLog.push(`You strike the ${enemy.name} for ${damage} damage!`);

        if (enemy.health <= 0) {
            endCombat(true);
            return;
        }

        enemyTurn();
        renderCombat();
    };

    window.castSpell = function() {
        if (gameState.knownSpells.length === 0) {
            combatLog.push("You know no spells!");
            renderCombat();
            return;
        }
        // (Would open spell selection UI)
        combatLog.push("You cast a spell!");
        enemyTurn();
        renderCombat();
    };

    window.fleeCombat = function() {
        combatLog.push("You flee from battle!");
        endCombat(false);
    };

    function enemyTurn() {
        const damage = Math.floor(Math.random() * 8) + 3;
        gameState.stats.health -= damage;
        combatLog.push(`The ${enemy.name} hits you for ${damage} damage!`);

        if (gameState.stats.health <= 0) {
            loadScene('player_death');
        }
    }

    function endCombat(victory) {
        if (victory) {
            combatLog.push(`You defeated the ${enemy.name}!`);
            addXP(20);
            enemy.loot.forEach(item => gameState.inventory.push(item));
        }
        loadScene(gameState.currentScene); // Return to previous scene
    }

    renderCombat();
}

// ========================
// **SCENES & STORY**
// ========================
const scenes = {
    start: {
        title: "The Prisoner's Awakening",
        text: `<p>You awaken in a cold, stone chamber. The air smells of damp earth and something metallic. A single torch flickers weakly on the wall.</p>`,
        choices: [
            { text: "Take the torch", nextScene: "take_torch" },
            { text: "Examine the door", nextScene: "door_examine" }
        ],
        onEnter: function() {
            gameState.inventory = ["50 Gold"];
            if (!gameState.stats.name) {
                gameState.stats.name = prompt("What is your name?", "Adventurer");
            }
            updateGameUI();
        }
    },
    take_torch: {
        title: "Claiming the Flame",
        text: `<p>The torch's warmth is comforting. The light reveals strange carvings on the walls.</p>`,
        onEnter: function() {
            gameState.inventory.push("Torch");
            gameState.flags.hasTorch = true;
            updateGameUI();
        },
        choices: [
            { text: "Explore further", nextScene: "dark_corridor" }
        ]
    },
    dark_corridor: {
        title: "The Dark Corridor",
        text: `<p>The corridor stretches into darkness. Something moves in the shadows...</p>`,
        choices: [
            { 
                text: "Fight the giant rat", 
                nextScene: function() { 
                    startCombat('giantRat'); 
                    return 'combat'; 
                } 
            }
        ]
    },
    player_death: {
        title: "Defeated...",
        text: `<p>Your vision fades to black. The Blood Moon rises...</p>`,
        choices: [
            { 
                text: "Start Over", 
                nextScene: "start",
                onSelect: function() {
                    resetGame();
                }
            }
        ]
    }
};

// ========================
// **INITIALIZE GAME**
// ========================
function resetGame() {
    gameState.stats.health = gameState.stats.maxHealth;
    gameState.inventory = ["50 Gold"];
    gameState.flags.hasTorch = false;
    loadScene('start');
}

window.onload = function() {
    loadScene('start');
};
