# Official Puppeteer image use kar rahe hain
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission (Zaroori hai fonts install karne ke liye)
USER root

# --- NEW CHANGE: Fonts Install Kar Rahe Hain ---
# fonts-kacst: Arabic/Urdu ke liye best
# fonts-freefont-ttf: Special symbols (ﷺ, ؓ) ke liye
# fonts-noto-color-emoji: Emojis ke liye
RUN apt-get update \
    && apt-get install -y wget gnupg \
    && apt-get install -y fonts-kacst fonts-freefont-ttf fonts-thai-tlwg fonts-noto-color-emoji \
    && rm -rf /var/lib/apt/lists/*

# App directory banate hain
WORKDIR /usr/src/app

# Dependencies file copy karein
COPY package*.json ./

# 'npm ci' ki jagah 'npm install' (Bina lock file ke liye safe)
RUN npm install --omit=dev --ignore-scripts

# Baaki code copy karein
COPY . .

# Security ke liye wapas puppeteer user par switch karein
USER pptruser

# Port expose karein
EXPOSE 4000

# Server start command
CMD [ "node", "index.js" ]
