import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* /apresentacao sem a barra final cai no site; manda para a página da apresentação. */
if (/^\/apresenta(c|ç|%C3%A7)(a|ã|%C3%A3)o\/?$/i.test(window.location.pathname)) {
  window.location.replace('/apresentacao/' + window.location.hash)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
