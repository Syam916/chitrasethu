# Manual Deployment Guide - Build and Push to ECR

This guide will help you build Docker images locally using Docker Desktop and push them to AWS ECR.

## Prerequisites

1. **Docker Desktop** installed and running
2. **AWS CLI** installed and configured
3. **ECR Repositories** already created:
   - `chitrasethu_backend`
   - `chitrasethu_frontend`

## Step 1: Configure AWS CLI (if not already done)

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region: `ap-south-1`
- Default output format: `json`

## Step 2: Login to AWS ECR

Open PowerShell or Command Prompt and run:

```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 002255676455.dkr.ecr.ap-south-1.amazonaws.com
```

You should see: `Login Succeeded`

## Step 3: Build and Push Backend Image

### 3.1 Navigate to Backend Directory

```bash
cd backend
```

### 3.2 Build the Docker Image

```bash
docker build -t chitrasethu_backend:latest .
```

This will:
- Download Node.js 18 Alpine base image
- Install dependencies
- Copy your backend code
- Create the image

**Expected output:** `Successfully built <image-id>`

### 3.3 Tag the Image for ECR

```bash
docker tag chitrasethu_backend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
```

### 3.4 Push to ECR

```bash
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
```

**Expected output:** You'll see layers being pushed. Wait for `latest: digest: sha256:...` message.

## Step 4: Build and Push Frontend Image

### 4.1 Navigate to Frontend Directory

```bash
cd ../frontend
```

### 4.2 Build the Docker Image

```bash
docker build -t chitrasethu_frontend:latest .
```

This will:
- Build your React/Vite application
- Create a production build
- Package it with nginx

**Expected output:** `Successfully built <image-id>`

### 4.3 Tag the Image for ECR

```bash
docker tag chitrasethu_frontend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
```

### 4.4 Push to ECR

```bash
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
```

**Expected output:** You'll see layers being pushed. Wait for `latest: digest: sha256:...` message.

## Step 5: Verify Images in ECR

### 5.1 Check Backend Image

```bash
aws ecr describe-images --repository-name chitrasethu_backend --region ap-south-1 --query 'imageDetails[*].imageTags[*]' --output table
```

### 5.2 Check Frontend Image

```bash
aws ecr describe-images --repository-name chitrasethu_frontend --region ap-south-1 --query 'imageDetails[*].imageTags[*]' --output table
```

You should see `latest` in both outputs.

## Step 6: Deploy Using GitHub Actions

Now that images are in ECR, trigger your GitHub Actions workflow:

1. Go to your GitHub repository
2. Click on **Actions** tab
3. Select **Deploy to AWS EC2** workflow
4. Click **Run workflow** button
5. Select branch (usually `main`)
6. Click **Run workflow**

The workflow will:
- Pull the images from ECR
- Deploy them on your EC2 instance
- Start the containers

## Troubleshooting

### Issue: "Login Succeeded" but push fails

**Solution:** Make sure your AWS credentials have ECR permissions:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`
- `ecr:PutImage`
- `ecr:InitiateLayerUpload`
- `ecr:UploadLayerPart`
- `ecr:CompleteLayerUpload`

### Issue: "Repository does not exist"

**Solution:** Create the repositories first:
```bash
aws ecr create-repository --repository-name chitrasethu_backend --region ap-south-1
aws ecr create-repository --repository-name chitrasethu_frontend --region ap-south-1
```

### Issue: Build fails with "npm ci" error

**Solution:** Make sure `package-lock.json` exists:
```bash
cd backend
npm install
cd ../frontend
npm install
```

### Issue: Frontend build fails

**Solution:** Check if you have all environment variables set. You might need to create a `.env.production` file in the frontend directory.

### Issue: Image too large

**Solution:** Check `.dockerignore` files are working. You can also use multi-stage builds (already included in frontend Dockerfile).

## Quick Reference Commands

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 002255676455.dkr.ecr.ap-south-1.amazonaws.com

# Build Backend
cd backend
docker build -t chitrasethu_backend:latest .
docker tag chitrasethu_backend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest

# Build Frontend
cd ../frontend
docker build -t chitrasethu_frontend:latest .
docker tag chitrasethu_frontend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest

# Verify
aws ecr describe-images --repository-name chitrasethu_backend --region ap-south-1
aws ecr describe-images --repository-name chitrasethu_frontend --region ap-south-1
```

## Next Steps

After pushing images:
1. ✅ Images are now in ECR
2. ✅ Run GitHub Actions workflow to deploy
3. ✅ Containers will be pulled and started on EC2
4. ✅ Your application will be live!

## Updating Images

When you make changes and want to update:

1. Rebuild images (same commands as above)
2. Push to ECR (same commands)
3. Run GitHub Actions workflow again
4. It will pull the latest images and restart containers


