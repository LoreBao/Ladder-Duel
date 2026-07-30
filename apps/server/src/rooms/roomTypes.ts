import type { GameState, PlayerId } from "@ladder-duel/shared";
import { Socket } from "socket.io";
export type RoomStatus="waiting"|"playing"|"ended";

export interface RoomPlayer{
    playerId:PlayerId;
    socketId:string;
    displayName?:string;
    connected:boolean
}

export interface GameRoom{
    roomId:string;
    status:RoomStatus;
    players: Partial<Record<PlayerId,RoomPlayer>>;
    gameState:GameState;
    createdAt:number;
    updatedAt:number;
}

export interface RoomError{
    code:string;
    message:string;
}

