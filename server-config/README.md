# server-config

## Let's Encrypt

### Register a new account for a domain
Should only have to do this once per domain
```
sudo /opt/bitnami/letsencrypt/lego --path /opt/bitnami/letsencrypt --email="support@managedkube.com" --http --http-timeout 30 --http.webroot /opt/bitnami/apps/letsencrypt --domains=moss-chat.managedkube.com run
```

### Make symlink to the certs
```
sudo ln -s /opt/bitnami/letsencrypt/certificates/moss-chat.managedkube.com.crt /opt/bitnami/apache2/conf/moss-chat.managedkube.com.crt

sudo ln -s /opt/bitnami/letsencrypt/certificates/moss-chat.managedkube.com.key /opt/bitnami/apache2/conf/moss-chat.managedkube.com.key
```

## Apache2 configs

Dir: /opt/bitnami/apache2/conf

### Add vhost include
Add the include into this file: bitnami/bitnami-apps-vhosts.conf

```
Include "/opt/bitnami/apache2/conf/bitnami/moss-chat-vhost.conf"
```

### Add the vhost include file

File: bitnami/moss-chat-vhost.conf

```
# VirtualHost configuration for moss-chat.managedkube.com
# This proxies to a TypeScript web server application

# HTTP - Redirect to HTTPS
<VirtualHost *:80>
  ServerName moss-chat.managedkube.com
  
  # Support Let's Encrypt domain renewal
  <IfModule mod_proxy.c>
    ProxyPass /.well-known !
  </IfModule>
  
  # Redirect all HTTP to HTTPS
  RewriteEngine On
  RewriteCond %{HTTPS} !=on
  RewriteCond %{REQUEST_URI} !^/\.well-known
  RewriteRule ^/(.*) https://%{SERVER_NAME}/$1 [R=301,L]
</VirtualHost>

# HTTPS - Proxy to TypeScript app
<VirtualHost *:443>
  ServerName moss-chat.managedkube.com
  
  SSLEngine on
  # TODO: Update these paths after generating SSL certificate
  # Run: sudo /opt/bitnami/bncert-tool to generate Let's Encrypt cert
  # Or manually specify your certificate paths:
  SSLCertificateFile "/opt/bitnami/apache2/conf/moss-chat.managedkube.com.crt"
  SSLCertificateKeyFile "/opt/bitnami/apache2/conf/moss-chat.managedkube.com.key"
  
  # Support Let's Encrypt domain renewal
  <IfModule mod_proxy.c>
    ProxyPass /.well-known !
  </IfModule>
  
  # Proxy settings for TypeScript/Node.js app
  ProxyPreserveHost On
  ProxyRequests Off
  
  # WebSocket support (if needed)
  RewriteEngine On
  RewriteCond %{HTTP:Upgrade} =websocket [NC]
  RewriteRule /(.*) ws://127.0.0.1:3000/$1 [P,L]
  
  # Proxy all requests to the TypeScript app
  ProxyPass / http://127.0.0.1:3000/
  ProxyPassReverse / http://127.0.0.1:3000/
  
  # Error handling
  ErrorDocument 503 "Service temporarily unavailable. The application may be starting up."
</VirtualHost>
```
