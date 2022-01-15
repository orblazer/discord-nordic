const { createTwoFilesPatch } = require('diff')
const { resolve } = require('path')
const { mkdir, writeFile } = require('fs/promises')
const { downloadFile } = require('./utils')

const HASHES = {
  last: null,
  current: '532.0f664c4fa9f722e57200',
}

const cacheDir = resolve(__dirname, '..', '..', '..', '.cache')
;(async () => {
  // Create dir if not exist
  await mkdir(cacheDir, { recursive: true })

  // Download files
  const oldCss = HASHES.last !== null ? await downloadFile(HASHES.last + '.css', cacheDir) : null
  const newCss = await downloadFile(HASHES.current + '.css', cacheDir)

  if (oldCss === null) {
    console.log("CAN'T DIFF, NO OLD CSS!")
    return
  }

  // Generate diff
  await writeFile(
    resolve(cacheDir, '_diff.patch'),
    createTwoFilesPatch(HASHES.last + '.css', HASHES.current + '.css', oldCss, newCss)
  )
  console.log('DONE!')
})()
