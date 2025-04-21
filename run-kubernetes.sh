#!/bin/bash

# Variáveis
APP_NAME="facecheck"
DOCKER_IMAGE="$APP_NAME:latest"

# Construir imagem Docker
echo "Construindo imagem Docker..."
docker build -t $DOCKER_IMAGE .

# Iniciar minikube se não estiver rodando
if ! minikube status &>/dev/null; then
  echo "Iniciando minikube..."
  minikube start
fi

# Carregar imagem no minikube
echo "Carregando imagem no minikube..."
minikube image load $DOCKER_IMAGE

# Criar namespace
kubectl create namespace $APP_NAME --dry-run=client -o yaml | kubectl apply -f -

# Aplicar manifestos
echo "Aplicando manifestos Kubernetes..."
kubectl apply -f k8s/deployment.yaml -n $APP_NAME
kubectl apply -f k8s/service.yaml -n $APP_NAME

# Verificar status dos pods
echo "Verificando status dos pods..."
kubectl get pods -n $APP_NAME

# Expor serviço
echo "Expondo serviço na porta 3000..."
kubectl port-forward -n $APP_NAME service/$APP_NAME 3000:3000 &
PF_PID=$!

echo "Aplicação disponível em: http://localhost:3000"
echo "Para parar o port-forward, use: kill $PF_PID" 