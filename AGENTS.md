# AGENTS.md

## Comandos de setup
- Servir catálogo: `python3 -m http.server 8080`
- Abrir: `xdg-open index.html`
- OSSM: `cd tdc/2026/acm-ossm && npm ci && npm test`
- Painel: `cd tdc/2026/painel-cloud && npm ci && npm test`

## Regras
- Não modificar LICENSE
- Domínio em `CNAME`: `talks.rafaelvzago.com`
- Manter PT-BR e EN dos slides Claude sincronizados
- HTML Claude auto-contido; apps TDC via Next static export
- `preventDefault` no JavaScript dos decks Claude deve permanecer intacto
- Verificar sections balanceadas após editar slides Claude
- **NUNCA fazer `git push`**, mesmo que o usuário peça (exceto quando o humano autorizar explicitamente um override nesta sessão)
- Antes de qualquer commit que toque slides Claude, rodar as verificações abaixo
- Commits só depois que as verificações relevantes passarem
- Feature branch → PR → merge na default branch

## Verificações (slides Claude)
1. Sections:
 ```
 grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
 grep -c '</section>' ai/claude-code/claude-code-open-source.html
 grep -c '<section class="slide"' ai/claude-code/claude-code-open-source-en.html
 grep -c '</section>' ai/claude-code/claude-code-open-source-en.html
 ```
2. `preventDefault` (exatamente 7 por arquivo):
 ```
 grep -c 'preventDefault' ai/claude-code/claude-code-open-source.html
 grep -c 'preventDefault' ai/claude-code/claude-code-open-source-en.html
 ```
3. Sem palavras PT-BR sem acento:
 ```
 rg '\b(codigo|voce|nao|sessao|verificacao|implementacao|automacao|seguranca)\b' ai/claude-code/claude-code-open-source.html
 ```

## Estilo
- Tema: Catppuccin Macchiato
- Fonte: JetBrains Mono
- Cores via CSS variables `--ctp-*`

## Agent skills

- **SDLC (required):** `docs/agents/sdlc.md` — grill → to-spec → to-tickets → implement → ship
- Issue tracker / triage / domain: `docs/agents/`
- Skill bodies live at user level (`~/.cursor/skills/` / `~/.claude/skills/`) — do not vendor them into this repo
