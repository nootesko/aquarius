import { addDays, at, nextWeekday, today } from './format.js'
import { createObras } from './obras.js'

/* Dados fictícios da demonstração. Tudo é recriado ao clicar em "Restaurar demonstração". */

export const ACCOUNTS = [
  { login: 'morador', senha: '1234', role: 'morador', personId: 'p1', label: 'Morador', hint: 'Mariana Costa · 2 casas' },
  { login: 'sindico', senha: '1234', role: 'admin', personId: 'p-adm', label: 'Administração', hint: 'Ricardo Almeida · Síndico' },
  { login: 'portaria', senha: '1234', role: 'portaria', personId: 'p-port', label: 'Portaria', hint: 'José Silva · Turno dia' },
]

const STREETS = {
  noel: 'Rua Noel Infante',
  lazaro: 'Rua Lázaro Ferreira Pinto',
  valentina: 'Rua Valentina Sales',
  francisco: 'Rua Francisco Paulino Vicente',
  jose: 'Rua José de Oliveira Leite',
  acacio: 'Rua Acácio Antunes Pinto',
  benedita: 'Rua Benedita Maria de Jesus',
  nelson: 'Rua Nelson Caetano de Oliveira',
}

const unit = (id, rua, numero, quadra, lote, area, extra = {}) => ({
  id, rua: STREETS[rua], numero, quadra, lote, area, tipo: 'Casa', status: 'ocupada', ...extra,
})

const person = (id, nome, unitId, vinculo, extra = {}) => ({
  id, nome, unitId, vinculo, tipo: 'permanente', status: 'ativo',
  telefone: `(15) 9${Math.floor(1000 + Math.random() * 8999)}-${Math.floor(1000 + Math.random() * 8999)}`,
  email: `${nome.split(' ')[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@email.com`,
  ...extra,
})

