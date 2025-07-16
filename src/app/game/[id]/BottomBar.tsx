import React from "react";
import { Role } from "@/game/types";
import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RoleCard from "./RoleCard";
import { clickSound } from "@/utils/sounds";

interface BottomBarProps {
  role: Role | undefined;
}

const BottomBar = ({ role }: BottomBarProps) => {
  return (
    <div className="p-3">
      <Dialog>
        <DialogTrigger asChild>
          {role && (
            <Button
              type="button"
              className="text-2xl p-7 mb-2 bg-card-foreground hover:bg-card-foreground/80"
              onClick={clickSound}
            >
              {role[0].toUpperCase() + role.slice(1)}
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="p-0 max-w-xs bg-transparent border-none shadow-none">
          <RoleCard role={role} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BottomBar;
