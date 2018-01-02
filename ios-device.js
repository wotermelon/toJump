const rp = require('request-promise')
const config = require('./config')

class device {
  constructor () {
    console.log(`连接手机中... ->${config.url}`)
    rp(`${config.url}/status`, {
      timeout: 10000
    })
      .then((data) => {
        console.log('连接ios成功')
        this.connect = JSON.parse(data)
      })
      .catch((error) => {
        console.log('连接ios失败')
      })
  }

  screenshot () {
    return rp(`${config.url}/screenshot`)
      .then((data) => {
        return JSON.parse(data)['value']
      })
      .catch(() => {
        console.log('截图失败')
      })
  }

  jump (duration) {
    return rp({
      method: 'POST',
      uri: `${config.url}/session/${this.connect.sessionId}/wda/touchAndHold`,
      body: {
        x: 200,
        y: 200,
        duration
      },
      json: true
    })
      .then((data) => {
      })
      .catch((err) => {
        console.log('跳跃失败')
      })
  }
}

module.exports = device