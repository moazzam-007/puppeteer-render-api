const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 4000;

// Article tracking storage (in-memory)
// In production, you might want to use Redis or a database
let usedArticles = new Set();
let articleUsageLog = [];

app.get("/", (req, res) => res.send("Render Puppeteer Service is Live (Ultra HD)! 🚀"));

// Article tracking endpoints

// Check if an article has been used
app.get("/article/check/:url", (req, res) => {
  const articleUrl = decodeURIComponent(req.params.url);
  const isUsed = usedArticles.has(articleUrl);
  
  res.json({
    url: articleUrl,
    used: isUsed,
    totalUsedArticles: usedArticles.size
  });
});

// Mark an article as used
app.post("/article/mark-used", (req, res) => {
  const { url, title, timestamp } = req.body;
  
  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }
  
  const wasUsed = usedArticles.has(url);
  usedArticles.add(url);
  
  // Log the usage
  articleUsageLog.push({
    url,
    title: title || "Unknown",
    timestamp: timestamp || new Date().toISOString(),
    action: "marked_used"
  });
  
  res.json({
    success: true,
    url,
    wasAlreadyUsed: wasUsed,
    totalUsedArticles: usedArticles.size
  });
});

// Get all used articles
app.get("/article/used", (req, res) => {
  res.json({
    usedArticles: Array.from(usedArticles),
    count: usedArticles.size,
    log: articleUsageLog
  });
});

// Reset used articles (with optional confirmation)
app.post("/article/reset", (req, res) => {
  const { confirm } = req.body;
  
  if (confirm !== true) {
    return res.status(400).json({ 
      error: "Confirmation required",
      message: "Send {\"confirm\": true} to reset used articles"
    });
  }
  
  const previousCount = usedArticles.size;
  usedArticles.clear();
  
  articleUsageLog.push({
    action: "reset",
    timestamp: new Date().toISOString(),
    previousCount
  });
  
  res.json({
    success: true,
    message: "All used articles have been reset",
    previousCount
  });
});

// Batch check multiple articles
app.post("/article/batch-check", (req, res) => {
  const { urls } = req.body;
  
  if (!Array.isArray(urls)) {
    return res.status(400).json({ error: "URLs array is required" });
  }
  
  const results = urls.map(url => ({
    url,
    used: usedArticles.has(url)
  }));
  
  const unusedArticles = results.filter(r => !r.used).map(r => r.url);
  
  res.json({
    results,
    unusedArticles,
    unusedCount: unusedArticles.length,
    totalUsedArticles: usedArticles.size
  });
});

app.post("/convert", async (req, res) => {
  const { html, width = 1080, height = 1080, type = "png" } = req.body;

  if (!html) {
    return res.status(400).send({ error: "HTML content is required" });
  }

  console.log("Request received. Launching browser...");
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--disable-extensions"
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // --- QUALITY UPGRADE ---
    // deviceScaleFactor: 3 (Ultra Sharp Mobile Quality)
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 3 
    });

    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 15000 
    });

    const imageBuffer = await page.screenshot({ 
      type: type === "jpeg" ? "jpeg" : "png",
      fullPage: false,
      omitBackground: true
    });

    console.log("Ultra HD Image generated.");
    
    await page.close();
    await browser.close();
    browser = null;

    res.set("Content-Type", `image/${type === "jpeg" ? "jpeg" : "png"}`);
    res.send(imageBuffer);

  } catch (error) {
    console.error("Puppeteer Error:", error.message);
    if (browser) await browser.close();
    res.status(500).send({ error: "Failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
