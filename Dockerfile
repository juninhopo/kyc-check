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

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências (package.json e package-lock.json se existir)
# .dockerignore evitará copiar node_modules local
COPY package*.json ./

# Instale as dependências com npm
# Removido --force e rebuild, pois o ambiente base do TF deve ajudar
RUN npm install

# Removida a etapa de cópia manual da libtensorflow.so

# Copie o restante dos arquivos do projeto (excluindo o que está no .dockerignore)
COPY . .

# Execute o build do projeto com npm
RUN npm run build

# Exponha a porta que o aplicativo usará
EXPOSE 3000

# Comando para iniciar o aplicativo com npm
CMD ["npm", "start"]