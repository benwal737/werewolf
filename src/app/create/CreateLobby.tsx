"use client";

import { useState } from "react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Button from "@/components/ui/sound-button";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socketClient";
import { RoleCounts } from "@/game/types";
import { usePlayer } from "@/hooks/usePlayer";
import PageTheme from "@/components/PageTheme";
import { Loader2Icon } from "lucide-react";

const MIN_PLAYERS = 3;
const MAX_PLAYERS = 15;

const roleSchema = z.object({
  werewolf: z.number().min(1, "Need at least 1 werewolf"),
  villager: z.number().min(1, "Need at least 1 villager"),
  witch: z.number().min(0).max(1, "Only 1 witch allowed"),
  foreteller: z.number().min(0).max(1, "Only 1 foreteller allowed"),
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
    <div className="flex gap-2 mb-4">
      <div className="text-2xl font-semibold">Total Players: </div>
      <div
        className={`text-2xl font-semibold${
          totalPlayers < MIN_PLAYERS || totalPlayers > MAX_PLAYERS
            ? " text-destructive"
            : ""
        }`}
      >
        {totalPlayers}
      </div>
    </div>
  );
};

function makeid(length: number) {
  let result = "";
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const CreateLobby = () => {
  const { username, userId } = usePlayer();
  const [isLoading, setIsLoading] = useState(false);
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

  console.log("user info:", username, userId);

  const handleSubmit = (data: z.infer<typeof lobbySchema>) => {
    setIsLoading(true);
    const totalPlayers = calculateTotalPlayers(data.roles);
    const lobbyId = makeid(5);
    socket.emit(
      "createLobby",
      lobbyId,
      userId,
      username,
      data.roles,
      totalPlayers,
      () => {
        router.replace(`/lobby/${lobbyId}`);
      }
    );
  };

  return (
    <PageTheme forcedTheme="dark">
      <div className="flex flex-col min-h-screen w-full bg-cover bg-center items-center justify-center">
        <Card className="size-fit min-w-[25vw] p-10 bg-card/50 backdrop-blur-sm">
          <CardContent>
            <Form {...form}>
              <form
                className="flex flex-col items-center justify-center gap-4 w-full h-full"
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
                            ? "Werewolves:"
                            : role === "foreteller"
                            ? "Foretellers:"
                            : role === "villager"
                            ? "Villagers:"
                            : role === "witch"
                            ? "Witches:"
                            : role}{" "}
                        </FormLabel>
                        <FormControl>
                          <Input
                            disabled={isLoading}
                            type="number"
                            min={
                              role === "werewolf" || role === "villager" ? 1 : 0
                            }
                            max={
                              role === "witch" || role === "foreteller"
                                ? 1
                                : undefined
                            }
                            className="w-32 min-h-[30px] h-[50px]"
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
                  className="mt-5 w-32"
                  type="submit"
                  disabled={
                    isLoading ||
                    !userId ||
                    !username ||
                    calculateTotalPlayers(form.watch("roles")) < MIN_PLAYERS ||
                    calculateTotalPlayers(form.watch("roles")) > MAX_PLAYERS
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2Icon className="animate-spin" />
                      Creating
                    </>
                  ) : (
                    "Create Lobby"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
};

export default CreateLobby;
