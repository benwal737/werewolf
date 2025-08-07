"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = registerGameHandlers;
const gameManager_1 = require("./gameManager");
const FORETELLER_TIME = 30;
const WEREWOLVES_TIME = 30;
const WITCH_TIME = 30;
const DEATHS_TIME = 10;
const VOTE_TIME = 45;
const RESULTS_TIME = 10;
function registerGameHandlers(io, socket) {
    const resolveForetellerPhase = (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        game.foretellerRevealed = undefined;
        (0, gameManager_1.setPhase)(lobbyId, "night", "werewolves");
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        (0, gameManager_1.startCountdown)(io, lobbyId, WEREWOLVES_TIME, () => {
            nextPhase(lobbyId, "werewolves");
        });
    };
    const resolveWerewolvesPhase = (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const candidates = (0, gameManager_1.countVotes)(lobbyId);
        game.werewolfKill = candidates.length === 1 ? candidates[0] : undefined;
        // reset votes and check if witch alive
        let witchAlive = false;
        for (const player of (0, gameManager_1.getPlayers)(lobbyId)) {
            if (player.alive && player.role === "witch")
                witchAlive = true;
            player.vote = undefined;
            player.numVotes = 0;
        }
        const step = witchAlive ? "witch" : "deaths";
        const time = witchAlive ? WITCH_TIME : DEATHS_TIME;
        const phase = witchAlive ? "night" : "day";
        if (!witchAlive) {
            (0, gameManager_1.setNightDeaths)(lobbyId);
            const winner = (0, gameManager_1.isWinner)(lobbyId, io);
            if (winner)
                return;
        }
        (0, gameManager_1.setPhase)(lobbyId, phase, step);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        (0, gameManager_1.startCountdown)(io, lobbyId, time, () => {
            nextPhase(lobbyId, step);
        });
    };
    const resolveWitchPhase = (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        game.witchKilling = false;
        const step = "deaths";
        const phase = "day";
        (0, gameManager_1.setNightDeaths)(lobbyId);
        game.witchSave = undefined;
        game.witchKill = undefined;
        game.witchSkipped = false;
        const winner = (0, gameManager_1.isWinner)(lobbyId, io);
        if (winner)
            return;
        (0, gameManager_1.setPhase)(lobbyId, phase, step);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        (0, gameManager_1.startCountdown)(io, lobbyId, DEATHS_TIME, () => {
            nextPhase(lobbyId, step);
        });
    };
    const resolveDeathsPhase = (lobbyId) => {
        (0, gameManager_1.resetNightDeaths)(lobbyId);
        const step = "vote";
        const phase = "day";
        (0, gameManager_1.setPhase)(lobbyId, phase, step);
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        (0, gameManager_1.startCountdown)(io, lobbyId, VOTE_TIME, () => {
            nextPhase(lobbyId, step);
        });
    };
    const resolveVotePhase = (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const step = "results";
        const phase = "day";
        const candidates = (0, gameManager_1.countVotes)(lobbyId);
        game.villageKill = candidates.length === 1 ? candidates[0] : undefined;
        (0, gameManager_1.setDayDeaths)(lobbyId);
        const winner = (0, gameManager_1.isWinner)(lobbyId, io);
        if (!winner) {
            (0, gameManager_1.setPhase)(lobbyId, phase, step);
            const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
            io.to(lobbyId).emit("gameUpdated", updated);
            (0, gameManager_1.startCountdown)(io, lobbyId, RESULTS_TIME, () => {
                nextPhase(lobbyId, step);
            });
        }
    };
    const resolveResultsPhase = (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        game.villageKill = undefined;
        for (const player of (0, gameManager_1.getPlayers)(lobbyId)) {
            player.vote = undefined;
            player.numVotes = 0;
        }
        let step = "werewolves";
        let phase = "night";
        let time = WEREWOLVES_TIME;
        if (game.roleCounts.foreteller > 0 &&
            (0, gameManager_1.getPlayers)(lobbyId).some((player) => player.role === "foreteller" && player.alive)) {
            step = "foreteller";
            phase = "night";
            time = FORETELLER_TIME;
        }
        (0, gameManager_1.setPhase)(lobbyId, phase, step);
        game.dayNum++;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        (0, gameManager_1.startCountdown)(io, lobbyId, time, () => {
            nextPhase(lobbyId, step);
        });
    };
    const phaseResolvers = {
        foreteller: resolveForetellerPhase,
        werewolves: resolveWerewolvesPhase,
        witch: resolveWitchPhase,
        deaths: resolveDeathsPhase,
        vote: resolveVotePhase,
        results: resolveResultsPhase,
        none: () => { },
    };
    const nextPhase = (lobbyId, nightStep) => {
        const resolver = phaseResolvers[nightStep];
        if (resolver)
            resolver(lobbyId);
    };
    socket.on("joinGame", (lobbyId, playerId, cb) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        const playerExists = (0, gameManager_1.getPlayers)(lobbyId).some((player) => player.id === playerId);
        if (!game || game.phase === "lobby" || !playerExists) {
            return socket.emit("joinError");
        }
        socket.join(lobbyId);
        if (game.host === playerId && game.phase === "start") {
            if (game.roleCounts.foreteller > 0) {
                (0, gameManager_1.setPhase)(lobbyId, "night", "foreteller");
                (0, gameManager_1.startCountdown)(io, lobbyId, FORETELLER_TIME, () => {
                    nextPhase(lobbyId, "foreteller");
                });
            }
            else {
                (0, gameManager_1.setPhase)(lobbyId, "night", "werewolves");
                (0, gameManager_1.startCountdown)(io, lobbyId, WEREWOLVES_TIME, () => {
                    nextPhase(lobbyId, "werewolves");
                });
            }
        }
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
        cb(updated);
    });
    socket.on("startGame", (lobbyId) => {
        (0, gameManager_1.assignRolesAndColors)(lobbyId);
        (0, gameManager_1.setPhase)(lobbyId, "start", "none");
    });
    socket.on("foretellerSelected", (lobbyId, target) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const player = game.players[target];
        game.foretellerRevealed = player;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("requestCountdown", (lobbyId, cb) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        cb(game?.countdown ?? null);
    });
    socket.on("playerVoted", (lobbyId, playerId, targetId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        if (targetId === "skip") {
            game.players[playerId].vote = "skip";
            const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
            io.to(lobbyId).emit("gameUpdated", updated);
            return;
        }
        const prev = game.players[playerId].vote;
        if (prev) {
            if (!game.players[prev].numVotes)
                return;
            game.players[prev].numVotes--;
            if (prev === targetId) {
                game.players[playerId].vote = undefined;
            }
        }
        if (!prev || prev !== targetId) {
            game.players[playerId].vote = targetId;
            const targetVotes = game.players[targetId].numVotes;
            game.players[targetId].numVotes = targetVotes ? targetVotes + 1 : 1;
        }
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("witchSave", (lobbyId, playerId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const player = game.players[playerId];
        game.witchSave = player;
        game.witchSaved = true;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("witchKilling", (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        game.witchKilling = true;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("witchKilled", (lobbyId, targetId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        const player = game.players[targetId];
        game.witchKill = player;
        game.witchKilled = true;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.on("witchSkip", (lobbyId) => {
        const game = (0, gameManager_1.getGame)(lobbyId);
        if (!game)
            return;
        game.witchSkipped = true;
        const updated = (0, gameManager_1.getSafeGameState)(lobbyId);
        io.to(lobbyId).emit("gameUpdated", updated);
    });
    socket.onAny((event, ...args) => {
        console.log("[Server socket event]:", event, args);
    });
}
