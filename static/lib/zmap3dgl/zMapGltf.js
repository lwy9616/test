
var ZMAPGLTF = function(map3DView){

    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.dviewer = map3DView.GetCegore();
    
}

//获取model对象
ZMAPGLTF.prototype.getModel = function(modelId){

    if(modelId == undefined || modelId == ""){
        return null;
    };
    var entity =  this.viewer.entities.getById(modelId);
    if(!entity || entity == undefined || entity == null){
        entity = null
    }
    return entity;
}

//移除model对象
ZMAPGLTF.prototype.removeModel = function(model){
    
    if(!model ||model == undefined || model == ""){
        return " The model doesn't exist  ";
    };

    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model is useless ";
    };

    return this.removeModelById(model._id);
}

//通过id移除model对象
ZMAPGLTF.prototype.removeModelById = function(modelId){
    
    if(!modelId || modelId == undefined || modelId == ""){
        return " The modelId doesn't exist  ";
    };

    var oldmodel = this.getModel(modelId);

    if(!oldmodel ||oldmodel == undefined || oldmodel == ""){
        return " The model doesn't exist  ";
    };

    var stateFlag  =  this.viewer.entities.removeById(oldmodel._id);
    return stateFlag;
}

//移除所有的实体对象
ZMAPGLTF.prototype.removeAll = function(){
    
    this.viewer.entities.removeAll();
}

ZMAPGLTF.prototype.addModel = function(options,isFlyto,islocked,callback){

    if(!options.modelid){
        return "you have to give a id ";
    };

    var oldmodel = this.getModel(options.modelid);

    if(oldmodel != undefined || oldmodel != null){
        
        return " The id already exists ";
    }

    if(options.url == undefined || options.url == null ||options.url == ""){
        return "you have to give a url ";
    }
    //处理旋转角度 
    var rotate = options.drotate ? options.drotate : [0, 0, 0];
    var posiArr = [];
    if(options.position){
        var po = options.position;
        posiArr[0] = parseFloat(po[0]);
        posiArr[1] = parseFloat(po[1]);
        posiArr[2] = po[2] ? parseFloat(po[2]) : 0;
    }else{
        posiArr = [110.05254, 25.002073, 0];
    }
    var _position = GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]);
    
    var heading = GmMap3D.Math.toRadians(parseFloat(rotate[0]));
    var pitch = GmMap3D.Math.toRadians(parseFloat(rotate[1]));
    var roll = GmMap3D.Math.toRadians(parseFloat(rotate[2]));
    var modelHpr = new GmMap3D.HeadingPitchRoll(heading, pitch, roll);
    var modelOrientation;
    if (options.initq)
    {
        modelOrientation = ZMAP3D.defaultValue(options.initq, ZMAP3D.Quaternion.IDENTITY);    
    }
    else
    {
        modelOrientation = GmMap3D.Transforms.headingPitchRollQuaternion(_position, modelHpr);
    }  
    
    var definedModel  = this.viewer.entities.add({
        position: _position,
        shadows: true,
        show:options.show==undefined?true:options.show,
        id: options.modelid ,
        name:options.name ? options.name :  options.modelid,
        orientation: modelOrientation,//模型方向
        model: {
            uri: options.url,
            scale : options.dscale ? options.dscale : 1.0,
            minimumPixelSize : options.dminimumPixelSize ? options.dminimumPixelSize : 1.0,
            maximumScale : options.dmaximumScale ? options.dmaximumScale : 1.0,
            runAnimations : options.drunAnimations ? options.drunAnimations : true,
            clampAnimations : true,
            color : options.dcolor ? this.map3dTool.colorTransform(options.dcolor) : GmMap3D.Color.WHITE,
            colorBlendMode : options.dcolorBlendMode ? GmMap3D.ColorBlendMode[options.dcolorBlendMode] : GmMap3D.ColorBlendMode.HIGHLIGHT,
            colorBlendAmount : options.dcolorBlendAmount ? options.dcolorBlendAmount : 0.5,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000),
        }
    });

    if(isFlyto){
        this.viewer.camera.flyTo({
            destination : GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]+1000)
        });
    }
    
    if(islocked){
        this.viewer.trackedEntity = definedModel;
    }

    
    definedModel['isLoad']  = false;
    var self = this;
    setTimeout(function(){
        var parimitive = self.map3dTool.getParimitive(options.modelid);
    
        if(parimitive)
        {
            parimitive.readyPromise.then(function () {
                definedModel['isLoad']  = true;
                if(callback){           
                        callback(definedModel);
                }
            }).otherwise(function (error) {
                throw (error);
            });
        }
    },1000)
    

    definedModel['callfun'] = options.callfun;
    definedModel['scaleBase'] = options.scaleBase;
    return definedModel;
}

ZMAPGLTF.prototype.changePosition = function(model,position,isFlyto){

    if(!model || model == undefined || model == ""){
        return " The model doesn't exist  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!position){
        return " The position is useless ";
    };

    var newPosition = GmMap3D.Cartesian3.fromDegrees(position[0], position[1], position[2]);
    model.position = newPosition;

    if(isFlyto){
        this.viewer.camera.flyTo({
            destination : GmMap3D.Cartesian3.fromDegrees(position[0], position[1], position[2]+1000)
        });
    }
}

