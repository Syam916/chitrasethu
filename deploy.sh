#!/bin/bash

# Deployment script for Chitrasethu on AWS EC2
# This script can be used as an alternative to the GitHub Actions workflow

set -e

echo "🚀 Starting deployment..."

# AWS Configuration
AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="002255676455"
ECR_BACKEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/chitrasethu_backend"
ECR_FRONTEND="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/chitrasethu_frontend"

# Login to ECR
echo "📦 Logging into ECR..."
aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

# Pull latest images
echo "⬇️  Pulling latest images..."
docker pull ${ECR_BACKEND}:latest || docker pull ${ECR_BACKEND}:main
docker pull ${ECR_FRONTEND}:latest || docker pull ${ECR_FRONTEND}:main

# Stop existing containers
echo "🛑 Stopping existing containers..."
docker-compose down || true
docker stop chitrasethu_backend chitrasethu_frontend 2>/dev/null || true
docker rm chitrasethu_backend chitrasethu_frontend 2>/dev/null || true

# Start containers using docker-compose
echo "▶️  Starting containers..."
if [ -f "docker-compose.yml" ]; then
    docker-compose up -d
else
    # Fallback to docker run if docker-compose is not available
    echo "Using docker run (docker-compose.yml not found)..."
    
    docker run -d \
        --name chitrasethu_backend \
        --restart unless-stopped \
        -p 5000:5000 \
        -p 5001:5001 \
        --env-file .env.backend \
        ${ECR_BACKEND}:latest
    
    docker run -d \
        --name chitrasethu_frontend \
        --restart unless-stopped \
        -p 80:80 \
        -p 443:443 \
        --env-file .env.frontend \
        ${ECR_FRONTEND}:latest
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

# Verify deployment
echo "✅ Verifying deployment..."
sleep 10
docker ps --filter "name=chitrasethu" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo "🎉 Deployment complete!"

