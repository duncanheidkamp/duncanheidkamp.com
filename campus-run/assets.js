/**
 * ============================================
 * CAMPUS RUN: THE REUNION CHALLENGE
 * Asset Definitions & Sprite Loading
 * 16-BIT RETRO STYLE
 * ============================================
 */

// ============================================
// PLAYER CHARACTER - MARIO-STYLE WITH CANDY STRIPES
// ============================================

const PLAYER_CONFIG = {
    width: 48,
    height: 64,
    colors: {
        cap: '#990000',
        skin: '#FFCC99',
        // Candy stripe colors (red and white)
        stripe1: '#FF0000',
        stripe2: '#FFFFFF',
        overalls: '#0066CC',
        shoes: '#442200',
        outline: '#000000'
    }
};

/**
 * Generates 16-bit pixel art style player
 * Mario-inspired with candy-striped shirt
 */
function generatePlayerSVG(frame = 'run1') {
    const c = PLAYER_CONFIG.colors;

    // Leg positions for animation
    let leftLegY, rightLegY;
    switch (frame) {
        case 'run1':
            leftLegY = 52;
            rightLegY = 48;
            break;
        case 'run2':
            leftLegY = 48;
            rightLegY = 52;
            break;
        case 'jump':
            leftLegY = 46;
            rightLegY = 46;
            break;
        default:
            leftLegY = 50;
            rightLegY = 50;
    }

    // Pixel-art style using rectangles for chunky 16-bit look
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64" width="48" height="64" shape-rendering="crispEdges">
        <!-- CAP -->
        <rect x="8" y="2" width="32" height="4" fill="${c.cap}"/>
        <rect x="4" y="6" width="36" height="8" fill="${c.cap}"/>
        <rect x="36" y="8" width="8" height="4" fill="${c.cap}"/>
        <!-- Cap 'M' logo -->
        <rect x="18" y="8" width="4" height="4" fill="#FFD700"/>
        <rect x="26" y="8" width="4" height="4" fill="#FFD700"/>
        <rect x="20" y="10" width="8" height="2" fill="#FFD700"/>

        <!-- FACE -->
        <rect x="8" y="14" width="28" height="16" fill="${c.skin}"/>
        <!-- Eyes -->
        <rect x="12" y="18" width="6" height="6" fill="#FFFFFF"/>
        <rect x="26" y="18" width="6" height="6" fill="#FFFFFF"/>
        <rect x="14" y="20" width="4" height="4" fill="#000000"/>
        <rect x="28" y="20" width="4" height="4" fill="#000000"/>
        <!-- Nose -->
        <rect x="20" y="22" width="8" height="4" fill="#DD9966"/>
        <!-- Mustache -->
        <rect x="10" y="26" width="28" height="4" fill="#442200"/>

        <!-- BODY - CANDY STRIPED SHIRT -->
        <rect x="6" y="30" width="36" height="16" fill="${c.stripe2}"/>
        <!-- Red stripes -->
        <rect x="6" y="30" width="6" height="16" fill="${c.stripe1}"/>
        <rect x="18" y="30" width="6" height="16" fill="${c.stripe1}"/>
        <rect x="30" y="30" width="6" height="16" fill="${c.stripe1}"/>
        <rect x="42" y="30" width="2" height="16" fill="${c.stripe1}"/>

        <!-- ARMS -->
        <rect x="0" y="32" width="6" height="12" fill="${c.stripe2}"/>
        <rect x="0" y="32" width="2" height="12" fill="${c.stripe1}"/>
        <rect x="4" y="32" width="2" height="12" fill="${c.stripe1}"/>
        <rect x="42" y="32" width="6" height="12" fill="${c.stripe2}"/>
        <rect x="44" y="32" width="2" height="12" fill="${c.stripe1}"/>
        <!-- Hands -->
        <rect x="0" y="44" width="6" height="4" fill="${c.skin}"/>
        <rect x="42" y="44" width="6" height="4" fill="${c.skin}"/>

        <!-- OVERALLS/PANTS -->
        <rect x="10" y="46" width="12" height="${leftLegY - 46 + 8}" fill="${c.overalls}"/>
        <rect x="26" y="46" width="12" height="${rightLegY - 46 + 8}" fill="${c.overalls}"/>
        <!-- Overall buttons -->
        <rect x="14" y="48" width="4" height="4" fill="#FFD700"/>
        <rect x="30" y="48" width="4" height="4" fill="#FFD700"/>

        <!-- SHOES -->
        <rect x="8" y="${leftLegY + 4}" width="16" height="8" fill="${c.shoes}"/>
        <rect x="24" y="${rightLegY + 4}" width="16" height="8" fill="${c.shoes}"/>

        <!-- Pixel outline for retro feel -->
        <rect x="6" y="30" width="2" height="16" fill="${c.outline}" opacity="0.3"/>
        <rect x="40" y="30" width="2" height="16" fill="${c.outline}" opacity="0.3"/>
    </svg>`;
}

// ============================================
// OBSTACLES - 16-BIT STYLE
// ============================================

const OBSTACLES = {
    textbooks: {
        width: 40,
        height: 44,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 44" shape-rendering="crispEdges">
                <rect x="2" y="28" width="36" height="14" fill="#880000"/>
                <rect x="4" y="30" width="32" height="10" fill="#AA0000"/>
                <rect x="4" y="14" width="32" height="16" fill="#004400"/>
                <rect x="6" y="16" width="28" height="12" fill="#006600"/>
                <rect x="6" y="0" width="28" height="16" fill="#000044"/>
                <rect x="8" y="2" width="24" height="12" fill="#000088"/>
                <!-- Pixel details -->
                <rect x="16" y="6" width="8" height="4" fill="#FFFF00"/>
            </svg>`
    },

    bike: {
        width: 56,
        height: 48,
        hitboxPadding: 6,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 48" shape-rendering="crispEdges">
                <!-- Wheels - pixelated circles -->
                <rect x="4" y="28" width="4" height="16" fill="#333"/>
                <rect x="0" y="32" width="4" height="8" fill="#333"/>
                <rect x="8" y="32" width="4" height="8" fill="#333"/>
                <rect x="44" y="28" width="4" height="16" fill="#333"/>
                <rect x="40" y="32" width="4" height="8" fill="#333"/>
                <rect x="48" y="32" width="4" height="8" fill="#333"/>
                <!-- Spokes -->
                <rect x="4" y="36" width="4" height="4" fill="#666"/>
                <rect x="44" y="36" width="4" height="4" fill="#666"/>
                <!-- Frame -->
                <rect x="8" y="24" width="36" height="4" fill="#CC0000"/>
                <rect x="20" y="12" width="4" height="16" fill="#CC0000"/>
                <rect x="16" y="8" width="12" height="4" fill="#333"/>
                <!-- Seat -->
                <rect x="18" y="4" width="8" height="6" fill="#222"/>
                <!-- Basket -->
                <rect x="36" y="16" width="12" height="8" fill="#886644"/>
                <rect x="38" y="18" width="8" height="4" fill="#AA8866"/>
            </svg>`
    },

    cone: {
        width: 28,
        height: 40,
        hitboxPadding: 3,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 40" shape-rendering="crispEdges">
                <rect x="2" y="36" width="24" height="4" fill="#222"/>
                <rect x="4" y="28" width="20" height="8" fill="#FF6600"/>
                <rect x="6" y="20" width="16" height="8" fill="#FF6600"/>
                <rect x="8" y="12" width="12" height="8" fill="#FF6600"/>
                <rect x="10" y="4" width="8" height="8" fill="#FF6600"/>
                <rect x="12" y="0" width="4" height="4" fill="#FF6600"/>
                <!-- White stripes -->
                <rect x="6" y="24" width="16" height="4" fill="#FFFFFF"/>
                <rect x="10" y="12" width="8" height="4" fill="#FFFFFF"/>
            </svg>`
    },

    squirrel: {
        width: 32,
        height: 32,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" shape-rendering="crispEdges">
                <!-- Tail -->
                <rect x="24" y="4" width="8" height="8" fill="#8B4513"/>
                <rect x="20" y="8" width="8" height="8" fill="#A0522D"/>
                <rect x="20" y="16" width="4" height="4" fill="#8B4513"/>
                <!-- Body -->
                <rect x="8" y="16" width="16" height="12" fill="#A0522D"/>
                <rect x="12" y="20" width="8" height="8" fill="#C0703D"/>
                <!-- Head -->
                <rect x="0" y="12" width="12" height="12" fill="#A0522D"/>
                <!-- Ear -->
                <rect x="0" y="8" width="4" height="4" fill="#A0522D"/>
                <!-- Eye -->
                <rect x="2" y="16" width="4" height="4" fill="#000"/>
                <rect x="4" y="16" width="2" height="2" fill="#FFF"/>
                <!-- Acorn -->
                <rect x="4" y="24" width="6" height="8" fill="#8B4513"/>
                <rect x="4" y="22" width="6" height="4" fill="#4A3728"/>
            </svg>`
    },

    backpack: {
        width: 32,
        height: 40,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40" shape-rendering="crispEdges">
                <rect x="4" y="8" width="24" height="32" fill="#CC0000"/>
                <rect x="6" y="10" width="20" height="28" fill="#990000"/>
                <!-- Pocket -->
                <rect x="8" y="20" width="16" height="12" fill="#880000"/>
                <rect x="10" y="22" width="12" height="8" fill="#770000"/>
                <!-- Zipper -->
                <rect x="15" y="20" width="2" height="12" fill="#FFD700"/>
                <!-- Handle -->
                <rect x="10" y="4" width="12" height="6" fill="#990000"/>
                <rect x="12" y="2" width="8" height="4" fill="#CC0000"/>
                <!-- IU Logo -->
                <rect x="12" y="10" width="8" height="6" fill="#FFFFFF"/>
                <rect x="14" y="11" width="4" height="4" fill="#CC0000"/>
            </svg>`
    },

    planter: {
        width: 48,
        height: 44,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 44" shape-rendering="crispEdges">
                <!-- Limestone base -->
                <rect x="4" y="24" width="40" height="20" fill="#D4C5A9"/>
                <rect x="6" y="26" width="36" height="16" fill="#C4B599"/>
                <rect x="8" y="28" width="32" height="12" fill="#B4A589"/>
                <!-- Dirt -->
                <rect x="8" y="20" width="32" height="8" fill="#5D4037"/>
                <!-- Plants - pixelated -->
                <rect x="12" y="8" width="8" height="16" fill="#228B22"/>
                <rect x="16" y="4" width="4" height="8" fill="#32CD32"/>
                <rect x="28" y="8" width="8" height="16" fill="#228B22"/>
                <rect x="30" y="2" width="4" height="10" fill="#32CD32"/>
                <!-- Flowers -->
                <rect x="10" y="4" width="4" height="4" fill="#FF69B4"/>
                <rect x="34" y="6" width="4" height="4" fill="#FFD700"/>
                <rect x="22" y="0" width="4" height="4" fill="#FF6347"/>
            </svg>`
    },

    // NEW: Blockade/Barrier
    blockade: {
        width: 64,
        height: 48,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48" shape-rendering="crispEdges">
                <!-- Posts -->
                <rect x="4" y="16" width="8" height="32" fill="#FF6600"/>
                <rect x="52" y="16" width="8" height="32" fill="#FF6600"/>
                <!-- Barrier bar -->
                <rect x="0" y="20" width="64" height="12" fill="#FF6600"/>
                <rect x="0" y="24" width="64" height="4" fill="#FFFFFF"/>
                <!-- Stripes -->
                <rect x="8" y="20" width="8" height="12" fill="#FFFFFF"/>
                <rect x="24" y="20" width="8" height="12" fill="#FFFFFF"/>
                <rect x="40" y="20" width="8" height="12" fill="#FFFFFF"/>
                <rect x="56" y="20" width="8" height="12" fill="#FFFFFF"/>
                <!-- Reflectors -->
                <rect x="6" y="18" width="4" height="4" fill="#FFFF00"/>
                <rect x="54" y="18" width="4" height="4" fill="#FFFF00"/>
                <!-- Base -->
                <rect x="2" y="44" width="12" height="4" fill="#333"/>
                <rect x="50" y="44" width="12" height="4" fill="#333"/>
            </svg>`
    },

    // NEW: Jersey barrier
    jerseyBarrier: {
        width: 56,
        height: 36,
        hitboxPadding: 4,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 36" shape-rendering="crispEdges">
                <rect x="4" y="8" width="48" height="28" fill="#CCCCCC"/>
                <rect x="0" y="28" width="56" height="8" fill="#AAAAAA"/>
                <rect x="8" y="0" width="40" height="12" fill="#CCCCCC"/>
                <!-- Stripes -->
                <rect x="8" y="12" width="8" height="16" fill="#FF6600"/>
                <rect x="24" y="12" width="8" height="16" fill="#FF6600"/>
                <rect x="40" y="12" width="8" height="16" fill="#FF6600"/>
                <!-- Texture -->
                <rect x="6" y="10" width="44" height="2" fill="#BBBBBB"/>
                <rect x="6" y="26" width="44" height="2" fill="#999999"/>
            </svg>`
    },

    // NEW: Hurdle
    hurdle: {
        width: 48,
        height: 40,
        hitboxPadding: 3,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 40" shape-rendering="crispEdges">
                <!-- Posts -->
                <rect x="2" y="8" width="6" height="32" fill="#FFFFFF"/>
                <rect x="40" y="8" width="6" height="32" fill="#FFFFFF"/>
                <!-- Crossbar -->
                <rect x="0" y="8" width="48" height="8" fill="#CC0000"/>
                <rect x="0" y="12" width="48" height="4" fill="#FFFFFF"/>
                <!-- Base feet -->
                <rect x="0" y="36" width="10" height="4" fill="#333"/>
                <rect x="38" y="36" width="10" height="4" fill="#333"/>
            </svg>`
    }
};

