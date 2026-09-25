/* =========================================================================
   CONTEÚDO E CONFIGURAÇÃO DA LANDING — Chapa Aquarius Sem Buracos
   Tudo que a chapa precisa editar está neste arquivo.
   Procure por "TROCAR" para achar rapidamente o que falta preencher.
   ========================================================================= */

export const config = {
  // número da chapa no formato internacional, só dígitos (55 + DDD + número)
  whatsappNumber: '5511998922945',
  whatsappMessage: 'Olá! Vim pelo site da chapa Aquarius Sem Buracos e quero falar com vocês.',

  // TROCAR: link de convite do grupo de WhatsApp dos moradores
  whatsappGroupUrl: 'https://chat.whatsapp.com/SEU-LINK-AQUI',

  // TROCAR: e-mail da chapa
  email: 'contato@aquariussemburacos.com.br',

  // TROCAR (opcional): endpoint do formulário (Formspree, Basin, Getform...).
  // Enquanto estiver vazio, o formulário abre o WhatsApp com a mensagem montada
  // e a denúncia anônima é enviada sem qualquer identificação.
  formEndpoint: '',

  // TROCAR: data da assembleia / eleição
  electionDate: '',
}

export const whatsappLink = `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(config.whatsappMessage)}`

export const nav = [
  { id: 'ruas', label: 'Ruas' },
  { id: 'propostas', label: 'Propostas' },
  { id: 'chapa', label: 'A chapa' },
  { id: 'contato', label: 'Contato' },
]

export const hero = {
  kicker: 'Fabi presidente · Latrofe vice',
  title: ['Aquarius', 'Sem Buracos'],
  rotating: ['nas ruas.', 'na segurança.', 'nas contas.', 'na transparência.'],
  rotatingPrefix: 'Sem buracos',
  primaryCta: 'Conheça nossas propostas',
  secondaryCta: 'Fale conosco',
}

/* Seção "Ruas" (antes da lista de propostas): o hoje e o amanhã do tema prioritário. */
export const solution = {
  overline: 'Prioridade',
  title: 'Ruas, pavimentação e drenagem.',
  before: 'Antes',
  after: 'Depois',
}

/* Ruas do Aquarius — antes/depois de cada uma, em ordem alfabética.
   Fotos em /public/assets/ruas/, recortadas em 16:10 (1440×900, WebP), no padrão
     <rua>-<n>-antes.webp  e  <rua>-<n>-depois.webp
   Rua com mais de uma foto ganha o seletor "Foto 1 · 2 · 3".
   Passe o total de fotos, ou a lista na ordem em que devem aparecer (ex.: [3, 1, 2]).
   Sem foto, aparece a ilustração. */
const fotos = (slug, ordem) =>
  (Array.isArray(ordem) ? ordem : Array.from({ length: ordem }, (_, i) => i + 1)).map((n) => ({
    before: `/assets/ruas/${slug}-${n}-antes.webp`,
    after: `/assets/ruas/${slug}-${n}-depois.webp`,
  }))

/* Rua que aparece primeiro no site: a Lázaro, com a foto da portaria. */
export const defaultStreet = 'Rua Lázaro Ferreira Pinto'

export const streets = [
  { name: 'Rua Acácio Antunes Pinto', photos: [] },
  { name: 'Rua Ademir Marques Charin', photos: [] },
  { name: 'Rua Antônio Gonçalves', photos: [] },
  { name: 'Rua Antônio Pereira Lameu', photos: [] },
  { name: 'Rua Benedita Maria de Jesus', photos: [] },
  { name: 'Rua Francisco Ferreira Pinto', photos: [] },
  { name: 'Rua Francisco Paulino Vicente', photos: fotos('francisco-paulino-vicente', 1) },
  { name: 'Rua João Adelino Pinto', photos: [] },
  { name: 'Rua José Aidano Leôncio de Sá', photos: [] },
  { name: 'Rua José de Oliveira Leite', photos: fotos('jose-de-oliveira-leite', 1) },
  { name: 'Rua Lázaro Ferreira Pinto', photos: fotos('lazaro-ferreira-pinto', [3, 1, 2]) }, // 3 = portaria,
  { name: 'Rua Nelson Caetano de Oliveira', photos: [] },
  { name: 'Rua Noel Infante', photos: fotos('noel-infante', 2) },
  { name: 'Rua Valentina Sales', photos: [] },
]

