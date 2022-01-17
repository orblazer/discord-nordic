const { readFile, writeFile } = require('fs/promises')
const { resolve } = require('path')
const Utils = require('./utils')

const HASHES = {
  last: null,
  current: '532.0f664c4fa9f722e57200',
}
const files = [
  'components/badges-icon.css',
  'components/button.css',
  'components/form.css',
  'components/guild-messages.css',
  'components/other.css',
  'components/popout.css',
  'components/settings.css',
  'components/better-discord.css',
]

const srcDir = resolve(__dirname, '..', '..')
;(async () => {
  // Extract classes
  console.log('[extract] Extracting classes...')
  const oldClasses = HASHES.last !== null ? await Utils.extractFromHash(HASHES.last) : null
  const newClasses = await Utils.extractFromHash(HASHES.current)
  console.log('[extract] Extracted!')

  if (oldClasses === null) {
    console.log("CAN'T DIFF, NO OLD CSS!")
    return
  }

  // Diff classes
  console.log('[diff] Generating diff...')
  const diff = Utils.diff(oldClasses, newClasses)
  console.log('[diff] Generated!')

  const removedClasses = new Set()
  const changedClasses = new Map()

  await Promise.all(
    files.map(async (file) => {
      console.log(`[diff] Applying to ${file}...`)

      const filepath = resolve(srcDir, file)
      let content = await readFile(filepath, 'utf-8')
      const classes = Utils.extractFromString(content)

      // Applying diff
      let changed = false
      classes.forEach((className) => {
        // The class is removed
        if (diff.removed.includes(className)) {
          removedClasses.add(className)
        }
        // The class is renamed
        else if (diff.renamed.has(className)) {
          const newClass = diff.renamed.get(className)
          changedClasses.set(className, newClass)

          content = content.replace(new RegExp(`(.|keyframes )(${className})`, 'ig'), (_, prefix) => prefix + newClass)
          changed = true
        }
      })

      // Update the file
      if (changed) {
        await writeFile(filepath, content)
      }
    })
  )

  // Store Changes
  console.log('[change] Output changes...')
  const filepath = resolve(process.cwd(), 'changes.json')
  writeFile(
    filepath,
    JSON.stringify(
      {
        removed: removedClasses.values(),
        added: diff.added,
        renamed: mapToObj(changedClasses),
      },
      2
    )
  )
  console.log(`[change] Changes as been saved to ${filepath}`)
})()

function mapToObj(m) {
  return Array.from(m).reduce((obj, [key, value]) => {
    obj[key] = value
    return obj
  }, {})
}
