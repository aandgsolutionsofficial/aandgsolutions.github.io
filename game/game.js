/* =========================================================
   A&G SOLUTIONS
   PARTS RUSH
   COMPLETE GAME ENGINE
========================================================= */

"use strict";


/* =========================================================
   CONFIG
========================================================= */

const CONFIG = {

    rows: 8,
    cols: 8,

    types: [
        "phone",
        "battery",
        "audio",
        "charger",
        "camera",
        "display"
    ],

    typeData: {

        phone: {
            name: "Phones",
            icon: "📱",
            className: "tile-phone"
        },

        battery: {
            name: "Batteries",
            icon: "🔋",
            className: "tile-battery"
        },

        audio: {
            name: "Headphones",
            icon: "🎧",
            className: "tile-audio"
        },

        charger: {
            name: "Chargers",
            icon: "🔌",
            className: "tile-charger"
        },

        camera: {
            name: "Cameras",
            icon: "📷",
            className: "tile-camera"
        },

        display: {
            name: "Displays",
            icon: "🖥️",
            className: "tile-display"
        }
    },

    scorePerTile: 60,

    specialBonus: {
        line: 450,
        pulse: 700,
        core: 1200
    },

    storageKey: "ag_parts_rush_v3"
};


/* =========================================================
   STATE
========================================================= */

let board = [];

let selected = null;

let busy = false;

let currentLevel = 1;

let score = 0;

let moves = 0;

let levelBest = 0;

let soundEnabled = true;

let audioContext = null;

let objectives = [];

let combo = 0;

let touchStart = null;

let activeLevelConfig = null;

let gameStarted = false;


/* =========================================================
   DOM
========================================================= */

const startScreen =
    document.getElementById("startScreen");

const mapScreen =
    document.getElementById("mapScreen");

const gameScreen =
    document.getElementById("gameScreen");

const gameBoard =
    document.getElementById("gameBoard");

const objectiveArea =
    document.getElementById("objectiveArea");

const scoreValue =
    document.getElementById("scoreValue");

const movesValue =
    document.getElementById("movesValue");

const levelBestValue =
    document.getElementById("levelBestValue");

const gameLevelNumber =
    document.getElementById("gameLevelNumber");

const levelTitle =
    document.getElementById("levelTitle");

const progressFill =
    document.getElementById("progressFill");

const progressText =
    document.getElementById("progressText");

const gameMessage =
    document.getElementById("gameMessage");

const totalStars =
    document.getElementById("totalStars");

const bestScore =
    document.getElementById("bestScore");

const mapCurrentLevel =
    document.getElementById("mapCurrentLevel");

const levelNodes =
    document.getElementById("levelNodes");

const levelMap =
    document.getElementById("levelMap");

const toast =
    document.getElementById("toast");

const completeModal =
    document.getElementById("completeModal");

const failModal =
    document.getElementById("failModal");

const levelInfoModal =
    document.getElementById("levelInfoModal");


/* =========================================================
   STORAGE
========================================================= */

function defaultSave() {

    return {
        currentLevel: 1,

        completed: {},

        stars: {},

        bestScores: {},

        totalStars: 0,

        bestScore: 0
    };
}


function loadSave() {

    try {

        const raw =
            localStorage.getItem(CONFIG.storageKey);

        if (!raw) {
            return defaultSave();
        }

        const data = JSON.parse(raw);

        return {
            ...defaultSave(),
            ...data
        };

    } catch (error) {

        console.warn(
            "Save data could not be loaded.",
            error
        );

        return defaultSave();
    }
}


let saveData = loadSave();


function saveGame() {

    try {

        localStorage.setItem(
            CONFIG.storageKey,
            JSON.stringify(saveData)
        );

    } catch (error) {

        console.warn(
            "Save failed.",
            error
        );
    }
}


/* =========================================================
   SCREEN CONTROL
========================================================= */

