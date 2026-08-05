import {useEffect,useState} from "react";
import {Link} from "react-router-dom";

const INCORRECT_HEADER="Small Games, Strage Ideas";
const CORRECTION_POINT="Small Games, Strag";
const CORRECT_HEADER="Small Games, Strange Ideas";

type TypewriterPhase=
    |"typing-incorrect"
    |"holding-incorrect"
    |"deleting"
    |"typing-correct"
    |"complete";

export default function HomePage(){
    return(
        <div className="home-page" id="top">
            <header className="home-nav">
                <a className="home-brand" href="#top" aria-label="Kevin home">
                    Kevin<span>.</span>
                </a>
                <a className="home-email-link" href="mailto:kevin.louis.1170@gmail.com">
                    kevin.louis.1170@gmail.com
                </a>
            </header>

            <main className="home-content">
                <SelfIntro/>
                <GameEntry/>
            </main>

            <Footer/>
        </div>
    )
}

function SelfIntro(){
    return(
        <section className="home-hero" aria-labelledby="home-title">
            <p className="home-kicker">Game developer / Creative coder</p>
            <TypewriterHeader/>
            <p className="home-intro">
                Hi, I&apos;m Kevin. I enjoy turning unusual ideas into playful,
                fast-moving games made to be shared with friends.
            </p>
            <div className="home-actions">
                <a className="home-action" href="#projects">Explore my games</a>
                <a className="home-action home-action-secondary" href="mailto:kevin.louis.1170@gmail.com">
                    Get in touch
                </a>
            </div>
        </section>
    )
}

function TypewriterHeader(){
    const [text,setText]=useState("");
    const [phase,setPhase]=useState<TypewriterPhase>("typing-incorrect");

    useEffect(()=>{
        if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
            setText(CORRECT_HEADER);
            setPhase("complete");
            return;
        }

        let nextText=text;
        let nextPhase=phase;
        let delay=70;

        if(phase==="typing-incorrect"){
            if(text.length<INCORRECT_HEADER.length){
                nextText=INCORRECT_HEADER.slice(0,text.length+1);
            }else{
                nextPhase="holding-incorrect";
                delay=160;
            }
        }else if(phase==="holding-incorrect"){
            nextPhase="deleting";
            delay=950;
        }else if(phase==="deleting"){
            if(text.length>CORRECTION_POINT.length){
                nextText=text.slice(0,-1);
                delay=48;
            }else{
                nextPhase="typing-correct";
                delay=220;
            }
        }else if(phase==="typing-correct"){
            if(text.length<CORRECT_HEADER.length){
                nextText=CORRECT_HEADER.slice(0,text.length+1);
                delay=76;
            }else{
                nextPhase="complete";
            }
        }else{
            return;
        }

        const timeoutId=window.setTimeout(()=>{
            setText(nextText);
            setPhase(nextPhase);
        },delay);

        return()=>window.clearTimeout(timeoutId);
    },[phase,text]);

    return(
        <h1
            className="typewriter-heading"
            id="home-title"
            aria-label={CORRECT_HEADER}
        >
            <span aria-hidden="true">{text}</span>
            <span
                className={`typewriter-cursor ${phase==="complete"?"typewriter-cursor-complete":""}`}
                aria-hidden="true"
            />
        </h1>
    )
}

function GameEntry(){
    return(
        <section className="home-projects" id="projects" aria-labelledby="projects-title">
            <div className="home-section-heading">
                <p className="home-kicker">Previous projects</p>
                <h2 id="projects-title">Games I&apos;ve built</h2>
            </div>

            <div className="project-grid">
                <Link
                    className="project-card project-card-ladder"
                    to="/play"
                    aria-label="Play Ladder Duel"
                >
                    <div className="project-card-topline">
                        <span className="project-number">01</span>
                        <span className="project-arrow" aria-hidden="true">{"\u2197"}</span>
                    </div>
                    <div>
                        <p className="project-type">Two-player strategy</p>
                        <h3>Ladder Duel</h3>
                        <p className="project-description">
                            A quick, intense head-to-head card game where every roll
                            can change who controls the climb.
                        </p>
                    </div>
                    <span className="project-cta">Enter the duel</span>
                </Link>

                <a
                    className="project-card project-card-jerry"
                    href={`${import.meta.env.BASE_URL}Click-Game-Project/index.html`}
                    aria-label="Play Jerry Game"
                >
                    <div className="project-card-topline">
                        <span className="project-number">02</span>
                        <span className="project-arrow" aria-hidden="true">{"\u2197"}</span>
                    </div>
                    <div>
                        <p className="project-type">Arcade clicker</p>
                        <h3>Jerry Game</h3>
                        <p className="project-description">
                            A strange, energetic clicker experiment packed with
                            escalating surprises.
                        </p>
                    </div>
                    <span className="project-cta">Start clicking</span>
                </a>
            </div>
        </section>
    )
}

function Footer(){
    return (
        <footer className="home-footer">
            <div>
                <p className="home-footer-name">Kevin</p>
                <p>Making weird ideas playable.</p>
            </div>
            <div className="home-footer-links">
                <a href="mailto:kevin.louis.1170@gmail.com">
                    kevin.louis.1170@gmail.com
                </a>
                <a href="https://github.com/LoreBao/Ladder-Duel">
                    GitHub
                </a>
            </div>
        </footer>
    )
}