import{
    createDefaultDeps,
    createInitialState,
    reduce,
} from "@ladder-duel/shared"

import type {
    CardId,
    EngineDeps,
    GameAction,
    PlayerId,
    PlayerIntent,
} from "@ladder-duel/shared";

import type{GameRoom, RoomError, RoomPlayer} from "./roomTypes"
import { throws } from "assert";
import { normalize } from "path";
import { createRoomSummary } from "./roomView";
import { getPlayerIdBySocketId } from "./roomValidation";

type RoomResult={room: GameRoom} | {error:RoomError}

type LeaveResult={room?:GameRoom; playerId?: PlayerId};


export class RoomManager{
    private readonly rooms= new Map<string, GameRoom>();
    private readonly socketToRoomId= new Map<string,string>();
    private readonly deps:EngineDeps;

    constructor (deps: EngineDeps=createDefaultDeps()){
        this.deps=deps;
    }

    createRoom(socketId:string, displayName?:string): RoomResult{
        if(this.socketToRoomId.has(socketId)){
            return {error:alreadyInRoom()};
        }
        
        const now=Date.now()
        const roomId=this.createRoomId();
        const player: RoomPlayer={
            playerId:"P1",
            socketId,
            displayName: cleanDisplayName(displayName),
            connected:true,
        }

        const room: GameRoom={
            roomId,
            status:"waiting",
            players:{P1:player},
            gameState:createInitialState(this.deps),
            createdAt:now,
            updatedAt:now,
        }

        this.rooms.set(roomId,room);
        this.socketToRoomId.set(socketId,roomId);
        return {room}
    }

    joinRoom(roomId:string, socketId:string, displayName?:string): RoomResult{
        if(this.socketToRoomId.has(socketId)){
            return {error:alreadyInRoom()};
        }

        const room=this.rooms.get(normalizeRoomId(roomId));

        if(!room){
            return{error:{code:"ROOM_NOT_FOUND", message: "Room does not exist"}}
        }

        if(room.players.P2?.connected||room.players.P2){
            return {error:{code:"ROOM_FULL", message:"Room already has two players."}}
        }       

        room.players.P2={
            playerId:"P2",
            socketId,
            displayName: cleanDisplayName(displayName),
            connected:true,
        }

        room.status=resolveRoomStatus(room);
        room.updatedAt=Date.now();
        this.socketToRoomId.set(socketId,room.roomId)

        return {room}
    }

    leaveBySocketId(socketId:string):LeaveResult{
        const roomId=this.socketToRoomId.get(socketId);
        if(!roomId) return{};

        const room=this.rooms.get(roomId);
        this.socketToRoomId.delete(socketId);
        if(!room) return {};

        const playerId=getPlayerIdBySocketId(room,socketId);
        if(!playerId) return {room};

        const player=room.players[playerId];


        if(player){
            room.players[playerId]={...player, connected:false};
            room.status=resolveRoomStatus(room);
            room.updatedAt=Date.now();
        }

        return {room, playerId};
    }

    private createRoomId():string{
        
        let roomId="";
        do{
            roomId=Math.random().toString(36).slice(2,8).toUpperCase();

        } while (this.rooms.has(roomId));
        return roomId;
             
    }
}

// helper func
function cleanDisplayName(displayName: string|undefined): string|undefined{
    const cleaned=displayName?.trim();
    return cleaned?cleaned.slice(0,24):undefined;
}

function alreadyInRoom(): RoomError{
    return{
        code:"ALREADY_IN_ROOM",
        message:"This Connection is Already in a Room.",
    };
}

function normalizeRoomId(roomId:string):string{
    return roomId.trim().toUpperCase();
}

function resolveRoomStatus(room:GameRoom):GameRoom["status"]{
    if(room.gameState.winner) return "ended";
    return room.players.P1?.connected&&room.players.P2?.connected
        ?"playing"
        :"waiting"
}