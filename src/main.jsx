import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GoldAssistant from './GoldAssistant.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <GoldAssistant />
    </StrictMode>,
)