// ============================================
// COLLECTIBLES - 16-BIT STYLE
// ============================================

const BOTTLE_CONFIG = {
    width: 20,
    height: 36,
    glowColor: '#FFD700',
    bobSpeed: 0.004,
    bobAmount: 6
};

function generateBottleSVG() {
    return `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 36" shape-rendering="crispEdges">
        <!-- Glow aura -->
        <rect x="2" y="6" width="16" height="28" fill="#FFD700" opacity="0.3"/>
        <!-- Cap -->
        <rect x="6" y="0" width="8" height="4" fill="#DAA520"/>
        <rect x="8" y="2" width="4" height="2" fill="#B8860B"/>
        <!-- Neck -->
        <rect x="7" y="4" width="6" height="8" fill="#4A3728"/>
        <rect x="8" y="5" width="4" height="6" fill="#6B4423"/>
        <!-- Body -->
        <rect x="4" y="12" width="12" height="22" fill="#4A3728"/>
        <rect x="5" y="13" width="10" height="20" fill="#6B4423"/>
        <rect x="6" y="14" width="2" height="18" fill="#8B6633" opacity="0.5"/>
        <!-- Label -->
        <rect x="5" y="18" width="10" height="10" fill="#F5F5DC"/>
        <rect x="7" y="20" width="6" height="6" fill="#990000"/>
        <!-- Sparkles -->
        <rect x="2" y="8" width="2" height="2" fill="#FFFF00"/>
        <rect x="16" y="16" width="2" height="2" fill="#FFFF00"/>
        <rect x="0" y="28" width="2" height="2" fill="#FFFF00"/>
    </svg>`;
}

