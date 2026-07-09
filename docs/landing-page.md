# Landing Page — Universo Relativo

## Estrutura

```
src/
  pages/
    Landing/
      Landing.jsx       ← Página principal (importa todos os componentes)
      Landing.css        ← Estilos completos da Landing
  components/
    Landing/
      Navbar.jsx         ← Navbar fixa com transparência ao scroll,
                            links de navegação, Entrar/Cadastrar,
                            hamburger menu mobile
      Hero.jsx           ← Primeira dobra: título gradiente, subtítulo,
                            CTAs primário/secundário, placeholder imagem
      Features.jsx       ← "Como funciona": 3 cards com ícone SVG,
                            step number, fade-in IntersectionObserver
      Showcase.jsx       ← "Diferenciais": 4 cards com emoji, grid 2 col,
                            fade-in IntersectionObserver
      CTA.jsx            ← Call-to-action final: glass-panel centralizado,
                            background gradiente, fade-in
      Footer.jsx         ← Footer institucional: logo, links, redes sociais
                            (Instagram, YouTube, TikTok placeholders)
```

## Dependências
- React (memo, useState, useEffect, useRef, useCallback)
- react-router-dom (Link, useNavigate)

## Rota
- `/` → `<Landing />` (fora de MainLayout, sem Sidebar)

## Estilos
- `Landing.css` com ~670 linhas, escopo `.landing-*`
- 3 breakpoints: 1024px (tablet), 768px (mobile), 480px (mobile pequeno)
- `prefers-reduced-motion` suportado
- `:focus-visible` outline roxo

## Animações
- Página: fade-in via classe `landing--loaded`
- Cards: IntersectionObserver + `translateY`/`opacity` transition
- Hero placeholder: `landing-float` keyframe
- Todas com `will-change` para GPU acceleration

## Próximos passos (fora do escopo)
- Login/Cadastro rework (email + Google)
- Substituir placeholders de imagem por SVG/ilustração real
- Conectar redes sociais reais
