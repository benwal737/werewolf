import React from "react";
import { Role } from "@/game/types";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  // DialogHeader,
  // DialogTitle,
  // DialogDescription,
  // DialogFooter,
  // DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RoleCard from "./RoleCard";

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
              className="text-2xl p-7 cursor-pointer hover:bg-slate-800"
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
