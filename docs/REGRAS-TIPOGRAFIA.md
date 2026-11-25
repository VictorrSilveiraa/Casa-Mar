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

> **Troca de fonte (25/11/2026):** Jost foi substituída por **Urbanist** em todo o site, mantendo os mesmos papéis e pesos. Como a Urbanist tem espaçamento natural mais fechado, textos corridos (Corpo e Corpo L) usam `letter-spacing: 0.012em` (token `--tracking-body`), e parágrafos usam `text-wrap: pretty` para evitar palavra sozinha na última linha. Newsreader continua sem espaçamento positivo. Fontes hospedadas localmente em `app/fonts/` (não usar o link do Google abaixo em produção).

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

## 2. Escala tipográfica

Breakpoint único: **900px**. Acima é desktop; até 900px é mobile (referência de design: 390px).

### Cabeçalho

| Elemento | Fonte | Peso | Tamanho (desktop / mobile) | Entrelinha | Espaçamento entre letras | Observações |
|---|---|---|---|---|---|---|
| Nome da marca ao lado da logo | Urbanist | 400 | 15px / 11px | normal | 0.24em (mobile 0.22em) | MAIÚSCULAS, sem quebra de linha |
| Links do menu (A casa, Suítes…) | Urbanist | 400 | 15px / — (menu some no mobile) | normal | 0.03em | Primeira letra maiúscula apenas; espaço de 44px entre links |
| Troca de idioma (PT / EN) | Urbanist | 400 | 14px / — (some no mobile) | normal | 0.06em | MAIÚSCULAS |
| Botão "Reservar" | Urbanist | 500 | 15px / 14px | normal | 0.04em | Altura mínima 46px (mobile 44px) |

### Hero

| Elemento | Fonte | Peso | Tamanho (desktop / mobile) | Entrelinha | Espaçamento entre letras | Observações |
|---|---|---|---|---|---|---|
| Título (H1) | Newsreader | 300 | **88px / 48px** | 0.98 (mobile 1.0) | −0.02em | Duas linhas, quebra manual; sombra de texto suave `0 2px 28px` (mobile `0 2px 24px`) só para ler sobre a foto |
| Frase de apoio | Urbanist | 300 | 19px / 16px | 1.55 (mobile 1.5) | 0.012em | Largura máxima 430px (mobile 320px); margem acima do texto: 26px (mobile 16px) |
| Link "Conhecer a casa" | Urbanist | 500 | 16px / — (não aparece no mobile) | normal | 0.02em | Sublinhado de 1px; margem acima: 18px |
| "Role" (indicador de rolagem) | Urbanist | 400 | 13px / — (some no mobile) | normal | 0.14em | Texto na vertical |

### Barra de reserva

| Elemento | Fonte | Peso | Tamanho (desktop / mobile) | Entrelinha | Espaçamento entre letras |
|---|---|---|---|---|---|
| Rótulo do campo (Chegada, Saída, Hóspedes) | Urbanist | 400 | 13px / 12px | normal | 0.02em |
| Valor do campo (data, hóspedes) | Urbanist | 400 | 18px / 16px | normal | normal |
| Botão "Ver disponibilidade" | Urbanist | 500 | 16px | normal | 0.02em |

Espaço entre o rótulo e o valor do campo: 6px (mobile 4px).

### Seção "Um convite para desacelerar" (modelo para as próximas seções)

| Elemento | Fonte | Peso | Tamanho (desktop / mobile) | Entrelinha | Espaçamento entre letras | Observações |
|---|---|---|---|---|---|---|
| Rótulo da seção (overline) | Urbanist | 400 | 13px / 12px | normal | 0.2em | MAIÚSCULAS; fio de 1px (40px de largura, mobile 32px) antes do texto, com 16px de espaço |
| Título (H2) | Newsreader | 300 | **56px / 40px** | 1.06 (mobile 1.08) | −0.02em | Margem acima: 36px (mobile 28px) |
| Parágrafo de texto | Urbanist | 300 | 18px / 17px | 1.75 | 0.012em | Largura máxima 460px; margem acima do primeiro: 40px; entre parágrafos: 20px (mobile 18px) |
| Frase de fecho | Newsreader | 400 | 24px / 22px | 1.35 | −0.005em | Fio de 1px acima; 28px de espaço entre o fio e o texto (mobile 26px); margem acima: 48px (mobile 40px) |

