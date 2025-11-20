#!/bin/bash

# Fix deployment issues

echo "🔧 Fixing S³ Deployment Issues"
echo "==============================="
echo ""

# Step 1: Check if port 3001 is available
echo "1. Checking if port 3001 is available..."
if lsof -ti:3001 > /dev/null 2>&1 || fuser 3001/tcp > /dev/null 2>&1; then
    echo "   ⚠️  Port 3001 is already in use, please free it first"
    exit 1
else
    echo "   ✓ Port 3001 is available"
fi
echo ""

# Step 2: Stop PM2 app
echo "2. Stopping PM2 app..."
pm2 stop skoda-web 2>/dev/null || true
pm2 delete skoda-web 2>/dev/null || true
echo "   ✓ PM2 app stopped"
echo ""

# Step 3: Create Apache configuration
echo "3. Creating Apache configuration..."
sudo tee /etc/apache2/sites-available/skoda.conf > /dev/null << 'EOF'
<VirtualHost *:80>
    ServerName 89.168.52.201
    
    ProxyPreserveHost On
    ProxyRequests Off
    
    <Location /skoda>
        ProxyPass http://localhost:3001/skoda
        ProxyPassReverse http://localhost:3001/skoda
        RequestHeader set X-Forwarded-Proto "http"
        RequestHeader set X-Forwarded-Prefix "/skoda"
    </Location>
    
    <Location /skoda/_next>
        ProxyPass http://localhost:3001/skoda/_next
        ProxyPassReverse http://localhost:3001/skoda/_next
    </Location>
</VirtualHost>

<VirtualHost *:443>
    ServerName 89.168.52.201
    
    # SSL configuration (add your existing SSL config here)
    # SSLEngine on
    # SSLCertificateFile /path/to/cert.pem
    # SSLCertificateKeyFile /path/to/key.pem
    
    ProxyPreserveHost On
    ProxyRequests Off
    
    <Location /skoda>
        ProxyPass http://localhost:3001/skoda
        ProxyPassReverse http://localhost:3001/skoda
        RequestHeader set X-Forwarded-Proto "https"
        RequestHeader set X-Forwarded-Prefix "/skoda"
    </Location>
    
    <Location /skoda/_next>
        ProxyPass http://localhost:3001/skoda/_next
        ProxyPassReverse http://localhost:3001/skoda/_next
    </Location>
</VirtualHost>
EOF
echo "   ✓ Apache configuration created"
echo ""

# Step 4: Enable the site
echo "4. Enabling Apache site..."
sudo a2ensite skoda.conf 2>/dev/null || true
echo "   ✓ Site enabled"
echo ""

# Step 5: Test Apache config
echo "5. Testing Apache configuration..."
sudo apache2ctl configtest
echo ""

# Step 6: Reload Apache
echo "6. Reloading Apache..."
sudo systemctl reload apache2
echo "   ✓ Apache reloaded"
echo ""

# Step 7: Start PM2 app
echo "7. Starting PM2 app..."
cd /var/www/skoda
pm2 start ecosystem.config.js
sleep 3
pm2 status
echo ""

# Step 8: Verify
echo "8. Verifying deployment..."
sleep 2
if curl -s http://localhost:3001/skoda | grep -q "Employee Skill Search\|S³\|Skoda"; then
    echo "   ✅ Next.js app is responding correctly!"
else
    echo "   ⚠️  App may not be responding correctly, check logs:"
    echo "      pm2 logs skoda-web"
fi
echo ""

echo "✅ Deployment fix complete!"
echo ""
echo "Next steps:"
echo "  1. If you have SSL certificates, edit /etc/apache2/sites-available/skoda.conf"
echo "     and uncomment the SSL lines in the <VirtualHost *:443> section"
echo "  2. Test the app at: http://89.168.52.201/skoda"
echo "  3. Check logs: pm2 logs skoda-web"

