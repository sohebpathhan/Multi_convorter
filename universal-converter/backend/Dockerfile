FROM node:20-bookworm

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ffmpeg \
    imagemagick \
    libreoffice \
    pandoc \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --omit=dev
COPY server.js ./

ENV PORT=8080
ENV MAX_UPLOAD_MB=1024
EXPOSE 8080

CMD ["npm", "start"]
