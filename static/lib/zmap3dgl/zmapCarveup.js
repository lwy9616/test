var dheadingArray = [GmMap3D.Math.toRadians(-45),GmMap3D.Math.toRadians(-45),
    GmMap3D.Math.toRadians(45),GmMap3D.Math.toRadians(45),
    GmMap3D.Math.toRadians(-135),GmMap3D.Math.toRadians(-135),
    GmMap3D.Math.toRadians(135),GmMap3D.Math.toRadians(135)
   ];
var dpitcharray = [Math.asin(Math.sqrt(3)/3),-Math.asin(Math.sqrt(3)/3),
  Math.asin(Math.sqrt(3)/3),-Math.asin(Math.sqrt(3)/3),
  Math.asin(Math.sqrt(3)/3),-Math.asin(Math.sqrt(3)/3),
  Math.asin(Math.sqrt(3)/3),-Math.asin(Math.sqrt(3)/3),
];

var mheadingArray = [GmMap3D.Math.toRadians(0),GmMap3D.Math.toRadians(90),
    GmMap3D.Math.toRadians(180),GmMap3D.Math.toRadians(-90),
    GmMap3D.Math.toRadians(0),GmMap3D.Math.toRadians(0)
   ];
var mpitcharray = [GmMap3D.Math.toRadians(0),GmMap3D.Math.toRadians(0),
   GmMap3D.Math.toRadians(0),GmMap3D.Math.toRadians(0),
   GmMap3D.Math.toRadians(90),GmMap3D.Math.toRadians(-90)
];

var defineBaseVector = [
    {"axisNum":1,"axis":"x","vector":[1,0,0]},
    {"axisNum":2,"axis":"xf","vector":[-1,0,0]},
    {"axisNum":3,"axis":"y","vector":[0,1,0]},
    {"axisNum":4,"axis":"yf","vector":[0,-1,0]},
    {"axisNum":5,"axis":"z","vector":[0,0,1]},
    {"axisNum":6,"axis":"zf","vector":[0,0,-1]}
];

var ZMAPCARVEUP = function(map3DView){
    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.camera = this.viewer.camera;
    this.nativeScene = map3dView.cesium.mViewer.scene;
    this.Handler = new GmMap3D.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this._model = null;//模型实体
    this._modelFlag = true;//false表示是gltf模型，true表示是3dtiles
    this._planeEntities = [];
    this._clippingPlanes;
    this._clippingId = [];
    this._modelRadius = 0;
    this.selectedPlane = null;
    this.basePlanes = {};
    this.basevector = {};
    this.modelMart3 = null;
    this.dpoints = new _points();
    this.dtarget = new _distance();
}

ZMAPCARVEUP.prototype.initBaseParam  = function(map3DView){
    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.camera = this.viewer.camera;
    this.nativeScene = map3dView.cesium.mViewer.scene;
    this.Handler = new GmMap3D.ScreenSpaceEventHandler(this.viewer.scene.canvas);
}

ZMAPCARVEUP.prototype.removeAllMes= function(){
    this._model =null;
    this._modelFlag = true;
    this._planeEntities = [];
    this._clippingPlanes;
    this._modelRadius = 0;
    this.selectedPlane = null;
    this.basePlanes = {};
    this.basevector = {};
    this.modelMart3 = null;
    this.dpoints = null;
    this.dpoints = new _points();
    this.dtarget = null;
    this.dtarget = new _distance();
    for(var j=0 ;j<this._clippingId.length;j++){
        this.map3dTool.removeModelByid(this._clippingId[j]);
    }
    this._clippingId = [];
    

}

//判断模型是否存在
ZMAPCARVEUP.prototype.judge = function(modelEntity){
    if(!modelEntity){
        return false;
    }

    this._model = modelEntity;
    if(typeof modelEntity =='string')
    {
        if(this.map3dTool.zmapGltf){
            this._model = this.map3dTool.GetModel(modelEntity);
        }else{
            this._model = this.map3dTool.get3dTilesById(modelEntity);
        }
    }

    if(typeof this._model =='string'){
        return false;
    }

    return true;

}

