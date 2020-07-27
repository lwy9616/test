function RealMarker(viewer, options) {

    var czviewer = viewer._czdata.viewer;

    var _icon = options.icon;
    var _pots = options.path;
    var _speed = options.speed ? options.speed : 1;
    var _property = new Cesium.SampledPositionProperty();

    var _end = options.end;

    var _time = new Cesium.JulianDate();

    //
    _pots.forEach(e => {
        let p = Cesium.Cartesian3.fromDegrees(e[1], e[2]);
        let t = new Cesium.JulianDate(0, e[0] * _speed);
        _property.addSample(t, p);
    });

    let line = [];
    this.czentity = czviewer.entities.add({
        position: new Cesium.CallbackProperty(function () {
            var _pos = _property.getValue(_time);
            if (!_pos && _end) {
                _end(_time);
                _end = false;
            }
            if (_pos && !_pos.equals(line[line.length - 1]))
                line.push(_pos);
            if (!_pos && line.length < 1) return null;
            let result = _pos ? _pos.clone() : line[line.length - 1].clone();
            return result;
        }, false),
        billboard: {
            image: _icon
        },
        polyline: {
            positions: new Cesium.CallbackProperty(function () {
                return $.extend([], line);
            },false),
            width: 3,
            material: Cesium.Color.AQUA
        }
    });

    var cacheTime = null;
    function tickTime(e, nowtime) {
        if (!cacheTime) {
            cacheTime = nowtime.clone();
            return;
        }
        var seconds = Cesium.JulianDate.secondsDifference(nowtime, cacheTime);
        _time = Cesium.JulianDate.addSeconds(_time, seconds, new Cesium.JulianDate());
        cacheTime = nowtime;
    }

    this.start = function () {
        czviewer.scene.postRender.addEventListener(tickTime);
    }

    this.stop = function () {
        czviewer.scene.postRender.removeEventListener(tickTime);
    }

    this.clear = function () {
        czviewer.entities.remove(this.czentity);
        czviewer.scene.postRender.removeEventListener(tickTime);
    }

    this.reset = function () {
        _time = new Cesium.JulianDate();
        line = [];
    }

}

/**
 * 信息窗
 * @param {*} viewer 
 */
function infowin(viewer) {

    var $box = $('.dialogBox');
    var $content = $('.dialogue');

    var positon = new Cesium.Cartesian3();

    function update() {
        let coor = Cesium.SceneTransforms.wgs84ToWindowCoordinates(viewer._czdata.viewer.scene, positon);
        $box.offset({
            left: coor.x - $box.width() * 3 / 16 - 7.5,
            top: coor.y - $box.height() - 110
        });
    }

    this.msg = function (pos, content) {
        positon = Cesium.Cartesian3.fromDegrees(pos[0], pos[1]);
        $content.html(content);
        $box.show();
        viewer._czdata.viewer.scene.postRender.addEventListener(update);
    }

    this.hide = function () {
        $box.hide();
        viewer._czdata.viewer.scene.postRender.removeEventListener(update);
    }

}

/**
 * 放大图标动画循环
 * @param {*} viewer 
 * @param {*} options 
 */
function Zgif(viewer, options) {
    var czviewer = viewer._czdata.viewer;

    var pos = options.pos;
    var rate = options.rate ? options.rate : 50;
    var maxS = options.max ? options.max : 5;
    var loop = options.loop ? options.loop : false;
    var _scala = 1;
    var act = true;
    if (options.act === false) act = false;

    this._entity = czviewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(pos[0], pos[1]),
        billboard: {
            image: options.img,
            width: options.width ? options.width : 10,
            height: options.height ? options.height : 10,
        }
    });

    this.billboard = this._entity.billboard;

    let that = this;
    if (act) {

        this.timer = window.setInterval(function () {
            that.billboard.scale = _scala;
            _scala += 0.1;
            if (_scala > maxS)
                if (loop) _scala = 1;
                else window.clearInterval(that.timer);
        }, rate);
    }

    this.clear = function () {
        window.clearInterval(this.timer);
        czviewer.entities.remove(this._entity);
    }
}

/**
 * 自动调度任务
 */
function ZSchedule() {

    this.operations = [];

    var _timer = null;

    /**
     * 添加任务
     * @param {操作回调} action 
     * @param {操作持续时长} time 
     */
    this.addTask = function (action, time) {
        this.operations.push({
            action: action,
            time: time * 1000
        });
    }

    this.stop = function () {
        window.clearTimeout(_timer);
        _p = 0;
    }

    /**
     * 开始执行任务
     * @param {是否循环执行} isLoop 
     */
    this.start = function (isLoop) {
        _isLoop = isLoop;
        doo();
    }

    var _isLoop = false;
    var _p = 0;
    var that = this;
    function doo() {
        if (_p >= that.operations.length)
            if (_isLoop) _p = 0;
            else return;

        let e = that.operations[_p];

        _p++;
        if (!e) return;

        if (typeof e.action == 'function') e.action();

        _timer = window.setTimeout(doo, e.time);
    }

}

export default RealMarker;