// Game State
const gameState = {
    currentScene: 'start',
    inventory: [],
    stats: {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        intelligence: 10,
        agility: 10,
        gold: 50,
        level: 1,
        xp: 0
    },
    flags: {
        hasTorch: false,
        metAlric: false,
        knowsAboutCult: false,
        ratDefeated: false
    },
    quests: {
        main: "Find a way out of the dungeon",
        side: []
    }
};

// Game Scenes Database
const scenes = {
    start: {
        title: "The Awakening",
        text: `You wake up in a dimly lit stone chamber, your head pounding. The air is damp and cold. The last thing you remember is drinking at the Rusty Tankard tavern in Riverdale, but how did you get here? As your eyes adjust, you see:
        <ul>
            <li>A wooden door to your left, slightly ajar</li>
            <li>A rusted iron grate in the floor</li>
            <li>A flickering torch on the wall</li>
        </ul>
        Your pockets contain 50 gold coins and a crumpled note that reads: "The ritual must be completed by the blood moon."`,
        onEnter: function() {
            gameState.inventory = ["50 Gold"];
            updateInventory();
        },
        choices: [
            {
                text: "Examine the wooden door",
                nextScene: "door_examine"
            },
            {
                text: "Investigate the iron grate",
                nextScene: "grate_examine"
            },
            {
                text: "Take the torch from the wall",
                nextScene: "take_torch"
            }
        ]
    },
    door_examine: {
        title: "The Wooden Door",
        text: "The door is old but sturdy, made of oak planks bound with iron bands. It's slightly ajar, revealing a dark corridor beyond. You hear faint scratching sounds coming from somewhere down the hall.",
        choices: [
            {
                text: "Open the door wider and proceed",
                nextScene: gameState.flags.hasTorch ? "dark_corridor_torch" : "dark_corridor"
            },
            {
                text: "Listen more carefully at the door",
                nextScene: "listen_at_door"
            },
            {
                text: "Return to the chamber",
                nextScene: "start"
            }
        ]
    },
    take_torch: {
        title: "The Flickering Torch",
        text: "You reach up and take the torch from its sconce. The flame provides welcome warmth and better illumination of the chamber.",
        onEnter: function() {
            if (!gameState.flags.hasTorch) {
                gameState.inventory.push("Torch");
                gameState.flags.hasTorch = true;
                updateInventory();
            }
        },
        choices: [
            {
                text: "Examine the wooden door (now with better light)",
                nextScene: "door_examine_torch"
            },
            {
                text: "Investigate the iron grate (now with better light)",
                nextScene: "grate_examine_torch"
            }
        ]
    },
    door_examine_torch: {
        title: "The Wooden Door",
        text: "With the torch illuminating your surroundings, you notice details you missed before. The door's iron bands bear strange runes, and there are deep scratch marks near the base. The corridor beyond is still dark, but your torchlight reveals cobwebs and dust.",
        choices: [
            {
                text: "Proceed through the door",
                nextScene: "dark_corridor_torch"
            },
            {
                text: "Examine the runes more closely",
                nextScene: "examine_runes"
            },
            {
                text: "Return to the chamber",
                nextScene: "start"
            }
        ]
    },
    examine_runes: {
        title: "Mysterious Runes",
        text: "The runes are ancient and unfamiliar, but one pattern keeps repeating. You recall a scholar at the tavern mentioning similar symbols - they're part of a binding or containment spell. Whatever is beyond this door was meant to be kept in, not out.",
        choices: [
            {
                text: "Proceed anyway (you need to escape)",
                nextScene: "dark_corridor_torch"
            },
            {
                text: "Maybe try the grate instead",
                nextScene: "grate_examine_torch"
            }
        ]
    },
    dark_corridor: {
        title: "The Dark Corridor",
        text: "You step into the corridor, barely able to see. The scratching sound grows louder. Suddenly, you feel something brush against your leg! A rat the size of a small dog emerges, its eyes glowing faintly in the darkness.",
        choices: [
            {
                text: "Try to scare it away",
                nextScene: "scare_rat"
            },
            {
                text: "Attack it with your bare hands",
                nextScene: "fight_rat"
            },
            {
                text: "Retreat back to the chamber",
                nextScene: "start"
            }
        ]
    },
    dark_corridor_torch: {
        title: "The Illuminated Corridor",
        text: "With your torch lighting the way, you see the corridor extends about 30 feet before turning left. The scratching sound comes from around the corner. As you approach, a giant rat emerges - but with your light, you see it's not alone. There are bones scattered about, and another rat lurking further down.",
        choices: [
            {
                text: "Use the torch to scare them",
                nextScene: "scare_rats_torch",
                requirements: { inventory: ["Torch"] }
            },
            {
                text: "Attack the nearest rat",
                nextScene: "fight_rat_torch"
            },
            {
                text: "Back away slowly",
                nextScene: "start"
            }
        ]
    },
    scare_rats_torch: {
        title: "Torch Repellent",
        text: "You wave the torch aggressively at the rats. The flames reflect in their beady eyes as they squeal and scatter into holes in the walls. The path ahead is now clear.",
        onEnter: function() {
            gameState.flags.ratDefeated = true;
            addXP(25);
        },
        choices: [
            {
                text: "Continue down the corridor",
                nextScene: "corridor_continue"
            },
            {
                text: "Search the area where the rats were",
                nextScene: "search_rat_area"
            }
        ]
    },
    corridor_continue: {
        title: "Dungeon Corridors",
        text: "The corridor turns left and then right, descending slightly. The air grows colder. You pass several empty cells before hearing a faint voice ahead...",
        choices: [
            {
                text: "Approach the voice cautiously",
                nextScene: "find_alric"
            },
            {
                text: "Stay silent and listen",
                nextScene: "listen_to_voice"
            }
        ]
    },
    find_alric: {
        title: "The Prisoner",
        text: "In the last cell on the left, a gaunt man in tattered robes clutches the bars. 'Thank the gods!' he whispers hoarsely. 'I'm Alric, a mage from the Arcane College. They captured me weeks ago for refusing to join their cult.'",
        onEnter: function() {
            gameState.flags.metAlric = true;
            gameState.quests.side.push("Help Alric escape");
        },
        choices: [
            {
                text: "Ask about the cult",
                nextScene: "ask_about_cult"
            },
            {
                text: "Offer to help him escape",
                nextScene: "help_alric"
            },
            {
                text: "Continue exploring",
                nextScene: "leave_alric"
            }
        ]
    },
    ask_about_cult: {
        title: "The Blood Moon Cult",
        text: "Alric's eyes widen. 'They serve an ancient entity that demands blood sacrifices. The note you found - they're planning a ritual during the blood moon, which is in three nights. They've been kidnapping people with magical potential.' He looks at you meaningfully.",
        onEnter: function() {
            gameState.flags.knowsAboutCult = true;
            gameState.quests.main = "Stop the Blood Moon Cult's ritual";
        },
        choices: [
            {
                text: "How can we stop them?",
                nextScene: "stop_cult_plan"
            },
            {
                text: "First, let's get you out",
                nextScene: "help_alric"
            }
        ]
    },
    // Additional scenes would continue the story...
    // Here's a partial list of what you'd want to add:
    // - Help Alric escape sequence
    // - Find weapons/armor
    // - Discover more about the cult
    // - Encounter cult members
    // - Find the ritual chamber
    // - Multiple endings based on choices
    
    // Example combat scene
    fight_rat_torch: {
        title: "Combat: Giant Rat",
        text: "You swing at the giant rat with your torch!",
        onEnter: function() {
            // Combat calculations
            const playerDamage = Math.max(2, gameState.stats.strength + Math.floor(Math.random() * 6));
            const ratDamage = Math.max(3, Math.floor(Math.random() * 8));
            
            gameState.stats.health -= ratDamage;
            
            if (gameState.stats.health <= 0) {
                return "player_death";
            }
            
            this.text += `<br><br><span class="combat-text">You hit the rat for ${playerDamage} damage! It bites you for ${ratDamage} damage.</span>`;
            
            // Check if rat is defeated
            if (playerDamage >= 8 || Math.random() > 0.5) {
                this.text += "<br><br>The rat squeals and retreats into the shadows!";
                gameState.flags.ratDefeated = true;
                addXP(25);
                this.choices = [
                    {
                        text: "Continue down the corridor",
                        nextScene: "corridor_continue"
                    }
                ];
            } else {
                this.choices = [
                    {
                        text: "Keep fighting",
                        nextScene: "fight_rat_torch_continue"
                    },
                    {
                        text: "Try to retreat",
                        nextScene: "retreat_from_rat"
                    }
                ];
            }
            
            updateStats();
        },
        choices: [] // Dynamically set above
    },
    
    player_death: {
        title: "You Have Died",
        text: "As your vision fades to black, you feel your life slipping away. Your journey ends here...",
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

// DOM Elements
const storyDisplay = document.getElementById('story-display');
const choicesContainer = document.getElementById('choices-container');
const inventoryList = document.getElementById('inventory-list');
const statsDisplay = document.getElementById('stats-display');

// Game Functions
function initGame() {
    loadScene(gameState.currentScene);
    updateInventory();
    updateStats();
}

function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error(`Scene ${sceneId} not found!`);
        storyDisplay.innerHTML = `<h2>Error</h2><p>Scene not found. The game may be incomplete.</p>`;
        return;
    }
    
    gameState.currentScene = sceneId;
    
    // Display scene title and text
    storyDisplay.innerHTML = `<h2>${scene.title}</h2><div>${scene.text}</div>`;
    
    // Clear previous choices
    choicesContainer.innerHTML = '';
    
    // Check if there's an onEnter function
    if (scene.onEnter) {
        const result = scene.onEnter();
        if (result) {
            // If onEnter returns a scene ID, load that instead
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
                choice.requirements.inventory.forEach(item => {
                    if (!gameState.inventory.includes(item)) {
                        requirementsMet = false;
                    }
                });
            }
        }
        
        if (!requirementsMet) {
            button.disabled = true;
        } else {
            button.addEventListener('click', () => {
                if (choice.onSelect) {
                    choice.onSelect();
                }
                loadScene(choice.nextScene);
            });
        }
        
        choicesContainer.appendChild(button);
    });
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
    
    const statsToShow = [
        { name: 'Level', value: gameState.stats.level },
        { name: 'XP', value: `${gameState.stats.xp}/${gameState.stats.level * 100}` },
        { name: 'Health', value: `${gameState.stats.health}/${gameState.stats.maxHealth}`, class: 'health-text' },
        { name: 'Mana', value: `${gameState.stats.mana}/${gameState.stats.maxMana}`, class: 'mana-text' },
        { name: 'Gold', value: gameState.stats.gold, class: 'gold-text' },
        { name: 'Strength', value: gameState.stats.strength },
        { name: 'Intelligence', value: gameState.stats.intelligence },
        { name: 'Agility', value: gameState.stats.agility }
    ];
    
    statsToShow.forEach(stat => {
        const div = document.createElement('div');
        div.className = 'stat-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.className = 'stat-name';
        nameSpan.textContent = stat.name + ':';
        
        const valueSpan = document.createElement('span');
        valueSpan.textContent = stat.value;
        if (stat.class) {
            valueSpan.className = stat.class;
        }
        
        div.appendChild(nameSpan);
        div.appendChild(valueSpan);
        statsDisplay.appendChild(div);
    });
}