ZMAPCARVEUP.prototype.getModelBorder = function(){
    
    if(this._modelFlag){
        this._modelRadius = this._model._root._boundingVolume._boundingSphere.radius;
        this.dpoints.setCenter(this._model._root._boundingVolume._boundingSphere.center);
        var matr4 = this._model._modelMatrix;
        this.modelMart3 = GmMap3D.Matrix4.getRotation(matr4,new GmMap3D.Matrix3());
    }else{
        var allprimitives =  this.viewer.scene.primitives._primitives;
        var delpriEntity = null;
        for(var i=0 ; i< allprimitives.length ; i++){
            var primi = allprimitives[i];
            if(primi.id){
                if(primi.id._id === this._model._id){
                    delpriEntity = primi;
                    break;
                }
            }
        };
        this._modelRadius = delpriEntity._scaledBoundingSphere.radius;
        this.dpoints.setCenter(this._model._position._value);
        var quaternion = this._model._orientation._value;
        this.modelMart3 = GmMap3D.Matrix3.fromQuaternion(quaternion);
    }
}

ZMAPCARVEUP.prototype.getModelBoxPoints = function(){

    //获取外包围盒的6个顶点
    var centerP = this.dpoints.getCenter();
    var op = null;
    for(var i=0;i<8;i++){
        op = this.deviationCalculate(centerP,dheadingArray[i],dpitcharray[i],this._modelRadius);
        if(i==0){this.dpoints.setOnep(op);}
        if(i==1){this.dpoints.setTwop(op);}
        if(i==2){this.dpoints.setThrp(op);}
        if(i==3){this.dpoints.setFoup(op);}
        if(i==4){this.dpoints.setFivp(op);}
        if(i==5){this.dpoints.setSixp(op);}
        if(i==6){this.dpoints.setSevp(op);}
        if(i==7){this.dpoints.setEigp(op);}
    }

    //获取外包围盒的6个面点
    for(var i=0;i<6;i++){
        op = this.deviationCalculate(centerP,mheadingArray[i],mpitcharray[i],this._modelRadius);
        if(i==0){this.dpoints.setXmps(op);}
        if(i==1){this.dpoints.setXfmps(op);}
        if(i==2){this.dpoints.setYmps(op);}
        if(i==3){this.dpoints.setYfmps(op);}
        if(i==4){this.dpoints.setZmps(op);}
        if(i==5){this.dpoints.setZfmps(op);}
    }
}

