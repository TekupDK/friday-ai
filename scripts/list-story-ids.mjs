import { chromium } from 'playwright'

const run = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto('http://localhost:6006/', { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(1000)
  const ids = await page.evaluate(() => {
    const items = Array.from(document.querySelectorAll('[data-item-id]'))
    return items.map(el => el.getAttribute('data-item-id')).filter(Boolean)
  })
  console.log('Story IDs:')
  for (const id of ids) console.log(id)
  await browser.close()
}

run().catch((e) => { console.error(e); process.exit(1) })