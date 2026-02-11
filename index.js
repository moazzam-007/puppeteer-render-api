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
      deviceScaleFactor: 3 
    });

    // Content Load
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 15000 
    });

    // Humne 'index.js' se font inject karne wala code hata diya hai.
    // Kyunki Dockerfile me 'fc-cache' chal chuka hai, 
    // Ab bas HTML me font-family: 'Scheherazade New'; likhne se kaam ho jayega.

    const imageBuffer = await page.screenshot({ 
      type: type === "jpeg" ? "jpeg" : "png",
      fullPage: false,
      omitBackground: true
    });

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
