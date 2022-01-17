const { get: httpGet } = require('https')

const classRegex = /(?:\.|keyframes )([a-z][a-z0-9-_]+)[{,:]/gim

/**
 * @typedef {object} DiffResult
 * @property {Map<string, string>} renamed The renamed classes (keys is old and value is new)
 * @property {string[]} added The new classes
 * @property {string[]} removed The removed classes
 */

module.exports = {
  /**
   * Extract list classes from discord css file
   * @param {string} hash The css hash
   * @returns {Promise<Set<String>>} The file content
   */
  async extractFromHash(hash) {
    return new Promise((resolve, reject) => {
      httpGet(`https://discord.com/assets/${hash}.css`, (res) => {
        const result = new Set()

        res
          .on('data', (chunk) => {
            extractClasses(chunk, result)
          })
          .once('end', () => {
            // Remove soucemap content
            result.delete('css')
            result.delete('map')

            resolve(result)
          })
          .once('error', reject)
      })
        .once('error', reject)
        .end()
    })
  },
  extractFromString: extractClasses,

  /**
   * Check the change between two classes list
   * @param {Set<string>} oldSet The old classes list
   * @param {Set<string>} newSet The new classes list
   * @returns {DiffResult} The Change
   */
  diff(oldSet, newSet) {
    const oldClasses = [...oldSet]

    const result = {
      renamed: new Map(),
      removed: [],
      added: [],
    }

    let name, oldIndex, oldClass
    newSet.forEach(
      /** @param {string} className */ (className) => {
        // Exclude hash of class name
        name = className.substring(0, className.indexOf('-'))

        // Search class from name
        oldIndex = oldClasses.findIndex((val) => name === val.substring(0, val.indexOf('-')))

        // The class is an new
        if (oldIndex === -1) {
          result.added.push(className)
          return
        }

        oldClass = oldClasses[oldIndex]

        // The class has renamed
        if (oldClass !== className) {
          result.renamed.set(oldClass, className)
        }

        // Remove old class
        oldClasses.splice(oldIndex, 1)
      }
    )

    // Store old classes
    result.removed = oldClasses

    return result
  },
}

/**
 * Extract classes and put in set
 * @param {string} string The string content
 * @param {Set<string>} set The result of classes
 * @returns The passed set
 */
function extractClasses(string, set = new Set()) {
  let match
  while ((match = classRegex.exec(string)) != null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (match.index === classRegex.lastIndex) {
      classRegex.lastIndex++
    }

    set.add(match[1])
  }

  return set
}
