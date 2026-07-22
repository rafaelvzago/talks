# AGENTS.md

## Comandos de setup
- Servir localmente: `python3 -m http.server 8080`
- Abrir: `xdg-open index.html`

## Regras
- Não modificar CNAME nem LICENSE
- Manter ambos os idiomas sincronizados (PT-BR e EN)
- HTML auto-contido, sem dependências externas (exceto Google Fonts)
- `preventDefault` no JavaScript deve permanecer intacto
- Verificar sections balanceadas após qualquer edição

## Git
- **NUNCA fazer `git push`**, mesmo que o usuário peça
- Antes de qualquer commit, rodar TODAS as verificações abaixo
- Se alguma verificação falhar, corrigir antes de commitar
- Commits só depois que tudo passar

## Verificações obrigatórias (antes de commit)
1. Sections balanceadas em ambos os arquivos:
   ```
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source.html
   grep -c '</section>' ai/claude-code/claude-code-open-source.html
   grep -c '<section class="slide"' ai/claude-code/claude-code-open-source-en.html
   grep -c '</section>' ai/claude-code/claude-code-open-source-en.html
   ```
   Todos os 4 valores devem ser iguais.

2. `preventDefault` intacto (exatamente 7 por arquivo):
   ```
   grep -c 'preventDefault' ai/claude-code/claude-code-open-source.html
   grep -c 'preventDefault' ai/claude-code/claude-code-open-source-en.html
   ```

3. Sem palavras PT-BR sem acento:
   ```
   rg '\b(codigo|voce|nao|sessao|verificacao|implementacao|automacao|seguranca)\b' ai/claude-code/claude-code-open-source.html
   ```
   Deve retornar zero resultados.

4. Ambos os arquivos têm o mesmo número de slides.

## Estilo
- Tema: Catppuccin Macchiato
- Fonte: JetBrains Mono
- Todas as cores via CSS variables `--ctp-*`
