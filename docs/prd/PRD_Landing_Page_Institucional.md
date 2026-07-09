# PRD — Criação da Landing Page Institucional do Universo Relativo

**Projeto:** Universo Relativo  
**Versão:** 1.0  
**Status:** Planejamento  
**Prioridade:** Alta  
**Tipo:** Nova Funcionalidade (Frontend)

---

# 1. Objetivo

Criar uma Landing Page moderna, responsiva e institucional para o Universo Relativo.

Esta página será a nova porta de entrada da plataforma e terá como objetivo apresentar o projeto, explicar seus diferenciais, demonstrar a plataforma e incentivar novos usuários a criarem uma conta ou acessarem uma conta existente.

A Landing Page deverá seguir fielmente o protótipo aprovado pela equipe.

---

# 2. Escopo

Esta Sprint contempla exclusivamente:

- Criação da Landing Page.
- Estrutura visual.
- Navegação.
- Responsividade.
- Componentização.
- SEO.
- Performance.

Esta Sprint **NÃO contempla**:

- Login
- Cadastro
- Firebase Authentication
- Firestore
- Sessão única
- Dashboard
- Área Administrativa
- Alterações em regras de negócio

---

# 3. Objetivos

Ao final da implementação, a plataforma deverá possuir uma página inicial profissional contendo:

- Hero principal
- Explicação da plataforma
- Como funciona
- Demonstração do sistema
- Diferenciais
- Call To Action
- Footer institucional
- Navegação para Entrar e Cadastrar

---

# 4. Regras Gerais

## Obrigatório

A IA deverá seguir rigorosamente as seguintes regras durante toda a implementação:

- Não alterar qualquer funcionalidade existente.
- Não alterar Firebase.
- Não alterar autenticação.
- Não alterar Firestore.
- Não alterar Dashboard.
- Não alterar Área Administrativa.
- Não alterar Context API.
- Não alterar gerenciamento de sessões.
- Não alterar rotas protegidas.
- Não modificar lógica de Login.
- Não modificar lógica de Cadastro.

Esta Sprint destina-se exclusivamente à Landing Page.

---

# 5. Diretriz de Design

A Landing Page deverá seguir fielmente o protótipo aprovado.

A IA **não poderá reinterpretar o design**.

Não deverá:

- alterar disposição dos elementos;
- alterar tipografia;
- alterar identidade visual;
- alterar cores;
- alterar espaçamentos;
- alterar proporções;
- alterar estilo dos botões.

O objetivo é transformar o layout aprovado em código React mantendo máxima fidelidade.

---

# 6. Arquitetura

Criar:

```text
src/

pages/

Landing/

Landing.jsx

Landing.css
```

Criar também:

```text
components/

Landing/

Navbar

Hero

Features

Showcase

CTA

Footer
```

Cada seção deverá ser um componente independente.

---

# 7. Sprint 1 — Auditoria

## Objetivo

Analisar a arquitetura atual antes de qualquer alteração.

### Tarefas

- Identificar rota inicial.
- Identificar Header existente.
- Identificar Footer existente.
- Identificar componentes reutilizáveis.
- Identificar arquivos CSS.
- Identificar estrutura do React Router.
- Planejar integração da Landing.

### Regras

Não modificar qualquer arquivo.

### Entregáveis

Relatório completo da arquitetura.

Plano de integração.

---

# Sprint 2 — Estrutura Base

## Objetivo

Criar apenas a estrutura da Landing.

Implementar:

```
Landing
```

Com:

- Navbar
- Hero
- Como Funciona
- Diferenciais
- CTA
- Footer

Nesta Sprint utilizar apenas placeholders.

Não adicionar conteúdo definitivo.

---

# Sprint 3 — Navbar

## Objetivo

Construir exclusivamente a Navbar.

Itens obrigatórios:

Logo

Menu:

- Recursos
- Como Funciona
- Sobre
- Contato

Botões:

- Entrar
- Cadastrar

### Responsividade

Desktop

Tablet

Mobile

### Regras

Não implementar autenticação.

Não implementar lógica.

---

# Sprint 4 — Hero Section

## Objetivo

Construir a primeira dobra.

Implementar:

Título

Subtítulo

Imagem principal

Plano de fundo

Botão:

Criar Conta

Botão:

Entrar

Nesta Sprint os botões apenas apontam para rotas.

Não implementar login.

---

# Sprint 5 — Seção "Como Funciona"

## Objetivo

Construir a área de apresentação dos recursos.

Cards:

- Apostilas Interativas
- Questões Inteligentes
- Acompanhamento de Progresso
- Gamificação

Cada card deverá seguir exatamente o design aprovado.

---

# Sprint 6 — Diferenciais da Plataforma

## Objetivo

Construir a seção que demonstra a plataforma.

Implementar:

Painel ilustrativo.

Texto institucional.

Lista de benefícios.

Imagem da Dashboard.

A seção deverá reproduzir fielmente o protótipo.

---

# Sprint 7 — CTA Final + Footer

## Objetivo

Construir a área final.

Implementar:

Banner.

Mensagem principal.

Botão:

Entrar no Universo

Footer.

Logo.

Direitos autorais.

Redes sociais.

---

# Sprint 8 — Navegação

## Objetivo

Conectar apenas a navegação.

Botões:

Entrar

↓

```
/login
```

Cadastrar

↓

```
/register
```

Menu:

Scroll suave entre seções.

Nesta Sprint não implementar autenticação.

---

# Sprint 9 — Responsividade

## Objetivo

Adaptar toda a Landing.

Compatibilidade:

320px

375px

425px

768px

1024px

1440px

1920px

Verificar:

Espaçamentos.

Tipografia.

Cards.

Botões.

Navbar.

Footer.

Imagens.

CTA.

---

# Sprint 10 — Polimento

## Objetivo

Adicionar microinterações.

Implementar:

Hover.

Fade.

Scroll suave.

Transições.

Sombras.

Gradientes.

Animações discretas.

Não exagerar nas animações.

---

# Sprint 11 — SEO

Adicionar:

Title.

Meta Description.

OpenGraph.

Twitter Cards.

Favicon.

Canonical.

Structured Data.

---

# Sprint 12 — Performance

Implementar:

Lazy Loading.

Compressão de imagens.

Code Splitting (quando aplicável).

Pré-carregamento de fontes.

Otimização de assets.

---

# Sprint 13 — Acessibilidade

Implementar:

ARIA Labels.

Alt em imagens.

Contraste adequado.

Navegação por teclado.

Focus visível.

Semântica HTML.

---

# Sprint 14 — Revisão Final

## Objetivo

Executar revisão completa.

Checklist:

- Layout igual ao protótipo.
- Responsividade completa.
- Componentização correta.
- Código organizado.
- Nenhum componente duplicado.
- Nenhum CSS morto.
- Nenhum erro no Console.
- Performance satisfatória.
- SEO implementado.
- Acessibilidade implementada.

---

# Estrutura Final Esperada

```
Landing

├── Navbar
├── Hero
├── Como Funciona
├── Diferenciais
├── Demonstração da Plataforma
├── CTA Final
└── Footer
```

---

# Critérios de Aceitação

A implementação será considerada concluída quando:

- A Landing for a nova página inicial (`/`).
- O design for fiel ao protótipo.
- Todos os componentes forem reutilizáveis.
- Toda a página for responsiva.
- Os botões "Entrar" e "Cadastrar" apontarem para suas respectivas rotas.
- Nenhuma funcionalidade existente tiver sido alterada.
- Nenhum arquivo relacionado à autenticação tiver sido modificado.
- O código seguir boas práticas de React.
- A Landing estiver pronta para integrar o novo sistema de autenticação em uma Sprint futura.

---

# Instruções Finais para a IA

Antes de iniciar qualquer implementação:

1. Analise completamente a arquitetura atual do projeto.
2. Confirme quais arquivos serão criados e quais serão utilizados.
3. Trabalhe exclusivamente dentro do escopo desta Sprint.
4. Ao final de cada Sprint:
   - liste todos os arquivos criados;
   - liste todos os arquivos modificados;
   - explique cada alteração realizada;
   - valide que nenhuma funcionalidade existente foi quebrada.
5. Aguarde aprovação antes de iniciar a Sprint seguinte.

**É estritamente proibido implementar funcionalidades que pertençam a futuras Sprints, especialmente qualquer lógica relacionada à autenticação, cadastro, Firebase ou gerenciamento de sessões.**
