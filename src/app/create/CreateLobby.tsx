"use client";

import React from "react";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormLabel,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { socket } from "../../socket";

type RoleCounts = {
  werewolves: number;
  villagers: number;
  witches: number;
  foretellers: number;
};

const MIN_PLAYERS = 4;
const MAX_PLAYERS = 20;

const roleSchema = z.object({
  werewolves: z.number().min(1, "Need at least 1 werewolf"),
  villagers: z.number().min(1, "Need at least 1 villager"),
  witches: z.number().min(0),
  foretellers: z.number().min(0),
});

const lobbySchema = z
  .object({
    roles: roleSchema,
  })
  .refine(
    (data) => {
      const total = calculateTotalPlayers(data.roles);
      return total >= MIN_PLAYERS && total <= MAX_PLAYERS;
    },
    {
      message: `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`,
      path: ["roles"],
    }
  );

const calculateTotalPlayers = (roles: RoleCounts): number => {
  return roles.werewolves + roles.villagers + roles.witches + roles.foretellers;
};

const roleKeys = ["werewolves", "villagers", "witches", "foretellers"] as const;

const PlayerCountDisplay = ({
  form,
}: {
  form: ReturnType<typeof useForm<{ roles: RoleCounts }>>;
}) => {
  const roles = form.watch("roles");
  const totalPlayers = calculateTotalPlayers(roles);

  return (
    <div className="mb-4 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Total Players:</span>
        <span
          className={`text-lg ${
            totalPlayers < MIN_PLAYERS || totalPlayers > MAX_PLAYERS
              ? "text-destructive"
              : "text"
          }`}
        >
          {totalPlayers}
        </span>
      </div>
    </div>
  );
};

function makeid(length: number) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export const getPlayer = () => {
  let playerId = localStorage.getItem("playerId");
  let playerName = localStorage.getItem("playerName");
  if (!playerId) {
    playerId = uuidv4();
    localStorage.setItem("playerId", playerId);
  }

  return { playerId, playerName };
};

const CreateLobby = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof lobbySchema>>({
    resolver: zodResolver(lobbySchema),
    defaultValues: {
      roles: {
        werewolves: 3,
        villagers: 3,
        witches: 1,
        foretellers: 1,
      },
    },
  });

  const handleSubmit = (data: z.infer<typeof lobbySchema>) => {
    const lobbyId = makeid(5);
    const { playerName, playerId } = getPlayer();
    socket.emit("createLobby", lobbyId, playerId, playerName);
    router.push(`/lobby/${lobbyId}`);
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col items-center justify-center min-h-screen gap-4"
        onSubmit={form.handleSubmit(handleSubmit)}
      >
        <PlayerCountDisplay form={form} />

        {roleKeys.map((role) => (
          <FormField
            key={role}
            control={form.control}
            name={`roles.${role}`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={role === "werewolves" || role === "villagers" ? 1 : 0}
                    className="w-full max-w-xs min-h-[30px] h-[50px]"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button
          type="submit"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Creating..." : "Create Lobby"}
        </Button>
      </form>
    </Form>
  );
};

export default CreateLobby;