function showScreen(screen) {

    [startScreen, mapScreen, gameScreen]
        .forEach(s => {
            s.classList.remove("active");
        });

    screen.classList.add("active");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   START
========================================================= */

function initializeStartScreen() {

    if (saveData.currentLevel > 1) {

        document
            .getElementById("continueButton")
            .classList.remove("hidden");

    }
}


document
    .getElementById("playButton")
    .addEventListener("click", () => {

        ensureAudio();

        renderMap();

        showScreen(mapScreen);

    });


document
    .getElementById("continueButton")
    .addEventListener("click", () => {

        ensureAudio();

        renderMap();

        showScreen(mapScreen);

    });


/* =========================================================
   LEVEL DATA
========================================================= */

function generateLevel(level) {

    const titles = [
        "Battery Emergency",
        "Phone Rescue",
        "Audio Repair",
        "Charger Station",
        "Camera Calibration",
        "Display Recovery",
        "Power Surge",
        "Signal Repair",
        "Workshop Rush",
        "Master Technician"
    ];

    const title =
        titles[(level - 1) % titles.length];

    let moves =
        Math.max(
            18,
            28 - Math.floor(level / 5)
        );

    const difficulty =
        Math.floor((level - 1) / 5);

    const objectives = [];

    const primaryTypes =
        CONFIG.types;

    const typeA =
        primaryTypes[(level * 2) % primaryTypes.length];

    const typeB =
        primaryTypes[(level * 3 + 1) % primaryTypes.length];


    /* -------------------------------------------------------
       EARLY LEVELS
    ------------------------------------------------------- */

    if (level === 1) {

        moves = 24;

        objectives.push({
            id: "collect-battery",
            kind: "collect",
            type: "battery",
            target: 12,
            current: 0,
            label: "Match batteries"
        });

    }

    else if (level === 2) {

        moves = 23;

        objectives.push({
            id: "collect-phone",
            kind: "collect",
            type: "phone",
            target: 14,
            current: 0,
            label: "Match phones"
        });

        objectives.push({
            id: "score",
            kind: "score",
            target: 1800,
            current: 0,
            label: "Reach score"
        });

    }

    else if (level === 3) {

        moves = 25;

        objectives.push({
            id: "collect-battery",
            kind: "collect",
            type: "battery",
            target: 12,
            current: 0,
            label: "Match batteries"
        });

        objectives.push({
            id: "collect-audio",
            kind: "collect",
            type: "audio",
            target: 12,
            current: 0,
            label: "Match headphones"
        });

    }

    else if (level === 4) {

        moves = 25;

        objectives.push({
            id: "blockers",
            kind: "blocker",
            target: 8,
            current: 0,
            label: "Break repair cases"
        });

        objectives.push({
            id: "score",
            kind: "score",
            target: 2200,
            current: 0,
            label: "Reach score"
        });

    }

    else if (level === 5) {

        moves = 25;

        objectives.push({
            id: "line",
            kind: "specialUse",
            special: "line",
            target: 2,
            current: 0,
            label: "Use Power Rails"
        });

        objectives.push({
            id: "collect",
            kind: "collect",
            type: "charger",
            target: 15,
            current: 0,
            label: "Match chargers"
        });

    }

    else if (level === 6) {

        moves = 26;

        objectives.push({
            id: "core",
            kind: "specialUse",
            special: "core",
            target: 1,
            current: 0,
            label: "Activate Energy Core"
        });

        objectives.push({
            id: "collect",
            kind: "collect",
            type: "display",
            target: 18,
            current: 0,
            label: "Match displays"
        });

    }

    else if (level % 4 === 3) {

        objectives.push({
            id: "pulse",
            kind: "specialUse",
            special: "pulse",
            target: 2,
            current: 0,
            label: "Use Pulse Reactors"
        });

        objectives.push({
            id: "collect",
            kind: "collect",
            type: typeA,
            target: 18 + difficulty * 2,
            current: 0,
            label: `Match ${CONFIG.typeData[typeA].name}`
        });

    }

    else if (level % 4 === 0) {

        objectives.push({
            id: "blockers",
            kind: "blocker",
            target: Math.min(
                18,
                7 + difficulty * 2
            ),
            current: 0,
            label: "Break repair cases"
        });

        objectives.push({
            id: "collect",
            kind: "collect",
            type: typeB,
            target: 16 + difficulty * 2,
            current: 0,
            label: `Match ${CONFIG.typeData[typeB].name}`
        });

    }

    else {

        objectives.push({
            id: "collect",
            kind: "collect",
            type: typeA,
            target: 20 + difficulty * 2,
            current: 0,
            label: `Match ${CONFIG.typeData[typeA].name}`
        });

        objectives.push({
            id: "score",
            kind: "score",
            target:
                2200 +
                difficulty * 450,
            current: 0,
            label: "Reach score"
        });

    }


    return {
        level,
        title,
        moves,
        objectives,

        blockers:
            level >= 4
                ? Math.min(
                    16,
                    4 + Math.floor(level / 2)
                )
                : 0
    };
}


/* =========================================================
   REALISTIC SVG PART ART
========================================================= */

function getPartArt(type) {

    if (type === "phone") {

        return `
            <div class="part-art phone-art">
                <div class="screen">
                    <div class="camera-dot"></div>
                    <div class="screen-glass"></div>
                </div>
            </div>
        `;
    }


    if (type === "battery") {

        return `
            <div class="part-art battery-art">
                <div class="battery-window">
                    <div class="battery-symbol"></div>
                </div>
                <div class="charge"></div>
            </div>
        `;
    }


    if (type === "audio") {

        return `
            <div class="part-art headphone-art">

                <div class="arc"></div>

                <div class="speaker"></div>

                <div class="cup left"></div>
                <div class="cup right"></div>

            </div>
        `;
    }


    if (type === "charger") {

        return `
            <div class="part-art charger-art">

                <div class="plug"></div>

                <div class="pin left"></div>
                <div class="pin right"></div>

                <div class="cable"></div>

            </div>
        `;
    }


    if (type === "camera") {

        return `
            <div class="part-art camera-art">

                <div class="lens"></div>

                <div class="flash"></div>

            </div>
        `;
    }


    if (type === "display") {

        return `
            <div class="part-art display-art">

                <div class="glass"></div>

            </div>
        `;
    }


    return `
        <div class="part-art">
            ${CONFIG.typeData[type]?.icon || "?"}
        </div>
    `;
}


/* =========================================================
   TILE CREATION
========================================================= */

function createTile(
    type,
    special = null,
    specialDirection = null
) {

    return {
        id:
            "tile_" +
            Date.now().toString(36) +
            "_" +
            Math.random()
                .toString(36)
                .slice(2),

        type,

        special,

        specialDirection,

        blocker: null
    };
}


/* =========================================================
   INITIAL BOARD
========================================================= */

function createInitialBoard() {

    board = [];

    for (let r = 0; r < CONFIG.rows; r++) {

        board[r] = [];

        for (let c = 0; c < CONFIG.cols; c++) {

            let type;

            let safety = 0;

            do {

                type =
                    randomType();

                safety++;

            } while (
                createsInitialMatch(r, c, type) &&
                safety < 100
            );

            board[r][c] =
                createTile(type);
        }
    }

    addLevelBlockers();
}


function randomType() {

    return CONFIG.types[
        Math.floor(
            Math.random() *
            CONFIG.types.length
        )
    ];
}


function createsInitialMatch(r, c, type) {

    if (
        c >= 2 &&
        board[r][c - 1]?.type === type &&
        board[r][c - 2]?.type === type
    ) {
        return true;
    }

    if (
        r >= 2 &&
        board[r - 1]?.[c]?.type === type &&
        board[r - 2]?.[c]?.type === type
    ) {
        return true;
    }

    return false;
}


/* =========================================================
   BLOCKERS
========================================================= */

function addLevelBlockers() {

    const count =
        activeLevelConfig?.blockers || 0;

    if (!count) {
        return;
    }

    const cells = [];

    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            cells.push({
                r,
                c
            });
        }
    }


    shuffleArray(cells);


    for (
        let i = 0;
        i < Math.min(count, cells.length);
        i++
    ) {

        const cell = cells[i];

        board[cell.r][cell.c].blocker =
            i % 3 === 0
                ? "lock"
                : "glass";
    }
}


/* =========================================================
   RENDER BOARD
========================================================= */

function renderBoard() {

    /*
       IMPORTANT:
       During a blast/resolution there can temporarily be null
       cells. The old renderer tried to read tile.type from null,
       crashed JavaScript, and had already cleared gameBoard.innerHTML.
       That is why the whole board appeared to disappear after a move.

       Empty cells are now rendered safely as placeholders. The
       gravity/refill phase fills them immediately afterwards.
    */

    gameBoard.innerHTML = "";

    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            const tile = board[r][c];

            if (!tile) {

                const empty =
                    document.createElement("div");

                empty.className =
                    "tile tile-empty";

                empty.dataset.row = r;
                empty.dataset.col = c;

                gameBoard.appendChild(empty);

                continue;
            }

            const element =
                document.createElement("div");

            element.className =
                "tile " +
                CONFIG.typeData[tile.type].className;

            element.dataset.row = r;
            element.dataset.col = c;
            element.dataset.id = tile.id;

            if (tile.special) {

                element.classList.add(
                    "special",
                    `special-${tile.special}`
                );

                if (tile.specialDirection) {

                    element.classList.add(
                        `special-direction-${tile.specialDirection}`
                    );
                }
            }

            if (tile.blocker) {

                element.classList.add("blocked");

            }

            if (tile.special === "core") {

                element.innerHTML =
                    `<div class="part-art special-core"></div>`;

            } else {

                element.innerHTML =
                    getPartArt(tile.type);

            }

            if (tile.blocker === "glass") {

                const blocker =
                    document.createElement("div");

                blocker.className =
                    "blocker-glass";

                element.appendChild(blocker);

            }

            if (tile.blocker === "lock") {

                const blocker =
                    document.createElement("div");

                blocker.className =
                    "blocker-lock";

                blocker.textContent = "🔒";

                element.appendChild(blocker);

            }

            element.addEventListener(
                "click",
                () => handleTileClick(r, c)
            );

            gameBoard.appendChild(element);
        }
    }
}

/* =========================================================
   TILE CLICK
========================================================= */

async function handleTileClick(r, c) {

    if (busy) {
        return;
    }

    if (!board[r]?.[c]) {
        return;
    }

    const tile =
        board[r][c];


    if (tile.blocker === "lock") {

        showMessage(
            "Break the lock first!",
            "warn"
        );

        playTone(
            120,
            .08,
            "square"
        );

        return;
    }


    if (!selected) {

        selected = {
            r,
            c
        };

        highlightSelected();

        playTone(
            420,
            .04,
            "sine"
        );

        return;
    }


    if (
        selected.r === r &&
        selected.c === c
    ) {

        selected = null;

        highlightSelected();

        return;
    }


    if (
        isAdjacent(
            selected.r,
            selected.c,
            r,
            c
        )
    ) {

        const first =
            selected;

        selected = null;

        highlightSelected();

        await attemptSwap(
            first.r,
            first.c,
            r,
            c
        );

        return;
    }


    selected = {
        r,
        c
    };

    highlightSelected();
}


