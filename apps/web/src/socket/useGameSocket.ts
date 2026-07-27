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
    const [roomId,setRoomId]=useState<string|null>(null);
    const [myPlayerId,setMyPlayerId]=useState<PlayerId|null>(null);

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
        socket.on("room_created", (payload)=>{
            setRoomId(payload.roomId);
        })
        socket.on("room_joined",(payload:ServerPayload<"room_joined">)=>{
            setRoomId(payload.roomId);
            setRoom(payload.room);
        })

        socket.on("player_assigned", (payload)=>{
            setRoomId(payload.roomId);
            setMyPlayerId(payload.playerId);
        });

        socket.on(
            "game_state_updated",
            (payload: ServerPayload<"game_state_updated">)=>{
                setRoomId(payload.roomId);
                setRoom(payload.room);
                setGameView(payload.view);
                setErrorMessage(null);
            }
        )

        socket.on("player_disconnected",(payload)=>{
            setErrorMessage(`${payload.playerId} disconnected.`)
        })

        socket.on("error_message", (payload:ServerPayload<"error_message">)=>{
            setErrorMessage(`${payload.code}: ${payload.message}`); 
        })

        return ()=>{
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off("room_created");
            socket.off("room_joined");
            socket.off("player_assigned");
            socket.off("game_state_updated");
            socket.off("player_disconnected");
            socket.off("error_message");        
        };
    },[])

    const createRoom=useCallback((displayName?:string)=>{
        setErrorMessage(null);
        setGameView(null);
        socket.emit("create_room", {displayName: cleanOptional(displayName)})
    },[])

    const joinRoom=useCallback((nextRoomId:string,displayName?:string)=>{
        setErrorMessage(null)
        setGameView(null);
        socket.emit("join_room",{
            roomId:nextRoomId.trim().toUpperCase(),
            displayName: cleanOptional(displayName),
        })},[])
    
    const sendPlayerIntent=useCallback(
        (intent:PlayerIntent)=>{
            const targetRoomId=gameView?.roomId??roomId;
            if(!targetRoomId){
                setErrorMessage("Join a Room Before Sending Actions")
                return;
            }
            socket.emit("player_action", {roomId:targetRoomId, intent});
        },
        [gameView?.roomId, roomId]
    )

    const requestRestart=useCallback(()=>{
        const targetRoomId=gameView?.roomId??roomId;
        if(!targetRoomId){
            setErrorMessage("Join a room before restarting.")
            return;
        }
        socket.emit("request_restart",{roomId:targetRoomId});
    },[gameView?.roomId, roomId]);

    return{
        connected,
        socketUrl:SOCKET_URL,
        roomId,
        myPlayerId,
        room,
        gameView,
        errorMessage,
        createRoom,
        joinRoom,
        sendPlayerIntent,
        requestRestart,
    };
}




function cleanOptional(value:string|undefined): string|undefined{
    const cleaned=value?.trim();
    return cleaned?cleaned:undefined;
}