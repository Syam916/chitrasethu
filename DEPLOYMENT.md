# Deployment Guide - Chitrasethu on AWS EC2

This guide explains how to deploy Chitrasethu frontend and backend Docker images from AWS ECR to an EC2 instance using GitHub Actions with a self-hosted runner.

## Prerequisites

1. **AWS EC2 Instance** with:
   - Docker installed
   - Docker Compose installed
   - Self-hosted GitHub Actions runner configured
   - Sufficient resources (recommended: t2.medium or larger)

2. **AWS ECR Repositories**:
   - `002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend`
   - `002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_frontend`

3. **GitHub Secrets** configured:
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`

## Setup Instructions

### 1. Configure Self-Hosted Runner on EC2

On your EC2 instance, install and configure the GitHub Actions runner:

```bash
# Create a directory for the runner
mkdir actions-runner && cd actions-runner

# Download the runner package (Linux x64)
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz

# Configure the runner (you'll get the token from GitHub repo settings)
./config.sh --url https://github.com/YOUR_USERNAME/YOUR_REPO --token YOUR_TOKEN

# Install as a service
sudo ./svc.sh install
sudo ./svc.sh start
```

### 2. Install Docker and Docker Compose on EC2

```bash
# Update system
sudo yum update -y

# Install Docker
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
```

### 3. Create Environment Files on EC2

Create the environment files that will be used by the containers:

```bash
# Create deployment directory
sudo mkdir -p /opt/chitrasethu
sudo chown ec2-user:ec2-user /opt/chitrasethu

# Create backend environment file
sudo nano /opt/chitrasethu/.env.backend
```

Add your backend environment variables:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_NAME=chitrasethu
DB_PORT=5432
JWT_SECRET=your-jwt-secret
FRONTEND_URL=https://your-domain.com
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

```bash
# Create frontend environment file
sudo nano /opt/chitrasethu/.env.frontend
```

Add your frontend environment variables:
```env
VITE_API_URL=https://api.your-domain.com
VITE_SOCKET_URL=wss://api.your-domain.com
# Add other frontend environment variables as needed
```

### 4. Configure GitHub Secrets

In your GitHub repository, go to **Settings > Secrets and variables > Actions** and add:

- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key

The IAM user/role should have permissions to:
- `ecr:GetAuthorizationToken`
- `ecr:BatchCheckLayerAvailability`
- `ecr:GetDownloadUrlForLayer`
- `ecr:BatchGetImage`

### 5. Configure AWS IAM Permissions

Create an IAM policy for ECR access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:GetAuthorizationToken",
        "ecr:BatchCheckLayerAvailability",
        "ecr:GetDownloadUrlForLayer",
        "ecr:BatchGetImage"
      ],
      "Resource": "*"
    }
  ]
}
```

Attach this policy to your IAM user or create a role for the EC2 instance.

### 6. Configure Security Groups

Ensure your EC2 security group allows:
- **Inbound HTTP (80)**: For frontend
- **Inbound HTTPS (443)**: For frontend (if using SSL)
- **Inbound Custom TCP (5000, 5001)**: For backend API (if needed externally)
- **Outbound HTTPS (443)**: For ECR access

### 7. Deploy

The workflow will automatically trigger on:
- Push to `main` branch
- Manual trigger via GitHub Actions UI

## Manual Deployment (Alternative)

If you prefer to deploy manually, you can use the `deploy.sh` script:

```bash
# Make the script executable
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

Or use docker-compose directly:

```bash
# Login to ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 002255676455.dkr.ecr.ap-south-1.amazonaws.com

# Pull latest images
docker-compose pull

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

## Verification

After deployment, verify the services are running:

```bash
# Check container status
docker ps

# Check backend logs
docker logs chitrasethu_backend

# Check frontend logs
docker logs chitrasethu_frontend

# Test backend health
curl http://localhost:5000/health

# Test frontend
curl http://localhost:80
```

## Troubleshooting

### Containers not starting
- Check logs: `docker logs chitrasethu_backend` or `docker logs chitrasethu_frontend`
- Verify environment files exist and have correct permissions
- Check if ports are already in use: `sudo netstat -tulpn | grep :80`

### ECR authentication issues
- Verify AWS credentials are correct
- Check IAM permissions for ECR access
- Ensure the region is correct (ap-south-1)

### Network connectivity issues
- Verify security group rules
- Check if containers can communicate: `docker network inspect chitrasethu-network`

### Self-hosted runner not picking up jobs
- Check runner status: `sudo ./svc.sh status`
- View runner logs: `cd actions-runner && ./run.sh` (for debugging)
- Verify runner is online in GitHub repository settings

## Updating Images

The workflow will pull the `latest` tag from ECR. To deploy a specific version:

1. Tag your images in ECR with a version number
2. Update the workflow to use the specific tag
3. Or modify the workflow to use git commit SHA as tag

## Rollback

To rollback to a previous version:

```bash
# Stop current containers
docker-compose down

# Pull previous image version
docker pull 002255676455.dkr.ecr.ap-south-1.amazonaws.com/chitrasethu_backend:previous-tag

# Update docker-compose.yml with previous tag
# Then restart
docker-compose up -d
```

## Monitoring

Consider setting up:
- CloudWatch logs for container logs
- Health check endpoints monitoring
- Application performance monitoring (APM)

## Security Best Practices

1. **Never commit environment files** - Use GitHub Secrets
2. **Use least privilege IAM policies** - Only grant necessary ECR permissions
3. **Keep Docker images updated** - Regularly update base images
4. **Use SSL/TLS** - Configure HTTPS for production
5. **Regular backups** - Backup your database regularly
6. **Monitor logs** - Set up log aggregation and monitoring


