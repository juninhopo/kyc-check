FROM node:20-alpine

# Instalar pnpm
RUN npm install -g pnpm@latest

# Instalar dependências necessárias para canvas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    pixman-dev \
    cairo-dev \
    pango-dev \
    libjpeg-turbo-dev

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json pnpm-lock.yaml* ./

# Instalar dependências
RUN pnpm install --frozen-lockfile

# Copiar código da aplicação
COPY . .

# Compilar a aplicação
RUN pnpm build

# Expor porta
EXPOSE 3000

# Iniciar a aplicação
CMD ["pnpm", "start"] 