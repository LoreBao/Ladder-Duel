import {Routes, Route, HashRouter} from "react-router-dom";
import './App.css'
import GamePage  from './Page/GamePage'
import HomePage from "./Page/HomePage";


function App() {


  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<HomePage/>}/>       
        <Route path="/play" element={<GamePage/>}/>
      </Routes>
    </HashRouter>
  )
}

export default App
