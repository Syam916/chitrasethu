# Quick Start - Manual Deployment

## 🚀 Fastest Way (Using Scripts)

### Windows (PowerShell):
```powershell
.\build-and-push.ps1
```

### Linux/Mac (Bash):
```bash
chmod +x build-and-push.sh
./build-and-push.sh
```

## 📝 Manual Steps (If Scripts Don't Work)

### 1. Login to ECR
```bash
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 002255676455.dkr.ecr.ap-south-1.amazonaws.com
```

### 2. Build & Push Backend
```bash
cd backend
docker build -t chitrasethu_backend:latest .
docker tag chitrasethu_backend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:latest
cd ..
```

### 3. Build & Push Frontend
```bash
cd frontend
docker build -t chitrasethu_frontend:latest .
docker tag chitrasethu_frontend:latest 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
docker push 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend:latest
cd ..
```

### 4. Verify
```bash
aws ecr describe-images --repository-name chitrasethu_backend --region ap-south-1
aws ecr describe-images --repository-name chitrasethu_frontend --region ap-south-1
```

### 5. Deploy
- Go to GitHub → Actions → Run "Deploy to AWS EC2" workflow

## ✅ Checklist

- [ ] Docker Desktop is running
- [ ] AWS CLI is configured (`aws configure`)
- [ ] ECR repositories exist (backend & frontend)
- [ ] Images built and pushed successfully
- [ ] GitHub Actions workflow triggered

## 🆘 Common Issues

**"Repository does not exist"**
```bash
aws ecr create-repository --repository-name chitrasethu_backend --region ap-south-1
aws ecr create-repository --repository-name chitrasethu_frontend --region ap-south-1
```

**"Login failed"**
- Check AWS credentials: `aws configure list`
- Verify IAM permissions for ECR

**"Build failed"**
- Make sure you're in the correct directory
- Check if `package-lock.json` exists (run `npm install` first)


