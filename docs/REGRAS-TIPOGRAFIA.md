# Regras de tipografia — Casa Praia Mar

> Regra obrigatória para todo o site. Ao criar ou editar qualquer texto, use **somente** as fontes, tamanhos, pesos, entrelinhas e espaçamentos definidos aqui. Não invente valores novos: se um elemento novo não estiver na tabela, use o papel mais parecido (ver "Regras para novas seções").
> Este documento trata só de tipografia. Cores ficam fora.

---

## 1. Famílias de fonte

Duas famílias, sem exceção. Ambas são do Google Fonts (licença livre).

| Papel | Fonte | Pesos permitidos | Fallback |
|---|---|---|---|
| **Display (serifa)** — títulos e frases de destaque | **Newsreader** | 300 (leve) e 400 (regular) | `Georgia, serif` |
| **Texto e interface (sans)** — todo o resto | **Urbanist** | 300, 400 e 500 | `system-ui, sans-serif` |

> **Troca de fonte (25/11/2026):** Jost foi substituída por **Urbanist** em todo o site, mantendo os mesmos papéis e pesos. Como a Urbanist tem espaçamento natural mais fechado, textos corridos (Corpo e Corpo L) usam `letter-spacing: 0.025em` (token `--tracking-body`), e parágrafos usam `text-wrap: pretty` para evitar palavra sozinha na última linha. Newsreader continua sem espaçamento positivo. Fontes hospedadas localmente em `app/fonts/` (não usar o link do Google abaixo em produção).

Importação:

```html
<link href="https://fonts.googleapis.com/css2?family=Urbanist:wght@300;400;500&family=Newsreader:opsz,wght@6..72,300;6..72,400&display=swap" rel="stylesheet">
```

Variáveis:

```css
:root {
  --font-display: 'Newsreader', Georgia, serif;
  --font-sans: 'Urbanist', system-ui, sans-serif;
}
```

Newsreader usa o eixo de tamanho óptico: mantenha `font-optical-sizing: auto` (padrão do navegador).

---

## 2. Escala tipográfica (vigente desde 25/11/2026)

**Estratégia:** uma escala única, **fluida**, definida só em tokens no `:root` de `app/globals.css`. Cada papel tem um valor de referência no **mobile (390px)** e no **desktop (1440px)**; entre os dois o tamanho cresce de forma contínua (`clamp()`), e acima de 1440px continua crescendo pouco até um teto, para telas grandes não parecerem vazias. Nenhum componente declara tamanho de fonte próprio: usa o token do papel.

Por que assim: tamanhos fixos deixavam o texto pequeno em monitores grandes e criavam saltos bruscos no breakpoint; a Urbanist é visualmente menor que a Jost, então o corpo subiu; e a hierarquia ficou mais clara (título de seção ≈ 3× o corpo no desktop, ≈ 2× no mobile).

| Papel | Token | Fonte / peso | Mobile 390 | Desktop 1440 | Teto | Entrelinha | Espaçamento |
|---|---|---|---|---|---|---|---|
| Display XL — título da hero (h1) | `--text-display` | Newsreader 300 | 48px | 96px | 112px | 1.0 / 0.98 | −0.02em |
| Display L — título de seção (h2) | `--text-h2` | Newsreader 300 | 36px | 60px | 68px | 1.1 / 1.06 | −0.02em |
| Display M — destaques, h3, fecho | `--text-h3` | Newsreader 400 | 22px | 26px | 28px | 1.35 | −0.005em |
| Pergunta (FAQ) | `--text-question` | Urbanist 400 | 17px | 20px | 21px | 1.4 | 0.025em |
| Corpo L — apoio sobre foto, frase de abertura | `--text-lead` | Urbanist 300 | 18px | 21px | 22px | 1.55 | 0.025em |
| Corpo — parágrafos | `--text-body` | Urbanist 300 | 17px | 19px | 20px | 1.72 / 1.7 | 0.025em |
| Ação — botões (MAIÚSCULAS) | `--text-action` | Urbanist 300 | 15px | 16px | 16px | normal | 0.12em |
| UI — menu, links do rodapé | `--text-small` | Urbanist 300–400 | 15px | 16px | 16px | normal | 0.03em |
| Menu mobile (tela cheia) | — | Urbanist 300 | 18px | — | — | normal | 0.06em |
| Rótulo / overline (MAIÚSCULAS) | `--text-label` / `--text-eyebrow` | Urbanist 400 | 12px | 13px | 13px | normal | 0.2em |

