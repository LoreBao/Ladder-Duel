import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { GamePage } from './Page/GamePage.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <GamePage/>
  </StrictMode>,
)
