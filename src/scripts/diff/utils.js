const { createPatch } = require('diff')
const { readFile, writeFile } = require('fs/promises')
const { get: httpGet } = require('https')
const { resolve } = require('path')

module.exports = {
  /**
   * Download the discord asset file and cache it
   * @param {string} filename The filename
   * @param {string} cacheDir The cache dir
   * @returns {Promise<string>} The file content
   */
  async downloadFile(filename, cacheDir) {
    const file = resolve(cacheDir, filename)

    // Read file
    return (
      readFile(file, 'utf-8')
        // Download file if not exist
        .catch(
          () =>
            new Promise((resolve, reject) => {
              httpGet('https://discord.com/assets/' + filename, (res) => {
                let content = ''
                res
                  .on('data', (chunk) => {
                    content += chunk
                      .toString()
                      .replace(/\n/, '\n\n')
                      .replace(/}(\.|@)/gi, '}\n$1')
                  })
                  .once('end', async () => {
                    await writeFile(file, content)
                    resolve(content)
                  })
                  .once('error', reject)
              })
                .once('error', reject)
                .end()
            })
        )
    )
  },

  async generatePatch(oldContent, newContent) {
    createPatch()
  },
}
