import { chromium } from 'playwright'
import fs from 'node:fs'

const STORY_ID = process.argv[2] || 'apple-ui-applebadge--new'
const PORT = 6006

const sample = async (page) => {
  const styles = await page.evaluate(() => {
    const candidates = [
      "#storybook-root [class*='badge']",
      "#storybook-root [class*='Badge']",
      "#storybook-root span",
      "#storybook-root div",
      "#storybook-root button"
    ]
    let el = null
    for (const sel of candidates) {
      const found = document.querySelector(sel)
      if (found) { el = found; break }
    }
    if (!el) el = document.querySelector('#storybook-root') || document.body
    const s = window.getComputedStyle(el)
    return { bg: s.backgroundColor, color: s.color, border: s.borderColor, shadow: s.boxShadow, inline: { bg: el.style.backgroundColor || null, color: el.style.color || null, border: el.style.borderColor || null, shadow: el.style.boxShadow || null } }
  })
  return styles
}

const run = async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()
  await page.goto(`http://localhost:${PORT}/iframe.html?id=${STORY_ID}&viewMode=story`, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'light')
    document.querySelector('#storybook-root')?.setAttribute('data-theme', 'light')
  })
  await page.waitForTimeout(500)
  const light = await sample(page)
  await page.evaluate(() => {
    document.documentElement.setAttribute('data-theme', 'dark')
    document.querySelector('#storybook-root')?.setAttribute('data-theme', 'dark')
  })
  await page.waitForTimeout(500)
  const dark = await sample(page)
  const passed = JSON.stringify(light) !== JSON.stringify(dark)
  fs.mkdirSync('test-results/phase0-verification', { recursive: true })
  fs.writeFileSync(`test-results/phase0-verification/${STORY_ID.replace(/\W+/g, '_')}.json`, JSON.stringify({ light, dark, passed }, null, 2))
  console.log(`Story: ${STORY_ID} -> ${passed ? 'PASS' : 'FAIL'}`)
  await browser.close()
}

run().catch((e) => { console.error(e); process.exit(1) })

