# Sprint 1 — Auditoria da Autenticação

## Arquivos analisados

| Arquivo | Função |
|---|---|
| `src/services/firebase.js` | Inicializa Firebase App, Auth, Firestore, Storage |
| `src/services/auth.js` | Wrapper das funções do Firebase Auth (login, logout, register, onAuthChange) |
| `src/services/firestore.js` | Wrapper CRUD genérico do Firestore |
| `src/contexts/AuthContext.jsx` | Contexto central de autenticação |
| `src/hooks/useAuth.js` | Hook para consumir AuthContext |
| `src/routes/PrivateRoute.jsx` | Rota protegida (verifica user + isAdmin) |
| `src/App.jsx` | Definição de rotas, aplica PrivateRoute |
| `src/pages/Login/index.jsx` | Página de login |
| `src/main.jsx` | Entry point, Provider chain |
| `src/utils/constants.js` | Nomes das coleções Firestore |

## Fluxo atual

1. **main.jsx** → `AuthProvider` envolve toda a árvore
2. **AuthContext** → `onAuthChange()` escuta `onAuthStateChanged` do Firebase Auth
3. Ao detectar usuário logado → busca `alunos/{uid}` no Firestore pra obter `userData` e `isAdmin`
4. **PrivateRoute** → lê `{ user, loading, isAdmin }` do `useAuth()`
   - `loading` true → mostra `<Loading />`
   - `user` null → redireciona para `/login`
   - `requireAdmin` true + `!isAdmin` → redireciona para `/dashboard`
   - OK → renderiza `<Outlet />`
5. **Login** → `login(email, password)` → `signInWithEmailAndPassword`
   - Aluno: matrícula + `@universorelativo.app`
   - Admin: email completo → redirect `/admin`

## Coleções Firestore usadas

| Coleção | Local | Finalidade |
|---|---|---|
| `alunos` | `AuthContext.jsx:25` | Buscar `userData` e `isAdmin` pelo UID |
| `banco_questoes` | `Admin/index.jsx` | Questões (não relacionado a auth) |

## Plano de integração — Sessão Única

### 1. `services/sessionService.js` (novo)
- `generateSessionId()` → crypto.randomUUID()
- `startSession(uid, sessionId, metadata)` → salva em `users/{uid}`: `{ activeSessionId, lastLogin, lastDevice, lastBrowser, lastPlatform, lastIp, lastUserAgent, updatedAt }`
- `clearSession(uid)` → remove `activeSessionId` do doc
- `onSessionChange(uid, callback)` → `onSnapshot()` no doc `users/{uid}`, compara `activeSessionId`

### 2. `hooks/useSession.js` (novo)
- Expõe `{ sessionValid, sessionChecking }`
- `sessionValid` = `activeSessionId` do Firestore === `sessionId` da sessão atual

### 3. `contexts/SessionContext.jsx` (novo)
- Gera `sessionId` no mount (armazena em state ou variável)
- Após login confirmado, chama `startSession()`
- Escuta `onSnapshot()` em `users/{uid}`
- Se `activeSessionId` diferente do local → dispara sessão encerrada

### 4. Modificações em `AuthContext.jsx`
- Após login bem-sucedido, disparar `startSession()` com metadados do dispositivo
- No logout, chamar `clearSession()`

### 5. Modal "Sessão Encerrada" (novo componente)
- Seguir identidade visual do PRD
- Overlay escuro, borda roxa, mascote
- Sem botão X, sem fechar com ESC/clique externo
- Botão "Fazer login novamente" → redireciona para `/login`

### 6. `PrivateRoute.jsx`
- Adicionar verificação de `sessionValid`
- Se sessão inválida, mostrar modal em vez de redirect

### 7. Coleção Firestore `users` (nova)
- `users/{uid}` com campos: `activeSessionId`, `lastLogin`, `lastDevice`, `lastBrowser`, `lastPlatform`, `lastIp`, `lastUserAgent`, `updatedAt`
- Regra de segurança: apenas o próprio usuário pode ler/escrever

## Nenhum arquivo foi modificado.
