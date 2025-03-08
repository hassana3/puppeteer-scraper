const puppeteer = require('puppeteer');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/getProductPrice', async (req, res) => {
    try {
        const url = req.query.url;
        const originalPriceSelector = req.query.originalSelector;
        const discountedPriceSelector = req.query.discountedSelector;

        if (!url || !originalPriceSelector || !discountedPriceSelector) {
            return res.status(400).send("⚠️ لطفاً URL و دو کلاس قیمت را ارسال کنید.");
        }

        const browser = await puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });

        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        // پیدا کردن قیمت تخفیفی
        const discountedPrice = await page.evaluate((discountedPriceSelector) => {
            const priceElement = document.querySelector(discountedPriceSelector);
            return priceElement ? priceElement.innerText : null;
        }, discountedPriceSelector);

        let finalPrice;
        if (discountedPrice) {
            finalPrice = `💰 تخفیف‌خورده: ${discountedPrice}`;
        } else {
            const originalPrice = await page.evaluate((originalPriceSelector) => {
                const priceElement = document.querySelector(originalPriceSelector);
                return priceElement ? priceElement.innerText : "⚠️ قیمت پیدا نشد!";
            }, originalPriceSelector);
            finalPrice = `💲 قیمت اصلی: ${originalPrice}`;
        }

        await browser.close();
        res.status(200).send(finalPrice);
    } catch (error) {
        res.status(500).send("❌ خطا: " + error.message);
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
