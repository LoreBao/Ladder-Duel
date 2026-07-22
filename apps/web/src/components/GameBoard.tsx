import {useEffect,useMemo,useState} from "react"
import type{
    CardId,
    GameView,
    PlayerId,
    PlayerIntent,
    RoomSummary,
} from "@ladder-duel/shared";

interface GameBoardProps{
    connected: boolean;
    socketUrl:string;
    view:GameView;
    room: RoomSummary|null;
    errorMessage:string|null;
    onPlayerIntent(intent: PlayerIntent): void;
    onRestart(): void;
}

export function GameBoard({
    connected,
    socketUrl,
    view,
    room,
    errorMessage,
    onPlayerIntent,
    onRestart,
}: GameBoardProps){
    
}