ZMAPGLTF.prototype.getModelPosition = function(model,c3flag){
    
    if(!model || model == undefined || model == ""){
        return " The model doesn't exist  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    var modelPosition = model.position._value;
    if(c3flag){
       return modelPosition;
    }else{
        return this.map3dTool.cartesianTo2MapCoord(modelPosition);
    }
}

ZMAPGLTF.prototype.lookModel = function(modelEntity,options){
  
    this.viewer.trackedEntity = modelEntity;
    if(!modelEntity || modelEntity == undefined || modelEntity == ""){
        console.log("模型不存在");
        return " The model doesn't exist  ";
    };

    var existFlag = this.viewer.entities.contains(modelEntity);
    if(!existFlag){
        console.log("模型不存在");
        return " The model doesn't exist  ";
    }

    var allprimitives =  this.viewer.scene.primitives._primitives;
    var delpriEntity = null;
    for(var i=0 ; i< allprimitives.length ; i++){
        var primi = allprimitives[i];
        if(primi.id){
            if(primi.id._id === modelEntity._id){
                delpriEntity = primi;
                break;
            }
        }
    };

    var viewingAngle = null;
    var viewDis = null;
    var modelradius = delpriEntity._scaledBoundingSphere.radius;
    if(!options){
        viewingAngle = [0,90];
        viewDis = modelradius*50;
    }else {
        var viewingAngle = options.viewingAngle;
        var viewDis = options.viewDis;
        if(!viewingAngle){
            viewingAngle = [0,90];
        }
        if(!viewDis){
            viewDis = modelradius*50;
        }
    }

    var modelMid = modelEntity._position._value;

    var camepo = this.deviationCalculate(modelMid,GmMap3D.Math.toRadians(viewingAngle[0]),GmMap3D.Math.toRadians(viewingAngle[1]),viewDis);

    var hp = this.map3dTool.calculatehp(this.map3dTool.cartesianTo2MapCoord(camepo),this.map3dTool.cartesianTo2MapCoord(modelMid));

    var jwdcamepo = this.map3dTool.cartesianTo2MapCoord(camepo);

    cpositon1 = GmMap3D.Cartographic.fromCartesian(camepo);
    cpositon2 = GmMap3D.Cartographic.fromCartesian(modelMid);
    this.dviewer.camera.lookAtFromTo(cpositon1,cpositon2);
    this.viewer.trackedEntity = null;

}

ZMAPGLTF.prototype.deviationCalculate = function(po,heading,pitch,sideOffset){
    
    var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
    var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(po, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
    var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
    return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
};

ZMAPGLTF.prototype.getModelOrientation = function(model){
    
    if(!model || model == undefined || model == ""){
        return " The model doesn't exist  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }


    var positmatrix1 = GmMap3D.Transforms.eastNorthUpToFixedFrame(model.position._value, Cesium.Ellipsoid.WGS84, new Cesium.Matrix4());

    var mult3 = GmMap3D.Matrix4.multiply(GmMap3D.Matrix4.inverse(positmatrix1, new GmMap3D.Matrix4()), model._orientation._value, new GmMap3D.Matrix4());

    var mat3 = GmMap3D.Matrix4.getRotation(mult3, new Cesium.Matrix3());
   
    var q = GmMap3D.Quaternion.fromRotationMatrix(mat3);

    var hpr = Cesium.HeadingPitchRoll.fromQuaternion(q);

}

ZMAPGLTF.prototype.changeOrientation = function(model,rotate){
    
    if(!model || model == undefined || model == ""){
        return " The model doesn't exist  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!rotate){
        return " The rotate is useless  ";
    };

    var modelPosition = model.position._value;
    var heading = GmMap3D.Math.toRadians(parseFloat(rotate[0]));
    var pitch = GmMap3D.Math.toRadians(parseFloat(rotate[1]));
    var roll = GmMap3D.Math.toRadians(parseFloat(rotate[2]));
    var modelHpr = new GmMap3D.HeadingPitchRoll(heading, pitch, roll);
    var orientation = GmMap3D.Transforms.headingPitchRollQuaternion(modelPosition, modelHpr);
    model.orientation = orientation;
}

ZMAPGLTF.prototype.changeColor = function(model,color){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    if(!color){
        return " The color is useless  ";
    };

    model.model.color = this.map3dTool.colorTransform(color);
}

ZMAPGLTF.prototype.getModelcolor = function(model,color){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }

    return model.color;
}

ZMAPGLTF.prototype.changeScale = function(model,scale){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    if(!scale){
        return " The scale is useless  ";
    };

    model.model.maximumScale = parseFloat(scale);
    model.model.scale = parseFloat(scale);
}

ZMAPGLTF.prototype.getModelScale = function(model){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    
    return model.model._scale._value;
}

ZMAPGLTF.prototype.changePixelSize = function(model,PixelSize){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    if(!PixelSize){
        return " The PixelSize is useless  ";
    };

    model.model.maximumScale = parseInt(PixelSize);
    model.model.minimumPixelSize = parseInt(PixelSize);
}

ZMAPGLTF.prototype.show = function(model){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }

    model.show = true;
}

ZMAPGLTF.prototype.unshow = function(model){
    
    if(!model || model == undefined || model == ""){
        return " The model is undefined  ";
    };
    var existFlag = this.viewer.entities.contains(model);
    if(!existFlag){
        return " The model doesn't exist  ";
    }
    model.show = false;
}

ZMAPGLTF.prototype.computationTime = function (pathParam){
    
    if(!pathParam){
        return;
    }

    var earthr = 6378137;
    var fpath = pathParam.path;
    var times = [];
    pathParam.path[0].time = 1;
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

ZMAPGLTF.rotateModel= function(viewer,model,rotate){
    var modelexist = false;
    var existFlag = viewer.entities.contains(model);
    if(existFlag){
        modelexist = true;
    }

    var _stopFlag = false;//模型是否旋转的标志
    var _oldHeadRotate = 0;//记录上一次的角度
    var _oldrollRotate = 0;//记录上一次的角度
    var _oldpichRotate = 0;//记录上一次的角度

    var _modelHeading = rotate[0] ? rotate[0] : 0;//初始化航向旋转
    var _modelHpitch  = rotate[1] ? rotate[1] : 0;//初始化旋转
    var _modelRoll = rotate[2] ? rotate[2] : 0;//初始化翻滚旋转

    //开始旋转
    this.play = function () {
        if(_stopFlag || !existFlag){
            return ; 
        }else{
            _stopFlag = true;
        }
        if(_modelHeading ===0 && _modelHpitch ===0 && _modelRoll === 0){
            _stopFlag = false;
            return ;
        }
        viewer.scene.postRender.addEventListener(tick);
    }

    //停止旋转
    this.stop = function () {
        _stopFlag = false;
        viewer.scene.postRender.removeEventListener(tick);
    }

    function tick() {

        var _cposition = model._position._value;

        _oldHeadRotate += _modelHeading*Math.PI / 180;
        _oldrollRotate += _modelHpitch*Math.PI / 180 ;
        _oldpichRotate  = _modelRoll*Math.PI / 180 ;

        var fheading = GmMap3D.Math.toRadians(parseFloat(_oldHeadRotate));
        var fpitch = GmMap3D.Math.toRadians(parseFloat(_oldpichRotate));
        var froll = GmMap3D.Math.toRadians(parseFloat(_oldrollRotate));

        var hpr = new GmMap3D.HeadingPitchRoll(fheading, fpitch, froll);
        var forientation = GmMap3D.Transforms.headingPitchRollQuaternion(_cposition, hpr);

        model.orientation = forientation;
    }
}

ZMAPGLTF.singelMoveAndrotateModel = function(maptool,Param,locked,callback) {
    
    var viewer = maptool.viewer;
    var _stopRotateFlag = true;//模型是否旋转的标志
    var _stopMoveFlag = true;//模型是否停止移动的标志
    var _tickStartFlag = 0;//是否已经开启的监听事件 
    var _consumTime = 0;//记录时间的上限
    var _difPauseTime = 0;//记录lister每次的现在和开始点的差值，暂停时赋值给_pauseTime
    var _pauseTime = 0;//暂停的位置
    var _pausePosition = null;//暂停时的位置
    var _modelEntity = null;
    var _modelTrack = null;
    var trackPoint = [];


    //设置时间段
    for(var i=0 ;i<Param.path.length ;i++){
        Param.path[i].cameraPoint = Param.path[i].targetPoint;
    }
    //计算时间
    maptool.computationTime(Param);

    var _time = new GmMap3D.JulianDate();
    var _startTime = new GmMap3D.JulianDate();
    var originalTime = new GmMap3D.JulianDate();//初始时间值

    var _oldHeadRotate = 0;//记录上一次的角度
    var _oldrollRotate = 0;//记录上一次的角度
    var _oldpichRotate = 0;//记录上一次的角度
    
    var _modelHeading = Param.rotate[0] ? Param.rotate[0] : 0;//初始化航向旋转
    var _modelHpitch  = Param.rotate[1] ? Param.rotate[1] : 0;//初始化旋转
    var _modelRoll = Param.rotate[2] ? Param.rotate[2] : 0;//初始化翻滚旋转

    var _targetPosition = null;
    parsePostions(Param);

    _targetPosition.setInterpolationOptions({//设置路径插值法
        interpolationDegree: Param.finterpolationDegree ? Param.finterpolationDegree : 10,
        interpolationAlgorithm: Param.finterpolationAlgorithm ? GmMap3D[Param.finterpolationAlgorithm] : GmMap3D.LinearApproximation
    });

    var _orientation = new GmMap3D.VelocityOrientationProperty(_targetPosition); //模型姿态信息

    for(var j=0 ; j< _targetPosition._property._values.length ;j++ ){
        trackPoint.push(_targetPosition._property._values[j]);
    }
    createPath(trackPoint,Param.trackPath);
    //形成轨迹线
    function createPath(trackpath,dparam){

        var trackEntity = viewer.entities.add({
            id:dparam.id ? dparam.id : "trackid",
            show : dparam.dshow ? dparam.dshow : true,
            polyline : {
                positions : GmMap3D.Cartesian3.unpackArray(trackPoint),
                width : dparam.dwidth ? dparam.dwidth : 1.0,
                material : new Cesium.PolylineOutlineMaterialProperty({
                    color : dparam.dcolor ? maptool.map3dTool.colorTransform(dparam.dcolor) : GmMap3D.Color.WHITE,
                    outlineWidth : dparam.doutlineWidth ?  dparam.doutlineWidth : 1.0,
                    outlineColor : dparam.doutlineColor ?  maptool.map3dTool.colorTransform(dparam.dcolor) : GmMap3D.Color.WHITE
                })
            }
        })
        _modelTrack = trackEntity;
    }

    this.showTrack = function (){
        _modelTrack.show = true;
    }

    this.unshowTrack = function (){
        _modelTrack.show = false;
    }

    //解析路径参数
    function parsePostions(okayPathParam) {
        
        var rpath = okayPathParam.path;
        _targetPosition = new GmMap3D.SampledPositionProperty();

        for (var i = 0; i <rpath.length; i++) {
            var props = rpath[i];
            var tapoint = props.targetPoint;

            var mtime = props.time+_consumTime;
            _consumTime += props.time;

            var time = GmMap3D.JulianDate.addSeconds(_time,mtime,new GmMap3D.JulianDate());
            var positon = GmMap3D.Cartesian3.fromDegrees(tapoint[0], tapoint[1], tapoint[2]);//模型位置

            _targetPosition.addSample(time, positon);
            
        }
    }

    
    //确定模型是否存在，存在就删除
    var oldmodel = viewer.entities.getById(Param.modelID);

    if(oldmodel != undefined || oldmodel != null){
        viewer.entities.removeById(Param.modelID);
    }
    
    
    //位置是否给出，不给就自定义
    var posiArr = [];
    if(Param.path[0].targetPoint){
        var po = Param.path[0].targetPoint;
        posiArr[0] = parseFloat(po[0]);
        posiArr[1] = parseFloat(po[1]);
        posiArr[2] = po[2] ? parseFloat(po[2]) : 0;
    }else{
        posiArr = [110.05254, 25.002073, 0];
    }
    var _position = GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]);
    //旋转模型默认初始化是不旋转
    var hpr = new GmMap3D.HeadingPitchRoll(0, 0, 0);
    var orientation = GmMap3D.Transforms.headingPitchRollQuaternion(_position, hpr);

    var fmodel  = viewer.entities.add({
        position: _position,
        shadows: true,
        id: Param.modelID ? Param.modelID : "testModel",
        name: Param.modelID ? Param.modelID : "testModel",
        orientation:orientation,//模型方向

        model: {
            uri: Param.url ? Param.url : './gltf/test.gltf',
            scale : Param.fscale ?  Param.fscale : 1.0,
            minimumPixelSize : Param.fminimumPixelSize ? Param.fminimumPixelSize : 1.0,
            maximumScale : Param.fmaximumScale ? Param.fmaximumScale : 1.0,
            runAnimations : Param.frunAnimations ? Param.frunAnimations : true,
            clampAnimations : true,
            color : Param.fcolor ? GmMap3D.Color[Param.fcolor.toUpperCase()] : GmMap3D.Color.WHITE,
            colorBlendMode : Param.fcolorBlendMode ? GmMap3D.ColorBlendMode[Param.fcolorBlendMode.toUpperCase()] : GmMap3D.ColorBlendMode.HIGHLIGHT,
            colorBlendAmount : Param.fcolorBlendAmount ? Param.fcolorBlendAmount : 0.5,
        }
    });

    fmodel['isLoad']  = false;

    setTimeout(function(){
        var parimitive = maptool.map3dTool.getParimitive(Param.modelID ? Param.modelID : "testModel");
    
        if(parimitive)
        {
            parimitive.readyPromise.then(function () {
                fmodel['isLoad']  = true;
            }).otherwise(function (error) {
                throw (error);
            });
        }
    },1000)
    fmodel['callfun'] = Param.callfun;

    _modelEntity = fmodel;

    if(locked){
        viewer.trackedEntity = _modelEntity;
    }

    //开始旋转
    this.playRotate = function () {
        if(!_stopRotateFlag){
            return ; 
        }else{
            _stopRotateFlag = false;
        }
        if(_modelHeading ===0 && _modelHpitch ===0 && _modelRoll === 0){
            _stopRotateFlag = true;
            return ;
        }
        if(_tickStartFlag===0){
            viewer.scene.postRender.addEventListener(tick);
            _tickStartFlag = 1;
        }
        
    }

    //开始旋转
    this.playMove = function () {
        if(!_stopMoveFlag){
            return ; 
        }else{
            _stopMoveFlag = false;
        }
        if(_tickStartFlag===0){
            viewer.scene.postRender.addEventListener(tick);
            _tickStartFlag = 1;
        }
        
    }

    //停止旋转
    this.stopRotate = function () {
        _stopRotateFlag = true;
        _oldHeadRotate = 0 ;
        _oldrollRotate = 0 ;
        _oldpichRotate = 0;
        if(_stopMoveFlag && _stopRotateFlag){
            _tickStartFlag = 0;
            viewer.scene.postRender.removeEventListener(tick);
        }
        
    }


        //停止移动
        this.stopMove = function () {
        _stopMoveFlag = true;
        _startTime = new GmMap3D.JulianDate();
        _difPauseTime = 0
        _pauseTime = 0
        if(_stopRotateFlag && _stopMoveFlag){
            _tickStartFlag = 0;
            viewer.scene.postRender.removeEventListener(tick);
        }
    }

    //暂停移动
    this.pauseMove = function () {
        _pauseTime += _difPauseTime;
        _startTime = new GmMap3D.JulianDate();
        _stopMoveFlag = true;

        _time = new GmMap3D.JulianDate();
        GmMap3D.JulianDate.addSeconds(_time, _pauseTime, _time);
        _pausePosition = _targetPosition.getValue(_time);//动态计算位置

        if(_stopRotateFlag && _stopRotateFlag){
            _tickStartFlag = 0;
            viewer.scene.postRender.removeEventListener(tick);
        }
    }

    
    function tick(scene,nowTime) {

        if(typeof callback === "function"){
            callback(_modelEntity);
        }

        if (_startTime.equals(originalTime)) {//给开始时间复值
            nowTime.clone(_startTime);
            return;
        }

        var seconds = GmMap3D.JulianDate.secondsDifference(nowTime, _startTime);
        _difPauseTime = seconds;

        if(seconds+_pauseTime>=_consumTime){//比较开始时间和当前时间差是否超过总的时间段，否则无法取到Sample
            _startTime = new GmMap3D.JulianDate();
            _time = new GmMap3D.JulianDate();
            _pauseTime = 0;
            _difPauseTime = 0;
            return ;
        }
        
        _time = new GmMap3D.JulianDate();
        GmMap3D.JulianDate.addSeconds(_time, seconds+_pauseTime, _time);

        var targetPosition = null;
        var orquaternion =null;
        if (!_stopMoveFlag) {
            targetPosition = _targetPosition.getValue(_time);//动态计算位置
            orquaternion = _orientation.getValue(_time);//动态计算方向
        }

        var rorientation = null;
        if(!_stopRotateFlag){
            _oldHeadRotate += _modelHeading*Math.PI / 180;
            _oldrollRotate += _modelHpitch*Math.PI / 180 ;
            _oldpichRotate  = _modelRoll*Math.PI / 180 ;
    
            var fheading = GmMap3D.Math.toRadians(parseFloat(_oldHeadRotate));
            var fpitch = GmMap3D.Math.toRadians(parseFloat(_oldpichRotate));
            var froll = GmMap3D.Math.toRadians(parseFloat(_oldrollRotate));
            var _fposition = null;
            if(!_stopMoveFlag){
                _fposition = targetPosition;
            }else if(_pausePosition){
                _fposition = _pausePosition;
            }else{
                _fposition = _position;
            }

            if(_fposition){
                var hpr = new GmMap3D.HeadingPitchRoll(fheading, fpitch, froll);
                var forientation = GmMap3D.Transforms.headingPitchRollQuaternion(_fposition, hpr);
                rorientation = forientation;
            }
        }

        if(targetPosition){
            _modelEntity.position = targetPosition;
            _modelEntity.orientation = orquaternion;
        }

        if(rorientation){
            _modelEntity.orientation = rorientation;
        }
    }

}


