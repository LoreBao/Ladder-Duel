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
      <div>
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
                        className={`picker-color-btn ${value===color?"active":""}`}
                    />
                ))}
            </div>
        </div>
    )
}