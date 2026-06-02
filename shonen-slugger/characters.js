/**
 * Shonen Slugger — Characters + Upgrade System
 * Vanilla JS, no dependencies.
 * Called by the game engine via the Characters export at the bottom.
 */

// ---------------------------------------------------------------------------
// CHARACTER DEFINITIONS
// ---------------------------------------------------------------------------

const CHARACTERS = [
  {
    index: 0,
    name: "GOJO",
    anime: "Jujutsu Kaisen",
    color: "#00BFFF",
    accentColor: "#FFFFFF",
    stats: { power: 7, contact: 8, speed: 6, pitch_control: 9 },
    passive: {
      name: "Six Eyes",
      desc: "+20% chance to reveal pitch type 0.3s before crossing plate",
    },
    ult: {
      name: "Infinity",
      desc: "Next strike becomes a ball (auto)",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Infinity: also negates 1 ball→strike conversion this inning",
        "Infinity: negates up to 2 ball→strike conversions this inning",
        "Infinity: negates up to 3 ball→strike conversions this inning",
        "Infinity: negates up to 4 ball→strike conversions this inning",
        "Infinity: usable TWICE per inning",
      ],
      track2: [
        "Six Eyes reveal chance: 30%",
        "Six Eyes reveal chance: 40%",
        "Six Eyes reveal chance: 55%",
        "Six Eyes reveal chance: 70%",
        "Six Eyes reveal chance: 85%",
      ],
      track3: [
        "+1 to all stats (power, contact, speed, pitch_control)",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
  {
    index: 1,
    name: "LUFFY",
    anime: "One Piece",
    color: "#FF4500",
    accentColor: "#FFD700",
    stats: { power: 9, contact: 7, speed: 8, pitch_control: 4 },
    passive: {
      name: "Gum-Gum Body",
      desc: "Hit zone width +30% (104px instead of 80px)",
    },
    ult: {
      name: "Gear Second",
      desc: "Next swing has guaranteed perfect timing if any contact made",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Gear Second: swing window increased by 10ms",
        "Gear Second: swing window increased by 20ms",
        "Gear Second: swing window increased by 30ms",
        "Gear Second: swing window increased by 40ms",
        "Gear Second: usable TWICE per inning",
      ],
      track2: [
        "Gum-Gum Body: hit zone bonus +40%",
        "Gum-Gum Body: hit zone bonus +55%",
        "Gum-Gum Body: hit zone bonus +70%",
        "Gum-Gum Body: hit zone bonus +85%",
        "Gum-Gum Body: hit zone bonus +100%",
      ],
      track3: [
        "+1 to all stats",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
  {
    index: 2,
    name: "NARUTO",
    anime: "Naruto",
    color: "#FFA500",
    accentColor: "#FF6600",
    stats: { power: 7, contact: 8, speed: 10, pitch_control: 6 },
    passive: {
      name: "Shadow Clones",
      desc: "25% chance to steal extra base after getting on base",
    },
    ult: {
      name: "Rasengan Pitch",
      desc: "Next pitch ignores batter hit zone bonuses, +50% speed",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Rasengan Pitch: speed bonus +65%",
        "Rasengan Pitch: speed bonus +80%",
        "Rasengan Pitch: speed bonus +95%",
        "Rasengan Pitch: speed bonus +110%",
        "Rasengan Pitch: speed bonus +120%, usable TWICE per inning",
      ],
      track2: [
        "Shadow Clones: steal chance 35%",
        "Shadow Clones: steal chance 45%",
        "Shadow Clones: steal chance 60%",
        "Shadow Clones: steal chance 75%",
        "Shadow Clones: steal chance 90%",
      ],
      track3: [
        "+1 to all stats",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
  {
    index: 3,
    name: "GOKU",
    anime: "Dragon Ball Z",
    color: "#FFD700",
    accentColor: "#FF8C00",
    stats: { power: 10, contact: 6, speed: 9, pitch_control: 5 },
    passive: {
      name: "Saiyan Power",
      desc: "+25% home run chance on good or better contact",
    },
    ult: {
      name: "Kamehameha Swing",
      desc: "Next swing with contact = auto home run regardless of timing",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Kamehameha Swing: swing can no longer miss (guaranteed contact)",
        "Kamehameha Swing: guaranteed contact + auto HR persists",
        "Kamehameha Swing: guaranteed contact + auto HR persists",
        "Kamehameha Swing: guaranteed contact + auto HR persists",
        "Kamehameha Swing: usable TWICE per inning",
      ],
      track2: [
        "Saiyan Power: HR bonus +35%",
        "Saiyan Power: HR bonus +45%",
        "Saiyan Power: HR bonus +60%",
        "Saiyan Power: HR bonus +80%",
        "Saiyan Power: HR bonus +100%",
      ],
      track3: [
        "+1 to all stats",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
  {
    index: 4,
    name: "TANJIRO",
    anime: "Demon Slayer",
    color: "#228B22",
    accentColor: "#DC143C",
    stats: { power: 7, contact: 9, speed: 8, pitch_control: 9 },
    passive: {
      name: "Water Breathing",
      desc: "Curveballs curve 40% more sharply",
    },
    ult: {
      name: "Hinokami Kagura",
      desc: "Next pitch: even perfect timing = foul ball (unhittable)",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Hinokami Kagura: unhittable effect persists for up to 2 pitches",
        "Hinokami Kagura: unhittable effect persists for up to 2 pitches",
        "Hinokami Kagura: unhittable effect persists for up to 3 pitches",
        "Hinokami Kagura: unhittable effect persists for up to 3 pitches",
        "Hinokami Kagura: usable TWICE per inning",
      ],
      track2: [
        "Water Breathing: curve bonus +55%",
        "Water Breathing: curve bonus +70%",
        "Water Breathing: curve bonus +85%",
        "Water Breathing: curve bonus +100%",
        "Water Breathing: curve bonus +120%",
      ],
      track3: [
        "+1 to all stats",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
  {
    index: 5,
    name: "LEVI",
    anime: "Attack on Titan",
    color: "#2F4F4F",
    accentColor: "#C0C0C0",
    stats: { power: 8, contact: 9, speed: 10, pitch_control: 8 },
    passive: {
      name: "ODM Speed",
      desc: "Opposing fielding: 20% worse outcomes (singles→outs when Levi fields)",
    },
    ult: {
      name: "Blade Swing",
      desc: "Next swing with contact = guaranteed double or better",
      usesPerInning: 1,
    },
    upgradeDescs: {
      track1: [
        "Blade Swing: +25% chance result upgrades to triple",
        "Blade Swing: +50% chance result upgrades to triple",
        "Blade Swing: +75% chance result upgrades to triple",
        "Blade Swing: +100% chance result upgrades to triple (always triple+)",
        "Blade Swing: usable TWICE per inning",
      ],
      track2: [
        "ODM Speed: fielding penalty 30%",
        "ODM Speed: fielding penalty 40%",
        "ODM Speed: fielding penalty 55%",
        "ODM Speed: fielding penalty 70%",
        "ODM Speed: fielding penalty 85%",
      ],
      track3: [
        "+1 to all stats",
        "+2 to all stats",
        "+3 to all stats",
        "+4 to all stats",
        "+5 to all stats",
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// UPGRADE SYSTEM
// ---------------------------------------------------------------------------

// Cost to go from level N to level N+1. Index = current level (0-based).
const UPGRADE_COSTS = [100, 250, 500, 1000, 2000]; // levels 0→1, 1→2, 2→3, 3→4, 4→5

const UPGRADE_TRACKS = {
  track1: {
    name: "Ult Power",
    desc: "Reduces cooldown / enhances ult. At level 5: ult usable TWICE per inning.",
  },
  track2: {
    name: "Passive Strength",
    desc: "Enhances passive ability.",
  },
  track3: {
    name: "Stats",
    desc: "+1 to all stats per level.",
  },
};

// ---------------------------------------------------------------------------
// BATTER MODIFIERS
// Called BEFORE each swing is processed. Returns a modifier object that
// the game engine applies to the pending swing resolution.
// ---------------------------------------------------------------------------

/**
 * @param {number} charIndex     - 0..5
 * @param {object} upgradeData   - { [charIndex]: { track1, track2, track3 } }
 * @param {boolean} ultActive    - whether the player activated their ult this swing
 * @returns {object} modifiers
 */
function getBatterModifiers(charIndex, upgradeData, ultActive) {
  const upgrades = upgradeData[charIndex] || {
    track1: 0,
    track2: 0,
    track3: 0,
  };

  const modifiers = {
    hitZoneBonus: 0, // px added to each side of the hit zone
    hrBonus: 0, // additive probability bonus to HR chance (0..1)
    guaranteedPerfect: false, // swing is treated as perfect timing
    autoHR: false, // contact = auto home run, no timing check
    negateStrike: false, // converts the next strike call into a ball
    extraBaseChance: 0, // 0..1 probability of stealing an extra base after a hit
    guaranteedDouble: false, // contact = at least a double
    tripleUpgradeChance: 0, // 0..1 probability that guaranteedDouble upgrades to triple
    revealPitch: false, // whether Six Eyes triggered this swing
    revealChance: 0, // raw probability used (for HUD display)
  };

  switch (charIndex) {
    case 0: {
      // GOJO — Six Eyes passive, Infinity ult
      const sixEyesTable = [0.2, 0.3, 0.4, 0.55, 0.7, 0.85];
      modifiers.revealChance = sixEyesTable[upgrades.track2];
      modifiers.revealPitch = Math.random() < modifiers.revealChance;

      if (ultActive) {
        modifiers.negateStrike = true;
      }
      break;
    }

    case 1: {
      // LUFFY — Gum-Gum Body passive, Gear Second ult
      // px bonus per side: base 12px = +30% on an 80px zone (each side grows by 12)
      const luffyZoneTable = [12, 16, 22, 28, 34, 40];
      modifiers.hitZoneBonus = luffyZoneTable[upgrades.track2];

      if (ultActive) {
        modifiers.guaranteedPerfect = true;
      }
      break;
    }

    case 2: {
      // NARUTO — Shadow Clones passive (steal), Rasengan is a pitching ult
      const stealTable = [0.25, 0.35, 0.45, 0.6, 0.75, 0.9];
      modifiers.extraBaseChance = stealTable[upgrades.track2];
      // Rasengan Pitch is applied in getPitcherModifiers when Naruto pitches.
      break;
    }

    case 3: {
      // GOKU — Saiyan Power passive, Kamehameha ult
      const gokuHRTable = [0.25, 0.35, 0.45, 0.6, 0.8, 1.0];
      modifiers.hrBonus = gokuHRTable[upgrades.track2];

      if (ultActive) {
        modifiers.autoHR = true;
        // L1+ track1: swing can no longer miss (guaranteed contact before autoHR fires)
        if (upgrades.track1 >= 1) {
          modifiers.guaranteedPerfect = true;
        }
      }
      break;
    }

    case 4: {
      // TANJIRO — batting modifiers minimal; Water Breathing + Hinokami are pitching
      break;
    }

    case 5: {
      // LEVI — ODM fielding penalty is passive; Blade Swing ult
      if (ultActive) {
        modifiers.guaranteedDouble = true;
        // Track1 upgrades give escalating triple upgrade chance
        const tripleTable = [0, 0.25, 0.5, 0.75, 1.0, 1.0];
        modifiers.tripleUpgradeChance = tripleTable[upgrades.track1];
      }
      break;
    }
  }

  return modifiers;
}

// ---------------------------------------------------------------------------
// PITCHER MODIFIERS
// Called when resolving a pitch delivery.
// ---------------------------------------------------------------------------

/**
 * @param {number} charIndex     - 0..5
 * @param {object} upgradeData   - { [charIndex]: { track1, track2, track3 } }
 * @param {boolean} ultActive    - whether the pitcher activated their ult this pitch
 * @param {string} pitchType     - 'fastball' | 'curveball' | 'changeup' | etc.
 * @returns {object} modifiers
 */
function getPitcherModifiers(charIndex, upgradeData, ultActive, pitchType) {
  const upgrades = upgradeData[charIndex] || {
    track1: 0,
    track2: 0,
    track3: 0,
  };

  const modifiers = {
    speedMultiplier: 1.0, // multiplied against base pitch speed
    curveBonus: 0, // additive bonus to curve sharpness (0 = no change)
    unhittable: false, // Tanjiro Hinokami: even perfect contact = foul
    unhittablePitchCount: 1, // how many pitches the unhittable effect covers
    ignoreHitZoneBonus: false, // Naruto ult: batter hit zone bonuses are nullified
    fieldingPenalty: 0, // Levi ODM: 0..1 penalty applied to opponent fielding
  };

  switch (charIndex) {
    case 2: {
      // NARUTO — Rasengan Pitch ult
      if (ultActive) {
        // track1 indexes into speed table; capped at track1 level 4 (index 4) for L5 same value
        const rasengaSpeedTable = [1.5, 1.65, 1.8, 1.95, 2.2, 2.2];
        modifiers.speedMultiplier = rasengaSpeedTable[upgrades.track1];
        modifiers.ignoreHitZoneBonus = true;
      }
      break;
    }

    case 4: {
      // TANJIRO — Water Breathing passive, Hinokami Kagura ult
      if (pitchType === "curveball") {
        const curveTable = [0.4, 0.55, 0.7, 0.85, 1.0, 1.2];
        modifiers.curveBonus = curveTable[upgrades.track2];
      }

      if (ultActive) {
        modifiers.unhittable = true;
        // Track1 upgrades extend the number of pitches the effect covers
        // L0-L1: 1 pitch, L2-L3: 2 pitches, L4-L5: 3 pitches
        if (upgrades.track1 >= 4) {
          modifiers.unhittablePitchCount = 3;
        } else if (upgrades.track1 >= 2) {
          modifiers.unhittablePitchCount = 2;
        } else {
          modifiers.unhittablePitchCount = 1;
        }
      }
      break;
    }

    case 5: {
      // LEVI — ODM Speed passive (fielding penalty, always active)
      const odmTable = [0.2, 0.3, 0.4, 0.55, 0.7, 0.85];
      modifiers.fieldingPenalty = odmTable[upgrades.track2];
      break;
    }

    // GOJO, LUFFY, GOKU: no pitching-specific modifiers beyond stats
  }

  return modifiers;
}

// ---------------------------------------------------------------------------
// STAT CALCULATION
// ---------------------------------------------------------------------------

/**
 * Returns a character's stats with track3 upgrade bonus applied.
 * @param {number} charIndex
 * @param {object} upgradeData
 * @returns {{ power, contact, speed, pitch_control }}
 */
function getEffectiveStats(charIndex, upgradeData) {
  const base = { ...CHARACTERS[charIndex].stats };
  const track3Level = (upgradeData[charIndex] || { track3: 0 }).track3;
  base.power += track3Level;
  base.contact += track3Level;
  base.speed += track3Level;
  base.pitch_control += track3Level;
  return base;
}

// ---------------------------------------------------------------------------
// ULT USES PER INNING
// ---------------------------------------------------------------------------

/**
 * Returns how many times a character can use their ult in a single inning.
 * @param {number} charIndex
 * @param {object} upgradeData
 * @returns {number} 1 or 2
 */
function getUltUsesPerInning(charIndex, upgradeData) {
  const track1Level = (upgradeData[charIndex] || { track1: 0 }).track1;
  return track1Level >= 5 ? 2 : 1;
}

// ---------------------------------------------------------------------------
// UPGRADE SHOP FUNCTIONS
// ---------------------------------------------------------------------------

/**
 * Returns the coin cost to upgrade from currentLevel to currentLevel+1.
 * Returns null if already maxed at level 5.
 * @param {number} currentLevel - 0..5
 * @returns {number|null}
 */
function getUpgradeCost(currentLevel) {
  if (currentLevel >= 5) return null;
  return UPGRADE_COSTS[currentLevel];
}

/**
 * Whether the player has enough coins to purchase a specific track upgrade.
 * @param {number} coins
 * @param {number} charIndex
 * @param {string} track - 'track1' | 'track2' | 'track3'
 * @param {object} upgradeData
 * @returns {boolean}
 */
function canAffordUpgrade(coins, charIndex, track, upgradeData) {
  const currentLevel = (upgradeData[charIndex] || {})[track] || 0;
  const cost = getUpgradeCost(currentLevel);
  return cost !== null && coins >= cost;
}

/**
 * Mutates saveData to apply a purchased upgrade.
 * Returns true on success, false if can't afford or already maxed.
 *
 * saveData shape:
 * {
 *   coins: number,
 *   characterUpgrades: { [charIndex]: { track1, track2, track3 } }
 * }
 *
 * @param {object} saveData
 * @param {number} charIndex
 * @param {string} track - 'track1' | 'track2' | 'track3'
 * @returns {boolean}
 */
function purchaseUpgrade(saveData, charIndex, track) {
  if (!saveData.characterUpgrades[charIndex]) {
    saveData.characterUpgrades[charIndex] = { track1: 0, track2: 0, track3: 0 };
  }
  const currentLevel = saveData.characterUpgrades[charIndex][track];
  if (currentLevel >= 5) return false;
  const cost = UPGRADE_COSTS[currentLevel];
  if (saveData.coins < cost) return false;
  saveData.coins -= cost;
  saveData.characterUpgrades[charIndex][track]++;
  return true;
}

/**
 * Returns a fresh characterUpgrades object for a new save file.
 * All tracks start at level 0 for every character.
 * @returns {object}
 */
function createDefaultUpgradeData() {
  const data = {};
  for (let i = 0; i < CHARACTERS.length; i++) {
    data[i] = { track1: 0, track2: 0, track3: 0 };
  }
  return data;
}

// ---------------------------------------------------------------------------
// COIN REWARDS
// ---------------------------------------------------------------------------

/**
 * Calculates coins earned at the end of a match.
 * @param {number} p1Score
 * @param {number} p2Score
 * @param {number} winner - 0 for P1 win, 1 for P2 win
 * @returns {{ winner: number, loser: number }}
 */
function calculateCoinsEarned(p1Score, p2Score, winner) {
  const loserScore = winner === 0 ? p2Score : p1Score;
  const isShutout = loserScore === 0;
  return {
    winner: 100 + (isShutout ? 50 : 0),
    loser: 40,
  };
}

// ---------------------------------------------------------------------------
// CHARACTER SELECT STATE
// ---------------------------------------------------------------------------

let charSelectState = {
  p1Selected: 0,
  p2Selected: 1,
  p1Confirmed: false,
  p2Confirmed: false,
};

/**
 * Cycle a player's character selection cursor.
 * @param {number} player    - 0 (P1) or 1 (P2)
 * @param {number} direction - 1 (right/next) or -1 (left/prev)
 */
function cycleCharacter(player, direction) {
  const count = CHARACTERS.length; // 6
  if (player === 0) {
    charSelectState.p1Selected =
      (charSelectState.p1Selected + direction + count) % count;
  } else {
    charSelectState.p2Selected =
      (charSelectState.p2Selected + direction + count) % count;
  }
}

/**
 * Confirm a player's character selection.
 * @param {number} player - 0 or 1
 */
function confirmCharacter(player) {
  if (player === 0) {
    charSelectState.p1Confirmed = true;
  } else {
    charSelectState.p2Confirmed = true;
  }
}

/**
 * Reset selection state for a new character select screen.
 */
function resetCharSelectState() {
  charSelectState.p1Selected = 0;
  charSelectState.p2Selected = 1;
  charSelectState.p1Confirmed = false;
  charSelectState.p2Confirmed = false;
}

/**
 * Returns true when both players have confirmed their picks.
 * @returns {boolean}
 */
function bothPlayersConfirmed() {
  return charSelectState.p1Confirmed && charSelectState.p2Confirmed;
}

// ---------------------------------------------------------------------------
// PUBLIC EXPORT
// ---------------------------------------------------------------------------

const Characters = {
  // Data
  CHARACTERS,
  UPGRADE_COSTS,
  UPGRADE_TRACKS,

  // Ability resolution
  getBatterModifiers,
  getPitcherModifiers,

  // Stats
  getEffectiveStats,

  // Ult management
  getUltUsesPerInning,

  // Upgrade shop
  getUpgradeCost,
  canAffordUpgrade,
  purchaseUpgrade,
  createDefaultUpgradeData,

  // Economy
  calculateCoinsEarned,

  // Character select
  charSelectState,
  cycleCharacter,
  confirmCharacter,
  resetCharSelectState,
  bothPlayersConfirmed,
};

// Browser global (loaded via <script> tag without a bundler)
if (typeof window !== "undefined") {
  window.Characters = Characters;
}

// ESM export for bundlers and Node test runners
export default Characters;
export {
  CHARACTERS,
  UPGRADE_COSTS,
  UPGRADE_TRACKS,
  getBatterModifiers,
  getPitcherModifiers,
  getEffectiveStats,
  getUltUsesPerInning,
  getUpgradeCost,
  canAffordUpgrade,
  purchaseUpgrade,
  createDefaultUpgradeData,
  calculateCoinsEarned,
  charSelectState,
  cycleCharacter,
  confirmCharacter,
  resetCharSelectState,
  bothPlayersConfirmed,
};
