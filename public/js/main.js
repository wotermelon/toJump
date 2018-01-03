(function () {
  window.onload = onReady
  function onReady () {
    var socket = io()
    var startBtn = document.getElementById('start-btn')
    var main = document.getElementById('main')
    var x1, y1,
      x2, y2,
      scale,
      prevent = false,
      isStart = false,
      isFirstClick = true

    startBtn.addEventListener('click', onStart, false)
    main.addEventListener('click', onClick, false)

    // 开始play
    function onStart () {
      if (!isStart) {
        socket.on('response', function (imageName) {
          var imageSrc = './img/screenshot/' + imageName
          loadImage(imageSrc, function (e) {
            var imageWidth = e.path[0].width
            scale = imageWidth / main.offsetWidth
            main.style.backgroundImage = 'url(' + imageSrc + ')'
            prevent = false
          })
        })
        socket.on('error', function (err) {
          alert(err)
        })
        main.addEventListener('click', onClick, false)
      }
      isStart = true
      socket.emit('start')
    }
    // 跳一跳点击
    function onClick (e) {
      // 如果此时禁止点击
      if (prevent) return
      if (isFirstClick) {
        isFirstClick = false
        x1 = e.pageX
        y1 = e.pageY
      } else {
        prevent = true
        isFirstClick = true
        x2 = e.pageX
        y2 = e.pageY
        var distance = getDistance(x1, y1, x2, y2)
        var duringTime = distance * scale
        console.log('distance: ', distance)
        console.log('duringTime: ', duringTime)
        clickOver(duringTime)
      }
    }
    // 点击完成
    function clickOver (time) {
      socket.emit('distance', time)
    }
    // 获取两点距离
    function getDistance (x1, y1, x2, y2) {
      var offsetX = Math.abs(x1 - x2)
      var offsetY = Math.abs(y1 - y2)
      return Math.pow(offsetX * offsetX + offsetY * offsetY, 0.5)
    }
    // 加载图片
    function loadImage (src, cb) {
      var _image = new Image()
      _image.onload = cb
      _image.src = src
    }
  }
})()
