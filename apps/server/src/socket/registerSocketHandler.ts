      import type{
    ClientToServerEvents,
    ServerToClientEvents,
} from "@ladder-duel/shared";

import { createGameView,createRoomSummary } from "src/rooms/roomView";
import { RoomManager } from "src/rooms/RoomManager";
import {BroadcastOperator, Server,Socket} from "socket.io";
import type {GameRoom, RoomError} from "../rooms/roomTypes"
import { EventEmitterAsyncResource } from "events";
import { pathToFileURL } from "url";

type GameSocketServer=Server<ClientToServerEvents,ServerToClientEvents>
type GameSocket= Socket<ClientToServerEvents, ServerToClientEvents>

export function registerSocketHandlers(io: GameSocketServer):void{
    const rooms=new RoomManager();
     io.on("connection",(socket:GameSocket)=>{
        
        socket.on("create_room",(payload)=>{
            const result=rooms.createRoom(socket.id,payload.displayName);
            if("error" in result){
                emitError(socket,result.error);
                return;
            }
            socket.join(result.room.roomId);
            socket.emit("room_created", {roomId:result.room.roomId})
            socket.emit("player_assigned",{
                roomId:result.room.roomId,
                playerId:"P1"
            });
            socket.emit("room_joined",{
                roomId:result.room.roomId,
                room:createRoomSummary(result.room),
            });
            broadcastRoom(io,result.room);
        })

        socket.on("join_room",(payload)=>{
            const result=rooms.joinRoom(
                payload.roomId,
                socket.id,
                payload.displayName,
            );
            if("error" in result){
                emitError(socket,result.error);
                return;
            }

            socket.join(result.room.roomId);
            socket.emit("player_assigned",{
                roomId:result.room.roomId,
                playerId:"P2"
            });
            socket.emit("room_joined",{
                roomId:result.room.roomId,
                room:createRoomSummary(result.room),
            });
            broadcastRoom(io,result.room);
        })
        socket.on("player_action",(payload)=>{
            const result=rooms.dispatchPlayerIntent(
                socket.id,
                payload.roomId,
                payload.intent,
            );
            if("error" in result){
                emitError(socket,result.error);
                return;
            }

            broadcastRoom(io,result.room);
        })

        socket.on("request_restart",(payload)=>{
            const result=rooms.restartRoom(socket.id,payload.roomId);
            if("error" in result){
                emitError(socket,result.error);
                return;
            }

            broadcastRoom(io,result.room);
        });

        socket.on("disconnect",()=>{
            const result=rooms.leaveBySocketId(socket.id);
            if(!result.room||!result.playerId) return;

            socket.to(result.room.roomId).emit("player_disconnected",{
                roomId:result.room.roomId,
                playerId:result.playerId
            });
            broadcastRoom(io,result.room);
        })

        console.log(socket.id)
        return;
    })
}   

function emitError(socket:GameSocket, error:RoomError): void{
    socket.emit("error_message",error);
}

function broadcastRoom(io:GameSocketServer,room:GameRoom):void{
    const roomSummary=createRoomSummary(room);
    for(const player of Object.values(room.players)){
        if(!player?.connected) continue;

        io.to(player.socketId).emit("game_state_updated",{
            roomId:room.roomId,
            view:createGameView(room,player.playerId),
            room:roomSummary,
        })                                         
    }
}