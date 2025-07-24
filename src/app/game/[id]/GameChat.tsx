import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Message } from "@/game/types";

interface GameChatProps {
  messages: Message[];
}

const GameChat = ({ messages }: GameChatProps) => {
  return (
    <Card className="w-full bg-card/50 backdrop-blur-sm h-70">
      <CardContent>
        {messages.map((message, index) => (
          <p key={index}>{message.text}</p>
        ))}
      </CardContent>
    </Card>
  );
};

export default GameChat;
