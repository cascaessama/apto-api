<h1 align="center">APTO API</h1>

<p align="center"><em>API desenvolvida em TypeScript com Express e MongoDB para gerenciar professores.</em></p>

---

## ⚙️ Configuração

### 🔐 Variáveis de Ambiente

As variáveis de ambiente devem estar configuradas no arquivo `.env`:

```env
PORT=3010
MONGO_URL=mongodb+srv://conectaedu:fiapconectaedu@conecta-edu.izbw4ii.mongodb.net/conecta-edu
JWT_SECRET=fiap25
```

---

### 📦 Instalação de Dependências

```bash
npm install
```

### 🧪 Executar em Modo Desenvolvimento

```bash
npm run dev
```

### 🏗️ Build para Produção

```bash
npm run build
npm start
```

---

## 🐳 Docker

### Passo a passo para montar a imagem

1. Garanta que o arquivo `.env` esteja presente com as variáveis necessárias.
2. Faça o build da imagem:

```bash
docker build -t apto-api:latest .
```

3. Execute o container:

```bash
docker run --rm -p 3010:3010 --env-file .env apto-api:latest
```

---

## 🧭 Endpoints

<p align="center">
	<img src="docs/fluxo.png" alt="Fluxo da aplicação" width="900" />
</p>

Principais recursos da API:

- Professores: CRUD e login
- Alunos: CRUD e login
- Cursos: CRUD
- Avaliações: CRUD
- Avaliações de Alunos: CRUD
- Resumo de avaliações do aluno

---

## 🧱 Estrutura do Projeto

```
apto-api/
├── src/
│   ├── middleware/          # autenticação e autorização
│   ├── models/              # schemas e regras de negócio
│   ├── routes/              # rotas da API
│   └── index.ts             # bootstrap do servidor
├── dist/                    # build TypeScript
├── .env                     # variáveis de ambiente
├── package.json
├── tsconfig.json
├── README.md
└── postman_collection.json  # coleção Postman
```

---

## 📬 Coleção Postman

As requisições estão disponíveis em [postman_collection.json](postman_collection.json).

---

## 🛡️ Segurança

- As senhas são armazenadas com hash bcrypt
- O endpoint de listagem de professores não retorna as senhas
- Validação de campos obrigatórios
- Tratamento de erros adequado
