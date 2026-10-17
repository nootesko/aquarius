import {
  Activity, BarChart3, Building2, CalendarCheck, ClipboardList, FileText, HardHat, History, Inbox, LayoutDashboard, Landmark, Megaphone,
  Settings as SettingsIcon, ShieldAlert, ShieldCheck, Siren, Trees, Users, Vote,
} from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { Shell } from '../ui/Shell.jsx'
import { Profile } from '../shared/Profile.jsx'
import { Overview } from './Overview.jsx'
import { People, Permissions, Units } from './Cadastros.jsx'
import { Areas, Reservations } from './Areas.jsx'
import { Activities, News, Votes } from './Comunicacao.jsx'
import { Documents, Finance, Works } from './Transparencia.jsx'
import { Alerts, Incidents, Requests, Visitors } from './Operacao.jsx'
import { AuditLog, Reports, Settings } from './Sistema.jsx'

/* Painel da administração (síndico, administradora e conselho). */

const PAGES = {
  inicio: Overview,
  unidades: Units,
  pessoas: People,
  permissoes: Permissions,
  areas: Areas,
  reservas: Reservations,
  comunicados: News,
  votacoes: Votes,
  atividades: Activities,
  documentos: Documents,
  financas: Finance,
  obras: Works,
  solicitacoes: Requests,
  visitantes: Visitors,
  ocorrencias: Incidents,
  alertas: Alerts,
  relatorios: Reports,
  historico: AuditLog,
  configuracoes: Settings,
  perfil: Profile,
}

export default function AdminApp({ parts }) {
  const { db } = useStore()
  const section = PAGES[parts[0]] ? parts[0] : 'inicio'
  const Page = PAGES[section]

  const pend = {
    pessoas: db.persons.filter((p) => p.status === 'pendente').length,
    reservas: db.reservations.filter((r) => r.status === 'pendente').length,
    solicitacoes: db.requests.filter((r) => r.status === 'recebida').length,
    alertas: db.alerts.filter((a) => a.status !== 'verificado').length,
    ocorrencias: db.incidents.filter((o) => o.status === 'aberta').length,
  }

  const groups = [
    { items: [{ id: 'inicio', label: 'Visão geral', short: 'Início', icon: LayoutDashboard }] },
    {
      label: 'Gestão',
      items: [
        { id: 'unidades', label: 'Unidades', icon: Building2 },
        { id: 'pessoas', label: 'Pessoas e moradores', short: 'Pessoas', icon: Users, badge: pend.pessoas },
        { id: 'areas', label: 'Áreas comuns e regras', short: 'Áreas', icon: Trees },
        { id: 'reservas', label: 'Reservas', icon: CalendarCheck, badge: pend.reservas },
      ],
    },
    {
      label: 'Comunicação',
      items: [
        { id: 'comunicados', label: 'Comunicados', icon: Megaphone },
        { id: 'votacoes', label: 'Votações', icon: Vote },
        { id: 'atividades', label: 'Atividades do clube', short: 'Atividades', icon: Activity },
      ],
    },
    {
      label: 'Transparência',
      items: [
        { id: 'financas', label: 'Finanças', icon: Landmark },
        { id: 'documentos', label: 'Documentos', icon: FileText },
        { id: 'obras', label: 'Obras e ações', short: 'Obras', icon: HardHat },
      ],
    },
    {
      label: 'Operação',
      items: [
        { id: 'solicitacoes', label: 'Solicitações', icon: Inbox, badge: pend.solicitacoes },
        { id: 'visitantes', label: 'Visitantes e acessos', short: 'Visitantes', icon: ShieldCheck },
        { id: 'ocorrencias', label: 'Ocorrências da portaria', short: 'Ocorrências', icon: ClipboardList, badge: pend.ocorrencias },
        { id: 'alertas', label: 'Denúncias', short: 'Denúncias', icon: Siren, badge: pend.alertas },
      ],
    },
    {
      label: 'Sistema',
      items: [
        { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
        { id: 'permissoes', label: 'Usuários e permissões', short: 'Permissões', icon: ShieldAlert },
        { id: 'historico', label: 'Histórico de ações', short: 'Histórico', icon: History },
        { id: 'configuracoes', label: 'Configurações', icon: SettingsIcon },
      ],
    },
  ]

  return (
    <Shell panel="admin" groups={groups} active={section} mobileTabs={['inicio', 'reservas', 'solicitacoes', 'votacoes']}>
      <Page id={parts[1]} key={`${section}/${parts[1] ?? ''}`} />
    </Shell>
  )
}
