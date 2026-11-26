# AGENTS.md — Casa Praiamar

Regras permanentes do projeto. A tarefa da sessão vem no prompt; os textos oficiais do site estão em `docs/CONTEUDO.md`. Em caso de dúvida sobre fatos ou texto, `docs/CONTEUDO.md` manda.

## 1. O projeto

Homepage da **Casa Praiamar**, casa de praia de alto padrão para hospedagem de grupos na Praia de Arpoeiras, Acaraú (CE). Página única, em português do Brasil (`pt-BR`), com linguagem de hotel boutique: fotografia grande, muito respiro, tipografia elegante, movimento discreto.

Conceito: **"O privilégio de viver sem pressa."** Sofisticação silenciosa, luxo sem ostentação, contato com a natureza, privacidade, simplicidade refinada.

Referências de qualidade (não para copiar): Aman, Six Senses, COMO Hotels, The Audo, sites editoriais de arquitetura. A identidade da Casa Praiamar é original.

## 2. Ordem de prioridade

Em caso de conflito entre regras, vale esta ordem:

1. Veracidade do conteúdo
2. Funcionamento e acessibilidade
3. Copy oficial e identidade visual (fontes e paleta)
4. Qualidade estética e composição
5. Conveniência de implementação

## 3. O que é fixo e o que é livre

**Fixo:** textos de `docs/CONTEUDO.md`, fatos da casa, famílias tipográficas, paleta, regras da consulta de reserva.

**Livre:** composição de cada seção, proporções, cortes e enquadramentos, ritmo entre seções, microinterações. Se uma mudança de layout valorizar melhor as fotos reais, faça, sem alterar copy, fatos ou requisitos funcionais.

## 4. Projeto e stack

- Antes de alterar, leia a estrutura: framework, rotas, estilos, componentes, dependências. Preserve a arquitetura e reutilize o que servir.
- Não atualize dependências nem altere arquivos fora do escopo da tarefa.
- **Projeto vazio:** Next.js (App Router) + TypeScript + CSS Modules com variáveis CSS (Tailwind só se já existir). Fontes via `next/font`, hospedadas localmente.
- **Projeto Vite/React (ex.: gerado no Lovable):** manter a stack. Metadados, Open Graph, canonical e JSON-LD no `index.html`. Registrar no relatório que sitemap e pré-renderização dependem de configuração adicional.
- Sem bibliotecas pesadas de animação, carrossel, mapa ou datepicker. Dependências de desenvolvimento para validação (Playwright, sharp) são aceitas.
- Centralize tudo que é editável em arquivos de configuração e dados: nome, textos, contatos, redes, localização, configuração de reserva, mapeamento de imagens. Trocar uma foto ou um telefone não pode exigir mexer em componentes.

## 5. Fatos confirmados

- Nome: Casa Praiamar.
- Local: Praia de Arpoeiras, Acaraú, Ceará. Frente ao mar.
- 6 suítes climatizadas. Capacidade máxima: 24 hóspedes.
- Ambientes: piscina, terraço com vista para o pôr do sol, cozinha gourmet climatizada, ambientes sociais.
- Equipe incluída: cozinheira, camareira e segurança noturna.
- Roupas de cama e banho disponibilizadas, com troca a cada três dias.
- Não incluídos: alimentos, bebidas e itens de higiene pessoal.

**Nunca inventar:** preços, promoções, disponibilidade, avaliações, depoimentos, estrelas, número de quartos diferente de 6, spa, academia, restaurante, transfer, distâncias, regras de check-in/check-out, políticas de cancelamento, endereço exato, telefone, e-mail, CNPJ, amenidades não confirmadas.

Também não afirmar: vista para o mar em todas as suítes, varanda, TV, tipo de cama, banheira, equipe 24 horas, alimentação incluída.

## 6. Tipografia (regra obrigatória)

O arquivo **`docs/REGRAS-TIPOGRAFIA.md` é a autoridade obrigatória** para todo texto existente ou futuro do site. Nenhum componente pode criar tamanhos, pesos, entrelinhas ou espaçamentos tipográficos fora dos papéis definidos nele.

