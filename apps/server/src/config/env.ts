import { partialDeepStrictEqual } from "assert";
import { off } from "process";
import { UnderlyingByteSource } from "stream/web";

export const SERVER_PORT=readPort(process.env.PORT, 3001);

export const SERVER_HOST= process.env.HOST ?? "0.0.0.0";
export const CORS_ORIGIN= process.env.CORS_ORIGIN ?? "*";

function readPort(value:string | undefined, fallback: number): number{
    if (!value) return fallback;
    const parsed = Number(value);
    if(!Number.isInteger(parsed)||parsed <=0|| parsed>65535){
        return fallback;
    }
    return parsed;
}
