import { useEffect,useRef } from "react";

interface LogPanelProps{
    log:string[];
}

export function LogPanel({log}: LogPanelProps){
    const logContainerRef=useRef<HTMLDivElement|null>(null)

    useEffect(()=>{
        const el=logContainerRef.current;
        if(!el) return;
        el.scrollTop=el.scrollHeight;
    },[log]);

    return(
        <section className="log-panel" aria-label="Game log">
            <h3>Game Log</h3>
            <div
                className="log-panel-content"
                ref={logContainerRef}
                role="log"
                aria-live="polite"
            >
                {log.length===0&&<div className="hint">No logs yet</div>}
                {log.map((msg,index)=>(
                    <div className="log-entry" key={`${msg}-${index}`}>{msg}</div>
                ))}
            </div>
        </section>
    )
}
