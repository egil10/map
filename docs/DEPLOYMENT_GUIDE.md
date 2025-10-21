# GeoQuest Deployment Guide

## Overview

This guide provides comprehensive instructions for deploying the GeoQuest application across different environments, including development, staging, and production setups.

## Deployment Architecture

### System Requirements

#### Minimum Requirements
- **Server**: 2 CPU cores, 4GB RAM, 20GB storage
- **Node.js**: Version 16+ (for build tools)
- **Web Server**: Nginx or Apache
- **SSL Certificate**: Valid SSL certificate
- **Domain**: Registered domain name

#### Recommended Requirements
- **Server**: 4 CPU cores, 8GB RAM, 50GB SSD storage
- **CDN**: Content delivery network
- **Load Balancer**: For high availability
- **Monitoring**: Application performance monitoring

### Deployment Options

#### Static Hosting
- **GitHub Pages**: Free static hosting
- **Netlify**: Advanced static hosting with CI/CD
- **Vercel**: Serverless deployment platform
- **AWS S3**: Scalable object storage

#### Traditional Hosting
- **VPS**: Virtual private server
- **Dedicated Server**: Physical server
- **Cloud Hosting**: AWS, Google Cloud, Azure
- **Shared Hosting**: Cost-effective option

## Environment Setup

### 1. Development Environment

#### Local Development Setup
```bash
# Clone repository
git clone https://github.com/yourusername/geoquest.git
cd geoquest

# Install dependencies (if using build tools)
npm install

# Start development server
python -m http.server 8000
# or
npx serve .

# Access application
open http://localhost:8000
```

#### Development Configuration
```javascript
// config/development.js
const config = {
  environment: 'development',
  debug: true,
  apiUrl: 'http://localhost:8000',
  dataUrl: '/data/',
  enableLogging: true,
  enableSourceMaps: true
};
```

### 2. Staging Environment

#### Staging Setup
```bash
# Build application
npm run build

# Deploy to staging
rsync -avz dist/ user@staging-server:/var/www/geoquest-staging/

# Configure staging server
ssh user@staging-server
sudo systemctl reload nginx
```

#### Staging Configuration
```javascript
// config/staging.js
const config = {
  environment: 'staging',
  debug: false,
  apiUrl: 'https://staging.geoquest.com',
  dataUrl: '/data/',
  enableLogging: true,
  enableSourceMaps: false
};
```

### 3. Production Environment

#### Production Setup
```bash
# Build optimized application
npm run build:production

# Deploy to production
rsync -avz dist/ user@production-server:/var/www/geoquest/

# Configure production server
ssh user@production-server
sudo systemctl reload nginx
sudo systemctl restart geoquest
```

#### Production Configuration
```javascript
// config/production.js
const config = {
  environment: 'production',
  debug: false,
  apiUrl: 'https://geoquest.com',
  dataUrl: '/data/',
  enableLogging: false,
  enableSourceMaps: false,
  enableCompression: true,
  enableCaching: true
};
```

## Web Server Configuration

### 1. Nginx Configuration

#### Basic Nginx Setup
```nginx
server {
    listen 80;
    server_name geoquest.com www.geoquest.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name geoquest.com www.geoquest.com;
    
    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection "1; mode=block";
    
    # Root directory
    root /var/www/geoquest;
    index index.html;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Static file caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Main application
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API endpoints (if applicable)
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### Advanced Nginx Configuration
```nginx
# Rate limiting
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=static:10m rate=50r/s;

server {
    # Rate limiting
    limit_req zone=api burst=20 nodelay;
    
    # Security headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';";
    
    # CORS headers
    add_header Access-Control-Allow-Origin "https://geoquest.com";
    add_header Access-Control-Allow-Methods "GET, POST, OPTIONS";
    add_header Access-Control-Allow-Headers "Content-Type, Authorization";
    
    # Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;
}
```

### 2. Apache Configuration

#### Apache Virtual Host
```apache
<VirtualHost *:80>
    ServerName geoquest.com
    ServerAlias www.geoquest.com
    DocumentRoot /var/www/geoquest
    
    # Redirect to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>

<VirtualHost *:443>
    ServerName geoquest.com
    ServerAlias www.geoquest.com
    DocumentRoot /var/www/geoquest
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security Headers
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    
    # Gzip compression
    LoadModule deflate_module modules/mod_deflate.so
    <Location />
        SetOutputFilter DEFLATE
        SetEnvIfNoCase Request_URI \
            \.(?:gif|jpe?g|png)$ no-gzip dont-vary
        SetEnvIfNoCase Request_URI \
            \.(?:exe|t?gz|zip|bz2|sit|rar)$ no-gzip dont-vary
    </Location>
    
    # Caching
    <LocationMatch "\.(css|js|png|jpg|jpeg|gif|ico|svg)$">
        ExpiresActive On
        ExpiresDefault "access plus 1 year"
        Header append Cache-Control "public, immutable"
    </LocationMatch>
