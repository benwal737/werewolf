import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Player } from "@/game/types";
import { Button } from "@/components/ui/button";
import { socket } from "@/lib/socketClient";
import { Card, CardContent } from "@/components/ui/card";
import { GiBootKick } from "react-icons/gi";

interface PlayerListProps {
  players: Player[];
  host: string | null;
  playerId: string | null;
  lobbyId: string;
}

const PlayerList = ({ players, host, playerId, lobbyId }: PlayerListProps) => {
  const isHost = host === playerId;

  const handleKick = (lobbyId: string, playerIdToKick: string) => {
    console.log("kicking");
    socket.emit("kickPlayer", lobbyId, playerIdToKick);
  };

  return (
    <Card className="w-full max-w-xl shadow-xl bg-card/50 backdrop-blur-xl">
      <CardContent className="p-6 flex flex-col items-center gap-4">
        <Table>
          <TableBody>
            {players.map((player) => (
              <TableRow
                key={player.id}
                className="flex justify-between min-h-12"
              >
                <TableCell className="text-stone-100">
                  {player.name}
                  {player.id === host && " (host)"}
                </TableCell>
                {isHost && player.id !== playerId && (
                  <TableCell>
                    <Button
                      variant="default"
                      onClick={() => handleKick(lobbyId, player.id)}
                      className="size-7"
                    >
                      <GiBootKick />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default PlayerList;