Regras de composição que acompanham a escala:

- **Largura de leitura:** parágrafos limitados a ~60 caracteres (`--container-text` / `max-width` em `rem`); apoio sobre foto até 30–32rem.
- **Títulos:** `text-wrap: balance`; limites de largura em `rem`/colunas, não em px fixos que quebrem a frase em 3 linhas curtas. Conferir sempre em 390, 1024, 1440 e 1920px.
- **Parágrafos:** `text-wrap: pretty` (evita palavra sozinha na última linha).
- **Breakpoint de entrelinha e espaçamentos:** 900px (só ajustes de entrelinha e layout; tamanhos são fluidos).

As tabelas antigas por elemento (cabeçalho, hero, barra de reserva) foram substituídas por esta escala; a barra de reserva não existe mais (ver `AGENTS.md` §10).

---

## 3. Regras para novas seções

Use **somente** os papéis e tokens da tabela acima. Se um texto novo não se encaixar, use o papel mais parecido; não crie tamanho novo.

Proibido:

- Qualquer outra fonte além de Newsreader e Urbanist.
- Pesos 600, 700 ou mais (nada de negrito pesado), e itálico.
- Destacar uma única palavra de um título com outra cor, peso ou estilo.
- MAIÚSCULAS fora do nome da marca, do overline, dos botões e do menu.
- Espaçamento positivo entre letras em Newsreader. Em Newsreader, só zero ou negativo.
- Título (Display) com entrelinha acima de 1.1.
- `font-size` com valor solto (px/rem) em componente: sempre um token.

Padrões fixos:

- Newsreader só em títulos e frases de destaque; todo o resto é Urbanist.
- Texto em frase normal (só a primeira letra maiúscula), exceto os casos de MAIÚSCULAS acima.
- Botão sempre diz a ação: "Reservar", "Conheça nossa casa".

## 4. CSS pronto (opcional)

Os valores vivem nos tokens de `app/globals.css`; estas classes só os aplicam.

```css
.t-display-xl { font-family: var(--font-display); font-weight: 300; font-size: var(--text-display); line-height: var(--leading-display); letter-spacing: -.02em; }
.t-display-l  { font-family: var(--font-display); font-weight: 300; font-size: var(--text-h2); line-height: var(--leading-heading); letter-spacing: -.02em; text-wrap: balance; }
.t-display-m  { font-family: var(--font-display-regular); font-weight: 400; font-size: var(--text-h3); line-height: var(--leading-highlight); letter-spacing: -.005em; }
.t-question   { font-family: var(--font-sans-ui); font-weight: 400; font-size: var(--text-question); line-height: 1.4; }
.t-lead       { font-family: var(--font-sans); font-weight: 300; font-size: var(--text-lead); line-height: var(--leading-lead); }
.t-body       { font-family: var(--font-sans); font-weight: 300; font-size: var(--text-body); line-height: var(--leading-body); max-width: var(--container-text); text-wrap: pretty; }
.t-action     { font-family: var(--font-sans); font-weight: 300; font-size: var(--text-action); letter-spacing: .12em; text-transform: uppercase; }
.t-label      { font-family: var(--font-sans-ui); font-weight: 400; font-size: var(--text-label); letter-spacing: .02em; }
.t-overline   { font-family: var(--font-sans-ui); font-weight: 400; font-size: var(--text-eyebrow); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; }
```
