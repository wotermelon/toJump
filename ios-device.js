const rp = require('request-promise')
const config = require('./config')

class device {
  constructor () {
    console.log(`连接手机中... ->${config.url}`)
    rp(`${config.url}/status`, {
      timeout: 10000
    })
      .then((data) => {
        this.connect = data
      })
      .catch((error) => {
        console.log('连接ios失败')
      })
  }

  screenshot () {
    return rp(`${config.url}/screenshot`)
      .then((data) => {
        console.log(data)
      })
  }
}

module.exports = device