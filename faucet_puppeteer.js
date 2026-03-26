import puppeteer from 'puppeteer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const address = process.env.X_LAYER_TESTNET_ADDRESS || '0x85591C776EFd42FD1FEb05AC386cE3F471ec84fF';

async function huntFaucet() {
  console.log(`Starting headless browser to hunt faucet for ${address}...`);
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  try {
    const page = await browser.newPage();
    console.log('Navigating to OKX X Layer Faucet...');
    // A test faucet URL, as the real one is often behind OKX login or captcha
    await page.goto('https://www.okx.com/xlayer/faucet', { waitUntil: 'networkidle2' });
    
    console.log('Attempting to input address...');
    // We would need the exact selector, assuming a generic input field for address
    const inputSelector = 'input[placeholder*="address" i]';
    await page.waitForSelector(inputSelector, { timeout: 5000 });
    await page.type(inputSelector, address);
    
    console.log('Attempting to click submit...');
    const btnSelector = 'button[type="submit"], button:has-text("Get"), button:has-text("Claim")';
    await page.waitForSelector(btnSelector, { timeout: 5000 });
    await page.click(btnSelector);
    
    // Wait for response or captcha
    await page.waitForTimeout(5000);
    console.log('Faucet request submitted. (Note: if CAPTCHA is present, headless claim will fail silently here).');

  } catch (error) {
    console.log('Faucet hunting encountered an error (likely CAPTCHA or Cloudflare protection):', error.message);
    console.log('Workaround: Fallback to alternative automated faucets or require an initial seed transaction from a bridge.');
  } finally {
    await browser.close();
  }
}

huntFaucet();