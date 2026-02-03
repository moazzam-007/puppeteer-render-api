const express = require("express");
const puppeteer = require("puppeteer");
require("dotenv").config();

const app = express();

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
    // UPDATED LAUNCH ARGUMENTS
    browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage", // Memory handling ke liye zaroori
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        // "--single-process",  <-- REMOVED: Ye crash karwa raha tha
        "--disable-extensions",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // Viewport set karte hain
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 1 
    });

    // Content Load strategy
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 15000 
    });

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
});        "--mute-audio",
      ],
      executablePath:
        process.env.NODE_ENV === "production"
          ? process.env.PUPPETEER_EXECUTABLE_PATH
          : puppeteer.executablePath(),
    });

    const page = await browser.newPage();

    // 2. Viewport Set
    await page.setViewport({ 
      width: parseInt(width), 
      height: parseInt(height),
      deviceScaleFactor: 1 // Free tier ke liye 1 rakha hai (RAM saves), Retina ke liye 2 karein agar crash na ho
    });

    // 3. Optimized Loading Strategy
    // 'domcontentloaded' fast hota hai, external images ke load hone ka infinite wait nahi karega
    await page.setContent(html, { 
      waitUntil: "domcontentloaded", 
      timeout: 10000 // Max 10 seconds wait karega
    });

    // 4. Screenshot
    const imageBuffer = await page.screenshot({ 
      type: type === "jpeg" ? "jpeg" : "png",
      fullPage: false,
      omitBackground: true
    });

    // 5. Cleanup (Memory Leak se bachne ke liye page pehle close karein)
    await page.close();
    await browser.close();
    browser = null; // Ensure nullification

    res.set("Content-Type", `image/${type === "jpeg" ? "jpeg" : "png"}`);
    res.send(imageBuffer);

  } catch (error) {
    console.error("Conversion Error:", error.message);
    if (browser) await browser.close();
    res.status(500).send({ error: "Failed", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
