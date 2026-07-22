# Arquitetura

## Visão

Repositório **talks**: catálogo estático na raiz + talks em pastas por categoria/evento. GitHub Pages serve o artefato montado (HTML + exports Next).

## Decisões técnicas

### Catálogo e slides Claude — HTML puro
`index.html` e `ai/claude-code/*.html` são auto-contidos (CSS embutido, sem build). Tema Catppuccin Macchiato via `--ctp-*`. JetBrains Mono via Google Fonts.

### Apps TDC — Next.js static export
`tdc/2026/acm-ossm` e `tdc/2026/painel-cloud` usam `output: "export"` com `basePath` / `assetPrefix` iguais à URL pública. Deploy via GitHub Actions (ticket #7) monta os `out/` nas pastas corretas junto com o HTML estático.

### Domínio
Custom domain `talks.rafaelvzago.com` no `CNAME` da raiz. Apps TDC não têm CNAME próprio.

### Idiomas
Landing: toggle PT/EN com `localStorage`. Claude: dois arquivos HTML. Painel TDC: PT-BR.

### Navegação dos slides Claude
Teclado, clique, footer com `goTo` / `navPrev` / `navNext`. `preventDefault` no JS dos decks não deve ser quebrado por edições de texto.

## Integridade

Antes de commit que toque slides Claude:

```bash
grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
grep -c '</section>' ai/claude-code/claude-code-open-source.html
grep -c 'preventDefault' ai/claude-code/claude-code-open-source.html   # = 7
```
