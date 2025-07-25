import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/game/types";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

interface GameChatProps {
  messages: Message[];
}

const GameChat = ({ messages }: GameChatProps) => {
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm h-70 mb-20">
      <CardContent className="flex flex-col items-center justify-start h-full w-full px-4">
        <div className="flex flex-col items-center justify-start h-48 w-full overflow-y-scroll border rounded-lg px-2 pb-2">
          {messages.map((message) => (
            <div key={message.id}>
              <Separator className="my-2" />
              <div className="flex gap-2 w-full">
                <b>{message.sender}:</b>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
        </div>
        <Input
          placeholder="Type your message here..."
          className="absolute bottom-0 mb-3 mt-2 w-5/6 border-none"
        />
      </CardContent>
    </Card>
  );
};

export default GameChat;
