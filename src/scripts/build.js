import { minify } from 'csso'
import { constants } from 'fs'
import { access, readFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import * as sass from 'sass'
import { fileURLToPath } from 'url'
import { betterDiscord, replugged, stylus, vencord } from './output.js'

const pkg = JSON.parse(await readFile(resolve('package.json')))

const __filename = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__filename, '..')
const rootDir = resolve(__filename, '../..')
const assetsDir = resolve(rootDir, 'assets')
// const uniformDir = resolve(rootDir, 'uniform')

const dev =
  typeof process.env.DEV === 'undefined' ? false : Boolean(process.env.DEV)
const baseAssetsUrl = `https://raw.githubusercontent.com/orblazer/discord-nordic/v${pkg.version}/assets`

await build(rootDir)
// await build(uniformDir, true) // TODO: uniform is not updated

/**
 * Build theme files
 * @param {string} folder The folder of output
 * @param {boolean} uniform Is uniform variant ?
 */
async function build(folder, uniform = false) {
  // Compile sass files
  const results = await Promise.allSettled([
    compile('styles/_imports.scss', uniform),
    compile('styles/web.scss', uniform),
    compile('styles/plugins/better-discord/_imports.scss', uniform),
    compile('styles/plugins/vencord/_imports.scss', uniform),
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
      betterDiscord(
        folder,
        pkg,
        [results[0].value, results[2].value].join('\n')
      ),
      stylus(folder, pkg, [results[0].value, results[1].value].join('\n')),
      vencord(
        folder,
        pkg,
        [results[0].value, results[1].value, results[3].value].join('\n')
      ),
    ])

    // TODO: uniform variant is not supported
    if (!uniform) {
      await replugged(
        folder,
        pkg,
        [results[0].value, results[1].value].join('\n')
      )
    }
  }
}

/**
 * Compile SASS files
 * @param {string} entry Entry file
 * @param {boolean} uniform Is uniform variant ?
 */
async function compile(entry, uniform = false) {
  const result = await sass.compileAsync(join(srcDir, entry), {
    style: dev ? 'expanded' : 'compressed',
    functions: {
      'is_uniform()'() {
        return uniform ? sass.sassTrue : sass.sassFalse
      },
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
      async 'png($path)'([pathArg]) {
        const path = pathArg.assertString('path').text
        const localFilePath = join(assetsDir, path)

        // Use base64 for development
        if (dev) {
          const file = await readFile(localFilePath, { encoding: 'base64' })
          return new sass.SassString(`data:image/png;base64,${file}`)
        } else {
          await access(localFilePath, constants.F_OK)
        }

        return new sass.SassString(`${baseAssetsUrl}/${path}`)
      },
    },
  })

  return dev ? result.css : minify(result.css).css
}
