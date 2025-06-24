import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Player } from "@/game/types";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socketClient";

interface PlayerListProps {
  players: Player[];
  host: string | null;
  playerId: string;
  lobbyId: string;
}

const PlayerList = ({ players, host, playerId, lobbyId }: PlayerListProps) => {
  const isHost = host === playerId;

  const handleKick = (lobbyId: string, playerIdToKick: string) => {
    console.log("kicking");
    socket.emit("kickPlayer", lobbyId, playerIdToKick);
  };

  return (
    <Table>
      <TableBody>
        {players.map((player) => (
          <TableRow key={player.id}>
            <TableCell>
              {player.name}
              {player.id === host && " (host)"}
            </TableCell>
            {isHost && player.id !== playerId && (
              <TableCell>
                <Button
                  variant="destructive"
                  onClick={() => handleKick(lobbyId, player.id)}
                >
                  Kick
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PlayerList;