ZMAPCARVEUP.prototype.deviationCalculate = function(po,heading,pitch,sideOffset){
    
    var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
    var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(po, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
    var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
    return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
};


ZMAPCARVEUP.prototype.createBasePlanes = function(axisNum){
    var normalVector =null;
    var jnormalVector = null;
    var plane = null;
    var clipping = null;
    var clippings = [];
    var planeDis = 0;
    var carvePlane = [];

    if(axisNum==null||axisNum==undefined){
        carvePlane = [1,2,3,4,5,6];
    }else{
        for(var m=0;m<axisNum.length;m++){
            var num = axisNum[m];
            for(var j=0 ;j<defineBaseVector.length;j++){
                var obj = defineBaseVector[j];
                if(Number(num)==Number(obj['axisNum'])){
                    carvePlane.push(obj['axisNum']);
                    break;
                }
            }
        }
        
    }

    if(carvePlane.length==0){
        return false;
    }

    for(var k=0 ;k<defineBaseVector.length;k++){
        var dobj = defineBaseVector[k];
        var vector = dobj['vector'];
        var axis = dobj['axis'];
        var axisNum = dobj['axisNum'];
        normalVector = new GmMap3D.Cartesian3(vector[0],vector[1],vector[2]);
        jnormalVector = GmMap3D.Matrix3.multiplyByVector(this.modelMart3, normalVector,new GmMap3D.Cartesian3());
        jnormalVector = GmMap3D.Cartesian3.normalize(jnormalVector,new GmMap3D.Cartesian3());

        var index = $.inArray(axisNum,carvePlane);
        if(index>=0){
            clipping = new GmMap3D.ClippingPlane(normalVector, 0);
            clippings.push(clipping);
            this._clippingId.push("plane"+axis);
            this.dtarget['_target'+axis]._targetDis = this._modelRadius;
        }
        this.basevector[axis] = jnormalVector;
        if(axis.indexOf("f")<0){
            plane = new GmMap3D.Plane(jnormalVector,0);
            planeDis = GmMap3D.Plane.getPointDistance(plane, this.dpoints.getCenter());
            plane.distance = planeDis;
            if(axis =="x"){
                if(this.dpoints.getCenter().x>0){
                    plane.distance = -planeDis;
                }
            }
            if(axis =="y"){
                if(this.dpoints.getCenter().y>0){
                    plane.distance = -planeDis;
                }
            }
            if(axis=="z"){
                plane.distance = -planeDis;
            }
            this.basePlanes[axis] = plane;
        }
        
    }

    return clippings;
    
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctionx = function(plane){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targetx._targetDis;
        return plane;
    };
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctionxf = function(plane){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targetxf._targetDis;
        return plane;
    };
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctiony = function(plane){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targety._targetDis;
        return plane;
    };
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctionyf = function(plane){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targetyf._targetDis;
        return plane;
    };
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctionz = function(plane){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targetz._targetDis;
        return plane;
    };
}

ZMAPCARVEUP.prototype.createPlaneUpdateFunctionzf = function(plane,marx4){
    var _this = this;
    return function () {
        plane.distance = _this.dtarget._targetzf._targetDis;
       
        return  plane;
    };
}

ZMAPCARVEUP.prototype.computeAxis = function(chooseaxis,cameVec){
    
    var index = "x";
    if(chooseaxis.indexOf("x")>=0){
        index = "y"
        return index;
    }else if(chooseaxis.indexOf("y")>=0){
        index = "x"
        return index;
    }else {
        var xaxis = GmMap3D.Cartesian3.angleBetween(this.basevector.x,cameVec);
        
        var yaxis = GmMap3D.Cartesian3.angleBetween(this.basevector.y,cameVec);
        
        var zaxis = GmMap3D.Cartesian3.angleBetween(this.basevector.z,cameVec);

        var minaxis = Math.abs(xaxis);
        if(Math.abs(yaxis)<=minaxis){
            minaxis = Math.abs(yaxis);
            index = "y";
        }
    
        if(Math.abs(zaxis)<=minaxis){
            minaxis = Math.abs(zaxis);
            index = "z";
        }
        return index;
    }
}




ZMAPCARVEUP.prototype.computeDistance = function(windowPosition,verc,chooseaxis){

    var cameraPay = this.camera.getPickRay(windowPosition);

    var cameVec = cameraPay.direction;

    var index = this.computeAxis(chooseaxis,cameVec);
    
    var repoint = GmMap3D.IntersectionTests.rayPlane(cameraPay, this.basePlanes[index], new GmMap3D.Cartesian3());

    if(repoint ==undefined||repoint==null){
        if(index=="x"){
            index=="Y"
        }else{
            index=="x"
        }
        repoint = GmMap3D.IntersectionTests.rayPlane(cameraPay, this.basePlanes[index], new GmMap3D.Cartesian3());
    }

    

    var re_center = GmMap3D.Cartesian3.subtract(repoint, this.dpoints.getCenter(), new GmMap3D.Cartesian3());

    var dist = -GmMap3D.Cartesian3.dot(re_center,verc);

    //console.log(dist);
    if(dist>=0){
        if(dist>this._modelRadius){ dist = this._modelRadius;}
    }else{
        if(Math.abs(dist)>this._modelRadius){dist = -this._modelRadius;}
    }
    
    return dist;
}


ZMAPCARVEUP.prototype.addMoveHander = function(){
    var _this = this;
    this.Handler.setInputAction(function(movement) {
        var pickedObject = _this.nativeScene.pick(movement.position);
        if (GmMap3D.defined(pickedObject) &&
        GmMap3D.defined(pickedObject.id) &&
        GmMap3D.defined(pickedObject.id._plane)) {
            _this.changeCavPlaneColor();
            var planeid = pickedObject.id._id;
            if(planeid =="planex"){_this.dtarget._targetx._targetflag = true;}
            if(planeid =="planexf"){_this.dtarget._targetxf._targetflag = true;}
            if(planeid =="planey"){_this.dtarget._targety._targetflag = true;}
            if(planeid =="planeyf"){_this.dtarget._targetyf._targetflag = true;}
            if(planeid =="planez"){_this.dtarget._targetz._targetflag = true;}
            if(planeid =="planezf"){_this.dtarget._targetzf._targetflag = true;}
            _this.selectedPlane = pickedObject.id._plane;
            _this.selectedPlane.material = GmMap3D.Color.WHITE.withAlpha(0.01);
            _this.selectedPlane.outlineColor = GmMap3D.Color.WHITE;
            _this.viewer.scene.screenSpaceCameraController.enableInputs = false;
        }
    }, GmMap3D.ScreenSpaceEventType.LEFT_DOWN);

    this.Handler.setInputAction(function() {
        if (GmMap3D.defined(_this.selectedPlane)) {
            _this.selectedPlane.material = GmMap3D.Color.WHITE.withAlpha(0.1);
            _this.selectedPlane.outlineColor = GmMap3D.Color.WHITE;
            _this.selectedPlane = undefined;
            _this.dtarget._targetx._targetflag = false;
            _this.dtarget._targetxf._targetflag = false;
            _this.dtarget._targety._targetflag = false;
            _this.dtarget._targetyf._targetflag = false;
            _this.dtarget._targetz._targetflag = false;
            _this.dtarget._targetzf._targetflag = false;
            
        }
        _this.changeCavPlaneColor();
        _this.viewer.scene.screenSpaceCameraController.enableInputs = true;
    }, GmMap3D.ScreenSpaceEventType.LEFT_UP);

    this.Handler.setInputAction(function(movement) {
        if (GmMap3D.defined(_this.selectedPlane)) {
            var dis = 0;
            if(_this.dtarget._targetx._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.x,"x");
                _this.computeRdistance("x",dis);
            };
            if( _this.dtarget._targetxf._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.xf,"xf");
                _this.computeRdistance("xf",dis);
            };
            if( _this.dtarget._targety._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.y,"y");
                _this.computeRdistance("y",dis);
            };
            if( _this.dtarget._targetyf._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.yf,"yf");
                _this.computeRdistance("yf",dis);
            };
            if(_this.dtarget._targetz._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.z,"z");
                _this.computeRdistance("z",dis);
            };
            if( _this.dtarget._targetzf._targetflag){
                dis = _this.computeDistance(movement.endPosition,_this.basevector.zf,"zf");
                _this.computeRdistance("zf",dis);
            };
        }else{
            var pickedObject = _this.nativeScene.pick(movement.endPosition);
            if (GmMap3D.defined(pickedObject) &&GmMap3D.defined(pickedObject.id) &&GmMap3D.defined(pickedObject.id._plane)) {
                _this.changeCavPlaneColor(pickedObject.id._plane);
            }
        }
    }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);
}