Espaçamento da seção: 140px acima e abaixo e 56px de margem lateral no desktop; no mobile, 88px acima e abaixo e 24px nas laterais.

---

## 3. Regras para novas seções

Use estes papéis para qualquer texto novo:

| Papel | Use para | Fonte / peso | Desktop / mobile | Entrelinha | Espaçamento entre letras |
|---|---|---|---|---|---|
| Display XL | Título principal da hero | Newsreader 300 | 88px / 48px | 0.98–1.0 | −0.02em |
| Display L | Título de cada seção (H2) | Newsreader 300 | 56px / 40px | 1.06–1.08 | −0.02em |
| Display M | Frases de destaque, citações, fecho de seção | Newsreader 400 | 24px / 22px | 1.35 | −0.005em |
| Corpo L | Texto de apoio sobre foto | Urbanist 300 | 19px / 16px | 1.5–1.55 | 0.012em |
| Corpo | Parágrafos de seção | Urbanist 300 | 18px / 17px | 1.75 | 0.012em |
| UI | Menu, botões, links de ação | Urbanist 400 ou 500 | 15–16px | normal | 0.02–0.04em |
| Rótulo | Rótulos de campo, legendas | Urbanist 400 | 13px / 12px | normal | 0.02em |
| Overline | Rótulo curto acima de título | Urbanist 400 | 13px / 12px | normal | 0.2em, MAIÚSCULAS |

Proibido:

- Qualquer outra fonte além de Newsreader e Urbanist.
- Pesos 600, 700 ou mais (nada de negrito pesado), e itálico.
- Destacar uma única palavra de um título com outra cor, peso ou estilo.
- MAIÚSCULAS fora do nome da marca, do overline e do PT/EN.
- Espaçamento positivo entre letras em Newsreader. Em Newsreader, só zero ou negativo.
- Título (Display) com entrelinha acima de 1.1.
- Parágrafo com mais de uns 60 caracteres por linha: limite a largura do bloco (≈ 460px).

Padrões fixos:

- Newsreader só em títulos e frases de destaque; todo o resto é Urbanist.
- Texto em frase normal (só a primeira letra maiúscula), exceto os casos de MAIÚSCULAS acima.
- Botão sempre diz a ação: "Reservar", "Ver disponibilidade".
- Mobile: troque para os valores da coluna "mobile" no breakpoint de 900px.

---

## 4. CSS pronto (opcional)

```css
.t-display-xl { font-family: var(--font-display); font-weight: 300; font-size: 88px; line-height: .98; letter-spacing: -.02em; }
.t-display-l  { font-family: var(--font-display); font-weight: 300; font-size: 56px; line-height: 1.06; letter-spacing: -.02em; }
.t-display-m  { font-family: var(--font-display); font-weight: 400; font-size: 24px; line-height: 1.35; letter-spacing: -.005em; }
.t-lead       { font-family: var(--font-sans); font-weight: 300; font-size: 19px; line-height: 1.55; letter-spacing: .012em; }
.t-body       { font-family: var(--font-sans); font-weight: 300; font-size: 18px; line-height: 1.75; letter-spacing: .012em; max-width: 460px; }
.t-ui         { font-family: var(--font-sans); font-weight: 500; font-size: 16px; letter-spacing: .02em; }
.t-nav        { font-family: var(--font-sans); font-weight: 400; font-size: 15px; letter-spacing: .03em; }
.t-label      { font-family: var(--font-sans); font-weight: 400; font-size: 13px; letter-spacing: .02em; }
.t-overline   { font-family: var(--font-sans); font-weight: 400; font-size: 13px; letter-spacing: .2em; text-transform: uppercase; }

@media (max-width: 900px) {
  .t-display-xl { font-size: 48px; line-height: 1; }
  .t-display-l  { font-size: 40px; line-height: 1.08; }
  .t-display-m  { font-size: 22px; }
  .t-lead       { font-size: 16px; line-height: 1.5; }
  .t-body       { font-size: 17px; }
  .t-label      { font-size: 12px; }
  .t-overline   { font-size: 12px; }
}
```
