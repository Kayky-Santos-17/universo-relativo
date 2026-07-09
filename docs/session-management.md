# Session Management System

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    main.jsx                          │
│  ┌───────────────────────────────────────────────┐  │
│  │            SessionProvider                     │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │           AuthProvider                   │  │  │
│  │  │  ┌───────────────────────────────────┐  │  │  │
│  │  │  │   ThemeProvider / Toast / Sidebar │  │  │  │
│  │  │  │  ┌────────────────────────────┐  │  │  │  │
│  │  │  │  │     SessionModal           │  │  │  │  │
│  │  │  │  │     AppRoutes / Private    │  │  │  │  │
│  │  │  │  └────────────────────────────┘  │  │  │  │
│  │  │  └───────────────────────────────────┘  │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Fluxo de dados

```
Login (Login/index.jsx)
  │
  ▼
AuthContext.login(email, password)
  │  Firebase Auth: signInWithEmailAndPassword
  │
  ▼
handleLogin(uid, metadata)
  │  SessionContext
  ├─ ourSessionIdRef = sessionId
  ├─ setSessionValid(true)
  └─ sessionService.startSession(uid, sessionId, metadata)
       └─ Firestore: setDoc("users/{uid}", { activeSessionId, ... })

Logout (sidebar/botão)
  │
  ▼
AuthContext.logout()
  │
  ├─ handleLogout(uid)
  │    ├─ ourSessionIdRef = null
  │    └─ sessionService.clearSession(uid)
  │         └─ Firestore: activeSessionId = null
  │
  └─ authLogout()
       └─ Firebase: signOut(auth)

Conflito (outro dispositivo logou)
  │
  ▼
SessionContext.onSnapshot callback
  │  Firestore activeSessionId mudou
  ├─ remoteId !== localId → CONFLITO
  └─ setSessionValid(false)
       │
       ▼
SessionModal detecta sessionValid = false
  ├─ forceLogout() → signOut(auth) (sem limpar Firestore)
  └─ Renderiza overlay bloqueante
       │
       ▼
Usuário clica "Fazer login novamente"
  ├─ resetSession() → sessionValid = true
  └─ navigate("/login")
```

## Componentes

### `services/sessionService.js`
| Função | Descrição |
|---|---|
| `generateSessionId()` | Retorna `crypto.randomUUID()` |
| `startSession(uid, sessionId, metadata)` | Cria/atualiza `users/{uid}` com `activeSessionId` e metadados |
| `clearSession(uid)` | Marca `activeSessionId = null` no Firestore (usa `setDoc` com merge) |
| `onSessionChange(uid, callback)` | `onSnapshot` em `users/{uid}` |

### `contexts/SessionContext.jsx`
| State/Ref | Descrição |
|---|---|
| `sessionId` | UUID gerado uma vez por mount do provedor (vida da aba) |
| `sessionValid` | `true` por padrão, `false` quando conflito detectado |
| `sessionChecking` | `true` enquanto o snapshot não respondeu |
| `ourSessionIdRef` | Qual sessionId ESTA ABA registrou no Firestore (via `handleLogin`) |

| Método | Descrição |
|---|---|
| `handleLogin(uid, metadata)` | Marca sessão como válida, atualiza ref, salva no Firestore |
| `handleLogout(uid)` | Marca sessão como válida, limpa ref, limpa Firestore |
| `resetSession()` | Reseta `sessionValid` e `ourSessionIdRef` (usado pelo modal) |

### `hooks/useSession.js`
Hook que consome `SessionContext`. Lança erro se usado fora de `SessionProvider`.

### `components/SessionModal.jsx`
Overlay bloqueante com:
- `position: fixed; z-index: 99999`
- `role="dialog" aria-modal="true"`
- Botão "Fazer login novamente" → `resetSession()` → `navigate("/login")`
- Sem botão X, sem fechar com ESC ou click fora (`onKeyDown={e => e.preventDefault()}`, `onClick={e => e.stopPropagation()}`)
- `forceLogout()` executado uma vez na detecção do conflito

## Coleção Firestore

`users/{uid}`:
```json
{
  "activeSessionId": "uuid-v4",
  "lastLogin": "2026-07-08T12:00:00.000Z",
  "lastDevice": "Mozilla/5.0...",
  "lastBrowser": "Mozilla/5.0...",
  "lastPlatform": "Win32",
  "lastIp": "",
  "lastUserAgent": "Mozilla/5.0...",
  "updatedAt": "2026-07-08T12:00:00.000Z"
}
```

## Regras de segurança (Firestore)

```javascript
// Recomendado para a coleção "users"
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

## Casos de borda tratados

| Caso | Comportamento |
|---|---|
| `clearSession` em doc inexistente | `setDoc` com `merge: true` — não lança erro |
| Erro de rede em `startSession` | `try/catch` no `handleLogin` — login prossegue sem sessão |
| Erro de rede em `clearSession` | `try/catch` no `handleLogout` — logout prossegue sem limpeza |
| Duplo clique no login | Botão `disabled` enquanto `loading` — não gera conflito falso |
| Page refresh durante modal | `sessionValid` inicializa como `true` — modal não aparece sem motivo |
| Múltiplas abas do mesmo usuário | A segunda aba sobrescreve a sessão → primeira aba detecta conflito (por design — sessão única) |
| `crypto.randomUUID()` não disponível | Requer Chrome 92+, Edge 92+, Firefox 95+, Safari 15.4+ |

## Provider chain (main.jsx)

```
<StrictMode>
  <ErrorBoundary>
    <BrowserRouter>
      <SessionProvider>
        <AuthProvider>
          <ThemeProvider>
            <ToastProvider>
              <SidebarProvider>
                <SessionModal />
                <AppRoutes />
              </SidebarProvider>
            </ToastProvider>
          </ThemeProvider>
        </AuthProvider>
      </SessionProvider>
    </BrowserRouter>
  </ErrorBoundary>
</StrictMode>
```

## Checklist de testes

- [ ] Login em dois celulares diferentes → o primeiro é desconectado
- [ ] Login em celular + notebook → o celular é desconectado
- [ ] Login em notebook + notebook → o primeiro é desconectado
- [ ] Múltiplas abas no mesmo navegador → a primeira aba detecta conflito
- [ ] Reconexão após ficar offline → `onSnapshot` retoma normal
- [ ] Logout manual → `users/{uid}` tem `activeSessionId = null`
- [ ] Page refresh com sessão ativa → sessão permanece válida
- [ ] Modal sem botão X, sem fechar com ESC
- [ ] "Fazer login novamente" → redireciona para `/login`
