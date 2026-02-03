# Guía de Despliegue en Ubuntu - EcoTrack Frontend

Esta guía detalla los pasos para desplegar el frontend (React + Vite) en un servidor Ubuntu utilizando Nginx.

## 1. Requisitos Previos

Instala Node.js (v18 o superior) y Nginx en tu servidor Ubuntu:
```bash
sudo apt update
sudo apt install nodejs npm nginx -y
```

## 2. Preparación del Código

1. Sube los archivos a tu servidor (por ejemplo, a `/var/www/ecotrack`).
2. Entra al directorio del frontend:
   ```bash
   cd /var/www/ecotrack/frontend
   ```
3. Instala las dependencias:
   ```bash
   npm install
   ```
4. Genera el build de producción:
   ```bash
   npm run build
   ```
   Esto generará la carpeta `dist`.

## 3. Configuración de Nginx

1. Crea un archivo de configuración para tu sitio:
   ```bash
   sudo nano /etc/nginx/sites-available/ecotrack
   ```
2. Pega el siguiente contenido (ajusta `server_name` a tu IP o dominio):
   ```nginx
   server {
       listen 80;
       server_name 68.183.174.210; # Reemplaza con tu IP o dominio

       root /var/www/ecotrack/frontend/dist;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Proxy opcional para el backend (si el backend corre en el mismo servidor)
       location /api {
           proxy_pass http://localhost:3001/api;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Habilita el sitio y reinicia Nginx:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ecotrack /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## 4. Firewall y Permisos
- Permite el tráfico HTTP: `sudo ufw allow 80/tcp`
- Asegúrate de que Nginx pueda leer los archivos: `sudo chown -R www-data:www-data /var/www/ecotrack/frontend/dist`
