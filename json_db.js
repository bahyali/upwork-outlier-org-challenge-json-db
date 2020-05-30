const fs = require('fs')

module.exports = {
  createFile,
  readFile,
  fileExists
}

function createFile (path, filename, data) {
  return new Promise((resolve, reject) => {
    createDirectoryIfNotExists(path).then(() => {
      fs.writeFile(path + filename, data, (err) => {
        if (err) reject(err)
        resolve(true)
        console.log(`The file ${filename} has been created!`)
      })
    }).catch((e) => {
      reject(e)
    })
  })
}

function readFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => {
      if (err) { reject(err) }
      resolve(data)
    })
  })
}

function fileExists (path) {
  return new Promise((resolve, reject) => {
    fs.access(path, (err) => {
      if (err) { reject(err) }

      resolve(true)
    })
  })
}

function createDirectoryIfNotExists (dir) {
  return new Promise((resolve, reject) => {
    fs.access(dir, (err) => {
      if (err) {
        fs.mkdir(dir, (err) => {
          if (err) reject(err)
          resolve(true)
        })
      }
      resolve(true)
    })
  })
}
