# Official Puppeteer image
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission
USER root

# 1. System Packages & Font Config Install
RUN rm -f /etc/apt/sources.list.d/google*.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
       wget \
       gnupg \
       fontconfig \
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

# App source copy (Isme aapka 'Fonts' folder bhi copy ho jayega)
COPY . .

# 2. Custom Font Install (Magic Step ✨)
# TTF aur OTF dono fonts ko system me install karega
RUN mkdir -p /usr/share/fonts/truetype/custom \
    && mkdir -p /usr/share/fonts/opentype/custom \
    && cp -v Fonts/*.ttf /usr/share/fonts/truetype/custom/ 2>/dev/null || true \
    && cp -v Fonts/*.otf /usr/share/fonts/opentype/custom/ 2>/dev/null || true \
    && fc-cache -f -v

# Switch user
USER pptruser

# Port expose
EXPOSE 4000

# Start command
CMD [ "node", "index.js" ]
