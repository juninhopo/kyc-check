#!/bin/bash

# Variáveis
APP_NAME="kyc-check"
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
kubectl create namespace kyc-check --dry-run=client -o yaml | kubectl apply -f -

# Aplicar manifestos atualizados
kubectl apply -f k8s/deployment.yaml -n kyc-check
kubectl apply -f k8s/service.yaml -n kyc-check

# Verificar status dos pods
echo "Verificando status dos pods..."
kubectl get pods -n kyc-check

# Iniciar o port-forward
kubectl port-forward -n kyc-check service/kyc-check 3000:3000

echo "Aplicação disponível em: http://localhost:3000" 