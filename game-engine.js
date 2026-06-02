/**
 * game-engine.js — Shonen Slugger Core Game Engine
 *
 * Pure game logic module. No rendering, no DOM, no external dependencies.
 * Integrates with:
 *   - renderer.js   (reads gameState each frame)
 *   - characters.js (implements applyPreSwingEffects / applyPrePitchEffects)
 *
 * All functions are exported via the GameEngine object at the bottom.
 */

"use strict";

// ---------------------------------------------------------------------------
// TIMING CONSTANTS
// ---------------------------------------------------------------------------

const TIMING = {
  fastball: 1200, // ms for ball to travel mound → plate
  curveball: 1600,
  splitter: 1400,
  perfect_window: 150, // ms either side of perfect contact
  swing_window: 300, // total acceptable swing window
  result_display: 1500, // ms to show result text before continuing
  inning_change_delay: 2000, // ms pause between half-innings
};

// Strike zone boundaries (used for ball/strike detection)
const ZONE = {
  xMin: 320,
  xMax: 480, // horizontal strike zone at plate level
  yMin: 380,
  yMax: 520, // vertical strike zone
};

// Plate center (used as hit-zone anchor)
const PLATE_X = 400;
const PLATE_Y = 520;
const MOUND_X = 400;
const MOUND_Y = 80;

// How many innings in a full game
const TOTAL_INNINGS = 3;

// Trail length kept on ball for renderer
const TRAIL_LENGTH = 5;

// ---------------------------------------------------------------------------
// STATE FACTORY
// ---------------------------------------------------------------------------

/**
 * Build a fresh copy of the default game state.
 * Always call this rather than mutating the old state object directly,
 * unless you are making targeted in-place updates during gameplay.
 * @returns {object} Fresh gameState
 */
function createInitialGameState() {
  return {
    state: "MENU", // MENU | CHARACTER_SELECT | UPGRADE_SHOP | GAME | GAME_OVER
    inning: 1,
    topOfInning: true, // true = P1 bats, P2 pitches
    score: [0, 0], // [P1_score, P2_score]
    outs: 0,
    balls: 0,
    strikes: 0,
    bases: [false, false, false], // [1st, 2nd, 3rd]
    currentBatter: 0, // player index
    currentPitcher: 1,

    players: [
      { charIndex: 0, ultUsed: false, ultCount: 0 },
      { charIndex: 1, ultUsed: false, ultCount: 0 },
    ],

    pitchPhase: "SELECT", // SELECT | AIMING | THROWN | RESULT
    pitchType: null, // 'fastball' | 'curveball' | 'splitter' | 'special'
    pitchAim: { x: PLATE_X, y: PLATE_Y },

    ball: {
      x: MOUND_X,
      y: MOUND_Y,
      startX: MOUND_X,
      startY: MOUND_Y,
      targetX: PLATE_X,
      targetY: PLATE_Y,
      progress: 0, // 0..1 travel completion
      inFlight: false,
      trail: [], // [{x,y}, ...] last TRAIL_LENGTH positions
      active: false,
    },

    swing: {
      attempted: false,
      timing: 0, // ms offset from perfect
      quality: null, // 'perfect' | 'good' | 'okay' | 'miss'
    },

    atBatResult: null, // populated after each pitch resolves

    floatingTexts: [], // [{text, x, y, alpha, timer}]
    screenShake: 0, // frames remaining
    flashColor: null, // {color, timer}

    ultActivations: {}, // keyed by playerIdx, set by characters.js
    pendingEffects: [], // queued events; never mutate during render frame

    gamePhase: "PITCHING", // PITCHING | BATTING | RESULT | INNING_CHANGE
    resultTimer: 0, // countdown (ms) for result display

    // Tracks when the ball will reach the plate, set when pitch is thrown
    _perfectMomentTime: 0, // absolute timestamp (ms) of perfect contact window
    _pitchStartTime: 0, // absolute timestamp when the pitch was thrown
    _pitchDuration: 0, // ms for this pitch type to travel
  };
}

/** Live game state — mutated in place each frame. */
let gameState = createInitialGameState();

// ---------------------------------------------------------------------------
// SAVE / LOAD
// ---------------------------------------------------------------------------

const SAVE_KEY = "shonenSlugger_save";

/**
 * Return the default persistent save structure.
 * @returns {object}
 */
function getDefaultSave() {
  return {
    coins: 0,
    characterUpgrades: {
      0: { track1: 0, track2: 0, track3: 0 },
      1: { track1: 0, track2: 0, track3: 0 },
      2: { track1: 0, track2: 0, track3: 0 },
      3: { track1: 0, track2: 0, track3: 0 },
      4: { track1: 0, track2: 0, track3: 0 },
      5: { track1: 0, track2: 0, track3: 0 },
    },
    gamesPlayed: 0,
    wins: [0, 0],
  };
}

/**
 * Persist saveData to localStorage.
 * @param {object} saveData
 */
function saveGame(saveData) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
  } catch (e) {
    console.warn("saveGame: localStorage write failed", e);
  }
}

