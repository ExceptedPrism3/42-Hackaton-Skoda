#!/bin/bash

# Script to add /skoda location to existing SSL VirtualHost

echo "🔧 Updating Apache SSL VirtualHost for /skoda"
echo "=============================================="
echo ""

# Find the SSL VirtualHost file
SSL_CONF=$(sudo grep -l "VirtualHost.*443" /etc/apache2/sites-enabled/*.conf | head -1)

if [ -z "$SSL_CONF" ]; then
    echo "❌ No SSL VirtualHost found in sites-enabled"
    echo "Please check your Apache configuration"
    exit 1
fi

echo "Found SSL VirtualHost: $SSL_CONF"
echo ""

# Check if /skoda location already exists
if sudo grep -q "Location /skoda" "$SSL_CONF"; then
    echo "⚠️  /skoda location already exists in $SSL_CONF"
    echo "Current configuration:"
    sudo grep -A 10 "Location /skoda" "$SSL_CONF"
    echo ""
    read -p "Do you want to update it? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
    # Remove old configuration
    sudo sed -i '/<Location \/skoda>/,/<\/Location>/d' "$SSL_CONF"
fi

# Create backup
BACKUP_FILE="${SSL_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp "$SSL_CONF" "$BACKUP_FILE"
echo "✅ Backup created: $BACKUP_FILE"
echo ""

# Find the closing </VirtualHost> tag and insert before it
echo "Adding /skoda location blocks to SSL VirtualHost..."
sudo sed -i '/<\/VirtualHost>/i\
    # Proxy to Skoda Next.js application\
    ProxyPreserveHost On\
    ProxyRequests Off\
\
    <Location /skoda>\
        ProxyPass http://localhost:3002/skoda\
        ProxyPassReverse http://localhost:3002/skoda\
        RequestHeader set X-Forwarded-Proto "https"\
        RequestHeader set X-Forwarded-Prefix "/skoda"\
    </Location>\
\
    <Location /skoda/_next>\
        ProxyPass http://localhost:3002/skoda/_next\
        ProxyPassReverse http://localhost:3002/skoda/_next\
    </Location>\
' "$SSL_CONF"

echo "✅ Configuration updated"
echo ""

# Test Apache configuration
echo "Testing Apache configuration..."
sudo apache2ctl configtest
echo ""

# Reload Apache
read -p "Reload Apache? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    sudo systemctl reload apache2
    echo "✅ Apache reloaded"
fi

echo ""
echo "✅ Done! Test with: curl -k https://89.168.52.201/skoda"

