"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayer = void 0;
exports.default = Lobby;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const socketClient_1 = require("@/lib/socketClient");
const uuid_1 = require("uuid");
const PlayerList_1 = __importDefault(require("./PlayerList"));
const button_1 = require("@/components/ui/button");
const card_1 = require("@/components/ui/card");
const typography_1 = require("@/components/ui/typography");
const getPlayer = () => {
    let playerId = localStorage.getItem("playerId");
    let playerName = localStorage.getItem("playerName");
    if (!playerId) {
        playerId = (0, uuid_1.v4)();
        localStorage.setItem("playerId", playerId);
    }
    return { playerId, playerName };
};
exports.getPlayer = getPlayer;
function Lobby() {
    const lobbyId = (0, navigation_1.useParams)().id;
    const [players, setPlayers] = (0, react_1.useState)([]);
    const [host, setHost] = (0, react_1.useState)(null);
    const { playerName, playerId } = (0, exports.getPlayer)();
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        console.log("emitting joinLobby event with", lobbyId, playerId, playerName);
        socketClient_1.socket.emit("joinLobby", lobbyId, playerId, playerName);
        const handleJoinError = (msg) => {
            alert(msg);
            router.push("/");
        };
        const handlePlayerJoined = (data) => {
            setPlayers(Object.values(data.players));
            setHost(data.host);
        };
        const handleKicked = () => {
            alert("You have been kicked from the lobby");
            router.push("/");
        };
        socketClient_1.socket.on("joinError", handleJoinError);
        socketClient_1.socket.on("playerJoined", handlePlayerJoined);
        socketClient_1.socket.on("kicked", handleKicked);
        return () => {
            socketClient_1.socket.off("playerJoined", handlePlayerJoined);
            socketClient_1.socket.off("joinError", handleJoinError);
            socketClient_1.socket.off("kicked", handleKicked);
        };
    }, [lobbyId, playerId, playerName]);
    return (<div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 gap-6">
      <card_1.Card className="w-full max-w-xl shadow-xl bg-slate-600">
        <card_1.CardContent className="p-6 flex flex-col items-center gap-4">
          <typography_1.TypographyH1 className="text-center">Game Lobby</typography_1.TypographyH1>
          <div className="">
            Lobby ID: <span className="font-mono">{lobbyId}</span>
          </div>

          <div className="w-full flex justify-end">
            <button_1.Button variant="destructive" onClick={() => {
            socketClient_1.socket.emit("leaveLobby", lobbyId, playerId);
            localStorage.removeItem("playerName");
            router.push("/");
        }}>
              Leave Lobby
            </button_1.Button>
          </div>

          <div className="w-full">
            <typography_1.TypographyH2 className="mb-2">Players</typography_1.TypographyH2>
            <PlayerList_1.default players={players} host={host} playerId={playerId} lobbyId={lobbyId}/>
          </div>
        </card_1.CardContent>
      </card_1.Card>
    </div>);
}
