import type {GameView,PlayerId,RoomSummary} from "@ladder-duel/shared"
import { getOpponent } from "@ladder-duel/shared"
import type {GameRoom} from "./roomTypes"

export function createGameView(room:GameRoom,viewer:PlayerId):GameView{
    
}

export function createRoomSummary(room:GameRoom):RoomSummary{

}

function toSummaryPlayer(player: GameRoom["players"][PlayerId]){
    
}