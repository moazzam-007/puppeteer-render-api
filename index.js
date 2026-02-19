const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const PORT = process.env.PORT || 4000;

app.get("/", (req, res) => res.send("Render Puppeteer Service is Live (Custom Fonts Ready)! 🚀"));

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

    // --- ULTRA HD QUALITY ---
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 4  // 🔥 3 se 4 kiya — zyada sharp pixels
    });

    // Content Load — ab saari resources (fonts, images, CSS) load hongi pehle
    await page.setContent(html, { 
      waitUntil: "networkidle0",  // 🔥 domcontentloaded → networkidle0
      timeout: 30000              // 🔥 15s → 30s timeout badhaya
    });

    // Fonts aur rendering settle hone ke liye thoda extra wait
    await new Promise(resolve => setTimeout(resolve, 500));

    // Humne 'index.js' se font inject karne wala code hata diya hai.
    // Kyunki Dockerfile me 'fc-cache' chal chuka hai, 
    // Ab bas HTML me font-family: 'Scheherazade New'; likhne se kaam ho jayega.

    // 🔥 Screenshot with HIGH QUALITY settings
    const screenshotOptions = { 
      type: type === "jpeg" ? "jpeg" : "png",
      fullPage: false,
      omitBackground: true
    };

    // 🔥 JPEG ke liye quality 100 set karo (default 80 hota hai — 20% loss!)
    if (type === "jpeg") {
      screenshotOptions.quality = 100;
    }

    const imageBuffer = await page.screenshot(screenshotOptions);

    console.log("Image generated successfully.");
    
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
