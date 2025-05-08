# Usar a imagem oficial do TensorFlow (CPU) como base
FROM tensorflow/tensorflow:latest

# Instalar Node.js v20 e ferramentas de build
RUN apt-get update && apt-get install -y \
    curl \
    apt-utils \
    build-essential \
    python3 \
    make \
    g++ \
    python3-pip \
    python3-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    pkg-config && \
    # Instalar Node.js 20 usando Nodesource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    # Limpar cache do apt
    rm -rf /var/lib/apt/lists/*

# Instalar pnpm
RUN npm install -g pnpm

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências, workspace e configuração
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./

# Copie os arquivos package.json dos pacotes individuais
COPY packages/api/package.json ./packages/api/
COPY packages/web/package.json ./packages/web/

# Instale as dependências com pnpm
RUN pnpm install

# Copie o restante dos arquivos do projeto (excluindo o que está no .dockerignore)
COPY . .

# Baixe os modelos de ML necessários
RUN pnpm download-models

# Execute o build do projeto com pnpm
RUN pnpm build

# Exponha a porta que o aplicativo usará
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["pnpm", "start:api"]