/**
 * Load persistent save from localStorage, falling back to defaults.
 * @returns {object}
 */
function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : getDefaultSave();
  } catch {
    return getDefaultSave();
  }
}

// ---------------------------------------------------------------------------
// GAME INITIALISATION
// ---------------------------------------------------------------------------

/**
 * Initialise (or re-initialise) the engine for a new match.
 * Called once when entering the GAME state.
 * @param {{ p1CharIndex: number, p2CharIndex: number }} options
 */
function initGame({ p1CharIndex = 0, p2CharIndex = 1 } = {}) {
  gameState = createInitialGameState();
  gameState.state = "GAME";
  gameState.gamePhase = "PITCHING";

  gameState.players[0].charIndex = p1CharIndex;
  gameState.players[1].charIndex = p2CharIndex;

  // Top of inning 1: P1 bats, P2 pitches
  gameState.currentBatter = 0;
  gameState.currentPitcher = 1;

  resetBallToMound();
}

// ---------------------------------------------------------------------------
// INNING / HALF-INNING MANAGEMENT
// ---------------------------------------------------------------------------

/**
 * Reset fields that change between plate appearances (count only).
 */
function resetCount() {
  gameState.balls = 0;
  gameState.strikes = 0;
}

/**
 * Reset all fields required at the start of a new half-inning.
 * Does NOT reset score or inning number.
 */
function resetForNewHalfInning() {
  gameState.outs = 0;
  gameState.balls = 0;
  gameState.strikes = 0;
  gameState.bases = [false, false, false];

  // Reset ult availability for both players each new inning
  gameState.players[0].ultUsed = false;
  gameState.players[0].ultCount = 0;
  gameState.players[1].ultUsed = false;
  gameState.players[1].ultCount = 0;

  // Swap roles
  const wasTop = gameState.topOfInning;
  gameState.topOfInning = !wasTop;

  if (wasTop) {
    // Finished top → start bottom, same inning number
    gameState.currentBatter = 1;
    gameState.currentPitcher = 0;
  } else {
    // Finished bottom → advance inning, back to top
    gameState.inning++;
    gameState.currentBatter = 0;
    gameState.currentPitcher = 1;
  }

  resetBallToMound();
  gameState.atBatResult = null;
  gameState.swing = { attempted: false, timing: 0, quality: null };
  gameState.pitchPhase = "SELECT";
  gameState.pitchType = null;
  gameState.pitchAim = { x: PLATE_X, y: PLATE_Y };
}

/**
 * Public alias used by renderer / orchestration layer.
 * Resets the engine for a new inning (delegates to half-inning reset).
 */
function resetForNewInning() {
  resetForNewHalfInning();
}

/**
 * Check whether the game is over and transition if so.
 * Call after every half-inning completes.
 * The game ends after the bottom of inning TOTAL_INNINGS.
 *
 * "Bottom just finished" means we were in the bottom half (topOfInning===false)
 * and we've incremented the inning past the total.
 */
function checkGameOver() {
  // After resetForNewHalfInning the inning counter has already been updated.
  // If we've gone past TOTAL_INNINGS, the game is done.
  if (gameState.inning > TOTAL_INNINGS) {
    gameState.state = "GAME_OVER";
    gameState.gamePhase = "RESULT";

    const save = loadGame();
    save.gamesPlayed++;
    if (gameState.score[0] > gameState.score[1]) save.wins[0]++;
    else if (gameState.score[1] > gameState.score[0]) save.wins[1]++;
    saveGame(save);
  } else {
    gameState.gamePhase = "INNING_CHANGE";
    gameState.resultTimer = TIMING.inning_change_delay;
  }
}

// ---------------------------------------------------------------------------
// BALL HELPERS
// ---------------------------------------------------------------------------

/**
 * Reset the ball to its starting position above the mound.
 */
function resetBallToMound() {
  const b = gameState.ball;
  b.x = MOUND_X;
  b.y = MOUND_Y;
  b.startX = MOUND_X;
  b.startY = MOUND_Y;
  b.targetX = PLATE_X;
  b.targetY = PLATE_Y;
  b.progress = 0;
  b.inFlight = false;
  b.trail = [];
  b.active = false;
}

/**
 * Push current ball position into the trail buffer, keeping only TRAIL_LENGTH entries.
 */
function pushTrail() {
  const b = gameState.ball;
  b.trail.push({ x: b.x, y: b.y });
  if (b.trail.length > TRAIL_LENGTH) b.trail.shift();
}

/**
 * Calculate ball position for a given progress value (0..1) and pitch type.
 * Returns { x, y }.
 *
 * Fastball:   linear x, linear y.
 * Curveball:  eased x (curves harder in last 30%), linear y.
 * Splitter:   linear x, accelerates on y in last 30%.
 * Special:    falls back to fastball behaviour unless characters.js overrides.
 *
 * @param {number} progress  0..1
 * @param {'fastball'|'curveball'|'splitter'|'special'} pitchType
 * @param {{ x:number, y:number }} aim  Target aim point
 * @param {{ x:number, y:number }} start  Ball start position
 * @returns {{ x:number, y:number }}
 */
