# Official Puppeteer image use kar rahe hain
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission
USER root

# App directory banate hain
WORKDIR /usr/src/app

# Dependencies file copy karein
COPY package*.json ./

# --- YAHAN CHANGE KIYA HAI ---
# 'npm ci' ki jagah 'npm install' use kar rahe hain taaki bina lock file ke error na aaye
RUN npm install --omit=dev --ignore-scripts

# Baaki code copy karein
COPY . .

# Security ke liye wapas puppeteer user par switch karein
USER pptruser

# Port expose karein
EXPOSE 4000

# Server start command
CMD [ "node", "index.js" ]
