#!/bin/bash

# S³ (Škoda Smart Stream) - Server Setup Script
# Run this script on your Ubuntu server to set up the application

set -e

echo "🚀 Setting up S³ (Škoda Smart Stream) on Ubuntu Server"
echo "=================================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root for certain commands
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Please don't run this script as root. It will ask for sudo when needed."
   exit 1
fi

# Step 1: Install system dependencies
echo -e "\n${YELLOW}Step 1: Installing system dependencies...${NC}"
sudo apt update

# Check Node.js version
NODE_VERSION=0
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    echo "Node.js $(node -v) is already installed"
fi

# Install Node.js 18+ if not already installed or if version is too old
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Installing Node.js 18..."
    # Remove conflicting npm package if it exists
    sudo apt remove -y npm 2>/dev/null || true
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    # Verify npm is available (comes bundled with nodejs from NodeSource)
    if ! command -v npm &> /dev/null; then
        echo "⚠️  npm not found, installing separately..."
        sudo apt install -y npm
    fi
else
    echo "Node.js version is sufficient (18+)"
    # Ensure npm is available
    if ! command -v npm &> /dev/null; then
        echo "Installing npm..."
        sudo apt install -y npm
    fi
fi

# Install other dependencies
sudo apt install -y python3 python3-pip python3-venv git

# Install PM2 globally
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    sudo npm install -g pm2
fi

# Install Apache modules
echo "Enabling Apache modules..."
sudo a2enmod proxy proxy_http rewrite headers
sudo systemctl restart apache2

# Step 2: Clone repository (if not already cloned)
if [ ! -d "web" ]; then
    echo -e "\n${YELLOW}Step 2: Cloning repository...${NC}"
    if [ -d ".git" ]; then
        echo "Repository already exists, pulling latest changes..."
        git pull
    else
        echo "Please clone the repository first:"
        echo "  git clone https://github.com/ExceptedPrism3/Skoda.git"
        echo "  cd Skoda"
        exit 1
    fi
else
    echo -e "\n${YELLOW}Step 2: Repository already cloned${NC}"
fi

# Step 3: Set up Python environment
echo -e "\n${YELLOW}Step 3: Setting up Python environment...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install --upgrade pip
pip install pandas transformers scikit-learn

# Step 4: Process data (if data folder exists)
if [ -d "data" ] && [ "$(ls -A data 2>/dev/null)" ]; then
    echo -e "\n${YELLOW}Step 4: Processing data...${NC}"
    python -m s3.ingest
    echo -e "${GREEN}✓ Data processed successfully${NC}"
else
    echo -e "\n${YELLOW}Step 4: Skipping data processing (data folder not found or empty)${NC}"
    echo "⚠️  Make sure to place your data files in the data/ folder and run:"
    echo "   source venv/bin/activate"
    echo "   python -m s3.ingest"
fi

# Step 5: Set up Next.js application
echo -e "\n${YELLOW}Step 5: Setting up Next.js application...${NC}"
cd web
npm install
cd ..

# Step 6: Build Next.js application
echo -e "\n${YELLOW}Step 6: Building Next.js application...${NC}"
cd web
NEXT_PUBLIC_BASE_PATH=/skoda npm run build
cd ..

# Step 7: Create PM2 ecosystem file
echo -e "\n${YELLOW}Step 7: Creating PM2 configuration...${NC}"
mkdir -p logs
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'skoda-web',
    script: 'npm',
    args: 'start',
    cwd: process.cwd() + '/web',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      NEXT_PUBLIC_BASE_PATH: '/skoda'
    },
    error_file: process.cwd() + '/logs/pm2-error.log',
    out_file: process.cwd() + '/logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true,
    max_memory_restart: '1G'
  }]
};
EOF

# Step 8: Create Apache configuration
echo -e "\n${YELLOW}Step 8: Creating Apache configuration...${NC}"
CURRENT_DIR=$(pwd)
sudo tee /etc/apache2/sites-available/skoda.conf > /dev/null << EOF
<VirtualHost *:80>
    ServerName 89.168.52.201
    
    # Proxy to Next.js application
    ProxyPreserveHost On
    ProxyRequests Off
    
    # Main application
    <Location /skoda>
        ProxyPass http://localhost:3000/skoda
        ProxyPassReverse http://localhost:3000/skoda
        ProxyPassReverse /
        
        # Headers for proper routing
        RequestHeader set X-Forwarded-Proto "http"
        RequestHeader set X-Forwarded-Prefix "/skoda"
    </Location>
    
    # Static assets
    <Location /skoda/_next>
        ProxyPass http://localhost:3000/skoda/_next
        ProxyPassReverse http://localhost:3000/skoda/_next
    </Location>
    
    # Error and access logs
    ErrorLog \${APACHE_LOG_DIR}/skoda_error.log
    CustomLog \${APACHE_LOG_DIR}/skoda_access.log combined
</VirtualHost>
EOF

# Enable the site
sudo a2ensite skoda.conf
sudo systemctl reload apache2

# Step 9: Start the application with PM2
echo -e "\n${YELLOW}Step 9: Starting application with PM2...${NC}"
pm2 start ecosystem.config.js
pm2 save

# Setup PM2 to start on boot
echo -e "\n${YELLOW}Setting up PM2 to start on boot...${NC}"
echo "Run the following command that PM2 will output:"
pm2 startup

echo -e "\n${GREEN}=================================================="
echo "✅ Setup complete!"
echo "==================================================${NC}"
echo ""
echo "Your application should now be accessible at:"
echo "  http://89.168.52.201/skoda"
echo ""
echo "Useful commands:"
echo "  pm2 status              - Check application status"
echo "  pm2 logs skoda-web      - View application logs"
echo "  pm2 restart skoda-web   - Restart the application"
echo "  pm2 stop skoda-web      - Stop the application"
echo ""
echo "Apache logs:"
echo "  sudo tail -f /var/log/apache2/skoda_error.log"
echo "  sudo tail -f /var/log/apache2/skoda_access.log"
echo ""

