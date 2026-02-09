import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { GamePage } from './Page/GamePage.js'

createRoot(document.getElementById('root')).render(
    <GamePage/>
)