- Somente **Newsreader 300 / 400** e **Urbanist 300 / 400 / 500**, hospedadas localmente, subconjunto latino, `font-display: swap`.
- Newsreader 300: H1 e títulos H2. Newsreader 400: frases de destaque e fechos editoriais.
- Urbanist 300: textos corridos e textos de apoio. Urbanist 400: navegação, rótulos e overlines. Urbanist 500: botões e links de ação.
- Urbanist substituiu Jost em 25/11/2026 (mesmos papéis e pesos). Textos corridos e textos pequenos em caixa baixa (perguntas, links do rodapé, legendas) usam `--tracking-body` (0.025em ≈ 0,45 px); Newsreader nunca recebe espaçamento positivo.
- **Escala fluida (25/11/2026):** tamanhos vêm só dos tokens `--text-*` (clamp entre 390px e 1440px, com teto). Referências desktop/mobile: h1 96/48, h2 50/36 (máx. 50), h3 26/22, corpo 19/17, apoio 21/18, pergunta 20/17, botão 16/15, rótulo 13/12. Tabela completa em `docs/REGRAS-TIPOGRAFIA.md` §2. 900px segue como breakpoint de entrelinha e layout.
- Sem itálico, pesos 600 ou maiores, caixa alta fora da marca/overline/PT-EN, letter-spacing positivo em Newsreader ou valores tipográficos avulsos.
- Precarregar apenas Newsreader 300 e Urbanist 400. Reservar espaço para evitar salto de layout.

## 7. Paleta e regras de contraste

Base oficial: `#F5F3EE` (fundo principal), `#E7DDCA` (areia), `#737A61` (oliva), `#B4895D` (terracota), `#232824` (grafite), `#FFFFFF`.

Contraste aproximado sobre `#F5F3EE`: grafite ≈ 13:1 (ok); oliva ≈ 4:1 (falha AA para texto pequeno); terracota ≈ 2,8:1 (falha). Por isso:

- Texto corrente e títulos: grafite sobre off-white ou areia.
- **Oliva `#737A61`:** só texto grande (≥ 24 px, ou ≥ 18,66 px em negrito), linhas e detalhes. Para texto pequeno ou fundos escuros de seção, usar `--color-olive-deep`.
- **Terracota `#B4895D`:** apenas elementos decorativos (linhas finas, marcadores). Nunca como texto nem como cor de CTA. Se precisar de texto terracota, usar `--color-terracotta-deep`.
- Texto claro sobre fundo escuro: off-white sobre grafite ou `--color-olive-deep`.
- As variantes `-deep` são derivadas da paleta e foram calculadas de forma aproximada. **Verifique todos os pares com um script de contraste** e ajuste a variante se algum falhar AA.
- Header transparente sobre o hero: texto branco com scrim superior suave e localizado. Se a foto escolhida não garantir 4,5:1, usar texto grafite ou aumentar levemente o scrim.

## 8. Tokens de design (ponto de partida)

Crie estes tokens globais e use-os em todo o projeto. Ajuste valores se a composição pedir, mantendo a lógica.

```css
:root {
  /* cor */
  --color-background: #F5F3EE;
  --color-sand: #E7DDCA;
  --color-olive: #737A61;
  --color-olive-deep: #5A604B;
  --color-terracotta: #B4895D;
  --color-terracotta-deep: #8A6240;
  --color-ink: #232824;
  --color-white: #FFFFFF;
  --color-line: rgb(35 40 36 / 0.14);
  --color-line-inverse: rgb(245 243 238 / 0.22);
  --color-scrim: rgb(0 0 0 / 0.28);

  /* tipografia */
  --font-display: "Newsreader", Georgia, serif;
  --font-display-regular: "Newsreader", Georgia, serif;
  --font-sans: "Urbanist", system-ui, sans-serif;
  --text-display: 5.5rem;
  --text-h2: 3.5rem;
  --text-h3: 1.5rem;
  --text-lead: 1.1875rem;
  --text-body: 1.125rem;
  --text-label: 0.8125rem;
  --text-eyebrow: 0.8125rem;
  --tracking-eyebrow: 0.2em;
  --leading-display: 0.98;
  --leading-heading: 1.06;
  --leading-highlight: 1.35;
  --leading-body: 1.75;

  /* espaçamento (base 8px) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.5rem;
  --space-6: 2rem;
  --space-7: 3rem;
  --space-8: 4rem;
  --space-9: 6rem;
  --space-10: 8rem;
  --section-y: 8.75rem;
  --gutter: 3.5rem;

  /* layout */
  --container: 1360px;
  --container-text: 28.75rem;
  --header-h: 60px;          /* 72px a partir de 768px */
  --target-min: 44px;

  /* forma */
  --radius: 0;
  --radius-sm: 2px;          /* máximo permitido */

  /* movimento */
  --ease-out: cubic-bezier(0.22, 0.61, 0.36, 1);
  --dur-fast: 200ms;
  --dur: 500ms;
  --dur-slow: 800ms;
  --dur-image: 1200ms;

  /* camadas */
  --z-sticky-cta: 40;
  --z-header: 50;
  --z-mobile-nav: 60;
  --z-lightbox: 70;
}
```

