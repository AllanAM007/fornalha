# Aurevyo — site

Site estático (HTML + CSS + JS vanilla, sem build e sem dependências).
Abrir `index.html` ou servir a pasta: `python3 -m http.server`.

```
index.html          Página principal (HEADER, HERO, IMPACT, WORK, MANIFESTO,
                    SERVICES, PROCESS, PROOF, ABOUT, CONTACT, FOOTER)
case.html           Template de case study (duplicar por projeto)
assets/css/style.css  Tokens em :root (cor, tipo, espaço) + secções numeradas
assets/js/main.js     Módulos independentes (nav, reveal, hero, cursor, form…)
assets/img/           favicon, og.png (1200×630), apple-touch-icon
```

## Direção

- **Ideia:** *Make the choice obvious.* Ruído vs. atenção — o campo de traços
  do hero orienta-se para o cursor; um único ponto azul é a escolha óbvia.
  O ponto é o elemento de marca (logo, favicon, títulos, rodapé).
- **Cor:** preto `#0C0C0D`, papel `#F1EFEA`, Aurevyo Ultramarine `#2B2BFF`
  (usado com moderação: ponto, "03", secção de contacto).
- **Tipo:** Archivo (variável, eixo de largura animado nos hovers),
  Instrument Serif (manifesto, depoimento), IBM Plex Mono (legendas).

## O que falta preencher (procurar por `EDITAR` e `[`)

- Projetos 02–04: nome, tags, imagens reais (`.cover` → `<img loading="lazy">`).
- Logótipos, resultados e depoimento — **só dados reais**.
- Equipa: nomes, funções e fotografias.
- `assets/js/main.js` → `CONTACT.email` / `CONTACT.whatsapp` (com WhatsApp o
  formulário abre a conversa já preenchida; sem ele, copia e abre o Instagram).
- Domínio: URLs absolutas no `og:image` e `canonical`.
- `case.html`: textos do case Fornalha Vila.
