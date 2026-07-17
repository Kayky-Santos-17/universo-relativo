# PRD — Migração de Funcionalidades (Projeto Arthur)

**Projeto:** Universo Relativo
**Versão:** 1.0
**Prioridade:** Alta
**Base:** Projeto em `C:\Users\kayky_2d9lyqp\OneDrive\Documents\arthur`

---

## Objetivo

Incorporar ao projeto principal todas as funcionalidades, componentes e configurações presentes no projeto do Arthur que ainda não existem ou estão implementadas de forma diferente no projeto atual.

---

## Sprint 1 — Landing Page Reformulada

Substituir a Landing Page atual pelos componentes aprimorados do projeto Arthur.

### 1.1 HeroAstronaut — SVG Animado

**Arquivos:**
- `src/components/Landing/HeroAstronaut.jsx`
- `src/components/Landing/HeroAstronaut.css`

**Descrição:** Componente SVG customizado de astronauta flutuante com gradientes, visor com reflexo de planeta, estrelas flutuantes e animação CSS `heroAstroFloat` (flutuação suave 6s). Substitui o componente `Astronaut` atual no Hero.

### 1.2 Features — Seção "Como Funciona"

**Arquivo:** `src/components/Landing/Features.jsx`

**Descrição:** Seção com grid de 4 cards (Aprenda, Pratique, Revise, Evolua). Cada card tem ícone SVG, título, descrição, número de etapa. Animações de entrada com `IntersectionObserver`. Estilo com bordas, hover effects, backdrop-filter.

### 1.3 UniverseConceptSection — "Por que Universo Relativo?"

**Arquivo:** `src/components/Landing/UniverseConceptSection.jsx`

**Descrição:** Seção filosófica explicando o nome da plataforma. Divide-se em:
- **Lado esquerdo:** texto com citação em blockquote (fala sobre relatividade e educação)
- **Lado direito:** grid 2×2 de cards dos módulos da plataforma (Início, Física Básica, Relatividade Especial, Banco de Questões, Provas, Flash Cards)
- Animações com `IntersectionObserver`

### 1.4 Navbar Aprimorada

**Arquivo:** `src/components/Landing/Navbar.jsx`

