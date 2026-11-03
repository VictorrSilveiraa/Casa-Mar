# Essence Scroll Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar uma revelação editorial ligada ao scroll na seção “Há lugares que nos fazem esquecer das horas.”, com texto progressivo, entrada mascarada da imagem e fallback acessível.

**Architecture:** Extrair a seção para um componente cliente dedicado, mantendo seu conteúdo oficial em `lib/content.ts`. Um único controlador passivo de scroll atualiza uma variável CSS numérica via `requestAnimationFrame`; os spans das palavras derivam seu estado dessa variável sem renderizações React por quadro. A imagem usa `IntersectionObserver` para uma entrada única e o CSS mantém o estado final como padrão quando JavaScript ou movimento estiverem indisponíveis.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, CSS Modules, APIs nativas `IntersectionObserver`, `requestAnimationFrame` e `matchMedia`.

**Spec:** `docs/superpowers/specs/2026-11-03-essence-scroll-reveal-design.md`

## Global Constraints

- Não alterar a copy oficial de `lib/content.ts`.
- Não adicionar dependências nem bibliotecas de animação.
- Manter Newsreader 300 nos títulos e Jost 300 nos textos corridos, conforme `docs/REGRAS-TIPOGRAFIA.md`.
- O estado sem JavaScript deve exibir integralmente texto, imagem e ação.
- `prefers-reduced-motion: reduce` deve remover máscara e deslocamento e mostrar o estado final.
- Não usar parallax, scroll-jacking, animação contínua ou propriedades de layout por quadro.

## Review Focus

- JavaScript desativado: todo o conteúdo e a imagem devem permanecer visíveis.
- Movimento reduzido: nenhum `clip-path`, escala ou deslocamento deve ocultar o conteúdo.
- Retorno do scroll: a progressão textual deve acompanhar o movimento nos dois sentidos sem rerenderização React.
- Mobile estreito: as palavras não podem criar overflow nem alterar a quebra natural do texto.
- Navegação por âncora: entrar diretamente em `#a-casa` deve calcular imediatamente o estado correto.

---

### Task 1: Extrair a seção mantendo conteúdo e layout estáticos

**Files:**
- Create: `components/EssenceSection.tsx`
- Create: `components/EssenceSection.module.css`
- Modify: `app/page.tsx`
- Modify: `app/page.module.css`
- Test: `scripts/validate-site.mjs`

**Interfaces:**
- Consumes: `content.essence`, `ResponsiveImage` e `SectionHeading` existentes.
- Produces: `EssenceSection(): JSX.Element`, com `data-essence-section`, `data-essence-copy` e `data-essence-image` preservados para validação e para o controlador de movimento.

- [ ] **Step 1: Escrever o teste de regressão estática**

Adicionar à validação de navegador asserções de que a seção contém o título oficial, os três parágrafos, uma imagem e a ação; no contexto sem JavaScript, todos devem estar visíveis e a seção não deve possuir `data-motion="ready"`.

- [ ] **Step 2: Executar o teste e confirmar a falha**

Run: `npm run validate:browser`

Expected: FAIL porque `data-essence-section` e a estrutura extraída ainda não existem.

- [ ] **Step 3: Criar `EssenceSection()` e seu CSS Module**

Mover apenas a marcação e os estilos `.essence*` para os novos arquivos. Preservar a ordem desktop imagem à esquerda/texto à direita e a ordem mobile texto acima/imagem abaixo, sem mudar proporções, tipografia ou copy.

- [ ] **Step 4: Integrar o componente na homepage**

Substituir o bloco `#a-casa` de `app/page.tsx` por `<EssenceSection />` e remover de `app/page.module.css` apenas os estilos que passaram para o componente.

- [ ] **Step 5: Executar lint, typecheck e validação estática**

Run: `npm run lint && npm run typecheck && npm run validate:browser`

Expected: PASS, sem overflow e com o layout anterior preservado.

- [ ] **Step 6: Commit**