/* =========================================================
   SELECT VISUAL
========================================================= */

function highlightSelected() {

    document
        .querySelectorAll(".tile.selected")
        .forEach(el =>
            el.classList.remove("selected")
        );


    if (!selected) {
        return;
    }


    const index =
        selected.r * CONFIG.cols +
        selected.c;


    const tile =
        gameBoard.children[index];

    if (tile) {
        tile.classList.add("selected");
    }
}


/* =========================================================
   SWIPE
========================================================= */

gameBoard.addEventListener(
    "touchstart",
    event => {

        const touch =
            event.touches[0];

        touchStart = {
            x: touch.clientX,
            y: touch.clientY
        };

    },
    {
        passive: true
    }
);


gameBoard.addEventListener(
    "touchend",
    async event => {

        if (!touchStart || busy) {
            return;
        }

        const touch =
            event.changedTouches[0];

        const dx =
            touch.clientX -
            touchStart.x;

        const dy =
            touch.clientY -
            touchStart.y;

        touchStart = null;


        if (
            Math.abs(dx) < 25 &&
            Math.abs(dy) < 25
        ) {
            return;
        }


        const rect =
            gameBoard.getBoundingClientRect();

        const cellW =
            rect.width /
            CONFIG.cols;

        const cellH =
            rect.height /
            CONFIG.rows;

        const col =
            Math.floor(
                (
                    touchStart?.x || touch.clientX
                ) -
                rect.left
            ) /
            cellW;

        void col;

    },
    {
        passive: true
    }
);


/* Better pointer swipe handling */

let pointerStart = null;


gameBoard.addEventListener(
    "pointerdown",
    event => {

        pointerStart = {
            x: event.clientX,
            y: event.clientY
        };

    }
);


gameBoard.addEventListener(
    "pointerup",
    async event => {

        if (!pointerStart || busy) {
            pointerStart = null;
            return;
        }


        const dx =
            event.clientX -
            pointerStart.x;

        const dy =
            event.clientY -
            pointerStart.y;


        const startX =
            pointerStart.x;

        const startY =
            pointerStart.y;

        pointerStart = null;


        if (
            Math.abs(dx) < 25 &&
            Math.abs(dy) < 25
        ) {
            return;
        }


        const rect =
            gameBoard.getBoundingClientRect();


        const startCol =
            Math.floor(
                (
                    startX -
                    rect.left
                ) /
                (rect.width / CONFIG.cols)
            );

        const startRow =
            Math.floor(
                (
                    startY -
                    rect.top
                ) /
                (rect.height / CONFIG.rows)
            );


        if (
            startRow < 0 ||
            startRow >= CONFIG.rows ||
            startCol < 0 ||
            startCol >= CONFIG.cols
        ) {
            return;
        }


        let endRow =
            startRow;

        let endCol =
            startCol;


        if (Math.abs(dx) > Math.abs(dy)) {

            endCol +=
                dx > 0
                    ? 1
                    : -1;

        } else {

            endRow +=
                dy > 0
                    ? 1
                    : -1;
        }


        if (
            endRow < 0 ||
            endRow >= CONFIG.rows ||
            endCol < 0 ||
            endCol >= CONFIG.cols
        ) {
            return;
        }


        await attemptSwap(
            startRow,
            startCol,
            endRow,
            endCol
        );

    }
);


/* =========================================================
   SWAP
========================================================= */

function isAdjacent(r1, c1, r2, c2) {

    return (
        Math.abs(r1 - r2) +
        Math.abs(c1 - c2)
    ) === 1;
}


async function attemptSwap(r1, c1, r2, c2) {

    if (busy) {
        return;
    }


    if (
        board[r1][c1].blocker === "lock" ||
        board[r2][c2].blocker === "lock"
    ) {

        showMessage(
            "Locked part!",
            "warn"
        );

        return;
    }


    busy = true;


    swapTiles(
        r1,
        c1,
        r2,
        c2
    );


    renderBoard();


    playTone(
        300,
        .05,
        "sine"
    );


    await sleep(180);


    /* special + special */

    if (
        board[r1][c1].special &&
        board[r2][c2].special
    ) {

        moves--;

        updateHUD();

        await activateSpecialCombo(
            r1,
            c1,
            r2,
            c2
        );

        await finishTurn();

        return;
    }


    /* energy core */

    if (
        board[r1][c1].special === "core" ||
        board[r2][c2].special === "core"
    ) {

        moves--;

        updateHUD();

        await activateCoreSwap(
            r1,
            c1,
            r2,
            c2
        );

        await finishTurn();

        return;
    }


    const matches =
        findMatches();


    if (!matches.length) {

        swapTiles(
            r1,
            c1,
            r2,
            c2
        );

        renderBoard();

        playTone(
            150,
            .1,
            "square"
        );

        showMessage(
            "No match!",
            "warn"
        );

        await sleep(180);

        busy = false;

        return;
    }


    moves--;

    updateHUD();


    await resolveBoard(
        matches,
        r1,
        c1,
        r2,
        c2
    );


    await finishTurn();
}


function swapTiles(r1, c1, r2, c2) {

    const temp =
        board[r1][c1];

    board[r1][c1] =
        board[r2][c2];

    board[r2][c2] =
        temp;
}


/* =========================================================
   MATCH DETECTION
========================================================= */

function findMatches() {

    const groups = [];

    const used = new Set();


    /* horizontal */

    for (let r = 0; r < CONFIG.rows; r++) {

        let start = 0;

        while (start < CONFIG.cols) {

            const type =
                board[r][start]?.type;

            if (!type) {
                start++;
                continue;
            }

            let end =
                start + 1;

            while (
                end < CONFIG.cols &&
                board[r][end]?.type === type
            ) {
                end++;
            }

            const length =
                end - start;

            if (length >= 3) {

                const cells = [];

                for (
                    let c = start;
                    c < end;
                    c++
                ) {
                    cells.push({
                        r,
                        c
                    });
                }

                groups.push({
                    type,
                    cells,
                    orientation:
                        "horizontal"
                });
            }

            start = end;
        }
    }


    /* vertical */

    for (let c = 0; c < CONFIG.cols; c++) {

        let start = 0;

        while (start < CONFIG.rows) {

            const type =
                board[start][c]?.type;

            if (!type) {
                start++;
                continue;
            }

            let end =
                start + 1;

            while (
                end < CONFIG.rows &&
                board[end][c]?.type === type
            ) {
                end++;
            }

            const length =
                end - start;

            if (length >= 3) {

                const cells = [];

                for (
                    let r = start;
                    r < end;
                    r++
                ) {
                    cells.push({
                        r,
                        c
                    });
                }

                groups.push({
                    type,
                    cells,
                    orientation:
                        "vertical"
                });
            }

            start = end;
        }
    }


    return groups;
}


/* =========================================================
   SPECIAL CREATION
========================================================= */

