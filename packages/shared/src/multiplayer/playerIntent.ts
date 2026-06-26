import type { CardId, MultiplierPayload, SetRollPayload } from "../types";

export type PlayerIntent=
    | {type:"PLAY_CARD"; cardId: "SET_ROLL"; payload:SetRollPayload}
    | {type:"PLAY_CARD"; cardId: "MULTIPLIER"; payload:MultiplierPayload}
    | {type:"PLAY_CARD"; cardId: Exclude<CardId, "SET_ROLL" | "MULTIPLIER">; payload?: undefined}
    | {type:"SKIP_CARD"}
    | {type:"ROLL_DICE"}
    | {type:"RESOLVE_ROLL"}
    | {type:"DRAW_CARD"}
    | {type:"DISCARD_CARD";cardId: CardId}
    | {type:"END_TURN"}
