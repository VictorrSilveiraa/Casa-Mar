# CONTEUDO.md — Casa Praiamar

Texto oficial do site. Implemente como dados estruturados (ex.: `content.ts`), não espalhado em JSX. Não reescreva, não resuma, não acrescente frases.

**Única diferença em relação ao briefing original:** "segurança noturno" virou "segurança noturna" (serviço). Está em um só lugar do arquivo de dados para ser revertido facilmente.

Convenção: em números de destaque usar "06"; em texto corrido, "seis".

---

## Metadados

- **Título:** Casa Praiamar | Casa de Praia de Luxo em Arpoeiras, Ceará
- **Descrição:** Casa de praia para grupos na Praia de Arpoeiras, Acaraú (CE): seis suítes climatizadas, até 24 hóspedes e equipe incluída. Consulte a disponibilidade.
- **Idioma:** pt-BR

## Navegação

- A Casa → `#a-casa`
- Ambientes → `#ambientes`
- Acomodações → `#acomodacoes`
- Localização → `#localizacao`
- Botão: Reservar → `#reservas` (barra de consulta do hero)

## 1. Hero — `#topo` / `#reservas`

- **Eyebrow:** CASA PRAIAMAR — ARPOEIRAS, CEARÁ
- **H1 (Newsreader 300):** Onde a casa encontra o mar.
- **Apoio:** Um refúgio à beira-mar para viver dias de tranquilidade, conforto e momentos que merecem ser lembrados.
- **Botão secundário:** Descubra a Praiamar → rola para `#a-casa`
- **Indicação de scroll (opcional):** Explore a experiência

**Barra de consulta** — *removida do site em 25/11/2026; reservas pelo botão "Reservar" → WhatsApp (ver AGENTS.md §10).*

- Labels: Check-in · Check-out · Hóspedes
- Botão: Consultar disponibilidade

**Mensagem do WhatsApp**

> Olá! Gostaria de consultar a disponibilidade da Casa Praiamar para check-in em [DATA], check-out em [DATA], para [NÚMERO] hóspedes.

## 2. A essência — `#a-casa`

- **Eyebrow:** UM CONVITE PARA DESACELERAR
- **Título:** Há lugares que nos fazem esquecer das horas.
- **Descrição:**
  Na Praia de Arpoeiras, a Casa Praiamar nasce do encontro entre conforto, natureza e simplicidade.

  Um lugar para reunir quem importa, prolongar as conversas, aproveitar os dias de sol e descobrir o prazer de não ter pressa.

  Aqui, cada detalhe convida você a aproveitar o melhor da vida à beira-mar.
- **CTA (link editorial):** Conheça nossa casa → `#ambientes`

## 3. Diferenciais

- **Eyebrow:** PENSADA PARA VIVER BEM
- **Título:** Tudo o que você precisa para se sentir em casa. E um pouco mais.

| Destaque | Texto |
|---|---|
| Frente ao mar | O cenário perfeito para começar e terminar cada dia. |
| 06 suítes | Ambientes climatizados para descansar com conforto. |
| Até 24 hóspedes | Espaço para compartilhar momentos com quem você ama. |
| Equipe incluída | Mais tranquilidade e cuidado durante sua estadia. |

## 4. Ambientes e experiências — `#ambientes`

- **Eyebrow:** ESPAÇOS QUE INSPIRAM
- **Título:** Cada ambiente, uma nova forma de aproveitar.
- **Descrição:** Dos dias ensolarados às noites de conversas prolongadas, a Praiamar reúne espaços que convidam a estar junto e aproveitar cada instante.

**Piscina**

- Título: Mergulhe no seu próprio ritmo.
- Descrição: O convite perfeito para aproveitar o sol, relaxar e transformar uma tarde qualquer em uma boa lembrança.

**Cozinha gourmet**

- Título: Os melhores encontros acontecem à mesa.
- Descrição: Um espaço acolhedor, pensado para compartilhar sabores, histórias e momentos que merecem durar.

**Terraço**

- Título: Quando o pôr do sol se torna um ritual.
- Descrição: Um lugar para contemplar o horizonte, sentir a brisa e apreciar a beleza dos últimos instantes do dia.

- **CTA geral:** Explore os ambientes → abre a galeria (categoria ambientes)

## 5. Acomodações — `#acomodacoes`

- **Eyebrow:** O PRAZER DE DESCANSAR
- **Título:** O conforto de estar longe. A sensação de estar em casa.
- **Descrição:**
  Depois de um dia de sol e mar, nada melhor do que encontrar um ambiente acolhedor para renovar as energias.

  A Casa Praiamar dispõe de seis suítes climatizadas, proporcionando conforto para que cada hóspede aproveite a estadia no seu próprio ritmo.
- **Destaques:** 06 suítes · Ambientes climatizados · Até 24 hóspedes
- **CTA:** Conheça as acomodações → abre a galeria (categoria suítes)

## 6. Hospitalidade e equipe

