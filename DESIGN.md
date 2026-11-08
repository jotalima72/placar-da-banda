---
name: Placar da banda
description: Placar de sessão com a identidade visual do manual Rock 'n' Roll Never Dies.
colors:
  paper: "#f0e4cb"
  ink: "#30291f"
  red: "#a82f22"
  line: "#b9a78b"
  stage: "#141414"
  cream: "#f5ebd8"
  active: "#d74732"
  button-text: "#fff5e5"
  muted: "#653b2a"
  hover: "#d8c4a3"
  effect: "#e0cfb2"
  field: "#fbf2df"
typography:
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
  headline:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.1
  display:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(25px, 3vw, 42px)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  label:
    fontSize: "10px"
    letterSpacing: "0.06em"
rounded:
  control: "4px"
  notice: "6px"
  drawer: "8px"
spacing:
  compact: "8px"
  medium: "14px"
  wide: "24px"
components:
  button-primary:
    backgroundColor: "{colors.red}"
    textColor: "{colors.button-text}"
    rounded: "{rounded.control}"
    padding: "9px 13px"
  field:
    backgroundColor: "{colors.field}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px"
---

# Design System: Placar da banda

## Overview

**Creative North Star: “Placar de banda do manual”.** Direção herdada da capa e do miolo: preto de palco, creme, papel envelhecido e vermelho. A interface React + Vite privilegia leitura coletiva e interação por toque durante a sessão em tablet horizontal.

**Key Characteristics:**

- Faixa escura para a música atual e sinal vermelho quando ativa.
- Linhas, alinhamento tabular e superfícies planas para organizar informação densa.
- Arial/Helvetica e números tabulares nos contadores.

Documentação extraída do código, PRODUCT.md e SURFACE.md. Revisão responsiva de 08/11/2026: cenário com quatro integrantes, três músicas e quatro efeitos de Solo conferido no navegador a 100% em 1024 × 600 e 960 × 600, sem sobreposição e sem rolagem da página. Não é uma medição física do tablet.

## Colors

### Primary

O vermelho `red` destaca ações principais, seleção da composição, foco e trechos de regra. `active` sinaliza a música tocando na borda superior da faixa escura.

### Neutral

`paper` é a base; `ink`, o texto; `line`, as divisórias. `stage` e `cream` compõem a faixa de música. `button-text` atende ações vermelhas. `muted` identifica informação secundária; `hover` responde à interação; `effect` diferencia efeitos; `field` dá superfície aos campos.

**Regra da herança.** Preserve os tokens do manual; não substitua a paleta por uma identidade genérica de dashboard.

## Typography

Arial, Helvetica e sans-serif são a família de todo o placar. Títulos de seção usam 18px, nomes de integrantes 17px e detalhes normalmente 10–14px. O título da música cresce fluidamente; métricas grandes usam números tabulares. Rótulos de coluna usam caixa alta e espaçamento aberto. Quebre nomes longos quando permitido pelo componente; o nome da banda usa truncamento.

## Layout

O painel tem altura mínima de 100dvh e cresce conforme o conteúdo, sem esmagar linhas. Largura máxima de 1800px e margens internas padrão de 18px 24px 10px. A área central combina setlist lateral e integrantes em grade; linhas respeitam a altura mínima do conteúdo. Efeitos usam grade com colunas automáticas de pelo menos 180px.

Em paisagem, entre 850 e 1400px de largura e até 900px de altura, os efeitos ocupam uma coluna própria de 240px ao lado da área central, preservando a altura dos músicos. Nesse modo o setlist ocupa 170px, controles individuais 76px e 84px e os demais espaços são flexíveis. Abaixo de 850px há fluxo vertical; abaixo de 500px as ações dos integrantes passam para uma linha própria. Com cinco ou mais composições, o setlist usa duas colunas. Conteúdo excepcionalmente longo pode expandir a página, mas nunca deve invadir outra linha. Não usar zoom, recorte de texto ou overflow oculto para simular cabimento.

## Elevation & Depth

O placar é plano: contraste tonal e divisórias organizam suas regiões. Sobreposição escura separa diálogos do contexto. Sombras ficam nos diálogos e avisos temporários; seus valores estão no sidecar.

## Shapes

Controles têm cantos discretamente arredondados; linhas de música permanecem retas. Diálogos e avisos recebem raios um pouco maiores. Bordas finas estruturam o painel, com linhas mais fortes nas divisões da tabela e dos efeitos.

## Components

- **Botões:** altura mínima de 44px no controle base, peso 700, resposta de fundo no hover. Ações compactas específicas, como Embalo, têm medidas próprias. Desabilitados usam opacidade de 0.5.
- **Foco e campos:** foco visível vermelho com contorno de 3px e afastamento de 3px. Campos e seletores têm superfície clara, borda e altura mínima de 44px.
- **Música:** seleção vermelha; faixa atual preta; borda vermelha sinaliza reprodução. Estados de domínio: pronta, ativa e tocada.
- **Integrantes e Solo:** tabela com benefício, alvo e consumo. Solo disponível usa ação escura; gasto usa superfície atenuada. Estados de domínio: disponível, falha, sucesso e ampliação.
- **Efeitos:** botões de leitura com título, descrição e detalhe; estados pendente ou encerrado.
- **Diálogos e avisos:** diálogos centrais com rolagem interna; aviso fixo junto à base da tela.

Transições de fundo são curtas; a música selecionada recebe animação breve. `prefers-reduced-motion` remove transições e animações.

## Do's and Don'ts

- **Do** preserve papel, preto, creme, vermelho e tipografia herdados do manual.
- **Do** mantenha números tabulares, foco visível e alinhamento das ações.
- **Do** consulte as regras e os estados existentes antes de acrescentar componentes.
- **Don't** use sombras como estrutura padrão do placar.
- **Don't** declare aprovação visual com base apenas em leitura de código ou build.
