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
} from "@/components/ui/dialog";

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

  const backgroundUrl = "/layered-peaks-dark.svg";
  return (
    <div
      className="flex flex-col min-h-screen w-full bg-cover bg-center"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)), url('${backgroundUrl}')`,
      }}
    >
      <TypographyH1 className="mt-10">Werewolf</TypographyH1>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
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
                      className="w-full max-w-xs min-h-[30px] h-[50px]"
                      placeholder="Enter your name"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!form1.watch("name")}>
              Create Lobby
            </Button>
          </form>
        </Form>

        <Dialog>
          <DialogTrigger asChild>
            <Button type="button" disabled={!form1.watch("name")}>
              Join Lobby
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-background text-foreground border-border">
            <DialogHeader>
              <DialogTitle>Enter Lobby ID</DialogTitle>
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
                          className="w-full max-w-xs min-h-[30px] h-[50px]"
                          placeholder="Lobby ID"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline" type="button">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Join</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
