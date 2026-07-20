import {GameBoard} from "../components/GameBoard";
import {RoomLobby} from "../components/RoomLobby";
import { useGameSocket } from "../socket/useGameSocket";
import "../styles/GamePage.css";

export default function GamePage(){
    const{
        connected,
        socketUrl,
        roomId,
        myPlayerId,
        room,
        gameView,
        errorMessage,
        createRoom,
        joinRoom,
        sendPlayerIntent,
        requestRestart,
    }=useGameSocket();

    if(!gameView){
        return(
            <RoomLobby
                connected={connected}
                socketUrl={socketUrl}
                roomId={roomId}
                myPlayerId={myPlayerId}
                room={room}
                errorMessage={errorMessage}
                onCreateRoom={createRoom}
                onJoinRoom={joinRoom}
            />
        )
    }
}
