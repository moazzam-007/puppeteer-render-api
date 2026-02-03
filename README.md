# Render Puppeteer API Deployment Guide

## Files Structure
```
Puppeteer for git/
├── Dockerfile        (Docker environment setup)
├── index.js          (Main server code)
├── package.json      (Dependencies)
└── .gitignore        (Git ignore file)
```

## Deployment Steps (Render.com)

### 1. GitHub Setup
1. Is folder ko GitHub par upload karo
2. New repository banao (Public ya Private dono chalega)
3. Saari files push karo

### 2. Render Setup
1. [Render.com](https://render.com) par jao aur login karo
2. **New** → **Web Service** par click karo
3. Apna GitHub repo connect karo

### 3. Configuration Settings
**Build & Deploy Settings:**
- **Name:** `my-puppeteer-api` (kuch bhi naam de sakte ho)
- **Runtime:** **Docker** (Ye zaroori hai!)
- **Region:** Frankfurt ya Oregon (free tier me available)
- **Branch:** main
- **Instance Type:** Free

### 4. Environment Variables (IMPORTANT!)
**Advanced** section me ye 3 variables add karo:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PUPPETEER_SKIP_CHROMIUM_DOWNLOAD` | `true` |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/google-chrome-stable` |

### 5. Deploy
**Create Web Service** button par click karo. Deployment 5-10 minutes lagegi.

---

## API Usage

### Base URL
Deployment ke baad tumhe URL milega jaise:
```
https://your-app-name.onrender.com
```

### Test Endpoint
```
GET https://your-app-name.onrender.com/
```
Response: "Optimized Render Puppeteer Service is Running!"

### Convert HTML to Image
**Endpoint:** `POST /convert`

**Request Body (JSON):**
```json
{
  "html": "<div style='background: linear-gradient(45deg, #667eea 0%, #764ba2 100%); color: white; height: 100%; display: flex; justify-content: center; align-items: center; font-family: Arial;'><h1>Hello from Telegram!</h1></div>",
  "width": 800,
  "height": 400,
  "type": "png"
}
```

**Parameters:**
- `html` (required): HTML/SVG content
- `width` (optional): Image width (default: 1080)
- `height` (optional): Image height (default: 1080)
- `type` (optional): "png" ya "jpeg" (default: "png")

**Response:** Binary image file

---

## Testing with cURL

Windows PowerShell me:
```powershell
$body = @{
    html = "<div style='background: black; color: white; height: 100%; display: flex; justify-content: center; align-items: center;'><h1>Test</h1></div>"
    width = 800
    height = 400
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://your-app-name.onrender.com/convert" -Method Post -Body $body -ContentType "application/json" -OutFile "output.png"
```

---

## n8n Integration Tips

### Cold Start Problem Solution
Free tier server 15 minutes baad sleep mode me chala jata hai. Pehli request me 40-50 second lag sakte hain.

**n8n HTTP Request Node Settings:**
1. **Settings** tab me jao
2. **On Error:** Continue
3. **Retry on Fail:** ON
4. **Max Tries:** 3
5. **Wait Between Tries:** 5000ms

Isse agar pehli baar timeout ho, to automatically retry karega.

---

## Troubleshooting

### Error: Out of Memory
Agar ye error aaye to:
1. `deviceScaleFactor: 1` ko kam se kam rakho (already set hai)
2. Image size kam karo (`width` aur `height`)
3. Agar fir bhi issue ho, to Browserless.io use karo (free tier available)

### Error: Timeout
- `timeout: 10000` value ko badhao (line 50 in index.js)
- Ya phir HTML me external resources (images, fonts) kam se kam use karo

### Deployment Failed
- Check karo ki **Runtime** me "Docker" selected hai, "Node" nahi
- Environment variables sahi se add kiye hain ya nahi verify karo

---

## Production Notes

1. **Free Tier Limitations:**
   - 512MB RAM (isliye code optimized hai)
   - 15 minute inactivity ke baad sleep
   - Cold start: 30-50 seconds

2. **Optimization Applied:**
   - Single process mode
   - GPU disabled
   - Fast loading strategy (domcontentloaded)
   - Proper memory cleanup

3. **Best Practices:**
   - Simple HTML/SVG use karo (complex animations avoid karo)
   - External fonts/images limit karo
   - Image size reasonable rakho (max 2000x2000)

---

## Support & Credits
Plan aur architecture based on production-tested Render + Puppeteer setup.
Optimized for free tier deployment.