// NEW COLLECTIBLES

const COLLECTIBLES = {
    bottle: {
        width: 20,
        height: 36,
        points: 1,
        generate: generateBottleSVG
    },

    football: {
        width: 32,
        height: 20,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 20" shape-rendering="crispEdges">
                <!-- Glow -->
                <rect x="2" y="2" width="28" height="16" fill="#FFD700" opacity="0.3"/>
                <!-- Ball body -->
                <rect x="4" y="4" width="24" height="12" fill="#8B4513"/>
                <rect x="2" y="6" width="4" height="8" fill="#8B4513"/>
                <rect x="26" y="6" width="4" height="8" fill="#8B4513"/>
                <rect x="6" y="2" width="20" height="4" fill="#A0522D"/>
                <rect x="6" y="14" width="20" height="4" fill="#6B3710"/>
                <!-- Laces -->
                <rect x="14" y="4" width="4" height="2" fill="#FFFFFF"/>
                <rect x="12" y="6" width="8" height="2" fill="#FFFFFF"/>
                <rect x="14" y="8" width="4" height="2" fill="#FFFFFF"/>
                <rect x="12" y="10" width="8" height="2" fill="#FFFFFF"/>
                <rect x="14" y="12" width="4" height="2" fill="#FFFFFF"/>
                <!-- Sparkle -->
                <rect x="0" y="0" width="2" height="2" fill="#FFFF00"/>
                <rect x="30" y="18" width="2" height="2" fill="#FFFF00"/>
            </svg>`
    },

    trophy: {
        width: 24,
        height: 36,
        points: 2,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" shape-rendering="crispEdges">
                <!-- Glow -->
                <rect x="2" y="0" width="20" height="24" fill="#FFD700" opacity="0.4"/>
                <!-- Cup -->
                <rect x="4" y="2" width="16" height="16" fill="#FFD700"/>
                <rect x="6" y="4" width="12" height="12" fill="#FFC700"/>
                <rect x="8" y="6" width="8" height="8" fill="#FFE700"/>
                <!-- Handles -->
                <rect x="0" y="4" width="4" height="12" fill="#FFD700"/>
                <rect x="0" y="6" width="2" height="8" fill="#FFC700"/>
                <rect x="20" y="4" width="4" height="12" fill="#FFD700"/>
                <rect x="22" y="6" width="2" height="8" fill="#FFC700"/>
                <!-- Stem -->
                <rect x="10" y="18" width="4" height="8" fill="#DAA520"/>
                <!-- Base -->
                <rect x="6" y="26" width="12" height="4" fill="#DAA520"/>
                <rect x="4" y="30" width="16" height="6" fill="#CD853F"/>
                <rect x="6" y="32" width="12" height="2" fill="#8B4513"/>
                <!-- Star -->
                <rect x="10" y="8" width="4" height="4" fill="#FFFFFF"/>
                <!-- Sparkles -->
                <rect x="2" y="0" width="2" height="2" fill="#FFFFFF"/>
                <rect x="20" y="2" width="2" height="2" fill="#FFFFFF"/>
            </svg>`
    },

    // BIG TEN MASCOTS
    mascotBuckeye: { // Ohio State
        width: 28,
        height: 28,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges">
                <rect x="2" y="2" width="24" height="24" fill="#FFD700" opacity="0.3"/>
                <!-- Buckeye nut -->
                <rect x="6" y="4" width="16" height="20" fill="#8B4513"/>
                <rect x="8" y="6" width="12" height="16" fill="#A0522D"/>
                <rect x="4" y="8" width="4" height="12" fill="#8B4513"/>
                <rect x="20" y="8" width="4" height="12" fill="#8B4513"/>
                <!-- Light spot -->
                <rect x="8" y="8" width="6" height="6" fill="#C9A050"/>
                <rect x="10" y="10" width="2" height="2" fill="#FFFFFF"/>
            </svg>`
    },

    mascotWolverine: { // Michigan
        width: 32,
        height: 28,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 28" shape-rendering="crispEdges">
                <rect x="2" y="2" width="28" height="24" fill="#FFD700" opacity="0.3"/>
                <!-- Wolverine M -->
                <rect x="4" y="4" width="24" height="20" fill="#00274C"/>
                <rect x="6" y="8" width="4" height="14" fill="#FFCB05"/>
                <rect x="10" y="8" width="4" height="8" fill="#FFCB05"/>
                <rect x="14" y="8" width="4" height="8" fill="#FFCB05"/>
                <rect x="18" y="8" width="4" height="8" fill="#FFCB05"/>
                <rect x="22" y="8" width="4" height="14" fill="#FFCB05"/>
            </svg>`
    },

    mascotLion: { // Penn State
        width: 28,
        height: 32,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 32" shape-rendering="crispEdges">
                <rect x="2" y="2" width="24" height="28" fill="#FFD700" opacity="0.3"/>
                <!-- Lion face -->
                <rect x="6" y="8" width="16" height="16" fill="#041E42"/>
                <rect x="4" y="4" width="8" height="8" fill="#041E42"/>
                <rect x="16" y="4" width="8" height="8" fill="#041E42"/>
                <!-- Mane -->
                <rect x="2" y="6" width="4" height="12" fill="#C4A052"/>
                <rect x="22" y="6" width="4" height="12" fill="#C4A052"/>
                <rect x="8" y="2" width="12" height="4" fill="#C4A052"/>
                <!-- Face -->
                <rect x="8" y="12" width="4" height="4" fill="#FFFFFF"/>
                <rect x="16" y="12" width="4" height="4" fill="#FFFFFF"/>
                <rect x="10" y="14" width="2" height="2" fill="#000"/>
                <rect x="18" y="14" width="2" height="2" fill="#000"/>
                <rect x="12" y="18" width="4" height="4" fill="#FFFFFF"/>
            </svg>`
    },

    mascotHoosier: { // Indiana - IU Logo
        width: 28,
        height: 28,
        points: 2,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges">
                <rect x="0" y="0" width="28" height="28" fill="#FFD700" opacity="0.4"/>
                <!-- IU Block -->
                <rect x="2" y="2" width="24" height="24" fill="#990000"/>
                <rect x="4" y="4" width="20" height="20" fill="#7A0000"/>
                <!-- I -->
                <rect x="6" y="6" width="6" height="16" fill="#FFFFFF"/>
                <!-- U -->
                <rect x="14" y="6" width="4" height="16" fill="#FFFFFF"/>
                <rect x="18" y="18" width="4" height="4" fill="#FFFFFF"/>
                <rect x="22" y="6" width="4" height="12" fill="#FFFFFF"/>
            </svg>`
    },

    mascotBadger: { // Wisconsin
        width: 28,
        height: 28,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" shape-rendering="crispEdges">
                <rect x="2" y="2" width="24" height="24" fill="#FFD700" opacity="0.3"/>
                <!-- W -->
                <rect x="4" y="4" width="20" height="20" fill="#C5050C"/>
                <rect x="6" y="8" width="4" height="12" fill="#FFFFFF"/>
                <rect x="10" y="12" width="4" height="8" fill="#FFFFFF"/>
                <rect x="14" y="12" width="4" height="8" fill="#FFFFFF"/>
                <rect x="18" y="8" width="4" height="12" fill="#FFFFFF"/>
            </svg>`
    },

    mascotHawkeye: { // Iowa
        width: 32,
        height: 28,
        points: 1,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 28" shape-rendering="crispEdges">
                <rect x="2" y="2" width="28" height="24" fill="#FFD700" opacity="0.3"/>
                <!-- Hawk eye -->
                <rect x="4" y="4" width="24" height="20" fill="#000000"/>
                <rect x="8" y="8" width="16" height="12" fill="#FFCD00"/>
                <!-- Pupil -->
                <rect x="14" y="10" width="8" height="8" fill="#000000"/>
                <rect x="16" y="12" width="2" height="2" fill="#FFFFFF"/>
            </svg>`
    }
};

