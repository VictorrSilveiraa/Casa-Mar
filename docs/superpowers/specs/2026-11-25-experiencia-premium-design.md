# Experiência premium da homepage — design

Data: 25/11/2026 · Status: **aguardando aprovação**

## 1. Intenção

O site funciona e é bonito, mas o proprietário o descreve como "genérico, estático, sem graça". Hoje só um elemento tem animação de entrada (o wordmark "PRAIAMAR" do rodapé); todo o resto aparece pronto, e várias seções seguem o mesmo molde (título, texto, foto). O objetivo é levar a homepage ao nível de direção visual e acabamento dos sites de hotelaria de luxo reconhecidos em galerias como a Awwwards, **sem encher a página de animações**: cada seção ganha um momento próprio, a página tem uma abertura a cada carregamento, e o movimento serve à leitura e à fotografia.

Referência apontada pelo proprietário: **tengilemalamala.com**. O que aproveitamos dela: tela de abertura na cor da marca com o símbolo se revelando e depois abrindo para a foto; capa em tela cheia com título grande; ritmo editorial com muito respiro; seções que não repetem a composição. O que **não** aproveitamos: a abertura de ~6 s (longa demais para quem dá F5), a rolagem suavizada artificial (Lenis) e o título todo em maiúsculas (fora das nossas regras de tipografia).

Régua de qualidade para o movimento: skills de Emil Kowalski (`animate`, `choreograph`, `animation-performance`, `review-animations`), instaladas em `~/.claude/skills`.

## 2. Metas, não-metas e anti-metas

**Metas**
- Abertura (loader) a cada carregamento da página, curta e ligada ao carregamento real da foto de capa.
- Cada seção com um "momento assinatura" diferente, coerente com a foto e o texto dela.
- Revelações ao rolar que acontecem **uma vez** por elemento, nunca de novo ao subir e descer.
- Microinterações refinadas em botões, links e imagens (só em dispositivos com mouse).
- Site continua leve: nenhuma biblioteca nova, JavaScript de movimento < 4 KB.

**Não-metas**
- Não mudar textos, fatos, fotos, paleta, famílias ou papéis tipográficos.
- Não adicionar páginas, seções ou conteúdo.
- Não redesenhar do zero: a estrutura de seções atual permanece; mudam composição pontual e movimento.

**Anti-metas (seria fracasso mesmo funcionando)**
- O visitante esperar o site terminar de "se apresentar" para conseguir ler ou clicar.
- Tudo se mexendo: parágrafos voando, ícones pulando, cada linha com efeito.
- Parallax, rolagem sequestrada/suavizada, seções fixadas que prendem a rolagem, cursor personalizado, marquee.
- Conteúdo escondido sem JavaScript ou para quem pede menos movimento.
- Salto de layout (CLS) ou piora da foto de capa (LCP) perceptível.

## 3. Restrições

- `AGENTS.md`: sem bibliotecas pesadas de animação; sem parallax nem scroll-jacking; entradas só escondem conteúdo com `html.js`; `prefers-reduced-motion` obrigatório; hover de imagem 1,02–1,04 com `--dur-image`.
- `docs/REGRAS-TIPOGRAFIA.md`: tamanhos e pesos fixos (Display XL 88/48 px, Display L 56/40 px etc.). O movimento não altera tamanho de texto.
- Stack: Next.js 16 App Router, CSS Modules, componentes de servidor com poucos componentes cliente.
- Logo disponível só como PNG (`assets/brand/praiamar-*-original.png`): símbolo (sol sobre bloco com ondas) + wordmark "PRAIAMAR". A abertura usa recortes desse arquivo, não um desenho vetorial novo.

## 4. Abordagens consideradas

| | Abordagem | Prós | Contras |
|---|---|---|---|
| **A (escolhida)** | **Cortina editorial**: CSS (transições em `transform`, `opacity`, `clip-path`) + um único `IntersectionObserver`, sem dependências | Leve, acessível, dentro das regras, rolagem nativa, fácil de manter | Sem efeitos atrelados à posição exata da rolagem |
| B | Cinematográfico com GSAP + ScrollTrigger + Lenis: seções fixadas, rolagem horizontal, parallax | Mais próximo de muitos premiados | +60–80 KB de JS, quebra o `AGENTS.md`, pesa no celular, risco de acessibilidade |
| C | Só polimento: loader + revelações sobre o layout atual | Rápido | Mantém a cara de template, pois parte do problema é composição |

