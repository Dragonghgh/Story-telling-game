// Game State
const gameState = {
    currentScene: 'start',
    inventory: [],
    stats: {
        health: 100,
        maxHealth: 100,
        strength: 10,
        intelligence: 10,
        agility: 10,
        gold: 50
    },
    flags: {}
};

// Game Scenes Database
const scenes = {
    start: {
        title: "The Awakening",
        text: "You wake up in a dimly lit stone chamber, your head pounding. The air is damp and cold. The last thing you remember is the tavern in Riverdale, but how did you get here? As your eyes adjust, you see:<ul><li>A wooden door to your left, slightly ajar</li><li>A rusted iron grate in the floor</li><li>A flickering torch on the wall</li></ul>What do you do?",
        choices: [
            {
                text: "Examine the wooden door",
                nextScene: "door_examine",
                requirements: null
            },
            {
                text: "Investigate the iron grate",
                nextScene: "grate_examine",
                requirements: null
            },
            {
                text: "Take the torch from the wall",
                nextScene: "take_torch",
                requirements: null
            }
        ]
    },
    door_examine: {
        title: "The Wooden Door",
        text: "The door is old but sturdy, made of oak planks bound with iron bands. It's slightly ajar, revealing a dark corridor beyond. You hear faint scratching sounds coming from somewhere down the hall.",
        choices: [
            {
                text: "Open the door wider and proceed",
                nextScene: "dark_corridor",
                requirements: null
            },
            {
                text: "Listen more carefully at the door",
                nextScene: "listen_at_door",
                requirements: null
            },
            {
                text: "Return to the chamber",
                nextScene: "start",
                requirements: null
            }
        ]
    },
    // Add many more scenes here to expand your game
    dark_corridor: {
        title: "The Dark Corridor",
        text: "You step into the corridor, the wooden floor creaking under your weight. The scratching sound grows louder. Suddenly, you see movement in the shadows ahead! A rat the size of a small dog emerges, its eyes glowing red in the darkness.",
        choices: [
            {
                text: "Try to scare it away",
                nextScene: "scare_rat",
                requirements: null
            },
            {
                text: "Attack it with your bare hands",
                nextScene: "fight_rat",
                requirements: null
            },
            {
                text: "Retreat back to the chamber",
                nextScene: "start",
                requirements: null
            }
        ]
    },
    // Example of a scene with inventory requirements
    take_torch: {
        title: "The Flickering Torch",
        text: "You reach up and take the torch from its sconce. The flame provides welcome warmth and better illumination of the chamber.",
        onEnter: function() {
            gameState.inventory.push("Torch");
            updateInventory();
        },
        choices: [
            {
                text: "Examine the wooden door (now with better light)",
                nextScene: "door_examine_torch",
                requirements: null
            },
            {
                text: "Investigate the iron grate (now with better light)",
                nextScene: "grate_examine_torch",
                requirements: null
            }
        ]
    },
    // Example of a combat scene
    fight_rat: {
        title: "Combat: Giant Rat",
        text: "You swing at the giant rat with your fists!",
        onEnter: function() {
            // Simple combat resolution
            const damage = Math.max(1, gameState.stats.strength - 3 + Math.floor(Math.random() * 4));
            gameState.stats.health -= 5; // Rat bites back
            
            if (gameState.stats.health <= 0) {
                return "player_death";
            }
            
            this.text += `<br><br>You hit the rat for ${damage} damage! It bites you for 5 damage.`;
            updateStats();
        },
        choices: [
            {
                text: "Continue fighting",
                nextScene: "fight_rat_continue",
                requirements: null
            },
            {
                text: "Try to flee back to the chamber",
                nextScene: "flee_from_rat",
                requirements: null
            }
        ]
    },
    // Example of a death scene
    player_death: {
        title: "You Have Died",
        text: "As your vision fades to black, you feel the rat's teeth sinking into your throat. Your journey ends here...",
        choices: [
            {
                text: "Start Over",
                nextScene: "start",
                onSelect: function() {
                    // Reset game state
                    gameState.inventory = [];
                    gameState.stats = {
                        health: 100,
                        maxHealth: 100,
                        strength: 10,
                        intelligence: 10,
                        agility: 10,
                        gold: 50
                    };
                    gameState.flags = {};
                    updateStats();
                    updateInventory();
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

// Initialize the game
function initGame() {
    loadScene(gameState.currentScene);
    updateInventory();
    updateStats();
}

// Load a scene
function loadScene(sceneId) {
    const scene = scenes[sceneId];
    if (!scene) {
        console.error(`Scene ${sceneId} not found!`);
        return;
    }
    
    gameState.currentScene = sceneId;
    
    // Display scene title and text
    storyDisplay.innerHTML = `<h2>${scene.title}</h2><p>${scene.text}</p>`;
    
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
        
        button.addEventListener('click', () => {
            if (choice.onSelect) {
                choice.onSelect();
            }
            loadScene(choice.nextScene);
        });
        
        choicesContainer.appendChild(button);
    });
}

// Update inventory display
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

// Update stats display
function updateStats() {
    statsDisplay.innerHTML = '';
    for (const [stat, value] of Object.entries(gameState.stats)) {
        const div = document.createElement('div');
        div.className = 'stat-item';
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = stat.charAt(0).toUpperCase() + stat.slice(1) + ':';
        
        const valueSpan = document.createElement('span');
        valueSpan.textContent = value;
        
        if (stat === 'health') {
            valueSpan.textContent = `${value}/${gameState.stats.maxHealth}`;
            valueSpan.style.color = value < gameState.stats.maxHealth * 0.3 ? 'red' : 
                                  (value < gameState.stats.maxHealth * 0.7 ? 'yellow' : 'green');
        }
        
        div.appendChild(nameSpan);
        div.appendChild(valueSpan);
        statsDisplay.appendChild(div);
    }
}

// Start the game when the page loads
window.onload = initGame;