/* Propostas organizadas por tema (documento "Propostas organizadas por tema").
   Ruas vem primeiro por ser o eixo prioritário. cada item tem título e explicação
   (a explicação abre em sanfona ao tocar no item). */
export const proposals = [
  {
    id: 'ruas',
    tab: 'Ruas e drenagem',
    badge: 'Prioridade',
    title: 'Ruas, pavimentação e drenagem',
    items: [
      { title: 'Estudo técnico', text: 'Mapear ruas, prioridades e soluções mais adequadas para o residencial, considerando viabilidade técnica e financeira.' },
      { title: 'Parcerias e recursos', text: 'Buscar alternativas, apoios institucionais e caminhos para viabilizar a obra com responsabilidade.' },
      { title: 'Decisão em assembleia', text: 'Apresentar custos, etapas e opções para que os proprietários avaliem, escolham e aprovem em Assembleia.' },
      { title: 'Bloquetes e drenagem', text: 'Avaliar soluções com piso intertravado, drenagem e durabilidade para um resultado mais consistente.' },
    ],
  },
  {
    id: 'seguranca',
    tab: 'Segurança',
    title: 'Segurança e controle',
    items: [
      { title: 'Monitoramento solidário', text: 'Fortalecer a participação dos moradores, com redes de comunicação e apoio entre vizinhos.' },
      { title: 'Controle de visitantes', text: 'Adotar e aprimorar procedimentos para identificação e registro de visitantes.' },
      { title: 'Circulação de veículos', text: 'Revisar fluxos, sinalização e regras, buscando mais segurança e tranquilidade para todos.' },
      { title: 'Câmeras de segurança', text: 'Estudar implantação e ampliação, comparando alternativas técnicas e custos, com discussão do projeto em Assembleia.' },
    ],
  },
  {
    id: 'transparencia',
    tab: 'Transparência',
    title: 'Transparência, participação e governança',
    items: [
      { title: 'Gestão transparente e participativa', text: 'Promover acompanhamento das ações e decisões com participação dos proprietários.' },
      { title: 'Aplicativo de informações', text: 'Reunir informações financeiras, ações realizadas e outros dados relevantes para consulta e acompanhamento.' },
      { title: 'Estatuto e Regimento Interno', text: 'Propor atualização das regras para reforçar transparência, participação e procedimentos de governança.' },
      { title: 'Salvaguardas em decisões relevantes', text: 'Prever mecanismos de consulta e aprovação para decisões de maior impacto e gastos elevados.' },
    ],
  },
  {
    id: 'clube',
    tab: 'Clube e lazer',
    title: 'Clube, lazer, cultura e convivência',
    items: [
      { title: 'Hidro e bem-estar', text: 'Atividades leves e saudáveis para movimentar o corpo.' },
      { title: 'Esportes e lazer', text: 'Futebol, vôlei, tênis de mesa e outras atividades.' },
      { title: 'Jogos e convivência', text: 'Cartas, dominó, dama, xadrez e momentos de encontro.' },
      { title: 'Campeonatos', text: 'Eventos esportivos e recreativos para integração.' },
      { title: 'Literatura e cultura', text: 'Feiras de livros, leitura e atividades culturais.' },
      { title: 'Música e encontros', text: 'Apresentações, feiras e momentos especiais.' },
      { title: 'Festas sazonais', text: 'Julina, Natal, Páscoa, Halloween e outras celebrações.' },
      { title: 'Feiras e sabores', text: 'Artesanato, comidas típicas e valorização de talentos.' },
      { title: 'Família e fim de semana', text: 'Piscina, salão, lazer, descanso e integração entre gerações.' },
      { title: 'Salão do Clube', text: 'Estudo técnico de adequação do salão, com apoio especializado, para atender às necessidades da comunidade.' },
    ],
  },
  {
    id: 'natureza',
    tab: 'Podas e natureza',
    title: 'Natureza, podas e sustentabilidade',
    items: [
      { title: 'Recolhimento e destinação adequada', text: 'Organizar o fluxo das podas e buscar destinação apropriada.' },
      { title: 'Compostagem e parcerias', text: 'Avaliar compostagem e parcerias com órgãos públicos e instituições privadas.' },
      { title: 'Menos descarte irregular', text: 'Criar caminhos para reduzir descarte inadequado no residencial.' },
      { title: 'Mais limpeza e organização', text: 'Integrar a destinação das podas à manutenção e organização dos espaços.' },
    ],
  },
  {
    id: 'comunidade',
    tab: 'Comunidade',
    title: 'Comunidade e serviços',
    items: [
      { title: 'Pets e animais comunitários', text: 'Criar comissão dedicada aos animais comunitários do Aquarius, com critérios, ações e parcerias voltados ao bem-estar animal e à convivência harmoniosa.' },
      { title: 'Entrega de correspondências', text: 'Buscar, junto aos Correios, a viabilidade de entrega no residencial.' },
      { title: 'Participação dos proprietários', text: 'Manter decisões relevantes conectadas a informação, discussão e deliberação dos proprietários.' },
    ],
  },
]