O proprietário deixou a escolha a critério técnico; **A** foi escolhida.

## 5. Sistema de movimento

### 5.1 Tokens (adicionar em `app/globals.css`, sem remover os atuais)

```css
--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);     /* entradas */
--ease-in-out-strong: cubic-bezier(0.77, 0, 0.175, 1); /* cortinas e movimentos na tela */
--dur-reveal: 900ms;        /* texto e cortinas de imagem */
--dur-settle: 1400ms;       /* imagem "assentando" (escala) */
--dur-loader-exit: 900ms;   /* saída da abertura */
--reveal-distance: 28px;    /* subida de títulos (mobile: 18px) */
```

Os tokens existentes (`--ease-out`, `--dur-*`) continuam valendo para hover e microinterações. Nunca `ease-in`, nunca `transition: all`, nunca `scale(0)`.

### 5.2 Primitivas (reutilizáveis, aplicadas por atributo)

| Primitiva | Atributo | Estado inicial (só com `html.js`) | Estado final | Tempo |
|---|---|---|---|---|
| Título em linhas | `data-reveal="lines"` | cada linha dentro de máscara (`overflow: clip`), deslocada `translateY(105%)` | `translateY(0)` | `--dur-reveal`, `--ease-out-strong`, linhas com atraso decrescente 0 / 110 / 90 / 70 ms |
| Texto de apoio | `data-reveal="fade"` | `opacity: 0; translateY(12px)` | normal | 700 ms, `--ease-out-strong` |
| Cortina de imagem | `data-reveal="image"` | moldura `clip-path: inset(100% 0 0 0)`; imagem `scale(1.12)` | `inset(0)`; `scale(1)` | moldura `--dur-reveal` `--ease-in-out-strong`; imagem `--dur-settle` `--ease-out-strong` |
| Cortina lateral | `data-reveal="image-x"` | `clip-path: inset(0 100% 0 0)` | `inset(0)` | igual à cortina |
| Janela que se abre | `data-reveal="window"` | `clip-path: inset(9% 7% round 2px)`; imagem `scale(1.08)` | `inset(0)`; `scale(1)` | 1200 ms `--ease-in-out-strong` |
| Filete | `data-reveal="rule"` | `transform: scaleX(0)`, origem à esquerda | `scaleX(1)` | 1000 ms `--ease-out-strong` |

Disparo: um único `IntersectionObserver` (`threshold: 0.18`, `rootMargin: 0px 0px -8% 0px`) marca `data-visible` **uma vez** e para de observar o elemento. Grupos usam `--reveal-delay` por item (custom property no próprio elemento, não no pai).

Divisão em linhas: utilitário pequeno que envolve palavras em `<span>`, agrupa por `offsetTop` e recalcula no `resize` (com debounce), só antes de o elemento ser revelado. O texto continua um único nó legível para leitores de tela (spans sem `aria-hidden`); sem JS, nada é dividido.

### 5.3 Regras de coreografia (de `choreograph`)

- Uma entrada por contêiner: se a moldura da imagem tem cortina, a imagem só "assenta" (não entra de novo).
- Por seção há **um protagonista** (Lead) e no máximo dois coadjuvantes; o resto é estático.
- Atrasos decrescentes (nunca iguais), total de cada grupo ≤ ~600 ms em seções de marketing.
- Nada bloqueia clique: elementos são interativos assim que visíveis.

### 5.4 Movimento reduzido e sem JavaScript

- `prefers-reduced-motion: reduce`: todas as primitivas viram **apenas opacidade** (300 ms, sem deslocamento, escala ou cortina); abertura reduzida a símbolo estático + fade de 300 ms; cabeçalho não se esconde.
- Sem JavaScript: a classe `js` não existe, nenhum estado inicial se aplica, a abertura não aparece. Tudo visível.

## 6. Abertura (loader)

**Quando:** a cada carregamento completo da página (F5, primeira visita, link direto). **Não** reaparece ao voltar pelo histórico com a página em cache (`pageshow` com `persisted`).

