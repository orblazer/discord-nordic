/**
 * Variables
 */
const pkg = require('../package.json')

const discordHeader = `/**
 * @name        Nordic
 * @author      orblazer#9152
 * @version     ${pkg.version}
 * @description ${pkg.description}
 * @source      ${pkg.repository}
 * @donate      ${pkg.funding}
 * @authorId    179681974879911946
*/`

const stylusHeader = `/* ==UserStyle==
@name        Discord Nordic
@namespace   ${pkg.repository}
@homepageURL ${pkg.repository}
@version     ${pkg.version}
@license     CC BY-NC-SA 4.0
@description ${pkg.description}
@author      ${pkg.author}
@supportURL  ${pkg.bugs.url}
@updateURL   https://raw.githubusercontent.com/orblazer/discord-nordic/master/nordic.user.css
==/UserStyle== */`

const powercordManifest = {
  version: pkg.version,
  name: 'Nordic',
  description: pkg.description,
  author: 'orblazer#9152',
  license: 'CC BY-NC-SA 4.0',
  theme: 'nordic.theme.css'
}

const files = [
  '_variables.css',
  'components/badges-icon.css',
  'components/button.css',
  'components/form.css',
  'components/guild-messages.css',
  'components/other.css',
  'components/popout.css',
  'components/settings.css',
  'components/better-discord.css',
]

/**
 * CODE AREA
 * /!\ DON'T TOUCH ! /!\
 */

// Imports
const { lstatSync, readFileSync, writeFileSync } = require('fs')
const { resolve } = require('path')
const csso = require('csso')

const dev = typeof process.env.DEV === 'undefined' ? false : Boolean(process.env.DEV)

// Merge files
let content = ''
files.forEach((file) => {
  if (lstatSync(resolve(file)).isFile()) {
    content += readFileSync(file).toString()
  }
})

// Minify and optimize
const result = csso.minify(content).css

// Create better discord files
writeFileSync(resolve('base.css'), result)
writeFileSync(
  resolve('nordic.theme.css'),
  `${discordHeader}

/**
 * SOURCE CODE
 * /!\\ DON'T TOUCH ! /!\\
 */
${dev ? result : "@import url('https://orblazer.github.io/discord-nordic/base.css');"}

/**
 * CUSTOMIZATION
 */
:root {
}

.theme-dark {
}

.theme-light {
}`
)
// Create stylus file
writeFileSync(
  resolve('nordic.user.css'),
  `${stylusHeader}

/**
 * SOURCE CODE
 * /!\\ DON'T TOUCH ! /!\\
 */
@-moz-document domain("discord.com") {
  ${result}
}`
)
// Create powercord file
writeFileSync(resolve('powercord_manifest.json'), JSON.stringify(powercordManifest, null, 2))
