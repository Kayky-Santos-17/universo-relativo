# PRD — Sistema de Gerenciamento de Sessões (Single Active Session)

Este documento reúne o PRD completo da funcionalidade de sessão única.

## Objetivo
Implementar uma única sessão ativa por usuário utilizando React + Firebase.

### Regras principais
- Apenas uma sessão ativa.
- Novo login invalida a sessão anterior.
- Firestore é a fonte de verdade.
- Listener em tempo real com onSnapshot().
- Logout automático ao detectar Session ID inválido.

## Estrutura
- services/sessionService.js
- contexts/SessionContext.jsx
- hooks/useSession.js

## Firestore
Coleção users/{uid} com activeSessionId, lastLogin, lastDevice, lastBrowser, lastPlatform, lastIp, lastUserAgent e updatedAt.

## Modal Personalizado (Atualização)
O sistema deve exibir um modal personalizado seguindo exatamente a identidade visual do Universo Relativo.

Título: Sessão Encerrada

Mensagem:
Detectamos um acesso à sua conta em outro dispositivo.

Por motivos de segurança, esta sessão foi finalizada automaticamente.

Botão:
Fazer login novamente

Regras do modal:
- Overlay escuro.
- Fundo escuro com borda roxa.
- Mascote da plataforma.
- Sem botão X.
- Não fechar com ESC.
- Não fechar clicando fora.
- Bloquear interação.
- Responsivo.
- role='dialog' e aria-modal='true'.
- Fade + Scale na entrada e saída.

## Instruções para IA
1. Analisar autenticação existente.
2. Implementar sessão única.
3. Não alterar identidade visual.
4. Documentar todos os arquivos modificados.
