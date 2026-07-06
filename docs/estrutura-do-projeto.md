# Estrutura do projeto

## Objetivo
Organizar o projeto de forma mais clara para leitura, manutenção e evolução.

## Estrutura sugerida

```text
app/
  ├── pages/           # páginas principais: index.html, admin.html
  ├── js/              # lógica do front-end
  ├── styles/          # CSS da interface
  └── assets/          # imagens, ícones, manifestos e arquivos estáticos

content/
  ├── apostilas/       # conteúdo gerado em HTML/PDF
  ├── relativity/     # materiais de relatividade
  └── questions/      # dados de questões e listas

scripts/
  ├── gerar_apostilas.js
  └── imprimir_apostilas.js

docs/
  ├── guias/
  └── arquitetura/

backups/
  └── snapshots-antigos/
```

## Regras de organização
- separar interface, conteúdo e automação;
- manter arquivos de configuração próximos ao que usam;
- evitar misturar lógica, dados e documentação na raiz;
- documentar mudanças para não perder contexto.

## Observação
A migração completa pode ser feita aos poucos, sem quebrar a aplicação atual.
