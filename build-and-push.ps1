# PowerShell script to build and push Docker images to ECR
# Run this script from the project root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Chitrasethu - Build and Push to ECR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$AWS_REGION = "ap-south-1"
$AWS_ACCOUNT_ID = "002255676455"
$ECR_BASE = "$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Step 1: Login to ECR
Write-Host "Step 1: Logging into AWS ECR..." -ForegroundColor Yellow
$loginResult = aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_BASE

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to login to ECR" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Successfully logged into ECR" -ForegroundColor Green
Write-Host ""

# Step 2: Build and Push Backend
Write-Host "Step 2: Building Backend Image..." -ForegroundColor Yellow
Set-Location backend
docker build -t chitrasethu_backend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build backend image" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Backend image built successfully" -ForegroundColor Green

Write-Host "Tagging backend image..." -ForegroundColor Yellow
docker tag chitrasethu_backend:latest "$ECR_BASE/chitrasethu_backend:latest"

Write-Host "Pushing backend image to ECR..." -ForegroundColor Yellow
docker push "$ECR_BASE/chitrasethu_backend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push backend image" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Backend image pushed successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Build and Push Frontend
Set-Location ..
Write-Host "Step 3: Building Frontend Image..." -ForegroundColor Yellow
Set-Location frontend
docker build -t chitrasethu_frontend:latest .
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to build frontend image" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Frontend image built successfully" -ForegroundColor Green

Write-Host "Tagging frontend image..." -ForegroundColor Yellow
docker tag chitrasethu_frontend:latest "$ECR_BASE/chitrasethu_frontend:latest"

Write-Host "Pushing frontend image to ECR..." -ForegroundColor Yellow
docker push "$ECR_BASE/chitrasethu_frontend:latest"
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Failed to push frontend image" -ForegroundColor Red
    Set-Location ..
    exit 1
}
Write-Host "✓ Frontend image pushed successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Verify
Set-Location ..
Write-Host "Step 4: Verifying images in ECR..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend repository images:" -ForegroundColor Cyan
aws ecr describe-images --repository-name chitrasethu_backend --region $AWS_REGION --query 'imageDetails[*].imageTags[*]' --output table
Write-Host ""
Write-Host "Frontend repository images:" -ForegroundColor Cyan
aws ecr describe-images --repository-name chitrasethu_frontend --region $AWS_REGION --query 'imageDetails[*].imageTags[*]' --output table
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✓ All images built and pushed successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next step: Run your GitHub Actions workflow to deploy" -ForegroundColor Yellow


