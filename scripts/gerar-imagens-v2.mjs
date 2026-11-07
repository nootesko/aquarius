/* Gera as fotos da apresentação v2 com a API de imagens da OpenAI.
   Uso:  node scripts/gerar-imagens-v2.mjs            (gera só as que ainda não existem)
         node scripts/gerar-imagens-v2.mjs pets salao (gera/regera só essas)
   A chave vem de OPENAI_API_KEY (ambiente ou .env.local). Salva em public/assets/v2/<id>.jpg. */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outDir = join(root, 'public/assets/v2')

function loadEnvLocal() {
  const f = join(root, '.env.local')
  if (!existsSync(f)) return
  for (const line of readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^['"]|['"]$/g, '')
  }
}
loadEnvLocal()

const key = process.env.OPENAI_API_KEY
if (!key) {
  console.error('Falta OPENAI_API_KEY (crie .env.local na raiz com OPENAI_API_KEY=...).')
  process.exit(1)
}
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2'
const quality = process.env.OPENAI_IMAGE_QUALITY || 'high'

const STYLE =
  'Fotografia realista, documental, luz natural de fim de tarde, cores quentes e vivas, céu azul. ' +
  'Residencial horizontal de casas térreas no interior de São Paulo (região de Sorocaba), muito verde, ruas arborizadas. ' +
  'Sem nenhum texto, letreiro, placa legível, logotipo ou marca d’água na imagem. Pessoas, se houver, brasileiras e diversas, naturais, sem olhar para a câmera.'

const IMAGES = [
  {
    id: 'seguranca-poste',
    prompt:
      'Poste de segurança metálico cinza-grafite com braço horizontal e uma câmera de segurança tipo domo (speed dome) branca pendurada na ponta, e uma segunda câmera tipo bullet presa mais abaixo no poste. ' +
      'Vista de baixo para cima, céu azul limpo, copas de árvores verdes ao fundo, dentro de um residencial arborizado. Foco nítido nas câmeras. Sem portaria, sem cancela, sem pessoas, sem carros.',
  },
  {
    id: 'salao',
    prompt:
      'Salão de festas de um clube de residencial, amplo, com cobertura de telhado aparente, piso claro, mesas e cadeiras organizadas, ' +
      'portas de vidro abertas para um gramado. Um engenheiro de capacete branco e uma moradora conversam olhando uma prancheta com plantas.',
  },
  {
    id: 'estatuto-maos',
    prompt:
      'Close de várias mãos levantadas para votar, erguidas para o alto, de diferentes tons de pele, contra um teto claro de salão comunitário. ' +
      'Só as mãos e um pouco dos antebraços aparecem: nenhum rosto, nenhuma cabeça, nenhum corpo inteiro. Profundidade de campo rasa, luz natural.',
  },
  {
    id: 'pets-caramelo',
    prompt:
      'Um cachorro vira-lata caramelo e um gato malhado (tigrado cinza e marrom) sentados lado a lado na grama verde, olhando para a frente, tranquilos e saudáveis. ' +
      'Fundo desfocado de jardim arborizado de residencial, luz suave de fim de tarde. Só os dois animais, sem pessoas.',
  },
  {
    id: 'carteiro-chacara',
    prompt:
      'Um carteiro de uniforme genérico amarelo e azul, sem logotipo, entregando um envelope em mãos para uma senhora idosa sorridente, de cabelos grisalhos, ' +
      'que está do lado de dentro de um portão rústico de madeira de uma chácara, com cerca, gramado e árvores grandes ao fundo. Estrada de terra batida bem cuidada na frente do portão.',
  },
]

async function generate(img) {
  const r = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      prompt: `${img.prompt}\n\n${STYLE}`,
      size: '1024x1536',
      quality,
      output_format: 'jpeg',
      n: 1,
    }),
  })
  const data = await r.json().catch(() => null)
  if (!r.ok) throw new Error(`${r.status} ${data?.error?.code ?? ''} ${data?.error?.message ?? ''}`)
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) throw new Error('resposta sem imagem')
  return Buffer.from(b64, 'base64')
}

const only = process.argv.slice(2)
const todo = IMAGES.filter((i) => (only.length ? only.includes(i.id) : !existsSync(join(outDir, `${i.id}.jpg`))))
if (!todo.length) {
  console.log('Nada a gerar (todas já existem). Passe os ids para regerar.')
  process.exit(0)
}
mkdirSync(outDir, { recursive: true })
console.log(`Gerando ${todo.length} imagem(ns) com ${model} (${quality})...`)

const results = await Promise.allSettled(
  todo.map(async (img) => {
    const buf = await generate(img)
    writeFileSync(join(outDir, `${img.id}.jpg`), buf)
    console.log(`  ok  ${img.id}.jpg (${Math.round(buf.length / 1024)} KB)`)
  }),
)
let failed = 0
results.forEach((res, i) => {
  if (res.status === 'rejected') {
    failed++
    console.error(`  erro ${todo[i].id}: ${res.reason.message}`)
  }
})
process.exit(failed ? 1 : 0)
