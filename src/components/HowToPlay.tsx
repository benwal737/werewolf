import React from 'react'
import { Sun, Moon, Eye, Trophy } from 'lucide-react'

const HowToPlay = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-card p-3 rounded-full">
              <Sun className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Day Phase</h3>
              <p className="text-sm text-muted-foreground">
                Players discuss, debate, and vote to eliminate suspected
                werewolves. Use your voice and logic to convince others.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="bg-card p-3 rounded-full">
              <Eye className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Special Roles</h3>
              <p className="text-sm text-muted-foreground">
                Foretellers can reveal the roles of other players, and witches can use their powers to save or kill others. 
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className="bg-card p-3 rounded-full">
              <Moon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Night Phase</h3>
              <p className="text-sm text-muted-foreground">
                Werewolves secretly choose their victim while other unique roles perform special actions in the shadows.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="bg-card p-3 rounded-full">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold mb-2">Win Conditions</h3>
              <p className="text-sm text-muted-foreground">
                Villagers win by eliminating all werewolves. Werewolves win by eliminating all villagers. Draw if all players die.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowToPlay