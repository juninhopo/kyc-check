# Use uma imagem base do Node.js
FROM node:20

# Defina o diretório de trabalho
WORKDIR /app

# Copie os arquivos de package.json e pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# Instale o pnpm
RUN npm install -g pnpm

# Instale as dependências
RUN pnpm install

# Copie o restante dos arquivos do projeto
COPY . .

# Execute o build do projeto
RUN pnpm build

# Exponha a porta que o aplicativo usará
EXPOSE 3000

# Comando para iniciar o aplicativo
CMD ["pnpm", "start"]