**Como funciona**
1. Um script inline mínimo no `<head>` adiciona `js` ao `<html>` antes da primeira pintura (já previsto no `AGENTS.md`).
2. A abertura é HTML renderizado no servidor, fixa sobre tudo (`--z-loader: 80`), fundo `--color-olive-deep`, visível só com `html.js`. Rolagem do fundo bloqueada enquanto ela está na tela. `aria-hidden="true"`; o conteúdo da página já está no DOM.
3. A foto de capa continua carregando com prioridade alta por baixo; a abertura não atrasa o download.

**Linha do tempo**

| Tempo | Elemento | Papel | Movimento |
|---|---|---|---|
| 0 ms | fundo oliva | estático | já pintado |
| 80 ms | símbolo (sol + ondas, branco) | Lead | cortina de baixo para cima, 700 ms `--ease-out-strong` |
| 380 ms | wordmark "PRAIAMAR" | Support | cortina da esquerda para a direita, 800 ms `--ease-out-strong` (sobrepõe o símbolo) |
| 380 ms | filete de 1 px (`--color-line-inverse`) sob o wordmark | Decoração | `scaleX` 0→1 linear até a capa decodificar |
| **saída** | painel inteiro | Lead | sobe `translateY(-100%)`, `--dur-loader-exit` `--ease-in-out-strong` |
| saída +0 ms | foto de capa | Support | `scale(1.08)→1`, `--dur-settle` |
| saída +250 ms | cabeçalho | Support | opacidade 0→1, 500 ms |
| saída +300 ms | título da capa | Support | `lines` (2 linhas, 0/110 ms) |
| saída +520 ms | eyebrow, frase de apoio, botão | Support | `fade`, 0/60/110 ms |

**Saída** acontece quando as duas condições são verdadeiras: (a) mínimo de **1100 ms** desde o início (o símbolo e o wordmark completam) e (b) a foto de capa decodificou (`img.decode()`), **ou** quando chega o teto de **2400 ms**, o que vier primeiro. Resultado esperado: ~1,3–1,8 s numa conexão boa.

## 7. Seção a seção

Cada seção recebe um momento assinatura (Lead). Composição muda só onde indicado.

| Seção | Fundo | Momento assinatura | Coadjuvantes | Ajuste de composição |
|---|---|---|---|---|
| **Cabeçalho** | — | some ao rolar para baixo depois da capa e reaparece ao rolar para cima (`translateY(-100%)`, 400 ms `--ease-out-strong`) | sublinhado dos links desenha da esquerda (hover) | nenhum |
| **Capa** | foto | sequência pós-abertura (§6) | indicador de rolagem: filete vertical desenha uma vez | nenhum |
| **A Casa** | off-white | foto em cortina de baixo para cima com assentamento | título em linhas; parágrafos `fade` juntos | foto passa a sangrar até a borda esquerda da tela no desktop (≥ 1024 px), texto mantém a coluna |
| **Nossas suítes** | oliva | trilha de fotos entra da direita (`translateX(64px)` + opacidade, 1000 ms), como um bloco | título em linhas; contador e controles `fade` | nenhum |
| **Diferenciais** | off-white | filetes entre os itens desenham da esquerda, um após o outro (0/120/220/300 ms) | título em linhas; foto em cortina | nenhum (foto fixa já existente é mantida) |
| **Ambientes** | off-white | três fotos em cortina, atrasos 0/140/240 ms | título em linhas (centralizado); legendas `fade` com a foto | nenhum (grade simétrica aprovada pelo proprietário) |
| **Hospitalidade** | oliva profundo | foto em cortina lateral (da esquerda) | título em linhas; filete superior dos parágrafos desenha; parágrafos `fade` | nenhum |
| **Experiências** | foto | **janela que se abre**: a foto começa recuada e se expande até sangrar na tela | título em linhas; texto e botão `fade` | nenhum |
| **Localização** | areia | foto em cortina de baixo para cima | título em linhas; filete da linha "Praia de Arpoeiras" desenha | nenhum |
| **Perguntas** | off-white | título em linhas (só ele) | — | abertura das respostas com transição de altura onde o navegador suportar (`::details-content` + `interpolate-size`), 300 ms; sem suporte, abre na hora |
| **Convite final** | foto | foto assenta (`scale 1.08→1`) ao entrar | título em linhas; frase e botão `fade` | nenhum |
| **Rodapé** | grafite | wordmark já existente (mantido) | — | nenhum |