ZMAPCARVEUP.prototype.changeCavPlaneColor = function(plane){

    for(var i=0;i<this._clippingId.length;i++){
        var modelEntity = this.map3dTool.GetModel(this._clippingId[i]);
        modelEntity.plane.material = GmMap3D.Color.WHITE.withAlpha(0.1);
    };

    if(plane){
        plane.material = GmMap3D.Color.RED.withAlpha(0.5);
    }
}


ZMAPCARVEUP.prototype.computeRdistance = function(axis,disc){

    if(axis=="x"){
        this.dtarget._targetx._targetDis = disc;
        var xdisc = this.dtarget._targetx._targetDis;
        var xfdisc = this.dtarget._targetxf._targetDis;
        if(xdisc>0){
            if(xfdisc<=0){
                if(Math.abs(xdisc)<=Math.abs(xfdisc)){
                    this.dtarget._targetxf._targetDis = -xdisc;
                }
            }
        }else{
            if(Math.abs(xfdisc)<=Math.abs(xdisc)){
                this.dtarget._targetxf._targetDis = -xdisc;
            }
        }
    }

    if(axis=="xf"){
        this.dtarget._targetxf._targetDis = disc;
        var xdisc = this.dtarget._targetx._targetDis;
        var xfdisc = this.dtarget._targetxf._targetDis;
        if(xfdisc>0){
            if(xdisc<=0){
                if(Math.abs(xfdisc)<=Math.abs(xdisc)){
                    this.dtarget._targetx._targetDis = -xfdisc;
                }
            }
        }else{
            if(Math.abs(xdisc)<=Math.abs(xfdisc)){
                this.dtarget._targetx._targetDis = -xfdisc;
            }
        }
    }

    if(axis=="y"){
        this.dtarget._targety._targetDis = disc;
        var ydisc = this.dtarget._targety._targetDis;
        var yfdisc = this.dtarget._targetyf._targetDis;
        if(ydisc>0){
            if(yfdisc<=0){
                if(Math.abs(ydisc)<=Math.abs(yfdisc)){
                    this.dtarget._targetyf._targetDis = -ydisc;
                }
            }
        }else{
            if(Math.abs(yfdisc)<=Math.abs(ydisc)){
                this.dtarget._targetyf._targetDis = -ydisc;
            }
        }
    }

    if(axis=="yf"){
        this.dtarget._targetyf._targetDis = disc;
        var ydisc = this.dtarget._targety._targetDis;
        var yfdisc = this.dtarget._targetyf._targetDis;
        if(yfdisc>0){
            if(ydisc<=0){
                if(Math.abs(yfdisc)<=Math.abs(ydisc)){
                    this.dtarget._targety._targetDis = -yfdisc;
                }
            }
        }else{
            if(Math.abs(ydisc)<=Math.abs(yfdisc)){
                this.dtarget._targety._targetDis = -yfdisc;
            }
        }
    }

    if(axis=="z"){
        this.dtarget._targetz._targetDis = disc;
        var zdisc = this.dtarget._targetz._targetDis;
        var zfdisc = this.dtarget._targetzf._targetDis;
        if(zdisc>0){
            if(yfdisc<=0){
                if(Math.abs(zdisc)<=Math.abs(zfdisc)){
                    this.dtarget._targetzf._targetDis = -zdisc;
                }
            }
        }else{
            if(Math.abs(zfdisc)<=Math.abs(zdisc)){
                this.dtarget._targetzf._targetDis = -zdisc;
            }
        }
    }

    if(axis=="zf"){
        this.dtarget._targetzf._targetDis = disc;
        var zdisc = this.dtarget._targetz._targetDis;
        var zfdisc = this.dtarget._targetzf._targetDis;
        if(zfdisc>0){
            if(zdisc<=0){
                if(Math.abs(zfdisc)<=Math.abs(zdisc)){
                    this.dtarget._targetz._targetDis = -zfdisc;
                }
            }
        }else{
            if(Math.abs(zdisc)<=Math.abs(zfdisc)){
                this.dtarget._targetz._targetDis = -zfdisc;
            }
        }
    }

}

