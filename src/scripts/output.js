import { writeFile } from 'fs/promises'
import { join } from 'path'

export function betterDiscord(baseDir, pkg, css) {
  return writeFile(
    join(baseDir, 'nordic.theme.css'),
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
 * Add '!important' non hsl discord colors, like 'primary-dark-200'
 */
:root {
}
.theme-dark {
}
.theme-light {
}`
  )
}

export function stylus(baseDir, pkg, css) {
  return writeFile(
    join(baseDir, 'nordic.user.css'),
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
   * Add '!important' non hsl discord colors, like 'primary-dark-200'
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

export function vencord(baseDir, pkg, css) {
  return writeFile(
    join(baseDir, 'nordic.vencord.css'),
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
 * Add '!important' non hsl discord colors, like 'primary-dark-200'
 */
:root {
}
.theme-dark {
}
.theme-light {
}`
  )
}
