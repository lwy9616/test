/**
 * 实现漫游类
 * @param {*} viewer Cegore.View对象实例
 * @param {*} models 数组，元素为继承自Cegore.Model的model对象实例
 */
function PathFly(viewer,pathParam) {

    //先算相机两点的距离
    var okayPathParam = computationTime(pathParam);

    var _targetPosition = null;  //模型漫游(目标)轨迹路线
    var _cameraPosition = null;  //相机位置轨迹路线
    var _time = new GmMap3D.JulianDate();
    var _startTime = new GmMap3D.JulianDate();
    var _consumTime = 0;
    var timeOffset = 0; //暂停的时长
    var timeOffsetBegin = null; //开始暂停的时间


    parsePostions(pathParam);//初始化路线轨迹
    
    var _orientation = new GmMap3D.VelocityOrientationProperty(_targetPosition); //模型姿态信息
    var _pauseFlag = false;//暂停标志
    var _isLock = true;//漫游时是否锁定视角

    _targetPosition.setInterpolationOptions({//设置路径插值法
        interpolationDegree: 10,
        interpolationAlgorithm: GmMap3D.LagrangePolynomialApproximation
    });
    
    //解析路径参数
    function parsePostions(pathParam) {

        var rpath = pathParam.path;

        _targetPosition = new GmMap3D.SampledPositionProperty();
        _cameraPosition = new GmMap3D.SampledPositionProperty();

        for (var i = 0; i < rpath.length; i++) {

            var props = rpath[i];
            var capoint = props.cameraPoint;
            var tapoint = props.targetPoint;
            
            var mtime = props.time+_consumTime;
            _consumTime += props.time;

            var time = GmMap3D.JulianDate.addSeconds(_time,mtime,new GmMap3D.JulianDate());
            var positon = GmMap3D.Cartesian3.fromDegrees(tapoint[0], tapoint[1], tapoint[2]);//模型位置
            var cpositon = GmMap3D.Cartesian3.fromDegrees(capoint[0], capoint[1], capoint[2]);//摄像机位置

            _targetPosition.addSample(time, positon);
            _cameraPosition.addSample(time, cpositon);

            
        }
    }


    //开始漫游、从暂停中恢复
    this.play = function () {
        if (!_pauseFlag) {
            this.resume();
            viewer._czdata.viewer.scene.postRender.addEventListener(tick);
        } else {//暂停时，执行恢复
            this.resume();
        }
    }
    


    //停止漫游
    this.stop = function () {
        
        viewer._czdata.viewer.scene.postRender.removeEventListener(tick);

        _time = new GmMap3D.JulianDate();

        _startTime = new GmMap3D.JulianDate();
 
        _pauseFlag = false;

        viewer.camera.clearLookAt();
    }

    this.pause = function () {
        _pauseFlag = true;
        timeOffsetBegin = Cesium.JulianDate.fromDate(new Date(),timeOffsetBegin);
    }

    this.resume = function () {
        if(timeOffsetBegin && _pauseFlag === true){     //_pauseFlag === true 防止重复点击
            timeOffset += GmMap3D.JulianDate.secondsDifference(Cesium.JulianDate.fromDate(new Date()), timeOffsetBegin);
        }
        _pauseFlag = false;
    }

    this.lock = function () {
        _isLock = true;
    }

    this.unlock = function () {
        _isLock = false;
        viewer.camera.clearLookAt();
    }


    var originalTime = new GmMap3D.JulianDate();//初始时间值

    function tick(scene,nowTime) {
        if(_pauseFlag) return
        if (_startTime.equals(originalTime)) {//给开始时间复值
            nowTime.clone(_startTime);
            return;
        }

        var seconds = GmMap3D.JulianDate.secondsDifference(nowTime, _startTime) - timeOffset;   //需要减去暂停的时长

        if(seconds>=_consumTime){//比较开始时间和当前时间差是否超过总的时间段，否则无法取到Sample
            _startTime = new GmMap3D.JulianDate();
            _time = new GmMap3D.JulianDate();
            return ;
        }
        
        _time = new GmMap3D.JulianDate();
        GmMap3D.JulianDate.addSeconds(_time, seconds, _time);

        var cartesian = _targetPosition.getValue(_time);//动态计算位置
        var quaternion = _orientation.getValue(_time);//动态计算方向

        if (cartesian && quaternion) {

            var cartographic = GmMap3D.Cartographic.fromCartesian(cartesian);
            if (_isLock){
                var cpositon = _cameraPosition.getValue(_time);
                cpositon = GmMap3D.Cartographic.fromCartesian(cpositon);
                viewer.camera.lookAtFromTo(cpositon,cartographic);
            }
        }
    }

}


