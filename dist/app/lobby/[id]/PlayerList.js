"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const table_1 = require("@/components/ui/table");
const button_1 = require("@/components/ui/button");
const socketClient_1 = require("@/lib/socketClient");
const PlayerList = ({ players, host, playerId, lobbyId }) => {
    const isHost = host === playerId;
    const handleKick = (lobbyId, playerIdToKick) => {
        console.log("kicking");
        socketClient_1.socket.emit("kickPlayer", lobbyId, playerIdToKick);
    };
    return (<table_1.Table>
      <table_1.TableBody>
        {players.map((player) => (<table_1.TableRow key={player.id}>
            <table_1.TableCell>
              {player.name}
              {player.id === host && " (host)"}
            </table_1.TableCell>
            {isHost && player.id !== playerId && (<table_1.TableCell>
                <button_1.Button variant="destructive" onClick={() => handleKick(lobbyId, player.id)}>
                  Kick
                </button_1.Button>
              </table_1.TableCell>)}
          </table_1.TableRow>))}
      </table_1.TableBody>
    </table_1.Table>);
};
exports.default = PlayerList;
