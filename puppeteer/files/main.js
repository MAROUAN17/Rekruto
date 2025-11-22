import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.use(express.json({ limit: "10mb" }));

let browser;

(async () => {
  browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
})();

app.post("/generate-pdf", async (req, res) => {
  const { html, title } = req.body;

  console.log("body -> ", req.body);
  if (!html) {
    return res.status(400).json({ error: "Missing HTML content" });
  }

  try {
    // const browser = await puppeteer.launch({
    //   headless: "new", // or true in older Puppeteer
    //   args: ["--no-sandbox", "--disable-setuid-sandbox"],
    // });

    const page = await browser.newPage();

    // Set your HTML
    await page.setContent(html, {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    await page.evaluateHandle("document.fonts.ready");
    await new Promise((r) => setTimeout(r, 1500));

    // Calculate dimensions AFTER fonts load
    const { height, width } = await page.evaluate(() => {
      const body = document.body;
      const html = document.documentElement;
      return {
        height: Math.max(body.scrollHeight, html.scrollHeight, body.offsetHeight, html.offsetHeight, body.clientHeight, html.clientHeight),
        width: Math.max(body.scrollWidth, html.scrollWidth, body.offsetWidth, html.offsetWidth),
      };
    });
    // console.log("heigth -> ", height);

    await page.setViewport({
      width: Math.ceil(width),
      height: Math.ceil(height), // Add more buffer
    });

    // Generate the PDF with proper height
    const pdfBuffer = await page.pdf({
      width: "8.27in",
      height: `${Math.ceil(height + 50)}px`,
      printBackground: true,
      margin: { top: 0, bottom: 0, left: 0, right: 0 },
      preferCSSPageSize: false, // Prevents CSS from overriding dimensions
    });

    await page.close();

    // Set headers so browser downloads the file
    if (!title) title = "Resume";
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename*=UTF-8''" + encodeURIComponent(title + ".pdf"),
    });
    res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate PDF" });
  }
});

process.on("exit", async () => {
  if (browser) await browser.close();
});

app.listen(3000, "0.0.0.0", () => console.log("Server running on http://0.0.0.0:3000"));