function determineSpecial(matches, swapR, swapC) {

    if (!matches.length) {
        return null;
    }


    const horizontal =
        matches.filter(
            g =>
                g.orientation ===
                "horizontal"
        );


    const vertical =
        matches.filter(
            g =>
                g.orientation ===
                "vertical"
        );


    /* -------------------------------------------------------
       5 IN STRAIGHT LINE
    ------------------------------------------------------- */

    for (const group of matches) {

        if (group.cells.length >= 5) {

            return {
                special: "core",
                cell:
                    chooseSpecialCell(
                        group.cells,
                        swapR,
                        swapC
                    )
            };
        }
    }


    /* -------------------------------------------------------
       T / L INTERSECTION
    ------------------------------------------------------- */

    for (const h of horizontal) {

        for (const v of vertical) {

            const intersection =
                h.cells.find(
                    hc =>
                        v.cells.some(
                            vc =>
                                vc.r === hc.r &&
                                vc.c === hc.c
                        )
                );

            if (intersection) {

                return {
                    special: "pulse",
                    cell: intersection
                };
            }
        }
    }


    /* -------------------------------------------------------
       4 LINE
    ------------------------------------------------------- */

    for (const group of matches) {

        if (group.cells.length >= 4) {

            return {
                special: "line",
                orientation:
                    group.orientation,

                cell:
                    chooseSpecialCell(
                        group.cells,
                        swapR,
                        swapC
                    )
            };
        }
    }


    return null;
}


function chooseSpecialCell(
    cells,
    swapR,
    swapC
) {

    const swapped =
        cells.find(
            cell =>
                cell.r === swapR &&
                cell.c === swapC
        );

    if (swapped) {
        return swapped;
    }


    return cells[
        Math.floor(
            cells.length / 2
        )
    ];
}


/* =========================================================
   RESOLVE BOARD
========================================================= */

async function resolveBoard(
    matches,
    swapR,
    swapC,
    otherR,
    otherC
) {

    combo = 0;


    while (matches.length) {

        combo++;


        const specialData =
            determineSpecial(
                matches,
                swapR,
                swapC
            );


        const removeSet =
            new Set();


        matches.forEach(group => {

            group.cells.forEach(cell => {

                removeSet.add(
                    key(
                        cell.r,
                        cell.c
                    )
                );

            });

        });


        /* blockers around removed cells */

        const blockerHits =
            [];

        for (const item of removeSet) {

            const [r, c] =
                item.split(",")
                    .map(Number);

            collectBlockerHits(
                r,
                c,
                blockerHits
            );
        }


        /* special creation cell stays */

        if (specialData) {

            const specialCell =
                specialData.cell;

            removeSet.delete(
                key(
                    specialCell.r,
                    specialCell.c
                )
            );
        }


        /* -------------------------------------------------------
           ACTIVATE EXISTING SPECIALS — WITH CHAIN REACTIONS

           A special blast can hit another special. The old engine
           removed the second special without activating it. The
           queue below makes every touched special fire once.
        ------------------------------------------------------- */

        const specialQueue = [];
        const activatedSpecials = new Set();

        for (const item of removeSet) {

            const [r, c] =
                item.split(",").map(Number);

            const tile = board[r][c];

            if (tile?.special) {

                specialQueue.push({
                    r,
                    c,
                    special: tile.special,
                    direction:
                        tile.specialDirection || null
                });
            }
        }

        while (specialQueue.length) {

            const special =
                specialQueue.shift();

            const specialKey =
                key(special.r, special.c);

            if (activatedSpecials.has(specialKey)) {
                continue;
            }

            activatedSpecials.add(specialKey);

            incrementSpecialObjective(
                special.special
            );

            const blast =
                getSpecialBlast(
                    special.r,
                    special.c,
                    special.special,
                    special.direction
                );

            blast.cells.forEach(cell => {

                removeSet.add(
                    key(cell.r, cell.c)
                );

                const hitTile =
                    board[cell.r]?.[cell.c];

                if (
                    hitTile?.special &&
                    !activatedSpecials.has(
                        key(cell.r, cell.c)
                    )
                ) {

                    specialQueue.push({
                        r: cell.r,
                        c: cell.c,
                        special:
                            hitTile.special,
                        direction:
                            hitTile.specialDirection ||
                            null
                    });
                }
            });

            blockerHits.push(
                ...blast.blockerHits
            );

            drawBlast(
                special.r,
                special.c,
                special.special,
                special.direction
            );
        }

        /* score */

        const removedCount =
            removeSet.size;


        score +=
            removedCount *
            CONFIG.scorePerTile *
            combo;


        score +=
            specialQueue.length *
            250;


        if (specialData) {

            const specialType =
                specialData.special;

            score +=
                CONFIG.specialBonus[
                    specialType
                ] || 300;

            incrementSpecialObjective(
                specialType
            );

            const cell =
                specialData.cell;


            const sourceTile =
                board[cell.r][cell.c];

            board[cell.r][cell.c] =
                createTile(
                    sourceTile.type,
                    specialType,
                    specialData.orientation || null
                );

            showMessage(
                specialType === "line"
                    ? "⚡ POWER RAIL CREATED!"
                    : specialType === "pulse"
                        ? "💥 PULSE REACTOR CREATED!"
                        : "🔵 ENERGY CORE CREATED!",
                "good"
            );

        }


        incrementCollectionObjectives(
            removeSet
        );


        /* remove */

        for (const item of removeSet) {

            const [r, c] =
                item.split(",")
                    .map(Number);

            if (
                specialData &&
                r === specialData.cell.r &&
                c === specialData.cell.c
            ) {
                continue;
            }


            board[r][c] = null;
        }


        /* blockers */

        processBlockers(
            blockerHits
        );


        renderBoard();


        createParticles();


        playTone(
            430 +
            Math.min(
                combo * 55,
                350
            ),
            .07,
            "triangle"
        );


        await sleep(
            Math.min(
                130 + combo * 30,
                260
            )
        );


        collapseBoard();

        renderBoard();

        await sleep(180);


        refillBoard();

        renderBoard();

        await sleep(230);


        matches =
            findMatches();

    }


    updateObjectives();

    updateHUD();

    checkBoardMoves();

}


/* =========================================================
   SPECIAL BLAST
========================================================= */

function getSpecialBlast(
    r,
    c,
    special,
    direction = null
) {

    const cells = [];
    const blockerHits = [];

    const addCell = (rr, cc) => {

        if (
            rr < 0 ||
            rr >= CONFIG.rows ||
            cc < 0 ||
            cc >= CONFIG.cols
        ) {
            return;
        }

        cells.push({
            r: rr,
            c: cc
        });

        blockerHits.push({
            r: rr,
            c: cc
        });
    };


    if (special === "line") {

        if (direction === "vertical") {

            for (let y = 0; y < CONFIG.rows; y++) {
                addCell(y, c);
            }

        } else {

            for (let x = 0; x < CONFIG.cols; x++) {
                addCell(r, x);
            }
        }
    }


    else if (special === "pulse") {

        for (
            let y = r - 1;
            y <= r + 1;
            y++
        ) {

            for (
                let x = c - 1;
                x <= c + 1;
                x++
            ) {

                addCell(y, x);
            }
        }
    }


    else if (special === "core") {

        /*
           Energy Core is activated by a swap with a target part.
           activateCoreSwap() handles that mechanic.
        */
    }


    return {
        cells,
        blockerHits
    };
}


/* =========================================================
   SPECIAL COMBOS
========================================================= */

