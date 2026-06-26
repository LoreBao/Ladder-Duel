import { useCallback,useState,useEffect, use } from "react";
import { socket, SOCKET_URL} from "./socket.io-client";
import type{
    GameView,
    PlayerId,
    PlayerIntent,
    RoomSummary,
    ServerToClientEvents,
} from "@ladder-duel/shared"


export function useGameSocket(){
    const [connected,setConnected]=useState(socket.connected);
    const [errorMessage,setErrorMessage]=useState<string|null>(null);
    const [gameView,setGameView]=useState<GameView|null>(null);
    const [room,setRoom]=useState<RoomSummary|null>(null)

    useEffect(()=>{
        const handleConnect =()=>{
            setConnected(true);
            setErrorMessage(null);
        };

        const handleDisconnect=()=>{
            setConnected(false);
            setErrorMessage("Socket Disconnected.");
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        return ()=>{
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
        };
    },[])

    const createRoom=useCallback((displayName?:string)=>{
        setError
    })
}