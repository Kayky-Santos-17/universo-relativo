# Sprint 1 — Auditoria da Arquitetura Atual

## 1. Rota Inicial (`/`)

Atualmente `/` renderiza `<Home />` (dashboard do aluno autenticado) dentro de `<MainLayout />`:
```
src/App.jsx:24 → { path: "/", element: <Home /> }
```

O `<Home />` em `src/pages/Home/index.jsx` (327 linhas) contém:
- Saudação personalizada com nome do aluno
- Stats grid (questões, acertos, tempo, aulas)
- Progresso por matéria (barras)
- Atividade recente (localStorage)
- Flash cards por assunto
- Quote com imagem Einstein

**Depende de**: `useAuth()` (usuário autenticado), `localStorage` para atividades.

## 2. Header Existente

**Não existe Header tradicional.** O layout principal (`MainLayout`) usa:
- `Sidebar` (`src/components/Sidebar/index.jsx`) — navegação lateral com avatar, brand, links, theme toggle, logout
- Hamburger button no topo do `.conteudo` para mobile
- `Breadcrumb` (`src/components/Breadcrumb/index.jsx`) abaixo do hamburger

A Landing Page precisará de um **Navbar próprio** (não pode usar a Sidebar).

## 3. Footer Existente

`src/components/Footer/index.jsx` (11 linhas):
```jsx
<footer className="footer">
  <p>&copy; {new Date().getFullYear()} Universo Relativo. Todos os direitos reservados.</p>
</footer>
```

Simples, apenas direitos autorais. A Landing precisará de um Footer institucional mais completo (logo, redes sociais, etc.)

## 4. Componentes Reutilizáveis Existentes

| Componente | Caminho | Uso |
|---|---|---|
| Sidebar | `src/components/Sidebar/index.jsx` | Navegação principal (autenticado) |
| Footer | `src/components/Footer/index.jsx` | Rodapé simples |
| Breadcrumb | `src/components/Breadcrumb/index.jsx` | Migalhas de pão |
| Loading | `src/components/Loading/index.jsx` | Spinner de carregamento |
| Toast | `src/components/Toast/index.jsx` | Notificações |
| ErrorBoundary | `src/components/ErrorBoundary.jsx` | Captura de erros |
| SessionModal | `src/components/SessionModal.jsx` | Modal de sessão encerrada |

## 5. Arquivos CSS

| Arquivo | Conteúdo |
|---|---|
| `src/assets/css/variables.css` | Design tokens (cores, sombras, bordas, fontes, sidebar) — dark/light |
| `src/assets/css/global.css` | Todos os estilos globais: reset, sidebar, theme toggle, badges, glass panel, stat cards, progress bars, modal, login, home/dashboard, buttons, forms, responsivo (~530 linhas) |
| `src/assets/css/session-modal.css` | Estilos do modal de sessão |

Não há CSS modular — tudo é global. A Landing Page pode seguir o mesmo padrão (adicionar ao global.css ou criar landing.css próprio).

## 6. Estrutura do React Router

```
BrowserRouter
└── App (useRoutes)
    ├── MainLayout
    │   ├── / ................. Home (dashboard aluno)
    │   ├── /login ............ Login
    │   └── PrivateRoute
    │       ├── /dashboard .... Dashboard
    │       ├── /apostilas ..... Apostilas
    │       ├── /flashcards .... Flashcards
    │       ├── /trilhas ....... Trilhas
    │       ├── /questoes ...... Questões
    │       ├── /provas ........ Provas
    │       └── /perfil ........ Perfil
    └── AdminLayout
        └── PrivateRoute (requireAdmin)
            └── /admin ........ Admin
```

Definido em `src/App.jsx`. `MainLayout` renderiza Sidebar + Breadcrumb + Outlet + Footer.

## 7. Plano de Integração da Landing

### Arquivos a criar

```
src/
  pages/
    Landing/
      Landing.jsx          ← Página principal da Landing
      Landing.css           ← Estilos da Landing
  components/
    Landing/
      Navbar.jsx            ← Navbar institucional (logo, links, Entrar/Cadastrar)
      Hero.jsx              ← Primeira dobra (título, subtítulo, imagem, CTAs)
      Features.jsx          ← Seção "Como Funciona" (cards)
      Showcase.jsx          ← Diferenciais / demonstração da plataforma
      CTA.jsx               ← Call to action final
      Footer.jsx            ← Footer institucional (logo, direitos, redes sociais)
```

### Rota

A Landing deve ser uma rota separada (não substituir `/` ainda):

```jsx
// Em App.jsx
{ path: "/", element: <Landing /> }  // substitui Home
```

O conteúdo atual de `<Home />` (dashboard aluno) será acessível via `/dashboard` (já existe) ou mantido em paralelo.

### Provider chain

A Landing NÃO deve usar `MainLayout` (sem Sidebar). Deve ser rota independente:

```jsx
{ path: "/", element: <Landing /> }  // sem MainLayout
```

### Diretrizes

- Seguir design do protótipo (ainda não fornecido — aguardar)
- Botões "Entrar" → `/login`
- Botões "Cadastrar" → `/register` (rota a criar futuramente)
- Scroll suave entre seções via `id` + `scrollIntoView`
- Nenhuma alteração em Firebase, Auth, Contexts, Sessão, Dashboard ou Admin

## Nenhum arquivo foi modificado.