function calculateBallPos(progress, pitchType, aim, start) {
  const sx = start.x;
  const sy = start.y;
  const tx = aim.x;
  const ty = aim.y;

  switch (pitchType) {
    case "fastball":
    case "special":
    default: {
      return {
        x: sx + (tx - sx) * progress,
        y: sy + (ty - sy) * progress,
      };
    }

    case "curveball": {
      // y is always linear
      const y = sy + (ty - sy) * progress;

      // x curves harder in the last 30%
      let xProgress;
      if (progress < 0.7) {
        // gentle ease-in for first 70%
        xProgress = progress * progress; // slight ease
      } else {
        // last 30%: curve 1.5x as aggressively
        const base = 0.7 * 0.7; // value of p² at 0.70
        const extra = (progress - 0.7) * 1.5;
        xProgress = base + extra;
      }

      // Clamp to avoid overshoot on x
      xProgress = Math.min(xProgress, 1);
      const x = sx + (tx - sx) * xProgress;
      return { x, y };
    }

    case "splitter": {
      // x is linear
      const x = sx + (tx - sx) * progress;

      // y normal for first 70%, then 2.5× velocity in last 30%
      let y;
      if (progress <= 0.7) {
        // Travel the same fraction as progress (linear up to 0.70)
        const yFraction = progress / 0.7;
        // We want to cover only the "early" portion of the distance
        // At progress=0.70 the ball should be 70% × normalDist from start
        y = sy + (ty - sy) * 0.7 * yFraction;
      } else {
        // Already covered 70% of distance by p=0.70
        // Remaining 30% of distance covered with extra speed
        const t = (progress - 0.7) / 0.3; // 0..1 within last segment
        // Eased: simple quadratic acceleration
        y = sy + (ty - sy) * (0.7 + 0.3 * t * t * 2.5);
        y = Math.min(y, ty); // never overshoot plate
      }
      return { x, y };
    }
  }
}

/**
 * Advance the ball position by deltaTime milliseconds.
 * Updates gameState.ball in place.
 * @param {number} deltaTime  ms since last frame
 */
function updateBallPosition(deltaTime) {
  const gs = gameState;
  const b = gs.ball;

  if (!b.inFlight) return;

  const duration = gs._pitchDuration;
  const prevProgress = b.progress;

  b.progress = Math.min(b.progress + deltaTime / duration, 1);

  pushTrail();

  const pos = calculateBallPos(b.progress, gs.pitchType, gs.pitchAim, {
    x: b.startX,
    y: b.startY,
  });
  b.x = pos.x;
  b.y = pos.y;

  // Ball has reached the plate
  if (b.progress >= 1) {
    b.inFlight = false;
    b.active = false;

    // If batter never swung → resolve as pitch outcome (ball or strike)
    if (!gs.swing.attempted) {
      resolvePitchNoBat();
    }
  }
}

// ---------------------------------------------------------------------------
// PITCH MECHANICS
// ---------------------------------------------------------------------------

/**
 * Duration in ms for the given pitch type.
 * @param {'fastball'|'curveball'|'splitter'|'special'} pitchType
 * @returns {number}
 */
function getPitchDuration(pitchType) {
  switch (pitchType) {
    case "curveball":
      return TIMING.curveball;
    case "splitter":
      return TIMING.splitter;
    default:
      return TIMING.fastball;
  }
}

/**
 * Check whether the aim point is inside the strike zone.
 * @param {{ x:number, y:number }} aim
 * @returns {boolean}
 */
function isAimInStrikeZone(aim) {
  return (
    aim.x >= ZONE.xMin &&
    aim.x <= ZONE.xMax &&
    aim.y >= ZONE.yMin &&
    aim.y <= ZONE.yMax
  );
}

/**
 * Check whether the ball's final landing x is inside the strike zone.
 * Used for curveballs that start in zone but curve out.
 * @param {number} ballX  Ball x at plate crossing
 * @returns {boolean}
 */
function isBallXInStrikeZone(ballX) {
  return ballX >= ZONE.xMin && ballX <= ZONE.xMax;
}

/**
 * Throw the currently selected pitch toward the aim point.
 * Transitions pitchPhase to 'THROWN' and marks ball as inFlight.
 * @param {number} nowMs  Current timestamp from performance.now()
 */
function throwPitch(nowMs) {
  const gs = gameState;

  // Apply pre-pitch character effects (stub — characters.js fills these)
  const pitcherEffects = applyPrePitchEffects(gs, gs.currentPitcher);

  const duration = getPitchDuration(gs.pitchType || "fastball");

  // Allow character abilities to modify speed
  const speedMult = 1 - (pitcherEffects.speedBonus || 0); // speedBonus speeds up
  const finalDuration = Math.max(400, duration * speedMult);

  gs._pitchDuration = finalDuration;
  gs._pitchStartTime = nowMs;
  gs._perfectMomentTime = nowMs + finalDuration; // when ball reaches plate

  const b = gs.ball;
  b.startX = MOUND_X;
  b.startY = MOUND_Y;
  b.x = MOUND_X;
  b.y = MOUND_Y;
  b.targetX = gs.pitchAim.x;
  b.targetY = gs.pitchAim.y;
  b.progress = 0;
  b.inFlight = true;
  b.active = true;
  b.trail = [];

  gs.swing = { attempted: false, timing: 0, quality: null };
  gs.atBatResult = null;
  gs.pitchPhase = "THROWN";
  gs.gamePhase = "BATTING";
}

