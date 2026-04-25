import {Link} from "react-router-dom";

export default function HomePage(){
    return(
        <section>
            <SelfIntro/>
            <GameEntry/>
            <Footer/>
        </section>
    )
}

function Footer(){
    return (
        <>
        <div id="footer">
            <h6>Share your ideas with me here!</h6>
            <p>Link: https://github.com/LoreBao/Ladder-Duel</p>
            <p>Email: frajola484@gmail.com</p>
        </div>
        </>

    )
}

function SelfIntro(){
    return(
        <section>
        <div id="si">
            <h3>Hello! I'm Kevin</h3>
            <p>These are my two pretty weird games I made, I love making strange ideas into reality</p>
        </div>
        </section>
    )
}

function GameEntry(){
    return(
        <section>
            <div id="ladder">
                <p>Quick, Intense Two Player Game!</p>
                <Link to="/play">
                    Ladder Duel 
                </Link>

            </div>

            <div id="clicker">
                <a href="./Click-Game-Project/index.html">
                    Jerry Game
                </a>
            </div>
        </section>
    )
}