**Descrição:** Navbar fixa com:
- Scroll detection (fica transparente no topo, escurece com blur ao scrollar)
- Links de navegação âncora (#hero, #features, #showcase, #cta) com smooth scroll
- Botões "Entrar" e "Cadastrar" que levam ao `/login`
- Hamburger menu responsivo para mobile

### 1.5 Hero Atualizado

**Arquivo:** `src/components/Landing/Hero.jsx`

**Descrição:** Hero section usando `HeroAstronaut` SVG. Inclui:
- Background com gradientes e nébula
- Planeta decorativo no canto inferior direito
- Scroll indicator animado
- Botões "Comece Grátis" e "Quero Conhecer"

### 1.6 Showcase Atualizado

**Arquivo:** `src/components/Landing/Showcase.jsx`

**Descrição:** Seção "Muito além de PDFs" com:
- Mockup de dashboard com barras de progresso por assunto
- Lista de benefícios com checkmarks roxos
- Animações de entrada

### 1.7 CTA Atualizado

**Arquivo:** `src/components/Landing/CTA.jsx`

**Descrição:** Call-to-action final com planeta decorativo, gradiente no botão, animações de entrada.

### 1.8 Footer Atualizado

**Arquivo:** `src/components/Landing/Footer.jsx`

**Descrição:** Footer com logo, descrição, links de navegação âncora, ícones sociais (Instagram, YouTube, TikTok — com paths SVG completos) e copyright dinâmico.

### 1.9 Landing.css Dedicado

**Arquivo:** `src/pages/Landing/Landing.css`

**Descrição:** Arquivo CSS exclusivo para a Landing Page (~1194 linhas) com:
- Star field persistente com múltiplos radial-gradients
- Estilos de navbar, hero, features, showcase, universe-section, CTA, footer
- Scrollbar customizada roxa
- Media queries para tablet e mobile
- `prefers-reduced-motion` para acessibilidade
- Animações com `IntersectionObserver` e transições CSS

### 1.10 Landing.jsx Atualizado

**Arquivo:** `src/pages/Landing/Landing.jsx`

**Descrição:** Nova Landing Page que importa e renderiza todos os componentes acima na ordem:
`Navbar → Hero → Features → UniverseConceptSection → Showcase → CTA → Footer`

---

## Sprint 2 — Dashboard Separado

**Arquivo:** `src/pages/Dashboard/index.jsx`

**Descrição:** Criar página Dashboard separada (atualmente usamos `Home/index.jsx` como dashboard). O projeto Arthur tem um Dashboard simples:
- Mensagem de boas-vindas com nome do usuário
- Rota `/dashboard` aponta para este componente
- `Home/index.jsx` permanece como está (usado para outra finalidade ou removido se não utilizado)

**Impacto nas rotas:** Atualizar `App.jsx`:
```
/dashboard → Dashboard
/inicio → Home  (se Home existir como página separada)
```

---

## Sprint 3 — AdminLayout

**Arquivo:** `src/layouts/AdminLayout.jsx`

**Descrição:** Recriar o layout AdminLayout (atualmente removido no nosso projeto):
```jsx
import { Outlet } from "react-router-dom";
export default function AdminLayout() {
  return <Outlet />;
}
```

**Impacto nas rotas:** Atualizar `App.jsx` para usar `AdminLayout` como wrapper das rotas admin (como no projeto Arthur).

---

## Sprint 4 — Firebase Hosting

**Arquivos:**
- `firebase.json` — configuração de hosting
- `.firebaserc` — vínculo com projeto Firebase "universo-reativo"

**Descrição:** Adicionar configuração de deploy para Firebase Hosting:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

---

## Sprint 5 — AppRoutes Separado

**Arquivo:** `src/routes/AppRoutes.jsx`

**Descrição:** Extrair as rotas do `App.jsx` para um arquivo separado `AppRoutes.jsx`, como no projeto Arthur. O `App.jsx` fica mais enxuto.

---

## Sprint 6 — Firestore Rules

**Arquivo:** `firestore.rules`

**Descrição:** Decisão necessária. O projeto Arthur usa **coleção separada `admins/{uid}`** para identificar administradores. O projeto atual usa **campo `admin: true` no documento `alunos/{uid}`**.

**Opção A (manter nossa abordagem):** Manter `alunos/{uid}/admin: true` como única fonte de verdade. Atualizar as regras para incluir todas as coleções do app.

**Opção B (adotar abordagem do Arthur):** Criar coleção `admins/{uid}` e migrar a verificação de admin.

**Recomendação:** Opção A (já implementamos a padronização via PRD anterior).

---

## Sprint 7 — Footer Global

**Arquivo:** `src/components/Footer/index.jsx`

**Descrição:** O projeto Arthur tem um componente `Footer/index.jsx` separado para uso no `MainLayout`. Verificar se o nosso já atende ou substituir pela versão do Arthur.

---

## Sprint 8 — Limpeza

**Ação:** Remover a pasta `universo-relativo/` dentro do projeto arthur (`arthur/universo-relativo/`), pois é uma cópia redundante do mesmo projeto.

---

## Cronograma Sugerido

| Sprint | Descrição | Esforço |
|--------|-----------|---------|
| 1 | Landing Page reformulada | Alto |
| 2 | Dashboard separado | Baixo |
| 3 | AdminLayout | Baixo |
| 4 | Firebase Hosting | Baixo |
| 5 | AppRoutes separado | Baixo |
| 6 | Firestore Rules | Médio |
| 7 | Footer Global | Baixo |
| 8 | Limpeza | Baixo |

---

## Riscos

1. **Conflito de estilos:** Landing.css tem 1194 linhas — pode conflitar com estilos existentes no global.css. Necessário isolamento.
2. **AdminLayout:** É um pass-through (`<Outlet />`) — funcionalmente idêntico a não ter o layout. Vale a pena apenas se for expandido no futuro.
3. **Dashboard separado vs Home:** Precisamos definir se mantemos ambos ou unificamos.
4. **Sistema de admin:** Decisão entre `admins/` collection vs `alunos/{uid}/admin: true` precisa ser tomada antes do Sprint 6.
