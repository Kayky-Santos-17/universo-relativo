# Universo Relativo

## Visão geral
Este projeto é uma plataforma web educacional voltada para ensino de física, com login de alunos, trilhas de estudo, banco de questões, provas, flashcards e painel administrativo.

## Estrutura profissional proposta

```text
/
├── app/                # aplicação web principal
├── content/            # materiais didáticos e apostilas
├── docs/               # documentação e guias
├── scripts/            # scripts de automação e geração
├── backups/            # versões antigas e snapshots
└── package.json        # dependências do projeto
```

## Onde está o que hoje
- A aplicação principal está em [app/index.html](app/index.html).
- Os materiais de apostilas estão em [content/apostilas_refeitas](content/apostilas_refeitas).
- A documentação está em [app/COMO_USAR_FIREBASE.md](app/COMO_USAR_FIREBASE.md).

## Objetivo desta organização
- reduzir a sensação de bagunça visual;
- separar claramente responsabilidades;
- facilitar manutenção futura;
- tornar o projeto mais profissional para quem for continuar o trabalho.

## Próximo passo recomendado
Fazer uma migração gradual da aplicação para a pasta [app](app), mantendo a compatibilidade do sistema durante o processo.
