# Official Puppeteer image use kar rahe hain
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission (Zaroori hai fonts install karne ke liye)
USER root

# --- FIX: Google Chrome Source List Remove kar rahe hain ---
# Kyunki iski GPG key fail ho rahi hai aur humein sirf fonts chahiye.
RUN rm -f /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
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
