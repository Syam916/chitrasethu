# How to Push Docker Images to AWS ECR

The deployment is failing because the Docker images don't exist in your ECR repositories yet. Follow these steps to build and push your images.

## Prerequisites

1. Docker installed on your local machine or CI/CD system
2. AWS CLI configured with appropriate credentials
3. ECR repositories already created:
   - `chitrasethu_backend`
   - `chitrasethu_frontend`

## Step 1: Login to ECR

```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 002255676455.dkr.ecr.ap-south-1.amazonaws.com
```

## Step 2: Build and Push Backend Image

```bash
# Navigate to backend directory
cd backend

# Build the Docker image (you need a Dockerfile in the backend directory)
docker build -t chitrasethu_backend:latest .

# Tag the image for ECR
docker tag chitrasethu_backend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest

# Push to ECR
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
```

## Step 3: Build and Push Frontend Image

```bash
# Navigate to frontend directory
cd ../frontend

# Build the Docker image (you need a Dockerfile in the frontend directory)
docker build -t chitrasethu_frontend:latest .

# Tag the image for ECR
docker tag chitrasethu_frontend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest

# Push to ECR
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
```

## Step 4: Verify Images in ECR

```bash
# List backend images
aws ecr describe-images --repository-name chitrasethu_backend --region ap-south-1

# List frontend images
aws ecr describe-images --repository-name chitrasethu_frontend --region ap-south-1
```

## Alternative: Using GitHub Actions to Build and Push

If you want to automate building and pushing images, you can create a separate workflow:

### Create `.github/workflows/build-and-push.yml`:

```yaml
name: Build and Push to ECR

on:
  push:
    branches: [ "main" ]
    paths:
      - 'backend/**'
      - 'frontend/**'
  workflow_dispatch:

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ap-south-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push backend
        env:
          ECR_REGISTRY: 002255676455.dkr.ecr.ap-south-1.amazonaws.com
          ECR_REPOSITORY: chitrasethu_backend
          IMAGE_TAG: latest
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./backend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG

      - name: Build and push frontend
        env:
          ECR_REGISTRY: 002255676455.dkr.ecr.ap-south-1.amazonaws.com
          ECR_REPOSITORY: chitrasethu_frontend
          IMAGE_TAG: latest
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG ./frontend
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
```

## Required Dockerfiles

You need to create Dockerfiles for both backend and frontend:

### `backend/Dockerfile` (Example):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000
EXPOSE 5001

CMD ["node", "src/server.js"]
```

### `frontend/Dockerfile` (Example):

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

## Quick Check: Do Images Already Exist?

Run this command to check what tags are available:

```bash
# Check backend
aws ecr describe-images --repository-name chitrasethu_backend --region ap-south-1 --query 'imageDetails[*].imageTags[*]' --output table

# Check frontend
aws ecr describe-images --repository-name chitrasethu_frontend --region ap-south-1 --query 'imageDetails[*].imageTags[*]' --output table
```

If images exist with different tags (not `latest`), you can either:
1. Tag them as `latest` in ECR
2. Update `docker-compose.yml` to use the existing tag

## Tag Existing Image as Latest

If you have images with other tags and want to tag them as `latest`:

```bash
# Get the image manifest for backend
MANIFEST=$(aws ecr batch-get-image --repository-name chitrasethu_backend --region ap-south-1 --image-ids imageTag=YOUR_EXISTING_TAG --query 'images[0].imageManifest' --output text)

# Put the image with latest tag
aws ecr put-image --repository-name chitrasethu_backend --region ap-south-1 --image-tag latest --image-manifest "$MANIFEST"
```

Repeat for frontend with the appropriate tag.