// ---------------------------------------------------------------------------
// BATTING MECHANIC
// ---------------------------------------------------------------------------

/**
 * Called when the batter presses their swing key during BATTING phase.
 * Calculates timing quality and resolves the outcome.
 * @param {number} nowMs  Current timestamp
 */
function attemptSwing(nowMs) {
  const gs = gameState;

  if (gs.swing.attempted) return; // already swung this pitch

  gs.swing.attempted = true;

  const offset = Math.abs(nowMs - gs._perfectMomentTime); // ms from perfect
  gs.swing.timing = offset;

  // Horizontal accuracy: where is the ball x vs hit zone centre?
  const ballX = gs.ball.x;
  const zoneCenter = PLATE_X;

  // Pre-swing character effects
  const batterEffects = applyPreSwingEffects(gs, gs.currentBatter);
  const hitZoneBonus = batterEffects.hitZoneBonus || 0; // extra px added to tolerances

  // Determine quality
  let quality;
  if (batterEffects.guaranteedPerfect) {
    quality = "perfect";
  } else if (
    offset <= 75 &&
    Math.abs(ballX - zoneCenter) <= 40 + hitZoneBonus
  ) {
    quality = "perfect";
  } else if (
    offset <= 150 &&
    Math.abs(ballX - zoneCenter) <= 50 + hitZoneBonus
  ) {
    quality = "good";
  } else if (
    offset <= 250 &&
    Math.abs(ballX - zoneCenter) <= 70 + hitZoneBonus
  ) {
    quality = "okay";
  } else {
    quality = "miss";
  }

  gs.swing.quality = quality;

  // Stop ball in flight
  gs.ball.inFlight = false;

  // Resolve
  const outcome = resolveOutcome(quality, batterEffects);

  if (quality === "miss") {
    // Treat as a swinging strike
    applyStrikeOutcome();
  } else if (outcome.type === "homerun") {
    applyHitOutcome(outcome, quality);
  } else if (outcome.base === 0) {
    // Groundout or flyout
    applyOutOutcome(outcome, quality);
  } else {
    applyHitOutcome(outcome, quality);
  }
}

// ---------------------------------------------------------------------------
// OUTCOME RESOLUTION
// ---------------------------------------------------------------------------

/**
 * Determine the hit outcome from swing quality and character modifiers.
 *
 * @param {'perfect'|'good'|'okay'|'miss'} quality
 * @param {{ hrBonus?: number, extraBase?: number, luckModifier?: number }} charEffects
 * @returns {{ type: string, base: number }}
 */
function resolveOutcome(quality, charEffects) {
  const r = Math.random();

  if (quality === "miss") return { type: "strike", base: 0 };

  if (quality === "perfect") {
    // Perfect contact always a homer
    return { type: "homerun", base: 4 };
  }

  if (quality === "good") {
    const hrChance = 0.1 + (charEffects.hrBonus || 0);
    if (r < hrChance) return { type: "homerun", base: 4 };
    if (r < hrChance + 0.6) return { type: "linedrive", base: 1 };
    if (r < hrChance + 0.9) return { type: "flyout", base: 0 }; // out
    return { type: "single", base: 1 };
  }

  // quality === 'okay'
  if (r < 0.5) return { type: "groundout", base: 0 };
  if (r < 0.75) return { type: "single", base: 1 };
  return { type: "flyout", base: 0 };
}

// ---------------------------------------------------------------------------
// RUNNER ADVANCEMENT
// ---------------------------------------------------------------------------

/**
 * Advance baserunners by `bases` positions. Returns number of runs scored.
 * Mutates gameState.bases in place.
 *
 * Algorithm: work from 3rd base backward to avoid double-counting.
 *
 * @param {number} basesToAdvance  1=single, 2=double, 3=triple, 4=HR
 * @returns {number} runs scored
 */
function advanceRunners(basesToAdvance) {
  const bases = gameState.bases; // [1st, 2nd, 3rd]
  let runs = 0;

  if (basesToAdvance >= 4) {
    // Home run: every occupied base scores, batter scores too
    for (let i = 0; i < 3; i++) {
      if (bases[i]) runs++;
      bases[i] = false;
    }
    runs++; // batter
    return runs;
  }

  // Shift existing runners forward; any that pass 3rd score
  // Work from 3rd to 1st so we don't clobber runners
  for (let base = 2; base >= 0; base--) {
    if (!bases[base]) continue;
    const newBase = base + basesToAdvance; // 0-indexed; 3 = home
    if (newBase >= 3) {
      runs++;
      bases[base] = false;
    } else {
      bases[newBase] = true;
      bases[base] = false;
    }
  }

  // Place batter
  const batterLands = basesToAdvance - 1; // 0=1st, 1=2nd, etc.
  if (batterLands >= 3) {
    runs++; // inside-the-park or error somehow
  } else {
    bases[batterLands] = true;
  }

  return runs;
}