// ============================================
// CITY BACKGROUNDS - 16-BIT STYLE
// ============================================

const BACKGROUNDS = {
    // CHICAGO
    searsTower: {
        width: 80,
        height: 200,
        city: 'chicago',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 200" shape-rendering="crispEdges">
                <rect x="10" y="40" width="60" height="160" fill="#333344"/>
                <rect x="15" y="20" width="50" height="30" fill="#333344"/>
                <rect x="20" y="0" width="40" height="30" fill="#333344"/>
                <!-- Windows -->
                ${Array.from({length: 15}, (_, i) =>
                    `<rect x="15" y="${50 + i*10}" width="6" height="6" fill="#FFFF88"/>
                     <rect x="25" y="${50 + i*10}" width="6" height="6" fill="#88CCFF"/>
                     <rect x="35" y="${50 + i*10}" width="6" height="6" fill="#FFFF88"/>
                     <rect x="45" y="${50 + i*10}" width="6" height="6" fill="#88CCFF"/>
                     <rect x="55" y="${50 + i*10}" width="6" height="6" fill="#FFFF88"/>`
                ).join('')}
                <!-- Antennas -->
                <rect x="30" y="-20" width="4" height="24" fill="#666"/>
                <rect x="46" y="-15" width="4" height="18" fill="#666"/>
            </svg>`
    },

    theBean: {
        width: 60,
        height: 40,
        city: 'chicago',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 40" shape-rendering="crispEdges">
                <!-- Cloud Gate / The Bean - simplified pixel art -->
                <rect x="8" y="20" width="44" height="20" fill="#C0C0C0"/>
                <rect x="4" y="16" width="52" height="8" fill="#D0D0D0"/>
                <rect x="12" y="12" width="36" height="8" fill="#E0E0E0"/>
                <rect x="20" y="8" width="20" height="8" fill="#D8D8D8"/>
                <!-- Reflection distortion -->
                <rect x="16" y="24" width="8" height="8" fill="#A0C0E0"/>
                <rect x="36" y="24" width="8" height="8" fill="#FFE0B0"/>
                <!-- Ground reflection -->
                <rect x="12" y="36" width="36" height="4" fill="#999"/>
            </svg>`
    },

    // LOS ANGELES
    hollywoodSign: {
        width: 180,
        height: 50,
        city: 'losangeles',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 50" shape-rendering="crispEdges">
                <!-- Mountain -->
                <rect x="0" y="30" width="180" height="20" fill="#8B7355"/>
                <rect x="20" y="20" width="140" height="15" fill="#9B8365"/>
                <!-- HOLLYWOOD letters -->
                <text x="10" y="28" font-family="monospace" font-size="20" fill="#FFFFFF" font-weight="bold">HOLLYWOOD</text>
                <!-- Letter shadows -->
                <rect x="10" y="30" width="160" height="4" fill="rgba(0,0,0,0.3)"/>
            </svg>`
    },

    palmTree: {
        width: 40,
        height: 100,
        city: 'losangeles',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 100" shape-rendering="crispEdges">
                <!-- Trunk -->
                <rect x="16" y="30" width="8" height="70" fill="#8B7355"/>
                <rect x="17" y="35" width="6" height="60" fill="#9B8365"/>
                <!-- Trunk segments -->
                ${Array.from({length: 8}, (_, i) =>
                    `<rect x="15" y="${35 + i*8}" width="10" height="2" fill="#7B6345"/>`
                ).join('')}
                <!-- Fronds -->
                <rect x="0" y="10" width="20" height="4" fill="#228B22"/>
                <rect x="2" y="14" width="16" height="4" fill="#228B22"/>
                <rect x="20" y="10" width="20" height="4" fill="#32CD32"/>
                <rect x="22" y="14" width="16" height="4" fill="#32CD32"/>
                <rect x="8" y="0" width="24" height="4" fill="#228B22"/>
                <rect x="10" y="4" width="20" height="8" fill="#32CD32"/>
                <rect x="14" y="12" width="12" height="8" fill="#228B22"/>
                <!-- Coconuts -->
                <rect x="16" y="22" width="4" height="4" fill="#8B4513"/>
                <rect x="20" y="24" width="4" height="4" fill="#8B4513"/>
            </svg>`
    },

    // ATLANTA
    cnntower: {
        width: 70,
        height: 140,
        city: 'atlanta',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 70 140" shape-rendering="crispEdges">
                <rect x="10" y="20" width="50" height="120" fill="#445566"/>
                <rect x="5" y="30" width="60" height="10" fill="#556677"/>
                <!-- CNN Logo area -->
                <rect x="15" y="40" width="40" height="20" fill="#CC0000"/>
                <text x="20" y="56" font-family="monospace" font-size="12" fill="#FFFFFF" font-weight="bold">CNN</text>
                <!-- Windows -->
                ${Array.from({length: 8}, (_, i) =>
                    `<rect x="15" y="${70 + i*8}" width="8" height="5" fill="#88CCFF"/>
                     <rect x="28" y="${70 + i*8}" width="8" height="5" fill="#88CCFF"/>
                     <rect x="41" y="${70 + i*8}" width="8" height="5" fill="#88CCFF"/>`
                ).join('')}
                <!-- Top -->
                <rect x="25" y="0" width="20" height="25" fill="#556677"/>
                <rect x="30" y="-10" width="10" height="15" fill="#667788"/>
            </svg>`
    },

    peachtreeSign: {
        width: 50,
        height: 80,
        city: 'atlanta',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 80" shape-rendering="crispEdges">
                <!-- Pole -->
                <rect x="22" y="20" width="6" height="60" fill="#333"/>
                <!-- Sign -->
                <rect x="5" y="0" width="40" height="25" fill="#006633"/>
                <rect x="7" y="2" width="36" height="21" fill="#008844"/>
                <text x="10" y="10" font-family="monospace" font-size="6" fill="#FFFFFF">PEACHTREE</text>
                <text x="18" y="18" font-family="monospace" font-size="6" fill="#FFFFFF">ST</text>
                <!-- Peach icon -->
                <rect x="34" y="5" width="6" height="6" fill="#FFAA88"/>
            </svg>`
    },

    // MIAMI
    artDecoBuilding: {
        width: 80,
        height: 120,
        city: 'miami',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 120" shape-rendering="crispEdges">
                <!-- Main building - pastel colors -->
                <rect x="10" y="20" width="60" height="100" fill="#FFB6C1"/>
                <rect x="15" y="25" width="50" height="90" fill="#FFC0CB"/>
                <!-- Art deco details -->
                <rect x="10" y="20" width="60" height="8" fill="#40E0D0"/>
                <rect x="10" y="35" width="60" height="4" fill="#40E0D0"/>
                <!-- Windows -->
                ${Array.from({length: 6}, (_, i) =>
                    `<rect x="20" y="${45 + i*12}" width="15" height="8" fill="#E0FFFF"/>
                     <rect x="45" y="${45 + i*12}" width="15" height="8" fill="#E0FFFF"/>`
                ).join('')}
                <!-- Top decoration -->
                <rect x="30" y="5" width="20" height="20" fill="#40E0D0"/>
                <rect x="35" y="0" width="10" height="10" fill="#FFB6C1"/>
            </svg>`
    },

    miamiPalm: {
        width: 36,
        height: 90,
        city: 'miami',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 90" shape-rendering="crispEdges">
                <!-- Curved trunk -->
                <rect x="14" y="30" width="8" height="60" fill="#DEB887"/>
                <rect x="12" y="40" width="4" height="50" fill="#D2B48C"/>
                <!-- Fronds - more tropical -->
                <rect x="0" y="8" width="18" height="6" fill="#00FF7F"/>
                <rect x="18" y="8" width="18" height="6" fill="#00FF7F"/>
                <rect x="4" y="14" width="14" height="6" fill="#32CD32"/>
                <rect x="18" y="14" width="14" height="6" fill="#32CD32"/>
                <rect x="8" y="20" width="20" height="8" fill="#228B22"/>
                <rect x="12" y="28" width="12" height="6" fill="#006400"/>
                <!-- Sunset reflection on fronds -->
                <rect x="10" y="10" width="16" height="2" fill="#FFD700" opacity="0.4"/>
            </svg>`
    },

    // INDIANAPOLIS
    monumentCircle: {
        width: 60,
        height: 160,
        city: 'indianapolis',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 160" shape-rendering="crispEdges">
                <!-- Base circle/platform -->
                <rect x="5" y="130" width="50" height="30" fill="#C4B599"/>
                <rect x="10" y="125" width="40" height="10" fill="#D4C5A9"/>
                <!-- Column -->
                <rect x="22" y="30" width="16" height="100" fill="#D4C5A9"/>
                <rect x="20" y="40" width="20" height="8" fill="#C4B599"/>
                <rect x="20" y="80" width="20" height="8" fill="#C4B599"/>
                <rect x="20" y="120" width="20" height="8" fill="#C4B599"/>
                <!-- Top platform -->
                <rect x="15" y="20" width="30" height="15" fill="#C4B599"/>
                <!-- Lady Victory statue -->
                <rect x="25" y="0" width="10" height="24" fill="#DAA520"/>
                <rect x="22" y="8" width="16" height="4" fill="#DAA520"/>
                <!-- Torch -->
                <rect x="28" y="-5" width="4" height="8" fill="#B8860B"/>
                <rect x="27" y="-8" width="6" height="4" fill="#FF6600"/>
            </svg>`
    },

    speedwayGate: {
        width: 100,
        height: 80,
        city: 'indianapolis',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" shape-rendering="crispEdges">
                <!-- Gate structure -->
                <rect x="5" y="20" width="15" height="60" fill="#8B0000"/>
                <rect x="80" y="20" width="15" height="60" fill="#8B0000"/>
                <!-- Arch -->
                <rect x="5" y="10" width="90" height="15" fill="#8B0000"/>
                <rect x="10" y="5" width="80" height="10" fill="#660000"/>
                <!-- Bricks pattern -->
                <rect x="20" y="25" width="60" height="50" fill="#CC0000"/>
                ${Array.from({length: 5}, (_, i) =>
                    `<rect x="20" y="${30 + i*10}" width="60" height="2" fill="#8B0000"/>`
                ).join('')}
                <!-- INDY text -->
                <text x="30" y="55" font-family="monospace" font-size="16" fill="#FFFFFF" font-weight="bold">INDY</text>
                <!-- Checkered flags -->
                <rect x="8" y="0" width="8" height="8" fill="#FFFFFF"/>
                <rect x="12" y="4" width="4" height="4" fill="#000"/>
                <rect x="84" y="0" width="8" height="8" fill="#FFFFFF"/>
                <rect x="84" y="0" width="4" height="4" fill="#000"/>
                <rect x="88" y="4" width="4" height="4" fill="#000"/>
            </svg>`
    },

    // GENERIC ELEMENTS
    tree: {
        width: 48,
        height: 80,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 80" shape-rendering="crispEdges">
                <rect x="20" y="50" width="8" height="30" fill="#5D4037"/>
                <rect x="22" y="55" width="4" height="20" fill="#6D5047"/>
                <rect x="8" y="20" width="32" height="35" fill="#228B22"/>
                <rect x="12" y="10" width="24" height="20" fill="#2E8B2E"/>
                <rect x="16" y="0" width="16" height="15" fill="#32CD32"/>
                <!-- Pixel highlights -->
                <rect x="14" y="25" width="4" height="4" fill="#3CB043"/>
                <rect x="28" y="18" width="4" height="4" fill="#3CB043"/>
            </svg>`
    },

    lampPost: {
        width: 16,
        height: 70,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 70" shape-rendering="crispEdges">
                <rect x="6" y="20" width="4" height="50" fill="#333"/>
                <rect x="2" y="10" width="12" height="12" fill="#333"/>
                <rect x="4" y="12" width="8" height="8" fill="#FFFFCC"/>
                <rect x="4" y="66" width="8" height="4" fill="#444"/>
            </svg>`
    },

    bikeRack: {
        width: 40,
        height: 28,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 28" shape-rendering="crispEdges">
                <rect x="4" y="8" width="4" height="20" fill="#666"/>
                <rect x="8" y="4" width="8" height="4" fill="#666"/>
                <rect x="16" y="8" width="4" height="20" fill="#666"/>
                <rect x="20" y="4" width="8" height="4" fill="#666"/>
                <rect x="28" y="8" width="4" height="20" fill="#666"/>
                <rect x="32" y="4" width="4" height="4" fill="#666"/>
            </svg>`
    },

    bench: {
        width: 50,
        height: 30,
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 30" shape-rendering="crispEdges">
                <rect x="4" y="12" width="42" height="6" fill="#8B4513"/>
                <rect x="4" y="4" width="42" height="10" fill="#A0522D"/>
                <rect x="6" y="18" width="4" height="12" fill="#5D4037"/>
                <rect x="40" y="18" width="4" height="12" fill="#5D4037"/>
            </svg>`
    },

    // City skyline silhouettes for far background
    skylineChicago: {
        width: 300,
        height: 150,
        city: 'chicago',
        generate: () => `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 150" shape-rendering="crispEdges">
                <rect x="0" y="80" width="40" height="70" fill="#223344"/>
                <rect x="45" y="40" width="30" height="110" fill="#334455"/>
                <rect x="50" y="20" width="20" height="30" fill="#334455"/>
                <rect x="80" y="60" width="35" height="90" fill="#223344"/>
                <rect x="120" y="30" width="25" height="120" fill="#334455"/>
                <rect x="125" y="10" width="15" height="25" fill="#334455"/>
                <rect x="150" y="50" width="40" height="100" fill="#223344"/>
                <rect x="195" y="25" width="30" height="125" fill="#445566"/>
                <rect x="200" y="5" width="20" height="25" fill="#445566"/>
                <rect x="230" y="70" width="35" height="80" fill="#334455"/>
                <rect x="270" y="90" width="30" height="60" fill="#223344"/>
            </svg>`
    }
};

