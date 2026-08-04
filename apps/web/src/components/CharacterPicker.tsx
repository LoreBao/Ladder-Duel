import type { PlayerId } from "@ladder-duel/shared";

export type PlayerColor="red"|"blue";

const COLOR_OPTIONS: PlayerColor[]=["red","blue"]

interface CharacterPickerProps{
    open:boolean
    value: Record<PlayerId,PlayerColor>;
    onChange(player:PlayerId, color:PlayerColor):void;
    onClose(): void;
}

export function CharacterPicker({
    open,
    value,
    onChange,
    onClose,
}:CharacterPickerProps){
    if(!open) return null;

    return(
        <div
            className="panel picker-popover"
            id="character-picker"
            role="dialog"
            aria-label="Character color picker"
        >
            <div className="picker-head">
                <h4>Egg Colors</h4>
                <button className="picker-close" type="button" onClick={onClose}>
                    Close
                </button>
            </div>

            {(["P1","P2"] as PlayerId[]).map((playerId)=>(
                <ColorRow
                    key={playerId}
                    playerId={playerId}
                    value={value[playerId]}
                    onChange={onChange}
                />
            ))}
        </div>
    );
}

function ColorRow({
    playerId,
    value,
    onChange,
}:{
    playerId:PlayerId;
    value:PlayerColor;
    onChange(player:PlayerId,color:PlayerColor):void;
}){
    return(
        <div className="picker-player-row">
            <div className="picker-player-label">{playerId}</div>
            <div className="picker-color-group">
                {COLOR_OPTIONS.map((color)=>(
                    <button
                        key={`${playerId}-${color}`}
                        className={`picker-color-btn picker-color-btn-${color} ${value===color?"active":""}`}
                        type="button"
                        aria-pressed={value===color}
                        onClick={()=>onChange(playerId,color)}
                    >
                        {color}
                    </button>
                ))}
            </div>
        </div>
    )
}
