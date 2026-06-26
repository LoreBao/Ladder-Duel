import {io, type Socket} from "socket.io-client";
import type{
    ClientToServerEvents,
    ServerToClientEvents,
} from "@ladder-duel/shared"

const fallbackSocketUrl=`${window.location.protocol}//${window.location.hostname}:3001`;

export const SOCKET_URL=
    import.meta.env.VITE_SOCKET_URL?.trim()||fallbackSocketUrl;

export const socket: Socket<ServerToClientEvents,ClientToServerEvents>=io(
    SOCKET_URL,
    {
        autoConnect:true,
    },
)