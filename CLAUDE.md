# Claude Code para Desenvolvimento Open Source

## Sobre este projeto
Apresentação e material de referência para palestras sobre Claude Code.
Arquivos HTML auto-contidos com tema terminal Catppuccin Macchiato.

## Estrutura
- index.html -- landing page
-- ai/claude-code/claude-code-open-source.html -- slides PT-BR (33 slides)
-- ai/claude-code/claude-code-open-source-en.html -- slides EN (33 slides)
- .claude/ -- skills, commands, settings

## Comandos
- Abrir no navegador: `xdg-open index.html`
- Servir local: `python3 -m http.server 8080`

## Convenções
- HTML puro, sem frameworks, sem build step
- CSS embutido, tema Catppuccin Macchiato
- Navegação por setas do teclado
- Ambos os idiomas devem estar sincronizados
- Acentos corretos em PT-BR
- Não modificar: CNAME, LICENSE

## Agent skills

### Issue tracker

GitHub Issues via `gh`. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context. See `docs/agents/domain.md`.
