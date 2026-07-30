import type {PlayerId, SetRollPayload} from "../types";
import type { GameView } from "./gameView";
import type { PlayerIntent } from "./playerIntent";

export interface RoomSummary{
    roomId:string;
    status: "waiting" | "playing" | "ended";
    players: Partial<
        Record<PlayerId,{connected:boolean; displayName?:string}>
    >;
}

export interface ClientToServerEvents{
    create_room: (payload:{displayName?:string})=>void;
    join_room:(payload:{roomId:string; intent: PlayerIntent})=>void;
    player_action:(payload:{roomId:string;intent: PlayerIntent})=>void;
    request_restart:(payload:{roomId:string})=>void
}

export interface ServerToClientEvents{
    room_created:(payload: {roomId:string})=>void;
    room_joined: (payload: {roomId:string; room:RoomSummary})=>void;
    player_assigned:(payload:{roomId:string; playerId:PlayerId})=>void;
    game_state_updated: (payload:{
        roomId:string
        view: GameView;
        room: RoomSummary;
    })=>void;   
    player_disconnected:(payload:{roomId:string;playerId:PlayerId})=>void;
    error_message:(payload:{code:string; message:string})=>void;
    
}

