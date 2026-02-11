# Official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission
USER root

# Existing packages (unchanged) + ADD: fontconfig
RUN rm -f /etc/apt/sources.list.d/google*.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wget \
       gnupg \
       fontconfig \              # NEW: for fc-cache
       fonts-kacst \
       fonts-freefont-ttf \
       fonts-thai-tlwg \
       fonts-noto-color-emoji \
       fonts-hosny-amiri \
       fonts-sil-scheherazade \
       fonts-liberation \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# App directory
WORKDIR /usr/src/app

# Dependencies copy
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev --ignore-scripts

# App source copy (includes your Fonts/ folder)
COPY . .

# NEW: Copy custom TTFs into system fonts and rebuild cache
# NOTE: Path is case-sensitive. Folder name must be exactly "Fonts"
RUN mkdir -p /usr/share/fonts/truetype/custom \
    && cp -v Fonts/*.ttf /usr/share/fonts/truetype/custom/ \
    && fc-cache -f -v

# Switch user
USER pptruser

# Port expose
EXPOSE 4000

# Start command
CMD [ "node", "index.js" ]
