const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/api/timetable", async (req, res) => {
  const { studentId } = req.query;

  if (!studentId) return res.status(400).json({ error: "Missing studentId" });

  const publishURL = `https://timetables.tudublin.ie/reporting/textspreadsheet.aspx?parameters=student+set+${studentId}`;

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(publishURL);
    await page.waitForTimeout(3000); // wait for content

    const content = await page.evaluate(() => {
      return document.body.innerText;
    });

    await browser.close();

    // Simple parse: split by lines
    const timetable = content.split("\n").filter(line => line.trim().length > 0);

    res.json({ studentId, timetable });
  } catch (err) {
    console.error("Scraping error:", err);
    res.status(500).json({ error: "Failed to fetch timetable" });
  }
});

app.listen(5000, () => {
  console.log("📅 Timetable backend running at http://localhost:5000");
});