/**
 * Apply a walk (base on balls). Batter goes to 1st with force advancement.
 * @returns {number} runs scored (only if bases were loaded)
 */
function applyWalk() {
  const bases = gameState.bases;
  let runs = 0;

  if (bases[0] && bases[1] && bases[2]) {
    // Bases loaded — runner from 3rd scores
    runs++;
    bases[2] = false;
  }

  // Force runners: 2nd→3rd if 1st occupied, 1st→2nd if 1st occupied
  if (bases[0]) {
    if (bases[1]) bases[2] = true;
    bases[1] = true;
  }
  bases[0] = true; // batter arrives at 1st

  return runs;
}

// ---------------------------------------------------------------------------
// PLATE APPEARANCE OUTCOMES
// ---------------------------------------------------------------------------

/**
 * The pitch was not swung at and reached the plate. Determine ball or strike
 * based on final ball position and whether the aim was in the zone.
 */
function resolvePitchNoBat() {
  const gs = gameState;
  const b = gs.ball;

  // A pitch is a strike if it crossed the plate within the zone
  const inZoneX = isBallXInStrikeZone(b.x);
  const inZoneY = b.y >= ZONE.yMin; // ball reached plate level

  if (inZoneX && inZoneY) {
    applyStrikeOutcome();
  } else {
    applyBallOutcome();
  }
}

/**
 * Apply a strike to the count; check for strikeout.
 */
function applyStrikeOutcome() {
  const gs = gameState;

  // Character ability: can negate a strike?
  const batterEffects = applyPreSwingEffects(gs, gs.currentBatter);
  if (batterEffects.negateStrike && !gs.swing.attempted) {
    // Ability consumed — ball call instead (e.g. "eye of the batter" ult)
    applyBallOutcome();
    return;
  }

  gs.strikes++;
  const label = gs.swing.attempted ? "Strike! (Swinging)" : "Strike!";
  addFloatingText(label, PLATE_X, PLATE_Y - 40);

  if (gs.strikes >= 3) {
    gs.atBatResult = { type: "strikeout" };
    addFloatingText("STRIKEOUT!", PLATE_X, PLATE_Y - 80);
    triggerScreenShake(8);
    endPlateAppearance();
  } else {
    completePitchCycle();
  }
}

/**
 * Apply a ball to the count; check for walk.
 */
function applyBallOutcome() {
  const gs = gameState;
  gs.balls++;
  addFloatingText("Ball!", PLATE_X, PLATE_Y - 40);

  if (gs.balls >= 4) {
    const runs = applyWalk();
    gs.score[gs.currentBatter] += runs;
    gs.atBatResult = { type: "walk" };
    addFloatingText("WALK!", PLATE_X, PLATE_Y - 80);
    if (runs > 0)
      addFloatingText(
        `+${runs} RUN${runs > 1 ? "S" : ""}!`,
        PLATE_X,
        PLATE_Y - 120,
      );
    endPlateAppearance();
  } else {
    completePitchCycle();
  }
}

/**
 * Apply an out (groundout/flyout/strikeout-style).
 * @param {{ type: string, base: number }} outcome
 * @param {'good'|'okay'} quality
 */
function applyOutOutcome(outcome, quality) {
  const gs = gameState;
  gs.atBatResult = outcome;

  const label = outcome.type === "groundout" ? "Ground Out!" : "Fly Out!";
  addFloatingText(label, PLATE_X, PLATE_Y - 60);
  triggerScreenShake(4);

  endPlateAppearance();
}

/**
 * Apply a hit (single, linedrive, homerun).
 * @param {{ type: string, base: number }} outcome
 * @param {'perfect'|'good'|'okay'} quality
 */
function applyHitOutcome(outcome, quality) {
  const gs = gameState;

  const runs = advanceRunners(outcome.base);
  gs.score[gs.currentBatter] += runs;
  gs.atBatResult = outcome;

  const labels = {
    homerun: "HOME RUN!!",
    linedrive: "LINE DRIVE!",
    single: "HIT!",
    double: "DOUBLE!",
    triple: "TRIPLE!",
  };

  const label = labels[outcome.type] || "HIT!";
  addFloatingText(label, PLATE_X, PLATE_Y - 80);
  if (runs > 0)
    addFloatingText(
      `+${runs} RUN${runs > 1 ? "S" : ""}!`,
      PLATE_X,
      PLATE_Y - 130,
    );

  const shakeFrames = outcome.type === "homerun" ? 20 : 6;
  triggerScreenShake(shakeFrames);

  if (outcome.type === "homerun") {
    gameState.flashColor = { color: "#FFD700", timer: 45 };
  }

  endPlateAppearance();
}

