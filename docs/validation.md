# Validação e decisões de entrega

## Experiência premium — 25/11/2026

Abertura "o sol nasce sobre o mar" a cada carregamento, revelações únicas por seção, cabeçalho que se esconde ao rolar e microinterações (spec: `docs/superpowers/specs/2026-11-25-experiencia-premium-design.md`). Medido na versão de produção servida em `127.0.0.1:3000`.

| Verificação | Resultado |
| --- | --- |
| `npm run lint`, `npm run typecheck`, `npm test` (3/3), `npm run contrast` (8/8), `npm run build` | Passaram |
| `npm run validate:browser` | Passou em 360–1920 px, sem erros de console. Inclui: abertura aparece e sai sozinha (≤ 3,8 s), sai no teto mesmo com a foto de capa bloqueada, não reaparece ao voltar pelo navegador, curta com movimento reduzido, ausente sem JavaScript; todas as revelações disparam ao ler a página e nunca se repetem; cabeçalho some ao descer, volta ao subir e com foco de teclado; link direto `/#informacoes` chega à seção. |
| Lighthouse mobile (13.5.0), antes | Performance **87**, acessibilidade 100, SEO 100, LCP 3,8 s, CLS 0, FCP 1,2 s |
| Lighthouse mobile, depois (2 execuções) | Performance **83–84**, acessibilidade 100, SEO 100, LCP **3,9 s**, CLS **0**, FCP 1,2 s, Speed Index 4,2 s |
| JavaScript de movimento | ~2 KB gzip (fonte sem comentários, antes de minificar); arte da abertura vai no CSS, não no JS |

Leitura: a queda de 3–4 pontos vem da abertura cobrir a página por ~2 s (Speed Index), escolha do proprietário. LCP subiu 0,1 s, dentro do critério de 0,3 s do design. A diferença de 15 px no "overflow" das capturas é o espaço de rolagem reservado (`scrollbar-gutter: stable`) no Chromium de teste; não há rolagem horizontal.


Data: 12/10/2026. Testes na versão de produção do Next.js servida localmente em `127.0.0.1:3000`.

## Comandos e resultados

| Comando | Resultado |
| --- | --- |
| `npm run images:optimize` | Geradas versões AVIF e WebP em larguras responsivas, sem tocar nos originais. A hero mobile AVIF foi regenerada a qualidade 44 após a medição de performance. |
| `npm run lint` | Passou, 0 erros e 0 avisos. |
| `npm run typecheck` | Passou. |
| `npm test` | 7/7 testes da lógica de consulta passaram. |
| `npm run contrast` | 8/8 pares avaliados passaram AA (incluindo pior caso da imagem final sob scrim). |
| `npm run build` | Passou; home, 404, ícone e robots gerados. |
| `npm run validate:browser` | Passou em Chromium: capturas em 360, 375, 390, 430, 768, 1024, 1440 e 1920 px; sem overflow horizontal nem mensagens de console. |
| Lighthouse mobile (13.5.0) | Performance **87**, acessibilidade **100**, SEO **100**; LCP **3,7 s**, CLS **0**. |
| `npm audit --omit=dev` | 0 vulnerabilidades em dependências de produção. |

As capturas ficam em `docs/screenshots/`, excluída do Git pelo `.gitignore`. O teste de navegador percorre erros inline e foco inicial, datas inválidas, limites do stepper, mensagem para copiar, parâmetros de URL, menu, FAQ, galeria, movimento reduzido e conteúdo sem JavaScript. Uma checagem adicional com Playwright confirmou que o botão fixo aparece após a hero, some sobre a consulta e o rodapé, e que Tab dá a volta no menu mobile.

## Imagens

- Hero desktop e mobile: os dois arquivos explicitamente nomeados para hero.
- Página: fachada/jardim, piscina, cozinha, ambiente social, foto vertical da rede, pátio ao entardecer e gramado ao entardecer.
- Galeria de ambientes: seis fotos (piscina noturna e diurna, cozinha, ambiente social, pátio e ângulo lateral da piscina).
- Fora da página: `13_47_47-3.png` por duplicar quase exatamente o ângulo noturno da piscina; `SnapInsta.to_841480907...jpg` pelo enquadramento fechado e luz estourada; `SnapInsta.to_841229971...jpg` e `SnapInsta.to_842492081...jpg` por repetirem temas melhor representados por outras fotos. Nenhuma imagem foi removida da pasta original.

## Pendências e limites

- Configurar WhatsApp, Instagram, domínio e, se houver, link oficial da localização em `lib/site.config.ts`. O link atual busca a Praia de Arpoeiras sem marcar a casa.
- O domínio é necessário para publicar canonical, sitemap e URL absoluta adequada da imagem Open Graph. O projeto não publica canonical enquanto `siteUrl` estiver vazio.
- Não há fotos verificadas do interior das suítes nem uma imagem isolada da praia; a seção de acomodações usa tipografia e fatos oficiais, e seu CTA leva às informações essenciais. A foto do ambiente social é identificada por legenda para não ser tomada como fotografia do terraço.
- Os PNGs chamados “Imagem do ChatGPT” foram aprovados no mapa visual, mas sua origem fotográfica ou grau de edição ainda deve ser confirmado antes da publicação. O site não atribui a eles amenidades ou ambientes que não aparecem na imagem.
- A meta de performance mobile era ≥90; o teste local mediu 87. A hero foi priorizada e comprimida sem sacrificar a composição aprovada.
- A auditoria npm completa inclui 5 avisos altos em ferramentas de desenvolvimento (`eslint-config-next` e dependências transitivas); a auditoria de produção retornou 0.
