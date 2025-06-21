type Role = 'werewolf' | 'villager' | 'witch' | 'foreteller';

export type Player = {
    id: string;
    name: string;
    role: Role;
    isAlive: boolean;
}

export type GamePhase = 'lobby' | 'night' | 'voting' | 'results' | 'end';