async function activateSpecialCombo(
    r1,
    c1,
    r2,
    c2
) {

    const s1 =
        board[r1][c1].special;

    const s2 =
        board[r2][c2].special;


    /* core + core */

    if (
        s1 === "core" &&
        s2 === "core"
    ) {

        score += 5000;

        for (let r = 0; r < CONFIG.rows; r++) {

            for (let c = 0; c < CONFIG.cols; c++) {

                if (board[r][c]) {

                    board[r][c] = null;
                }
            }
        }


        clearAllBlockers();

        renderBoard();

        createParticles(true);

        playTone(
            120,
            .4,
            "sawtooth"
        );

        await sleep(500);

        collapseBoard();

        refillBoard();

        renderBoard();

        return;
    }


    /* line + line */

    if (
        s1 === "line" &&
        s2 === "line"
    ) {

        score += 2000;

        const cells =
            new Set();

        for (let c = 0; c < CONFIG.cols; c++) {
            cells.add(
                key(r1, c)
            );
        }

        for (let r = 0; r < CONFIG.rows; r++) {
            cells.add(
                key(r, c1)
            );
        }

        for (const item of cells) {

            const [r,c] =
                item.split(",").map(Number);

            board[r][c] = null;
        }

        drawCrossBlast(r1,c1);

        renderBoard();

        await sleep(350);

        collapseBoard();

        refillBoard();

        renderBoard();

        return;
    }


    /* line + pulse */

    if (
        (
            s1 === "line" &&
            s2 === "pulse"
        ) ||
        (
            s1 === "pulse" &&
            s2 === "line"
        )
    ) {

        score += 2800;

        const rows =
            [
                r1 - 1,
                r1,
                r1 + 1
            ];

        const cols =
            [
                c1 - 1,
                c1,
                c1 + 1
            ];


        const removeSet =
            new Set();


        rows.forEach(r => {

            if (
                r >= 0 &&
                r < CONFIG.rows
            ) {

                for (
                    let c = 0;
                    c < CONFIG.cols;
                    c++
                ) {

                    removeSet.add(
                        key(r,c)
                    );
                }
            }
        });


        cols.forEach(c => {

            if (
                c >= 0 &&
                c < CONFIG.cols
            ) {

                for (
                    let r = 0;
                    r < CONFIG.rows;
                    r++
                ) {

                    removeSet.add(
                        key(r,c)
                    );
                }
            }
        });


        removeSet.forEach(item => {

            const [r,c] =
                item.split(",").map(Number);

            board[r][c] = null;
        });


        score += 1500;

        drawCrossBlast(r1,c1);

        renderBoard();

        await sleep(400);

        collapseBoard();

        refillBoard();

        renderBoard();

        return;
    }


    /* pulse + pulse */

    if (
        s1 === "pulse" &&
        s2 === "pulse"
    ) {

        score += 3200;

        const removeSet =
            new Set();


        for (
            let r = r1 - 2;
            r <= r1 + 2;
            r++
        ) {

            for (
                let c = c1 - 2;
                c <= c1 + 2;
                c++
            ) {

                if (
                    r >= 0 &&
                    r < CONFIG.rows &&
                    c >= 0 &&
                    c < CONFIG.cols
                ) {

                    removeSet.add(
                        key(r,c)
                    );
                }
            }
        }


        removeSet.forEach(item => {

            const [r,c] =
                item.split(",").map(Number);

            board[r][c] = null;
        });


        drawShockwave(r1,c1);

        renderBoard();

        await sleep(450);

        collapseBoard();

        refillBoard();

        renderBoard();

        return;
    }


    /* generic special */

    const a =
        getSpecialBlast(
            r1,
            c1,
            s1
        );

    const b =
        getSpecialBlast(
            r2,
            c2,
            s2
        );


    const remove =
        new Set();


    [
        ...a.cells,
        ...b.cells
    ].forEach(cell => {

        remove.add(
            key(cell.r,cell.c)
        );
    });


    remove.forEach(item => {

        const [r,c] =
            item.split(",").map(Number);

        board[r][c] = null;

    });


    renderBoard();

    await sleep(300);

    collapseBoard();

    refillBoard();

    renderBoard();
}


/* =========================================================
   CORE SWAP
========================================================= */

async function activateCoreSwap(
    r1,
    c1,
    r2,
    c2
) {

    let coreR;
    let coreC;

    let targetR;
    let targetC;


    if (
        board[r1][c1].special === "core"
    ) {

        coreR = r1;
        coreC = c1;

        targetR = r2;
        targetC = c2;

    } else {

        coreR = r2;
        coreC = c2;

        targetR = r1;
        targetC = c1;
    }


    const targetType =
        board[targetR][targetC].type;


    const removeSet =
        new Set();


    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            if (
                board[r][c] &&
                board[r][c].type === targetType
            ) {

                removeSet.add(
                    key(r,c)
                );
            }
        }
    }


    /*
       If target is a special,
       upgrade every matching target
       into its special effect.
    */

    const targetSpecial =
        board[targetR][targetC].special;


    if (targetSpecial) {

        for (let r = 0; r < CONFIG.rows; r++) {

            for (let c = 0; c < CONFIG.cols; c++) {

                if (
                    board[r][c] &&
                    board[r][c].type === targetType
                ) {

                    if (
                        board[r][c].special
                    ) {

                        const blast =
                            getSpecialBlast(
                                r,
                                c,
                                board[r][c].special
                            );

                        blast.cells.forEach(
                            cell =>
                                removeSet.add(
                                    key(
                                        cell.r,
                                        cell.c
                                    )
                                )
                        );
                    }
                }
            }
        }
    }


    removeSet.add(
        key(coreR,coreC)
    );


    removeSet.forEach(item => {

        const [r,c] =
            item.split(",").map(Number);

        board[r][c] = null;

    });


    score +=
        removeSet.size *
        100;

    score += 2500;


    incrementSpecialObjective(
        "core"
    );


    drawShockwave(
        targetR,
        targetC
    );

    createParticles(true);

    renderBoard();

    await sleep(500);

    collapseBoard();

    refillBoard();

    renderBoard();
}


/* =========================================================
   COLLAPSE
========================================================= */

function collapseBoard() {

    for (let c = 0; c < CONFIG.cols; c++) {

        const column = [];

        for (
            let r = CONFIG.rows - 1;
            r >= 0;
            r--
        ) {

            if (board[r][c]) {

                column.push(
                    board[r][c]
                );
            }
        }


        for (
            let r = CONFIG.rows - 1;
            r >= 0;
            r--
        ) {

            board[r][c] =
                column[
                    CONFIG.rows - 1 - r
                ] || null;
        }
    }
}


/* =========================================================
   REFILL
========================================================= */

function refillBoard() {

    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            if (!board[r][c]) {

                board[r][c] =
                    createTile(
                        randomType()
                    );
            }
        }
    }
}


/* =========================================================
   BLOCKER LOGIC
========================================================= */

function collectBlockerHits(
    r,
    c,
    list
) {

    const around = [
        [r,c],
        [r-1,c],
        [r+1,c],
        [r,c-1],
        [r,c+1]
    ];


    around.forEach(
        ([rr,cc]) => {

            if (
                rr >= 0 &&
                rr < CONFIG.rows &&
                cc >= 0 &&
                cc < CONFIG.cols
            ) {

                if (
                    board[rr][cc]?.blocker
                ) {

                    list.push({
                        r: rr,
                        c: cc
                    });
                }
            }
        }
    );
}