Breakpoint tipográfico: 900px. Breakpoints estruturais de referência: 480, 768, 1024 e 1440 px (variáveis CSS não funcionam em media queries; documente-os em um comentário e use `clamp()`, grid e `minmax()` para layouts fluidos).

## 9. Imagens

As fotos reais da casa são o material oficial e conduzem a direção de arte.

- Use prioritariamente as fotos fornecidas. Sem fotos genéricas de hotel, sem imagens de pessoas geradas por IA, sem screenshots de rede social como se fossem fotos originais.
- Não invente ambientes nem altere a arquitetura. Não distorça: `object-fit: cover` com `object-position` ajustado por imagem e por breakpoint.
- Se uma seção não tiver imagem adequada, adapte o layout. Não preencha com conteúdo inventado.
- **Nunca sobrescreva os originais.** Gere versões otimizadas em AVIF e WebP (larguras como 640 / 960 / 1440 / 1920) com um script em `scripts/` usando `sharp`, e use `<picture>`/`srcset`/`sizes`.
- Defina `width` e `height` em toda imagem para evitar CLS. Imagem do hero: prioridade alta, `fetchpriority="high"`, sem lazy-loading. As demais: lazy-loading.
- O mapeamento imagem → seção, `alt`, ponto focal (desktop e mobile) e proporções fica em **um único arquivo de dados** (ex.: `images.ts`). Componentes só referenciam chaves, nunca caminhos.
- `alt` descritivo e verdadeiro, escrito a partir do que a foto realmente mostra.

## 10. Consulta de reserva (BookingBar)

> **Decisão de 25/11/2026:** a barra de consulta (check-in, check-out, hóspedes) e o botão fixo "Consultar" do mobile foram **removidos do site** a pedido do proprietário. Todas as ações de reserva ("Reservar", "Falar com nossa equipe", "Consulte sua estadia", "Consultar estadia", "Reservas") usam um único link em `lib/contact.ts`: abre `https://wa.me/<whatsappNumber>` quando o número está em `lib/site.config.ts`; enquanto estiver vazio, leva a `#informacoes`. Não recriar a barra sem pedido explícito. As regras abaixo ficam como referência caso ela volte (o código antigo está no histórico do Git, commit `4b81c3e`).

Não existe motor de reservas. **Nunca simular disponibilidade nem confirmar reserva.**

- Campos: check-in, check-out, hóspedes. Labels visíveis e associados.
- Datas: `input type="date"` nativo. `min` do check-in = hoje no fuso `America/Fortaleza`; `min` do check-out = check-in + 1 dia.
- Hóspedes: stepper com botões − e +, valor entre 1 e 24, valor inicial 2 (configurável), anúncio por `aria-live="polite"`.
- Validação ao enviar, com erros inline ligados por `aria-describedby`/`aria-invalid` e foco no primeiro campo inválido. Mensagens sugeridas:
  - "Escolha a data de check-in."
  - "O check-in não pode ser anterior a hoje."
  - "Escolha a data de check-out."
  - "O check-out deve ser depois do check-in."
  - "Informe de 1 a 24 hóspedes."
- Envio válido: abrir `https://wa.me/<número>?text=<mensagem>` com `encodeURIComponent`. Mensagem em `docs/CONTEUDO.md`. Datas na mensagem em formato dd/mm/aaaa.
- Configuração em um arquivo único (ex.: `site.config.ts`): `whatsappNumber` (vazio por enquanto), `instagramHandle` (vazio até confirmação), `siteUrl` (vazio até definir domínio), `locationUrl`.
- **Se `whatsappNumber` estiver vazio:** não invente número. Após validação, mostre a mensagem pronta com botão "Copiar mensagem" e registre um aviso no console de desenvolvimento ("integração de contato pendente"). Tudo que depende do número deve sair de um único ponto de código.
- Separe a interface da lógica de envio (uma função `submitInquiry` trocável por WhatsApp, motor de reservas ou formulário com backend).
- Preserve datas e hóspedes ao entrar no fluxo (query string `?checkin=&checkout=&hospedes=` via `history.replaceState` e leitura no carregamento).
- Não colete nem armazene dados pessoais. Sem scripts de terceiros. Exponha `trackEvent(nome, params)` como função vazia por padrão, chamada em: envio da consulta, clique no WhatsApp, abertura de FAQ.