ZMAPGLTF.shieldMachineMoveAndrotateModel = function(zmaped,Param,locked,callback) {
    var viewer = zmaped.viewer
    var _stopRotateFlag = true;//模型是否旋转的标志
    var _stopMoveFlag = true;//模型是否停止移动的标志
    var _tickStartFlag = 0;//是否已经开启的监听事件 
    var _consumTime = 0;//记录时间的上限
    var _difPauseTime = 0;//记录lister每次的现在和开始点的差值，暂停时赋值给_pauseTime
    var _pauseTime = 0;//暂停的位置
    var _pausePosition = null;//暂停时的位置
    var _pauseOrquaternion = null;//暂停时的四次元
    var _mainModelEntity = null;//只移动的实体
    var _assistEntity = null;//移动也可以旋转的实体
    var _assistModelintPosition = null;//旋转的实体初始位置
    var _initOrRotate = null;
    var trackPoint = [];
    var _modelTrack = null;

    var _time = new GmMap3D.JulianDate();
    var _startTime = new GmMap3D.JulianDate();
    var originalTime = new GmMap3D.JulianDate();//初始时间值

    var _oldHeadRotate = 0;//记录上一次的角度
    var _oldrollRotate = 0;//记录上一次的角度
    var _oldpichRotate = 0;//记录上一次的角度

    //初始化辅助模型的自身的旋转运动旋转参数
    var _assistModelHeading = Param.otherModel.rotateDate[0] ? Param.otherModel.rotateDate[0]*Math.PI / 180 : 0;//初始化辅助模型（副）航向旋转
    var _assistModelHpitch  = Param.otherModel.rotateDate[1] ? Param.otherModel.rotateDate[1]*Math.PI / 180 : 0;//初始化辅助模型（副）旋转
    var _assistModelRoll = Param.otherModel.rotateDate[2] ? Param.otherModel.rotateDate[2]*Math.PI / 180 : 0;//初始化辅助模型（副）翻滚旋转

    //初始化主模型的自身的旋转参数
    var _intMainHeadRotate = Param.mainModel.moverotate[0] ? Param.mainModel.moverotate[0]*Math.PI / 180 : 0;//主模型默认航向旋转
    var _intMainpitchRotate =Param.mainModel.moverotate[2] ? Param.mainModel.moverotate[2]*Math.PI / 180 : 0;//主模型默认俯仰
    var _intMainrollRotate = Param.mainModel.moverotate[1] ? Param.mainModel.moverotate[1]*Math.PI / 180 : 0;//主模型默认翻滚旋转
    

    //初始化辅助模型的自身的旋转参数
    var _intAssistHeadRotate = Param.otherModel.rotate[0] ? Param.otherModel.rotate[0]*Math.PI / 180 : 0;//次模型默认航向旋转
    var _intAssistRitchRotate =Param.otherModel.rotate[2] ? Param.otherModel.rotate[2]*Math.PI / 180 : 0;//次模型默认翻滚旋转
    var _intAssistRollRotate = Param.otherModel.rotate[1] ? Param.otherModel.rotate[1]*Math.PI / 180 : 0;//次模型默认旋转
    
    var _assistVector = Param.otherModel.vector;//次模型相对主模型位置上的向量

    //设置时间段
    for(var i=0 ;i<Param.mainModel.path.length ;i++){
        Param.mainModel.path[i].cameraPoint = Param.mainModel.path[i].targetPoint;
    }
    var newPath = computationTime({"path":Param.mainModel.path});
    Param.mainModel.path = newPath.path;

    //根据时间轴初始化Sample
    var _targetPosition = null;
    parsePostions(Param);

    _targetPosition.setInterpolationOptions({//设置路径插值法
        interpolationDegree: Param.finterpolationDegree ? Param.finterpolationDegree : 10,
        interpolationAlgorithm: Param.finterpolationAlgorithm ? GmMap3D[Param.finterpolationAlgorithm] : GmMap3D.LinearApproximation
    });

    var _orientation = new GmMap3D.VelocityOrientationProperty(_targetPosition); //模型姿态信息

    for(var j=0 ; j< _targetPosition._property._values.length ;j++ ){
        trackPoint.push(_targetPosition._property._values[j]);
    }
    createPath(trackPoint,Param.trackPath);
    //形成轨迹线
    function createPath(trackpath,dparam){

        var trackEntity = viewer.entities.add({
            id:dparam.id ? dparam.id : "trackid",
            show : dparam.dshow ? dparam.dshow : true,
            polyline : {
                positions : GmMap3D.Cartesian3.unpackArray(trackPoint),
                width : dparam.dwidth ? dparam.dwidth : 1.0,
                material : new Cesium.PolylineOutlineMaterialProperty({
                    color : dparam.dcolor ? zmaped.map3dTool.colorTransform(dparam.dcolor) : GmMap3D.Color.WHITE,
                    outlineWidth : dparam.doutlineWidth ?  dparam.doutlineWidth : 1.0,
                    outlineColor : dparam.doutlineColor ?  zmaped.map3dTool.colorTransform(dparam.dcolor) : GmMap3D.Color.WHITE
                })
            }
        })
        _modelTrack = trackEntity;
    }

    this.showTrack = function (){
        _modelTrack.show = true;
    }

    this.unshowTrack = function (){
        _modelTrack.show = false;
    }

    //解析路径参数
    function parsePostions(okayPathParam) {
    
        var rpath = okayPathParam.mainModel.path;
        _targetPosition = new GmMap3D.SampledPositionProperty();

        for (var i = 0; i <rpath.length; i++) {
            var props = rpath[i];
            var tapoint = props.targetPoint;

            var mtime = props.time+_consumTime;
            _consumTime += props.time;

            var time = GmMap3D.JulianDate.addSeconds(_time,mtime,new GmMap3D.JulianDate());
            var positon = GmMap3D.Cartesian3.fromDegrees(tapoint[0], tapoint[1], tapoint[2]);//模型位置

            _targetPosition.addSample(time, positon);
            
        }
    }

    _mainModelEntity = initModel(Param.mainModel,viewer,zmaped.map3dTool);//主模型初始化

    var assistModelPositions = calculateAssistModelPosition(_mainModelEntity._orientation._value,_mainModelEntity.position._value,_assistVector);

    _assistModelintPosition = assistModelPositions;

    _initOrRotate = _mainModelEntity._orientation._value;//主模型初始化的旋转参数，提供在开始没有运动的情况下，副模型的旋转运动使用

    var lonAndLat = map3dView.cartesianTo2MapCoord(assistModelPositions);//将初始化副模型的位置的c3主标转经纬度

    Param.otherModel.startPosition = lonAndLat;

    _assistEntity = initAssistModel(Param.otherModel,viewer,_mainModelEntity._orientation._value,zmaped.map3dTool);//次模型初始化

    if(locked){
        viewer.trackedEntity = _mainModelEntity;
    }
    
    //开始旋转
    this.playRotate = function () {
        if(!_stopRotateFlag){
            return ; 
        }else{
            _stopRotateFlag = false;
        }
        if(_assistModelHeading ===0 && _assistModelHpitch ===0 && _assistModelRoll === 0){
            _stopRotateFlag = true;
            return ;
        }
        if(_tickStartFlag===0){
            viewer.scene.postRender.addEventListener(tick);
            _tickStartFlag = 1;
        }
        
    }

    //开始旋转
    this.playMove = function () {
        if(!_stopMoveFlag){
            return ; 
        }else{
            _stopMoveFlag = false;
        }
        if(_tickStartFlag===0){
            viewer.scene.postRender.addEventListener(tick);
            _tickStartFlag = 1;
        }
        
    }

    //停止旋转
    this.stopRotate = function () {
        if(_stopRotateFlag){
            _stopRotateFlag = true;
            return;
        }else {
            _stopRotateFlag = true;
            _oldHeadRotate = 0 ;
            _oldrollRotate = 0 ;
            _oldpichRotate = 0;
            if(_stopMoveFlag && _stopRotateFlag){
                _tickStartFlag = 0;
                viewer.scene.postRender.removeEventListener(tick);
            }
        }
    }


    //停止移动
    this.stopMove = function () {
        _stopMoveFlag = true;
        _startTime = new GmMap3D.JulianDate();
        _difPauseTime = 0
        _pauseTime = 0
        if(_stopRotateFlag && _stopMoveFlag){
            _tickStartFlag = 0;
            viewer.scene.postRender.removeEventListener(tick);
        }
    }

    //暂停移动
    this.pauseMove = function () {

        if(_stopRotateFlag){
            _stopMoveFlag = true;
            return;
        }else{
            _pauseTime += _difPauseTime;
            _startTime = new GmMap3D.JulianDate();
            _stopMoveFlag = true;
    
            _time = new GmMap3D.JulianDate();
            GmMap3D.JulianDate.addSeconds(_time, _pauseTime, _time);
            _pausePosition = _targetPosition.getValue(_time);//动态计算位置
            var mainHpr = new GmMap3D.HeadingPitchRoll(_intMainHeadRotate, _intMainpitchRotate, _intMainrollRotate);
            var corquaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(mainHpr,new GmMap3D.Quaternion())
            _pauseOrquaternion = GmMap3D.Quaternion.multiply(_orientation.getValue(_time),corquaternion,new GmMap3D.Quaternion());
    
            if(_stopRotateFlag && _stopRotateFlag){
                _tickStartFlag = 0;
                viewer.scene.postRender.removeEventListener(tick);
            }
        }
    }

    
    function tick(scene,nowTime) {

        //回调函数
        if(typeof callback === "function"){
            callback(_mainModelEntity);
        }

        if (_startTime.equals(originalTime)) {//给开始时间复值
            nowTime.clone(_startTime);
            return;
        }

        var seconds = GmMap3D.JulianDate.secondsDifference(nowTime, _startTime);
        _difPauseTime = seconds;

        if(seconds+_pauseTime>=_consumTime){//比较开始时间和当前时间差是否超过总的时间段，否则无法取到Sample
            _startTime = new GmMap3D.JulianDate();
            _time = new GmMap3D.JulianDate();
            _pauseTime = 0;
            _difPauseTime = 0;
            return ;
        }
        
        _time = new GmMap3D.JulianDate();
        GmMap3D.JulianDate.addSeconds(_time, seconds+_pauseTime, _time);

        var mainProModelPosition = null;
        var assistProModelPosition = null;
        var orquaternion  = null;
        if (!_stopMoveFlag) {
            mainProModelPosition = _targetPosition.getValue(_time);//动态计算位置
            var mainProOrquaternion = _orientation.getValue(_time);//动态计算方向;
            var mainHpr = new GmMap3D.HeadingPitchRoll(_intMainHeadRotate, _intMainpitchRotate, _intMainrollRotate);
            var corquaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(mainHpr,new GmMap3D.Quaternion())
            var orquaternion = GmMap3D.Quaternion.multiply(mainProOrquaternion,corquaternion,new GmMap3D.Quaternion());
            assistProModelPosition = calculateAssistModelPosition(orquaternion,mainProModelPosition,_assistVector);
        }

        var asorientation = null;
        var _makerorientation = null;
        if(!_stopRotateFlag){
            _oldHeadRotate += _assistModelHeading;
            _oldpichRotate += _assistModelHpitch;
            _oldrollRotate += _assistModelRoll ;

            var fheading = GmMap3D.Math.toRadians(parseFloat(_oldHeadRotate));
            var fpitch = GmMap3D.Math.toRadians(parseFloat(_oldpichRotate));
            var froll = GmMap3D.Math.toRadians(parseFloat(_oldrollRotate));
        
            if(!_stopMoveFlag){
                _makerorientation = orquaternion;
            }else if(_pausePosition){
                _makerorientation = _pauseOrquaternion;
            }else{
                _makerorientation = _initOrRotate;
            }

            if(_makerorientation){
                var hpr = new GmMap3D.HeadingPitchRoll(_intAssistHeadRotate, _intAssistRitchRotate, _intAssistRollRotate);
                var proOrquaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr,new GmMap3D.Quaternion())
                var hcorquaternion = GmMap3D.Quaternion.multiply(_makerorientation,proOrquaternion,new GmMap3D.Quaternion());

                var hpr2 = new GmMap3D.HeadingPitchRoll(fheading, fpitch, froll);
                var proOrquaternion2 = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr2,new GmMap3D.Quaternion())
                var hcorquaternion2 = GmMap3D.Quaternion.multiply(hcorquaternion,proOrquaternion2,new GmMap3D.Quaternion());
                asorientation = hcorquaternion2;
            }
        }else{

            if(!_stopMoveFlag){
                _makerorientation = orquaternion;
            }else if(_pausePosition){
                _makerorientation = _pauseOrquaternion;
            }else{
                _makerorientation = _initOrRotate;
            }

            if(_makerorientation){//次模型不旋转的情况下
                var hpr = new GmMap3D.HeadingPitchRoll(_intAssistHeadRotate, _intAssistRitchRotate, _intAssistRollRotate);
                var creaQuaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr,new GmMap3D.Quaternion())
                var corquaternion = GmMap3D.Quaternion.multiply(_makerorientation,creaQuaternion,new GmMap3D.Quaternion());
                asorientation = corquaternion;
            }
        }

        if(mainProModelPosition && assistProModelPosition){
            _mainModelEntity.position = mainProModelPosition;
            _mainModelEntity.orientation = orquaternion;
            _assistEntity.position = assistProModelPosition
        }

        if(asorientation){
            _assistEntity.orientation = asorientation;
        }
    }

}