function processBlockers(hits) {

    const unique =
        new Set();


    hits.forEach(hit => {

        unique.add(
            key(
                hit.r,
                hit.c
            )
        );
    });


    let cleared = 0;


    unique.forEach(item => {

        const [r,c] =
            item.split(",").map(Number);

        const tile =
            board[r][c];


        if (!tile || !tile.blocker) {
            return;
        }


        if (
            tile.blocker === "glass"
        ) {

            tile.blocker =
                null;

            cleared++;

        }

        else if (
            tile.blocker === "lock"
        ) {

            tile.blocker =
                "glass";

        }

    });


    if (cleared) {

        const objective =
            objectives.find(
                o =>
                    o.kind ===
                    "blocker"
            );

        if (objective) {

            objective.current +=
                cleared;
        }


        score +=
            cleared *
            100;

    }
}


function clearAllBlockers() {

    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            board[r][c].blocker = null;

        }
    }


    const objective =
        objectives.find(
            o =>
                o.kind ===
                "blocker"
        );


    if (objective) {

        objective.current =
            objective.target;
    }
}


/* =========================================================
   OBJECTIVES
========================================================= */

function incrementCollectionObjectives(
    removeSet
) {

    removeSet.forEach(item => {

        const [r,c] =
            item.split(",").map(Number);

        const tile =
            board[r][c];


        if (!tile) {
            return;
        }


        objectives.forEach(
            objective => {

                if (
                    objective.kind ===
                    "collect" &&
                    objective.type ===
                    tile.type
                ) {

                    objective.current++;

                    objective.current =
                        Math.min(
                            objective.current,
                            objective.target
                        );
                }

            }
        );

    });
}


function incrementSpecialObjective(
    special
) {

    objectives.forEach(
        objective => {

            if (
                objective.kind ===
                "specialUse" &&
                objective.special ===
                special
            ) {

                objective.current++;

                objective.current =
                    Math.min(
                        objective.current,
                        objective.target
                    );
            }
        }
    );
}


function updateObjectives() {

    objectives.forEach(
        objective => {

            if (
                objective.kind ===
                "score"
            ) {

                objective.current =
                    score;

            }

        }
    );


    renderObjectives();
}


function renderObjectives() {

    objectiveArea.innerHTML = "";


    objectives.forEach(
        objective => {

            const card =
                document.createElement("div");

            const complete =
                objective.current >=
                objective.target;


            card.className =
                "objective-card" +
                (
                    complete
                        ? " completed"
                        : ""
                );


            let icon = "🎯";


            if (
                objective.kind ===
                "collect"
            ) {

                icon =
                    CONFIG
                        .typeData[
                            objective.type
                        ]
                        .icon;

            }

            else if (
                objective.kind ===
                "specialUse"
            ) {

                icon =
                    objective.special === "line"
                        ? "⚡"
                        : objective.special === "pulse"
                            ? "💥"
                            : "🔵";

            }

            else if (
                objective.kind ===
                "blocker"
            ) {

                icon = "🧰";

            }

            else if (
                objective.kind ===
                "score"
            ) {

                icon = "⭐";
            }


            card.innerHTML = `

                <div class="objective-icon">
                    ${icon}
                </div>

                <div class="objective-info">

                    <small>
                        ${objective.label}
                    </small>

                    <strong>
                        <span>
                            ${Math.min(
                                objective.current,
                                objective.target
                            )}
                        </span>
                        /
                        ${objective.target}
                    </strong>

                </div>

                <div class="objective-check">
                    ✓
                </div>

            `;


            objectiveArea.appendChild(card);

        }
    );


    const progress =
        getOverallProgress();


    progressFill.style.width =
        `${progress}%`;

    progressText.textContent =
        `${progress}%`;
}


function getOverallProgress() {

    if (!objectives.length) {
        return 0;
    }


    let total = 0;

    objectives.forEach(
        objective => {

            total +=
                Math.min(
                    objective.current /
                    objective.target,
                    1
                );

        }
    );


    return Math.round(
        total /
        objectives.length *
        100
    );
}


function objectivesComplete() {

    return objectives.every(
        objective =>
            objective.current >=
            objective.target
    );
}


/* =========================================================
   TURN FINISH
========================================================= */

async function finishTurn() {

    updateObjectives();

    updateHUD();

    await sleep(100);


    if (objectivesComplete()) {

        await completeLevel();

        return;
    }


    if (moves <= 0) {

        failLevel();

        return;
    }


    busy = false;
}


/* =========================================================
   LEVEL START
========================================================= */

function startLevel(level) {

    currentLevel =
        level;

    activeLevelConfig =
        generateLevel(level);

    objectives =
        activeLevelConfig
            .objectives
            .map(
                objective =>
                    ({
                        ...objective
                    })
            );


    score = 0;

    moves =
        activeLevelConfig.moves;

    levelBest =
        saveData.bestScores[level] || 0;

    selected = null;

    combo = 0;

    busy = false;

    gameStarted = true;


    createInitialBoard();

    updateGameText();

    renderObjectives();

    renderBoard();

    updateHUD();

    closeAllModals();

    showScreen(gameScreen);

    showMessage(
        activeLevelConfig.title,
        "good"
    );

    saveGame();
}


function updateGameText() {

    gameLevelNumber.textContent =
        currentLevel;

    levelTitle.textContent =
        activeLevelConfig.title;

    levelBestValue.textContent =
        formatNumber(levelBest);
}


/* =========================================================
   HUD
========================================================= */

function updateHUD() {

    scoreValue.textContent =
        formatNumber(score);

    movesValue.textContent =
        moves;

    levelBestValue.textContent =
        formatNumber(levelBest);


    updateObjectives();


    if (
        moves <= 5
    ) {

        movesValue.style.color =
            "#ff5364";

    } else {

        movesValue.style.color =
            "white";
    }
}


/* =========================================================
   LEVEL COMPLETE
========================================================= */

async function completeLevel() {

    busy = true;


    score +=
        moves * 100;


    const stars =
        calculateStars();


    saveData.completed[currentLevel] =
        true;

    saveData.stars[currentLevel] =
        Math.max(
            stars,
            saveData.stars[currentLevel] || 0
        );


    saveData.bestScores[currentLevel] =
        Math.max(
            score,
            saveData.bestScores[currentLevel] || 0
        );


    if (
        currentLevel >=
        saveData.currentLevel
    ) {

        saveData.currentLevel =
            currentLevel + 1;
    }


    saveData.totalStars =
        Object.values(
            saveData.stars
        ).reduce(
            (sum, value) =>
                sum + value,
            0
        );


    saveData.bestScore =
        Math.max(
            saveData.bestScore,
            score
        );


    saveGame();


    scoreValue.textContent =
        formatNumber(score);


    document.getElementById(
        "finalScore"
    ).textContent =
        formatNumber(score);


    document.getElementById(
        "starsDisplay"
    ).innerHTML =
        renderStars(stars);


    document.getElementById(
        "nextUnlockText"
    ).textContent =
        `LEVEL ${currentLevel + 1} UNLOCKED`;


    document.getElementById(
        "nextLevelButton"
    ).textContent =
        `LEVEL ${currentLevel + 1} →`;


    playVictorySound();


    await sleep(350);


    completeModal.classList.add(
        "open"
    );
}


function calculateStars() {

    if (score >= 5000) {
        return 3;
    }

    if (score >= 3000) {
        return 2;
    }

    return 1;
}


function renderStars(stars) {

    let html = "";

    for (let i = 1; i <= 3; i++) {

        html +=
            i <= stars
                ? `<span class="lit">★</span>`
                : `<span>☆</span>`;
    }

    return html;
}


