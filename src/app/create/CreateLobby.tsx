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

type RoleCounts = {
  werewolves: number;
  villagers: number;
  witches: number;
  foretellers: number;
};

const MIN_PLAYERS = 4;

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
      const totalPlayers = calculateTotalPlayers(data.roles);
      return totalPlayers >= MIN_PLAYERS;
    },
    {
      message: `Minimum ${MIN_PLAYERS} players required`,
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
            totalPlayers < MIN_PLAYERS ? "text-destructive" : "text"
          }`}
        >
          {totalPlayers}
        </span>
      </div>
    </div>
  );
};

const CreateLobby = () => {
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
    console.log({
      ...data,
      totalPlayers: calculateTotalPlayers(data.roles),
    });
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
