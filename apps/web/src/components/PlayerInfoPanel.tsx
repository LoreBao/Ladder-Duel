import type {CardId, PlayerId} from "@ladder-duel/shared";

interface PlayerInfoPanelProps{
    playerId:PlayerId;
    displayName?:string;
    position: number;
    handCount:number;
    hand?: CardId[];
    connected?:boolean;
    isSelf:boolean;
}

export function PlayerInfoPanel({
    playerId,
    displayName,
    position,
    handCount,
    hand,
    connected,
    isSelf,
}: PlayerInfoPanelProps){
    return(
        <aside className="panel player-panel" id={playerId}>
            <div className="player-title-row">
                <h2>{playerId}</h2>
                <span className={connected===false? "status-offline":"status-online"}>
                    {connected===false?"offline":"online"}
                </span>
            </div>
        </aside>
    )
}

function renderHiddenCards(count:number){
    if(count===0) return <span className="hint">(empty)</span>;
    return Array.from({length:count}, (_,index)=>(
        <span className="card-back" key={index}/>
    ));
}