# Etapa 1: Build da aplicação
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar código fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# Etapa 2: Imagem de produção
FROM node:18-alpine

WORKDIR /app

# Copiar package.json para instalar apenas dependências de produção
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar código compilado da etapa anterior
COPY --from=builder /app/dist ./dist

# Expor a porta da aplicação
EXPOSE 3010

# Comando para iniciar a aplicação
CMD ["npm", "start"]
