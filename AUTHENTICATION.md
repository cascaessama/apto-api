# Autenticação e Autorização - APTO API

## Visão Geral

A API APTO agora implementa autenticação e autorização baseadas em JWT (JSON Web Tokens) com controle de acesso por função (role-based access control).

## Componentes de Autenticação

### 1. Middleware de Autenticação (`src/middleware/auth.ts`)

O middleware de autenticação fornece três funcionalidades principais:

#### `authMiddleware`
- Valida se o token JWT é válido
- Extrai informações do usuário do token
- Rejeita requisições sem token ou com token inválido

#### `professorOnly`
- Middleware de autorização que restringe acesso apenas a professores
- Retorna erro 403 se o usuário não for um professor

#### `alunoOnly`
- Middleware de autorização que restringe acesso apenas a alunos
- Retorna erro 403 se o usuário não for um aluno

### 2. Endpoints de Login

#### Professor Login
```
POST {{BASE_URL}}/api/professores/login
Content-Type: application/json

{
  "nome": "professor1",
  "senha": "senha123"
}

Resposta:
{
  "id": "...",
  "nome": "professor1",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensagem": "Login realizado com sucesso"
}
```

#### Aluno Login
```
POST {{BASE_URL}}/api/alunos/login
Content-Type: application/json

{
  "nome": "aluno1",
  "senha": "senha123"
}

Resposta:
{
  "id": "...",
  "nome": "aluno1",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "mensagem": "Login realizado com sucesso"
}
```

## Controle de Acesso

### Professores
Os professores têm acesso a **TODAS** as funcionalidades:
- ✅ Criar, listar, obter, atualizar, deletar Professores
- ✅ Criar, listar, obter, atualizar, deletar Alunos
- ✅ Criar, listar, obter, atualizar, deletar Cursos
- ✅ Criar, listar, obter, atualizar, deletar Avaliações
- ✅ Criar, listar, obter, atualizar, deletar Avaliações de Alunos

### Alunos
Os alunos têm acesso **RESTRITO** a apenas 2 endpoints:
1. **GET `/api/alunos/{id}/resumo-avaliacoes`** - Obter resumo de avaliações e cursos de reforço
2. **GET `/api/avaliacoes-alunos/aluno/{id}`** - Obter lista de suas próprias avaliações

Os alunos **NÃO** podem acessar:
- ❌ Endpoints de CRUD de Professores
- ❌ Endpoints de CRUD de Alunos
- ❌ Endpoints de CRUD de Cursos
- ❌ Endpoints de CRUD de Avaliações
- ❌ Endpoints de CRUD de Avaliações de Alunos (exceto os 2 acima)

## Como Usar

### 1. Fazer Login
Primeiro, realize o login para obter o token JWT:

```bash
curl -X POST http://localhost:3010/api/professores/login \
  -H "Content-Type: application/json" \
  -d '{"nome": "professor1", "senha": "senha123"}'
```

Copie o token retornado.

### 2. Usar o Token
Inclua o token no header `Authorization` de todas as requisições:

```bash
curl -X GET http://localhost:3010/api/professores \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. No Postman
A coleção Postman foi atualizada com:
- Endpoints de login na seção "Autenticação"
- Headers `Authorization: Bearer {{PROFESSOR_TOKEN}}` e `{{ALUNO_TOKEN}}` em todos os endpoints protegidos
- Scripts de teste que automaticamente salvam o token nas variáveis de ambiente

**Fluxo no Postman:**
1. Execute "Professor Login" para obter o token
2. O token é automaticamente salvo em `{{PROFESSOR_TOKEN}}`
3. Use este token em outras requisições

## Variáveis de Ambiente

### No .env
```
JWT_SECRET=fiap25
```

### No Postman
```
BASE_URL=http://localhost:3010
PROFESSOR_TOKEN=[token obtido no login]
ALUNO_TOKEN=[token obtido no login]
PROFESSOR_ID=[ID do professor]
ALUNO_ID=[ID do aluno]
CURSO_ID=[ID do curso]
AVALIACAO_ID=[ID da avaliação]
AVALIACAO_ALUNO_ID=[ID da avaliação do aluno]
```

## Detalhes Técnicos

### Token JWT
- **Tipo**: HS256
- **Duração**: 24 horas
- **Payload**:
  ```json
  {
    "id": "user_id",
    "nome": "user_name",
    "tipo": "professor|aluno",
    "iat": 1234567890,
    "exp": 1234654290
  }
  ```

### Senhas
- Armazenadas com hash bcryptjs (rounds: 10)
- Nunca são retornadas nas respostas de GET

### Validação de Acesso
1. Token é validado no middleware `authMiddleware`
2. Role específica é validada em `professorOnly` ou `alunoOnly`
3. Alunos podem acessar apenas seus próprios dados (validação de ID)

## Tratamento de Erros

### Token Inválido/Expirado
```json
{
  "erro": "Token inválido ou expirado"
}
```
Status: 401

### Acesso Não Autorizado
```json
{
  "erro": "Você não tem permissão para acessar este recurso"
}
```
Status: 403

### Credenciais Inválidas (Login)
```json
{
  "erro": "Nome ou senha incorretos"
}
```
Status: 401

## Mudanças Realizadas

1. ✅ Criado middleware de autenticação (`src/middleware/auth.ts`)
2. ✅ Adicionados endpoints de login para Professor e Aluno
3. ✅ Protegidos todos os endpoints com `authMiddleware`
4. ✅ Aplicado `professorOnly` aos endpoints que requerem acesso de professor
5. ✅ Aplicado `alunoOnly` aos 2 endpoints exclusivos para alunos
6. ✅ Atualizada coleção Postman com tokens e headers de autenticação
7. ✅ Instalado pacote `jsonwebtoken` e tipos TypeScript
8. ✅ Compilação TypeScript sem erros

## Próximas Etapas (Opcional)

Para aumentar a segurança, considere:
1. Implementar refresh tokens
2. Adicionar rate limiting no endpoint de login
3. Adicionar auditoria de login
4. Implementar 2FA (autenticação de dois fatores)
5. Adicionar expiração de sessão
