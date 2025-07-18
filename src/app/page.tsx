"use client";

import { useEffect, useState } from "react";
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
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { clickSound } from "@/utils/sounds";
import PageTheme from "@/components/PageTheme";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircleIcon, Loader2Icon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { GiWolfHead } from "react-icons/gi";

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

  const [showAlert, setShowAlert] = useState(false);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

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
    setCreating(true);
    localStorage.setItem("playerName", data.name);
    router.push("/create");
    setCreating(false);
  };

  const handleJoinLobby = (data: z.infer<typeof joinLobbySchema>) => {
    const name = form1.getValues("name");
    setJoining(true);
    socket.emit("checkLobby", data.lobbyId, (exists: boolean) => {
      if (!exists) {
        setJoining(false);
        setShowAlert(true);
        return;
      }
      localStorage.setItem("playerName", name);
      router.push(`/lobby/${data.lobbyId}`);
      setJoining(false);
    });
  };

  useEffect(() => {
    const onConnect = () => console.log("connected to socket server");
    console.log("connected");

    socket.on("connect", onConnect);
    socket.connect();

    return () => {
      socket.off("connect", onConnect);
    };
  }, []);

  return (
    <PageTheme forcedTheme="dark">
      <div className="flex flex-col min-h-screen w-full bg-cover bg-center">
        <div className="flex items-center justify-center mt-20 gap-5">
          <TypographyH1 className="text-7xl font-sans">Werewolf</TypographyH1>
          <GiWolfHead className="text-7xl" />
        </div>
        <Card className="size-fit p-10 mx-auto my-30 flex flex-col items-center justify-center bg-card/50 backdrop-blur-sm">
          <CardTitle className="text-xl">Enter a name to play!</CardTitle>
          <CardContent className="flex flex-col items-center justify-center gap-4 bg-0">
            <Form {...form1}>
              <form
                className="flex flex-col items-center justify-center gap-4 bg-0"
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
                  onClick={clickSound}
                  className="w-[200px]"
                  type="submit"
                  disabled={!form1.watch("name") || creating}
                >
                  {creating ? (
                    <Loader2Icon className="animate-spin" />
                  ) : (
                    "Create Lobby"
                  )}
                </Button>
              </form>
            </Form>

            <Dialog>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    clickSound();
                    setShowAlert(false);
                  }}
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
                  <DialogDescription>
                    Enter a valid lobby ID to join an existing game.
                  </DialogDescription>
                </DialogHeader>
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
                          onClick={clickSound}
                          className="w-[100px]"
                          variant="outline"
                          type="button"
                        >
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button
                        onClick={clickSound}
                        className="w-[100px]"
                        type="submit"
                        disabled={joining}
                      >
                        {joining ? (
                          <Loader2Icon className="animate-spin" />
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
                {showAlert && (
                  <>
                    <Separator />
                    <Alert variant="destructive">
                      <AlertCircleIcon />
                      <AlertTitle>Error joining lobby</AlertTitle>
                      <AlertDescription>
                        <p>Make sure that:</p>
                        <ul className="list-inside list-disc text-sm">
                          <li>The lobby ID is correct</li>
                          <li>The lobby is not full</li>
                          <li>The game has not started yet</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
    </PageTheme>
  );
}
