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
import { socket } from "@/lib/socketClient";
import { Role, RoleCounts } from "@/game/types";
import { getPlayer } from "@/utils/getPlayer";

const MIN_PLAYERS = 2;
const MAX_PLAYERS = 20;

const roleSchema = z.object({
  werewolf: z.number().min(1, "Need at least 1 werewolf"),
  villager: z.number().min(1, "Need at least 1 villager"),
  witch: z.number().min(0),
  foreteller: z.number().min(0),
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

const roleKeys = ["werewolf", "villager", "witch", "foreteller"] as const;

const calculateTotalPlayers = (roles: Partial<RoleCounts>): number => {
  return roleKeys.reduce((total, role) => {
    const count = roles[role];
    return total + (Number.isNaN(count) ? 0 : count ?? 0);
  }, 0);
};

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

const CreateLobby = () => {
  const router = useRouter();
  const form = useForm<z.infer<typeof lobbySchema>>({
    resolver: zodResolver(lobbySchema),
    defaultValues: {
      roles: {
        werewolf: 3,
        villager: 3,
        witch: 1,
        foreteller: 1,
      },
    },
  });

  const handleSubmit = (data: z.infer<typeof lobbySchema>) => {
    const totalPlayers = calculateTotalPlayers(data.roles);
    const lobbyId = makeid(5);
    const { playerName, playerId } = getPlayer();
    socket.emit(
      "createLobby",
      lobbyId,
      playerId,
      playerName,
      data.roles,
      totalPlayers
    );
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
                  {role === "werewolf"
                    ? "Werewolves"
                    : role === "foreteller"
                    ? "Foretellers"
                    : role === "villager"
                    ? "Villagers"
                    : role === "witch"
                    ? "Witches"
                    : role}{" "}
                  :
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={role === "werewolf" || role === "villager" ? 1 : 0}
                    className="w-full max-w-xs min-h-[30px] h-[50px]"
                    value={Number.isNaN(field.value) ? "" : field.value}
                    onChange={(e) => {
                      const value = e.target.valueAsNumber;
                      field.onChange(value);
                    }}
                    onBlur={(e) => {
                      const value = e.target.valueAsNumber;
                      if (Number.isNaN(value)) {
                        field.onChange(0);
                      }
                    }}
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