/* =========================================================
   FAIL
========================================================= */

function failLevel() {

    busy = true;

    document.getElementById(
        "failedScore"
    ).textContent =
        formatNumber(score);

    failModal.classList.add(
        "open"
    );

    playTone(
        120,
        .25,
        "sawtooth"
    );
}


/* =========================================================
   MODAL BUTTONS
========================================================= */

document
    .getElementById("nextLevelButton")
    .addEventListener(
        "click",
        () => {

            completeModal.classList.remove(
                "open"
            );

            startLevel(
                currentLevel + 1
            );

        }
    );


document
    .getElementById("resultMapButton")
    .addEventListener(
        "click",
        () => {

            completeModal.classList.remove(
                "open"
            );

            renderMap();

            showScreen(mapScreen);

        }
    );


document
    .getElementById("retryButton")
    .addEventListener(
        "click",
        () => {

            failModal.classList.remove(
                "open"
            );

            startLevel(
                currentLevel
            );

        }
    );


document
    .getElementById("failMapButton")
    .addEventListener(
        "click",
        () => {

            failModal.classList.remove(
                "open"
            );

            renderMap();

            showScreen(mapScreen);

        }
    );


document
    .getElementById("closeInfoButton")
    .addEventListener(
        "click",
        () => {

            levelInfoModal.classList.remove(
                "open"
            );

        }
    );


document
    .getElementById("startLevelButton")
    .addEventListener(
        "click",
        () => {

            levelInfoModal.classList.remove(
                "open"
            );

            startLevel(
                currentLevel
            );

        }
    );


/* =========================================================
   MAP
========================================================= */

function renderMap() {

    mapCurrentLevel.textContent =
        saveData.currentLevel;

    totalStars.textContent =
        saveData.totalStars;

    bestScore.textContent =
        formatNumber(
            saveData.bestScore
        );


    renderCable();

    levelNodes.innerHTML = "";


    const totalLevels = 40;


    for (
        let level = 1;
        level <= totalLevels;
        level++
    ) {

        const position =
            getMapPosition(level);


        const node =
            document.createElement("button");


        const completed =
            !!saveData.completed[level];

        const unlocked =
            level <=
            saveData.currentLevel;


        const current =
            level ===
            saveData.currentLevel;


        node.className =
            "map-node" +
            (
                completed
                    ? " completed"
                    : ""
            ) +
            (
                current
                    ? " current"
                    : ""
            ) +
            (
                !unlocked
                    ? " locked"
                    : ""
            );


        node.style.left =
            `${position.x}%`;

        node.style.top =
            `${position.y}px`;


        node.innerHTML = `

            <small>LEVEL</small>

            <strong>
                ${level}
            </strong>

            ${
                completed
                    ? `<span class="node-check">✓</span>`
                    : !unlocked
                        ? `<span class="node-check">🔒</span>`
                        : ""
            }

        `;


        node.addEventListener(
            "click",
            () => {

                if (!unlocked) {

                    showToast(
                        `Complete Level ${level - 1} first.`
                    );

                    return;
                }


                if (level === saveData.currentLevel) {

                    startLevel(level);

                    return;
                }


                openLevelInfo(level);

            }
        );


        levelNodes.appendChild(node);
    }


    /*
       Scroll current level into view.
    */

    setTimeout(
        () => {

            const current =
                levelNodes.querySelector(
                    ".map-node.current"
                );

            if (current) {

                current.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
            }

        },
        100
    );
}


function getMapPosition(level) {

    const spacing = 123;

    const y =
        80 +
        (level - 1) *
        spacing;


    const x =
        50 +
        Math.sin(
            level * .95
        ) *
        27;


    return {
        x,
        y
    };
}


function renderCable() {

    const pathShadow =
        document.getElementById(
            "cableShadow"
        );

    const pathMain =
        document.getElementById(
            "cableMain"
        );

    const pathEnergy =
        document.getElementById(
            "cableEnergy"
        );


    const points = [];


    for (
        let level = 1;
        level <= 40;
        level++
    ) {

        const pos =
            getMapPosition(level);


        points.push({
            x:
                pos.x / 100 * 1000,

            y:
                pos.y
        });
    }


    let d =
        `M ${points[0].x} ${points[0].y}`;


    for (
        let i = 1;
        i < points.length;
        i++
    ) {

        const prev =
            points[i - 1];

        const current =
            points[i];


        const midY =
            (
                prev.y +
                current.y
            ) / 2;


        d +=
            ` C ${prev.x} ${midY},
                  ${current.x} ${midY},
                  ${current.x} ${current.y}`;
    }


    pathShadow.setAttribute(
        "d",
        d
    );

    pathMain.setAttribute(
        "d",
        d
    );

    pathEnergy.setAttribute(
        "d",
        d
    );
}


/* =========================================================
   LEVEL INFO
========================================================= */

function openLevelInfo(level) {

    const config =
        generateLevel(level);


    document.getElementById(
        "infoLevelTitle"
    ).textContent =
        `LEVEL ${level} — ${config.title}`;


    let html =
        "<strong>MISSION OBJECTIVES</strong><br><br>";


    config.objectives.forEach(
        objective => {

            html +=
                `• ${objective.label}: ` +
                `${objective.target}<br>`;
        }
    );


    html +=
        `<br><span style="color:#35f1ff">
            ${config.moves} moves available
        </span>`;


    document.getElementById(
        "infoMission"
    ).innerHTML =
        html;


    currentLevel =
        level;


    levelInfoModal.classList.add(
        "open"
    );
}


/* =========================================================
   MAP BACK
========================================================= */

document
    .getElementById("backMapButton")
    .addEventListener(
        "click",
        () => {

            if (busy) {
                return;
            }

            renderMap();

            showScreen(mapScreen);

        }
    );


/* =========================================================
   SOUND
========================================================= */

function ensureAudio() {

    if (!audioContext) {

        const AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;

        if (AudioCtx) {

            audioContext =
                new AudioCtx();

        }
    }


    if (
        audioContext &&
        audioContext.state ===
        "suspended"
    ) {

        audioContext.resume();
    }
}


function playTone(
    frequency,
    duration,
    wave = "sine"
) {

    if (!soundEnabled) {
        return;
    }


    ensureAudio();


    if (!audioContext) {
        return;
    }


    const oscillator =
        audioContext.createOscillator();

    const gain =
        audioContext.createGain();


    oscillator.type =
        wave;

    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        .0001,
        audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        .08,
        audioContext.currentTime + .01
    );

    gain.gain.exponentialRampToValueAtTime(
        .0001,
        audioContext.currentTime +
        duration
    );


    oscillator.connect(gain);

    gain.connect(
        audioContext.destination
    );


    oscillator.start();

    oscillator.stop(
        audioContext.currentTime +
        duration
    );
}


function playVictorySound() {

    if (!soundEnabled) {
        return;
    }


    ensureAudio();


    const notes = [
        523,
        659,
        784,
        1046
    ];


    notes.forEach(
        (note,index) => {

            setTimeout(
                () => {

                    playTone(
                        note,
                        .18,
                        "sine"
                    );

                },
                index * 110
            );

        }
    );
}


function toggleSound() {

    soundEnabled =
        !soundEnabled;


    const icon =
        soundEnabled
            ? "🔊"
            : "🔇";


    document.getElementById(
        "mapSoundButton"
    ).textContent =
        icon;


    document.getElementById(
        "gameSoundButton"
    ).textContent =
        icon;


    playTone(
        500,
        .06
    );
}


