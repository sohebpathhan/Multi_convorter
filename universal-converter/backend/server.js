import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import mime from "mime-types";

const app = express();
const port = Number(process.env.PORT || 8080);
const workRoot = process.env.WORK_ROOT || "/tmp/universal-converter";
const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 1024);
const upload = multer({
  dest: workRoot,
  limits: { fileSize: maxUploadMb * 1024 * 1024 }
});

const audioFormats = new Set(["mp3", "wav", "aac", "ogg", "flac", "m4a"]);
const videoFormats = new Set(["mp4", "webm", "mov", "mkv", "avi", "gif"]);
const imageFormats = new Set(["png", "jpeg", "jpg", "webp", "gif", "tiff", "bmp"]);
const documentFormats = new Set(["pdf", "docx", "html", "txt", "md", "odt", "rtf"]);

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true, service: "universal-converter-api" });
});

app.post("/convert", upload.single("file"), async (request, response, next) => {
  const tempDir = path.join(workRoot, crypto.randomUUID());
  try {
    if (!request.file) {
      response.status(400).send("Missing uploaded file.");
      return;
    }

    const targetFormat = normalizeFormat(request.body.targetFormat);
    if (!targetFormat) {
      response.status(400).send("Missing targetFormat.");
      return;
    }

    await fs.mkdir(tempDir, { recursive: true });
    const inputName = sanitizeFilename(request.file.originalname || "input.bin");
    const inputPath = path.join(tempDir, inputName);
    const outputName = `${path.parse(inputName).name}.${targetFormat}`;
    const outputPath = path.join(tempDir, outputName);
    await fs.rename(request.file.path, inputPath);

    await convertFile(inputPath, outputPath, targetFormat);

    response.setHeader("Content-Type", mime.lookup(outputPath) || "application/octet-stream");
    response.setHeader("Content-Disposition", `attachment; filename="${outputName}"`);
    response.sendFile(outputPath, async () => {
      await cleanup(tempDir);
    });
  } catch (error) {
    if (request.file?.path) await cleanup(request.file.path);
    await cleanup(tempDir);
    next(error);
  }
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).send(error.message || "Conversion failed.");
});

await fs.mkdir(workRoot, { recursive: true });
app.listen(port, () => {
  console.log(`Universal Converter API listening on ${port}`);
});

function normalizeFormat(format) {
  return String(format || "")
    .trim()
    .toLowerCase()
    .replace(/^\./, "");
}

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 160);
}

async function cleanup(targetPath) {
  try {
    await fs.rm(targetPath, { recursive: true, force: true });
  } catch {
    // Best-effort cleanup.
  }
}

async function convertFile(inputPath, outputPath, targetFormat) {
  const inputFormat = normalizeFormat(path.extname(inputPath));

  if (audioFormats.has(targetFormat) || videoFormats.has(targetFormat)) {
    await run("ffmpeg", ["-y", "-i", inputPath, outputPath], "FFmpeg conversion failed");
    return;
  }

  if (imageFormats.has(targetFormat)) {
    await run("magick", [inputPath, outputPath], "ImageMagick conversion failed");
    return;
  }

  if (documentFormats.has(targetFormat)) {
    if (["doc", "docx", "odt", "rtf", "ppt", "pptx", "xls", "xlsx"].includes(inputFormat)) {
      await run(
        "libreoffice",
        ["--headless", "--convert-to", targetFormat, "--outdir", path.dirname(outputPath), inputPath],
        "LibreOffice conversion failed"
      );
      const generated = await findGeneratedDocument(path.dirname(outputPath), targetFormat);
      await fs.rename(generated, outputPath);
      return;
    }

    await run("pandoc", [inputPath, "-o", outputPath], "Pandoc conversion failed");
    return;
  }

  throw new Error(`Unsupported target format: ${targetFormat}`);
}

async function findGeneratedDocument(directory, targetFormat) {
  const files = await fs.readdir(directory);
  const match = files.find((file) => file.toLowerCase().endsWith(`.${targetFormat}`));
  if (!match) throw new Error(`Converted .${targetFormat} file was not created.`);
  return path.join(directory, match);
}

function run(command, args, errorMessage) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    const stderr = [];

    child.stderr.on("data", (chunk) => stderr.push(chunk));
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${errorMessage}: ${Buffer.concat(stderr).toString("utf8").trim()}`));
      }
    });
  });
}
