# Chapa Aquarius Sem Buracos — landing page

Landing page de campanha da chapa **Aquarius Sem Buracos**, candidata à administração do
Residencial Aquarius. Página única, em React, com bastante movimento e microinterações,
CTA "Fale conosco" no WhatsApp e formulário com **mensagem identificada ou denúncia anônima**.

Stack: **React 19 + Vite 8 + Tailwind CSS 4 + Motion (Framer Motion)**.

---

## Rodando o projeto

```bash
npm install
npm run dev       # ambiente local em http://localhost:5173
npm run build     # gera a pasta dist/ pronta para publicar
npm run preview   # serve a dist/ para conferir antes de publicar
```

---

## 1. O que precisa ser preenchido antes de publicar

Tudo que a chapa edita está em **`src/content.js`**. Procure por `TROCAR`.

| Onde | O que trocar |
| --- | --- |
| `config.whatsappNumber` | Número da chapa, só dígitos, com país e DDD (ex.: `5515999999999`). Hoje está com um número de exemplo. |
| `config.whatsappGroupUrl` | Link de convite do grupo de WhatsApp dos moradores. |
| `streets` | Fotos de antes/depois de cada rua (veja abaixo). |
| `config.formEndpoint` | Endereço que recebe o formulário (veja o item 2). |
| `config.electionDate` | Data da assembleia, se quiser divulgar. |
| `members` / `team` | Fabi e Latrofe: cargo, formação e experiência, e a foto de cada um (`public/assets/chapa/`). |
| `instagram` | Perfil da chapa e as últimas publicações (veja o item 3). |

As fotos de antes/depois das ruas vão em `public/assets/ruas/` (horizontais, de preferência 16:10)
e são apontadas em `streets`, em `src/content.js`. Enquanto uma rua não tiver foto, o comparador
mostra a ilustração:

```js
{ name: 'Rua Noel Infante',
  before: '/assets/ruas/noel-infante-antes.jpg', after: '/assets/ruas/noel-infante-depois.jpg' }
```

As fotos da seção "Quem compõe a chapa" ficam em `public/assets/chapa/` (`fabi.webp`/`fabi.jpg` e
`latrofe.webp`/`latrofe.jpg`, retrato 4:5). Em `members`, `photo` aponta para o nome sem extensão.

---

## 2. Ativando o formulário (obrigatório para a mensagem anônima)

O formulário tem dois modos:

- **Identificado** — funciona desde já mesmo sem configuração: monta a mensagem e abre o
  WhatsApp da chapa com tudo preenchido.
- **Mensagem anônima** — **precisa** de `config.formEndpoint`. O WhatsApp mostraria o número
  de quem envia, então a página não finge que o envio é anônimo: sem endpoint configurado,
  ela avisa o morador de que o canal ainda está sendo ativado, em vez de mandar por um meio
  que identifica a pessoa.

Como ativar em poucos minutos (exemplo com Formspree, mas serve qualquer serviço que aceite
`POST` com JSON — Basin, Getform, Google Apps Script, n8n, backend próprio):

1. Crie um formulário no serviço e copie a URL de envio.
2. Cole em `src/content.js`:
   ```js
   formEndpoint: 'https://formspree.io/f/SEU-ID',
   ```
3. `npm run build` e publique de novo.

O que é enviado em cada modo:

```jsonc
// identificado
{ "tipo": "mensagem-identificada", "nome": "…", "rua": "…", "telefone": "…", "mensagem": "…" }

// anônimo — só o texto é enviado
{ "tipo": "mensagem-anonima", "mensagem": "…" }
```

## 3. Instagram

A seção "Últimas do Instagram" é alimentada por `instagram` em `src/content.js`:

```js
export const instagram = {
  handle: '@chapaaquariussemburacos',          // TROCAR
  url: 'https://instagram.com/chapaaquarius…', // TROCAR
  posts: [
    { id: 1, image: '/assets/instagram/post-1.jpg',
      caption: 'Legenda curta', url: 'https://instagram.com/p/XXXX' },
  ],
}
```

As imagens vão em `public/assets/instagram/`. Enquanto `posts` estiver vazio, a seção mostra
apenas o convite para seguir o perfil — nada quebra.