//初始化主模型
function initModel(Param,viewer,map3dTool){
    //确定模型是否存在，存在就删除
    var oldmodel = viewer.entities.getById(Param.modelID);
    if(oldmodel != undefined || oldmodel != null){
        viewer.entities.removeById(Param.modelID);
    }
    
    //位置是否给出，不给就自定义
    var posiArr = [];
    if(Param.startPosition){
        var po = Param.startPosition;
        posiArr[0] = parseFloat(po[0]);
        posiArr[1] = parseFloat(po[1]);
        posiArr[2] = po[2] ? parseFloat(po[2]) : 0;
    }else{
        posiArr = [110.05254, 25.002073, 0];
    }
    var _position = GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]);
    //旋转模型默认旋转设置
    var _mainHeading = Param.rotate[0] ? GmMap3D.Math.toRadians((90+Param.rotate[0])): GmMap3D.Math.toRadians(90);
    var _mainpitch  = Param.rotate[1] ? Param.rotate[1]*Math.PI / 180 : 0;
    var _mainRoll = Param.rotate[2] ? Param.rotate[2]*Math.PI / 180 : 0;

    var hpr = new GmMap3D.HeadingPitchRoll(_mainHeading,_mainpitch,_mainRoll);
    var orientation = GmMap3D.Transforms.headingPitchRollQuaternion(_position, hpr);

    var fmodel  = viewer.entities.add({
        position: _position,
        shadows: true,
        id: Param.modelID ? Param.modelID : "testModel",
        name: Param.modelID ? Param.modelID : "testModel",
        orientation:orientation,//模型方向

        model: {
            uri: Param.url ? Param.url : './gltf/test.gltf',
            scale:Param.fscale ? Param.fscale : 1.0,
            minimumPixelSize : Param.fminimumPixelSize ? Param.fminimumPixelSize : 1.0,
            maximumScale : Param.fmaximumScale ? Param.fmaximumScale : 1.0,
            runAnimations : Param.frunAnimations ? Param.frunAnimations : true,
            clampAnimations : true,
            color : Param.fcolor ? map3dTool.colorTransform(Param.fcolor) : GmMap3D.Color.WHITE,
            colorBlendMode : Param.fcolorBlendMode ? GmMap3D.ColorBlendMode[Param.fcolorBlendMode.toUpperCase()] : GmMap3D.ColorBlendMode.HIGHLIGHT,
            colorBlendAmount : Param.fcolorBlendAmount ? Param.fcolorBlendAmount : 0.5,
        }
    });
    fmodel['isLoad']  = false;

    setTimeout(function(){
        var parimitive = map3dTool.getParimitive(Param.modelID ? Param.modelID : "testModel");
    
        if(parimitive)
        {
            parimitive.readyPromise.then(function () {
                fmodel['isLoad']  = true;
            }).otherwise(function (error) {
                throw (error);
            });
        }
    },1000)
    fmodel['callfun'] = Param.callfun;

    return fmodel;
}

