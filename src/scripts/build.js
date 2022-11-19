import { minify } from 'csso'
import { readFile } from 'fs/promises'
import { dirname, join, resolve } from 'path'
import sass from 'sass'
import { fileURLToPath } from 'url'
import { betterDiscord, powercord, stylus } from './output.js'

const __filename = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(__filename, '..')
const assetsDir = resolve(__filename, '../../assets')

const dev = typeof process.env.DEV === 'undefined' ? false : Boolean(process.env.DEV)

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
    betterDiscord([results[0].value, results[1].value].join('\n')),
    stylus(results[0].value),
    powercord(results[0].value),
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
        const file = await readFile(join(assetsDir, path), { encoding: 'base64' })
        return new sass.SassString(`data:image/svg+xml;base64,${file}`)
      },
    },
  })

  return dev ? result.css : minify(result.css).css
}