// ============================================
// ASSET CACHE
// ============================================

const AssetCache = {
    images: {},

    svgToImage(svgString) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const blob = new Blob([svgString], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);

            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };

            img.onerror = reject;
            img.src = url;
        });
    },

    async preloadAll() {
        const loadPromises = [];

        // Player frames
        for (const frame of ['run1', 'run2', 'jump']) {
            loadPromises.push(
                this.svgToImage(generatePlayerSVG(frame))
                    .then(img => { this.images[`player_${frame}`] = img; })
            );
        }

        // Obstacles
        for (const [name, obstacle] of Object.entries(OBSTACLES)) {
            loadPromises.push(
                this.svgToImage(obstacle.generate())
                    .then(img => { this.images[`obstacle_${name}`] = img; })
            );
        }

        // Collectibles
        for (const [name, collectible] of Object.entries(COLLECTIBLES)) {
            loadPromises.push(
                this.svgToImage(collectible.generate())
                    .then(img => { this.images[`collectible_${name}`] = img; })
            );
        }

        // Backgrounds
        for (const [name, bg] of Object.entries(BACKGROUNDS)) {
            loadPromises.push(
                this.svgToImage(bg.generate())
                    .then(img => { this.images[`bg_${name}`] = img; })
            );
        }

        await Promise.all(loadPromises);
        console.log('All assets loaded:', Object.keys(this.images).length, 'items');
    },

    get(key) {
        return this.images[key] || null;
    }
};

