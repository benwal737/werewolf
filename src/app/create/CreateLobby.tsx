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
import { Checkbox } from "@/components/ui/checkbox";

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
        <Card className="size-fit min-w-[20vw] p-10 bg-card/50 backdrop-blur-sm">
          <CardContent>
            <Form {...form}>
              <form
                className="flex flex-col items-start justify-center gap-5 w-full h-full"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <PlayerCountDisplay form={form} />

                <FormField
                  control={form.control}
                  name={`roles.werewolf`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Werewolves:</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type="number"
                          min={1}
                          max={undefined}
                          className="w-full h-10"
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
                <FormField
                  control={form.control}
                  name={`roles.villager`}
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>Villagers:</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          type="number"
                          min={1}
                          max={undefined}
                          className="w-full h-10"
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
                <div className="flex flex-col gap-3 justify-start w-1/2">
                  <FormField
                    control={form.control}
                    name={`roles.witch`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value.toString() === "1"}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange(1)
                                : field.onChange(0);
                            }}
                          />
                        </FormControl>
                        <FormLabel>Witch</FormLabel>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`roles.foreteller`}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value.toString() === "1"}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange(1)
                                : field.onChange(0);
                            }}
                          />
                        </FormControl>
                        <FormLabel>Foreteller</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex justify-start w-full gap-2 mt-4">
                  <Button
                    type="button"
                    className="w-24"
                    onClick={() => router.push("/")}
                    variant="destructive"
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-24"
                    type="submit"
                    disabled={
                      isLoading ||
                      !userId ||
                      !username ||
                      calculateTotalPlayers(form.watch("roles")) <
                        MIN_PLAYERS ||
                      calculateTotalPlayers(form.watch("roles")) > MAX_PLAYERS
                    }
                  >
                    {isLoading ? (
                      <Loader2Icon className="animate-spin" />
                    ) : (
                      "Create"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
};

export default CreateLobby;
