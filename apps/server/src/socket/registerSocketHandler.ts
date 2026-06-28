import type{
    ClientToServerEvents,
    ServerToClientEvents,
} from "@ladder-duel/shared";

import { createGameView,createRoomSummary } from "src/rooms/roomView";
import { RoomManager } from "src/rooms/roomManager";
import type {Server,Socket} from "socket.io";
import type {GameRoom, RoomError} from "../rooms/roomTypes"
import { EventEmitterAsyncResource } from "events";

type GameSocketServer=Server<ClientToServerEvents,ServerToClientEvents>
type GameSocket= Socket<ClientToServerEvents, ServerToClientEvents>

export function registerSocketHandlers(io: GameSocketServer):void{
    const rooms=new RoomManager();
    io.on("connection",(socket:GameSocket)=>{

        socket.on("create_room",(payload)=>{
            const result=rooms.createRoom(socket.id,payload.displayName);
            if("error" in result){
                
            }
        })

        console.log(socket.id)
        return;
    })
}   