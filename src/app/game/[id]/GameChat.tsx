import React from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Message } from "@/game/types";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { socket } from "@/lib/socketClient";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { GameState } from "@/game/types";
import { Player } from "@/game/types";

interface GameChatProps {
  gameState: GameState;
  player: Player;
}

const GameChat = ({ gameState, player }: GameChatProps) => {
  const lobbyId = useParams().id as string;
  const [newMessage, setNewMessage] = useState("");

  let messages: Message[] = [];
  if (!player.alive) {
    messages = gameState.deadChat;
  } else if (player.role === "werewolf") {
    messages = gameState.werewolfChat;
  } else {
    messages = gameState.gameChat;
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    socket.emit("sendMessage", lobbyId, newMessage);
    setNewMessage("");
  };

  return (
    <Card className="flex flex-col h-full max-h-[89vh] bg-card/50 backdrop-blur-sm">
      <CardHeader className="border-b border-border flex items-center gap-2">
        <MessageCircle className="h-5 w-5" />
        <CardTitle className="text-2xl">Game Chat</CardTitle>
      </CardHeader>

      <div className="flex-1 overflow-y-scroll px-6">
        <div className="space-y-5">
          {messages.map((message) => (
            <div key={message.id} className={`rounded-lg animate-fade-in`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm">
                    {message.sender.name}
                  </span>
                </div>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-6 pt-6 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default GameChat;
