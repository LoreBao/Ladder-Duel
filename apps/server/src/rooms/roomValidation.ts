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

export function canPlayerSendIntent(
    room:GameRoom,
    playerId:PlayerId,
    intent: PlayerIntent,
):{ok:true}|{ok:false; error:RoomError}{

    if(room.status==="waiting"){
        return denied("WAITING_FOR_PLAYER","Waiting for another player to join")

    }
    if(room.gameState.winner){
        return denied("GAME_ENDED", "The game has ended. Restart the room to play again");
    }

    const {phase,currentPlayer, turnCtx}= room.gameState;
    const attacker=turnCtx.attacker;
    const defender=turnCtx.defender;

    switch(phase){
        case "ACTION":
            if(playerId!==attacker){
                return notYourTurn();
            }
            return intent.type === "PLAY_CARD" || intent.type==="SKIP_CARD"
                ?{ok:true}
                :wrongPhase();
        case "ROLL":
            if(playerId!==attacker) return notYourTurn();
            return intent.type==="ROLL_DICE"?{ok:true}:wrongPhase();

        case "REACTION":
            if(playerId!==defender) return notYourTurn();
            return intent.type==="PLAY_CARD"||intent.type==="SKIP_CARD"
            ? {ok:true}
            : wrongPhase()
    
        case "RESOLVE":
            if(playerId!==attacker) return notYourTurn();
            return intent.type==="RESOLVE_ROLL"?{ok:true}:wrongPhase();

        case "DRAW":
            if(playerId!==currentPlayer) return notYourTurn();
            return intent.type==="DRAW_CARD"||intent.type==="DISCARD_CARD"
            ? {ok:true}
            : wrongPhase();

        case "END":
            if(playerId!==attacker) return notYourTurn();
            return intent.type==="END_TURN"?{ok:true}:wrongPhase();
    }

}

function denied(code:string, message:string): {ok:false;error:RoomError}{
    return {ok:false,error:{code,message}};
}

function notYourTurn(){
    return denied("NOT_YOUR_TURN", "It is not your turn to act.")
}

function wrongPhase(){
    return denied("WRONG_PHASE","That action is not avaliable in the current phase")
}