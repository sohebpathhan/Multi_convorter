# Azure Deployment Guide

This guide deploys the full Universal Converter app on Azure without using your local machine for uploads.

You will use:

- Azure Portal UI to create resources
- Azure Cloud Shell in the browser to upload frontend files from GitHub
- Azure VM Run Command in the browser to install and start the backend
- GitHub repo: `https://github.com/sohebpathhan/Multi_convorter.git`

Deployment architecture:

- Frontend: Azure Storage Account Static Website
- Backend: Azure Ubuntu VM
- Backend runtime: Node.js + PM2 + Nginx
- Conversion tools: FFmpeg, ImageMagick, LibreOffice, Pandoc

Docker is not used.

## 1. Azure Portal Login

1. Open `https://portal.azure.com`.
2. Sign in to your Azure account.
3. Make sure you are in the correct subscription.

## 2. Create A Resource Group Using Azure UI

1. In Azure Portal, search for `Resource groups`.
2. Click `Create`.
3. Choose your subscription.
4. Resource group name:

```text
rg-universal-converter
```

5. Region:

```text
East US
```

6. Click `Review + create`.
7. Click `Create`.

## 3. Create Backend VM Using Azure UI

1. In Azure Portal, search for `Virtual machines`.
2. Click `Create`.
3. Click `Azure virtual machine`.
4. Fill the Basics tab:

```text
Subscription: your subscription
Resource group: rg-universal-converter
Virtual machine name: vm-universal-converter-api
Region: East US
Image: Ubuntu Server 22.04 LTS
Size: Standard_D2s_v5 or Standard_D4s_v5
Authentication type: SSH public key
Username: azureuser
SSH public key source: Generate new key pair
Key pair name: universal-converter-key
```

5. Click `Next: Disks`.
6. Set OS disk size to at least:

```text
64 GiB
```

7. Click `Next: Networking`.
8. Under inbound ports, allow:

```text
SSH 22
HTTP 80
```

9. Click `Review + create`.
10. Click `Create`.
11. Download the generated private key when Azure asks.
12. Wait for the VM deployment to finish.

Note: You are creating the VM from Azure UI. The backend code will be pulled directly from GitHub later.

## 4. Get The VM Public IP

1. Open the VM `vm-universal-converter-api`.
2. On the Overview page, copy `Public IP address`.
3. Save it as:

```text
YOUR_VM_PUBLIC_IP
```

Example:

```text
20.10.30.40
```

Your backend URL will be:

```text
http://YOUR_VM_PUBLIC_IP
```

## 5. Install Backend From GitHub Using Azure VM Run Command

This step does not use your local machine.

1. Open the VM in Azure Portal.
2. In the left menu, search or scroll to `Run command`.
3. Click `RunShellScript`.
4. Paste this script.
5. Replace nothing unless your GitHub repo URL changes.
6. Click `Run`.

```bash
#!/usr/bin/env bash
set -e

REPO_URL="https://github.com/sohebpathhan/Multi_convorter.git"
APP_PARENT="/opt/multi-converter"
APP_DIR="$APP_PARENT/app"
PORT="8080"

sudo apt update
sudo apt upgrade -y
sudo apt install -y curl git unzip nginx ffmpeg imagemagick libreoffice pandoc

if ! command -v node >/dev/null 2>&1; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt install -y nodejs
fi

sudo npm install -g pm2

sudo rm -rf "$APP_PARENT"
sudo mkdir -p "$APP_PARENT"
sudo git clone "$REPO_URL" "$APP_DIR"
sudo chown -R azureuser:azureuser "$APP_PARENT"

cd "$APP_DIR"
FRONTEND_DIR="$(find . -type f -name index.html -path '*universal-converter*' -print -quit | xargs dirname)"

if [ -z "$FRONTEND_DIR" ]; then
  FRONTEND_DIR="$(find . -maxdepth 3 -type f -name index.html -print -quit | xargs dirname)"
fi

if [ -z "$FRONTEND_DIR" ]; then
  echo "Could not find frontend index.html in repo."
  exit 1
fi

BACKEND_DIR="$FRONTEND_DIR/backend"

if [ ! -d "$BACKEND_DIR" ]; then
  echo "Could not find backend folder at $BACKEND_DIR."
  exit 1
fi

cd "$BACKEND_DIR"
npm install

pm2 delete universal-converter-api || true
CORS_ORIGIN=* PORT="$PORT" MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save

sudo tee /etc/nginx/sites-available/universal-converter-api >/dev/null <<'NGINX'
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
NGINX

sudo ln -sf /etc/nginx/sites-available/universal-converter-api /etc/nginx/sites-enabled/universal-converter-api
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

curl -f http://localhost:8080/health
echo "Backend installed successfully."
```