**O que não se move, de propósito:** parágrafos individuais (entram juntos com o bloco, sem cascata), itens das perguntas, botões do carrossel, links do rodapé, ícones.

## 8. Microinterações (só `@media (hover: hover) and (pointer: fine)`)

- Botões com borda: preenchimento sobe de baixo (`clip-path` em pseudo-elemento, 320 ms `--ease-out-strong`; saída 200 ms); texto troca de cor junto.
- Links de navegação: sublinhado de 1 px desenha da esquerda (`scaleX`, 300 ms) e sai pela direita.
- Fotos clicáveis/destacadas: zoom 1,03 em `--dur-image` (já previsto no `AGENTS.md`).
- Pressão (`:active`) em botões: `scale(0.98)`, 120 ms.

## 9. Desempenho e verificação

- Animar apenas `transform`, `opacity` e `clip-path`. `will-change` só durante a revelação e removido depois.
- JS de movimento num único componente cliente (`MotionController`) + o componente da abertura; meta < 4 KB comprimido.
- Medir Lighthouse mobile **antes e depois** (performance, LCP, CLS). Critério de aceite: CLS = 0 e LCP sem piora maior que 300 ms em relação à medição de antes. Se piorar mais, reduzir o teto da abertura.
- Validação existente (`npm run validate:browser`) continua passando; adicionar checagens: abertura some sozinha em ≤ 2,6 s; com movimento reduzido nada fica com `transform` aplicado; sem JS tudo visível; nenhuma revelação reexecuta ao rolar de volta.
- Gravar a abertura e uma seção e conferir quadro a quadro (onda vs. fila), como pedem as skills.
- O `validate-site.mjs` precisa esperar a abertura sair antes de medir e **rolar a página inteira antes das capturas de página cheia**; caso contrário, as revelações ainda não disparadas aparecem vazias nas imagens.

**Casos de borda a cobrir na implementação**
- Cabeçalho: não se esconde com o menu mobile aberto, nem com foco de teclado dentro dele, nem antes do fim da capa (o teste atual troca o logo em `scrollY = 80`).
- Link direto com âncora (ex.: `/#informacoes`): a abertura roda normalmente e, ao sair, a página já está na âncora; seções acima ficam por revelar até o visitante subir.
- Seções revelam no máximo uma vez; elementos que já estão na tela no fim da abertura revelam na sequência dela, não todos juntos.
- Fotos dentro da galeria (`<dialog>`) e do carrossel durante a navegação pelas setas não recebem revelação.
- Redimensionar a janela depois da revelação não refaz a divisão em linhas.

## 10. Decididos pelo proprietário

- Caminho A (cortina editorial).
- Abertura a cada F5.
- Referência: tengilemalamala.com e padrão Awwwards, sem excesso de animação.
- Manter tipografia (Newsreader + Urbanist), paleta e textos oficiais.

## 11. Decisões técnicas (podem ser revistas)

- Abertura com teto de 2,4 s e mínimo de 1,1 s, ligada à foto de capa; não reaparece no "voltar" do navegador.
- Fundo da abertura em `--color-olive-deep` (contraste com o branco do logo já validado).
- Cabeçalho que se esconde ao rolar para baixo.
- Foto da seção "A Casa" sangrando até a borda no desktop.
- Abertura suave das perguntas só onde o navegador suporta nativamente.
- Rolagem nativa; nada atrelado à posição exata da rolagem.

## 12. A cargo de quem implementa

- Nomes de componentes e arquivos (sugestão: `components/Loader.tsx`, `components/MotionController.tsx`, `lib/motion.ts`).
- Recorte exato do símbolo e do wordmark a partir do PNG (gerar AVIF/WebP pelo script de marca existente).
- Ajuste fino de distâncias e atrasos após gravação, dentro das faixas deste documento.
- Commits por etapa: (1) tokens + primitivas + controlador; (2) abertura; (3) seções; (4) microinterações; (5) verificação.
