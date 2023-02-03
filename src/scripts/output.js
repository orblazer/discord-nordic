import { writeFile } from 'fs/promises'
import { resolve } from 'path'

export function betterDiscord(pkg, css) {
  return writeFile(
    resolve('nordic.theme.css'),
    `/**
 * @name        Nordic
 * @author      orblazer#9152
 * @authorId    179681974879911946
 * @version     ${pkg.version}
 * @description ${pkg.description}
 * @source      ${pkg.repository}
 * @donate      ${pkg.funding}
 */
/**
 * SOURCE CODE
 * /!\\ DON'T TOUCH ! /!\\
 */
${css}

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
}

export function stylus(pkg, css) {
  return writeFile(
    resolve('nordic.user.css'),
    `/* ==UserStyle==
@name        Discord Nordic
@namespace   ${pkg.repository}
@homepageURL ${pkg.repository}
@version     ${pkg.version}
@license     CC BY-NC-SA 4.0
@description ${pkg.description}
@author      ${pkg.author}
@supportURL  ${pkg.bugs.url}
@updateURL   https://raw.githubusercontent.com/orblazer/discord-nordic/master/nordic.user.css
==/UserStyle== */

@-moz-document domain("discord.com") {
  /**
   * SOURCE CODE
   * /!\\ DON'T TOUCH ! /!\\
   */
  ${css}

  /**
   * CUSTOMIZATION
   */
  :root {
  }
  .theme-dark {
  }
  .theme-light {
  }
}`
  )
}

export async function powercord(pkg, css) {
  await writeFile(
    resolve('nordic.powercord.css'),
    `/**
 * @name        Nordic
 * @author      orblazer#9152
 * @version     ${pkg.version}
 * @description ${pkg.description}
 * @source      ${pkg.repository}
 * @donate      ${pkg.funding}
 */
/**
 * SOURCE CODE
 * /!\\ DON'T TOUCH ! /!\\
 */
${css}

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
  await writeFile(
    resolve('powercord_manifest.json'),
    JSON.stringify(
      {
        version: pkg.version,
        name: 'Nordic',
        description: pkg.description,
        author: 'orblazer#9152',
        license: 'CC BY-NC-SA 4.0',
        theme: 'nordic.powercord.css',
      },
      null,
      2
    )
  )
}

export function vencord(pkg, css) {
  return writeFile(
    resolve('nordic.vencord.css'),
    `/**
 * @name        Nordic
 * @author      orblazer#9152
 * @authorId    179681974879911946
 * @version     ${pkg.version}
 * @description ${pkg.description}
 * @source      ${pkg.repository}
 * @donate      ${pkg.funding}
 */
/**
 * SOURCE CODE
 * /!\\ DON'T TOUCH ! /!\\
 */
${css}

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
}