## 11. Acessibilidade (WCAG 2.2 AA) e movimento

- HTML semântico, um único `h1`, hierarquia de headings correta, landmarks, link "Pular para o conteúdo".
- Foco visível em tudo (anel de 2 px com offset; versão clara sobre fundos escuros). Alvos de toque ≥ 44 px.
- Menu mobile: abre e fecha por botão, `Esc` fecha, foco preso enquanto aberto (ou `inert` no resto da página), foco retorna ao botão, fecha ao escolher um link, rolagem do fundo bloqueada.
- FAQ: preferir `<details>/<summary>` nativo estilizado (conteúdo disponível sem JavaScript), ícone mais/menos, abertura suave só se não complicar.
- Galeria/lightbox: `<dialog>` nativo, teclado completo (setas, `Esc`), foco preso e devolvido, legenda e contador acessíveis.
- `prefers-reduced-motion`: desligar deslocamentos, zoom e scroll suave; manter só mudanças de opacidade curtas ou nada.
- Animações de entrada só escondem conteúdo quando JavaScript está ativo (classe `js` no `html`). Sem JS, tudo visível. Nada de parallax, scroll-jacking ou carrossel automático.
- Hover de imagem: zoom de 1,02 a 1,04 com `--dur-image`. Sem efeitos 3D.
- **Sistema de movimento (25/11/2026):** abertura em `components/Loader.tsx` (mín. 1,9 s, teto 2,8 s, ligada à foto de capa; arte gerada por `npm run brand:optimize` em `components/LoaderArt.generated.module.css`). Revelações por atributo `data-reveal` (`lines`, `fade`, `image`, `image-x`, `window`, `slide`, `rule`, `settle`) definidas em `app/motion.css` e disparadas uma vez por `lib/motion.ts`. Use essas primitivas; não crie animações avulsas. Detalhes no spec `docs/superpowers/specs/2026-11-25-experiencia-premium-design.md`.

## 12. Performance e SEO

- Metas (mobile): LCP baixo (imagem do hero priorizada), CLS ≈ 0, JS mínimo. Se for possível medir com Lighthouse, mirar ≥ 90 em performance e ≥ 95 em acessibilidade e SEO, e relatar os números reais.
- `lang="pt-BR"`, título e descrição conforme `docs/CONTEUDO.md`, Open Graph e Twitter card com foto real, canonical somente se `siteUrl` estiver configurado, `robots`, sitemap quando o framework permitir, favicon, página 404.
- JSON-LD apenas com dados verificados: nome, descrição e localidade (Acaraú, CE, BR). Sem endereço de rua, telefone, avaliações, preços ou estrelas.
- Sem vídeo de fundo.

## 13. Qualidade de código

- Componentes pequenos e reutilizáveis: Header, MobileNav, Hero, BookingBar, SectionHeading, FeaturesStrip, ExperienceGallery, Lightbox, AccommodationSection, HospitalitySection, LifestyleSection, LocationSection, FAQ, FinalCTA, StickyCTA, Footer, Button, TextLink, ResponsiveImage. Adapte os nomes à arquitetura existente.
- Conteúdo repetido (diferenciais, ambientes, perguntas, links) vem de dados estruturados, não de JSX duplicado.
- Botões: primário (fundo grafite, texto off-white, Urbanist 500, altura mínima 48 px, cantos ≤ 2 px) e editorial (transparente, sublinhado fino animado, seta que se desloca 4 px no hover). Sem botões grandes arredondados estilo SaaS.
- Cantos retos, divisórias de 1 px (`--color-line`), sem sombras pesadas, sem gradientes coloridos, sem emojis, sem ícones decorativos.

## 14. Comandos e validação

Descubra os comandos reais no `package.json`. Antes de encerrar qualquer fase, rode build, lint, typecheck e testes que existirem. Rode também os testes de comportamento descritos no prompt da tarefa.

**Honestidade:** nunca diga que algo foi testado se o teste não foi executado. Diga o que rodou, o que passou, o que falhou e o que não foi possível verificar.

## 15. Git

Um commit por fase, com mensagem clara (ex.: `feat(hero): hero, header e barra de consulta`). Não faça push nem altere branches sem ser pedido.

## 16. Relatório final

Ao concluir, informe: o que foi implementado; arquivos criados e modificados; imagens usadas (e descartadas, com motivo); o que está funcionando; o que ainda precisa ser configurado (WhatsApp, Instagram, domínio, localização); comandos executados e resultados; limitações e decisões que mereçam revisão.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