## 6. Test Backend In Browser

Open this URL in your browser:

```text
http://YOUR_VM_PUBLIC_IP/health
```

Expected response:

```json
{"ok":true,"service":"universal-converter-api"}
```

If it works, your backend is running.

## 7. Create Storage Account For Frontend Using Azure UI

1. In Azure Portal, search for `Storage accounts`.
2. Click `Create`.
3. Fill the Basics tab:

```text
Subscription: your subscription
Resource group: rg-universal-converter
Storage account name: multiconverter plus random numbers
Region: East US
Performance: Standard
Redundancy: Locally-redundant storage (LRS)
```

Example storage account name:

```text
multiconverter12345
```

4. Click `Review`.
5. Click `Create`.
6. Wait for deployment to finish.
7. Open the storage account.

## 8. Enable Static Website Using Azure UI

1. Open your storage account.
2. In the left menu, find `Data management`.
3. Click `Static website`.
4. Set `Static website` to `Enabled`.
5. Index document name:

```text
index.html
```

6. Error document path:

```text
index.html
```

7. Click `Save`.
8. Copy the `Primary endpoint`.

Example:

```text
https://multiconverter12345.z13.web.core.windows.net/
```

Save it as:

```text
YOUR_FRONTEND_URL
```

## 9. Upload Frontend From GitHub Using Azure Cloud Shell

This step also avoids your local machine.

1. In Azure Portal, click the Cloud Shell icon in the top bar.
2. Choose `Bash`.
3. If Azure asks to create Cloud Shell storage, click `Create storage`.
4. Run this command, replacing the values:

```bash
RESOURCE_GROUP="rg-universal-converter"
STORAGE_ACCOUNT="YOUR_STORAGE_ACCOUNT_NAME"
BACKEND_URL="http://YOUR_VM_PUBLIC_IP"
REPO_URL="https://github.com/sohebpathhan/Multi_convorter.git"
```

Clone the GitHub repo:

```bash
rm -rf ~/Multi_convorter
git clone "$REPO_URL" ~/Multi_convorter
cd ~/Multi_convorter
```

Find the frontend folder:

```bash
FRONTEND_DIR="$(find . -type f -name index.html -path '*universal-converter*' -print -quit | xargs dirname)"

if [ -z "$FRONTEND_DIR" ]; then
  FRONTEND_DIR="$(find . -maxdepth 3 -type f -name index.html -print -quit | xargs dirname)"
fi

echo "$FRONTEND_DIR"
```

Update `config.js` so the frontend calls your Azure VM backend:

```bash
cd "$FRONTEND_DIR"
printf 'window.CONVERTER_API_URL = "%s";\n' "$BACKEND_URL" > config.js
```

Get the storage key:

```bash
STORAGE_KEY="$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query '[0].value' \
  --output tsv)"
```

Upload frontend files to the `$web` container:

```bash
az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --destination '$web' \
  --source . \
  --overwrite \
  --exclude 'backend/*' '*.md' 'cloudformation.yml' 'deploy-aws.ps1'
```

Get the frontend URL:

```bash
az storage account show \
  --name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query "primaryEndpoints.web" \
  --output tsv
```

Open that URL in your browser.

## 10. Test The Full App

Open your Azure Storage Static Website URL.

Test:

1. Length conversion, such as meter to foot.
2. Color conversion, such as HEX to RGB.
3. File conversion with PNG to WebP. This runs locally in the browser.
4. File conversion with MP4 to MP3. This calls the Azure VM backend.
5. File conversion with DOCX to PDF. This calls the Azure VM backend.

## 11. Update Backend After Pushing New GitHub Code

When you push new backend code to GitHub:

1. Open Azure Portal.
2. Open VM `vm-universal-converter-api`.
3. Go to `Run command`.
4. Click `RunShellScript`.
5. Paste and run:

