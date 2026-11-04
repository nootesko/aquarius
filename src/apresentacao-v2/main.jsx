import '../analytics.js'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { PresentationV2 } from './PresentationV2.jsx'
import '../index.css'
import '../apresentacao/presentation.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PresentationV2 />
  </StrictMode>,
)
