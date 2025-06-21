"use client";

import { useEffect, useState } from "react";
import { socket } from "../socket";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { TypographyH1 } from "@/components/ui/typography";
import { Textarea } from "@/components/ui/textarea";

export default function Home() {
  const router = useRouter();

  const [name, setName] = useState("");

  useEffect(() => {
    socket.on("connect", () => {
      console.log("connected to server");
    });
  }, []);

  const createLobby = () => {
    router.push("/create");
  };

  return (
    <>
      <TypographyH1 className="my-10">Werewolf</TypographyH1>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Textarea
          className="w-full max-w-xs min-h-[30px] h-[50px]"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => {
            const newVal = e.target.value;
            setName(newVal);
          }}
        />
        <Button onClick={createLobby}>Create Lobby</Button>
        <Button>Join Lobby</Button>
      </div>
    </>
  );
}
