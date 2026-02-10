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
Response: "Render Puppeteer Service is Live (Ultra HD)! 🚀"

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

## Article Tracking API (NEW)

Ye endpoints workflow automation ke liye hain taake same article baar baar select na ho.

### Check if Article is Used
**Endpoint:** `GET /article/check/:url`

URL ko encode karna zaroori hai (encodeURIComponent use karo).

**Example:**
```bash
curl "https://your-app.onrender.com/article/check/https%3A%2F%2Fexample.com%2Farticle-1"
```

**Response:**
```json
{
  "url": "https://example.com/article-1",
  "used": true,
  "totalUsedArticles": 5
}
```

### Mark Article as Used
**Endpoint:** `POST /article/mark-used`

**Request Body:**
```json
{
  "url": "https://example.com/article-1",
  "title": "Article Title (optional)",
  "timestamp": "2026-02-10T12:00:00Z (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "url": "https://example.com/article-1",
  "wasAlreadyUsed": false,
  "totalUsedArticles": 6
}
```

### Get All Used Articles
**Endpoint:** `GET /article/used`

**Response:**
```json
{
  "usedArticles": [
    "https://example.com/article-1",
    "https://example.com/article-2"
  ],
  "count": 2,
  "log": [
    {
      "url": "https://example.com/article-1",
      "title": "Article Title",
      "timestamp": "2026-02-10T12:00:00Z",
      "action": "marked_used"
    }
  ]
}
```

### Batch Check Multiple Articles
**Endpoint:** `POST /article/batch-check`

Ye endpoint multiple articles ko ek saath check karta hai aur unused articles return karta hai.

**Request Body:**
```json
{
  "urls": [
    "https://example.com/article-1",
    "https://example.com/article-2",
    "https://example.com/article-3"
  ]
}
```

**Response:**
```json
{
  "results": [
    { "url": "https://example.com/article-1", "used": true },
    { "url": "https://example.com/article-2", "used": false },
    { "url": "https://example.com/article-3", "used": false }
  ],
  "unusedArticles": [
    "https://example.com/article-2",
    "https://example.com/article-3"
  ],
  "unusedCount": 2,
  "totalUsedArticles": 1
}
```

### Reset Used Articles
**Endpoint:** `POST /article/reset`

**Request Body:**
```json
{
  "confirm": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "All used articles have been reset",
  "previousCount": 10
}
```

**Note:** Reset sirf used articles ko clear karta hai, log audit ke liye preserve rehta hai.

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

### Workflow Integration (Duplicate Article Prevention)

Is article tracking API ko apne n8n workflow me integrate karne ke liye:

**Step 1: Get WordPress Posts**
```
WordPress node se posts fetch karo
```

**Step 2: Batch Check Articles**
```
HTTP Request node:
- Method: POST
- URL: https://your-app.onrender.com/article/batch-check
- Body:
  {
    "urls": {{ JSON.stringify($json.posts.map(p => p.link)) }}
  }
```

**Step 3: Select Random Unused Article**
```javascript
// Code node
const unusedArticles = $json.unusedArticles;
if (unusedArticles.length === 0) {
  throw new Error('No unused articles available');
}
const randomIndex = Math.floor(Math.random() * unusedArticles.length);
return [{ json: { selectedUrl: unusedArticles[randomIndex] } }];
```

**Step 4: Mark Article as Used**
```
HTTP Request node:
- Method: POST  
- URL: https://your-app.onrender.com/article/mark-used
- Body:
  {
    "url": "{{ $json.selectedUrl }}",
    "title": "{{ $json.title }}",
    "timestamp": "{{ new Date().toISOString() }}"
  }
```

**Step 5: Process Article**
```
Continue with content extraction and generation
```

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

1. **Article Tracking Storage:**
   - Default: In-memory storage (data lost on restart)
   - For production: Consider adding Redis or database persistence
   - Current implementation is suitable for development and testing

2. **Free Tier Limitations:**
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
