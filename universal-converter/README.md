# Universal Converter

A self-contained static web application for converting common units, colors, number bases, and text formats. It runs entirely in the browser and does not require a backend.

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

Video, audio, office documents, PDFs, and broader "any-to-any" file conversion need a backend because browsers do not include FFmpeg, LibreOffice, ImageMagick, or Pandoc by default. The `backend` folder contains a Dockerized conversion API for AWS App Runner or ECS Fargate.

After deploying the backend, set the API URL in `config.js`:

```js
window.CONVERTER_API_URL = "https://your-app-runner-url";
```

See `backend/README.md` for container deployment steps.

## Deploy Frontend On AWS

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

One-command CloudFormation + upload option:

```powershell
.\deploy-aws.ps1 -BucketName my-globally-unique-converter-bucket -Region us-east-1
```

## Recommended AWS Architecture

- Frontend: S3 + CloudFront
- Conversion API: App Runner or ECS Fargate from `backend/Dockerfile`
- Optional storage for large jobs: S3 upload bucket and SQS for asynchronous conversions
- Optional custom domain: Route 53 + ACM certificate

## Currency Note

The app includes editable sample currency rates so it works offline. For a live production currency converter, connect the currency category to an exchange-rate API and refresh rates on a schedule.
