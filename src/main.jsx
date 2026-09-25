import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

/* /apresentacao e /ruas-novas sem a barra final caem no site; manda para a página certa. */
if (/^\/apresenta(c|ç|%C3%A7)(a|ã|%C3%A3)o\/?$/i.test(window.location.pathname)) {
  window.location.replace('/apresentacao/' + window.location.hash)
}
if (/^\/ruas-novas$/i.test(window.location.pathname)) {
  window.location.replace('/ruas-novas/' + window.location.hash)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