O Instagram não libera mais o feed público sem token, então a lista é manual de propósito:
não depende de aprovação da Meta nem quebra sozinha. Se depois quiserem automatizar, dá para
plugar um serviço de feed (Behold, EmbedSocial, SnapWidget) preenchendo `posts` na mesma forma.

---

## 4. Apresentação (/apresentacao)

Em `/apresentacao/` fica uma apresentação em slides, feita para ser lida por todos:

- **Celular:** cada slide ocupa a tela, com letra grande, botões grandes "Anterior / Próximo"
  e deslizar para os lados. Slides longos continuam rolando a página.
- **Computador:** formato 16:9, como um PowerPoint (setas do teclado também funcionam).
- **Baixar PDF:** um slide por página. Os itens das propostas aparecem sempre abertos.

Os textos vêm de `src/content.js` (os mesmos do site). **Sempre que mudar o conteúdo,
gere o PDF de novo**, com o servidor rodando (`npm run dev`):

```bash
npm run pdf   # grava public/apresentacao/aquarius-sem-buracos.pdf
```

Se o Playwright não achar o Chrome sozinho, informe o caminho em `CHROME_PATH`.

## 5. Publicando

O build gera arquivos estáticos em `dist/` — serve em qualquer hospedagem.

- **Vercel / Netlify**: importe o repositório. Build: `npm run build`. Diretório: `dist`.
- **Hospedagem comum (cPanel, S3, etc.)**: rode `npm run build` e suba o conteúdo de `dist/`.

Depois de definir o domínio, ajuste em `index.html` a tag `<link rel="canonical">` e o
`og:image` (`https://…/assets/og-image.jpg`), usados no compartilhamento por WhatsApp.

---

## Estrutura

```
public/assets/       logo em webp/png, ícones, imagem de compartilhamento
src/content.js       TODO o texto e as configurações da página
src/lib/motion.js    curvas, durações e variantes de animação compartilhadas
src/components/      Nav, botões, carrossel, formulário, ilustrações SVG, faixas
src/sections/        as seções na ordem em que aparecem
src/apresentacao/    a apresentação em slides (/apresentacao)
scripts/             gerar-pdf-apresentacao.mjs (npm run pdf)
```

Ordem da página e cor de cada bloco:

| # | Seção | Arquivo | Fundo |
| --- | --- | --- | --- |
| 1 | Header | `components/Nav.jsx` | transparente → navy |
| 2 | Hero | `sections/Hero.jsx` | navy escuro |
| 3 | Faixas rolantes | `components/TickerBand.jsx` | amarelo sobre navy |
| 4 | Ruas: hoje e amanhã (comparador) | `sections/Solution.jsx` | claro |
| 5 | Propostas (6 temas) | `sections/Proposals.jsx` | branco |
| 6 | Quem compõe a chapa (Fabi e Latrofe) | `sections/Team.jsx` | navy |
| 7 | Faça parte | `sections/ChangeCta.jsx` | **amarelo** |
| 8 | Instagram (carrossel) | `sections/InstagramFeed.jsx` | branco |
| 9 | Fale conosco | `sections/Contact.jsx` | navy escuro |
| 10 | Fechamento / rodapé | `sections/Closing.jsx` | navy |

As ilustrações da seção "A rua que temos e a rua que queremos" são **desenhos vetoriais**
(`src/components/RoadScene.jsx`), não fotos do condomínio, e estão identificadas como
"Ilustração da proposta" na própria página.

---

## Acessibilidade e movimento

- Todo o movimento respeita `prefers-reduced-motion`: quem tem a opção ligada no aparelho
  recebe a página inteira sem deslocamentos, sem paralaxe e sem loops.
- Navegação por teclado em toda a página, incluindo os carrosséis (botões e rolagem),
  o comparador de ruas (setas, Home/End) e o menu do celular (Esc fecha).
- Amarelo nunca é usado como cor de texto sobre fundo claro (`gold-400` sobre branco dá 1,6:1).
  Quando precisa de amarelo escrito, existe o token `gold-ink`; quando precisa de destaque,
  vira faixa amarela com texto navy.
- Campos do formulário com rótulo visível, erro descrito em texto e `aria-invalid`.
