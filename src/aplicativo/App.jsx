import { useEffect, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import { useStore } from './lib/store.jsx'
import { go, useRoute } from './lib/router.js'
import { Login } from './shared/Login.jsx'
import { Splash } from './shared/Splash.jsx'
import { Toaster } from './ui/kit.jsx'
import MoradorApp from './morador/MoradorApp.jsx'
import AdminApp from './admin/AdminApp.jsx'
import PortariaApp from './portaria/PortariaApp.jsx'

const PANELS = { morador: MoradorApp, admin: AdminApp, portaria: PortariaApp }

/* Cada painel recebe o resto da rota: #/admin/solicitacoes/s4 → parts = ['solicitacoes', 's4'] */
export function App() {
  const { user } = useStore()
  const [panel, ...parts] = useRoute()
  const [splash, setSplash] = useState(false)

  /* Ao entrar (ou abrir o app já logado), mostra o logo da chapa enquanto o painel carrega */
  useEffect(() => {
    if (!user) return
    setSplash(true)
    const id = setTimeout(() => setSplash(false), 1700)
    return () => clearTimeout(id)
  }, [user?.login]) // eslint-disable-line react-hooks/exhaustive-deps

  /* Sem login vai para a tela de acesso; logado, só entra no próprio painel */
  useEffect(() => {
    if (user && panel !== user.role) go(user.role)
    if (!user && panel) go('')
  }, [user, panel])

  const Panel = user && panel === user.role ? PANELS[panel] : null

  return (
    <>
      {Panel ? <Panel parts={parts} /> : !user && <Login />}
      <AnimatePresence>{splash && <Splash />}</AnimatePresence>
      <Toaster />
    </>
  )
}
