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
import { getPlayerIdBySocketId,canPlayerSendIntent } from "./roomValidation";

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

    dispatchPlayerIntent(
        socketId:string,
        roomId:string,
        intent: PlayerIntent,
    ): RoomResult{
       
       const roomResult=this.findSocketRoom(socketId, roomId);
       if("error" in roomResult) return roomResult;

       const {room,playerId}=roomResult;
       const allowed=canPlayerSendIntent(room,playerId,intent);

       if(!allowed.ok) return {error:allowed.error};

       const action=toGameAction(playerId,intent);

       room.gameState=reduce(room.gameState,action, this.deps);
       room.status=resolveRoomStatus(room);
       room.updatedAt=Date.now()

       return {room};
    }

    restartRoom(socketId:string, roomId:string):RoomResult{
        const roomResult=this.findSocketRoom(socketId,roomId);
        if("error" in roomResult) return roomResult;

        const {room}= roomResult;
        room.gameState=reduce(room.gameState,{type:"RESET"}, this.deps);
        room.status=resolveRoomStatus(room);
        room.updatedAt=Date.now();

        return {room};
    }

    private createRoomId():string{
        
        let roomId="";
        do{
            roomId=Math.random().toString(36).slice(2,8).toUpperCase();

        } while (this.rooms.has(roomId));
        return roomId;
             
    }

    private findSocketRoom(
        socketId:string,
        roomId:string,
    ):{room:GameRoom; playerId:PlayerId}|{error:RoomError}{
        const normalizedRoomId=normalizeRoomId(roomId);
        const room=this.rooms.get(normalizedRoomId);
        if(!room){
            return {error:{code:"ROOM_NOT_FOUND", message: "Room does not exist"}};
        }


        if(this.socketToRoomId.get(socketId)!==normalizedRoomId){
            return{
                error:{
                    code:"SOCKET_NOT_IN_ROOM",
                    message:"This connection is not a player in that room"
                },
            };
        }

        const playerId=getPlayerIdBySocketId(room,socketId);
        if(!playerId){
            return{
                error:{
                    code:"PLAYER_NOT_ASSIGNED",
                    message:"This connection has not been assigned a player"
                },
            };
        }

        return {room, playerId};
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

function toGameAction(playerId:PlayerId,intent: PlayerIntent): GameAction{
    switch(intent.type){
        case "PLAY_CARD":
            if(intent.cardId==="SET_ROLL"){
                return{
                    type:"PLAY_CARD",
                    player:playerId,
                    cardId:"SET_ROLL",
                    payload:intent.payload,
                };
            }
            if(intent.cardId==="MULTIPLIER"){
                return{
                    type:"PLAY_CARD",
                    player:playerId,
                    cardId:"MULTIPLIER",
                    payload:intent.payload,
                }
            }
            return{
                type:"PLAY_CARD",
                player:playerId,
                cardId: intent.cardId as Exclude<CardId, "SET_ROLL"|"MULTIPLIER">,
            }

        case "SKIP_CARD":
            return {type:"SKIP_CARD", player: playerId}

        case "ROLL_DICE":
            return {type:"ROLL_DICE", player: playerId}

        case "RESOLVE_ROLL":
            return {type:"RESOLVE_ROLL"}

        case "DRAW_CARD":
            return {type:"DRAW_CARD"}

        case "DISCARD_CARD":
            return {type:"DISCARD_CARD", player: playerId, cardId: intent.cardId};
        case "END_TURN":
            return {type:"END_TURN", player:playerId};
    }
}
