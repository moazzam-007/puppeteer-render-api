# Official Puppeteer image use kar rahe hain (Best for Render)
FROM ghcr.io/puppeteer/puppeteer:19.7.2

# Root user permission ki zaroorat pad sakti hai
USER root

# App directory banate hain
WORKDIR /usr/src/app

# Dependencies file copy karein
COPY package*.json ./

# Dependencies install karein (production flag ke sath taaki devDependencies skip hon)
# --ignore-scripts zaroori hai taaki puppeteer fir se chrome download na karne lage
RUN npm ci --only=production --ignore-scripts

# Baaki code copy karein
COPY . .

# App non-root user (pptruser) ke sath chalayenge security ke liye
USER pptruser

# Port expose karein
EXPOSE 4000

# Server start command
CMD [ "node", "index.js" ]
