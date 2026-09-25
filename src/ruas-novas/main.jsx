import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RuasNovas } from './RuasNovas.jsx'
import '../index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RuasNovas />
  </StrictMode>,
)
