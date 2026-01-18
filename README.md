# APTO API

API desenvolvida em TypeScript com Express e MongoDB para gerenciar professores.

## Configuração

### Variáveis de Ambiente

As variáveis de ambiente devem estar configuradas no arquivo `.env`:

```
PORT=3010
MONGO_URL=mongodb+srv://conectaedu:fiapconectaedu@conecta-edu.izbw4ii.mongodb.net/conecta-edu
JWT_SECRET=fiap25
```

### Instalação de Dependências

```bash
npm install
```

### Executar em Modo Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
npm start
```

## Endpoints - Professores

### 1. Criar Professor
**POST** `/api/professores`

Request:
```json
{
  "nome": "João Silva",
  "senha": "123456"
}
```

Response (201):
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "nome": "João Silva",
  "mensagem": "Professor criado com sucesso"
}
```

### 2. Listar Todos os Professores
**GET** `/api/professores`

Response (200):
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nome": "João Silva",
    "createdAt": "2026-01-18T10:30:00Z",
    "updatedAt": "2026-01-18T10:30:00Z"
  }
]
```

### 3. Obter Professor por ID
**GET** `/api/professores/:id`

Response (200):
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "nome": "João Silva",
  "createdAt": "2026-01-18T10:30:00Z",
  "updatedAt": "2026-01-18T10:30:00Z"
}
```

### 4. Pesquisar Professor por Nome
**GET** `/api/professores/nome/{nome}`

Response (200):
```json
[
  {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "nome": "João Silva",
    "createdAt": "2026-01-18T10:30:00Z",
    "updatedAt": "2026-01-18T10:30:00Z"
  }
]
```

### 5. Atualizar Professor
**PUT** `/api/professores/:id`

Request:
```json
{
  "nome": "João Silva Atualizado",
  "senha": "nova_senha"
}
```

Response (200):
```json
{
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "nome": "João Silva Atualizado",
  "mensagem": "Professor atualizado com sucesso"
}
```

### 6. Deletar Professor
**DELETE** `/api/professores/:id`

Response (200):
```json
{
  "mensagem": "Professor removido com sucesso"
}
```

## Estrutura do Projeto

```
apto-api/
├── src/
│   ├── models/
│   │   └── Professor.ts
│   ├── routes/
│   │   └── professores.ts
│   └── index.ts
├── dist/
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

## Segurança

- As senhas são armazenadas com hash bcrypt
- O endpoint de listagem de professores não retorna as senhas
- Validação de campos obrigatórios
- Tratamento de erros adequado
