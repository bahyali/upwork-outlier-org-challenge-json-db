const express = require('express')
const router = express.Router()

const jsonDb = require('./json_db')
const directory = 'data/'

module.exports = router

router.route('/:studentId/*').put((req, res) => {
  let params = req.params
  createOrUpdateStudent(params.studentId, params[0], req.body)
    .then((data) => {
      res.status(202).send({})
    }).catch(() => res.sendStatus(404))
}).get((req, res) => {
  let params = req.params

  getStudent(params.studentId, params[0]).then((data) => {
    res.send(data)
  }).catch(() => res.sendStatus(404))
}).delete((req, res) => {
  let params = req.params
  createOrUpdateStudent(params.studentId, params[0], null)
    .then((data) => {
      res.status(202).send({})
    }).catch(() => res.sendStatus(404))
})

function getStudent (id, path) {
  return new Promise(async (resolve, reject) => {
    let dbFile = await jsonDb.readFile(dbFilePath(id))
    if (!dbFile) { reject(new Error('File Not found!')) }
    let map = path ? path.split('/') : []
    resolve(getKeyValueFromMap(JSON.parse(dbFile), map))
  })
}

function createOrUpdateStudent (id, path, value) {
  return new Promise(async (resolve, reject) => {
    jsonDb.fileExists(dbFilePath(id)).then(() => {
      resolve(updateStudent(id, path, value))
    }).catch(() => {
      resolve(createStudent(id, path, value))
    })
  })
}

async function createStudent (id, path, value) {
  let fileContent = createFromMap(path.split('/'), value)

  return jsonDb.createFile(directory, `${id}.json`, JSON.stringify(fileContent))
}

async function updateStudent (id, path, value) {
  let keys = path.split('/')
  let student = await getStudent(id)
  try {
    updateValueFromMap(student, keys, value)
    return jsonDb.createFile(directory, `${id}.json`, JSON.stringify(student))
  } catch (e) {
    console.log(e)
  }
}

function getKeyValueFromMap (branch, map) {
  if (map.length > 0) {
    let currentKey = map.shift()
    if (Object.keys(branch).indexOf(currentKey) === -1) {
      throw new Error('Key not found in hierarchy!')
    }

    // return last key as is
    if (map.length === 0) {
      return branch
    }

    if (typeof branch[currentKey] === 'object') {
      return getKeyValueFromMap(branch[currentKey], map)
    } else { throw new Error('Map is not accurate') }
  } else { return branch }
}

function updateValueFromMap (branch, map, value) {
  if (map.length > 0) {
    let currentKey = map.shift()
    if (Object.keys(branch).indexOf(currentKey) === -1) {
      // Append
      map.unshift(currentKey)
      Object.assign(branch, createFromMap(map, value))
      return
    }
    if (typeof branch[currentKey] === 'object') {
      return updateValueFromMap(branch[currentKey], map, value)
    } else { throw new Error('Map is not accurate') }
  } else {
    // mutate
    if (value === null) {
      for (const key in branch) {
        if (branch.hasOwnProperty(key)) {
          delete branch[key]
        }
      }
    } else {
      Object.assign(branch, value)
    }
  }
}

function createFromMap (map, value) {
  return map.reverse().reduce((res, key) => ({ [key]: res }), value)
}
function dbFilePath (id) {
  return directory + id + '.json'
}