ZMAPCARVEUP.prototype.carverModel = function(modelEntity,axisNum){
    
    var flag = this.judge(modelEntity);
    if(!flag){
        return "需要切割的物体不存在！"
    }
    this._modelFlag = false;

    this.getModelBorder();//包围盒中心和半径

    //this.getModelBoxPoints();//包围盒面中心点和顶点

    var cps = this.createBasePlanes(axisNum);//构建切面

    if(!cps){
        return "需要生成的切面不存在！"
    }

    this._clippingPlanes = new GmMap3D.ClippingPlaneCollection({
        planes : cps,
        edgeWidth :1.0,
        unionClippingRegions:true
    });
    this._model._model.clippingPlanes = this._clippingPlanes;

    this.initCarvePlane();
    
}

ZMAPCARVEUP.prototype.carveUpTiles = function(tilesEntity,axisNum){
    var flag = this.judge(tilesEntity);
    if(!flag){
        return "需要切割的物体不存在！"
    }
    this._modelFlag = true;

    this.getModelBorder();//包围盒中心和半径
    
    //this.getModelBoxPoints();//包围盒面中心点和顶点

    var cps = this.createBasePlanes(axisNum);//构建切面

    if(!cps){
        return "需要生成的切面不存在！"
    }

    this._clippingPlanes = new GmMap3D.ClippingPlaneCollection({
        planes : cps,
        edgeWidth :1.0,
        unionClippingRegions:true
    });
    this._model.clippingPlanes = this._clippingPlanes;

    this.initCarvePlane();
}

ZMAPCARVEUP.prototype.initCarvePlane = function(){
    var leng = this._modelRadius*2;
    //将绘制的裁剪平面绘制到场景中
    var mposition = this.dpoints.getCenter();
    for (var i = 0; i < this._clippingPlanes.length; ++i) {

        var cplane = this._clippingPlanes.get(i);

        var callback = null;var planeId = this._clippingId[i];

        if(planeId=="planex"){callback = this.createPlaneUpdateFunctionx(cplane, GmMap3D.Matrix4.IDENTITY);}
        if(planeId=="planexf"){callback = this.createPlaneUpdateFunctionxf(cplane, GmMap3D.Matrix4.IDENTITY);}
        if(planeId=="planey"){callback = this.createPlaneUpdateFunctiony(cplane, GmMap3D.Matrix4.IDENTITY);}
        if(planeId=="planeyf"){callback = this.createPlaneUpdateFunctionyf(cplane, GmMap3D.Matrix4.IDENTITY);}
        if(planeId=="planez"){callback = this.createPlaneUpdateFunctionz(cplane, GmMap3D.Matrix4.IDENTITY);}
        if(planeId=="planezf"){callback = this.createPlaneUpdateFunctionzf(cplane, GmMap3D.Matrix4.IDENTITY);}

        var planeEntity = this.viewer.entities.add({
                id : planeId,
                position : mposition,
                plane : {
                        dimensions : new GmMap3D.Cartesian2(leng,leng),
                        material :  GmMap3D.Color.WHITE.withAlpha(0.1),
                        plane : new GmMap3D.CallbackProperty(callback, false),
                        outline : true,
                        outlineColor : GmMap3D.Color.WHITE
                    }
        });
        this._planeEntities.push(planeEntity);
    }

    this.addMoveHander();
}