// ============================================
// GAME CONFIG
// ============================================

const GAME_CONFIG = {
    // === CUSTOMIZE THESE ===
    INVITATION_CODE: 'HOOSIER2024',
    ITEMS_TO_WIN: 15,  // Increased from 10

    // Speed settings
    SPEED_INCREASE_INTERVAL: 25000,
    SPEED_INCREASE_MULTIPLIER: 1.12,
    MAX_SPEED_MULTIPLIER: 2.2,

    // Physics
    INITIAL_SPEED: 5,
    GRAVITY: 0.65,
    JUMP_FORCE: -15,
    GROUND_Y_OFFSET: 100,

    // Spawn rates - INCREASED for more items
    OBSTACLE_SPAWN_CHANCE: 0.015,
    MIN_OBSTACLE_GAP: 250,
    COLLECTIBLE_SPAWN_CHANCE: 0.025,  // Much higher
    MIN_COLLECTIBLE_GAP: 200,  // Reduced gap
    GUARANTEED_SPAWN_INTERVAL: 1500,  // Force spawn every 1.5 seconds

    // Collision
    COLLECTIBLE_HITBOX_PADDING: 18,
    STUMBLE_DURATION: 400,
    STUMBLE_SPEED_MULTIPLIER: 0.5,

    // Parallax
    PARALLAX_SPEEDS: {
        far: 0.15,
        mid: 0.4,
        near: 0.7
    },

    // City rotation
    CITIES: ['chicago', 'losangeles', 'atlanta', 'miami', 'indianapolis']
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PLAYER_CONFIG, OBSTACLES, COLLECTIBLES, BOTTLE_CONFIG, BACKGROUNDS, AssetCache, GAME_CONFIG };
}
