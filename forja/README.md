# 🔥 Forja

Jogo de timing de ferreiro, feito em HTML/JS puro (um único arquivo, sem dependências).

## Como jogar

Abra `index.html` no navegador.

- O metal esquenta sozinho: cinza → vermelho → laranja → amarelo → branco.
- O termômetro à direita marca a **faixa da cor pedida**. Martele quando o marcador estiver dentro dela
  (`Espaço`, `Enter`, clique ou toque).
- Acertar perto do centro da faixa dá **PERFEITO** (pontos em dobro). Acertos seguidos aumentam o combo (até x10).
- Martelar frio demais zera o combo; deixar o metal chegar ao branco **queima** e custa uma vida (são 3).
- Cinco acertos forjam uma peça (🔩 → 🗝️ → 🔪 → … → 👑). A cada peça, a faixa fica mais estreita e o fogo mais rápido.
- O recorde fica salvo no navegador (`localStorage`).
