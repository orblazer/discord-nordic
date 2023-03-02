import { minify } from 'csso'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import sass from 'sass'
import { fileURLToPath } from 'url'
import { betterDiscord, powercord, stylus, vencord } from './output.js'

const pkg = JSON.parse(await readFile(resolve('package.json')))

const __filename = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__filename, '..')
const rootDir = resolve(__filename, '../..')
const assetsDir = resolve(rootDir, 'assets')

const dev = typeof process.env.DEV === 'undefined' ? false : Boolean(process.env.DEV)
const baseAssetsUrl = `https://raw.githubusercontent.com/orblazer/discord-nordic/v${pkg.version}/assets`

await build(rootDir)

/**
 * Build theme files
 * @param {string} folder The folder of output
 */
async function build(folder) {
  // Compile sass files
  const results = await Promise.allSettled([
    compile('styles/_imports.scss'),
    compile('styles/web.scss'),
    compile('styles/plugins/better-discord/_imports.scss'),
    compile('styles/plugins/vencord/_imports.scss'),
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
      betterDiscord(folder, pkg, [results[0].value, results[2].value].join('\n')),
      stylus(folder, pkg, [results[0].value, results[1].value].join('\n')),
      powercord(folder, pkg, results[0].value),
      vencord(folder, pkg, [results[0].value, results[1].value, results[3].value].join('\n')),
    ])
  }
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
