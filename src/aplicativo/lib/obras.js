/* Obras em andamento, no mesmo formato da página /calcamento do site da chapa.
   status da etapa:     'concluida' | 'andamento' | 'aguardando'
   status do orçamento: 'escolhido' | 'analise' | 'descartado'
   Tudo aqui é EXEMPLO: fornecedores, valores e prazos fictícios. */

const tres = (valores, prazos, escolhido = null) =>
  valores.map((valor, i) => ({
    id: i + 1,
    fornecedor: `Fornecedor ${String.fromCharCode(65 + i)}`,
    valor,
    prazo: prazos[i],
    status: escolhido === null ? 'analise' : i === escolhido ? 'escolhido' : 'descartado',
  }))

export function createObras() {
  return [
    {
      id: 'calcamento',
      titulo: 'Calçamento com bloquete sextavado',
      resumo: 'Pavimentação e drenagem das ruas do residencial, do projeto ao último bloquete.',
      local: 'Todas as ruas · começando pela Lázaro Ferreira Pinto e pela Noel Infante',
      area: 'Ruas e drenagem',
      prioridade: true,
      fases: [
        { id: 'projetos', title: 'Projetos', text: 'Antes de qualquer obra: medir, entender o solo e desenhar a solução.' },
        { id: 'materiais', title: 'Compra de materiais', text: 'Tudo o que vai para a rua, cotado com pelo menos três fornecedores.' },
        { id: 'obra', title: 'Execução da obra', text: 'Serviços em campo, do preparo do terreno ao último bloquete.' },
      ],
      etapas: [
        { id: 'topografia', fase: 'projetos', title: 'Projeto topográfico', text: 'Levantamento planialtimétrico de todas as ruas: níveis, caimentos, divisas e pontos de alagamento.', status: 'concluida', orcamentos: tres([9800, 8500, 12400], ['20 dias', '25 dias', '15 dias'], 1) },
        { id: 'sondagem', fase: 'projetos', title: 'Sondagem do solo', text: 'Ensaios do terreno para definir a espessura da base e onde o solo precisa ser trocado.', status: 'concluida', orcamentos: tres([6200, 7900, 5800], ['15 dias', '10 dias', '20 dias'], 0) },
        { id: 'hidraulico', fase: 'projetos', title: 'Projeto hidráulico (drenagem)', text: 'Dimensionamento das águas de chuva: tubulação, bocas de lobo, caixas de passagem e pontos de descarga.', status: 'andamento', orcamentos: tres([18500, 14000, 16200], ['30 dias', '40 dias', '35 dias']) },
        { id: 'pavimentacao', fase: 'projetos', title: 'Projeto de pavimentação', text: 'Traçado, greide e seção de cada rua: espessuras de base, tipo de bloquete, guias e sarjetas.', status: 'aguardando', orcamentos: tres([15300, 11800, 12000], ['30 dias', '35 dias', '30 dias']) },
        { id: 'bloquetes', fase: 'materiais', title: 'Bloquete sextavado', text: 'Bloquete de concreto sextavado com resistência e espessura definidas no projeto de pavimentação.', status: 'aguardando', orcamentos: tres([845000, 768000, 792000], ['Entrega em lotes, 60 dias', 'Entrega em lotes, 75 dias', 'Entrega em lotes, 60 dias']) },
        { id: 'guias', fase: 'materiais', title: 'Guias e sarjetas', text: 'Meio-fio de concreto que segura o calçamento nas laterais e conduz a água para a drenagem.', status: 'aguardando', orcamentos: tres([186000, 172500, 199000], ['45 dias', '50 dias', '40 dias']) },
        { id: 'tubos', fase: 'materiais', title: 'Tubos e peças de drenagem', text: 'Tubos de concreto, grelhas, tampas e peças pré-moldadas para bocas de lobo e caixas.', status: 'aguardando', orcamentos: tres([142000, 158000, 136500], ['30 dias', '25 dias', '40 dias']) },
        { id: 'agregados', fase: 'materiais', title: 'Areia, pó de pedra e brita', text: 'Brita graduada para a base, areia de assentamento e pó de pedra para o rejunte dos bloquetes.', status: 'aguardando', orcamentos: tres([310000, 296000, 327500], ['Conforme a obra', 'Conforme a obra', 'Conforme a obra']) },
        { id: 'terraplenagem', fase: 'obra', title: 'Terraplenagem e preparo do terreno', text: 'Corte, aterro, retirada do solo ruim e compactação do leito da rua no nível do projeto.', status: 'aguardando', orcamentos: tres([265000, 289000, 248000], ['45 dias', '40 dias', '50 dias']) },
        { id: 'drenagem', fase: 'obra', title: 'Execução da drenagem', text: 'Abertura de valas, assentamento dos tubos e construção de bocas de lobo e caixas de passagem.', status: 'aguardando', orcamentos: tres([398000, 372000, 415000], ['60 dias', '70 dias', '55 dias']) },
        { id: 'base', fase: 'obra', title: 'Base de brita compactada', text: 'Camada de brita graduada espalhada e compactada, que dá sustentação ao calçamento.', status: 'aguardando', orcamentos: tres([180000, 196000, 171000], ['30 dias', '25 dias', '35 dias']) },
        { id: 'assentamento-guias', fase: 'obra', title: 'Assentamento das guias', text: 'Instalação do meio-fio alinhado e nivelado, que trava o calçamento e forma a sarjeta.', status: 'aguardando', orcamentos: tres([98000, 91500, 104000], ['25 dias', '30 dias', '20 dias']) },
        { id: 'assentamento', fase: 'obra', title: 'Assentamento do sextavado', text: 'Colchão de areia, assentamento dos bloquetes, rejunte com pó de pedra e compactação final.', status: 'aguardando', orcamentos: tres([540000, 505000, 562000], ['90 dias', '100 dias', '85 dias']) },
        { id: 'fiscalizacao', fase: 'obra', title: 'Acompanhamento técnico', text: 'Engenheiro responsável (com ART) fiscalizando cada etapa e liberando as medições para pagamento.', status: 'aguardando', orcamentos: tres([48000, 42000, 55000], ['Durante toda a obra', 'Durante toda a obra', 'Durante toda a obra']) },
      ],
    },
    {
      id: 'cameras',
      titulo: 'Câmeras de segurança',
      resumo: 'Monitoramento das duas entradas e das ruas principais, com gravação em nuvem.',
      local: 'Portarias 1 e 2 e ruas principais',
      area: 'Segurança',
      fases: [
        { id: 'projeto', title: 'Projeto e decisão', text: 'Onde instalar, quanto custa e aprovação dos proprietários.' },
        { id: 'instalacao', title: 'Instalação', text: 'Infraestrutura, câmeras e central de monitoramento.' },
      ],
      etapas: [
        { id: 'pontos', fase: 'projeto', title: 'Levantamento dos pontos', text: 'Mapa das 24 posições de câmera, com alcance e pontos cegos atuais.', status: 'concluida', orcamentos: tres([3200, 2800, 4100], ['10 dias', '12 dias', '7 dias'], 1) },
        { id: 'aprovacao', fase: 'projeto', title: 'Aprovação em assembleia', text: 'Projeto de 24 câmeras aprovado pelos proprietários na AGE, com uso do fundo de reserva.', status: 'concluida', orcamentos: [] },
        { id: 'equipamentos', fase: 'instalacao', title: 'Câmeras e gravador em nuvem', text: 'Câmeras com visão noturna, gravação por 30 dias e acesso pela portaria.', status: 'andamento', orcamentos: tres([88900, 86400, 92300], ['30 dias', '30 dias', '45 dias']) },
        { id: 'infra', fase: 'instalacao', title: 'Postes e cabeamento', text: 'Postes, fibra e energia até cada ponto de câmera.', status: 'aguardando', orcamentos: tres([21500, 18900, 24800], ['20 dias', '25 dias', '20 dias']) },
        { id: 'central', fase: 'instalacao', title: 'Central na portaria', text: 'Monitores, nobreak e treinamento dos porteiros.', status: 'aguardando', orcamentos: tres([8700, 7400, 9900], ['10 dias', '15 dias', '10 dias']) },
      ],
    },
    {
      id: 'playground',
      titulo: 'Reforma do playground',
      resumo: 'Brinquedos novos, piso emborrachado e sombra. Pago com a arrecadação da Festa Julina.',
      local: 'Ao lado do Quiosque 2',
      area: 'Lazer',
      fases: [
        { id: 'preparo', title: 'Preparo', text: 'Retirada dos brinquedos antigos e do piso.' },
        { id: 'montagem', title: 'Montagem', text: 'Piso, brinquedos e cobertura.' },
      ],
      etapas: [
        { id: 'retirada', fase: 'preparo', title: 'Retirada dos brinquedos antigos', text: 'Desmontagem e descarte correto do que estava quebrado.', status: 'concluida', orcamentos: tres([1800, 1500, 2200], ['3 dias', '4 dias', '2 dias'], 1) },
        { id: 'piso', fase: 'montagem', title: 'Piso emborrachado', text: 'Piso de borracha reciclada que amortece quedas.', status: 'andamento', orcamentos: tres([4600, 4100, 5200], ['7 dias', '10 dias', '7 dias'], 1) },
        { id: 'brinquedos', fase: 'montagem', title: 'Brinquedos novos', text: 'Escorregador, gangorra, balanço e casinha para crianças de 2 a 10 anos.', status: 'aguardando', orcamentos: tres([3900, 3600, 4400], ['15 dias', '20 dias', '15 dias'], 1) },
        { id: 'sombra', fase: 'montagem', title: 'Tela de sombreamento', text: 'Cobertura que protege do sol nas horas mais quentes.', status: 'aguardando', orcamentos: tres([1200, 980, 1450], ['5 dias', '7 dias', '5 dias']) },
      ],
    },
    {
      id: 'salao',
      titulo: 'Adequação do Salão do Clube',
      resumo: 'Estudo técnico e reforma para o salão atender às necessidades da comunidade.',
      local: 'Salão do Clube',
      area: 'Lazer',
      fases: [{ id: 'estudo', title: 'Estudo técnico', text: 'Diagnóstico com apoio especializado antes de qualquer reforma.' }],
      etapas: [
        { id: 'vistoria', fase: 'estudo', title: 'Vistoria técnica', text: 'Estrutura, elétrica, acústica e acessibilidade do salão.', status: 'aguardando', orcamentos: tres([7200, 6400, 8100], ['15 dias', '20 dias', '15 dias']) },
        { id: 'projeto-salao', fase: 'estudo', title: 'Projeto de adequação', text: 'Proposta com custos e etapas, para decisão em assembleia.', status: 'aguardando', orcamentos: tres([12800, 11500, 14200], ['30 dias', '30 dias', '25 dias']) },
      ],
    },
  ]
}
