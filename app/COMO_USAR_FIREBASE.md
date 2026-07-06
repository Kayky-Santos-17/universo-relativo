# Universo Relativo com Firebase

## O que ja ficou pronto

- Login de aluno por matricula e senha na pagina principal.
- Painel administrativo para cadastrar alunos em `admin.html`.
- Cadastro real no Firebase Authentication.
- Perfil do aluno salvo na colecao `alunos` do Firestore.
- Arquivos de deploy e regras basicas do Firestore.

## Como o login funciona

O aluno entra com:

- matricula
- senha

Por tras, o sistema transforma a matricula em um email tecnico:

- `matricula@aluno.universorelativo.app`

Exemplo:

- matricula `2026001`
- email interno `2026001@aluno.universorelativo.app`

O aluno nao precisa ver esse email tecnico.

## O que voce precisa fazer uma vez no Firebase

### 1. Criar um app web

No console do Firebase:

1. Abra o projeto `universo-relativo-f84a7`.
2. Clique para adicionar um app web.
3. Copie os dados de configuracao.
4. Cole em `firebase-config.js`.

Arquivo:

- `firebase-config.js`

Voce precisa substituir principalmente:

- `apiKey`
- `appId`

### 2. Ativar Authentication

No console do Firebase:

1. Entre em `Authentication`.
2. Clique em `Get started`.
3. Em `Sign-in method`, habilite `Email/Password`.

### 3. Ativar Firestore Database

1. Entre em `Firestore Database`.
2. Clique em `Create database`.
3. Escolha modo de producao ou teste.
4. Depois publique as regras do arquivo `firestore.rules`.

## Como liberar o primeiro administrador

Para o painel `admin.html` funcionar, voce precisa de um admin real.

Faca assim:

1. No Firebase Authentication, crie manualmente um usuario administrador com email e senha.
2. Copie o `uid` desse usuario.
3. No Firestore, crie o documento:

- colecao: `admins`
- documento: `UID_DO_ADMIN`

Conteudo minimo:

```json
{
  "nome": "Administrador"
}
```

Depois disso, voce ja consegue entrar em `admin.html`.

## Como cadastrar alunos depois

1. Abra `admin.html`.
2. Entre com o email e senha do administrador.
3. Preencha:
   - nome
   - matricula
   - turma
   - senha inicial
4. Clique em `Cadastrar aluno`.

Pronto: o aluno ja pode entrar pela `index.html` com matricula e senha.

## Painel administrativo

Depois do login do admin, o painel agora permite:

- cadastrar novos alunos
- visualizar a lista dos alunos ja matriculados
- editar nome e turma
- acompanhar o progresso salvo no banco
- trocar senha do aluno quando voce souber a senha atual dele

Observacao:

- a troca de senha foi implementada sem backend proprio, entao o painel precisa da senha atual do aluno para definir uma nova

## Estrutura criada no Firestore

Colecao `admins`:

- documento com id igual ao `uid` do administrador

Colecao `alunos`:

- `nome`
- `matricula`
- `turma`
- `emailAuth`
- `ativo`
- `criadoEm`

## Como publicar esta pasta

Abra o terminal dentro desta pasta:

```powershell
cd "C:\Users\paulo\Downloads\Universo Relativo\Site - Copia - Copia"
firebase deploy
```

## Observacoes importantes

- O arquivo principal do site agora e `index.html`.
- O cadastro de aluno foi feito para funcionar sem backend proprio.
- Se no futuro voce quiser reset de senha, turmas, progresso por aluno e painel de notas, a base ja esta preparada para evoluir.
