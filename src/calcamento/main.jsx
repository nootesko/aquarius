import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Calcamento } from './Calcamento.jsx'
import '../index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Calcamento />
  </StrictMode>,
)
