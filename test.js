const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('student', async function (t) {
  const studentId = '5tudentId-' + Math.floor(Math.random() * 101)
  const path = ['courses', 'calculus', 'quizzes', 'something']
  const url = `${endpoint}/${studentId}/${path.join('/')}`
  const initialBody = { score: 98 }
  console.log('studentID', studentId)
  // Tests

  t.test('CREATE', (t) => {
    jsonist.put(url, initialBody, (err, body, res) => {
      if (err) {
        t.error('error here')
      }
      t.equals(res.statusCode, 202)
      t.end()
    })
  })

  t.test('READ', (t) => {
    t.test('READ return leaf value', (t) => {
      jsonist.get(url + '/score', (err, body, res) => {
        if (err) {
          t.error(err)
        }
        t.equals(res.statusCode, 200)
        t.looseEqual(body, initialBody)
        t.end()
      })
    })

    t.test('READ return nested props', (t) => {
      jsonist.get(url, (err, body, res) => {
        if (err) {
          t.error(err)
        }
        t.equals(res.statusCode, 200)
        t.looseEqual(body, { 'something': initialBody })
        t.end()
      })
    })
  })

  t.test('UPDATE', (t) => {
    let newBody = { score: 99 }
    jsonist.put(url, newBody, (err, body, res) => {
      if (err) {
        t.error(err.statusCode)
      } else {
        t.equals(res.statusCode, 202)
        t.equals(require(`./data/${studentId}.json`).courses.calculus.quizzes.something.score, 99)
      }
      t.end()
    })
  })

  t.test('UPDATE new value', (t) => {
    let newBody = { score: 100 }
    jsonist.put(`${endpoint}/${studentId}/courses/calculus/quizzes/something_else/something_other`, newBody, async (err, body, res) => {
      if (err) {
        t.error(err)
      } else {
        t.equals(res.statusCode, 202)
        delete require.cache[require.resolve(`./data/${studentId}.json`)]
        t.equals(require(`./data/${studentId}.json`).courses.calculus.quizzes.something_else.something_other.score, 100)
      }
      t.end()
    })
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})
