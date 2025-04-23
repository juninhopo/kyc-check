#!/bin/bash

# Configurar para usar o Docker do Minikube
eval $(minikube docker-env)

# Construir a imagem Docker
echo "Construindo a imagem kyc-check:latest..."
docker build --no-cache -t kyc-check:latest .

# Reiniciar o deployment no Kubernetes
echo "Reiniciando o deployment kyc-check..."
kubectl rollout restart deployment kyc-check

# Monitorar os pods
echo "Monitorando os pods..."
# kubectl get pods -l app=kyc-check -w

# Nota: pressione Ctrl+C para parar o monitoramento
# Para ver os logs depois que os pods estiverem rodando, use:
# kubectl logs -l app=kyc-check
# Para ver logs em tempo real:
# kubectl logs -f -l app=kyc-check

# SOLUÇÃO PARA ERRO ERR_DLOPEN_FAILED:
# Se você continuar enfrentando o erro "ERR_DLOPEN_FAILED", tente esta solução manual.
# Acesse o pod e execute:
# 
# 1. Encontre o nome do pod:
#    kubectl get pods -l app=kyc-check
#
# 2. Abra um shell no pod:
#    kubectl exec -it <NOME_DO_POD> -- /bin/bash
#
# 3. Dentro do pod, copie o tensorflow.dll:
#    cp /app/node_modules/@tensorflow/tfjs-node/deps/lib/* /app/node_modules/@tensorflow/tfjs-node/lib/napi-v8/
