/* =========================================================================
   ACOMPANHAMENTO DA OBRA DO CALÇAMENTO (/calcamento)
   TROCAR: tudo aqui é EXEMPLO — etapas, fornecedores, valores e prazos.
   Enquanto `exemplo` for true, a página mostra o aviso de dados fictícios.

   status da etapa:     'concluida' | 'andamento' | 'aguardando'
   status do orçamento: 'escolhido' | 'analise' | 'descartado'
   arquivo (opcional):  link do PDF do orçamento, ex. '/orcamentos/topografia-1.pdf'
   ========================================================================= */

export const exemplo = true

export const fases = [
  { id: 'projetos', title: 'Projetos', text: 'Antes de qualquer obra: medir, entender o solo e desenhar a solução.' },
  { id: 'materiais', title: 'Compra de materiais', text: 'Tudo o que vai para a rua, cotado com pelo menos três fornecedores.' },
  { id: 'obra', title: 'Execução da obra', text: 'Serviços em campo, do preparo do terreno ao último bloquete.' },
]

/* Três orçamentos de exemplo por etapa: fornecedor, valor (R$), prazo e status. */
const tres = (valores, prazos, escolhido = null, status = 'analise') =>
  valores.map((valor, i) => ({
    id: i + 1,
    fornecedor: `Fornecedor ${String.fromCharCode(65 + i)}`,
    valor,
    prazo: prazos[i],
    status: escolhido === null ? status : i === escolhido ? 'escolhido' : 'descartado',
    arquivo: null,
  }))

export const etapas = [
  /* ---------------- Projetos ---------------- */
  {
    id: 'topografia',
    fase: 'projetos',
    title: 'Projeto topográfico',
    text: 'Levantamento planialtimétrico de todas as ruas: níveis, caimentos, divisas e pontos de alagamento.',
    status: 'concluida',
    orcamentos: tres([9800, 8500, 12400], ['20 dias', '25 dias', '15 dias'], 1),
  },
  {
    id: 'sondagem',
    fase: 'projetos',
    title: 'Sondagem do solo',
    text: 'Ensaios do terreno para definir a espessura da base e onde o solo precisa ser trocado.',
    status: 'concluida',
    orcamentos: tres([6200, 7900, 5800], ['15 dias', '10 dias', '20 dias'], 0),
  },
  {
    id: 'hidraulico',
    fase: 'projetos',
    title: 'Projeto hidráulico (drenagem)',
    text: 'Dimensionamento das águas de chuva: tubulação, bocas de lobo, caixas de passagem e pontos de descarga.',
    status: 'andamento',
    orcamentos: tres([18500, 14000, 16200], ['30 dias', '40 dias', '35 dias']),
  },
  {
    id: 'pavimentacao',
    fase: 'projetos',
    title: 'Projeto de pavimentação',
    text: 'Traçado, greide e seção de cada rua: espessuras de base, tipo de bloquete, guias e sarjetas.',
    status: 'aguardando',
    orcamentos: tres([15300, 11800, 12000], ['30 dias', '35 dias', '30 dias']),
  },

  /* ---------------- Materiais ---------------- */
  {
    id: 'bloquetes',
    fase: 'materiais',
    title: 'Bloquete sextavado',
    text: 'Bloquete de concreto sextavado com resistência e espessura definidas no projeto de pavimentação.',
    status: 'aguardando',
    orcamentos: tres([845000, 768000, 792000], ['Entrega em lotes, 60 dias', 'Entrega em lotes, 75 dias', 'Entrega em lotes, 60 dias']),
  },
  {
    id: 'guias',
    fase: 'materiais',
    title: 'Guias e sarjetas',
    text: 'Meio-fio de concreto que segura o calçamento nas laterais e conduz a água para a drenagem.',
    status: 'aguardando',
    orcamentos: tres([186000, 172500, 199000], ['45 dias', '50 dias', '40 dias']),
  },
  {
    id: 'tubos',
    fase: 'materiais',
    title: 'Tubos e peças de drenagem',
    text: 'Tubos de concreto, grelhas, tampas e peças pré-moldadas para bocas de lobo e caixas.',
    status: 'aguardando',
    orcamentos: tres([142000, 158000, 136500], ['30 dias', '25 dias', '40 dias']),
  },
  {
    id: 'agregados',
    fase: 'materiais',
    title: 'Areia, pó de pedra e brita',
    text: 'Brita graduada para a base, areia de assentamento e pó de pedra para o rejunte dos bloquetes.',
    status: 'aguardando',
    orcamentos: tres([310000, 296000, 327500], ['Conforme a obra', 'Conforme a obra', 'Conforme a obra']),
  },

  /* ---------------- Obra ---------------- */
  {
    id: 'terraplenagem',
    fase: 'obra',
    title: 'Terraplenagem e preparo do terreno',
    text: 'Corte, aterro, retirada do solo ruim e compactação do leito da rua no nível do projeto.',
    status: 'aguardando',
    orcamentos: tres([265000, 289000, 248000], ['45 dias', '40 dias', '50 dias']),
  },
  {
    id: 'drenagem',
    fase: 'obra',
    title: 'Execução da drenagem',
    text: 'Abertura de valas, assentamento dos tubos e construção de bocas de lobo e caixas de passagem.',
    status: 'aguardando',
    orcamentos: tres([398000, 372000, 415000], ['60 dias', '70 dias', '55 dias']),
  },
  {
    id: 'base',
    fase: 'obra',
    title: 'Base de brita compactada',
    text: 'Camada de brita graduada espalhada e compactada, que dá sustentação ao calçamento.',
    status: 'aguardando',
    orcamentos: tres([180000, 196000, 171000], ['30 dias', '25 dias', '35 dias']),
  },
  {
    id: 'assentamento-guias',
    fase: 'obra',
    title: 'Assentamento das guias',
    text: 'Instalação do meio-fio alinhado e nivelado, que trava o calçamento e forma a sarjeta.',
    status: 'aguardando',
    orcamentos: tres([98000, 91500, 104000], ['25 dias', '30 dias', '20 dias']),
  },
  {
    id: 'assentamento',
    fase: 'obra',
    title: 'Assentamento do sextavado',
    text: 'Colchão de areia, assentamento dos bloquetes, rejunte com pó de pedra e compactação final.',
    status: 'aguardando',
    orcamentos: tres([540000, 505000, 562000], ['90 dias', '100 dias', '85 dias']),
  },
  {
    id: 'fiscalizacao',
    fase: 'obra',
    title: 'Acompanhamento técnico',
    text: 'Engenheiro responsável (com ART) fiscalizando cada etapa e liberando as medições para pagamento.',
    status: 'aguardando',
    orcamentos: tres([48000, 42000, 55000], ['Durante toda a obra', 'Durante toda a obra', 'Durante toda a obra']),
  },
]