/**
 * End a plate appearance: apply out if needed, check for half-inning end,
 * then transition to RESULT display.
 */
function endPlateAppearance() {
  const gs = gameState;
  const result = gs.atBatResult;

  // Was this an out?
  const isOut =
    result &&
    (result.type === "strikeout" ||
      result.type === "groundout" ||
      result.type === "flyout");

  if (isOut) {
    gs.outs++;
  }

  // Transition to showing result
  gs.gamePhase = "RESULT";
  gs.resultTimer = TIMING.result_display;
}

/**
 * After a non-terminal pitch (ball or strike that doesn't end the AB),
 * reset to the next pitch cycle.
 */
function completePitchCycle() {
  const gs = gameState;
  resetBallToMound();
  gs.swing = { attempted: false, timing: 0, quality: null };
  gs.atBatResult = null;
  gs.pitchPhase = "SELECT";
  gs.pitchType = null;
  gs.gamePhase = "PITCHING";
}

// ---------------------------------------------------------------------------
// CHARACTER EFFECT STUBS
// These are called by the engine; characters.js MUST replace them by
// assigning to GameEngine.applyPreSwingEffects / applyPrePitchEffects.
// ---------------------------------------------------------------------------

/**
 * Stub: Returns default (no-effect) batter modifier object.
 * characters.js overrides this.
 * @param {object} _gs   gameState
 * @param {number} _playerIdx
 * @returns {{ hitZoneBonus:number, hrBonus:number, guaranteedPerfect:boolean,
 *             autoHR:boolean, negateStrike:boolean, extraBase:number,
 *             luckModifier:number }}
 */
function applyPreSwingEffects(_gs, _playerIdx) {
  return {
    hitZoneBonus: 0,
    hrBonus: 0,
    guaranteedPerfect: false,
    autoHR: false,
    negateStrike: false,
    extraBase: 0,
    luckModifier: 0,
  };
}

/**
 * Stub: Returns default (no-effect) pitcher modifier object.
 * characters.js overrides this.
 * @param {object} _gs   gameState
 * @param {number} _playerIdx
 * @returns {{ speedBonus:number, curveBonus:number, unhittable:boolean,
 *             rasenganActive:boolean }}
 */
function applyPrePitchEffects(_gs, _playerIdx) {
  return {
    speedBonus: 0, // fraction; 0.2 = 20% faster
    curveBonus: 0,
    unhittable: false,
    rasenganActive: false,
  };
}

// ---------------------------------------------------------------------------
// FLOATING TEXTS
// ---------------------------------------------------------------------------

/**
 * Queue a floating text to display at (x, y).
 * The renderer reads gameState.floatingTexts each frame.
 * @param {string} text
 * @param {number} x
 * @param {number} y
 */
function addFloatingText(text, x, y) {
  gameState.floatingTexts.push({
    text,
    x,
    y,
    alpha: 1.0,
    timer: 120, // frames (~2s at 60fps)
  });
}

/**
 * Tick all floating texts: decrement timer, update alpha, prune dead ones.
 */
function updateFloatingTexts() {
  const texts = gameState.floatingTexts;
  for (let i = texts.length - 1; i >= 0; i--) {
    texts[i].timer--;
    texts[i].alpha = Math.max(0, texts[i].timer / 120);
    if (texts[i].timer <= 0) texts.splice(i, 1);
  }
}

// ---------------------------------------------------------------------------
// SCREEN SHAKE
// ---------------------------------------------------------------------------

/**
 * Set screen shake for a number of frames.
 * @param {number} frames
 */
function triggerScreenShake(frames) {
  gameState.screenShake = Math.max(gameState.screenShake, frames);
}

/**
 * Tick screen shake counter.
 */
function updateScreenShake() {
  if (gameState.screenShake > 0) gameState.screenShake--;
}

// ---------------------------------------------------------------------------
// FLASH COLOR
// ---------------------------------------------------------------------------

/**
 * Tick flash color timer.
 */
function updateFlash() {
  if (!gameState.flashColor) return;
  gameState.flashColor.timer--;
  if (gameState.flashColor.timer <= 0) gameState.flashColor = null;
}

// ---------------------------------------------------------------------------
// INPUT HANDLING
// ---------------------------------------------------------------------------

/**
 * Handle pitching-phase input.
 * keys: Set<string> of currently pressed key identifiers.
 * @param {number} deltaTime
 * @param {Set<string>} keys
 * @param {number} nowMs
 */
