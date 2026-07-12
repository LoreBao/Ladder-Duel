import type {PlayerId, PlayerIntent} from "@ladder-duel/shared"
import type {GameRoom, RoomError} from "./roomTypes"

export function getPlayerIdBySocketId(
    room:GameRoom,
    socketId:string,
): PlayerId|undefined{
    if(room.players.P1?.socketId===socketId) return "P1";
    if(room.players.P2?.socketId===socketId) return "P2";
    return undefined;
}

