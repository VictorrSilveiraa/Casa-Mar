# Animação editorial da seção “Há lugares…”

## Intenção

Transformar a seção “Há lugares que nos fazem esquecer das horas.” em um momento autoral da página. A animação deve reforçar a ideia de desacelerar: a fotografia surge com calma e o texto recupera sua presença palavra por palavra conforme a pessoa percorre a seção.

## Objetivos

- Criar uma revelação progressiva do título e dos três parágrafos, diretamente relacionada ao scroll.
- Dar à fotografia uma entrada sofisticada por máscara, sem alterar seu enquadramento definitivo.
- Preservar a leitura, a hierarquia tipográfica e a composição atual em desktop e mobile.
- Manter boa performance, acessibilidade e conteúdo integral quando JavaScript não estiver disponível.

## Não objetivos e antiobjetivos

- Não criar parallax, scroll-jacking, animação automática contínua ou atraso artificial de navegação.
- Não modificar textos oficiais, fontes, pesos, tamanhos ou fatos da casa.
- Não adicionar biblioteca de animação.
- Não esconder conteúdo de tecnologias assistivas nem depender da animação para compreender a seção.

## Abordagens consideradas

1. **Revelação palavra por palavra ligada ao scroll — escolhida.** Entrega a sensação de texto sendo escrito e relaciona o movimento ao conceito de viver sem pressa.
2. **Sequência única ao entrar no viewport.** Mais simples, mas não traduz a progressão durante a rolagem.
3. **Revelação por linha.** Editorial, porém instável diante das diferentes quebras de linha responsivas.

## Comportamento escolhido

### Texto

- O texto permanece semanticamente intacto e selecionável.
- Quando JavaScript está ativo e a preferência de movimento permite, cada palavra começa em uma variação suave e esmaecida do grafite.
- O progresso da seção colore as palavras em sequência, do título para os parágrafos.
- A ação “Conheça nossa casa” entra somente ao final da leitura, por opacidade curta e deslocamento mínimo.
- O efeito responde ao scroll apenas enquanto a seção está próxima do viewport e usa `requestAnimationFrame`, evitando atualizações desnecessárias.

### Imagem

- A fotografia entra uma única vez por uma máscara horizontal orientada da borda esquerda para dentro da composição.
- Um ajuste inicial de escala muito leve retorna a 1 durante a revelação.
- A duração fica entre 800 e 1.000 ms, com desaceleração natural e sem efeito elástico.

### Responsividade

- Desktop mantém imagem à esquerda e conteúdo à direita.
- Mobile preserva conteúdo acima da imagem, reduz a distância espacial da entrada e mantém a revelação das palavras com uma faixa de scroll mais curta.

### Movimento reduzido e ausência de JavaScript

- Com `prefers-reduced-motion: reduce`, texto, imagem e ação aparecem imediatamente em seu estado final, sem deslocamento ou máscara.
- Sem JavaScript, todo o conteúdo permanece visível por padrão.

## Limites de desempenho

- Nenhuma dependência nova.
- Um único controlador de scroll, passivo e limitado por `requestAnimationFrame`.
- Atualizações restritas à seção e desativadas quando ela está distante do viewport.
- Apenas `color`, `opacity`, `transform` e `clip-path` em uma região isolada; nenhum cálculo de layout por palavra a cada quadro.

## Validação

- Conferência visual conjunta em desktop e mobile.
- Testes com movimento normal e `prefers-reduced-motion`.
- Verificação de leitura sem JavaScript, ausência de overflow e estabilidade de layout.
- Execução de lint, typecheck, testes, contraste, validação no navegador e build.
