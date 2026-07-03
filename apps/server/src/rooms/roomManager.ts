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
    }

    private createRoomId():string{
        
        let roomId="";
        do{
            roomId=Math.random().toString(36).slice(2,8).toUpperCase();

        } while (this.rooms.has(roomId));
        return roomId;
             
    }
}