export function createSeed() {
  const t = today()

  const units = [
    unit('u1', 'noel', '120', 'B', '14', 450),
    unit('u2', 'noel', '145', 'B', '21', 520),
    unit('u3', 'lazaro', '33', 'A', '03', 600),
    unit('u4', 'lazaro', '78', 'A', '09', 480),
    unit('u5', 'valentina', '12', 'C', '02', 500),
    unit('u6', 'valentina', '56', 'C', '11', 450, { status: 'em obra' }),
    unit('u7', 'francisco', '210', 'D', '30', 1000, { status: 'alugada' }),
    unit('u8', 'jose', '9', 'E', '01', 540),
    unit('u9', 'jose', '64', 'E', '12', 470),
    unit('u10', 'acacio', '101', 'F', '07', 620),
    unit('u11', 'benedita', '18', 'G', '04', 450, { status: 'vazia' }),
    unit('u12', 'nelson', '88', 'H', '15', 700),
  ]

  const persons = [
    person('p1', 'Mariana Costa', 'u1', 'Proprietária', { nascimento: '1984-03-12', cpf: '***.482.117-**' }),
    person('p2', 'Paulo Costa', 'u1', 'Morador', { nascimento: '1981-08-02' }),
    person('p3', 'Lívia Costa', 'u1', 'Dependente', { nascimento: '2012-05-20' }),
    person('p4', 'Dona Cida Ferreira', 'u1', 'Funcionária', { tipo: 'prestador', obs: 'Diarista · seg e qui' }),
    person('p5', 'Rafael Mendes', 'u7', 'Inquilino', { obs: 'Contrato até 03/2027' }),
    person('p6', 'Juliana Mendes', 'u7', 'Morador'),
    person('p7', 'Carlos Eduardo Lima', 'u2', 'Proprietário'),
    person('p8', 'Fernanda Lima', 'u2', 'Morador'),
    person('p9', 'Antônio Ribeiro', 'u3', 'Proprietário'),
    person('p10', 'Helena Ribeiro', 'u3', 'Morador'),
    person('p11', 'Marcos Tavares', 'u4', 'Proprietário'),
    person('p12', 'Beatriz Nogueira', 'u5', 'Proprietária'),
    person('p13', 'Gustavo Nogueira', 'u5', 'Morador', { status: 'pendente', obs: 'Aguardando aprovação do vínculo' }),
    person('p14', 'Roberto Faria', 'u6', 'Proprietário'),
    person('p15', 'Sílvia Araújo', 'u8', 'Proprietária'),
    person('p16', 'Thiago Araújo', 'u8', 'Morador'),
    person('p17', 'Luciana Prado', 'u9', 'Proprietária'),
    person('p18', 'Eduardo Prado', 'u9', 'Dependente', { nascimento: '2009-11-02' }),
    person('p19', 'Renata Souza', 'u10', 'Proprietária'),
    person('p20', 'Vinícius Souza', 'u10', 'Morador', { status: 'pendente', obs: 'Novo morador, enviou documentos' }),
    person('p21', 'Jorge Batista', 'u11', 'Proprietário'),
    person('p22', 'Patrícia Moura', 'u12', 'Proprietária'),
    person('p23', 'Daniel Moura', 'u12', 'Morador'),
    /* Pessoas da equipe (sem unidade) */
    person('p-adm', 'Ricardo Almeida', null, 'Síndico', { tipo: 'equipe' }),
    person('p-port', 'José Silva', null, 'Porteiro', { tipo: 'equipe' }),
  ]

  /* Proprietário em mais de uma casa: Mariana é dona da u1 (mora) e da u7 (alugada) */
  const ownership = [
    { unitId: 'u1', personId: 'p1', papel: 'Proprietária' },
    { unitId: 'u7', personId: 'p1', papel: 'Proprietária' },
    { unitId: 'u7', personId: 'p5', papel: 'Inquilino' },
  ]

  const vehicles = [
    { id: 'v1', unitId: 'u1', placa: 'FKR-3B21', modelo: 'Jeep Compass', cor: 'from-sky-600 to-sky-900' },
    { id: 'v2', unitId: 'u1', placa: 'BRA-2E19', modelo: 'Honda Biz', cor: 'from-sky-600 to-sky-900' },
    { id: 'v3', unitId: 'u7', placa: 'GHT-8A77', modelo: 'VW Polo', cor: 'from-sky-600 to-sky-900' },
    { id: 'v4', unitId: 'u2', placa: 'EQW-1C04', modelo: 'Toyota Corolla', cor: 'from-sky-600 to-sky-900' },
  ]

  const pets = [
    { id: 'pet1', unitId: 'u1', nome: 'Paçoca', especie: 'Cachorro', raca: 'SRD', obs: 'Castrado e vacinado' },
    { id: 'pet2', unitId: 'u7', nome: 'Mia', especie: 'Gato', raca: 'Siamês', obs: '' },
  ]

  const communityAnimals = [
    { id: 'ac1', nome: 'Caramelo', especie: 'Cachorro', local: 'Entrada da portaria', situacao: 'Vacinado em ago/2026', cuidador: 'Comissão Pets' },
    { id: 'ac2', nome: 'Pretinha', especie: 'Gata', local: 'Perto do salão', situacao: 'Castração agendada', cuidador: 'Helena (Rua Lázaro, 33)' },
    { id: 'ac3', nome: 'Bolota', especie: 'Cachorro', local: 'Campo de futebol', situacao: 'Precisa de lar temporário', cuidador: 'Comissão Pets' },
  ]

  const areas = [
    {
      id: 'a1', nome: 'Quiosque 1', tipo: 'Quiosque', icon: 'tent', foto: '/assets/areas/quiosque-1.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Churrasqueira, pia e mesa de madeira com bancos, no meio do gramado.',
      capacidade: 30, taxa: 50, slots: ['Manhã · 08h às 13h', 'Tarde · 13h às 18h', 'Noite · 18h às 22h'],
      antecedenciaDias: 2, limiteMes: 2, exigeAprovacao: false, ativo: true,
      regras: ['Limpeza por conta do morador até o fim do período.', 'Som em volume moderado; silêncio após as 22h.', 'Convidados devem estar na lista de autorização.'],
    },
    {
      id: 'a2', nome: 'Quiosque 2', tipo: 'Quiosque', icon: 'tent', foto: '/assets/areas/quiosque-2.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Churrasqueira, pia, mesa e cadeiras. Próximo ao playground.',
      capacidade: 25, taxa: 50, slots: ['Manhã · 08h às 13h', 'Tarde · 13h às 18h', 'Noite · 18h às 22h'],
      antecedenciaDias: 2, limiteMes: 2, exigeAprovacao: false, ativo: true,
      regras: ['Limpeza por conta do morador até o fim do período.', 'Proibido uso de vidro na área do playground.'],
    },
    {
      id: 'a4', nome: 'Campo de futebol', tipo: 'Esporte', icon: 'goal', foto: '/assets/areas/campo.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Campo society com grama natural e iluminação.',
      capacidade: 22, taxa: 0, slots: ['08h às 10h', '10h às 12h', '14h às 16h', '16h às 18h', '18h às 20h', '20h às 22h'],
      antecedenciaDias: 0, limiteMes: 8, exigeAprovacao: false, ativo: true,
      regras: ['Uso de chuteira society; travas de alumínio proibidas.', 'Iluminação desligada às 22h.'],
    },
    {
      id: 'a5', nome: 'Quadra poliesportiva', tipo: 'Esporte', icon: 'volleyball', foto: '/assets/areas/quadra.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Quadra descoberta e iluminada para futsal, basquete e vôlei.',
      capacidade: 20, taxa: 0, slots: ['08h às 10h', '10h às 12h', '14h às 16h', '16h às 18h', '18h às 20h', '20h às 22h'],
      antecedenciaDias: 0, limiteMes: 8, exigeAprovacao: false, ativo: true,
      regras: ['Calçado adequado obrigatório.', 'Menores de 12 anos acompanhados.'],
    },
    {
      id: 'a6', nome: 'Salão de festas', tipo: 'Salão', icon: 'party', foto: '/assets/areas/salao.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Salão do Clube amplo e arejado, com mesas, cadeiras e ventiladores.',
      capacidade: 120, taxa: 350, slots: ['Dia inteiro · 10h às 02h'],
      antecedenciaDias: 7, limiteMes: 1, exigeAprovacao: true, ativo: true,
      regras: ['Reserva confirmada após aprovação da administração.', 'Vistoria na entrega das chaves e na devolução.', 'Música até 02h com portas fechadas.', 'Lista de convidados obrigatória para a portaria.'],
    },
    {
      id: 'a7', nome: 'Piscina', tipo: 'Lazer', icon: 'waves', foto: '/assets/areas/piscina.webp', cor: 'from-sky-600 to-sky-900',
      descricao: 'Piscina semiolímpica com raias e vestiários. Uso livre para moradores; hidroginástica às terças e quintas.',
      capacidade: 60, taxa: 0, slots: [], semReserva: true,
      antecedenciaDias: 0, limiteMes: 0, exigeAprovacao: false, ativo: true,
      regras: ['Exame médico em dia.', 'Fechada às segundas para manutenção.', 'Visitantes somente acompanhados do morador.'],
    },
  ]

  const reservations = [
    { id: 'r1', areaId: 'a1', unitId: 'u1', personId: 'p1', data: addDays(t, 3), slot: 'Tarde · 13h às 18h', status: 'confirmada', convidados: 18, taxa: 50, criadaEm: at(-4) },
    { id: 'r2', areaId: 'a6', unitId: 'u1', personId: 'p1', data: addDays(t, 16), slot: 'Dia inteiro · 10h às 02h', status: 'pendente', convidados: 80, taxa: 350, criadaEm: at(-1, '20:14'), obs: 'Aniversário de 15 anos da Lívia' },
    { id: 'r3', areaId: 'a4', unitId: 'u1', personId: 'p2', data: addDays(t, -6), slot: '18h às 20h', status: 'concluída', convidados: 14, taxa: 0, criadaEm: at(-9) },
    { id: 'r4', areaId: 'a2', unitId: 'u3', personId: 'p9', data: addDays(t, 3), slot: 'Noite · 18h às 22h', status: 'confirmada', convidados: 20, taxa: 50, criadaEm: at(-3) },
    { id: 'r5', areaId: 'a1', unitId: 'u8', personId: 'p15', data: addDays(t, 5), slot: 'Manhã · 08h às 13h', status: 'confirmada', convidados: 12, taxa: 50, criadaEm: at(-2) },
    { id: 'r6', areaId: 'a4', unitId: 'u2', personId: 'p7', data: t, slot: '18h às 20h', status: 'confirmada', convidados: 16, taxa: 0, criadaEm: at(-5) },
    { id: 'r7', areaId: 'a5', unitId: 'u10', personId: 'p19', data: addDays(t, 1), slot: '08h às 10h', status: 'confirmada', convidados: 8, taxa: 0, criadaEm: at(-1) },
    { id: 'r8', areaId: 'a6', unitId: 'u12', personId: 'p22', data: addDays(t, 9), slot: 'Dia inteiro · 10h às 02h', status: 'pendente', convidados: 60, taxa: 350, criadaEm: at(-2), obs: 'Chá de bebê' },
    { id: 'r9', areaId: 'a2', unitId: 'u4', personId: 'p11', data: t, slot: 'Tarde · 13h às 18h', status: 'confirmada', convidados: 25, taxa: 50, criadaEm: at(-6) },
  ]

  const blocks = [
    { id: 'b1', areaId: 'a5', data: addDays(t, 4), motivo: 'Pintura da quadra' },
    { id: 'b2', areaId: 'a2', data: addDays(t, 10), motivo: 'Troca da churrasqueira' },
  ]

  const news = [
    {
      id: 'n1', titulo: 'Interrupção de água na Quadra B', categoria: 'Urgente', data: at(0, '07:40'), autor: 'Administração', status: 'publicado',
      resumo: 'Reparo na rede entre 9h e 13h. Reserve água para o período.',
      conteudo: 'A Sabesp fará o reparo de um vazamento na rede que abastece a Quadra B (Rua Noel Infante e Rua Valentina Sales).\n\nO fornecimento será interrompido entre 9h e 13h de hoje. Recomendamos reservar água para o período.\n\nQualquer dúvida, fale com a portaria.',
      anexos: [], exigeConfirmacao: true, leituras: ['p7'],
    },
    {
      id: 'n2', titulo: 'Feirinha do Aquarius volta neste sábado', categoria: 'Feirinha', data: at(-1, '18:00'), autor: 'Comissão de Eventos', status: 'publicado',
      resumo: 'Artesanato, comidas típicas e música ao vivo, das 9h às 14h, na praça central.',
      conteudo: 'A Feirinha do Aquarius está de volta! Neste sábado, das 9h às 14h, na praça central.\n\nTeremos 18 expositores de artesanato, doces, salgados, plantas e produtos naturais, todos moradores do residencial.\n\nMúsica ao vivo a partir das 11h. Traga sua sacola retornável!\n\nQuer expor na próxima edição? Fale com a Comissão de Eventos pelo app.',
      anexos: ['mapa-expositores.pdf'], exigeConfirmacao: false, leituras: [],
    },
    {
      id: 'n3', titulo: 'Mapeamento das ruas: resultado da 1ª etapa', categoria: 'Obras', data: at(-3, '10:00'), autor: 'Administração', status: 'publicado',
      resumo: 'Concluímos o levantamento das 14 ruas. Confira as prioridades em "Obras e ações".',
      conteudo: 'O estudo técnico de pavimentação e drenagem concluiu a primeira etapa: as 14 ruas foram mapeadas, com fotos, medições e pontos de alagamento.\n\nAs ruas com prioridade alta são a Rua Lázaro Ferreira Pinto e a Rua Noel Infante. O relatório completo está em Transparência.\n\nOs custos e opções serão apresentados para decisão em assembleia.',
      anexos: ['relatorio-mapeamento-ruas.pdf'], exigeConfirmacao: false, leituras: ['p1'],
    },
    {
      id: 'n4', titulo: 'Festa Julina 2026: obrigado a todos!', categoria: 'Evento', data: at(-40, '12:00'), autor: 'Comissão de Eventos', status: 'publicado',
      resumo: 'Mais de 300 pessoas participaram. Veja o balanço da festa.',
      conteudo: 'A Festa Julina reuniu mais de 300 moradores e convidados. A arrecadação das barracas (R$ 6.840) será destinada à reforma do playground.',
      anexos: [], exigeConfirmacao: false, leituras: ['p1'],
    },
    {
      id: 'n5', titulo: 'Novo horário da coleta de podas', categoria: 'Informativo', data: at(-6, '09:00'), autor: 'Administração', status: 'publicado',
      resumo: 'O recolhimento de podas passa a ser toda segunda-feira, das 8h às 16h.',
      conteudo: 'Para acabar com o descarte irregular de galhos nas calçadas, o recolhimento de podas passa a ser toda segunda-feira, das 8h às 16h. Deixe os galhos amarrados na calçada. A coleta de lixo comum segue às terças, quintas e sábados, e a reciclagem, aos sábados. Confira tudo em Agenda.\n\nOs resíduos serão destinados à compostagem, em parceria com a Prefeitura.',
      anexos: [], exigeConfirmacao: false, leituras: [],
    },
    {
      id: 'n6', titulo: 'Campeonato de truco: inscrições abertas', categoria: 'Evento', data: at(2, '08:00'), autor: 'Comissão de Eventos', status: 'agendado',
      resumo: 'Duplas, no salão do clube. Inscrição pelo app em Atividades.',
      conteudo: 'Inscrições abertas para o 1º Campeonato de Truco do Aquarius. Premiação para as três primeiras duplas.',
      anexos: [], exigeConfirmacao: false, leituras: [],
    },
  ]

  const votes = [
    {
      id: 'vt1', titulo: 'Qual deve ser a próxima melhoria?', tipo: 'formal', modalidade: 'nominal', votoPor: 'unidade',
      status: 'aberta', inicio: addDays(t, -3), fim: addDays(t, 4), permiteAlterar: true, parcialVisivel: false,
      descricao: 'Escolha a melhoria que o residencial deve fazer depois do calçamento.',
      anexos: ['estimativas-melhorias.pdf'],
      opcoes: [
        { id: 'o1', texto: 'Academia ao ar livre', detalhe: 'Estimativa: R$ 38 mil' },
        { id: 'o2', texto: 'Pista de caminhada no lago', detalhe: 'Estimativa: R$ 72 mil' },
        { id: 'o3', texto: 'Quadra de areia', detalhe: 'Estimativa: R$ 45 mil' },
        { id: 'o4', texto: 'Espaço pet com agility', detalhe: 'Estimativa: R$ 18 mil' },
        { id: 'o5', texto: 'Iluminação de LED nas ruas', detalhe: 'Estimativa: R$ 64 mil' },
      ],
      votos: [
        { unitId: 'u2', personId: 'p7', opcaoId: 'o2', em: at(-2, '19:12') },
        { unitId: 'u3', personId: 'p9', opcaoId: 'o2', em: at(-2, '20:40') },
        { unitId: 'u4', personId: 'p11', opcaoId: 'o1', em: at(-1, '08:03') },
        { unitId: 'u8', personId: 'p15', opcaoId: 'o5', em: at(-1, '12:30') },
        { unitId: 'u10', personId: 'p19', opcaoId: 'o1', em: at(-1, '21:55') },
        { unitId: 'u12', personId: 'p22', opcaoId: 'o2', em: at(0, '07:15') },
      ],
      quorum: 'Vence a opção com mais votos das unidades',
    },
    {
      id: 'vt2', titulo: 'Qual o melhor dia para a Feirinha?', tipo: 'enquete', modalidade: 'secreta', votoPor: 'pessoa',
      status: 'aberta', inicio: addDays(t, -2), fim: addDays(t, 8), permiteAlterar: true, parcialVisivel: true,
      descricao: 'Ajude a escolher o dia fixo da Feirinha do Aquarius.',
      anexos: [],
      opcoes: [
        { id: 'o1', texto: 'Sábado de manhã' },
        { id: 'o2', texto: 'Domingo de manhã' },
        { id: 'o3', texto: 'Sexta à noite' },
      ],
      votos: [
        { unitId: 'u2', personId: 'p8', opcaoId: 'o1', em: at(-2) },
        { unitId: 'u3', personId: 'p10', opcaoId: 'o2', em: at(-1) },
        { unitId: 'u5', personId: 'p12', opcaoId: 'o1', em: at(-1) },
        { unitId: 'u9', personId: 'p17', opcaoId: 'o3', em: at(0, '08:20') },
        { unitId: 'u12', personId: 'p23', opcaoId: 'o1', em: at(0, '09:05') },
      ],
    },
    {
      id: 'vt3', titulo: 'Atualização do Regimento Interno · capítulo de áreas comuns', tipo: 'formal', modalidade: 'nominal', votoPor: 'unidade',
      status: 'futura', inicio: addDays(t, 12), fim: addDays(t, 26), permiteAlterar: false, parcialVisivel: false,
      descricao: 'Proposta de nova redação para o capítulo de áreas comuns: regras de reserva pelo aplicativo, limites mensais e taxas.',
      anexos: ['minuta-regimento.pdf'],
      opcoes: [{ id: 'o1', texto: 'Aprovo a nova redação' }, { id: 'o2', texto: 'Não aprovo' }, { id: 'o3', texto: 'Abstenção' }],
      votos: [],
    },
    {
      id: 'vt4', titulo: 'Estudo técnico de pavimentação e drenagem', tipo: 'formal', modalidade: 'nominal', votoPor: 'unidade',
      status: 'encerrada', inicio: addDays(t, -60), fim: addDays(t, -45), permiteAlterar: false, parcialVisivel: false,
      descricao: 'Contratação de estudo técnico para mapear as ruas e propor soluções de piso intertravado com drenagem. Custo: R$ 18.500.',
      anexos: ['proposta-estudo-tecnico.pdf'],
      opcoes: [{ id: 'o1', texto: 'Aprovo' }, { id: 'o2', texto: 'Não aprovo' }, { id: 'o3', texto: 'Abstenção' }],
      votos: [
        { unitId: 'u1', personId: 'p1', opcaoId: 'o1', em: at(-58, '19:20') },
        { unitId: 'u2', personId: 'p7', opcaoId: 'o1', em: at(-57) },
        { unitId: 'u3', personId: 'p9', opcaoId: 'o1', em: at(-57) },
        { unitId: 'u4', personId: 'p11', opcaoId: 'o2', em: at(-55) },
        { unitId: 'u5', personId: 'p12', opcaoId: 'o1', em: at(-54) },
        { unitId: 'u7', personId: 'p1', opcaoId: 'o1', em: at(-58, '19:21') },
        { unitId: 'u8', personId: 'p15', opcaoId: 'o1', em: at(-52) },
        { unitId: 'u9', personId: 'p17', opcaoId: 'o3', em: at(-50) },
        { unitId: 'u10', personId: 'p19', opcaoId: 'o1', em: at(-49) },
        { unitId: 'u12', personId: 'p22', opcaoId: 'o1', em: at(-47) },
      ],
      quorum: 'Maioria simples das unidades votantes',
    },
  ]

  const authorizations = [
    { id: 'au1', unitId: 'u1', criadoPor: 'p1', tipo: 'Prestador', nome: 'Elétrica Sorocaba · André', documento: 'RG 32.554.871-0', empresa: 'Elétrica Sorocaba', servico: 'Troca do quadro de luz', validoDe: t, validoAte: t, codigo: 'K7M2QX', status: 'ativa', criadaEm: at(-1) },
    { id: 'au2', unitId: 'u1', criadoPor: 'p1', tipo: 'Visitante', nome: 'Cláudia Mendes', documento: 'RG 28.110.334-2', validoDe: t, validoAte: addDays(t, 2), codigo: 'P4HT9A', status: 'ativa', criadaEm: at(-1, '21:00'), obs: 'Mãe do Paulo, vem com carro (placa EKP-4410)' },
    {
      id: 'au3', unitId: 'u1', criadoPor: 'p1', tipo: 'Lista de convidados', nome: 'Churrasco no Quiosque 1', reservaId: 'r1', validoDe: addDays(t, 3), validoAte: addDays(t, 3), codigo: 'CHR3Q1', status: 'ativa', criadaEm: at(-3),
      convidados: [
        { nome: 'Fábio Andrade', documento: '' , entrouEm: null },
        { nome: 'Camila Andrade', documento: '', entrouEm: null },
        { nome: 'Rogério Pires', documento: '', entrouEm: null },
        { nome: 'Tatiane Pires', documento: '', entrouEm: null },
        { nome: 'Leandro Okada', documento: '', entrouEm: null },
      ],
    },
    { id: 'au4', unitId: 'u1', criadoPor: 'p1', tipo: 'Visitante', nome: 'Marcelo Duarte', documento: 'RG 41.220.019-7', validoDe: addDays(t, -10), validoAte: addDays(t, -10), codigo: 'MD10XA', status: 'expirada', criadaEm: at(-11) },
    { id: 'au5', unitId: 'u3', criadoPor: 'p9', tipo: 'Prestador', nome: 'Jardins & Cia · Equipe', documento: 'CNPJ 22.341.000/0001-90', empresa: 'Jardins & Cia', servico: 'Poda de árvores', validoDe: t, validoAte: t, codigo: 'JRD7C1', status: 'ativa', criadaEm: at(-2) },
    { id: 'au6', unitId: 'u8', criadoPor: 'p15', tipo: 'Visitante', nome: 'Rodrigo Teles', documento: 'RG 30.987.120-1', validoDe: t, validoAte: t, codigo: 'RT5X8B', status: 'ativa', criadaEm: at(0, '08:10') },
    {
      id: 'au7', unitId: 'u4', criadoPor: 'p11', tipo: 'Lista de convidados', nome: 'Aniversário no Quiosque 2', reservaId: 'r9', validoDe: t, validoAte: t, codigo: 'ANV3Q3', status: 'ativa', criadaEm: at(-4),
      convidados: [
        { nome: 'Patrícia Gomes', documento: '', entrouEm: null },
        { nome: 'Henrique Gomes', documento: '', entrouEm: null },
        { nome: 'Sabrina Costa', documento: '', entrouEm: at(0, '13:20') },
        { nome: 'Igor Martins', documento: '', entrouEm: null },
      ],
    },
    { id: 'au8', unitId: 'u12', criadoPor: 'p22', tipo: 'Prestador', nome: 'Piscinas Azul · Marcos', documento: 'RG 22.765.443-9', empresa: 'Piscinas Azul', servico: 'Manutenção da piscina', validoDe: addDays(t, -30), validoAte: addDays(t, 60), codigo: 'PSC2AZ', status: 'ativa', criadaEm: at(-30), recorrente: 'Toda quarta-feira' },
  ]

  const accessLog = [
    { id: 'ac-1', autorizacaoId: 'au6', nome: 'Rodrigo Teles', unitId: 'u8', tipo: 'Visitante', entrada: at(0, '08:42'), saida: null, porteiro: 'José Silva', placa: '' },
    { id: 'ac-2', autorizacaoId: 'au5', nome: 'Jardins & Cia · Equipe', unitId: 'u3', tipo: 'Prestador', entrada: at(0, '07:55'), saida: null, porteiro: 'José Silva', placa: 'FTR-9921' },
    { id: 'ac-3', autorizacaoId: 'au8', nome: 'Piscinas Azul · Marcos', unitId: 'u12', tipo: 'Prestador', entrada: at(-1, '09:10'), saida: at(-1, '11:30'), porteiro: 'José Silva', placa: 'DKS-0201' },
    { id: 'ac-4', autorizacaoId: 'au4', nome: 'Marcelo Duarte', unitId: 'u1', tipo: 'Visitante', entrada: at(-10, '15:12'), saida: at(-10, '18:40'), porteiro: 'Antônio Neves', placa: '' },
  ]

  const documents = [
    { id: 'd1', titulo: 'Balancete de setembro/2026', categoria: 'Balancete', periodo: 'Set/2026', ano: 2026, tamanho: '412 KB', publicadoEm: at(-12), versao: 1 },
    { id: 'd2', titulo: 'Balancete de agosto/2026', categoria: 'Balancete', periodo: 'Ago/2026', ano: 2026, tamanho: '398 KB', publicadoEm: at(-42), versao: 1 },
    { id: 'd3', titulo: 'Balancete de julho/2026', categoria: 'Balancete', periodo: 'Jul/2026', ano: 2026, tamanho: '405 KB', publicadoEm: at(-73), versao: 2 },
    { id: 'd4', titulo: 'Balanço patrimonial 2025', categoria: 'Balanço', periodo: '2025', ano: 2025, tamanho: '1,2 MB', publicadoEm: at(-190), versao: 1 },
    { id: 'd5', titulo: 'DRE 2025', categoria: 'DRE', periodo: '2025', ano: 2025, tamanho: '640 KB', publicadoEm: at(-190), versao: 1 },
    { id: 'd6', titulo: 'Contrato · Portaria e vigilância', categoria: 'Contrato', periodo: '2026–2027', ano: 2026, tamanho: '2,1 MB', publicadoEm: at(-120), versao: 1 },
    { id: 'd7', titulo: 'Contrato · Estudo técnico de pavimentação', categoria: 'Contrato', periodo: '2026', ano: 2026, tamanho: '890 KB', publicadoEm: at(-40), versao: 1 },
    { id: 'd8', titulo: 'Estatuto social', categoria: 'Estatuto', periodo: 'Vigente', ano: 2019, tamanho: '1,4 MB', publicadoEm: at(-400), versao: 3 },
    { id: 'd9', titulo: 'Convenção do condomínio', categoria: 'Convenção', periodo: 'Vigente', ano: 2014, tamanho: '1,9 MB', publicadoEm: at(-400), versao: 1 },
    { id: 'd10', titulo: 'Regimento interno', categoria: 'Regimento', periodo: 'Vigente', ano: 2021, tamanho: '780 KB', publicadoEm: at(-400), versao: 2 },
    { id: 'd11', titulo: 'Ata da AGO · março/2026', categoria: 'Ata', periodo: 'Mar/2026', ano: 2026, tamanho: '520 KB', publicadoEm: at(-200), versao: 1 },
    { id: 'd12', titulo: 'Ata da AGE · estudo de pavimentação', categoria: 'Ata', periodo: 'Ago/2026', ano: 2026, tamanho: '310 KB', publicadoEm: at(-44), versao: 1 },
    { id: 'd13', titulo: 'Relatório · mapeamento das ruas', categoria: 'Relatório', periodo: 'Out/2026', ano: 2026, tamanho: '6,8 MB', publicadoEm: at(-3), versao: 1 },
  ]

  /* Resumo financeiro mensal (R$) — para o painel de transparência */
  const finance = {
    saldoCaixa: 214380,
    fundoReserva: 312900,
    inadimplencia: 6.8,
    limiteSemAssembleia: 15000,
    meses: [
      { mes: 'Mai', receitas: 148200, despesas: 131400 },
      { mes: 'Jun', receitas: 149100, despesas: 138900 },
      { mes: 'Jul', receitas: 151300, despesas: 142250 },
      { mes: 'Ago', receitas: 150800, despesas: 157600 },
      { mes: 'Set', receitas: 152400, despesas: 139800 },
      { mes: 'Out', receitas: 153050, despesas: 128300 },
    ],
    despesasMes: [
      { item: 'Portaria e vigilância', valor: 52800 },
      { item: 'Limpeza e jardinagem', valor: 24600 },
      { item: 'Energia e água das áreas comuns', valor: 15900 },
      { item: 'Manutenção e reparos', valor: 13700 },
      { item: 'Administração e contabilidade', valor: 9800 },
      { item: 'Estudo técnico de pavimentação', valor: 6200 },
      { item: 'Outros', valor: 5300 },
    ],
  }

  /* Obras e ações — situação de cada rua e das demais frentes */
  const works = {
    ruas: [
      { rua: 'Rua Lázaro Ferreira Pinto', prioridade: 'Alta', etapa: 2, problema: 'Alagamento na portaria e erosão', extensao: 420 },
      { rua: 'Rua Noel Infante', prioridade: 'Alta', etapa: 2, problema: 'Buracos e falta de drenagem', extensao: 380 },
      { rua: 'Rua José de Oliveira Leite', prioridade: 'Média', etapa: 1, problema: 'Erosão nas laterais', extensao: 300 },
      { rua: 'Rua Francisco Paulino Vicente', prioridade: 'Média', etapa: 1, problema: 'Buracos', extensao: 350 },
      { rua: 'Rua Valentina Sales', prioridade: 'Média', etapa: 1, problema: 'Poeira e buracos', extensao: 260 },
      { rua: 'Rua Acácio Antunes Pinto', prioridade: 'Baixa', etapa: 1, problema: 'Desgaste leve', extensao: 240 },
      { rua: 'Rua Benedita Maria de Jesus', prioridade: 'Baixa', etapa: 1, problema: 'Desgaste leve', extensao: 210 },
      { rua: 'Rua Nelson Caetano de Oliveira', prioridade: 'Baixa', etapa: 1, problema: 'Poeira', extensao: 230 },
    ],
    etapas: ['Mapeamento', 'Estudo técnico', 'Orçamentos', 'Assembleia', 'Obra', 'Concluída'],
    acoes: [
      { id: 'w1', titulo: 'Estudo técnico de pavimentação contratado', area: 'Ruas', data: addDays(t, -44), status: 'concluída', valor: 18500 },
      { id: 'w2', titulo: 'Mapeamento das 14 ruas', area: 'Ruas', data: addDays(t, -3), status: 'concluída', valor: 0 },
      { id: 'w3', titulo: 'Cotação de câmeras (3 orçamentos)', area: 'Segurança', data: addDays(t, -8), status: 'concluída', valor: 0 },
      { id: 'w4', titulo: 'Votação: próxima melhoria do residencial', area: 'Lazer', data: addDays(t, 4), status: 'em andamento', valor: 0 },
      { id: 'w5', titulo: 'Reforma do playground', area: 'Lazer', data: addDays(t, 20), status: 'em andamento', valor: 9800 },
      { id: 'w6', titulo: 'Compostagem das podas (parceria Prefeitura)', area: 'Natureza', data: addDays(t, -15), status: 'concluída', valor: 0 },
      { id: 'w7', titulo: 'Pedido aos Correios: entrega de cartas no residencial', area: 'Comunidade', data: addDays(t, -20), status: 'em andamento', valor: 0 },
      { id: 'w8', titulo: 'Estudo técnico do Salão do Clube', area: 'Lazer', data: addDays(t, 35), status: 'planejada', valor: 7200 },
    ],
  }

  /* Clubes: criados pelos moradores ou pela administração. `minimo` é quantas pessoas o clube
     precisa para começar; `custo` é mensal (0 = gratuito). */
  const activities = [
    {
      id: 'at1', titulo: 'Clube do livro', categoria: 'Cultura', descricao: 'Um livro por mês e um café para conversar sobre ele.',
      onde: 'casa', local: 'Casa da Helena · Lázaro Ferreira Pinto, 33', quando: '1º sábado do mês · 10h',
      custo: 0, custoInfo: '', minimo: 5, vagas: 15, inscritos: ['p1', 'p10', 'p12', 'p17', 'p19', 'p22'], responsavel: 'Helena Ribeiro', organizadorId: 'p10', criadoEm: at(-40),
    },
    {
      id: 'at2', titulo: 'Clube do truco', categoria: 'Jogos', descricao: 'Partidas em duplas toda sexta. Iniciantes são bem-vindos.',
      onde: 'salao', local: 'Salão do clube', quando: 'Sextas · 19h',
      custo: 0, custoInfo: '', minimo: 8, vagas: 32, inscritos: ['p11', 'p14', 'p9', 'p21', 'p7'], responsavel: 'Marcos Tavares', organizadorId: 'p11', criadoEm: at(-6),
    },
    {
      id: 'at3', titulo: 'Aulas de jiu-jitsu', categoria: 'Esporte', descricao: 'Turma para adultos e adolescentes, com professor faixa preta. Kimono por conta do aluno.',
      onde: 'salao', local: 'Salão do clube', quando: 'Ter e qui · 19h30',
      custo: 120, custoInfo: 'por mês, pago direto ao professor', minimo: 10, vagas: 20, inscritos: ['p2', 'p16', 'p23', 'p18', 'p8', 'p20'], responsavel: 'Prof. Marcelo', organizadorId: 'p16', criadoEm: at(-3),
    },
    {
      id: 'at4', titulo: 'Hidroginástica', categoria: 'Bem-estar', descricao: 'Exercícios leves na água, para todas as idades.',
      onde: 'area', local: 'Piscina', quando: 'Ter e qui · 8h',
      custo: 60, custoInfo: 'por mês', minimo: 6, vagas: 20, inscritos: ['p10', 'p12', 'p17', 'p19', 'p22', 'p8', 'p15'], responsavel: 'Prof.ª Carla', organizadorId: null, criadoEm: at(-120),
    },
    {
      id: 'at5', titulo: 'Futebol de domingo', categoria: 'Esporte', descricao: 'Pelada aberta no campo, times sorteados na hora.',
      onde: 'area', local: 'Campo de futebol', quando: 'Domingos · 8h',
      custo: 0, custoInfo: '', minimo: 10, vagas: 30, inscritos: ['p2', 'p7', 'p9', 'p11', 'p16', 'p23', 'p14', 'p21', 'p18', 'p6', 'p5', 'p20'], responsavel: 'Thiago Araújo', organizadorId: 'p16', criadoEm: at(-200),
    },
    {
      id: 'at6', titulo: 'Dominó, dama e xadrez', categoria: 'Jogos', descricao: 'Tarde de jogos de tabuleiro para a melhor idade (e quem mais quiser).',
      onde: 'casa', local: 'Casa do Jorge · Benedita Maria de Jesus, 18', quando: 'Quartas · 16h',
      custo: 0, custoInfo: '', minimo: 4, vagas: 12, inscritos: ['p9', 'p21'], responsavel: 'Jorge Batista', organizadorId: 'p21', criadoEm: at(-2),
    },
  ]

  const requests = [
    {
      id: 's1', protocolo: 'SOL-2026-0142', unitId: 'u1', personId: 'p1', anonima: false, tipo: 'Reclamação', categoria: 'Manutenção',
      titulo: 'Lâmpada queimada no poste em frente ao nº 120', descricao: 'O poste em frente à minha casa está apagado há 4 dias e a rua fica muito escura.', local: 'Rua Noel Infante, 120', fotos: 1,
      status: 'em andamento', responsavel: 'Equipe de manutenção', prazo: addDays(t, 2), criadaEm: at(-4, '20:31'),
      historico: [
        { em: at(-4, '20:31'), autor: 'Mariana Costa', tipo: 'abertura', texto: 'Solicitação aberta.' },
        { em: at(-3, '09:12'), autor: 'Administração', tipo: 'status', texto: 'Recebida e encaminhada à equipe de manutenção.' },
        { em: at(-1, '16:05'), autor: 'Equipe de manutenção', tipo: 'resposta', texto: 'Lâmpada comprada; a troca será feita até sexta.' },
      ],
    },
    {
      id: 's2', protocolo: 'SOL-2026-0128', unitId: 'u1', personId: 'p1', anonima: false, tipo: 'Sugestão', categoria: 'Áreas comuns',
      titulo: 'Bicicletário perto da portaria', descricao: 'Sugiro instalar um bicicletário coberto perto da portaria para as crianças.', local: 'Portaria', fotos: 0,
      status: 'resolvida', responsavel: 'Síndico', prazo: addDays(t, -10), criadaEm: at(-25),
      historico: [
        { em: at(-25), autor: 'Mariana Costa', tipo: 'abertura', texto: 'Solicitação aberta.' },
        { em: at(-22), autor: 'Administração', tipo: 'resposta', texto: 'Ótima ideia! Incluímos no orçamento de outubro.' },
        { em: at(-9), autor: 'Administração', tipo: 'status', texto: 'Bicicletário instalado. Obrigado pela sugestão!' },
      ],
    },
    {
      id: 's3', protocolo: 'SOL-2026-0145', unitId: 'u3', personId: 'p9', anonima: false, tipo: 'Reclamação', categoria: 'Barulho',
      titulo: 'Som alto após as 22h', descricao: 'Som alto vindo do Quiosque 2 até 0h30 no sábado.', local: 'Quiosque 2', fotos: 0,
      status: 'recebida', responsavel: '', prazo: addDays(t, 5), criadaEm: at(-1, '00:45'),
      historico: [{ em: at(-1, '00:45'), autor: 'Antônio Ribeiro', tipo: 'abertura', texto: 'Solicitação aberta.' }],
    },
    {
      id: 's4', protocolo: 'SOL-2026-0146', unitId: null, personId: null, anonima: true, tipo: 'Denúncia', categoria: 'Descarte irregular',
      titulo: 'Entulho jogado no terreno vazio da Quadra G', descricao: 'Toda semana alguém despeja entulho de obra no terreno ao lado do nº 18 da Rua Benedita.', local: 'Rua Benedita Maria de Jesus', fotos: 2,
      status: 'recebida', responsavel: '', prazo: addDays(t, 5), criadaEm: at(0, '06:50'),
      historico: [{ em: at(0, '06:50'), autor: 'Anônimo', tipo: 'abertura', texto: 'Denúncia anônima registrada.' }],
    },
    {
      id: 's5', protocolo: 'SOL-2026-0139', unitId: 'u10', personId: 'p19', anonima: false, tipo: 'Reclamação', categoria: 'Ruas e drenagem',
      titulo: 'Buraco grande na Rua Acácio', descricao: 'Buraco na frente do nº 101 acumulando água.', local: 'Rua Acácio Antunes Pinto, 101', fotos: 3,
      status: 'em andamento', responsavel: 'Equipe de manutenção', prazo: addDays(t, -1), criadaEm: at(-8),
      historico: [
        { em: at(-8), autor: 'Renata Souza', tipo: 'abertura', texto: 'Solicitação aberta.' },
        { em: at(-7), autor: 'Administração', tipo: 'status', texto: 'Tapa-buraco emergencial programado; rua incluída no estudo técnico.' },
      ],
    },
  ]

  const incidents = [
    { id: 'oc1', titulo: 'Portão da entrada 2 travando', categoria: 'Manutenção', descricao: 'O portão eletrônico está demorando a fechar e travou duas vezes.', em: at(0, '06:30'), porteiro: 'José Silva', status: 'encaminhada', unitId: null },
    { id: 'oc2', titulo: 'Visitante sem autorização insistiu em entrar', categoria: 'Segurança', descricao: 'Pessoa dizendo ser entregador sem pedido para a casa 78 da Rua Lázaro. Morador não atendeu. Entrada negada.', em: at(-1, '22:15'), porteiro: 'Antônio Neves', status: 'aberta', unitId: 'u4' },
  ]

  const alerts = [
    { id: 'al1', tipo: 'Pessoa suspeita', descricao: 'Moto sem placa circulando devagar pela Rua Valentina.', local: 'Rua Valentina Sales', em: at(-2, '23:10'), autor: 'Beatriz Nogueira', status: 'verificado', resposta: 'Ronda feita; era um entregador perdido.' },
  ]

  /* Boletos do condomínio: últimos 6 meses de cada casa. Vencem no dia 10 do mês seguinte. */
  const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
  const boletos = []
  units.forEach((u, ui) => {
    for (let k = 5; k >= 0; k--) {
      const ref = new Date()
      ref.setDate(1)
      ref.setMonth(ref.getMonth() - k)
      const venc = new Date(ref.getFullYear(), ref.getMonth() + 1, 10)
      const itens = [
        { item: 'Taxa condominial', valor: 680 },
        { item: 'Fundo de reserva (10%)', valor: 68 },
      ]
      if (u.id === 'u1' && k === 0) itens.push({ item: 'Reserva · Quiosque 1', valor: 50 })
      if (u.id === 'u1' && k === 2) itens.push({ item: 'Reserva · Salão de festas', valor: 350 })
      const vencido = venc < new Date() && k === 1 && (u.id === 'u7' || ui % 5 === 3)
      const pago = k > 0 && !vencido
      const id = `bl-${u.id}-${k}`
      const n = String(ui * 7 + k * 13 + 1000).padStart(4, '0')
      boletos.push({
        id, unitId: u.id, competencia: `${MESES[ref.getMonth()]}/${ref.getFullYear()}`,
        vencimento: `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, '0')}-10`,
        itens, valor: itens.reduce((a, b) => a + b.valor, 0),
        status: pago ? 'pago' : vencido ? 'vencido' : 'aberto',
        pagoEm: pago ? `${venc.getFullYear()}-${String(venc.getMonth() + 1).padStart(2, '0')}-0${(k % 8) + 1}` : null,
        linha: `34191.79001 01043.51004 7${n}1.020001 8 ${String(9000 + k * 31 + ui).padStart(4, '0')}0000000000`,
      })
    }
  })

  /* Agenda fixa da semana (0 = domingo … 6 = sábado) */
  const schedule = [
    { id: 'sc1', titulo: 'Coleta de lixo', tipo: 'lixo', dias: [2, 4, 6], horario: 'A partir das 7h', dica: 'Coloque os sacos bem fechados na lixeira da frente até as 7h.' },
    { id: 'sc2', titulo: 'Coleta de reciclagem', tipo: 'reciclagem', dias: [6], horario: 'A partir das 8h', dica: 'Separe papel, plástico, metal e vidro limpos. Vidro quebrado embrulhado em jornal.' },
    { id: 'sc3', titulo: 'Recolhimento de podas', tipo: 'poda', dias: [1], horario: 'Das 8h às 16h', dica: 'Deixe os galhos amarrados na calçada até as 8h. Entulho de obra não é recolhido.' },
    { id: 'sc4', titulo: 'Hidroginástica', tipo: 'atividade', dias: [2, 4], horario: '8h · Piscina', dica: 'Inscrição em Atividades.' },
    { id: 'sc5', titulo: 'Piscina fechada para manutenção', tipo: 'aviso', dias: [1], horario: 'Dia todo', dica: '' },
    { id: 'sc6', titulo: 'Futebol de domingo', tipo: 'atividade', dias: [0], horario: '8h · Campo de futebol', dica: 'Inscrição em Atividades.' },
  ]

  const contacts = [
    { id: 'c1', nome: 'Portaria', setor: 'Portaria 24h', telefone: '(15) 3333-1000', whatsapp: true, horario: '24 horas' },
    { id: 'c2', nome: 'Administração', setor: 'Secretaria', telefone: '(15) 3333-1001', whatsapp: true, horario: 'Seg a sex · 8h às 17h' },
    { id: 'c3', nome: 'Ricardo Almeida', setor: 'Síndico', telefone: '(15) 99812-4410', whatsapp: true, horario: 'Seg a sáb · 9h às 19h' },
    { id: 'c4', nome: 'Manutenção', setor: 'Zeladoria', telefone: '(15) 3333-1002', whatsapp: false, horario: 'Seg a sáb · 7h às 16h' },
    { id: 'c5', nome: 'Comissão Pets', setor: 'Animais comunitários', telefone: '(15) 99701-2290', whatsapp: true, horario: 'Mensagens' },
    { id: 'c6', nome: 'Polícia Militar', setor: 'Emergência', telefone: '190', emergencia: true },
    { id: 'c7', nome: 'SAMU', setor: 'Emergência', telefone: '192', emergencia: true },
    { id: 'c8', nome: 'Bombeiros', setor: 'Emergência', telefone: '193', emergencia: true },
    { id: 'c9', nome: 'CPFL (energia)', setor: 'Concessionária', telefone: '0800 010 1010', emergencia: true },
    { id: 'c10', nome: 'Sabesp (água)', setor: 'Concessionária', telefone: '0800 055 0195', emergencia: true },
  ]

  const roles = ['Morador', 'Síndico', 'Administradora', 'Conselho', 'Portaria']
  const permissions = {
    'Unidades e pessoas': ['ver', 'editar', 'editar', 'ver', 'ver'],
    Reservas: ['editar', 'editar', 'editar', 'ver', 'ver'],
    Comunicados: ['ver', 'editar', 'editar', 'ver', 'ver'],
    Votações: ['editar', 'editar', 'ver', 'ver', 'nenhum'],
    'Votos individuais': ['ver', 'ver', 'ver', 'ver', 'nenhum'],
    Autorizações: ['editar', 'ver', 'ver', 'nenhum', 'editar'],
    Transparência: ['ver', 'editar', 'editar', 'ver', 'nenhum'],
    Solicitações: ['editar', 'editar', 'editar', 'ver', 'ver'],
    'Denúncias anônimas': ['nenhum', 'ver', 'nenhum', 'ver', 'nenhum'],
    Configurações: ['nenhum', 'editar', 'ver', 'nenhum', 'nenhum'],
  }

  const notifications = [
    { id: 'nt2', para: 'p1', titulo: 'Comunicado urgente', texto: 'Interrupção de água na Quadra B.', em: at(0, '07:40'), lida: false, link: 'morador/comunicados/n1' },
    { id: 'nt3', para: 'p1', titulo: 'Nova votação aberta', texto: 'Próxima melhoria: vote até ' + addDays(t, 4).split('-').reverse().join('/') + '.', em: at(-3), lida: false, link: 'morador/votacoes/vt1' },
    { id: 'nt4', para: 'p1', titulo: 'Resposta na solicitação', texto: 'SOL-2026-0142: lâmpada comprada.', em: at(-1, '16:05'), lida: true, link: 'morador/solicitacoes/s1' },
    { id: 'nt5', para: 'admin', titulo: 'Reserva aguardando aprovação', texto: 'Salão de festas · Casa Noel Infante, 120.', em: at(-1, '20:14'), lida: false, link: 'admin/reservas' },
    { id: 'nt6', para: 'admin', titulo: 'Denúncia anônima recebida', texto: 'Entulho no terreno da Quadra G.', em: at(0, '06:50'), lida: false, link: 'admin/solicitacoes/s4' },
    { id: 'nt7', para: 'portaria', titulo: 'Nova autorização', texto: 'Cláudia Mendes · Noel Infante, 120.', em: at(-1, '21:00'), lida: false, link: 'portaria/autorizacoes' },
  ]

  const audit = [
    { id: 'lg1', em: at(-1, '20:14'), quem: 'Mariana Costa', acao: 'Pediu reserva', alvo: 'Salão de festas' },
    { id: 'lg2', em: at(-1, '21:00'), quem: 'Mariana Costa', acao: 'Autorizou visitante', alvo: 'Cláudia Mendes' },
    { id: 'lg3', em: at(-3, '10:00'), quem: 'Ricardo Almeida', acao: 'Publicou comunicado', alvo: 'Mapeamento das ruas' },
    { id: 'lg4', em: at(-3, '09:30'), quem: 'Ricardo Almeida', acao: 'Abriu votação', alvo: 'Próxima melhoria' },
    { id: 'lg5', em: at(-12), quem: 'Ricardo Almeida', acao: 'Publicou documento', alvo: 'Balancete de setembro/2026' },
    { id: 'lg6', em: at(0, '06:30'), quem: 'José Silva', acao: 'Registrou ocorrência', alvo: 'Portão da entrada 2' },
  ]

  const settings = {
    nome: 'Residencial Aquarius',
    cnpj: '12.345.678/0001-90',
    endereco: 'Estrada do Aquarius, 1000 · Sorocaba – SP',
    emailAdm: 'administracao@residencialaquarius.com.br',
    notificarPorEmail: true,
    notificarPorPush: true,
    reservaAntecedenciaMax: 90,
    cancelamentoSemTaxaHoras: 48,
    votoPadrao: 'unidade',
  }

  return {
    units, persons, ownership, vehicles, pets, communityAnimals, areas, reservations, blocks, news, votes,
    authorizations, accessLog, documents, finance, works, activities, requests,
    incidents, alerts, schedule, contacts, boletos, obras: createObras(), roles, permissions, notifications, audit, settings,
  }
}
