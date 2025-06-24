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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Home;
const react_1 = require("react");
const socketClient_1 = require("@/lib/socketClient");
const navigation_1 = require("next/navigation");
const z = __importStar(require("zod"));
const react_hook_form_1 = require("react-hook-form");
const zod_1 = require("@hookform/resolvers/zod");
const button_1 = require("@/components/ui/button");
const typography_1 = require("@/components/ui/typography");
const form_1 = require("@/components/ui/form");
const input_1 = require("@/components/ui/input");
const dialog_1 = require("@/components/ui/dialog");
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
function Home() {
    const router = (0, navigation_1.useRouter)();
    const form1 = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(createLobbySchema),
        defaultValues: {
            name: "",
        },
    });
    const form2 = (0, react_hook_form_1.useForm)({
        resolver: (0, zod_1.zodResolver)(joinLobbySchema),
        defaultValues: {
            name: "",
            lobbyId: "",
        },
    });
    const handleCreateLobby = (data) => {
        localStorage.setItem("playerName", data.name);
        router.push("/create");
    };
    const handleJoinLobby = (data) => {
        const name = form1.getValues("name");
        socketClient_1.socket.emit("checkLobby", data.lobbyId, (exists) => {
            if (!exists) {
                alert("Lobby does not exist or game in session");
                return;
            }
            localStorage.setItem("playerName", name);
            router.push(`/lobby/${data.lobbyId}`);
        });
    };
    (0, react_1.useEffect)(() => {
        const onConnect = () => console.log("connected to socket server");
        socketClient_1.socket.on("connect", onConnect);
        socketClient_1.socket.connect();
        return () => {
            socketClient_1.socket.off("connect", onConnect);
        };
    }, []);
    return (<div>
      <typography_1.TypographyH1 className="mt-10">Werewolf</typography_1.TypographyH1>
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <form_1.Form {...form1}>
          <form className="flex flex-col items-center justify-center gap-4" onSubmit={form1.handleSubmit(handleCreateLobby)}>
            <form_1.FormField control={form1.control} name="name" render={({ field }) => (<form_1.FormItem>
                  <form_1.FormControl>
                    <input_1.Input className="w-full max-w-xs min-h-[30px] h-[50px]" placeholder="Enter your name" {...field}/>
                  </form_1.FormControl>
                  <form_1.FormMessage />
                </form_1.FormItem>)}/>
            <button_1.Button type="submit" disabled={!form1.watch("name")}>
              Create Lobby
            </button_1.Button>
          </form>
        </form_1.Form>

        <dialog_1.Dialog>
          <dialog_1.DialogTrigger asChild>
            <button_1.Button type="button" disabled={!form1.watch("name")}>
              Join Lobby
            </button_1.Button>
          </dialog_1.DialogTrigger>
          <dialog_1.DialogContent className="sm:max-w-[425px] bg-background text-foreground border-border">
            <dialog_1.DialogHeader>
              <dialog_1.DialogTitle>Enter Lobby ID</dialog_1.DialogTitle>
            </dialog_1.DialogHeader>
            <form_1.Form {...form2}>
              <form onSubmit={form2.handleSubmit(handleJoinLobby)} className="grid gap-4">
                <form_1.FormField control={form2.control} name="lobbyId" render={({ field }) => (<form_1.FormItem>
                      <form_1.FormControl>
                        <input_1.Input className="w-full max-w-xs min-h-[30px] h-[50px]" placeholder="Lobby ID" {...field}/>
                      </form_1.FormControl>
                      <form_1.FormMessage />
                    </form_1.FormItem>)}/>
                <dialog_1.DialogFooter>
                  <dialog_1.DialogClose asChild>
                    <button_1.Button variant="outline" type="button">
                      Cancel
                    </button_1.Button>
                  </dialog_1.DialogClose>
                  <button_1.Button type="submit">Join</button_1.Button>
                </dialog_1.DialogFooter>
              </form>
            </form_1.Form>
          </dialog_1.DialogContent>
        </dialog_1.Dialog>
      </div>
    </div>);
}