function computationTime(pathParam){

    if(!pathParam){
        return;
    }

    var earthr = 6378137;
    var fpath = pathParam.path;
    var times = [];
    pathParam.path[0].time = 0;
    for(var i=1 ;i<fpath.length ;i++){

        var po1 = fpath[i-1];
        var po2 = fpath[i];
        var cameraPoint1 = po1.cameraPoint;
        var cameraPoint2 = po2.cameraPoint;
        var speed1 = po1.speed;
        var speed2 = po2.speed;

        lat1 = Math.PI / 180*cameraPoint1[1];
        lat2 = Math.PI / 180*cameraPoint2[1];
        lon1 = Math.PI / 180*cameraPoint1[0];
        lon2 = Math.PI / 180*cameraPoint2[0];
   
        // 计算长度
        var ac = Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
        var as = Math.sin(lat1) * Math.sin(lat2);
        var a = ac + as;
        if (a > 1) a = 1;
        if (a < -1) a = -1;
        var len = Math.acos(a)*earthr;
        var averSpeed = (speed1+speed2)/2;
        var mtime = parseFloat(len/averSpeed);
        pathParam.path[i].time = mtime;
    }

    return pathParam;

}


    
/**
 * 实现漫游类
 * @param {*} viewer Cegore.View对象实例
 * @param {*} models 数组，元素为继承自Cegore.Model的model对象实例
 */
// function PathFly(viewer, models, pathArray) {
    
//         var _modelAir = models[0];  //空中模型
//         var _modelLand = models[1];  //地面模型
//         var _modelDiving = models[2];  //水下模型
//         var _currentModel = null;//当前正在漫游的模型
    
//         var _time = new GmMap3D.JulianDate();//模型漫游的时间
//         var oldTime = new GmMap3D.JulianDate();//上一帧的时间
    
//         var _position = null;//模型漫游轨迹路线
//         var _ctargets = null;  //相机位置轨迹路线
//         parsePostions(pathArray);//初始化路线轨迹
        
//         var _orientation = new GmMap3D.VelocityOrientationProperty(_position); //模型姿态信息
    
//         var _pauseFlag = false;//暂停标志
//         var _speed = 1;//加速级别
//         var _isLock = true;//漫游时是否锁定视角
    
//         _position.setInterpolationOptions({//设置路径插值法
//             interpolationDegree: 2,
//             interpolationAlgorithm: GmMap3D.LagrangePolynomialApproximation
//         });
    
    
//         initModel(models);
//         //初始化模型
//         function initModel(models) {
//             for (var i in models) {
//                 models[i]._czEntity.show = false;
//                 viewer.models.add(models[i]);
//             }
//         }
    
//         //解析路径参数
//         function parsePath(pathArray) {
    
//             var property = new GmMap3D.SampledPositionProperty();
    
//             for (var i = 0; i < pathArray.length; i += 4) {
    
//                 var time = GmMap3D.JulianDate.addSeconds(_time, pathArray[i], new GmMap3D.JulianDate());
//                 var position = GmMap3D.Cartesian3.fromDegrees(pathArray[i + 1], pathArray[i + 2], pathArray[i + 3]);
//                 property.addSample(time, position);
//             }
    
//             return property;
//         }
    
        
//         //解析路径参数
//         function parsePostions(json) {
//             _position = new GmMap3D.SampledPositionProperty();
//             _ctargets = new GmMap3D.SampledPositionProperty();
    
//             var positinsArray = json.RowValue;
//             for (var i = 0; i < positinsArray.length; i++) {
//                 var props = positinsArray[i];
//                 var time = GmMap3D.JulianDate.addSeconds(_time, props[0],new GmMap3D.JulianDate());
//                 var positon = GmMap3D.Cartesian3.fromDegrees(props[4], props[5], props[6]);//模型位置
//                 var cpositon = GmMap3D.Cartesian3.fromDegrees(props[1], props[2], props[3]);//摄像机位置
                
//                 _position.addSample(time, positon);
//                 _ctargets.addSample(time, cpositon);
//             }
//         }
    
    
//         //开始漫游、从暂停中恢复
//         this.play = function () {
//             if (!_pauseFlag) {
//                 this.resume();
//                 viewer._czdata.viewer.scene.postRender.addEventListener(print);
//                 viewer._czdata.viewer.scene.postRender.addEventListener(tick);
//             } else {//暂停时，执行恢复
//                 this.resume();
//             }
//         }
        
    
    
