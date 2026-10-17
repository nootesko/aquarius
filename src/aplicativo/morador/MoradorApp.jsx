import {
  Barcode, CalendarCheck2, CalendarDays, Construction, Dog, Home, KeyRound, Landmark, LayoutDashboard, Megaphone,
  MessageSquareWarning, Phone, Siren, Trophy, Vote,
} from 'lucide-react'
import { useStore } from '../lib/store.jsx'
import { today } from '../lib/format.js'
import { Shell } from '../ui/Shell.jsx'
import { Profile } from '../shared/Profile.jsx'
import { Inicio } from './Inicio.jsx'
import { Agenda } from './Agenda.jsx'
import { MinhaUnidade } from './MinhaUnidade.jsx'
import { Reservas } from './Reservas.jsx'
import { Comunicados } from './Comunicados.jsx'
import { Votacoes } from './Votacoes.jsx'
import { Autorizacoes } from './Autorizacoes.jsx'
import { Transparencia } from './Transparencia.jsx'
import { Obras } from './Obras.jsx'
import { Solicitacoes } from './Solicitacoes.jsx'
import { Contatos, Pets, Seguranca } from './Comunidade.jsx'
import { Clubes } from './Clubes.jsx'
import { Boletos } from './Boletos.jsx'

const PAGES = {
  inicio: Inicio,
  agenda: Agenda,
  unidade: MinhaUnidade,
  reservas: Reservas,
  comunicados: Comunicados,
  votacoes: Votacoes,
  autorizacoes: Autorizacoes,
  atividades: Clubes,
  boletos: Boletos,
  transparencia: Transparencia,
  obras: Obras,
  solicitacoes: Solicitacoes,
  seguranca: Seguranca,
  pets: Pets,
  contatos: Contatos,
  perfil: Profile,
}

export default function MoradorApp({ parts }) {
  const { db, user } = useStore()
  const section = PAGES[parts[0]] ? parts[0] : 'inicio'
  const Page = PAGES[section]

  const unread = db.news.filter((n) => n.status === 'publicado' && !n.leituras.includes(user.id) && new Date(n.data) > new Date(Date.now() - 7 * 864e5)).length
  const openVotes = db.votes.filter((v) => v.status === 'aberta' && !v.votos.some((x) => (v.votoPor === 'unidade' ? x.unitId === user.unitId : x.personId === user.id))).length
  const myReq = db.requests.filter((r) => r.personId === user.id && r.status !== 'resolvida' && r.status !== 'encerrada').length
  const boletosAbertos = db.boletos.filter((b) => b.unitId === user.unitId && b.status !== 'pago').length
  const todayRes = db.reservations.filter((r) => r.unitId === user.unitId && r.data >= today() && r.status !== 'cancelada').length

  const groups = [
    {
      items: [
        { id: 'inicio', label: 'Início', icon: LayoutDashboard },
        { id: 'agenda', label: 'Agenda da semana', short: 'Agenda', icon: CalendarDays },
      ],
    },
    {
      label: 'Minha casa',
      items: [
        { id: 'unidade', label: 'Minha casa', icon: Home },
        { id: 'boletos', label: 'Boletos', icon: Barcode, badge: boletosAbertos },
        { id: 'autorizacoes', label: 'Visitantes e acessos', short: 'Visitas', icon: KeyRound },
      ],
    },
    {
      label: 'Condomínio',
      items: [
        { id: 'reservas', label: 'Reservas', icon: CalendarCheck2, badge: todayRes },
        { id: 'comunicados', label: 'Comunicados', short: 'Avisos', icon: Megaphone, badge: unread },
        { id: 'votacoes', label: 'Votações', icon: Vote, badge: openVotes },
        { id: 'atividades', label: 'Clubes', icon: Trophy },
      ],
    },
    {
      label: 'Transparência',
      items: [
        { id: 'transparencia', label: 'Prestação de contas', icon: Landmark },
        { id: 'obras', label: 'Andamento de obras', short: 'Obras', icon: Construction },
      ],
    },
    {
      label: 'Fale com a gente',
      items: [
        { id: 'solicitacoes', label: 'Solicitações', short: 'Pedidos', icon: MessageSquareWarning, badge: myReq },
        { id: 'seguranca', label: 'Denúncia', icon: Siren },
        { id: 'pets', label: 'Pets e animais', icon: Dog },
        { id: 'contatos', label: 'Contatos úteis', icon: Phone },
      ],
    },
  ]

  return (
    <Shell panel="morador" groups={groups} active={section} mobileTabs={['inicio', 'reservas', 'autorizacoes', 'votacoes']}>
      <Page parts={parts.slice(1)} />
    </Shell>
  )
}