```bash
git add components/EssenceSection.tsx components/EssenceSection.module.css app/page.tsx app/page.module.css scripts/validate-site.mjs
git commit -m "refactor(essence): isolate editorial section"
```

### Task 2: Implementar a revelação vinculada ao scroll

**Files:**
- Modify: `components/EssenceSection.tsx`
- Modify: `components/EssenceSection.module.css`
- Modify: `scripts/validate-site.mjs`

**Interfaces:**
- Consumes: `data-essence-section`, `data-reveal-word`, `data-essence-image` e `data-essence-action` definidos no componente.
- Produces: estado DOM `data-motion="ready"`, `data-image-visible="true"`, `data-reveal-complete="true"` e a variável CSS `--reveal-progress` no intervalo `0..1`.

- [ ] **Step 1: Escrever os testes de movimento e acessibilidade**

Adicionar testes que confirmem: palavras esmaecidas antes da seção; progresso e ação finalizados após percorrer a faixa de scroll; imagem marcada como visível; retorno parcial ao subir; ausência de estado animado em movimento reduzido; conteúdo final visível sem JavaScript.

- [ ] **Step 2: Executar os testes e confirmar a falha**

Run: `npm run validate:browser`

Expected: FAIL porque o controlador e os estados de movimento ainda não existem.

- [ ] **Step 3: Implementar a marcação progressiva das palavras**

Criar um helper interno que preserve o texto e seus espaços em spans `data-reveal-word`, atribuindo `--word-index` e `--word-count` sem duplicar a copy. Manter `h2` e `p` semanticamente corretos e selecionáveis.

- [ ] **Step 4: Implementar o controlador de scroll**

No `useEffect`, ignorar o fluxo animado quando `matchMedia("(prefers-reduced-motion: reduce)").matches`. Para o fluxo normal, atualizar apenas `--reveal-progress` dentro de um `requestAnimationFrame`, com listener `scroll` passivo, listener de `resize`, cálculo imediato no carregamento e limpeza completa no unmount.

- [ ] **Step 5: Implementar a entrada da imagem**

Usar um `IntersectionObserver` com limiar baixo para definir `data-image-visible="true"` uma única vez e desconectar o observer. A entrada usa máscara horizontal, opacidade e escala inicial máxima de `1.035`, com duração entre 800 e 1.000 ms.

- [ ] **Step 6: Implementar os estados CSS**

Aplicar o esmaecimento apenas sob `[data-motion="ready"]`; derivar a opacidade de cada palavra de `--reveal-progress`, `--word-index` e `--word-count`; revelar a ação após o progresso final. Adicionar media query de movimento reduzido que força texto, imagem e ação ao estado final.

- [ ] **Step 7: Executar a validação funcional**

Run: `npm run lint && npm run typecheck && npm test && npm run contrast && npm run validate:browser`

Expected: PASS em todos os comandos, incluindo movimento normal, reduzido e ausência de JavaScript.

- [ ] **Step 8: Fazer uma inspeção visual limitada**

Capturar em um único lote desktop e mobile nos estados de entrada, meio e final. Corrigir em uma única rodada qualquer corte, contraste, ritmo ou overflow identificado; confirmar com no máximo mais uma captura conjunta.

- [ ] **Step 9: Executar o detector e o build**

Run: `impeccable.cmd detect --json components/EssenceSection.tsx components/EssenceSection.module.css app/page.tsx app/page.module.css`

Run: `npm run build`

Expected: detector sem achados novos relevantes e build concluído após o lembrete de segurança conhecido do Next.js, se ele reaparecer.

- [ ] **Step 10: Commit**

```bash
git add components/EssenceSection.tsx components/EssenceSection.module.css scripts/validate-site.mjs docs/superpowers/specs/2026-11-03-essence-scroll-reveal-design.md docs/superpowers/plans/2026-11-03-essence-scroll-reveal.md
git commit -m "feat(essence): add editorial scroll reveal"
```
