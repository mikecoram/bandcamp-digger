import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import got from 'got/dist/source'
import parse from 'node-html-parser'
import pug from "pug"

const bandcampDomain = 'bandcamp.com'

type ReleaseInfo = {
  id: string
  href: string
  type: string
}

function ensureDirectoryExists(path: string) {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

async function main(): Promise<void> {
  const artistOrLabelName = process.argv[2]
  const subdomain = artistOrLabelName
  const cachePath = `./cache/${artistOrLabelName}.html`
  ensureDirectoryExists('cache')

  if (!existsSync(cachePath)) {
    writeFileSync(cachePath, (await got(`https://${subdomain}.${bandcampDomain}/music`)).body)
  }

  const page = parse(readFileSync(cachePath).toString())

  const releases: ReleaseInfo[] = page
    .querySelectorAll('[data-item-id]')
    .map<ReleaseInfo>(r => ({
      id: r.getAttribute('data-item-id')?.split('-')[1] ?? '',
      type: r.getAttribute('data-item-id')?.split('-')[0] ?? '',
      href: `https://${subdomain}.${bandcampDomain}${r.querySelector('a')?.getAttribute('href') ?? ''}`
    }))

  ensureDirectoryExists('out')
  writeFileSync(`out/${artistOrLabelName}.html`, pug.renderFile('templates/page.pug', { releases, artistOrLabel: { title: artistOrLabelName } }))
  console.log(`out/${artistOrLabelName}.html`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
