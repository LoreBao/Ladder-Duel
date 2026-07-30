import express from "express";
import type { Request, Response } from "express";
import { Server } from "socket.io"

import http, { ServerResponse } from "node:http";

import{
    ClientToServerEvents,
    ServerToClientEvents,
} from "@ladder-duel/shared";

import { CORS_ORIGIN,SERVER_HOST,SERVER_PORT } from "./config/env";
import { registerSocketHandlers } from "./socket/registerSocketHandler";


const app = express();

app.get("/health", (_req: Request, res: Response)=>{
    res.json({ ok: true })
});

const httpServer= http.createServer(app);

const io = new Server<ClientToServerEvents,ServerToClientEvents>(httpServer,{
    cors:{
        origin: CORS_ORIGIN,
    },
});

registerSocketHandlers(io);

httpServer.listen(SERVER_PORT,SERVER_HOST,()=>{
    console.log(`Server listening on http://${SERVER_HOST}:${SERVER_PORT}`);
})  





