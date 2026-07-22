---
name: fix-accentuation
description: >
  Corrige acentuação PT-BR no arquivo de slides sempre que um slide for
  modificado ou adicionado. Triggers when the user says "fix accentuation",
  "corrigir acentuação", "acentuação", or "accentuation".
---

# Fix PT-BR Accentuation Skill

Corrige palavras sem acento no arquivo `ai/claude-code/claude-code-open-source.html`.
Atua **apenas no texto visível** (conteúdo entre tags HTML), nunca em JavaScript, CSS, atributos HTML, URLs ou nomes de arquivo.

## Workflow

1. Extrair o texto visível do arquivo PT-BR (ignorar `<script>`, `<style>`, atributos):
   ```
   grep -n '[^>]*' ai/claude-code/claude-code-open-source.html
   ```

2. Buscar palavras sem acento usando a lista de referência abaixo:
   ```
   rg -in '\b(codigo|codigos|voce|nao|sessao|sessoes|verificacao|verificacoes|tambem|alem|ate|pagina|paginas|unico|unica|unicos|unicas|valido|valida|validos|validas|obrigatorio|obrigatoria|obrigatorios|obrigatorias|automatico|automatica|automaticos|automaticas|modulo|modulos|proximo|proxima|proximos|proximas|inicio|indice|indices|possivel|possiveis|necessario|necessaria|necessarios|necessarias|basico|basica|basicos|basicas|metodo|metodos|titulo|titulos|topico|topicos|especifico|especifica|especificos|especificas|estrategia|estrategias|pratica|praticas|tecnica|tecnicas|logica|logicas|analise|analises|arvore|arvores|numero|numeros|conteudo|conteudos|revisao|revisoes|secao|secoes|critico|critica|criticos|criticas|diagnostico|diagnosticos|linguistico|linguistica|linguisticos|linguisticas|agentico|agentica|agenticos|agenticas|seguranca|producao|informacao|informacoes|aplicacao|aplicacoes|integracao|integracoes|solucao|solucoes|funcao|funcoes|execucao|configuracao|configuracoes|operacao|operacoes|referencia|referencias|experiencia|experiencias|consequencia|consequencias|apresentacao|eficiencia|frequencia|frequencias|instancia|instancias|dependencia|dependencias)\b' ai/claude-code/claude-code-open-source.html
   ```

3. Para cada ocorrência encontrada, verificar que está em texto visível (não em `<script>`, `<style>`, atributos `class=`, `id=`, `onclick=`, `href=`, `<code>` com comandos, etc.)

4. Aplicar as correções usando `Edit` — **um por um**, nunca `replace_all` em palavras que possam aparecer em JavaScript

5. Verificar que `preventDefault` continua intacto (exatamente 7 ocorrências):
   ```
   grep -c 'preventDefault' ai/claude-code/claude-code-open-source.html
   ```

6. Reportar as correções feitas

## Lista de Referência — Palavras Comuns

### Acentos agudos (´)
| Errado | Correto |
|--------|---------|
| codigo / codigos | código / códigos |
| voce | você |
| nao | não |
| tambem | também |
| alem | além |
| ate | até |
| pagina / paginas | página / páginas |
| unico / unica | único / única |
| valido / valida | válido / válida |
| obrigatorio / obrigatoria | obrigatório / obrigatória |
| automatico / automatica | automático / automática |
| modulo / modulos | módulo / módulos |
| proximo / proxima | próximo / próxima |
| inicio | início |
| indice / indices | índice / índices |
| possivel / possiveis | possível / possíveis |
| necessario / necessaria | necessário / necessária |
| basico / basica | básico / básica |
| metodo / metodos | método / métodos |
| titulo / titulos | título / títulos |
| topico / topicos | tópico / tópicos |
| especifico / especifica | específico / específica |
| estrategia / estrategias | estratégia / estratégias |
| pratica / praticas | prática / práticas |
| tecnica / tecnicas | técnica / técnicas |
| logica / logicas | lógica / lógicas |
| analise / analises | análise / análises |
| arvore / arvores | árvore / árvores |
| numero / numeros | número / números |
| conteudo / conteudos | conteúdo / conteúdos |
| critico / critica | crítico / crítica |
| diagnostico / diagnosticos | diagnóstico / diagnósticos |
| agentico / agentica | agêntico / agêntica |

### Cedilha (ç) e til (~)
| Errado | Correto |
|--------|---------|
| sessao / sessoes | sessão / sessões |
| secao / secoes | seção / seções |
| verificacao / verificacoes | verificação / verificações |
| seguranca | segurança |
| producao | produção |
| informacao / informacoes | informação / informações |
| aplicacao / aplicacoes | aplicação / aplicações |
| integracao / integracoes | integração / integrações |
| solucao / solucoes | solução / soluções |
| funcao / funcoes | função / funções |
| execucao | execução |
| configuracao / configuracoes | configuração / configurações |
| operacao / operacoes | operação / operações |
| referencia / referencias | referência / referências |
| experiencia / experiencias | experiência / experiências |
| consequencia / consequencias | consequência / consequências |
| apresentacao | apresentação |
| eficiencia | eficiência |
| frequencia / frequencias | frequência / frequências |
| instancia / instancias | instância / instâncias |
| dependencia / dependencias | dependência / dependências |
| revisao / revisoes | revisão / revisões |

## Rules

- Atuar APENAS no arquivo PT-BR (`ai/claude-code/claude-code-open-source.html`)
- Nunca modificar conteúdo dentro de `<script>` ou `<style>`
- Nunca modificar atributos HTML (`class`, `id`, `onclick`, `href`, `style`)
- Nunca modificar URLs, nomes de arquivo ou nomes de comando
- Nunca usar `replace_all` — corrigir cada ocorrência individualmente com contexto suficiente para ser única
- Sempre verificar que `preventDefault` continua com exatamente 7 ocorrências após as correções
