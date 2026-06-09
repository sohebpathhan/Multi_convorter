# Universal Converter

A web application for converting units, colors, number bases, text, browser-safe files, and API-backed media/document files.

## Features

- Length, weight, temperature, volume, area, speed, time, data, and sample currency conversions
- HEX, RGB, and HSL color conversion
- Binary, octal, decimal, and hexadecimal number conversion
- Text case, Base64, URL encoding, word count, character count, and byte count
- File conversion UI with local image/text conversion and API-backed media/document conversion
- Searchable converter list
- Conversion history stored in local storage
- Copy-to-clipboard actions
- Light and dark themes
- Responsive layout for desktop, tablet, and mobile

## Run Locally

Open `index.html` directly in a browser, or serve the folder with any static server:

```powershell
python -m http.server 8080
```

Then visit `http://localhost:8080`.

## File, Video, Audio, And Document Conversion

The frontend can convert browser-safe files locally:

- Images: PNG, JPEG, WebP
- Text: TXT, JSON, CSV, HTML, Markdown

Video, audio, office documents, PDFs, and broader file conversion need a backend because browsers do not include FFmpeg, LibreOffice, ImageMagick, or Pandoc by default.

After deploying the backend, set the API URL in `config.js`:

```js
window.CONVERTER_API_URL = "http://YOUR_EC2_PUBLIC_IP";
```

Use HTTPS and a domain before production launch.

## Full AWS Deployment Without Docker

This path uses:

- Frontend: S3 + CloudFront
- Backend: EC2 Ubuntu server running Node.js directly
- Conversion tools: FFmpeg, ImageMagick, LibreOffice, Pandoc
- Process manager: PM2
- Reverse proxy: Nginx

### Part 1: Create The EC2 Backend

1. Open AWS Console.
2. Go to EC2.
3. Click Launch Instance.
4. Name it `universal-converter-api`.
5. Choose Ubuntu Server 24.04 LTS or Ubuntu Server 22.04 LTS.
6. Choose instance type:
   - Minimum testing: `t3.medium`
   - Better for video conversion: `t3.large`
7. Create or choose a key pair.
8. In Network settings, allow:
   - SSH, port `22`, from your IP
   - HTTP, port `80`, from anywhere
   - HTTPS, port `443`, from anywhere if you will add SSL
9. Increase root storage to at least `30 GB`.
10. Launch the instance.

### Part 2: Connect To EC2

From your computer:

```powershell
ssh -i path\to\your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

### Part 3: Install Backend Dependencies On EC2

Run these commands on the EC2 server:

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

### Part 4: Upload The Backend Code To EC2

From your local machine, run this from the `universal-converter` folder:

```powershell
scp -i path\to\your-key.pem -r .\backend ubuntu@YOUR_EC2_PUBLIC_IP:/home/ubuntu/universal-converter-backend
```

Then SSH back into EC2:

```powershell
ssh -i path\to\your-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

Install backend Node dependencies:

```bash
cd /home/ubuntu/universal-converter-backend
npm install
```

### Part 5: Start The Backend With PM2

Run this on EC2:

```bash
cd /home/ubuntu/universal-converter-backend
CORS_ORIGIN=* PORT=8080 MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save
pm2 startup
```

The `pm2 startup` command prints one extra command. Copy that printed command and run it.

Test the API on EC2:

```bash
curl http://localhost:8080/health
```

Expected response:

```json
{"ok":true,"service":"universal-converter-api"}
```

### Part 6: Put Nginx In Front Of The Backend

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

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/universal-converter-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

Test from your local computer:

```powershell
curl http://YOUR_EC2_PUBLIC_IP/health
```

### Part 7: Configure The Frontend API URL

Edit `config.js` before uploading the frontend:

```js
window.CONVERTER_API_URL = "http://YOUR_EC2_PUBLIC_IP";
```

For production with a domain and SSL, use:

```js
window.CONVERTER_API_URL = "https://api.yourdomain.com";
```

### Part 8: Deploy The Frontend To S3

Create an S3 bucket:

```powershell
aws s3 mb s3://YOUR_UNIQUE_FRONTEND_BUCKET
```

Upload frontend files from the `universal-converter` folder:

```powershell
aws s3 sync . s3://YOUR_UNIQUE_FRONTEND_BUCKET --delete --exclude "backend/*" --exclude "README.md" --exclude "cloudformation.yml" --exclude "deploy-aws.ps1"
```

Enable static website hosting:

```powershell
aws s3 website s3://YOUR_UNIQUE_FRONTEND_BUCKET --index-document index.html
```

### Part 9: Create CloudFront For The Frontend

In AWS Console:

1. Go to CloudFront.
2. Click Create distribution.
3. Origin domain: choose your S3 bucket website endpoint or S3 bucket origin.
4. Viewer protocol policy: Redirect HTTP to HTTPS.
5. Default root object: `index.html`.
6. Create distribution.
7. Wait until status is Deployed.
8. Open the CloudFront domain.

### Part 10: Test The Whole App

Open the CloudFront URL and test:

1. Unit conversion, such as meters to feet.
2. File tab with a PNG to WebP conversion. This should work locally in the browser.
3. File tab with an MP4 to MP3 conversion. This should call the EC2 backend.
4. File tab with DOCX to PDF. This should call the EC2 backend.

### Part 11: Production Cleanup

Before real users use the app:

1. Put a domain on the backend, for example `api.yourdomain.com`.
2. Add HTTPS using Certbot or an AWS Load Balancer with ACM.
3. Change `CORS_ORIGIN=*` to your CloudFront domain.
4. Keep EC2 security group ports limited to `22`, `80`, and `443`.
5. Use a larger EC2 instance if conversions are slow.
6. Add S3-based upload/job storage if you want very large files.

## Simpler Frontend-Only Deploy Option

The simplest production setup is Amazon S3 static website hosting plus Amazon CloudFront.

1. Create an S3 bucket, for example `my-universal-converter`.
2. Upload all files from this folder to the bucket root.
3. Enable S3 static website hosting and set `index.html` as the index document.
4. Create a CloudFront distribution with the S3 bucket as the origin.
5. Set the default root object to `index.html`.
6. Optional: attach an ACM certificate and custom domain in Route 53.

AWS CLI example:

```powershell
aws s3 mb s3://my-universal-converter
aws s3 sync . s3://my-universal-converter --delete
aws s3 website s3://my-universal-converter --index-document index.html
```

For CloudFront, create the distribution in the AWS Console or adapt `cloudformation.yml`.

One-command CloudFormation + upload option for the static frontend:

```powershell
.\deploy-aws.ps1 -BucketName my-globally-unique-converter-bucket -Region us-east-1
```

## Recommended AWS Architecture

- Frontend: S3 + CloudFront
- Conversion API: EC2 running the Node backend directly
- Optional storage for large jobs: S3 upload bucket and SQS for asynchronous conversions
- Optional custom domain: Route 53 + ACM certificate

## Currency Note

The app includes editable sample currency rates so it works offline. For a live production currency converter, connect the currency category to an exchange-rate API and refresh rates on a schedule.
