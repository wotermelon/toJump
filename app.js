const http = require('http')
const path = require('path')
const child_process = require('child_process')
const fs = require('fs-extra')
const express = require('express')
const opn = require('opn')

const app = express()
const config = require('./config')

const PUBLIC_PATH = path.join(__dirname, 'public')
const ADB_PATH = path.join(__dirname, 'lib/adb/adb.exe')
const SCREEN_SHOT_PATH = path.join(PUBLIC_PATH, 'img/screenshot')

app.use('/', express.static(PUBLIC_PATH))

const server = http.createServer(app)

server.listen(config.port)
server.on('error', onError)
server.on('listening', onListening)

// const io = require('socket.io')(server, {
//   path: '/socket/queue'
// })
const io = require('socket.io')(server)
io.on('connection', function (socket) {
  console.log('已连接...')
  socket.on('distance', async function (data) {
    let time = Math.round(data * config.magicNumber)
    console.log(time)
    try {
      await runCmd(`${ADB_PATH} shell input touchscreen swipe 200 200 200 200 ${time}`)
      setTimeout(handler, time + 500)
    } catch (error) {
      io.emit('error', error)
      throw error
    }
  })
  socket.on('start', handler)

  async function handler () {
    try {
      let screenImage = await getScreenShot()
      io.emit('response', screenImage)
    } catch (error) {
      io.emit('error', error)
      throw error
    }
  }
})

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error
  }
  switch (error.code) {
    case 'EADDRINUSE':
      console.log(`>>  ${config.port} 端口已被占用`)
      process.exit(1)
      break;
    default:
      throw error
  }
}

function onListening() {
  var addr = server.address()
  console.log(`>>  Listening on port ${addr.port}`)
  opn(`http://127.0.0.1:${addr.port}`)
}

// 执行cmd 命令
function runCmd (cmd) {
  return new Promise(function (resolve, reject) {
    child_process.exec(cmd, {
      maxBuffer: 1000 * 1024
    }, function (err, stdout, stderr) {
      if (err) {
        // console.log(err)
        reject(err)
      } else {
        resolve(stdout)
      }
    })
  })
}

async function getScreenShot () {
  await fs.emptyDir(SCREEN_SHOT_PATH)
  var imageName = `${+new Date}.png`
  await runCmd(`${ADB_PATH} shell screencap -p /sdcard/screenshot.png`)
  await runCmd(`${ADB_PATH} pull /sdcard/screenshot.png ${path.join(SCREEN_SHOT_PATH, imageName)}`)
  return imageName
}