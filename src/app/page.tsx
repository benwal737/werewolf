"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socketClient";
import { useRouter } from "next/navigation";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typography";
import {
  Form,
  FormField,
  FormItem,
  FormMessage,
  FormControl,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import PageTheme from "@/components/PageTheme";
import { getBackground } from "@/utils/getBackground";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const createLobbySchema = z.object({
  name: z.string().max(15, {
    message: "character limit exceeded 15",
  }),
});

const joinLobbySchema = z.object({
  name: z.string().max(15, {
    message: "character limit exceeded 15",
  }),
  lobbyId: z.string().min(1, "Lobby ID is required"),
});

export default function Home() {
  const router = useRouter();

  const form1 = useForm<z.infer<typeof createLobbySchema>>({
    resolver: zodResolver(createLobbySchema),
    defaultValues: {
      name: "",
    },
  });

  const form2 = useForm<z.infer<typeof joinLobbySchema>>({
    resolver: zodResolver(joinLobbySchema),
    defaultValues: {
      name: "",
      lobbyId: "",
    },
  });

  const handleCreateLobby = (data: z.infer<typeof createLobbySchema>) => {
    localStorage.setItem("playerName", data.name);
    router.push("/create");
  };

  const handleJoinLobby = (data: z.infer<typeof joinLobbySchema>) => {
    const name = form1.getValues("name");
    socket.emit("checkLobby", data.lobbyId, (exists: boolean) => {
      if (!exists) {
        alert("Error: Lobby full or does not exist");
        return;
      }
      localStorage.setItem("playerName", name);
      router.push(`/lobby/${data.lobbyId}`);
    });
  };

  useEffect(() => {
    const onConnect = () => console.log("connected to socket server");

    socket.on("connect", onConnect);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
    };
  }, []);

  const background = getBackground();
  return (
    <PageTheme forcedTheme="dark">
      <div
        className="flex flex-col min-h-screen w-full bg-cover bg-center"
        style={{
          backgroundImage: background,
        }}
      >
        <TypographyH1 className="mt-20 text-7xl font-sans">Werewolf</TypographyH1>
        <Card className="bg-card/50 backdrop-blur-sm size-fit p-10 mx-auto my-30 flex flex-col items-center justify-center">
            <CardTitle className="text-xl">
              Enter a name to play!
            </CardTitle>
          <CardContent className="flex flex-col items-center justify-center gap-4">
            <Form {...form1}>
              <form
                className="flex flex-col items-center justify-center gap-4"
                onSubmit={form1.handleSubmit(handleCreateLobby)}
              >
                <FormField
                  control={form1.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          className="w-[200px]"
                          placeholder="Your name here..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  className="w-[200px]"
                  type="submit"
                  disabled={!form1.watch("name")}
                >
                  Create Lobby
                </Button>
              </form>
            </Form>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  className="w-[200px]"
                  type="button"
                  disabled={!form1.watch("name")}
                >
                  Join Lobby
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Lobby ID</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Enter a valid lobby ID to join an existing game.
                </DialogDescription>
                <Form {...form2}>
                  <form
                    onSubmit={form2.handleSubmit(handleJoinLobby)}
                    className="grid gap-4"
                  >
                    <FormField
                      control={form2.control}
                      name="lobbyId"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              className="w-full min-h-[30px] h-[50px]"
                              placeholder="Lobby ID"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <DialogFooter className="flex justify-between">
                      <DialogClose asChild>
                        <Button
                          className="w-[100px]"
                          variant="outline"
                          type="button"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button className="w-[100px]" type="submit">
                        Join
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
}
