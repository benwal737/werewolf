import { Card, CardContent } from "@/components/ui/card";
import { Role } from "@/game/types";
import { GiCauldron, GiVillage, GiWerewolf, GiThirdEye } from "react-icons/gi";
import { DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface RoleCardProps {
  role: Role | undefined;
}

const roleInfo: Record<
  Role,
  { label: string; description: string; icon: React.ReactElement }
> = {
  villager: {
    label: "Villager",
    description:
      "You are an ordinary townsperson. Try to figure out who the werewolves are.",
    icon: <GiVillage size={80} className="" />,
  },
  werewolf: {
    label: "Werewolf",
    description:
      "You are secretly a werewolf. Eliminate the villagers without getting caught.",
    icon: <GiWerewolf size={80} className="" />,
  },
  foreteller: {
    label: "Foreteller",
    description:
      "Each night, you may reveal someone's role. Use this power wisely to eliminate the werewolves.",
    icon: <GiThirdEye size={80} className="" />,
  },
  witch: {
    label: "Witch",
    description:
      "Each night, you may choose to save or kill a person of your choosing. You may do each of these once.",
    icon: <GiCauldron size={80} className="" />,
  },
};

const RoleCard = ({ role }: RoleCardProps) => {
  if (!role) throw new Error("no role");
  const { label, description, icon } = roleInfo[role];

  return (
    <Card className="w-full h-full">
      <CardContent className="flex flex-col items-center justify-center text-center h-full p-6 gap-4">
        {icon}
        <DialogTitle>{label}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </CardContent>
    </Card>
  );
};

export default RoleCard;
