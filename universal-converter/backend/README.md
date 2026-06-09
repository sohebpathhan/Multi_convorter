# Universal Converter API

This API powers heavy file conversion for the Universal Converter frontend. This README shows the non-Docker AWS EC2 setup.

## What It Handles

- Video and audio through FFmpeg: MP4, WebM, MOV, MKV, AVI, GIF, MP3, WAV, AAC, OGG, FLAC, M4A
- Images through ImageMagick: PNG, JPEG, WebP, GIF, TIFF, BMP
- Documents through LibreOffice and Pandoc: PDF, DOCX, HTML, TXT, Markdown, ODT, RTF

No service can honestly guarantee every proprietary format in existence, but this stack covers the practical universal-converter set and can be extended by installing more command-line converters on the server.

## Run Directly On EC2 Without Docker

Install dependencies on Ubuntu:

```bash
sudo apt update
sudo apt install -y curl nginx ffmpeg imagemagick libreoffice pandoc
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
```

Install app packages:

```bash
cd /home/ubuntu/universal-converter-backend
npm install
```

Start the API:

```bash
CORS_ORIGIN=* PORT=8080 MAX_UPLOAD_MB=1024 pm2 start server.js --name universal-converter-api
pm2 save
pm2 startup
```

Test:

```bash
curl http://localhost:8080/health
```

Set the frontend API endpoint in `config.js`:

```js
window.CONVERTER_API_URL = "http://YOUR_EC2_PUBLIC_IP";
```