document
    .getElementById("mapSoundButton")
    .addEventListener(
        "click",
        toggleSound
    );


document
    .getElementById("gameSoundButton")
    .addEventListener(
        "click",
        toggleSound
    );


/* =========================================================
   BOOSTERS
========================================================= */

document
    .getElementById("shuffleBooster")
    .addEventListener(
        "click",
        () => {

            if (busy) {
                return;
            }

            shuffleBoard();

            showToast(
                "Board shuffled!"
            );

            playTone(
                320,
                .12,
                "triangle"
            );

        }
    );


document
    .getElementById("hammerBooster")
    .addEventListener(
        "click",
        () => {

            if (busy) {
                return;
            }

            useHammer();

        }
    );


document
    .getElementById("energyBooster")
    .addEventListener(
        "click",
        () => {

            if (busy) {
                return;
            }

            useEnergyBooster();

        }
    );


function shuffleBoard() {

    const types = [];

    board.forEach(
        row =>
            row.forEach(
                tile => {

                    if (tile) {
                        types.push(
                            tile.type
                        );
                    }

                }
            )
    );


    shuffleArray(types);


    let index = 0;


    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            board[r][c].type =
                types[index++];

            board[r][c].special =
                null;

            board[r][c].specialDirection =
                null;
        }
    }


    if (
        findMatches().length
    ) {

        shuffleBoard();

        return;
    }


    renderBoard();
}


function useHammer() {

    const r =
        Math.floor(
            Math.random() *
            CONFIG.rows
        );

    const c =
        Math.floor(
            Math.random() *
            CONFIG.cols
        );


    if (
        board[r][c]
    ) {

        board[r][c].blocker =
            null;

        board[r][c].special =
            null;

        score += 150;

        updateHUD();

        renderBoard();

        drawShockwave(r,c);

        showToast(
            "Repair hammer used!"
        );
    }
}


function useEnergyBooster() {

    const r =
        Math.floor(
            Math.random() *
            CONFIG.rows
        );

    const c =
        Math.floor(
            Math.random() *
            CONFIG.cols
        );


    board[r][c].special =
        "line";

    board[r][c].specialDirection =
        Math.random() > .5
            ? "horizontal"
            : "vertical";


    renderBoard();

    showToast(
        "⚡ Power Rail created!"
    );

    playTone(
        750,
        .15,
        "triangle"
    );
}


/* =========================================================
   NO MOVES CHECK
========================================================= */

function checkBoardMoves() {

    if (hasPossibleMove()) {
        return;
    }


    showToast(
        "No moves! Shuffling..."
    );


    setTimeout(
        () => {

            shuffleBoard();

        },
        350
    );
}


function hasPossibleMove() {

    for (let r = 0; r < CONFIG.rows; r++) {

        for (let c = 0; c < CONFIG.cols; c++) {

            if (c < CONFIG.cols - 1) {

                swapTiles(
                    r,
                    c,
                    r,
                    c + 1
                );


                const match =
                    findMatches().length >
                    0;


                swapTiles(
                    r,
                    c,
                    r,
                    c + 1
                );


                if (match) {
                    return true;
                }
            }


            if (r < CONFIG.rows - 1) {

                swapTiles(
                    r,
                    c,
                    r + 1,
                    c
                );


                const match =
                    findMatches().length >
                    0;


                swapTiles(
                    r,
                    c,
                    r + 1,
                    c
                );


                if (match) {
                    return true;
                }
            }
        }
    }


    return false;
}


/* =========================================================
   VISUAL EFFECTS
========================================================= */

function drawBlast(
    r,
    c,
    special,
    direction = null
) {

    const wrapper =
        document.querySelector(
            ".board-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const blast =
        document.createElement("div");


    const isVertical =
        special === "line" &&
        direction === "vertical";

    blast.className =
        "line-blast " +
        (
            isVertical
                ? "vertical"
                : "horizontal"
        );

    if (isVertical) {

        blast.style.left =
            `${
                (
                    c + .5
                ) /
                CONFIG.cols *
                100
            }%`;

    } else {

        blast.style.top =
            `${
                (
                    r + .5
                ) /
                CONFIG.rows *
                100
            }%`;
    }


    wrapper.appendChild(
        blast
    );


    setTimeout(
        () => blast.remove(),
        500
    );
}


function drawCrossBlast(r,c) {

    drawBlast(
        r,
        c,
        "line"
    );

    const wrapper =
        document.querySelector(
            ".board-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const blast =
        document.createElement("div");


    blast.className =
        "line-blast vertical";


    blast.style.left =
        `${
            (
                c + .5
            ) /
            CONFIG.cols *
            100
        }%`;


    wrapper.appendChild(
        blast
    );


    setTimeout(
        () => blast.remove(),
        500
    );
}


function drawShockwave(r,c) {

    const wrapper =
        document.querySelector(
            ".board-wrapper"
        );


    if (!wrapper) {
        return;
    }


    const wave =
        document.createElement("div");


    wave.className =
        "shockwave";


    wave.style.left =
        `${
            (
                c + .5
            ) /
            CONFIG.cols *
            100
        }%`;


    wave.style.top =
        `${
            (
                r + .5
            ) /
            CONFIG.rows *
            100
        }%`;


    wrapper.appendChild(
        wave
    );


    setTimeout(
        () => wave.remove(),
        650
    );
}


function createParticles(
    massive = false
) {

    const container =
        document.getElementById(
            "boardParticles"
        );


    if (!container) {
        return;
    }


    const amount =
        massive
            ? 45
            : 18;


    for (
        let i = 0;
        i < amount;
        i++
    ) {

        const particle =
            document.createElement("div");


        particle.className =
            "particle";


        particle.style.left =
            `${30 + Math.random() * 40}%`;

        particle.style.top =
            `${30 + Math.random() * 40}%`;


        particle.style.setProperty(
            "--px",
            `${-120 + Math.random() * 240}px`
        );

        particle.style.setProperty(
            "--py",
            `${-120 + Math.random() * 240}px`
        );


        container.appendChild(
            particle
        );


        setTimeout(
            () => particle.remove(),
            700
        );
    }
}


/* =========================================================
   UTILS
========================================================= */

function key(r,c) {
    return `${r},${c}`;
}


function sleep(ms) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


function formatNumber(number) {

    return Number(
        number || 0
    ).toLocaleString();
}


function shuffleArray(array) {

    for (
        let i = array.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];
    }


    return array;
}


function showMessage(
    text,
    type = ""
) {

    gameMessage.textContent =
        text;

    gameMessage.className =
        "game-message " +
        type;
}


function showToast(text) {

    toast.textContent =
        text;

    toast.classList.add(
        "show"
    );


    clearTimeout(
        showToast.timer
    );


    showToast.timer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            1600
        );
}


function closeAllModals() {

    completeModal.classList.remove(
        "open"
    );

    failModal.classList.remove(
        "open"
    );

    levelInfoModal.classList.remove(
        "open"
    );
}


/* =========================================================
   KEYBOARD
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key.toLowerCase() ===
            "m"
        ) {

            renderMap();

            showScreen(
                mapScreen
            );
        }


        if (
            event.key.toLowerCase() ===
            "r"
        ) {

            if (
                gameStarted &&
                !busy
            ) {

                startLevel(
                    currentLevel
                );
            }
        }
    }
);


/* =========================================================
   INIT
========================================================= */

initializeStartScreen();

renderMap();