function updatePitching(deltaTime, keys, nowMs) {
  const gs = gameState;

  switch (gs.pitchPhase) {
    case "SELECT": {
      // Keys 1-4 select pitch type
      if (keys.has("1") || keys.has("Digit1")) {
        gs.pitchType = "fastball";
        gs.pitchPhase = "AIMING";
      }
      if (keys.has("2") || keys.has("Digit2")) {
        gs.pitchType = "curveball";
        gs.pitchPhase = "AIMING";
      }
      if (keys.has("3") || keys.has("Digit3")) {
        gs.pitchType = "splitter";
        gs.pitchPhase = "AIMING";
      }
      if (keys.has("4") || keys.has("Digit4")) {
        gs.pitchType = "special";
        gs.pitchPhase = "AIMING";
      }
      break;
    }

    case "AIMING": {
      // Pitcher (P2) uses arrow keys; if P1 is pitching use WASD
      const speed = 3; // px per frame

      if (gs.currentPitcher === 1) {
        // P2 pitches with arrow keys
        if (keys.has("ArrowLeft")) gs.pitchAim.x -= speed;
        if (keys.has("ArrowRight")) gs.pitchAim.x += speed;
        if (keys.has("ArrowUp")) gs.pitchAim.y -= speed;
        if (keys.has("ArrowDown")) gs.pitchAim.y += speed;
      } else {
        // P1 pitches with WASD
        if (keys.has("a") || keys.has("KeyA")) gs.pitchAim.x -= speed;
        if (keys.has("d") || keys.has("KeyD")) gs.pitchAim.x += speed;
        if (keys.has("w") || keys.has("KeyW")) gs.pitchAim.y -= speed;
        if (keys.has("s") || keys.has("KeyS")) gs.pitchAim.y += speed;
      }

      // Clamp aim to reasonable canvas bounds
      gs.pitchAim.x = Math.max(240, Math.min(560, gs.pitchAim.x));
      gs.pitchAim.y = Math.max(300, Math.min(PLATE_Y, gs.pitchAim.y));

      // Confirm throw
      if (keys.has("Enter") || keys.has("Space") || keys.has(" ")) {
        throwPitch(nowMs);
      }
      break;
    }

    case "THROWN": {
      // Ball is in flight; batting phase handled by updateBatting
      updateBallPosition(deltaTime);
      break;
    }
  }
}

/**
 * Handle batting-phase input.
 * @param {number} deltaTime
 * @param {Set<string>} keys
 * @param {number} nowMs
 */
function updateBatting(deltaTime, keys, nowMs) {
  const gs = gameState;

  // Ball still in flight
  updateBallPosition(deltaTime);

  // Check batter swing input
  if (!gs.swing.attempted) {
    let swingPressed = false;

    if (gs.currentBatter === 0) {
      // P1 bats with SPACE
      swingPressed = keys.has(" ") || keys.has("Space");
    } else {
      // P2 bats with Enter
      swingPressed = keys.has("Enter");
    }

    if (swingPressed && gs.ball.inFlight) {
      attemptSwing(nowMs);
    }
  }
}

/**
 * Handle result-display countdown, then advance game state.
 * @param {number} deltaTime  ms
 */
function updateResult(deltaTime) {
  const gs = gameState;
  gs.resultTimer -= deltaTime;

  if (gs.resultTimer > 0) return;

  // Time's up — figure out what comes next
  const result = gs.atBatResult;
  const isOut =
    result &&
    (result.type === "strikeout" ||
      result.type === "groundout" ||
      result.type === "flyout");

  if (gs.outs >= 3) {
    // Half inning over
    handleHalfInningEnd();
  } else {
    // Next plate appearance
    resetCount();
    resetBallToMound();
    gs.swing = { attempted: false, timing: 0, quality: null };
    gs.atBatResult = null;
    gs.pitchPhase = "SELECT";
    gs.pitchType = null;
    gs.gamePhase = "PITCHING";
  }
}

/**
 * Handle the transition between half-innings (or game over).
 */
function handleHalfInningEnd() {
  // Check if game is done before resetting
  // Bottom of last inning just ended?
  const wasBottom = !gameState.topOfInning;
  const lastInning = gameState.inning >= TOTAL_INNINGS;

  if (wasBottom && lastInning) {
    // Game over — do NOT call resetForNewHalfInning (would increment inning)
    const save = loadGame();
    save.gamesPlayed++;
    if (gameState.score[0] > gameState.score[1]) save.wins[0]++;
    else if (gameState.score[1] > gameState.score[0]) save.wins[1]++;
    saveGame(save);

    gameState.state = "GAME_OVER";
    gameState.gamePhase = "RESULT";
    addFloatingText("GAME OVER", PLATE_X, 300);
  } else {
    resetForNewHalfInning();
    gameState.gamePhase = "INNING_CHANGE";
    gameState.resultTimer = TIMING.inning_change_delay;
    addFloatingText(
      gameState.topOfInning
        ? `Inning ${gameState.inning} — Top`
        : `Inning ${gameState.inning} — Bottom`,
      PLATE_X,
      300,
    );
  }
}

/**
 * Count down the between-inning delay, then start pitching.
 * @param {number} deltaTime  ms
 */
function updateInningChange(deltaTime) {
  const gs = gameState;
  gs.resultTimer -= deltaTime;

  if (gs.resultTimer <= 0) {
    gs.gamePhase = "PITCHING";
    gs.pitchPhase = "SELECT";
  }
}

// ---------------------------------------------------------------------------
// MAIN UPDATE
// ---------------------------------------------------------------------------