```bash
#!/usr/bin/env bash
set -e

APP_DIR="/opt/multi-converter/app"
cd "$APP_DIR"
sudo -u azureuser git pull

FRONTEND_DIR="$(find . -type f -name index.html -path '*universal-converter*' -print -quit | xargs dirname)"
BACKEND_DIR="$FRONTEND_DIR/backend"

cd "$BACKEND_DIR"
npm install
pm2 restart universal-converter-api
curl -f http://localhost:8080/health
echo "Backend updated."
```

## 12. Update Frontend After Pushing New GitHub Code

Use Azure Cloud Shell again:

```bash
RESOURCE_GROUP="rg-universal-converter"
STORAGE_ACCOUNT="YOUR_STORAGE_ACCOUNT_NAME"
BACKEND_URL="http://YOUR_VM_PUBLIC_IP"
REPO_URL="https://github.com/sohebpathhan/Multi_convorter.git"

rm -rf ~/Multi_convorter
git clone "$REPO_URL" ~/Multi_convorter
cd ~/Multi_convorter

FRONTEND_DIR="$(find . -type f -name index.html -path '*universal-converter*' -print -quit | xargs dirname)"

if [ -z "$FRONTEND_DIR" ]; then
  FRONTEND_DIR="$(find . -maxdepth 3 -type f -name index.html -print -quit | xargs dirname)"
fi

cd "$FRONTEND_DIR"
printf 'window.CONVERTER_API_URL = "%s";\n' "$BACKEND_URL" > config.js

STORAGE_KEY="$(az storage account keys list \
  --account-name "$STORAGE_ACCOUNT" \
  --resource-group "$RESOURCE_GROUP" \
  --query '[0].value' \
  --output tsv)"

az storage blob upload-batch \
  --account-name "$STORAGE_ACCOUNT" \
  --account-key "$STORAGE_KEY" \
  --destination '$web' \
  --source . \
  --overwrite \
  --exclude 'backend/*' '*.md' 'cloudformation.yml' 'deploy-aws.ps1'
```

Refresh the frontend URL in your browser.

## 13. Lock Down CORS After Testing

During testing, the backend runs with:

```bash
CORS_ORIGIN=*
```

After the frontend is deployed, change it to your Azure Static Website URL.

1. Open Azure Portal.
2. Open VM `vm-universal-converter-api`.
3. Go to `Run command`.
4. Click `RunShellScript`.
5. Paste this, replacing `YOUR_FRONTEND_URL`:

```bash
#!/usr/bin/env bash
set -e

FRONTEND_URL="https://YOUR_STORAGE_STATIC_WEBSITE_URL"
APP_DIR="/opt/multi-converter/app"
FRONTEND_DIR="$(find "$APP_DIR" -type f -name index.html -path '*universal-converter*' -print -quit | xargs dirname)"
BACKEND_DIR="$FRONTEND_DIR/backend"

pm2 delete universal-converter-api || true
cd "$BACKEND_DIR"
CORS_ORIGIN="$FRONTEND_URL" PORT=8080 MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save
curl -f http://localhost:8080/health
```

## 14. Add HTTPS Later

For testing, HTTP is enough.

For production:

- Frontend: use Azure Front Door or Azure CDN with a custom domain.
- Backend: point a domain such as `api.yourdomain.com` to the VM public IP and install Certbot on the VM.

Install Certbot on the VM using `Run command`:

```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

Then update frontend `config.js` through Cloud Shell:

```js
window.CONVERTER_API_URL = "https://api.yourdomain.com";
```

## 15. Useful Azure Portal Checks

Backend status:

1. Open the VM.
2. Go to `Run command`.
3. Run:

```bash
pm2 status
```

Backend logs:

```bash
pm2 logs universal-converter-api --lines 100
```

Nginx status:

```bash
sudo systemctl status nginx --no-pager
```

Health check:

```bash
curl http://localhost:8080/health
```

## 16. Clean Up Resources From Azure UI

When you are done:

1. Open Azure Portal.
2. Search for `Resource groups`.
3. Open `rg-universal-converter`.
4. Click `Delete resource group`.
5. Type the resource group name to confirm.
6. Click `Delete`.

This deletes the VM, public IP, network security group, storage account, and all related resources in that resource group.
