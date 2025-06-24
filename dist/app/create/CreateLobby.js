"use strict";
"use client";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayer = void 0;
const react_1 = __importDefault(require("react"));
const z = __importStar(require("zod"));
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const button_1 = require("@/components/ui/button");
const navigation_1 = require("next/navigation");
const uuid_1 = require("uuid");
const socketClient_1 = require("@/lib/socketClient");
const MIN_PLAYERS = 4;
const MAX_PLAYERS = 20;
const roleSchema = z.object({
    werewolves: z.number().min(1, "Need at least 1 werewolf"),
    villagers: z.number().min(1, "Need at least 1 villager"),
    witches: z.number().min(0),
    foretellers: z.number().min(0),
});
const lobbySchema = z
    .object({
    roles: roleSchema,
})
    .refine((data) => {
    const total = calculateTotalPlayers(data.roles);
    return total >= MIN_PLAYERS && total <= MAX_PLAYERS;
}, {
    message: `Players must be between ${MIN_PLAYERS} and ${MAX_PLAYERS}`,
    path: ["roles"],
});
const calculateTotalPlayers = (roles) => {
    return roles.werewolves + roles.villagers + roles.witches + roles.foretellers;
};
const roleKeys = ["werewolves", "villagers", "witches", "foretellers"];
const PlayerCountDisplay = ({ form, }) => {
    const roles = form.watch("roles");
    const totalPlayers = calculateTotalPlayers(roles);
    return (<div className="mb-4 p-3 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-semibold">Total Players:</span>
        <span className={`text-lg ${totalPlayers < MIN_PLAYERS || totalPlayers > MAX_PLAYERS
            ? "text-destructive"
            : "text"}`}>
          {totalPlayers}
        </span>
      </div>
    </div>);
};
function makeid(length) {
    var result = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
const getPlayer = () => {
    let playerId = localStorage.getItem("playerId");
    let playerName = localStorage.getItem("playerName");
    if (!playerId) {
        playerId = (0, uuid_1.v4)();
        localStorage.setItem("playerId", playerId);
    }
    return { playerId, playerName };
};
exports.getPlayer = getPlayer;
const CreateLobby = () => {
    const router = (0, navigation_1.useRouter)();
    const form = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(lobbySchema),
        defaultValues: {
            roles: {
                werewolves: 3,
                villagers: 3,
                witches: 1,
                foretellers: 1,
            },
        },
    });
    const handleSubmit = (data) => {
        const lobbyId = makeid(5);
        const { playerName, playerId } = (0, exports.getPlayer)();
        socketClient_1.socket.emit("createLobby", lobbyId, playerId, playerName);
        router.push(`/lobby/${lobbyId}`);
    };
    return (<form_1.Form {...form}>
      <form className="flex flex-col items-center justify-center min-h-screen gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <PlayerCountDisplay form={form}/>

        {roleKeys.map((role) => (<form_1.FormField key={role} control={form.control} name={`roles.${role}`} render={({ field }) => (<form_1.FormItem>
                <form_1.FormLabel>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </form_1.FormLabel>
                <form_1.FormControl>
                  <input_1.Input type="number" min={role === "werewolves" || role === "villagers" ? 1 : 0} className="w-full max-w-xs min-h-[30px] h-[50px]" value={field.value} onChange={(e) => field.onChange(e.target.valueAsNumber)}/>
                </form_1.FormControl>
                <form_1.FormMessage />
              </form_1.FormItem>)}/>))}

        <button_1.Button type="submit" disabled={!form.formState.isValid || form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Creating..." : "Create Lobby"}
        </button_1.Button>
      </form>
    </form_1.Form>);
};
exports.default = CreateLobby;
