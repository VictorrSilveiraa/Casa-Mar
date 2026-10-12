# Tarefa: homepage completa da Casa Praiamar

Leia `AGENTS.md` (regras permanentes) e `docs/CONTEUDO.md` (textos oficiais) antes de qualquer outra coisa. Eles definem fatos, tipografia, paleta, tokens, regras da consulta de reserva, acessibilidade e o formato do relatório final. Este prompt define apenas **o que fazer e em que ordem**.

Você é um desenvolvedor frontend sênior com olhar de diretor de arte. Pense como um estúdio de branding para hotéis boutique: o site precisa provocar desejo pela fotografia e pelo design, criar confiança e levar com naturalidade à consulta de estadia. Não quero um template de aluguel de temporada nem dez blocos de layout igual.

Trabalhe em fases. Faça um commit ao fim de cada uma. Antes de seguir, rode build, lint, typecheck e testes disponíveis.

---

## Fase 0 — Diagnóstico e inventário de imagens (checkpoint)

1. Analise o projeto: framework, rotas, estilos, componentes, dependências, comandos. Decida a stack conforme a seção 4 do `AGENTS.md` e diga qual escolheu e por quê.
2. Localize as fotos fornecidas (informe a pasta). Abra e olhe **cada uma**.
3. Crie `docs/image-map.md` com uma tabela: arquivo · dimensões · o que a foto realmente mostra · qualidade (nitidez, horizonte, exposição) · seção sugerida · ponto focal em desktop e em mobile · observações (descartar? screenshot de rede social? baixa resolução?).
4. Proponha: a foto do hero, a composição da seção 4 (ambientes) e as fotos da galeria. Aponte seções sem foto adequada e como o layout se adapta.
5. **Pare e aguarde minha confirmação.** Se a execução não for interativa, siga com a melhor atribuição e liste as dúvidas no relatório final.

## Fase 1 — Fundação

- Tokens globais, estilos base e reset conforme `AGENTS.md` (seções 6 a 8).
- Fontes locais: Newsreader 300 (somente o `h1`) e Jost 300/400/500.
- Arquivos centrais de configuração e dados: `site.config`, `content` (a partir de `docs/CONTEUDO.md`), `images` (a partir de `docs/image-map.md`).
- Script de otimização de imagens (AVIF/WebP, vários tamanhos), sem tocar nos originais.
- Componentes base: `Button`, `TextLink`, `SectionHeading`, `ResponsiveImage`, utilitário de revelação ao rolar (com `html.js`), container e grid.
- Script de checagem de contraste dos pares de cor usados.

## Fase 2 — Header, Hero e barra de consulta

- **Header:** wordmark textual "Casa Praiamar" em Jost (não invente símbolo), links A Casa, Ambientes, Acomodações, Localização e botão discreto "Reservar". Transparente sobre o hero, sólido (off-white, texto grafite) ao rolar, com transição suave e altura contida. Sem efeito de vidro.
- **Menu mobile:** conforme a seção 11 do `AGENTS.md`.
- **Hero:** altura de `100svh` com mínimo razoável, foto real como protagonista, `h1` com `--text-display` e `Newsreader 300`, sem quebras ruins em 320–430 px. A barra de consulta deve ficar visível na primeira dobra do mobile sem o título empurrá-la para fora de propósito. Entrada breve e elegante de título, apoio e barra.
- **BookingBar:** exatamente como na seção 10 do `AGENTS.md`. Desktop horizontal com divisórias discretas; tablet em grade; mobile vertical ou compacto, sem rolagem horizontal. Fundo off-white, bordas mínimas, sem sombra pesada.

## Fase 3 — Seções 2 a 5

## Fase 4 — Seções 6 a 10, galeria e rodapé

Para as fases 3 e 4, use o mapa de ritmo abaixo como **sugestão**. Ajuste conforme as fotos aprovadas, mantendo a intenção de que cada seção tenha uma composição própria.