- **Eyebrow:** UMA EXPERIÊNCIA DE HOSPITALIDADE
- **Título:** O verdadeiro luxo é poder aproveitar cada momento.
- **Descrição:**
  Na Praiamar, a tranquilidade também faz parte da experiência.

  Durante sua estadia, você conta com uma equipe composta por cozinheira, camareira e segurança noturna.

  São cuidados pensados para tornar seus dias mais leves, permitindo que você se dedique ao que realmente importa: viver bons momentos.
- **Frase complementar:** Mais tempo para estar presente. Menos preocupações pelo caminho.
- **Serviços:** Cozinheira · Camareira · Segurança noturna

## 7. Lifestyle e atmosfera

- **Eyebrow:** A ARTE DE VIVER SEM PRESSA
- **Título:** Dias que passam devagar. Memórias que ficam para sempre.
- **Descrição:**
  Acordar com o som das ondas. Sentir a brisa do mar. Passar a tarde entre mergulhos e boas conversas.

  Esperar o pôr do sol sem olhar para o relógio.

  Na Praiamar, são os pequenos momentos que tornam cada estadia inesquecível.
- **Frase de destaque:** Porque, às vezes, tudo o que precisamos é de um lugar para simplesmente estar.
- Sem botão.

## 8. Localização — `#localizacao`

> Atualizado em 26/11/2026 a pedido do proprietário: a foto do gramado deu lugar a um mapa (OpenFreeMap) com a posição exata da casa e ao botão "Como chegar". Textos e pontos ficam em `lib/content.ts` e `lib/location.ts`; coordenadas em `lib/site.config.ts`.

- **Eyebrow:** nenhum (removido a pedido do proprietário, 26/11/2026).
- **Título:** Onde você vai ficar
- **Descrição:** Frente ao mar, na Praia de Arpoeiras, a Casa Praiamar fica onde a brisa constante faz do litoral cearense um destino para o kitesurf.
- **Local:** Praia de Arpoeiras · Acaraú, Ceará
- **Pontos próximos (informados pelo proprietário):** Kite point · 10 m · Restaurante · 30 m · Frente ao mar · Destino de kitesurf. Não acrescentar pontos ou distâncias sem confirmação.
- **Coordenadas da casa:** -2.830807950800169, -40.0895461188842 (confirmadas pelo proprietário).
- **Mapa:** OpenFreeMap com estilo vivo e detalhado (terra verde-clara, mar azul, ruas brancas com placas de rodovia, praias, vegetação, prédios e pontos de interesse). Abre centralizado na casa. Caixa "De onde você vem?" (abre a rota no Google Maps a partir do local digitado) e botões redondos de tela cheia, centralizar na casa e zoom.
- **Fundo da seção:** off-white do site (`--color-background`).
- **CTA:** Como chegar → modal com duas opções, Google Maps e Waze, ambas com destino nas coordenadas da casa, em nova aba (`rel="noopener noreferrer"`).

## 9. Informações essenciais e FAQ — `#informacoes`

- **Eyebrow:** SUA ESTADIA, COM TRANQUILIDADE
- **Título:** Tudo o que você precisa saber antes de chegar.
- **CTA:** Falar com nossa equipe → canal de contato configurado

| Pergunta | Resposta |
|---|---|
| Qual é a capacidade da Casa Praiamar? | A casa tem capacidade máxima para 24 hóspedes e dispõe de seis suítes climatizadas. |
| A hospedagem inclui equipe? | Sim. Durante a estadia, estão incluídos os serviços de cozinheira, camareira e segurança noturna. |
| A casa fornece roupas de cama e banho? | Sim. As roupas de cama e banho são disponibilizadas, com trocas realizadas a cada três dias. |
| Alimentação e bebidas estão incluídas? | Não. Alimentos, bebidas e itens de higiene pessoal não estão incluídos na hospedagem. |
| Como consultar datas e condições de reserva? | Entre em contato com nossa equipe para verificar disponibilidade, condições e demais detalhes da sua estadia. |

## 10. Convite final

- **Eyebrow:** SEU PRÓXIMO REFÚGIO À BEIRA-MAR
- **Título:** Os melhores momentos merecem um lugar especial.
- **Descrição:**
  O mar, o conforto e as pessoas que fazem tudo valer a pena.

  Sua próxima boa lembrança pode começar aqui.
- **CTA principal:** Consulte sua estadia → rola até `#reservas` e foca o campo de check-in

## Rodapé

- **Frase institucional:** O privilégio de viver sem pressa.
- **Localização:** Praia de Arpoeiras — Acaraú, Ceará
- **Links:** Início (`#topo`) · A Casa · Ambientes · Acomodações · Localização · Reservas (`#reservas`)
- **Instagram:** exibir somente quando `instagramHandle` estiver configurado.
- **Copyright:** © [ano atual, automático] Casa Praiamar
- Sem e-mail, telefone, CNPJ ou endereço completo. Links de Política de Privacidade só quando existir página real.

## Botão fixo no mobile

*Removido do site em 25/11/2026 a pedido do proprietário.*

- Rótulo: Consultar → rola até `#reservas`. Aparece depois que o hero sai da tela, some quando a barra de consulta está visível e antes do rodapé, respeita a área segura do aparelho e nunca cobre conteúdo.