ZMAPCARVEUP.prototype.repeatePlane = function (){

    if(this._model){
        if(this._modelRadius){
            this.dtarget._targetx._targetflag=false;
            this.dtarget._targetx._targetDis=this._modelRadius;
            this.dtarget._targetxf._targetflag=false;
            this.dtarget._targetxf._targetDis=this._modelRadius;
            this.dtarget._targety._targetflag=false;
            this.dtarget._targety._targetDis=this._modelRadius;
            this.dtarget._targetyf._targetflag=false;
            this.dtarget._targetyf._targetDis=this._modelRadius;
            this.dtarget._targetz._targetflag=false;
            this.dtarget._targetzf._targetDis=this._modelRadius;
        }
    }
}




var _distance  = function(){

}

_distance.prototype._targetx = {
    _targetflag : false,
    _targetDis : 0.0,
}

_distance.prototype._targetxf = {

    _targetflag : false,
    _targetDis  : 0.0,
}

_distance.prototype._targety = {
    _targetflag : false,
    _targetDis  : 0.0,
}

_distance.prototype._targetyf = {
    _targetflag : false,
    _targetDis  : 0.0,
}

_distance.prototype._targetz = {
    _targetflag : false,
    _targetDis  : 0.0,
}

_distance.prototype._targetzf = {
    _targetflag : false,
    _targetDis  : 0.0,
}


var _points = function(){
    
};


_points.prototype.center;_points.prototype.xmps;
_points.prototype.xfmps;_points.prototype.ymps;
_points.prototype.yfmps;_points.prototype.zmps;
_points.prototype.zfmps;_points.prototype.onep;
_points.prototype.twop;_points.prototype.thrp;
_points.prototype.foup;_points.prototype.fivp;
_points.prototype.sixp;_points.prototype.sevp;
_points.prototype.eigp;

_points.prototype.getCenter = function(){

    return this.center;
};

_points.prototype.setCenter = function(c3){

    this.center = c3;
}

_points.prototype.getXmps = function (){

    return this.xmps;
};

_points.prototype.setXmps = function (c3){

    this.xmps = c3;
};

_points.prototype.getXfmps = function(){

    return this.xfmps;
};

_points.prototype.setXfmps = function(c3){

    this.xfmps = c3;
};

_points.prototype.getYmps = function(){

    return this.ymps
}

_points.prototype.setYmps = function(c3){

    this.ymps = c3;
}

_points.prototype.getYfmps = function(){

    return this.yfmps;
}

_points.prototype.setYfmps = function(c3){
    
        this.yfmps = c3;
}

_points.prototype.getZmps = function(){

    return this.zmps;
};

_points.prototype.setZmps = function(c3){

    this.zmps = c3;
}

_points.prototype.getZfmps = function(){

    return this.zfmps;
}

_points.prototype.setZfmps = function(c3){

    this.zfmps = c3;
}

_points.prototype.getOnep = function(){
    
    return this.onep;
}

_points.prototype.setOnep = function(c3){

    this.onep = c3;
}

_points.prototype.getTwop = function(){

    return this.twop;
}

_points.prototype.setTwop = function(c3){

    this.twop = c3;
}

_points.prototype.getThrp = function(){

    return this.thrp;
}

_points.prototype.setThrp = function(c3){

    this.thrp = c3;
}

_points.prototype.getFoup = function(){

    return this.foup;
}

_points.prototype.setFoup = function(c3){

    this.foup = c3;
}

_points.prototype.getFivp = function(){

    return this.fivp;
}

_points.prototype.setFivp = function(c3){

    this.fivp = c3;
}

_points.prototype.getSixp = function(){

    return this.sixp;
}

_points.prototype.setSixp = function(c3){

    this.sixp = c3;
}

_points.prototype.getSevp = function(){

    return this.sevp;
}

_points.prototype.setSevp = function(c3){

    this.sevp = c3;
}

_points.prototype.getEigp = function(){

    return this.eigp;
}

_points.prototype.setEigp = function(c3){

    this.eigp = c3;
}