| Seção | Fundo | Composição sugerida |
|---|---|---|
| 2. Essência | Off-white | Duas colunas assimétricas: texto compacto de um lado, imagem vertical alta do outro, com deslocamento vertical leve |
| 3. Diferenciais | Areia | Faixa de quatro colunas com números e palavras-chave grandes em Jost 300, divisórias verticais finas; duas colunas no mobile |
| 4. Ambientes | Off-white | Cabeçalho alinhado à esquerda e composição editorial assimétrica: uma imagem grande (piscina, se a foto permitir) e duas menores deslocadas, ou blocos alternados texto/imagem. Nunca três cards iguais. Se houver boa foto da sala ou dos ambientes sociais, use como imagem de apoio com a legenda "Ambientes sociais", sem texto novo |
| 5. Acomodações | Off-white | Foto larga sangrando até a borda da tela e texto compacto ao lado (empilhado no tablet e no mobile); destaques como lista com números, sem ícones |
| 6. Hospitalidade | `--color-olive-deep` com texto off-white (seção pontual, não escura em excesso) | Foto de ambiente acolhedor (cozinha, sala, mesa) e texto editorial; serviços em três linhas separadas por filetes |
| 7. Lifestyle | Foto cheia da praia ou do mar, depois off-white | Imagem de largura total (80–90 `svh`), seguida de bloco de texto centralizado em largura de leitura; frase de destaque grande em Jost 300; sem botão |
| 8. Localização | Areia | Foto grande da praia com composição tipográfica editorial; link externo para o mapa; nenhum pin falso |
| 9. FAQ | Off-white | Duas colunas no desktop (título, texto e CTA fixos à esquerda; accordion à direita); uma coluna no mobile |
| 10. Convite final | Foto de largura total | Texto centralizado, overlay mínimo e só se necessário |
| Rodapé | Grafite | Wordmark, frase institucional, localização, links; Instagram só se configurado |

Comportamentos desta fase:

- **Galeria (lightbox):** componente `<dialog>` leve, com as fotos aprovadas agrupadas em categorias (ambientes, suítes). "Explore os ambientes" abre a categoria ambientes; "Conheça as acomodações" abre suítes. Se houver menos de duas fotos de suíte, o CTA vira âncora para `#informacoes`.
- **"Ver localização"**, **"Falar com nossa equipe"** e **"Consulte sua estadia"** conforme `docs/CONTEUDO.md`.
- **Botão fixo mobile** conforme `docs/CONTEUDO.md`.
- Hover de imagem e entradas de seção conforme a seção 11 do `AGENTS.md`.

## Fase 5 — Refinamento, SEO e performance

- Revise espaçamentos, cortes das fotos por breakpoint, hierarquia tipográfica, alinhamento ao grid, transições e contrastes. A página precisa parecer uma experiência única, não dez seções soltas.
- Metadados, Open Graph com foto real, favicon, 404, `robots`, sitemap (se o framework permitir), JSON-LD conforme `AGENTS.md`.
- Revise `alt` de todas as imagens.
- Confirme que o hero carrega com prioridade e que não há salto de layout por fontes ou imagens.

## Fase 6 — Validação (obrigatória)

Não considere a tarefa concluída só porque compila. Rode e relate o resultado real de cada item. O que não puder ser executado, diga explicitamente.

1. `build`, `lint`, `typecheck` e testes existentes.
2. **Capturas com Playwright** (devDependency) em 360, 375, 390, 430, 768, 1024, 1440 e 1920 px, salvas em `docs/screenshots/` (adicionar ao `.gitignore`). Olhe as capturas e corrija o que estiver quebrado, cortado ou desalinhado.
3. **Sem overflow horizontal:** `document.documentElement.scrollWidth <= window.innerWidth` em todas as larguras acima.
4. **Console limpo:** nenhum erro ou aviso inesperado ao carregar e ao interagir.
5. **Consulta de reserva:**
   - campos vazios → erros corretos e foco no primeiro campo inválido;
   - check-in no passado → erro;
   - check-out igual ou anterior ao check-in → erro;
   - hóspedes 0 e 25 → bloqueados pelo stepper e pela validação;
   - entrada válida → URL `wa.me` bem formada e codificada (com número de teste apenas em teste automatizado) ou, com a configuração vazia, mensagem pronta com "Copiar mensagem";
   - datas e hóspedes preservados na query string.
6. **Teclado:** percorrer a página com Tab; abrir e fechar menu mobile, FAQ e galeria; conferir foco preso e retorno de foco.
7. **Movimento reduzido** (emulação) e **JavaScript desativado:** todo o conteúdo precisa continuar visível e legível.
8. **Contraste:** rodar o script da Fase 1 em todos os pares de cor usados.
9. **Lighthouse mobile**, se disponível no ambiente: relatar os números reais.

## Entrega

Siga o formato do relatório final da seção 16 do `AGENTS.md`. Termine listando, em poucas linhas, o que eu preciso fornecer ou decidir: número de WhatsApp, Instagram, domínio, localização oficial, fotos adicionais, e qualquer escolha de design que você ache que merece revisão.
