(function() {
    window.onload = onReady

    function onReady() {
        var socket = io()
        var startBtn = document.getElementById('start-btn')
        var main = document.getElementById('main')
        var x1, y1,
            x2, y2,
            scale,
            prevent = false,
            isStart = false,
            isFirstClick = true
        var pointArr = []
        startBtn.addEventListener('click', onStart, false)
        main.addEventListener('click', onClick, false)

        // 开始play
        function onStart() {
            if (!isStart) {
                socket.on('response', function(imageName) {
                    var imageSrc = './img/screenshot/' + imageName
                    loadImage(imageSrc, function(e) {
                        var imageWidth = e.path[0].width
                        scale = imageWidth / main.offsetWidth
                        main.style.backgroundImage = 'url(' + imageSrc + ')'
                        prevent = false
                    })
                })
                socket.on('error', function(err) {
                    alert(error)
                })
                main.addEventListener('click', onClick, false)
            }
            isStart = true
            socket.emit('start')
        }
        // 跳一跳点击
        function onClick(e) {
            var next = [e.pageX, e.pageY]
            pointArr.push(next)
                // 第一个点不跳
            if (pointArr.length === 1) return
            var previous = pointArr[pointArr.length - 1]
            var distance = getDistance(previous[0], previous[1], next[0], next[1])
            var duringTime = distance * scale
            console.log('distance: ', distance)
            console.log('duringTime: ', duringTime)
            clickOver(duringTime)
        }
        // 点击完成
        function clickOver(time) {
            socket.emit('distance', time)
        }
        // 获取两点距离
        function getDistance(x1, y1, x2, y2) {
            var offsetX = Math.abs(x1 - x2)
            var offsetY = Math.abs(y1 - y2)
            return Math.pow(offsetX * offsetX + offsetY * offsetY, 0.5)
        }
        // 加载图片
        function loadImage(src, cb) {
            var _image = new Image()
            _image.onload = cb
            _image.src = src
        }
    }
})()