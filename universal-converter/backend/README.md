# Universal Converter API

This API powers heavy file conversion for the Universal Converter frontend. It is designed for AWS App Runner, ECS Fargate, or any Docker host.

## What It Handles

- Video and audio through FFmpeg: MP4, WebM, MOV, MKV, AVI, GIF, MP3, WAV, AAC, OGG, FLAC, M4A
- Images through ImageMagick: PNG, JPEG, WebP, GIF, TIFF, BMP
- Documents through LibreOffice and Pandoc: PDF, DOCX, HTML, TXT, Markdown, ODT, RTF

No service can honestly guarantee every proprietary format in existence, but this stack covers the practical universal-converter set and can be extended by adding tools to the Docker image.

## Local Run

```powershell
docker build -t universal-converter-api .
docker run --rm -p 8081:8080 universal-converter-api
```

Set the frontend API endpoint to:

```text
http://localhost:8081
```

## AWS App Runner

1. Push this `backend` folder as a container image to Amazon ECR.
2. Create an App Runner service from the ECR image.
3. Set environment variables:
   - `PORT=8080`
   - `MAX_UPLOAD_MB=1024`
   - `CORS_ORIGIN=https://your-cloudfront-domain`
4. Copy the App Runner service URL into `config.js`:

```js
window.CONVERTER_API_URL = "https://your-app-runner-url";
```

Then deploy the static frontend to S3 + CloudFront.
