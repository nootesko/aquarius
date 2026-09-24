/* =========================================================================
   CONTEÚDO E CONFIGURAÇÃO DA LANDING — Chapa Aquarius Sem Buracos
   Tudo que a chapa precisa editar está neste arquivo.
   Procure por "TROCAR" para achar rapidamente o que falta preencher.
   ========================================================================= */

export const config = {
  // TROCAR: número da chapa no formato internacional, só dígitos (55 + DDD + número)
  whatsappNumber: '5515999999999',
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
  overline: 'Tema prioritário',
  title: 'Ruas, pavimentação e drenagem.',
  before: 'Antes',
  after: 'Depois',
}

/* Ruas do Aquarius — antes/depois de cada uma, em ordem alfabética.
   Fotos em /public/assets/ruas/ (formato horizontal, de preferência 16:10):
     before: '/assets/ruas/francisco-ferreira-pinto-antes.jpg'
     after:  '/assets/ruas/francisco-ferreira-pinto-depois.jpg'
   Enquanto a foto for null, aparece a ilustração. */
export const streets = [
  { name: 'Rua Acácio Antunes Pinto', before: null, after: null },
  { name: 'Rua Ademir Marques Charin', before: null, after: null },
  { name: 'Rua Antônio Gonçalves', before: null, after: null },
  { name: 'Rua Antônio Pereira Lameu', before: null, after: null },
  { name: 'Rua Benedita Maria de Jesus', before: null, after: null },
  { name: 'Rua Francisco Ferreira Pinto', before: null, after: null },
  { name: 'Rua Francisco Paulino Vicente', before: null, after: null },
  { name: 'Rua João Adélino Pinto', before: null, after: null },
  { name: 'Rua José Aidano Leôncio de Sá', before: null, after: null },
  { name: 'Rua José de Oliveira Leite', before: null, after: null },
  { name: 'Rua Lázaro Ferreira Pinto', before: null, after: null },
  { name: 'Rua Nelson Caetano de Oliveira', before: null, after: null },
  { name: 'Rua Noel Infante', before: null, after: null },
  { name: 'Rua Valentina Sales', before: null, after: null },
]

/* Propostas organizadas por tema (documento "Propostas organizadas por tema").
   Ruas vem primeiro por ser o eixo prioritário. cada item tem título e explicação
   (a explicação abre em sanfona ao tocar no item). */
export const proposals = [
  {
    id: 'ruas',
    tab: 'Ruas e drenagem',
    badge: 'Tema prioritário',
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

/* Instagram — TROCAR: perfil da chapa e as últimas publicações.
   Cada item precisa de uma imagem em /public/assets/instagram/ e do link do post.
   Sem itens preenchidos, a seção mostra só o convite para seguir o perfil. */
export const instagram = {
  handle: '@chapaaquariussemburacos',
  url: 'https://instagram.com/chapaaquariussemburacos',
  overline: 'Acompanhe de perto',
  title: 'Últimas do Instagram',
  lead: 'O que a chapa está publicando, conversando e mostrando para os moradores.',
  posts: [
    // { id: 1, image: '/assets/instagram/post-1.jpg', caption: 'Legenda curta do post', url: 'https://instagram.com/p/XXXX' },
  ],
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
