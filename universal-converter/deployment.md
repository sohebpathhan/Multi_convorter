# Azure Deployment Guide

This guide deploys the full Universal Converter application on Azure.

The deployment uses:

- Frontend: Azure Storage Static Website
- Backend: Azure Ubuntu VM running Node.js directly
- Backend tools: FFmpeg, ImageMagick, LibreOffice, Pandoc
- Process manager: PM2
- Reverse proxy: Nginx

Docker is not required for this deployment.

## 1. Prerequisites

Install these on your local computer:

- Azure CLI
- Node.js is optional locally
- SSH client

Login to Azure:

```powershell
az login
```

Set your Azure subscription if you have more than one:

```powershell
az account list --output table
az account set --subscription "YOUR_SUBSCRIPTION_ID_OR_NAME"
```

Go to the project folder:

```powershell
cd C:\Users\surface\Documents\Codex\2026-06-09\create-a-fully-functional-web-application\outputs\universal-converter
```

## 2. Create Azure Variables

Storage account names must be globally unique and lowercase.

```powershell
$RG="rg-universal-converter"
$LOCATION="eastus"
$STORAGE="uniconverter$((Get-Random -Minimum 10000 -Maximum 99999))"
$VM="vm-universal-converter-api"
$ADMIN="azureuser"
```

Create the resource group:

```powershell
az group create --name $RG --location $LOCATION
```

## 3. Create The Backend VM

Create an Ubuntu VM:

```powershell
az vm create `
  --resource-group $RG `
  --name $VM `
  --image Ubuntu2204 `
  --size Standard_D2s_v5 `
  --admin-username $ADMIN `
  --generate-ssh-keys `
  --public-ip-sku Standard