function initAssistModel(Param,viewer,mainQuaternion,map3dTool){
    //确定模型是否存在，存在就删除
    var oldmodel = viewer.entities.getById(Param.modelID);
        
    if(oldmodel != undefined || oldmodel != null){
        viewer.entities.removeById(Param.modelID);
    }
    
    //位置是否给出，不给就自定义
    var posiArr = [];
    if(Param.startPosition){
        var po = Param.startPosition;
        posiArr[0] = parseFloat(po[0]);
        posiArr[1] = parseFloat(po[1]);
        posiArr[2] = po[2] ? parseFloat(po[2]) : 0;
    }else{
        posiArr = [110.05254, 25.002073, 0];
    }
    var _assistPosition = GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]);
    //旋转模型默认初始化是不旋转
    var _assistHeading = Param.rotate[0] ? Param.rotate[0]*Math.PI / 180 : 0;
    var _assistpitch  = Param.rotate[1] ? Param.rotate[1]*Math.PI / 180 : 0;
    var _assistRoll = Param.rotate[2] ? Param.rotate[2]*Math.PI / 180 : 0;

    var assisHpr = new GmMap3D.HeadingPitchRoll(_assistHeading,_assistpitch,_assistRoll);
    //根据次模型的旋转角度生成四次元
    var assistQuaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(assisHpr,new GmMap3D.Quaternion())
    var orientation = GmMap3D.Quaternion.multiply(mainQuaternion,assistQuaternion,new GmMap3D.Quaternion());

    var fmodel  = viewer.entities.add({
        position: _assistPosition,
        shadows: true,
        id: Param.modelID ? Param.modelID : "testModel",
        name: Param.modelID ? Param.modelID : "testModel",
        orientation:orientation,//模型方向

        model: {
            uri: Param.url ? Param.url : './gltf/test.gltf',
            scale:Param.fscale ? Param.fscale : 1.0,
            minimumPixelSize : Param.fminimumPixelSize ? Param.fminimumPixelSize : 1.0,
            maximumScale : Param.fmaximumScale ? Param.fmaximumScale : 1.0,
            runAnimations : Param.frunAnimations ? Param.frunAnimations : true,
            clampAnimations : true,
            color : Param.fcolor ? map3dTool.colorTransform(Param.fcolor) : GmMap3D.Color.WHITE,
            colorBlendMode : Param.fcolorBlendMode ? GmMap3D.ColorBlendMode[Param.fcolorBlendMode.toUpperCase()] : GmMap3D.ColorBlendMode.HIGHLIGHT,
            colorBlendAmount : Param.fcolorBlendAmount ? Param.fcolorBlendAmount : 0.5,
        }
    });


    fmodel['isLoad']  = false;

    setTimeout(function(){
        var parimitive = map3dTool.getParimitive(Param.modelID ? Param.modelID : "testModel");
    
        if(parimitive)
        {
            parimitive.readyPromise.then(function () {
                fmodel['isLoad']  = true;
            }).otherwise(function (error) {
                throw (error);
            });
        }
    },1000)
    fmodel['callfun'] = Param.callfun;

    return fmodel;
}



