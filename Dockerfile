# Official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission
USER root

# --- OPTIMIZED & SAFE FIX ---
# 1. Google ke saare list files delete kar rahe hain (google*.list)
# 2. Saare fonts ek saath install kar rahe hain (Fast)
# 3. Baad mein kachra saaf kar rahe hain (apt-get clean)
RUN rm -f /etc/apt/sources.list.d/google*.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wget \
       gnupg \
       fonts-kacst \
       fonts-freefont-ttf \
       fonts-thai-tlwg \
       fonts-noto-color-emoji \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /usr/src/app

# Files copy
COPY package*.json ./

# Safe install command use kar rahe hain
RUN npm install --omit=dev --ignore-scripts

# Baaki code copy
COPY . .

# Security user switch
USER pptruser

# Port expose
EXPOSE 4000

# Start command
CMD [ "node", "index.js" ]