```

Open HTTP and SSH ports:

```powershell
az vm open-port --resource-group $RG --name $VM --port 22
az vm open-port --resource-group $RG --name $VM --port 80
```

Get the VM public IP:

```powershell
$PUBLIC_IP=$(az vm show `
  --resource-group $RG `
  --name $VM `
  --show-details `
  --query publicIps `
  --output tsv)

$PUBLIC_IP
```

## 4. Install Backend Software On The VM

SSH into the VM:

```powershell
ssh $ADMIN@$PUBLIC_IP
```

Run these commands on the VM:

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git unzip nginx ffmpeg imagemagick libreoffice pandoc
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
node -v
npm -v
ffmpeg -version
```

Exit the VM:

```bash
exit
```

## 5. Upload Backend Code To The VM

From your local computer, run this from the `universal-converter` folder:

```powershell
scp -r .\backend "${ADMIN}@${PUBLIC_IP}:/home/${ADMIN}/universal-converter-backend"
```

SSH into the VM again:

```powershell
ssh $ADMIN@$PUBLIC_IP
```

Install backend dependencies:

```bash
cd /home/azureuser/universal-converter-backend
npm install
```

## 6. Start The Backend API With PM2

Run this on the VM:

```bash
cd /home/azureuser/universal-converter-backend
CORS_ORIGIN=* PORT=8080 MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save
pm2 startup
```

The `pm2 startup` command prints one more command. Copy that printed command and run it.

Test the backend locally on the VM:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"ok":true,"service":"universal-converter-api"}
```

## 7. Configure Nginx For The Backend

Create an Nginx config:

```bash
sudo nano /etc/nginx/sites-available/universal-converter-api
```

Paste this:

```nginx
server {
    listen 80;
    server_name _;

    client_max_body_size 1024M;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/universal-converter-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Exit the VM:

```bash
exit
```

Test the backend from your local computer:

```powershell
curl "http://$PUBLIC_IP/health"
```

Expected response:

```json
{"ok":true,"service":"universal-converter-api"}
```

Your backend API URL is:

```text
http://YOUR_VM_PUBLIC_IP
```

## 8. Configure The Frontend For Azure Backend

Edit `config.js` in the `universal-converter` folder:

```js
window.CONVERTER_API_URL = "http://YOUR_VM_PUBLIC_IP";
```

Use the actual public IP from `$PUBLIC_IP`.

Example:

```js
window.CONVERTER_API_URL = "http://20.10.30.40";
```

## 9. Create Azure Storage Static Website

Create a storage account:

```powershell
az storage account create `
  --name $STORAGE `
  --resource-group $RG `
  --location $LOCATION `
  --sku Standard_LRS `
  --kind StorageV2 `
  --allow-blob-public-access true
```

Enable static website hosting:

```powershell
$STORAGE_KEY=$(az storage account keys list `
  --account-name $STORAGE `
  --resource-group $RG `
  --query "[0].value" `
  --output tsv)

az storage blob service-properties update `
  --account-name $STORAGE `
  --account-key $STORAGE_KEY `
  --static-website `
  --index-document index.html `
  --404-document index.html
```

## 10. Upload Frontend Files

Upload only the frontend files to the `$web` container:

```powershell
az storage blob upload `
  --account-name $STORAGE `
  --container-name "`$web" `
  --name index.html `
  --file .\index.html `
  --overwrite `
  --account-key $STORAGE_KEY

az storage blob upload `
  --account-name $STORAGE `
  --container-name "`$web" `
  --name styles.css `
  --file .\styles.css `
  --overwrite `
  --account-key $STORAGE_KEY

az storage blob upload `
  --account-name $STORAGE `
  --container-name "`$web" `
  --name app.js `
  --file .\app.js `
  --overwrite `
  --account-key $STORAGE_KEY

az storage blob upload `
  --account-name $STORAGE `
  --container-name "`$web" `
  --name config.js `
  --file .\config.js `
  --overwrite `
  --account-key $STORAGE_KEY
```

Get the frontend website URL:

```powershell
$FRONTEND_URL=$(az storage account show `
  --name $STORAGE `
  --resource-group $RG `
  --query "primaryEndpoints.web" `
  --output tsv)

$FRONTEND_URL
```

Open `$FRONTEND_URL` in your browser.

## 11. Test The Full App

Test these in the browser:

1. Length conversion, such as meter to foot.
2. Color conversion, such as HEX to RGB.
3. File conversion with PNG to WebP. This should run in the browser.
4. File conversion with MP4 to MP3. This should call the Azure VM backend.
5. File conversion with DOCX to PDF. This should call the Azure VM backend.

## 12. Fix CORS For Production

During testing, the backend uses:

```bash
CORS_ORIGIN=*
```

For production, set it to your Azure frontend URL.

SSH into the VM:

```powershell
ssh $ADMIN@$PUBLIC_IP
```

Restart the PM2 process with your real frontend URL:

```bash
pm2 delete universal-converter-api
cd /home/azureuser/universal-converter-backend
CORS_ORIGIN=https://YOUR_STORAGE_STATIC_WEBSITE_URL PORT=8080 MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save
```

Use the exact URL from `$FRONTEND_URL`.

## 13. Add HTTPS

For testing, HTTP works.

For production, add HTTPS to both frontend and backend:

- Frontend: use Azure CDN or Azure Front Door with a custom domain.
- Backend: use a domain name pointed to the VM public IP, then install Certbot.

Backend HTTPS example after your domain points to the VM:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Then update `config.js`:

```js
window.CONVERTER_API_URL = "https://api.yourdomain.com";
```

Upload the updated `config.js` again:

```powershell
az storage blob upload `
  --account-name $STORAGE `
  --container-name "`$web" `
  --name config.js `
  --file .\config.js `
  --overwrite `
  --account-key $STORAGE_KEY
```

## 14. Useful Backend Commands

SSH into the VM:

```powershell
ssh $ADMIN@$PUBLIC_IP
```

View backend status:

```bash
pm2 status
```

View backend logs:

```bash
pm2 logs universal-converter-api
```

Restart backend:

```bash
pm2 restart universal-converter-api
```

Restart Nginx:

```bash
sudo systemctl restart nginx
```

Check Nginx config:

```bash
sudo nginx -t
```

## 15. Clean Up Azure Resources

When you no longer need the deployment:

```powershell
az group delete --name $RG --yes --no-wait
```

This deletes the VM, storage account, public IP, network resources, and all resources created in this guide.
