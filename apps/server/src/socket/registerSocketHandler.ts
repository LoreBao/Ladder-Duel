import type{
    ClientToServerEvents,
    ServerToClientEvents,
} from "@ladder-duel/shared";

import type {Server,Socket} from "socket.io";

type GameSocketServer=Server<ClientToServerEvents,ServerToClientEvents>
type GameSocket= Socket<ClientToServerEvents, ServerToClientEvents>

export function registerSocketHandlers(io: GameSocketServer):void{
    io.on("connection",(socket:GameSocket)=>{
        console.log(socket.id)
        return;
    })
}