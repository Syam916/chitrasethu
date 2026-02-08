#!/bin/bash

# Bash script to build and push Docker images to ECR
# Run this script from the project root directory

echo "========================================"
echo "Chitrasethu - Build and Push to ECR"
echo "========================================"
echo ""

# Configuration
AWS_REGION="ap-south-1"
AWS_ACCOUNT_ID="002255676455"
ECR_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Step 1: Login to ECR
echo "Step 1: Logging into AWS ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to login to ECR"
    exit 1
fi
echo "✓ Successfully logged into ECR"
echo ""

# Step 2: Build and Push Backend
echo "Step 2: Building Backend Image..."
cd backend
docker build -t chitrasethu_backend:latest .
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build backend image"
    cd ..
    exit 1
fi
echo "✓ Backend image built successfully"

echo "Tagging backend image..."
docker tag chitrasethu_backend:latest "$ECR_BASE/chitrasethu_backend:latest"

echo "Pushing backend image to ECR..."
docker push "$ECR_BASE/chitrasethu_backend:latest"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to push backend image"
    cd ..
    exit 1
fi
echo "✓ Backend image pushed successfully"
echo ""

# Step 3: Build and Push Frontend
cd ../frontend
echo "Step 3: Building Frontend Image..."
docker build -t chitrasethu_frontend:latest .
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to build frontend image"
    cd ..
    exit 1
fi
echo "✓ Frontend image built successfully"

echo "Tagging frontend image..."
docker tag chitrasethu_frontend:latest "$ECR_BASE/chitrasethu_frontend:latest"

echo "Pushing frontend image to ECR..."
docker push "$ECR_BASE/chitrasethu_frontend:latest"
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to push frontend image"
    cd ..
    exit 1
fi
echo "✓ Frontend image pushed successfully"
echo ""

# Step 4: Verify
cd ..
echo "Step 4: Verifying images in ECR..."
echo ""
echo "Backend repository images:"
aws ecr describe-images --repository-name chitrasethu_backend --region $AWS_REGION --query 'imageDetails[*].imageTags[*]' --output table
echo ""
echo "Frontend repository images:"
aws ecr describe-images --repository-name chitrasethu_frontend --region $AWS_REGION --query 'imageDetails[*].imageTags[*]' --output table
echo ""

echo "========================================"
echo "✓ All images built and pushed successfully!"
echo "========================================"
echo ""
echo "Next step: Run your GitHub Actions workflow to deploy"


