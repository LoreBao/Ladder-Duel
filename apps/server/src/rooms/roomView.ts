import type {GameView,PlayerId,RoomSummary} from "@ladder-duel/shared"
import { getOpponent } from "@ladder-duel/shared"
import type {GameRoom} from "./roomTypes"

export function createGameView(room:GameRoom,viewer:PlayerId):GameView{
    const state=room.gameState;
    const opponent=getOpponent(viewer);
    const meState=state.players[viewer];
    const opponentState=state.players[opponent];

    return{
        roomId:room.roomId,
        myPlayerId:viewer,
        turn:state.turn,
        currentPlayer: state.currentPlayer,
        phase: state.phase,
        attacker:state.turnCtx.attacker,
        defender:state.turnCtx.defender,
        attackerCard:state.turnCtx.attackerCard,
        defenderCard:state.turnCtx.defenderCard,
        roll: state.turnCtx.roll,

        me:{
            id:viewer,
            position: meState.position,
            handCount:meState.hand.length,
            hand: [...meState.hand],
        },
        opponent:{
            id:opponent,
            position:opponentState.position,
            handCount:opponentState.hand.length
        },
        winner:state.winner,
        log:state.log.slice(-100)
    }
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