var APPWZARD = function(map3DView,modelEntityArray,isPartModel){

    this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);
    this.dissectTool = map3DView;
    this.viewer = map3DView.GetView();
    this._boundBoxPoint = [];//包围盒的八个顶点
    this._midPlanePoins = [];//中心点所在平面的四个点
    this._boundBoxlanlat = [];
    this._sideOffset = 0;
    this._midpoint = null;
    this._ballRadius = 0;
    this._height = 0;
    this._createWallPointc3 = [];//存储c3坐标
    this._createWallPoint = [];//存储经纬度坐标
    this._existFlag = false;//该对象是否已经初始化
    

    function initParam(modelEntityArray,_this){
        if(!modelEntityArray||modelEntityArray.length<0){
            console.log("没有实体");
            return;
        }
        var xmax = 0,
            xmin = 0,
            ymax = 0,
            ymin = 0,
            zmax = 0,
            zmin = 0,
            radiusMax = 0
        var allprimitives =  _this.viewer.scene.primitives._primitives;
        var delpriEntity = [];
        for(var i=0 ; i< allprimitives.length ; i++){
            var primi = allprimitives[i];
            if(primi.id){
                for(var j=0 ;j<modelEntityArray.length;j++){
                    var entityId = modelEntityArray[j]._id;
                    if(primi.id._id === entityId){
                        delpriEntity.push(primi);
                        break;
                    }
                }
            }
        };
    
        for(var z=0 ;z<delpriEntity.length;z++){
            if(delpriEntity[z]._scaledBoundingSphere.radius>=_this._ballRadius){
                var center = delpriEntity[z]._scaledBoundingSphere.center;
                var radius = delpriEntity[z]._scaledBoundingSphere.radius
                xmax = Math.max(xmax,center.x)
                ymax = Math.max(ymax,center.y)
                zmax = Math.max(zmax,center.z)
                xmin = Math.min(xmin,center.x)
                ymin = Math.min(ymin,center.y)
                zmin = Math.min(zmin,center.z)
                radiusMax = Math.max(radiusMax,radius)
                _this._ballRadius = radius;
            }
        }

        //console.info(xmax,ymax,zmax,xmin,ymin,zmin,radius)
        //这里对分段加载的模型进行特殊处理
        if(isPartModel){
            var center = modelEntityArray[0].position._value
            var minPoint = new Cesium.Cartesian3(
                center.x-xmax-radiusMax,
                center.y-ymax-radiusMax,
                center.z-zmax-radiusMax,
                ),
                maxPoint = new Cesium.Cartesian3(
                    center.x+xmax+radiusMax,
                    center.y+ymax+radiusMax,
                    center.z+zmax+radiusMax,
                )
            _this._ballRadius = Cesium.Cartesian3.distance(maxPoint,minPoint)/2
        }

        _this._midpoint = modelEntityArray[0]._position._value;
        _this._height = _this.dissectTool.cartesianTo2MapCoord(_this._midpoint)[2];
        _this._sideOffset = Math.sqrt(3)* _this._ballRadius;
    
        var headingArray = [GmMap3D.Math.toRadians(-135),GmMap3D.Math.toRadians(-45),GmMap3D.Math.toRadians(45),GmMap3D.Math.toRadians(135)];
        var pitcharray = [-Math.asin(Math.sqrt(3)/3),Math.asin(Math.sqrt(3)/3)];
        this._boundBoxPoint = [];
        for(var i=0 ;i<8;i++){
            var hindex = i%4;
            var pindex = parseInt(i/4);
            _this._boundBoxPoint.push(_this.deviationCalculate(_this._midpoint,headingArray[hindex],pitcharray[pindex],_this._sideOffset));
        }
        _this._midPlanePoins = [];
        for(var i=0 ;i<4;i++){
            _this._midPlanePoins.push(_this.deviationCalculate(_this._midpoint,headingArray[i],0,Math.sqrt(2)*_this._ballRadius));
        }
    
        _this._existFlag = true;
        
    }

    initParam(modelEntityArray,this);
};

