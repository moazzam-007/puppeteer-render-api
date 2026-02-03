const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();

// Payload size limit badhaya taaki badi files handle ho sakein
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Render Puppeteer Service is Live!"));

app.post("/convert", async (req, res) => {
  const { html, width = 1080, height = 1080, type = "png" } = req.body;

  if (!html) {
    return res.status(400).send({ error: "HTML content is required" });
  }

  console.log("Request received. Launching browser...");
  let browser = null;

  try {
    // Browser launch settings (Crash fix ke sath)
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Memory leak rokne ke liye important
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

    // Image size set karein
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 1 
    });

    // HTML Content load karein (Timeout badhaya 15s tak)
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 15000 
    });

    // Screenshot lein
    const imageBuffer = await page.screenshot({ 
      type: type === "jpeg" ? "jpeg" : "png",
      fullPage: false,
      omitBackground: true
    });

    console.log("Image generated successfully.");
    
    // Safai: Browser band karein
    await page.close();
    await browser.close();
    browser = null;

    // Image wapas bhejein
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
