#!/bin/bash

# Script para configurar o monorepo KYC

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Configurando o monorepo KYC...${NC}"

# Diretórios
ROOT_DIR=$(pwd)
API_SRC="$ROOT_DIR/src"
API_DEST="$ROOT_DIR/packages/api/src"
MODELS_DIR="$ROOT_DIR/models"
API_MODELS_DIR="$ROOT_DIR/packages/api/models"

# Verifica se o diretório de destino existe
if [ ! -d "$API_DEST" ]; then
    echo -e "${YELLOW}Criando diretório $API_DEST...${NC}"
    mkdir -p "$API_DEST"
fi

# Copia os arquivos da API para o pacote api
echo -e "${YELLOW}Copiando arquivos da API...${NC}"
if [ -d "$API_SRC" ]; then
    cp -r "$API_SRC"/* "$API_DEST"/
    echo -e "${GREEN}Arquivos da API copiados com sucesso!${NC}"
else
    echo -e "${RED}Diretório da API fonte não encontrado!${NC}"
    exit 1
fi

# Copia os modelos para o pacote api
if [ ! -d "$API_MODELS_DIR" ]; then
    echo -e "${YELLOW}Criando diretório de modelos para a API...${NC}"
    mkdir -p "$API_MODELS_DIR"
fi

echo -e "${YELLOW}Copiando modelos para a API...${NC}"
if [ -d "$MODELS_DIR" ]; then
    cp -r "$MODELS_DIR"/* "$API_MODELS_DIR"/
    echo -e "${GREEN}Modelos copiados com sucesso!${NC}"
else
    echo -e "${YELLOW}Diretório de modelos não encontrado. Será necessário baixá-los.${NC}"
fi

# Cria o arquivo .env para a API
echo -e "${YELLOW}Criando arquivo .env para a API...${NC}"
cat > "$ROOT_DIR/packages/api/.env" << EOL
PORT=3001
MODELS_PATH=./models
EOL
echo -e "${GREEN}Arquivo .env criado para a API!${NC}"

echo -e "${GREEN}Configuração do monorepo concluída!${NC}"
echo -e "${YELLOW}Execute os seguintes comandos para iniciar o desenvolvimento:${NC}"
echo -e "  1. ${GREEN}pnpm install${NC} - Para instalar todas as dependências"
echo -e "  2. ${GREEN}pnpm dev${NC} - Para iniciar API e frontend em modo desenvolvimento"