APPWZARD.prototype.deviationCalculate = function(po,heading,pitch,sideOffset){
    
    var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
    var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(po, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
    var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
    return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
};
APPWZARD.prototype.boundingBox = function(options){
    if(!this._existFlag){
        console.log("模型包围盒没有实例化")
        return;
    }
    var boundingBoxEntity = this.viewer.entities.add({
        id:options.id,
        name : options.name ? options.name : options.id,
        position: this._midpoint,
        show : true,
        box : {
            dimensions : new GmMap3D.Cartesian3(this._ballRadius*2,this._ballRadius*2,this._ballRadius*2),
            material : options.dcolor ? this.dissectTool.colorTransform(options.dcolor) :GmMap3D.Color.RED.withAlpha(0.3),
            fill : options.dfill ? options.dfill : true,
            outline : options.doutline ? options.doutline : true,
            outlineColor : options.doutlineColor ? this.dissectTool.colorTransform(options.doutlineColor) : GmMap3D.Color.BLACK.withAlpha(0.1),
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1
        }
    });
    return boundingBoxEntity;
};
APPWZARD.prototype.coordinateSystem = function(options){
    if(!this._existFlag){
        console.log("模型包围盒没有实例化")
        return;
    }
    var lineArray = [];
    for(var i=0 ;i<options.length;i++){
        var sindex = null;
        var eindex = null;
        if(i===0){sindex=0;eindex=1};
        if(i===1){sindex=0;eindex=3};
        if(i===2){sindex=0;eindex=4}
        var lineoption = options[i];
        var lineEn = this.viewer.entities.add({
            id : lineoption.id,
            name : lineoption.name ? lineoption.name : lineoption.id,
            polyline : {
                positions : [this._boundBoxPoint[sindex],this._boundBoxPoint[eindex]],
                width : lineoption.dwidth ? lineoption.dwidth : 3,
                material : lineoption.dcolor ? this.dissectTool.colorTransform(lineoption.dcolor) : GmMap3D.Color.PURPLE
            }
        })
    }
    
};
APPWZARD.prototype.boundingBall = function(options){
    
    if(!this._existFlag){
        console.log("模型包围盒没有实例化")
        return;
    }
    var ballEntity = this.viewer.entities.add({
            id:options.id,
            name : options.name ? options.name : options.id,
            position: this._midpoint,
            show : true,
            ellipsoid : {
                radii : new GmMap3D.Cartesian3(this._ballRadius,this._ballRadius,this._ballRadius),
                material : options.dcolor ? this.dissectTool.colorTransform(options.dcolor) :GmMap3D.Color.RED.withAlpha(0.1),
                fill : options.dfill ? options.dfill : true,
                outline : options.doutline ? options.doutline : true,
                outlineColor : options.doutlineColor ? this.dissectTool.colorTransform(options.doutlineColor) : GmMap3D.Color.BLACK.withAlpha(0.5),
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1
            }
    });

    return ballEntity;
};

APPWZARD.prototype.createProfilePlane = function(options){
    
    if(!this._existFlag){
        console.log("模型包围盒没有实例化")
        return;
    }
    var offsetCoordinate = options.doffsetCoordinate;
    var offsetSize = options.doffsetSize;
    var xyzplane = options.dparallelPlane;

    var needParam = {};
    var roffsetSize = 0;
    if(offsetSize){
        roffsetSize = Number(offsetSize);
    }
    if(roffsetSize>this._ballRadius){
        return null;
    }
    var needpoint = null;
    var oflength = null;//this._ballRadius*2+roffsetSize;
    var ofwidth = null;//this._ballRadius*2+roffsetSize;
    if(offsetCoordinate==="-x" || offsetCoordinate==="-X"){
        var her = GmMap3D.Math.toRadians(-90)
        needpoint = this.deviationCalculate(this._midpoint,her,0,roffsetSize);
        oflength = this._ballRadius*2;
        ofwidth = this._ballRadius*2;
    }else if(offsetCoordinate==="x" || offsetCoordinate==="X"){
        var her = GmMap3D.Math.toRadians(90)
        needpoint = this.deviationCalculate(this._midpoint,her,0,roffsetSize);
        oflength = this._ballRadius*2;
        ofwidth = this._ballRadius*2;
    }else if(offsetCoordinate==="-y" || offsetCoordinate==="-Y"){
        var her = GmMap3D.Math.toRadians(180)
        needpoint = this.deviationCalculate(this._midpoint,her,0,roffsetSize);
        oflength = this._ballRadius*2;
        ofwidth = this._ballRadius*2;
    }else if(offsetCoordinate==="y" || offsetCoordinate==="Y"){
        needpoint = this.deviationCalculate(this._midpoint,0,0,roffsetSize);
        oflength = this._ballRadius*2;
        ofwidth = this._ballRadius*2;
    }else if(offsetCoordinate==="-z" || offsetCoordinate==="-Z"){
        var pic = GmMap3D.Math.toRadians(-90)
        needpoint = this.deviationCalculate(this._midpoint,0,pic,roffsetSize);
        oflength = this._ballRadius*2+roffsetSize;
        ofwidth = this._ballRadius*2+roffsetSize;
    }else if(offsetCoordinate==="z" || offsetCoordinate==="Z"){
        var pic = GmMap3D.Math.toRadians(90)
        needpoint = this.deviationCalculate(this._midpoint,0,pic,roffsetSize);
        oflength = this._ballRadius*2+roffsetSize;
        ofwidth = this._ballRadius*2+roffsetSize;
    }else{
        needpoint = this._midpoint;
        oflength = this._ballRadius*2;
        ofwidth = this._ballRadius*2;
    }

    needParam.offsetPoint = needpoint;

    var rplane = null;
    if(xyzplane==="x" || xyzplane==="X"){
        rplane =  new GmMap3D.Plane(GmMap3D.Cartesian3.UNIT_Y, 0.0);
    }else if(xyzplane==="y" || xyzplane==="Y"){
        rplane =  new GmMap3D.Plane(GmMap3D.Cartesian3.UNIT_X, 0.0);
    }else if(xyzplane==="z" || xyzplane==="Z"){
        rplane =  new GmMap3D.Plane(GmMap3D.Cartesian3.UNIT_Z, 0.0);
    }else{
        rplane =  new GmMap3D.Plane(GmMap3D.Cartesian3.UNIT_Z, 0.0);
    }
    needParam.length = oflength;
    needParam.width = ofwidth;
    needParam.plane = rplane;
    return needParam;
};

APPWZARD.prototype.drawplane = function(options,callback){
    if(!this._existFlag){
        console.log("模型包围盒没有实例化")
        return;
    }
    var _this = this;
    function drawStart(e){
    
    }

    function drawEnd(e){
        var pts = e.geometry;
        if (pts)
        {
            //判断是否所有的点都不在包围球内
            var drawpointc3 = [];
            for(var j=0 ;j<pts.length; j++){
                var dc3 = _this.cartographicToc3(pts[j]);
                drawpointc3.push(dc3);
            };
          
            var flag = false;
            for(var k=0 ;k<drawpointc3.length ;k++){
                var rflag = _this.calculateDistance(_this._midpoint,drawpointc3[k]);
                if(rflag){
                    flag = true;
                    break;
                }
            }
            if(!flag){
                console.log("点都在包围盒外")
                return ;
            }
            _this.produceWall(drawpointc3,options,callback);
        }
    }
    this.map3DTool._returnZ = true
    this.map3DTool.StartLineTool(drawStart, drawEnd);
};

APPWZARD.prototype.cartographicToc3 = function(pos){
    var lon = pos[0];
    var lat = pos[1];
    var hei = pos[2] ? pos[2] : 0;

    var ellipsoid=this.viewer.scene.globe.ellipsoid;
    var cartographic=GmMap3D.Cartographic.fromDegrees(lon,lat,hei);
    var cartesian3=ellipsoid.cartographicToCartesian(cartographic)
    return cartesian3;
};

APPWZARD.prototype.calculateDistance = function(poss,pose){
    var len = GmMap3D.Cartesian3.distance(poss, pose);
    if(Math.sqrt(len) > this._ballRadius){
        return false;
    }else {
        return true;
    }
};

APPWZARD.prototype.produceWall = function(points,options,callback){

    var ultimatelyPoints = [];
    this._createWallPoint = [];
    this._createWallPointc3 = [];
    for(var j=0 ;j<points.length;j++){
        var jwd = this.dissectTool.cartesianTo2MapCoord(points[j]);
        var proc3 = this.dissectTool.JWcoordToC3([jwd[0],jwd[1],this._height]);
        ultimatelyPoints.push(proc3);
    }

    //计算开始点和结束点是否在包围盒内
    var spo = ultimatelyPoints[0];
    var rspo = null;
    var epo = ultimatelyPoints[ultimatelyPoints.length-1];
    var repo = null;
    var sflag = this.calculateDistance(spo,this._midpoint);
    if(sflag){
        var muc3 = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(spo,ultimatelyPoints[1],new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var scmuc3 = GmMap3D.Cartesian3.multiplyByScalar(muc3,this._ballRadius*2,new GmMap3D.Cartesian3());
        var rspo = GmMap3D.Cartesian3.add(spo,scmuc3,new GmMap3D.Cartesian3());
        this._createWallPointc3.push(rspo);
    }
    var eflag = this.calculateDistance(spo,this._midpoint);
    if(eflag){
        var muc3 = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(epo,ultimatelyPoints[ultimatelyPoints.length-2],new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var ecmuc3 = GmMap3D.Cartesian3.multiplyByScalar(muc3,this._ballRadius*2,new GmMap3D.Cartesian3());
        var repo = GmMap3D.Cartesian3.add(epo,ecmuc3,new GmMap3D.Cartesian3());
    }

    for(var l=0 ;l<ultimatelyPoints.length;l++){
        this._createWallPointc3.push(ultimatelyPoints[l]);
        
    }

    if(repo){
        this._createWallPointc3.push(repo); 
    }

    for(var l=0 ;l<this._createWallPointc3.length;l++){
       
        var jwd = this.dissectTool.cartesianTo2MapCoord(this._createWallPointc3[l]);
        this._createWallPoint.push([jwd[0],jwd[1]]);
    }
    
    this.crateWall(options,callback);

}


APPWZARD.prototype.crateWall = function(options,callback){

    var position = [];
    var dmaximumHeights = [];
    var dminimumHeights = [];
    var fmaximumHeight = options.fmaximumHeight ?  options.fmaximumHeight : this._ballRadius+this._height;
    var fminimumHeight = options.fminimumHeight ? options.fminimumHeight : this._ballRadius-this._height;
    for(var k=0 ;k<this._createWallPoint.length ;k++){
        position.push(this._createWallPoint[k][0]);
        position.push(this._createWallPoint[k][1]);
        dmaximumHeights.push(fmaximumHeight);
        dminimumHeights.push(-fminimumHeight);
    }
    var dwall = this.viewer.entities.add({
        id : options.id,
        name : options.name ? options.name : options.id,
        wall : {
            positions: GmMap3D.Cartesian3.fromDegreesArray(position),
            maximumHeights :dmaximumHeights,
            minimumHeights :dminimumHeights,
            material : options.dcolor ? this.dissectTool.colorTransform(options.dcolor) : GmMap3D.Color.BLUE.withAlpha(0.5),
            outline : false
        }
    });

    if(typeof callback =='function')
    {
        callback(dwall);
    }
};







