const { chromium } = require('playwright');
(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const logs = [];
    page.on('console', msg => logs.push(`[CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[PAGE ERROR] ${err.message}`));
    
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(4000);
    
    console.log("--- BROWSER LOGS ---");
    logs.forEach(l => console.log(l));
    console.log("--------------------");

    // Also check if the red div is visible
    const content = await page.content();
    if (content.includes('HOME IS RENDERING')) {
         console.log('HOME DIV IS IN DOM');
    } else {
         console.log('HOME DIV NOT IN DOM');
    }
    
    await browser.close();
})();
