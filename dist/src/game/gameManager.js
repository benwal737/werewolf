"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allVotesIn = exports.countVotes = exports.isWinner = exports.getRole = exports.assignRolesAndColors = exports.setDayDeaths = exports.resetNightDeaths = exports.setNightDeaths = exports.setPhase = exports.deleteGame = exports.getPlayers = exports.removePlayer = exports.addPlayer = exports.getSafeGameState = exports.getGame = exports.createGame = exports.startCountdown = exports.findExistingGame = void 0;
const gameStates = new Map();
const findExistingGame = (playerId) => {
    const paths = [];
    for (const [lobbyId, game] of gameStates) {
        if (game.players[playerId]) {
            if (game.phase === "lobby") {
                paths.push(`lobby/${lobbyId}`);
            }
            else {
                paths.push(`game/${lobbyId}`);
            }
        }
    }
    return paths;
};
exports.findExistingGame = findExistingGame;
const earlyProceed = (io, lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return { proceed: false, newTimeLeft: null };
    const phase = game.phase;
    const step = game.substep;
    if (step === "witch") {
        if (game.witchKill || game.witchSave) {
            return { proceed: true, newTimeLeft: 6 };
        }
        else if (game.witchSkipped) {
            return { proceed: true, newTimeLeft: 1 };
        }
    }
    if (step === "foreteller" && game.foretellerRevealed) {
        return { proceed: true, newTimeLeft: 11 };
    }
    let expectedVoters = [];
    if (phase === "night" && step === "werewolves") {
        expectedVoters = (0, exports.getPlayers)(lobbyId)
            .filter((p) => p.alive && p.role === "werewolf")
            .map((p) => p.id);
    }
    else if (phase === "day" && step === "vote") {
        expectedVoters = (0, exports.getPlayers)(lobbyId)
            .filter((p) => p.alive)
            .map((p) => p.id);
    }
    else {
        return { proceed: false, newTimeLeft: null };
    }
    const allVoted = expectedVoters.every((id) => !!game.players[id]?.vote);
    if (!allVoted)
        return { proceed: false, newTimeLeft: null };
    return { proceed: true, newTimeLeft: 1 };
};
const startCountdown = (io, lobbyId, seconds, onComplete) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game || game.interval)
        return;
    let timeLeft = seconds;
    game.countdown = timeLeft;
    io.to(lobbyId).emit("countdownTick", timeLeft);
    let earlyProceedTriggered = false;
    const interval = setInterval(() => {
        if (!earlyProceedTriggered) {
            const { proceed, newTimeLeft } = earlyProceed(io, lobbyId);
            if (proceed && newTimeLeft !== null) {
                timeLeft = newTimeLeft;
                earlyProceedTriggered = true;
            }
        }
        timeLeft--;
        game.countdown = timeLeft;
        io.to(lobbyId).emit("countdownTick", timeLeft);
        if (timeLeft < 1) {
            clearInterval(interval);
            game.interval = undefined;
            game.countdown = undefined;
            onComplete();
        }
    }, 1000);
    game.interval = interval;
};
exports.startCountdown = startCountdown;
const createGame = (lobbyId, hostId, roleCounts, totalPlayers) => {
    const newGame = {
        host: hostId,
        players: {},
        phase: "lobby",
        substep: "none",
        roleCounts,
        totalPlayers,
        dayNum: 1,
        gameChat: [],
        werewolfChat: [],
        deadChat: [],
    };
    gameStates.set(lobbyId, newGame);
    return newGame;
};
exports.createGame = createGame;
const getGame = (lobbyId) => {
    return gameStates.get(lobbyId);
};
exports.getGame = getGame;
const getSafeGameState = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        throw new Error("Game not found");
    return {
        ...game,
        interval: undefined,
    };
};
exports.getSafeGameState = getSafeGameState;
const addPlayer = (lobbyId, player) => {
    const game = (0, exports.getGame)(lobbyId);
    if (game)
        game.players[player.id] = player;
};
exports.addPlayer = addPlayer;
const removePlayer = (lobbyId, playerId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    delete game.players[playerId];
    if (game.host === playerId) {
        const remainingPlayerIds = Object.keys(game.players);
        game.host = remainingPlayerIds[0] || null;
    }
    if (Object.keys(game.players).length === 0) {
        (0, exports.deleteGame)(lobbyId);
    }
};
exports.removePlayer = removePlayer;
const getPlayers = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    return game ? Object.values(game.players) : [];
};
exports.getPlayers = getPlayers;
const deleteGame = (lobbyId) => {
    gameStates.delete(lobbyId);
};
exports.deleteGame = deleteGame;
const setPhase = (lobbyId, phase, nightStep) => {
    const game = (0, exports.getGame)(lobbyId);
    if (game) {
        game.phase = phase;
        game.substep = nightStep;
    }
};
exports.setPhase = setPhase;
const setNightDeaths = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    const deaths = [];
    console.log("setting night deaths:", game.werewolfKill?.name, game.witchKill?.name);
    if (game.werewolfKill && game.werewolfKill !== game.witchSave) {
        console.log("adding werewolf kill:", game.werewolfKill.name);
        game.players[game.werewolfKill.id].alive = false;
        deaths.push(game.werewolfKill);
    }
    if (game.witchKill && game.witchKill !== game.werewolfKill) {
        console.log("adding witch kill:", game.witchKill.name);
        game.players[game.witchKill.id].alive = false;
        deaths.push(game.witchKill);
    }
    game.nightDeaths = deaths;
};
exports.setNightDeaths = setNightDeaths;
const resetNightDeaths = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    game.nightDeaths = [];
};
exports.resetNightDeaths = resetNightDeaths;
const setDayDeaths = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    if (game.villageKill) {
        game.players[game.villageKill.id].alive = false;
    }
};
exports.setDayDeaths = setDayDeaths;
const colorPool = [
    "bg-red-500",
    "bg-green-500",
    "bg-amber-400",
    "bg-blue-500",
    "bg-orange-500",
    "bg-purple-500",
    "bg-cyan-400",
    "bg-pink-400",
    "bg-lime-400",
    "bg-slate-700",
    "bg-teal-600",
    "bg-violet-300",
    "bg-indigo-500",
    "bg-fuchsia-500",
    "bg-sky-500",
];
const assignRolesAndColors = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    const rolesToAssign = [];
    for (const role in game.roleCounts) {
        const count = game.roleCounts[role];
        for (let i = 0; i < count; i++) {
            rolesToAssign.push(role);
        }
    }
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rolesToAssign[i], rolesToAssign[j]] = [rolesToAssign[j], rolesToAssign[i]];
    }
    const playerIds = Object.keys(game.players);
    playerIds.forEach((playerId, index) => {
        const role = rolesToAssign[index];
        game.players[playerId].role = role;
        game.players[playerId].color = colorPool[index];
    });
};
exports.assignRolesAndColors = assignRolesAndColors;
const getRole = (lobbyId, playerId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return;
    return game.players[playerId]?.role;
};
exports.getRole = getRole;
const isWinner = (lobbyId, io) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return false;
    const villagersAlive = (0, exports.getPlayers)(lobbyId).filter((player) => player.alive && player.role !== "werewolf");
    const werewolvesAlive = (0, exports.getPlayers)(lobbyId).filter((player) => player.alive && player.role === "werewolf");
    if (villagersAlive.length === 0 && werewolvesAlive.length === 0) {
        game.winner = "draw";
    }
    else if (villagersAlive.length === 0) {
        game.winner = "werewolves";
    }
    else if (werewolvesAlive.length === 0) {
        game.winner = "villagers";
    }
    if (game.winner) {
        for (const player of (0, exports.getPlayers)(lobbyId)) {
            player.vote = undefined;
            player.numVotes = 0;
        }
        (0, exports.setPhase)(lobbyId, "end", "none");
        const updated = (0, exports.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        return true;
    }
    else {
        return false;
    }
};
exports.isWinner = isWinner;
const countVotes = (lobbyId) => {
    let skipVotes = 0;
    for (const player of (0, exports.getPlayers)(lobbyId)) {
        if (!player.alive)
            continue;
        if (player.vote === "skip") {
            skipVotes++;
        }
    }
    let candidates = [];
    let maxVotes = skipVotes;
    for (const player of (0, exports.getPlayers)(lobbyId)) {
        if (!player.alive || !player.numVotes)
            continue;
        if (player.numVotes > maxVotes) {
            maxVotes = player.numVotes;
            candidates = [player];
        }
        else if (player.numVotes === maxVotes &&
            maxVotes > 0 &&
            maxVotes !== skipVotes) {
            candidates.push(player);
        }
    }
    return candidates;
};
exports.countVotes = countVotes;
const allVotesIn = (lobbyId) => {
    const game = (0, exports.getGame)(lobbyId);
    if (!game)
        return false;
    const { substep } = game;
    return (0, exports.getPlayers)(lobbyId).every((player) => {
        if (!player.alive)
            return true;
        if (substep === "werewolves" && player.role !== "werewolf")
            return true;
        if (substep === "vote" || substep === "werewolves")
            return player.vote !== undefined;
        return true;
    });
};
exports.allVotesIn = allVotesIn;
