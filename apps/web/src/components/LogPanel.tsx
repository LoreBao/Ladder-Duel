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
        <section className="log-panel">
            <h3>Log</h3>
            <div className="log-panel-content" ref={logContainerRef}>
                {log.length===0&&<div className="hint">No logs yet</div>}
                {log.map((msg,index)=>(
                    <div key={`${msg}-${index}`}>{msg}</div>
                ))}
            </div>
        </section>
    )
}

