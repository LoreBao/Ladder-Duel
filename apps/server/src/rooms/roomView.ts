import type {GameView,PlayerId,RoomSummary} from "@ladder-duel/shared"
import { getOpponent } from "@ladder-duel/shared"
import type {GameRoom} from "./roomTypes"

export function createGameView(room:GameRoom,viewer:PlayerId):GameView{
    
}

export function createRoomSummary(room:GameRoom):RoomSummary{
    return{
        roomId:room.roomId,
        status:room.status,
        players:{
            P1: toSummaryPlayer(room.players.P1),
            P2: toSummaryPlayer(room.players.P2),
        },
    };
}

function toSummaryPlayer(player: GameRoom["players"][PlayerId]){
    if(!player) return undefined;
    return{
        connected: player.connected,
        displayName:player.displayName,
    }
}