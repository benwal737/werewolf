"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
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

const formSchema = z.object({
  name: z.string().max(15, {
    message: "character limit exceeded 15",
  }),
});

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const createLobby = (data: z.infer<typeof formSchema>) => {
    console.log(data);
    router.push("/create");
  };

  const joinLobby = (data: z.infer<typeof formSchema>) => {
    console.log(data);
  };

  useEffect(() => {
    const onConnect = () => console.log("connected to socket server");

    socket.on("connect", onConnect);

    socket.connect();

    return () => {
      socket.off("connect", onConnect); // Remove listener
      socket.disconnect(); // Disconnect socket
    };
  })

  return (
    <>
      <TypographyH1 className="mt-10">Werewolf</TypographyH1>
      <Form {...form}>
        <form className="flex flex-col items-center justify-center min-h-screen gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormControl>
                    <Input
                      className="w-full max-w-xs min-h-[30px] h-[50px]"
                      placeholder="Enter your name"
                      {...field}
                    ></Input>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button
            type="button"
            onClick={form.handleSubmit(createLobby)}
            disabled={!form.watch("name")}
          >
            Create Lobby
          </Button>
          <Button
            type="button"
            onClick={form.handleSubmit(joinLobby)}
            disabled={!form.watch("name")}
          >
            Join Lobby
          </Button>
        </form>
      </Form>
    </>
  );
}