function addXP(amount) {
    gameState.stats.xp += amount;
    const xpNeeded = gameState.stats.level * 100;
    if (gameState.stats.xp >= xpNeeded) {
        levelUp();
    }
    updateStats();
}

function levelUp() {
    gameState.stats.level++;
    gameState.stats.xp = 0;
    gameState.stats.maxHealth += 10;
    gameState.stats.health = gameState.stats.maxHealth;
    gameState.stats.maxMana += 5;
    gameState.stats.mana = gameState.stats.maxMana;
    gameState.stats.strength += 2;
    gameState.stats.intelligence += 2;
    gameState.stats.agility += 2;
    
    // Show level up message
    const levelUpMsg = document.createElement('div');
    levelUpMsg.className = 'combat-text';
    levelUpMsg.textContent = `LEVEL UP! You are now level ${gameState.stats.level}!`;
    storyDisplay.appendChild(levelUpMsg);
}

function resetGame() {
    gameState.currentScene = 'start';
    gameState.inventory = ["50 Gold"];
    gameState.stats = {
        health: 100,
        maxHealth: 100,
        mana: 50,
        maxMana: 50,
        strength: 10,
        intelligence: 10,
        agility: 10,
        gold: 50,
        level: 1,
        xp: 0
    };
    gameState.flags = {
        hasTorch: false,
        metAlric: false,
        knowsAboutCult: false,
        ratDefeated: false
    };
    gameState.quests = {
        main: "Find a way out of the dungeon",
        side: []
    };
    
    updateInventory();
    updateStats();
    loadScene('start');
}

// Start the game when the page loads
window.onload = initGame;
