# toJump

用网页玩微信跳一跳小游戏

## 安装

安装 [Node.js](https://nodejs.org/en/)

``git clone https://github.com/wotermelon/toJump.git``

```shell
# 安装依赖
npm install

# 开启服务器，端口为4000，可通过config.js修改
npm start
```

## 使用方法

### 预先设置
#### 安卓
- 1.打开安卓手机的usb调试模式并授权连接的电脑
  > 如果是小米手机，在USB调试下方有``USB调试（安全设置）``打开允许模拟点击

  >其他需要模拟点击授权的手机需要打开``允许模拟点击``
- 2.在config中将device设置为`android`
#### IOS
- 1.参考[教程](https://testerhome.com/topics/7220)配置好WDA
- 2.在config中将device设置为`ios`
- 3.在config中配置WDA中得到的地址
### 开始使用
- 1.打开微信跳一跳，并点击开始
- 2.开启服务器，如上
- 3.点击开始，先点击小人底部适当位置，然后再点想要跳的箱子的位置即可完成，结束之后可点击开始可重新开始

ps: 跳的精度不准问题可通过``config.js``中的``magicNumber``微调。。。

## 截图预览

![截图](https://github.com/wotermelon/toJump/blob/master/screenshot.png)

由于图片未做处理，加载可能会有点慢。。。
