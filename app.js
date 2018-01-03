const http = require('http')
const path = require('path')
const child_process = require('child_process')
const fs = require('fs-extra')
const express = require('express')
const opn = require('opn')

const app = express()
const config = require('./config')

const device = require('./ios-device')

const PLATFORM = require('os').platform()
const ADB_PATH = PLATFORM === 'win32' ?
        path.join(__dirname, 'lib/win/adb.exe') :
        PLATFORM === 'darwin' ? path.join(__dirname, 'lib/mac/adb') : ''
if (!ADB_PATH) {
  console.log('目前只支持mac和window系统...')
  process.exit(1)
}
const PUBLIC_PATH = path.join(__dirname, 'public')
const SCREEN_SHOT_PATH = path.join(PUBLIC_PATH, 'img/screenshot')

let client
if (config.device === 'ios') {
  client = new device()
}

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
  console.log('页面已连接...')
  socket.on('distance', async function (data) {
    let time = Math.round(data * config.magicNumber)
    await toJump(time)
  })
  socket.on('start', handler)
})

async function handler () {
  try {
    let screenImage
    if (config.device === 'android') {
      screenImage = await getScreenShot()
    } else if (config.device === 'ios') {
      screenImage = await getScreenShotByIOS()
    }

    io.emit('response', screenImage)
  } catch (error) {
    io.emit('error', error)
    throw error
  }
}

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
  // opn(`http://127.0.0.1:${addr.port}`)
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

async function toJump (duration) {
  if (config.device === 'ios') {
    try {
      await client.jump(duration / 1000)
      setTimeout(handler, duration + 500)
    } catch (error) {
      io.emit('error', error)
      throw error
    }
  }

  if (config.device === 'android') {
    try {
      await runCmd(`${ADB_PATH} shell input touchscreen swipe 200 200 200 200 ${duration}`)
      setTimeout(handler, duration + 500)
    } catch (e) {
      io.emit('error', error)
      throw error
    }
  }
}

async function getScreenShotByIOS () {
  let data = await client.screenshot()
  await fs.emptyDir(SCREEN_SHOT_PATH)
  var imageName = `${+new Date}.png`
  var fullpath = `${SCREEN_SHOT_PATH}/${imageName}`
  try {
    let check = await fs.access(fullpath)
    await fs.unlink(fullpath)
  } catch (e) {
    await fs.writeFile(fullpath, data, 'base64')
  }
  return imageName
}