/**
 * Main game loop tick. Call once per animation frame.
 *
 * @param {number}      deltaTime  ms since last frame (typically ~16.67)
 * @param {Set<string>} keys       Set of currently held key identifiers
 * @param {number}      nowMs      performance.now() value for this frame
 */
function update(deltaTime, keys, nowMs) {
  if (gameState.state !== "GAME") return;

  switch (gameState.gamePhase) {
    case "PITCHING":
      updatePitching(deltaTime, keys, nowMs);
      break;
    case "BATTING":
      updateBatting(deltaTime, keys, nowMs);
      break;
    case "RESULT":
      updateResult(deltaTime);
      break;
    case "INNING_CHANGE":
      updateInningChange(deltaTime);
      break;
  }

  updateFloatingTexts();
  updateScreenShake();
  updateFlash();

  // Flush pending effects (deferred mutations queued by character abilities)
  flushPendingEffects();
}

// ---------------------------------------------------------------------------
// PENDING EFFECTS
// ---------------------------------------------------------------------------

/**
 * Flush any queued effects that were deferred to avoid mid-frame mutation.
 * Characters.js can push { type, payload } objects into gameState.pendingEffects.
 */
function flushPendingEffects() {
  const effects = gameState.pendingEffects.splice(0);
  for (const effect of effects) {
    switch (effect.type) {
      case "addFloatingText":
        addFloatingText(effect.text, effect.x, effect.y);
        break;
      case "screenShake":
        triggerScreenShake(effect.frames);
        break;
      case "flash":
        gameState.flashColor = { color: effect.color, timer: effect.timer };
        break;
      case "score":
        gameState.score[effect.playerIdx] += effect.runs;
        break;
      default:
        // Unknown effect — ignore gracefully
        break;
    }
  }
}

// ---------------------------------------------------------------------------
// PUBLIC UTILITIES
// ---------------------------------------------------------------------------

/**
 * Transition to a new top-level state (MENU, CHARACTER_SELECT, etc.).
 * @param {'MENU'|'CHARACTER_SELECT'|'UPGRADE_SHOP'|'GAME'|'GAME_OVER'} newState
 */
function transitionTo(newState) {
  gameState.state = newState;
}

/**
 * Get a read-only snapshot of the current score as a formatted string.
 * @returns {string}  e.g. "P1: 3 — P2: 1"
 */
function getScoreString() {
  return `P1: ${gameState.score[0]} — P2: ${gameState.score[1]}`;
}

/**
 * Get a formatted inning string.
 * @returns {string}  e.g. "Top 2nd"
 */
function getInningString() {
  const half = gameState.topOfInning ? "Top" : "Bot";
  const ordinals = [
    "",
    "1st",
    "2nd",
    "3rd",
    "4th",
    "5th",
    "6th",
    "7th",
    "8th",
    "9th",
  ];
  const ord = ordinals[gameState.inning] || `${gameState.inning}th`;
  return `${half} ${ord}`;
}

/**
 * Return the winner index (0 or 1), or -1 for a tie, or null if game not over.
 * @returns {0|1|-1|null}
 */
function getWinner() {
  if (gameState.state !== "GAME_OVER") return null;
  if (gameState.score[0] > gameState.score[1]) return 0;
  if (gameState.score[1] > gameState.score[0]) return 1;
  return -1; // tie
}

// ---------------------------------------------------------------------------
// EXPORT
// ---------------------------------------------------------------------------

// EXPORT
const GameEngine = {
  // State
  get gameState() {
    return gameState;
  },

  // Lifecycle
  initGame,
  resetForNewInning,
  resetForNewHalfInning,
  transitionTo,

  // Main loop
  update,

  // Physics
  calculateBallPos,
  updateBallPosition,

  // Mechanics
  throwPitch,
  attemptSwing,
  resolveOutcome,
  advanceRunners,
  applyWalk,

  // Plate appearance helpers
  resolvePitchNoBat,
  applyStrikeOutcome,
  applyBallOutcome,
  applyOutOutcome,
  applyHitOutcome,
  endPlateAppearance,
  completePitchCycle,

  // Character effect stubs (override from characters.js)
  applyPreSwingEffects,
  applyPrePitchEffects,

  // Inning management
  handleHalfInningEnd,
  checkGameOver,
  resetCount,

  // Feedback helpers
  addFloatingText,
  triggerScreenShake,
  updateFloatingTexts,
  updateScreenShake,
  updateFlash,

  // Pending effects
  flushPendingEffects,

  // Save / load
  saveGame,
  loadGame,
  getDefaultSave,

  // Utility / queries
  getScoreString,
  getInningString,
  getWinner,
  isAimInStrikeZone,
  isBallXInStrikeZone,
  getPitchDuration,

  // Constants (read-only access for renderer / characters)
  TIMING,
  ZONE,
  PLATE_X,
  PLATE_Y,
  MOUND_X,
  MOUND_Y,
  TOTAL_INNINGS,
  TRAIL_LENGTH,
};