//         //停止漫游
//         this.stop = function () {
//             if (_currentModel)
//                 _currentModel._czEntity.show = false;
//             viewer._czdata.viewer.scene.postRender.removeEventListener(tick);
//             viewer._czdata.viewer.scene.postRender.removeEventListener(print);
//             _time = new GmMap3D.JulianDate();
//             oldTime = new GmMap3D.JulianDate();
//             _pauseFlag = false;
//             _speed = 1;
//             _currentModel = null;
//             _cachePos = null;
//             viewer.camera.clearLookAt();
//         }
//         this.pause = function () {
//             _pauseFlag = true;
//         }
//         this.resume = function () {
//             _pauseFlag = false;
//         }
//         // 设置加速级别
//         this.speedUp = function (x) {
//             x = parseInt(x);
//             _speed = x;
//         }
//         this.lock = function () {
//             _isLock = true;
//         }
//         this.unlock = function () {
//             _isLock = false;
//             viewer.camera.clearLookAt();
//         }
    
//         function update(time) {
//             var cartesian = _position.getValue(time);//动态计算位置
//             var quaternion = _orientation.getValue(time);//动态计算方向
//             if (cartesian && quaternion) {
//                 console.log(time);
//                 console.log(cartesian);
//                 console.log(quaternion);
//                 var cartographic = GmMap3D.Cartographic.fromCartesian(cartesian);
//                 //resetModel(cartographic, quaternion);
//                 if (_isLock){
//                     var cpositon = _ctargets.getValue(time);
//                     console.log(cpositon);
//                     cpositon = GmMap3D.Cartographic.fromCartesian(cpositon);
//                     viewer.camera.lookAtFromTo(cpositon,cartographic);
//                 }
//             }
//         }
    
//         //计算模型位置
//         function resetModel(cartographic, quaternion) {
//             var height = cartographic.height;
//             switchModel(height);
//             _currentModel.position = cartographic;
//             _currentModel._czEntity.orientation = quaternion;
    
    
//         }
    
//         //偏转模型角度
//         function offsetModelOrientation(quaternion) {
//             if (_currentModel == _modelDiving) {
//                 var Hpr = GmMap3D.HeadingPitchRoll.fromQuaternion(quaternion);
//                 Hpr.heading -= Math.PI / 2;
//                 return GmMap3D.Quaternion.fromHeadingPitchRoll(Hpr);
//             }
//             return quaternion;
//         }
    
//         //设置相机位置
//         function resetCamera(cpositon,target) {
//             var Hpr = GmMap3D.HeadingPitchRoll.fromQuaternion(quaternion);
//             var heading = Cegore.GeoMath.toDegree(Hpr.heading);
//             var pitch = Cegore.GeoMath.toDegree(Hpr.pitch);
//             viewer.camera.flyToSphere({
//                 center: target,
//                 radius: 10,
//                 offset: new Cegore.HeadingPitchDistance(  heading-45, -15, 0),
//                 duration: 0,
//             });
//         }
    
    
    
//         //切换模型
//         function switchModel(height) {
//             if (height > 1200 && _currentModel != _modelAir) {
//                 reloadModel(_currentModel, _modelAir);
//             }
//             if (height > 1100 && height <= 1200 && _currentModel != _modelLand) {
//                 reloadModel(_currentModel, _modelLand);
//             }
//             if (height <= 1100 && _currentModel != _modelDiving) {
//                 reloadModel(_currentModel, _modelDiving);
//             }
//         }
    
//         //重载模型
//         function reloadModel(oldModel, newModel) {
//             //oldModel && viewer.models.remove(oldModel);
//             if (oldModel)
//                 oldModel._czEntity.show = false;
//             _currentModel = newModel;//设置当前设置的模型
//             //viewer.models.add(newModel);
//             _currentModel._czEntity.show = true;
//         }
    
//         function print() {
    
//             update(_time);
    
//         }
    
//         var _cachePos = null;//缓存上一次移动的位置
    
//         var originalTime = new GmMap3D.JulianDate();//初始时间值
    
//         //跟随帧的渲染改变模型关联时间
//         function tick(scene, nowTime) {
//             var seconds = GmMap3D.JulianDate.secondsDifference(nowTime, oldTime);
//             if (oldTime.equals(originalTime)) {//判断oldTIme为初始值，赋值并返回
//                 nowTime.clone(oldTime);
//                 return;
//             }
    
//             nowTime.clone(oldTime);
//             if (!_pauseFlag) {
    
//                 GmMap3D.JulianDate.addSeconds(_time, seconds * _speed, _time);
//             }
//         }
    
//         this.destroy = function () {
//             for (var i in models) {
//                 viewer.models.remove(models[i]);
//             }
//         }
//     }


