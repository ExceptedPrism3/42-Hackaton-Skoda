#!/bin/bash

# Debug script for deployment issues

echo "🔍 Debugging S³ Deployment"
echo "=========================="
echo ""

echo "1. Checking if Next.js app is running on port 3002..."
curl -s http://localhost:3002/skoda | head -20 || echo "❌ App not responding on localhost:3002"
echo ""

echo "2. Checking PM2 status..."
pm2 status
echo ""

echo "3. Checking PM2 logs..."
pm2 logs skoda-web --lines 20 --nostream
echo ""

echo "4. Checking if port 3002 is listening..."
netstat -tlnp | grep 3002 || ss -tlnp | grep 3002
echo ""

echo "5. Checking Apache configuration..."
if [ -f /etc/apache2/sites-available/skoda.conf ]; then
    echo "✅ skoda.conf exists"
    cat /etc/apache2/sites-available/skoda.conf
else
    echo "❌ skoda.conf not found"
fi
echo ""

echo "6. Checking if skoda site is enabled..."
ls -la /etc/apache2/sites-enabled/ | grep skoda || echo "❌ Site not enabled"
echo ""

echo "7. Testing Apache configuration..."
sudo apache2ctl configtest
echo ""

echo "8. Checking Apache error logs..."
sudo tail -20 /var/log/apache2/error.log
echo ""

echo "9. Checking if Apache is running..."
sudo systemctl status apache2 --no-pager | head -10
echo ""

