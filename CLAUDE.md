# Talks

## Sobre este projeto
Catálogo de palestras e material de apoio (HTML estático + apps Next.js exportados para GitHub Pages).

## Estrutura
- index.html -- catálogo de talks
- ai/claude-code/ -- slides Claude Code (PT-BR + EN) e PRD do talk
- tdc/2026/acm-ossm/ -- fluxo OSSM multi-cluster (Next)
- tdc/2026/painel-cloud/ -- painel TDC 2026 (Next)
- docs/agents/ -- binding do issue tracker
- .claude/ -- skills, commands, settings

## Comandos
- Abrir catálogo: `xdg-open index.html` ou `python3 -m http.server 8080`
- OSSM: `cd tdc/2026/acm-ossm && npm ci && npm test`
- Painel: `cd tdc/2026/painel-cloud && npm ci && npm test`

## Convenções
- Domínio: `talks.rafaelvzago.com` (arquivo `CNAME`)
- Slides Claude: HTML puro, tema Catppuccin Macchiato, PT-BR e EN sincronizados
- Apps TDC: Next static export com `basePath` por URL pública
- Não modificar: LICENSE
- Feature branch → PR → merge (não push direto em `main`)

## Agent skills

### Issue tracker

GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.
