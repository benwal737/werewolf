import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { useEffect } from "react";

type Player = {
  id: string;
  name: string;
  role: string;
  alive: boolean;
};

interface PlayerListProps {
  players: Player[];
}

const PlayerList = ({ players }: PlayerListProps) => {
  useEffect(() => {
    console.log("players:", players);
  }, []);
  return (
    <Table>
      <TableBody>
        {players.map((player) => (
          <TableRow key={Math.random()}>
            <TableCell>{player.name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default PlayerList;
