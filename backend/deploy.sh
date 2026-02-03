#!/bin/bash

# EcoTrack Backend Deployment Script
# Run this script on your Ubuntu Server
# Usage: sudo chmod +x deploy.sh && ./deploy.sh

set -e # Exit on error

APP_DIR="/home/ecotrack/ecotrack"
REPO_URL="https://github.com/FredyNotAvailable/EcoTrack-Proyecto.git" # ENTER YOUR REPOSITORY URL HERE IF CLONING, OR LEAVE EMPTY IF UPLOADING MANUALLY
NODE_VERSION="20"

echo "🚀 Starting EcoTrack Backend Deployment..."

# 1. Update System
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# 2. Install Dependencies
echo "🛠️ Installing dependencies (Node.js, FFmpeg, Nginx, Git)..."
# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
sudo apt install -y nodejs ffmpeg nginx git

# Install PM2 Global
echo "⚙️ Installing PM2..."
sudo npm install -g pm2

# 3. Setup Application Directory
echo "Bd️ Setting up application directory at $APP_DIR..."
# If you are pulling from git:
# sudo git clone $REPO_URL $APP_DIR
# If files are already there (uploaded via SCP), just ensure permissions:
if [ ! -d "$APP_DIR" ]; then
    echo "Creating directory $APP_DIR"
    sudo mkdir -p $APP_DIR
    echo "⚠️ Please upload your project files to $APP_DIR now if you haven't already!"
    # Ideally, you'd pause here or expect the user to have done it.
    # For this script, we assume user will run this inside the project folder they uploaded.
    APP_DIR=$(pwd)
    echo "Using current directory: $APP_DIR"
fi

# 3.1 Fetch Source Code if missing
if [ ! -f "package.json" ]; then
    echo "🔍 Sources not found. Cloning from Git..."
    git clone "$REPO_URL" temp_src
    
    echo "📂 Moving backend files to root..."
    # Copy backend content to current dir
    cp -r temp_src/backend/* .
    # Cleanup
    rm -rf temp_src
    echo "✅ Source code loaded."
fi

# 3.2 Check for .env
if [ ! -f ".env" ]; then
    echo "⚠️ .env file missing! Creating template..."
    cat <<EOF > .env
PORT=3001
NODE_ENV=production
SUPABASE_URL="REEMPLAZAR_CON_URL_REAL"
SUPABASE_SERVICE_ROLE_KEY="REEMPLAZAR_CON_Key_REAL"
EOF
    echo "⚠️ .env created. PLEASE EDIT IT with 'nano .env' before running again if needed."
fi

# 4. Install Project Dependencies & Build
echo "📦 Installing project dependencies..."
npm ci

echo "🏗️ Building project..."
npm run build

# 5. Configure PM2
echo "🚀 Starting application with PM2..."
# Check if process exists
if pm2 list | grep -q "ecotrack-backend"; then
    pm2 restart ecotrack-backend
else
    pm2 start dist/main.js --name ecotrack-backend
fi
pm2 save
# Note: User might need to run startup command manually as root if not handled

# 6. Configure Nginx
echo "Aq️ Configurando Nginx..."
# This assumes an 'ecotrack.nginx' file exists in the current directory.
# We will create a placeholder if it doesn't.
NGINX_CONF_PATH="/etc/nginx/sites-available/ecotrack"

if [ -f "ecotrack.nginx" ]; then
    echo "Found ecotrack.nginx configuration, copying..."
    sudo cp ecotrack.nginx $NGINX_CONF_PATH
else
    echo "⚠️ creating default Nginx config..."
    cat <<EOF | sudo tee $NGINX_CONF_PATH
server {
    listen 80;
    server_name _; # Accept all for now, change to domain later

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF
fi

# Enable Site
sudo ln -sf $NGINX_CONF_PATH /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl restart nginx

echo "✅ Deployment Complete!"
echo "🌍 Server should be accessible at http://<your-server-ip>"
