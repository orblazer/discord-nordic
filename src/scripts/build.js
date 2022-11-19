import { minify } from 'csso'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import sass from 'sass'
import { fileURLToPath } from 'url'
import { betterDiscord, powercord, stylus } from './output.js'

const pkg = JSON.parse(await readFile(resolve('package.json')))

const __filename = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__filename, '..')
const assetsDir = resolve(__filename, '../../assets')

const dev = typeof process.env.DEV === 'undefined' ? false : Boolean(process.env.DEV)
const baseAssetsUrl = `https://raw.githubusercontent.com/orblazer/discord-nordic/v${pkg.version}/assets`

// Compile sass files
const results = await Promise.allSettled([
  compile('styles/_imports.scss'),
  compile('styles/plugins/better-discord/_imports.scss'),
])

// Check if error
let success = true
for (const result of results) {
  if (result.status === 'rejected') {
    console.error(result.reason)
    success = false
    break
  }
}

if (success) {
  await Promise.allSettled([
    betterDiscord(pkg, [results[0].value, results[1].value].join('\n')),
    stylus(pkg, results[0].value),
    powercord(pkg, results[0].value),
  ])
}

/**
 * Compile SASS files
 * @param {string} entry Entry file
 */
async function compile(entry) {
  const result = await sass.compileAsync(join(srcDir, entry), {
    style: dev ? 'expanded' : 'compressed',
    functions: {
      async 'svg($path)'([pathArg]) {
        const path = pathArg.assertString('path').text
        const localFilePath = join(assetsDir, path)

        // Use base64 for development
        if (dev) {
          const file = await readFile(localFilePath, { encoding: 'base64' })
          return new sass.SassString(`data:image/svg+xml;base64,${file}`)
        } else {
          await access(localFilePath, constants.F_OK)
        }

        return new sass.SassString(`${baseAssetsUrl}/${path}`)
      },
    },
  })

  return dev ? result.css : minify(result.css).css
}