export const changeCta = {
  title: 'Faça parte dessa mudança.',
  cta: 'Entrar no grupo dos moradores',
}

/* Quem compõe a chapa — formação e experiência da arte de apresentação. */
export const team = {
  overline: 'Quem compõe a chapa',
  title: 'Conheça melhor',
}

export const members = [
  {
    id: 'fabi',
    name: 'Fabi',
    role: 'Presidente',
    photo: '/assets/chapa/fabi',
    cv: [
      { label: 'Formação', text: 'Tecnologia e Administração de Empresas.' },
      { label: 'Pós-graduação', text: 'Gestão e Tecnologias Ambientais.' },
      {
        label: 'Experiência',
        text: 'Atuação na Marinha por 10 anos como Analista de Administração, com experiência em análise de contratos governamentais, análise de riscos e compras.',
      },
    ],
  },
  {
    id: 'latrofe',
    name: 'Latrofe',
    role: 'Vice-presidente',
    photo: '/assets/chapa/latrofe',
    cv: [
      { label: 'Formação', text: 'Administração de Empresas e Ciências Contábeis.' },
      { label: 'Pós-graduação', text: 'Administração e Marketing.' },
      {
        label: 'Experiência',
        text: 'Atuação na área de gestão comercial em empresas multinacionais e Conselheiro na Santa Casa de Sorocaba desde 2016 (nova gestão).',
      },
    ],
  },
]

export const contact = {
  overline: 'Contato',
  title: 'Fale com a chapa.',
  lead: 'Mande sua mensagem sem se identificar ou, se preferir, deixe nome, rua e telefone para receber retorno.',
}

export const closing = {
  title: 'Aquarius Sem Buracos',
  slogans: ['Sem buracos nas ruas.', 'Sem buracos na segurança.', 'Sem buracos nas contas.', 'Sem buracos na transparência.'],
  cta: 'Juntos somos mais fortes.',
}

/* Compromisso com a pavimentação — fecha o site e a página /ruas-novas. */
export const commitment = {
  overline: 'Nosso compromisso',
  title: 'Sem promessas vazias.',
  paragraphs: [
    'Com a nossa eleição, não podemos prometer que a pavimentação das ruas com blocos sextavados será feita de imediato, principalmente porque, ao que tudo indica, o condomínio não terá caixa disponível para uma obra desse porte.',
    'O que podemos garantir é diferente: essa será uma das nossas principais prioridades. Enquanto a atual administração já informou que não pretende avançar nesse sentido, nós vamos trabalhar incansavelmente para buscar alternativas, viabilizar recursos e encontrar uma forma responsável de tornar esse projeto possível.',
    'Não queremos fazer promessas vazias. Queremos assumir o compromisso de lutar pela pavimentação com planejamento, transparência e responsabilidade.',
  ],
}

/* Página /ruas-novas: o morador envia a foto da rua e recebe uma simulação com bloquete. */
export const simulator = {
  overline: 'Simulador',
  title: 'Veja a sua rua.',
  lead: 'Envie uma foto da sua rua e veja como ela ficaria sem terra e sem buracos.',
  tips: ['Foto na horizontal, de dia', 'Mostre bem o chão da rua', 'Sem pessoas em primeiro plano'],
  disclaimer: 'Imagem gerada por inteligência artificial, apenas ilustrativa. Não representa projeto técnico nem compromisso de obra.',
}
