import { ClipboardList, DoorOpen, LayoutDashboard, PartyPopper, ScanSearch, Siren, UserPlus, Users } from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { Shell } from '../ui/Shell.jsx'
import { Profile } from '../shared/Profile.jsx'
import { validToday } from './helpers.js'
import { Inicio } from './Inicio.jsx'
import { Consultar, Detalhe } from './Autorizacoes.jsx'
import { Acessos, Eventos, SemAutorizacao } from './Acessos.jsx'
import { Moradores } from './Moradores.jsx'
import { Alertas, Ocorrencias } from './Ocorrencias.jsx'

export default function PortariaApp({ parts }) {
  const { db } = useStore()
  const [section = 'inicio', id] = parts

  const previstas = db.authorizations.filter(validToday).length
  const alertas = db.alerts.filter((a) => a.status !== 'verificado').length
  const ocorrencias = db.incidents.filter((o) => o.status === 'aberta').length

  const groups = [
    {
      items: [
        { id: 'inicio', label: 'Entradas previstas', short: 'Hoje', icon: LayoutDashboard, badge: previstas },
        { id: 'autorizacoes', label: 'Consultar autorização', short: 'Consultar', icon: ScanSearch },
        { id: 'sem-autorizacao', label: 'Visitante sem autorização', short: 'Avulso', icon: UserPlus },
        { id: 'acessos', label: 'Registro de acessos', short: 'Acessos', icon: DoorOpen },
      ],
    },
    {
      label: 'Consultas',
      items: [
        { id: 'eventos', label: 'Listas de eventos', icon: PartyPopper },
        { id: 'moradores', label: 'Moradores', icon: Users },
      ],
    },
    {
      label: 'Registros',
      items: [
        { id: 'ocorrencias', label: 'Ocorrências', icon: ClipboardList, badge: ocorrencias },
        { id: 'alertas', label: 'Denúncias', icon: Siren, badge: alertas },
      ],
    },
  ]

  const screens = {
    inicio: <Inicio />,
    autorizacoes: id ? <Detalhe id={id} /> : <Consultar />,
    'sem-autorizacao': <SemAutorizacao />,
    acessos: <Acessos />,
    eventos: <Eventos />,
    moradores: <Moradores />,
    ocorrencias: <Ocorrencias />,
    alertas: <Alertas />,
    perfil: <Profile />,
  }

  return (
    <Shell panel="portaria" groups={groups} active={section} mobileTabs={['inicio', 'autorizacoes', 'sem-autorizacao', 'acessos']}>
      {screens[section] ?? <Inicio />}
    </Shell>
  )
}

