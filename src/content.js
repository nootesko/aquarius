/* =========================================================================
   CONTEÚDO E CONFIGURAÇÃO DA LANDING — Chapa Aquarius Sem Buracos
   Tudo que a chapa precisa editar está neste arquivo.
   Procure por "TROCAR" para achar rapidamente o que falta preencher.
   ========================================================================= */

export const config = {
  // número da chapa no formato internacional, só dígitos (55 + DDD + número)
  whatsappNumber: '5511998922945',
  whatsappMessage: 'Olá! Vim pelo site da chapa Aquarius Sem Buracos e quero falar com vocês.',

  whatsappGroupUrl: 'https://chat.whatsapp.com/L13q2ucPIwYCIccXUwcL9y',

  // TROCAR: e-mail da chapa
  email: 'contato@aquariussemburacos.com.br',

  // TROCAR: data da assembleia / eleição
  electionDate: '',
}

/* Todos os botões de WhatsApp do site levam ao grupo dos moradores. */
export const whatsappLink = config.whatsappGroupUrl

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
      { title: 'Estudo técnico', text: 'Mapear todas as ruas, definir prioridades e escolher as soluções mais adequadas, com viabilidade técnica e financeira.' },
      { title: 'Parcerias e recursos', text: 'Correr atrás de alternativas, apoios institucionais e recursos para viabilizar a obra com responsabilidade.' },
      { title: 'Decisão em assembleia', text: 'Apresentar custos, etapas e opções para os proprietários escolherem e aprovarem em Assembleia.' },
      { title: 'Bloquetes e drenagem', text: 'Definir a melhor solução de piso intertravado com drenagem, feita para durar.' },
    ],
  },
  {
    id: 'seguranca',
    tab: 'Segurança',
    title: 'Segurança e controle',
    items: [
      { title: 'Monitoramento solidário', text: 'Fortalecer a rede entre vizinhos, com comunicação rápida e apoio de todos.' },
      { title: 'Controle de visitantes', text: 'Adotar procedimentos mais rigorosos para identificar e registrar visitantes.' },
      { title: 'Circulação de veículos', text: 'Revisar fluxos, sinalização e regras para trazer mais segurança e tranquilidade a todos.' },
      { title: 'Câmeras de segurança', text: 'Levar à Assembleia o projeto de implantação e ampliação das câmeras, com alternativas técnicas e custos comparados.' },
    ],
  },
  {
    id: 'transparencia',
    tab: 'Transparência',
    title: 'Transparência, participação e governança',
    items: [
      { title: 'Gestão transparente e participativa', text: 'Prestar contas de todas as ações e decisões, com participação dos proprietários.' },
      { title: 'Aplicativo de informações', text: 'Colocar num aplicativo as informações financeiras, as ações realizadas e os dados relevantes, para consulta a qualquer hora.' },
      { title: 'Estatuto e Regimento Interno', text: 'Levar à Assembleia a atualização das regras, reforçando transparência, participação e governança.' },
      { title: 'Salvaguardas em decisões relevantes', text: 'Garantir consulta e aprovação dos proprietários nas decisões de maior impacto e nos gastos elevados.' },
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
      { title: 'Salão do Clube', text: 'Adequar o salão com estudo técnico e apoio especializado, para atender às necessidades da comunidade.' },
    ],
  },
  {
    id: 'natureza',
    tab: 'Podas e natureza',
    title: 'Natureza, podas e sustentabilidade',
    items: [
      { title: 'Recolhimento e destinação adequada', text: 'Organizar o fluxo das podas e dar a destinação correta.' },
      { title: 'Compostagem e parcerias', text: 'Colocar a compostagem em prática, com parcerias com órgãos públicos e instituições privadas.' },
      { title: 'Menos descarte irregular', text: 'Combater o descarte irregular no residencial.' },
      { title: 'Mais limpeza e organização', text: 'Integrar a destinação das podas à manutenção, com espaços mais limpos e organizados.' },
    ],
  },
  {
    id: 'comunidade',
    tab: 'Comunidade',
    title: 'Comunidade e serviços',
    items: [
      { title: 'Pets e animais comunitários', text: 'Criar comissão dedicada aos animais comunitários do Aquarius, com critérios, ações e parcerias voltados ao bem-estar animal e à convivência harmoniosa.' },
      { title: 'Entrega de correspondências', text: 'Levar aos Correios o pedido de entrega no residencial e acompanhar até a solução.' },
      { title: 'Participação dos proprietários', text: 'Garantir que as decisões relevantes passem por informação, discussão e deliberação dos proprietários.' },
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
  lead: 'Entre no nosso grupo do WhatsApp para conversar com a chapa e acompanhar as novidades.',
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

/* =========================================================================
   APRESENTAÇÃO V2 (/apresentacao-v2) — propostas de gestão reescritas,
   a partir das artes "Propostas de gestão" da chapa.
   Fotos reais só das ruas e da chapa; os demais slides usam ícones, como nas artes.
   ========================================================================= */
export const v2 = {
  overview: {
    overline: 'Propostas de gestão',
    title: 'Vamos construir novos caminhos juntos.',
    lead: 'Experiência para administrar. Compromisso para transformar.',
  },

  /* Os valores que aparecem no rodapé de todas as artes. */
  values: ['Natureza', 'Qualidade de vida', 'Transparência', 'Participação'],

  /* As oito propostas, na ordem das artes. `slide` é o id do slide de cada uma. */
  proposals: [
    { n: 1, icon: 'road', title: 'Pavimentação', text: 'Projetos técnica e financeiramente viáveis, com parcerias e aprovação em Assembleia.' },
    { n: 2, icon: 'shield', title: 'Segurança', text: 'Monitoramento solidário, controle de visitantes e de veículos e estudo de câmeras.' },
    { n: 3, icon: 'people', title: 'Transparência e gestão participativa', text: 'Aplicativo com as contas, as ações e as decisões, aberto a todos os proprietários.' },
    { n: 4, icon: 'building', title: 'Salão do Clube', text: 'Estudo técnico de adequação, com engenheiro especialista da própria chapa.' },
    { n: 5, icon: 'leaf', title: 'Destinação das podas', text: 'Coleta própria e compostagem, para reduzir de 80% a 90% o custo do morador.' },
    { n: 6, icon: 'doc', title: 'Estatuto e Regimento Interno', text: 'Regras atualizadas, com salvaguardas contra concentração de poder e gastos sem aprovação.' },
    { n: 7, icon: 'paw', title: 'Pets e animais comunitários', text: 'Comissão dedicada ao bem-estar animal e à boa convivência.' },
    { n: 8, icon: 'mail', title: 'Entrega de correspondências', text: 'Buscar, junto aos Correios, a entrega dentro do residencial.' },
  ],

  paving: {
    title: 'Pavimentação',
    subtitle: 'Planejamento antes de gastar.',
    steps: [
      { icon: 'road', title: 'Estudar alternativas', text: 'Soluções técnica e financeiramente viáveis para as nossas ruas, com prioridades definidas.' },
      { icon: 'handshake', title: 'Buscar parcerias', text: 'Apoios institucionais e recursos para viabilizar a obra sem sufocar o caixa.' },
      { icon: 'people', title: 'Decidir em Assembleia', text: 'Levar as opções, com custos e etapas, para a escolha e a aprovação dos proprietários.' },
    ],
    banner: ['Sem promessas vazias.', 'Com responsabilidade.'],
  },

  security: {
    title: 'Segurança',
    subtitle: 'Mais controle, mais prevenção.',
    lead: 'Um Aquarius mais seguro para você e a sua família.',
    items: [
      { icon: 'people', title: 'Monitoramento solidário', text: 'Redes de comunicação e apoio entre vizinhos, com a participação dos moradores.' },
      { icon: 'badge', title: 'Controle de visitantes', text: 'Procedimentos melhores para identificar e registrar quem entra.' },
      { icon: 'car', title: 'Circulação de veículos', text: 'Revisão de fluxos, sinalização e regras, para mais tranquilidade.' },
      { icon: 'camera', title: 'Câmeras de segurança', text: 'Estudo para implantar e ampliar as câmeras, com alternativas e custos discutidos em Assembleia.' },
    ],
    footer: 'Segurança com participação dos proprietários.',
  },

  transparency: {
    title: 'Transparência e gestão participativa',
    subtitle: 'Informação para todos.',
    items: [
      { icon: 'chart', title: 'Aplicativo com as contas', text: 'Receitas, despesas e balancetes na palma da mão, a qualquer hora.' },
      { icon: 'chat', title: 'Acompanhamento das ações', text: 'Obras, decisões e comunicados registrados, para todos acompanharem.' },
      { icon: 'check', title: 'Prestação de contas', text: 'Gestão participativa, com os proprietários informados e ouvidos.' },
    ],
    banner: ['Transparência não é favor.', 'É compromisso.'],
    appUrl: 'https://aquariussemburacos.com.br/aplicativo/',
    appLabel: 'aquariussemburacos.com.br/aplicativo',
  },

  hall: {
    title: 'Salão do Clube',
    subtitle: 'Adequar com estudo técnico, não no improviso.',
    text: 'Realizar um estudo técnico de adequação do Salão do Clube, com o apoio de um engenheiro especialista que integra a chapa, buscando soluções que atendam de verdade às necessidades da comunidade.',
    points: ['Diagnóstico do espaço como ele está hoje', 'Soluções e custos apresentados aos proprietários', 'Um salão pronto para festas, encontros e atividades'],
  },

  pruning: {
    title: 'Chega de pagar R$ 350 pela retirada de podas',
    goal: 'Reduzir de 80% a 90% esse custo, com coleta própria e compostagem no Aquarius.',
    problem: [
      'Hoje muitos moradores pagam cerca de R$ 350 por cada retirada de podas.',
      'As podas saem da casa do morador, mas continuam dentro do próprio Aquarius, sem um projeto coletivo.',
      'Resultado: custo alto para o morador e pouco retorno para o residencial.',
    ],
    proposal: [
      'O próprio Aquarius organiza a coleta das podas.',
      'O material vai para uma área de compostagem organizada.',
      'O custo para o morador pode cair de forma drástica.',
    ],
    flow: [
      { title: 'Morador solicita', text: 'Pede a retirada pelo aplicativo ou na administração.' },
      { title: 'Equipe recolhe', text: 'A equipe do Aquarius busca a poda na porta.' },
      { title: 'Compostagem', text: 'O material vai para a área de compostagem.' },
      { title: 'Vira adubo', text: 'O composto volta para jardins e áreas verdes.' },
    ],
    gains: [
      'Menos gasto para o morador',
      'Destino inteligente para as podas',
      'Mais organização interna',
      'Composto para jardins e áreas verdes',
      'Parcerias com órgãos públicos e instituições',
    ],
    banner: ['Podas não precisam ser um custo abusivo.', 'Com gestão, podem virar solução.'],
  },

  bylaws: {
    title: 'Estatuto e Regimento Interno',
    subtitle: 'Regras claras protegem todos.',
    text: 'Propor a atualização do Estatuto e do Regimento Interno, fortalecendo a transparência e a participação dos proprietários.',
    points: [
      { title: 'Contra a concentração de poder', text: 'Decisões relevantes não ficam nas mãos de poucos.' },
      { title: 'Contra gastos sem consulta', text: 'Despesas elevadas só com discussão e aprovação da Assembleia.' },
      { title: 'Mais participação', text: 'Regras que garantem informação e voz para cada proprietário.' },
    ],
  },

  pets: {
    title: 'Pets e animais comunitários',
    subtitle: 'Cuidado com quem também mora aqui.',
    text: 'Criar uma comissão dedicada aos pets e aos animais comunitários do Aquarius, com critérios, ações e parcerias que promovam o bem-estar animal e a convivência harmoniosa.',
    points: ['Critérios e regras claras de convivência', 'Ações de cuidado e bem-estar, com parceiros', 'Moradores voluntários na comissão'],
  },

  mail: {
    title: 'Entrega de correspondências',
    subtitle: 'Sua correspondência na sua casa.',
    text: 'Buscar, junto aos Correios, a viabilidade da entrega de correspondências dentro do residencial, e acompanhar o pedido até a solução.',
    points: ['Pedido formal aos Correios', 'Acompanhamento até a resposta', 'Moradores informados a cada passo'],
  },

  club: {
    overline: 'Fim de semana com mais vida',
    title: 'Atividade, cultura e convivência',
    subtitle: 'Um clube vivo para corpo, mente e comunidade.',
    items: [
      { icon: 'waves', color: 'bg-teal-600', title: 'Hidro e bem-estar', text: 'Atividades leves e saudáveis para movimentar o corpo com alegria.' },
      { icon: 'ball', color: 'bg-orange-500', title: 'Esportes e lazer', text: 'Futebol, vôlei, tênis de mesa e mais, para todas as idades.' },
      { icon: 'dice', color: 'bg-red-600', title: 'Jogos e convivência', text: 'Cartas, dominó, dama, xadrez e bons momentos de encontro.' },
      { icon: 'trophy', color: 'bg-green-600', title: 'Campeonatos amigos', text: 'Eventos esportivos e recreativos para integrar moradores e famílias.' },
      { icon: 'book', color: 'bg-purple-600', title: 'Literatura e cultura', text: 'Feiras de livros, leitura e atividades que valorizam o conhecimento.' },
      { icon: 'music', color: 'bg-pink-600', title: 'Música e encontros', text: 'Apresentações, feiras e momentos especiais para reunir a comunidade.' },
    ],
    extras: ['Festas sazonais', 'Feiras e sabores', 'Família no fim de semana'],
  },

  nature: {
    title: 'Natureza e qualidade de vida',
    subtitle: 'Cuidar do Aquarius é cuidar das pessoas e do ambiente.',
    items: [
      { icon: 'leaf', title: 'Podas com destino certo', text: 'Compostagem e parcerias, menos resíduo e menos custo.' },
      { icon: 'paw', title: 'Pets e animais comunitários', text: 'Uma comissão para o bem-estar animal e a convivência.' },
      { icon: 'building', title: 'Salão do Clube', text: 'Adequação com estudo técnico, para atender à comunidade.' },
      { icon: 'tree', title: 'Áreas verdes e lagos', text: 'Espaços comuns mais limpos, bonitos, seguros e acolhedores.' },
    ],
    footer: 'Melhorias com respeito ao jeito de viver em Aquarius.',
  },
}
