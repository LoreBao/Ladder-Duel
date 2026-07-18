import { useState } from "react";
import type { PlayerId, RoomSummary } from "@ladder-duel/shared";

interface RoomLobbyProps{
    connected: boolean;
    socketUrl:string;
    roomId:string|null;
    myPlayerId:PlayerId|null;
    room: RoomSummary|null;
    errorMessage:string|null;

    onCreateRoom(displayName?:string):void;
    onJoinRoom(roomId:string, displayName?: string):void;
}

export function RoomLobby({
    connected,
    socketUrl,
    roomId,
    myPlayerId,
    room,
    errorMessage,
    onCreateRoom,
    onJoinRoom
}:RoomLobbyProps){
    const [displayName,setDisplayName]=useState("");
    const [joinRoomId,setJoinRoomId]=useState("");

    return(
        <div className="game-page lobby-page">
            <main className="lobby-shell">
                <section className="panel lobby-panel">
                    <div className="lobby-head">
                        <div>
                            <h1>Ladder Duel LAN</h1>
                            <div className="socket-line">
                                Socket: <b>{connected?"connected":"disconnected"}</b>
                            </div>
                        </div>
                        <div className="socket-url">{socketUrl}</div>
                    </div>

                    <label className="field-label" htmlFor="display-name">
                        Displate Name
                    </label>
                    <input
                        id="display-name"
                        className="text-input"
                        value={displayName}
                        maxLength={24}
                        onChange={(event)=>setDisplayName(event.target.value)}
                        placeholder="optional"
                    />

                    <div className="lobby-actions">
                        <button
                        className="primary-btn"
                        disabled={!connected}
                        onClick={()=>onCreateRoom(displayName)} 
                        ></button>
                    </div>

                    {roomId&&(
                        <div className="room-ticket">
                            <span>Room</span>
                            <code>{roomId}</code>
                            {myPlayerId&&<span>{myPlayerId}</span>}
                        </div>
                    )}

                    <form
                        className="join-form"
                        onSubmit={(event)=>{
                            event.preventDefault();
                            onJoinRoom(joinRoomId,displayName)
                        }}>
                            <label className="field-label" htmlFor="room-id">
                                Join room
                            </label>
                            <div className="join-row">
                                <input
                                    id="room-id"
                                    className="text-input room-input"
                                    value={joinRoomId}
                                    maxLength={8}
                                    onChange={(event)=>
                                        setJoinRoomId(event.target.value.toUpperCase())
                                    }
                                    placeholder="ROOMID"
                                />
                                <button
                                    className="secondary-btn"
                                    disabled={!connected||joinRoomId.trim().length===0}
                                    type="submit"
                                >join</button>
                            </div>
                    </form>

                    {room&&(
                        <div className="room-status">
                            <div>Status:{room.status}</div>
                            <div>P1:{formatPlayer(room.players.P1)}</div>
                            <div>P2:{formatPlayer(room.players.P2)}</div>
                        </div>
                    )}
                </section>
            </main>
        </div>
    )
}