</VirtualHost>
```

## CI/CD Pipeline

### 1. GitHub Actions

#### Workflow Configuration
```yaml
# .github/workflows/deploy.yml
name: Deploy GeoQuest

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Run linting
        run: npm run lint

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: build-files
          path: dist/

  deploy-staging:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
          
      - name: Deploy to staging
        run: |
          rsync -avz dist/ ${{ secrets.STAGING_HOST }}:/var/www/geoquest-staging/
          ssh ${{ secrets.STAGING_HOST }} "sudo systemctl reload nginx"

  deploy-production:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: build-files
          path: dist/
          
      - name: Deploy to production
        run: |
          rsync -avz dist/ ${{ secrets.PRODUCTION_HOST }}:/var/www/geoquest/
          ssh ${{ secrets.PRODUCTION_HOST }} "sudo systemctl reload nginx"
```

### 2. Docker Deployment

#### Dockerfile
```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'

services:
  geoquest:
    build: .
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
```

## Cloud Deployment

### 1. AWS Deployment

#### S3 Static Website
```bash
# Create S3 bucket
aws s3 mb s3://geoquest-app

# Upload files
aws s3 sync dist/ s3://geoquest-app --delete

# Configure static website
aws s3 website s3://geoquest-app --index-document index.html --error-document 404.html

# Set bucket policy
aws s3api put-bucket-policy --bucket geoquest-app --policy file://bucket-policy.json
```

#### CloudFront CDN
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::geoquest-app/*"
    }
  ]
}
```

### 2. Google Cloud Deployment

#### Cloud Storage
```bash
# Create bucket
gsutil mb gs://geoquest-app

# Upload files
gsutil -m cp -r dist/* gs://geoquest-app/

# Make bucket public
gsutil iam ch allUsers:objectViewer gs://geoquest-app

# Configure website
gsutil web set -m index.html -e 404.html gs://geoquest-app
```

### 3. Azure Deployment

#### Static Web App
```bash
# Install Azure CLI
npm install -g @azure/static-web-apps-cli

# Deploy to Azure
swa deploy dist --deployment-token $AZURE_TOKEN
```

## Monitoring and Logging

### 1. Application Monitoring

#### Performance Monitoring
```javascript
// monitoring.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.startMonitoring();
  }
  
  startMonitoring() {
    // Monitor Core Web Vitals
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
  }
  
  observeLCP() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.set('LCP', lastEntry.startTime);
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }
  
  reportMetrics() {
    const metrics = Object.fromEntries(this.metrics);
    fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metrics)
    });
  }
}
```

### 2. Error Tracking

#### Error Monitoring
```javascript
// error-tracking.js
class ErrorTracker {
  constructor() {
    this.setupErrorHandling();
  }
  
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack
      });
    });
  }
  
  trackError(error) {
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...error,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href
      })
    });
  }
}
```

## Security Configuration

### 1. SSL/TLS Setup

#### Let's Encrypt SSL
```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d geoquest.com -d www.geoquest.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 2. Security Headers

#### Security Configuration
```nginx
# Security headers
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self';" always;
```

## Backup and Recovery

### 1. Backup Strategy

#### Automated Backups
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/geoquest"
APP_DIR="/var/www/geoquest"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/geoquest_$DATE.tar.gz $APP_DIR

# Keep only last 7 days of backups
find $BACKUP_DIR -name "geoquest_*.tar.gz" -mtime +7 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/geoquest_$DATE.tar.gz s3://backup-bucket/
```

#### Cron Job
```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

### 2. Recovery Procedures

#### Disaster Recovery
```bash
#!/bin/bash
# recovery.sh

BACKUP_FILE=$1
APP_DIR="/var/www/geoquest"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Stop services
sudo systemctl stop nginx

# Restore files
tar -xzf $BACKUP_FILE -C /

# Restart services
sudo systemctl start nginx

echo "Recovery completed"
```

## Maintenance Procedures

### 1. Regular Maintenance

#### Update Procedures
```bash
#!/bin/bash
# update.sh

# Pull latest changes
git pull origin main

# Install dependencies
npm ci

# Build application
npm run build

# Deploy
rsync -avz dist/ /var/www/geoquest/

# Reload services
sudo systemctl reload nginx

echo "Update completed"
```

### 2. Health Checks

#### Health Check Script
```bash
#!/bin/bash
# health-check.sh

URL="https://geoquest.com"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" $URL)

if [ $STATUS -eq 200 ]; then
    echo "Application is healthy"
    exit 0
else
    echo "Application is unhealthy (HTTP $STATUS)"
    exit 1
fi
```

## Troubleshooting

### 1. Common Issues

#### SSL Certificate Issues
```bash
# Check certificate
openssl x509 -in /path/to/certificate.crt -text -noout

# Test SSL
openssl s_client -connect geoquest.com:443 -servername geoquest.com
```

#### Performance Issues
```bash
# Check server resources
htop
df -h
free -h

# Check nginx status
sudo systemctl status nginx
sudo nginx -t
```

### 2. Log Analysis

#### Log Monitoring
```bash
# Nginx access logs
tail -f /var/log/nginx/access.log

# Nginx error logs
tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

---

This deployment guide provides comprehensive instructions for deploying the GeoQuest application across different environments, ensuring reliable, secure, and scalable deployment.