//根据主模型的位置，计算辅助（副）模型的位置
function calculateAssistModelPosition(quaternion,position,vector){

    var martin3 = GmMap3D.Matrix3.fromQuaternion(quaternion);//构建以主模型为基础的matrix3 的旋转矩阵

    var fcartesian = new GmMap3D.Cartesian3(vector[0],vector[1],vector[2]);//将主辅模型的相对位置向量转化成c3主标

    var fxcartesian =  GmMap3D.Matrix3.multiplyByVector(martin3, fcartesian,new GmMap3D.Cartesian3());//将向量转化成该旋转矩阵下的向量
    
    var assistModelPosition = GmMap3D.Cartesian3.add(fxcartesian, position, new GmMap3D.Cartesian3());//根据主模型的位置和向量计算出辅助模型的位置

    return assistModelPosition;
}


ZMAPGLTF.shieldMachinejumpAndrotateModel = function(zmaped,Param,locked,callback) {
    var viewer = zmaped.viewer;//获取viewer 对象
    var _stopRotateFlag = true;//模型是否旋转的标志
    var _mainModelEntity = null;//只移动的实体
    var _assistEntity = null;//移动也可以旋转的实体
    var _initOrRotate = null;
    var _deMainHeadRotate = 0;
    var _deMainpitchRotate =0;
    var _deMainrollRotate =0;

    var _oldHeadRotate = 0;//记录旋转上一次的角度
    var _oldrollRotate = 0;//记录旋转上一次的角度
    var _oldpichRotate = 0;//记录旋转上一次的角度

    //初始化辅助模型的自身的旋转运动旋转参数
    var _assistModelHeading = Param.otherModel.rotateDate[0] ? GmMap3D.Math.toRadians(Param.otherModel.rotateDate[0]) : 0;//初始化辅助模型（副）航向旋转
    var _assistModelHpitch  = Param.otherModel.rotateDate[1] ? GmMap3D.Math.toRadians(Param.otherModel.rotateDate[1]) : 0;//初始化辅助模型（副）旋转
    var _assistModelRoll = Param.otherModel.rotateDate[2] ?  GmMap3D.Math.toRadians(Param.otherModel.rotateDate[2]) : 0;//初始化辅助模型（副）翻滚旋转

    //初始化主模型的自身的旋转参数
    var _intMainHeadRotate = Param.mainModel.rotate[0] ? GmMap3D.Math.toRadians(Param.mainModel.rotate[0]+90) :  GmMap3D.Math.toRadians(90);//主模型默认航向旋转
    var _intMainpitchRotate =Param.mainModel.rotate[1] ? GmMap3D.Math.toRadians(Param.mainModel.rotate[2]) : 0;//主模型默认俯仰
    var _intMainrollRotate = Param.mainModel.rotate[2] ? GmMap3D.Math.toRadians(Param.mainModel.rotate[1]) : 0;//主模型默认翻滚旋转
    

    //初始化辅助模型的自身的旋转参数
    var _intAssistHeadRotate = Param.otherModel.rotate[0] ? GmMap3D.Math.toRadians(Param.otherModel.rotate[0]) : 0;//次模型默认航向旋转
    var _intAssistRitchRotate =Param.otherModel.rotate[2] ? GmMap3D.Math.toRadians(Param.otherModel.rotate[2]) : 0;//次模型默认翻滚旋转
    var _intAssistRollRotate = Param.otherModel.rotate[1] ? GmMap3D.Math.toRadians(Param.otherModel.rotate[1]) : 0;//次模型默认旋转
    
    var _assistVector = Param.otherModel.vector;//次模型相对主模型位置上的向量

    _mainModelEntity = initModel(Param.mainModel,viewer,zmaped.map3dTool);//主模型初始化

    _initOrRotate = _mainModelEntity._orientation._value;

    var assistModelPositions = calculateAssistModelPosition(_mainModelEntity._orientation._value,_mainModelEntity.position._value,_assistVector);

    var lonAndLat = map3dView.cartesianTo2MapCoord(assistModelPositions);//将初始化副模型的位置的c3主标转经纬度

    Param.otherModel.startPosition = lonAndLat;

    _assistEntity = initAssistModel(Param.otherModel,viewer,_mainModelEntity._orientation._value,zmaped.map3dTool);//次模型初始化

    if(locked){
        viewer.trackedEntity = _mainModelEntity;
    }
    
    //开始旋转
    this.playRotate = function () {
        if(!_stopRotateFlag){
            return ; 
        }else{
            _stopRotateFlag = false;
        }
        if(_assistModelHeading ===0 && _assistModelHpitch ===0 && _assistModelRoll === 0){
            _stopRotateFlag = true;
            return ;
        }
        viewer.scene.postRender.addEventListener(tick);
    }

    //停止旋转
    this.stopRotate = function () {
        if(_stopRotateFlag){
            _stopRotateFlag = true;
            return;
        }else {
            _stopRotateFlag = true;
            _oldHeadRotate = 0 ;
            _oldrollRotate = 0 ;
            _oldpichRotate = 0;
            viewer.scene.postRender.removeEventListener(tick);
        }
    }

    //改变模型位置
    this.alterPosition = function (param) {
        viewer.scene.postRender.removeEventListener(tick);
        if(!param.position){
            return;
        }
        if(param.mrotate){
            _deMainHeadRotate = param.mrotate[0] ? _intMainHeadRotate+GmMap3D.Math.toRadians(param.mrotate[0]) : _intMainHeadRotate;//航向旋转
            _deMainpitchRotate = param.mrotate[1] ? _intMainpitchRotate+GmMap3D.Math.toRadians(param.mrotate[1]) : _intMainpitchRotate;//俯仰
            _deMainrollRotate = param.mrotate[2] ? __intMainrollRotate+GmMap3D.Math.toRadians(param.mrotate[1]) : _intMainrollRotate;//主模型翻滚
        }

        var _position = GmMap3D.Cartesian3.fromDegrees(param.position[0], param.position[1], param.position[2])
        var hpr = new GmMap3D.HeadingPitchRoll(_deMainHeadRotate,_deMainpitchRotate,_deMainrollRotate);
        var corientation = GmMap3D.Transforms.headingPitchRollQuaternion(_position, hpr);
        _initOrRotate = corientation;

        var asmodelPosition = calculateAssistModelPosition(corientation,_position,_assistVector);
        var hpr = new GmMap3D.HeadingPitchRoll(_intAssistHeadRotate, _intAssistRitchRotate, _intAssistRollRotate);
        var creaQuaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr,new GmMap3D.Quaternion())
        var aorquaternion = GmMap3D.Quaternion.multiply(corientation,creaQuaternion,new GmMap3D.Quaternion());

        _mainModelEntity.position = _position;
        _mainModelEntity.orientation = corientation;
        _assistEntity.position = asmodelPosition
        _assistEntity.orientation = aorquaternion;

        if(!_stopRotateFlag){
            viewer.scene.postRender.addEventListener(tick);
        }
       
    }

    
    function tick(scene,nowTime) {

        var asorientation = null;
        if(!_stopRotateFlag){
            _oldHeadRotate += _assistModelHeading;
            _oldpichRotate += _assistModelHpitch;
            _oldrollRotate += _assistModelRoll ;

            var fheading = GmMap3D.Math.toRadians(parseFloat(_oldHeadRotate));
            var fpitch = GmMap3D.Math.toRadians(parseFloat(_oldpichRotate));
            var froll = GmMap3D.Math.toRadians(parseFloat(_oldrollRotate));

            if(_initOrRotate){
                var hpr = new GmMap3D.HeadingPitchRoll(_intAssistHeadRotate, _intAssistRitchRotate, _intAssistRollRotate);
                var proOrquaternion = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr,new GmMap3D.Quaternion())
                var hcorquaternion = GmMap3D.Quaternion.multiply(_initOrRotate,proOrquaternion,new GmMap3D.Quaternion());

                var hpr2 = new GmMap3D.HeadingPitchRoll(fheading, fpitch, froll);
                var proOrquaternion2 = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr2,new GmMap3D.Quaternion())
                var hcorquaternion2 = GmMap3D.Quaternion.multiply(hcorquaternion,proOrquaternion2,new GmMap3D.Quaternion());
                asorientation = hcorquaternion2;
            }
        }

        if(asorientation){
            _assistEntity.orientation = asorientation;
        }
    }

}