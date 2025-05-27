// Enhanced Game State
const gameState = {
    currentScene: 'start',
    inventory: [],
    stats: {
        name: "",
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
        knowsTrueName: false,
        moonPhase: 0 // 0-7 representing moon phases
    },
    quests: {
        main: ["Discover why you were imprisoned", "Escape the dungeon"],
        side: [],
        completed: []
    },
    companions: [],
    knownSpells: []
};

// Moon Phases
const moonPhases = [
    "New Moon", "Waxing Crescent", "First Quarter", "Waxing Gibbous",
    "Full Moon", "Waning Gibbous", "Last Quarter", "Waning Crescent"
];

// Expanded Scenes Database
const scenes = {
    start: {
        title: "The Prisoner's Awakening",
        text: `<p>Pain. That's the first sensation that greets you as consciousness returns—a throbbing ache at the base of your skull that pulses in time with your heartbeat. Your mouth tastes of copper and ashes, your tongue sticking to the roof of your parched mouth. The cold stone beneath you leaches warmth from your body, its rough surface pressing uncomfortably against your cheek.</p>

        <p>As you blink away the fog of unconsciousness, the dim chamber slowly resolves into view. The only light comes from a single torch sputtering in its iron sconce, casting elongated shadows that dance across the damp walls like restless spirits. The air is thick with the scent of mildew and something more metallic—blood, perhaps?</p>
        
        <p>Your fingers brush against a crumpled parchment in your pocket. Unfolding it with stiff fingers, you squint at the hastily scrawled message: <em>"The ritual must be completed by the blood moon."</em> The ink glistens faintly, as if still wet despite the passage of time.</p>
        
        <p>Three paths present themselves:</p>
        <ul>
            <li><strong>A wooden door</strong> to your left stands slightly ajar, its ancient hinges creaking softly with each draft that carries whispers of the corridor beyond</li>
            <li><strong>An iron grate</strong> set into the floor exhales a chilling updraft that raises goosebumps on your exposed skin</li>
            <li><strong>The flickering torch</strong> crackles softly, its resinous smoke stinging your eyes but promising warmth and illumination</li>
        </ul>`,
        onEnter: function() {
            gameState.inventory = ["50 Gold", "Crumpled Note"];
            gameState.stats.name = prompt("What is your name, traveler?", "Aria") || "Aria";
            updateInventory();
            updateStats();
            updateQuests();
            updateMoonPhase();
        },
        choices: [
            {
                text: "Approach the wooden door (press your ear against its rough surface, listening)",
                nextScene: "door_examine"
            },
            {
                text: "Kneel by the iron grate (run your fingers along its rusted edges, feeling for weakness)",
                nextScene: "grate_examine"
            },
            {
                text: "Take the torch from the wall (feel its warmth chase away the dungeon's chill)",
                nextScene: "take_torch"
            }
        ]
    },

    door_examine: {
        title: "The Ancient Door",
        text: `<p>As you approach the door, your fingertips trace the deep grooves in its oak surface—some appear to be tool marks, others... something else. The iron bands binding the wood are icy to the touch, their metallic scent mixing with the dank corridor air whispering through the gap.</p>

        <p>Pressing your ear to the weathered wood, you hear:</p>
        <ul>
            <li>The distant <strong>drip-drip-drip</strong> of water echoing like a macabre metronome</li>
            <li>Faint <strong>scuttling</strong> sounds—claws on stone perhaps?</li>
            <li>An occasional wet, <strong>snuffling</strong> noise that raises the hairs on your neck</li>
        </ul>
        
        <p>The draft carries a new scent—something musky and animalistic underlying the ever-present dampness. The door's handle, when you brush against it, feels strangely warm compared to the chilled metal bands.</p>`,
        choices: [
            {
                text: "Open the door wider (hear the hinges groan in protest)",
                nextScene: function() { 
                    return gameState.flags.hasTorch ? "dark_corridor_torch" : "dark_corridor"; 
                }
            },
            {
                text: "Listen more intently (hold your breath, focus all your senses)",
                nextScene: "listen_at_door"
            },
            {
                text: "Return to the chamber's center (where the shadows feel less oppressive)",
                nextScene: "start"
            }
        ]
    },

    take_torch: {
        title: "Claiming the Flame",
        text: `<p>As your fingers close around the torch's rough wooden handle, warmth spreads through your chilled hands like liquid sunlight. The burning pitch pops and crackles, releasing a resinous perfume that momentarily overpowers the dungeon's stale odors.</p>

        <p>The sudden brightness makes your eyes water—details leap into focus:</p>
        <ul>
            <li>The glistening moisture on the walls reveals strange <strong>carvings</strong> beneath the grime</li>
            <li>The stone floor bears <strong>dark stains</strong> that radiate outward from the grate</li>
            <li>Countless <strong>dust motes</strong> dance in the heated air like tiny fireflies</li>
        </ul>
        
        <p>Shadows shrink back reluctantly, clinging to the corners as if alive. For the first time, you notice a <strong>shimmer</strong> in the air above the grate—perhaps heat distortion, or something more arcane?</p>`,
        onEnter: function() {
            if (!gameState.flags.hasTorch) {
                gameState.inventory.push("Torch");
                gameState.flags.hasTorch = true;
                updateInventory();
                addXP(10);
            }
        },
        choices: [
            {
                text: "Examine the door with new light (see what was hidden in darkness)",
                nextScene: "door_examine_torch"
            },
            {
                text: "Investigate the grate's surroundings (follow the strange stains)",
                nextScene: "grate_examine_torch"
            },
            {
                text: "Study the wall carvings (their patterns seem almost deliberate)",
                nextScene: "examine_carvings"
            }
        ]
    },

    door_examine_torch: {
        title: "Revelations in the Light",
        text: `<p>With the torch's golden glow, the door transforms before your eyes. What appeared as simple wear now reveals itself as intricate <strong>runes</strong> carved into the iron bands. Their swirling patterns seem to shift when viewed from different angles, occasionally emitting a faint <strong>blue shimmer</strong>.</p>

        <p>As you trace one with your fingertip, a static-like <strong>tingle</strong> travels up your arm. The sensation reminds you of touching a cat's fur in winter—that same strange energy.</p>
        
        <p>The scratch marks near the base now clearly show <strong>dried stains</strong>—the rusty brown of old blood mixed with something darker, almost purplish. The wood there feels strangely <strong>spongy</strong>, as if partially rotted from within.</p>
        
        <p>From beyond the door, the animalistic scent grows stronger, now carrying notes of <strong>wet fur</strong> and <strong>decaying meat</strong>.</p>`,
        choices: [
            {
                text: "Proceed through the door (feel the magic tingle as you cross)",
                nextScene: "dark_corridor_torch"
            },
            {
                text: "Study the runes more closely (their meaning tickles your memory)",
                nextScene: "examine_runes"
            },
            {
                text: "Search the chamber more thoroughly (the light reveals new details)",
                nextScene: "search_chamber_torch"
            }
        ]
    },

    examine_runes: {
        title: "Whispers in the Metal",
        text: `<p>Kneeling before the door, you examine the runes closely. As your breath fogs the cold metal, the symbols seem to <strong>swim</strong> before your eyes. One sequence repeats at intervals—three spirals converging on a central eye.</p>

        <p>Suddenly, a memory surfaces—<strong>Old Man Durnik</strong>, the village scholar, muttering about "binding marks" after too much ale. These runes aren't decorative; they're a <strong>containment spell</strong>, and a powerful one at that.</p>
        
        <p>A faint <strong>humming</strong> begins when you touch the central eye symbol, vibrating up through your bones. The taste of <strong>copper</strong> floods your mouth, and for a moment, you see:</p>
        <ul>
            <li>A <strong>black altar</strong> slick with blood</li>
            <li>Hooded figures chanting in a language that <strong>hurts</strong> to hear</li>
            <li>The <strong>moon</strong>, swollen and red, watching like a malevolent eye</li>
        </ul>
        
        <p>The vision passes as quickly as it came, leaving you trembling and nauseous.</p>`,
        onEnter: function() {
            gameState.flags.knowsAboutCult = true;
            gameState.quests.main = ["Escape the dungeon", "Stop the Blood Moon Ritual"];
            updateQuests();
            addXP(15);
        },
        choices: [
            {
                text: "Proceed through the door (whatever awaits can't be worse than the vision)",
                nextScene: "dark_corridor_torch"
            },
            {
                text: "Investigate the grate instead (perhaps a safer path exists)",
                nextScene: "grate_examine_torch"
            },
            {
                text: "Try to decipher more runes (despite the risk)",
                nextScene: "decipher_runes_deeper"
            }
        ]
    },

    dark_corridor_torch: {
        title: "The Illuminated Path",
        text: `<p>With the torch held high, you step through the doorway. The corridor stretches before you, its walls glistening with <strong>condensation</strong> that reflects the flickering light. The air here is colder, carrying the unmistakable <strong>stench</strong> of rodent musk and rotting meat.</p>

        <p>Twenty paces ahead, the scratching sound resolves into clear view—<strong>two giant rats</strong>, each the size of a terrier, gnawing on what might have been a deer leg. Their greasy fur is matted with substances better left unexamined, and their yellowed teeth gleam in the torchlight.</p>
        
        <p>As the light touches them, they freeze. You see:</p>
        <ul>
            <li>Their <strong>ribcages</strong> expanding with each panicked breath</li>
            <li><strong>Whiskers</strong> twitching as they assess the threat</li>
            <li>Behind them, <strong>bones</strong> scattered across the floor</li>
            <li>A glint of metal among the remains—perhaps a <strong>weapon</strong>?</li>
        </ul>`,
        choices: [
            {
                text: "Brandish the torch (let the flames speak for you)",
                nextScene: "scare_rats_torch",
                requirements: { inventory: ["Torch"] }
            },
            {
                text: "Search for a weapon among the bones (risk getting closer)",
                nextScene: "search_bones"
            },
            {
                text: "Attempt to sneak past (hold your breath, move slowly)",
                nextScene: "sneak_past_rats"
            },
            {
                text: "Retreat to the chamber (live to fight another time)",
                nextScene: "start"
            }
        ]
    },

    scare_rats_torch: {
        title: "Fire and Fury",
        text: `<p>You thrust the torch forward in a wide arc, the sudden movement making flames <strong>leap and dance</strong>. The rats' eyes glow red as they catch the light, their pupils shrinking to <strong>pinpricks</strong> of black.</p>

        <p>One releases a piercing <strong>shriek</strong> that echoes down the corridor as they scramble over each other in their haste to retreat. The smell of <strong>singed fur</strong> joins the dungeon's bouquet, acrid and sharp.</p>
        
        <p>As their panicked squeals fade into the distance, you're left with:</p>
        <ul>
            <li>A <strong>dagger</strong> glinting among the bones they were guarding</li>
            <li>A narrow <strong>side passage</strong> you hadn't noticed before</li>
            <li>The main corridor continuing downward, its end lost in shadow</li>
        </ul>`,
        onEnter: function() {
            gameState.flags.ratDefeated = true;
            addXP(25);
        },
        choices: [
            {
                text: "Claim the dagger (its edge still looks sharp)",
                nextScene: "take_dagger"
            },
            {
                text: "Explore the side passage (where the rats fled)",
                nextScene: "rat_passage"
            },
            {
                text: "Continue down the main corridor (deeper into darkness)",
                nextScene: "corridor_continue"
            }
        ]
    },

    take_dagger: {
        title: "Blade of the Forgotten",
        text: `<p>Kneeling among the scattered bones, you retrieve the dagger. Its <strong>bone handle</strong> fits comfortably in your grip, worn smooth by years of use. The blade, though tarnished, still bears a <strong>wicked edge</strong>—someone maintained this weapon carefully.</p>

        <p>As you turn it in the torchlight, you notice:</p>
        <ul>
            <li>Faint <strong>etchings</strong> along the fuller—more of those strange runes</li>
            <li>The balance is <strong>perfect</strong>, as if made for your hand</li>
            <li>A dried <strong>bloodstain</strong> near the hilt that flakes away at your touch</li>
        </ul>
        
        <p>A sudden <strong>whisper</strong> brushes against your mind—not words, but a <strong>presence</strong>, ancient and watchful. Then it's gone, leaving only the cold steel in your hand.</p>`,
        onEnter: function() {
            if (!gameState.flags.foundDagger) {
                gameState.inventory.push("Bone-Handled Dagger");
                gameState.stats.strength += 2;
                gameState.flags.foundDagger = true;
                updateInventory();
                updateStats();
                addXP(20);
            }
        },
        choices: [
            {
                text: "Examine the runes on the blade (they seem familiar)",
                nextScene: "examine_dagger_runes"
            },
            {
                text: "Proceed down the main corridor (armed and ready)",
                nextScene: "corridor_continue"
            },
            {
                text: "Investigate the side passage (where danger may lurk)",
                nextScene: "rat_passage"
            }
        ]
    },

    corridor_continue: {
        title: "Deeper Into Darkness",
        text: `<p>The corridor descends at a gentle slope, the air growing <strong>thicker</strong> with each step. The torchlight reveals:</p>
        <ul>
            <li><strong>Handprints</strong> smeared on the walls—some human, others... not</li>
            <li>Ancient <strong>cobwebs</strong> that glisten with unnatural iridescence</li>
            <li>A <strong>draught</strong> that carries whispers of something large moving ahead</li>
        </ul>
        
        <p>After fifty paces, the tunnel splits:</p>
        <ul>
            <li>To the left, a <strong>heavy door</strong> banded with black iron</li>
            <li>To the right, a <strong>collapsed passage</strong> partially blocked by rubble</li>
            <li>Ahead, the corridor continues downward into <strong>absolute blackness</strong></li>
        </ul>
        
        <p>From somewhere ahead comes a sound like <strong>slow, labored breathing</strong>—each exhalation carrying a faint <strong>chittering</strong> undertone.</p>`,
        choices: [
            {
                text: "Approach the black door (its surface feels unnaturally warm)",
                nextScene: "black_door"
            },
            {
                text: "Search the rubble (perhaps a way through exists)",
                nextScene: "search_rubble"
            },
            {
                text: "Continue forward (toward the breathing sound)",
                nextScene: "approach_breathing"
            },
            {
                text: "Retreat to safer areas (this feels like a threshold)",
                nextScene: "dark_corridor_torch"
            }
        ]
    },

    // Additional scenes would continue here...
    // Including:
    // - Meeting Alric the mage
    // - Discovering the cult's plans
    // - Finding other prisoners
    // - Uncovering ancient secrets
    // - Multiple endings based on choices

    player_death: {
        title: "The End Comes",
        text: `<p>As your vision darkens at the edges, the world narrows to the <strong>searing pain</strong> of your wounds. The last things you perceive:</p>
        <ul>
            <li>The <strong>metallic taste</strong> of your own blood</li>
            <li>The distant <strong>echo</strong> of chanting from somewhere above</li>
            <li>A final glimpse of the <strong>moon</strong>, now tinged red at the edges</li>
        </ul>
        
        <p>Your story ends here... but the world continues without you. Somewhere, a <strong>bell tolls</strong>, and the Blood Moon rises.</p>`,
        choices: [
            {
                text: "Begin Anew (the story reshapes itself)",
                nextScene: "start",
                onSelect: function() {
                    resetGame();
                }
            }
        ]
    }
};

// Additional game systems would include:
// - Combat engine
// - Spell system
// - Companion management
// - Time and moon phase tracking
// - Multiple endings

// [Rest of the JavaScript implementation would follow similar structure to previous versions]
