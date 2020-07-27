var SHLOOKMODEL = function(map3DView){
    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.dviewer = map3DView.GetCegore();
}

SHLOOKMODEL.prototype.calculateToEastangle = function(pointA,pointB){
    var picth = this.calculateToEastanglep(pointA,pointB);
    var hear = this.calculateToEastangleh(pointA,pointB);
    return [hear,picth];
}

SHLOOKMODEL.prototype.calculateToEastanglep = function(pointA,pointB){
        
    var spo  = this.map3dTool.JWcoordToC3(pointA);
    var epo = this.map3dTool.JWcoordToC3(pointB);
    
    //求俯仰角
    var pointz = this.getEastPointFromPoint(spo,0,GmMap3D.Math.toRadians(-90),10);
    var normalVectorz = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(pointz,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
    var normalVectorp = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(epo,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());

    var numdu = GmMap3D.Cartesian3.dot(normalVectorz,normalVectorp);
    var picth = GmMap3D.Math.toDegrees(Math.acos(numdu))-90;

    return picth;
}

SHLOOKMODEL.prototype.calculateToEastangleh = function(pointA,pointB){
    //求航向角
    var spoint = [];
    var endpoint =[];
    spoint.push(pointA[0]);spoint.push(pointA[1]);spoint.push(pointA[2]);
    endpoint.push(pointB[0]);endpoint.push(pointB[1]);endpoint.push(pointA[2]);

    var spo = this.map3dTool.JWcoordToC3(spoint);
    var epo = this.map3dTool.JWcoordToC3(endpoint);
    var pointxz = this.getEastPointFromPoint(spo,0,0,10);
    var pointyf = this.getEastPointFromPoint(spo,GmMap3D.Math.toRadians(90),0,10);
    var pointyz = this.getEastPointFromPoint(spo,GmMap3D.Math.toRadians(-90),0,10);

    var subc3 = GmMap3D.Cartesian3.subtract(epo,spo,new GmMap3D.Cartesian3());
    var hear = 0;
    if(subc3.x==0&&subc3.y==0&&subc3.z==0){
        hear = 0;
    }else{
        var normalVectorp = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(epo,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        
        var normalVectoryf = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(pointyf,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var numdyf = GmMap3D.Cartesian3.dot(normalVectoryf,normalVectorp);
        var hearyf = GmMap3D.Math.toDegrees(Math.acos(numdyf));

        var normalVectoryz = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(pointyz,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var numdyz = GmMap3D.Cartesian3.dot(normalVectoryz,normalVectorp);
        var hearyz = GmMap3D.Math.toDegrees(Math.acos(numdyz));

        var normalVectorxz = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(pointxz,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var numdxz = GmMap3D.Cartesian3.dot(normalVectorxz,normalVectorp);
        var hearxz = GmMap3D.Math.toDegrees(Math.acos(numdxz));

        if(hearyz>=hearyf){
            hear = hearxz;
        }else{
            hear = -hearxz;
        }
    }
    return hear
}

SHLOOKMODEL.prototype.getEastPointFromPoint = function(point,heading,pitch,sideOffset){

    var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
    var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(point, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
    var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
    return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
}

// SHLOOKMODEL.prototype.dfFixedFrame = function(point,heading,pitch,sideOffset){
    
//     var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
//     var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(point, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
//     var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
//     return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
// }


SHLOOKMODEL.prototype.lookModel = function(modelEntity,options,pointA,pointB){
    
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

    var extraangle = this.calculateToEastangle(pointA,pointB);
  
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
        viewingAngle = extraangle;
        viewDis = modelradius*50;
    }else {
        var viewingAngle = options.viewingAngle;
        var viewDis = options.viewDis;
        if(!viewingAngle){
            viewingAngle =extraangle;
        }else{
            //var picthm = extraangle[1]*Math.cos(viewingAngle[0])+viewingAngle[1];
            var picthm =viewingAngle[1];
            var headingm = extraangle[0]+viewingAngle[0];
            viewingAngle = [headingm,picthm];
        }
        if(!viewDis){
            viewDis = modelradius*50;
        }
    }
  
    var modelMid = modelEntity._position._value;
  
    var camepo = this.getEastPointFromPoint(modelMid,GmMap3D.Math.toRadians(viewingAngle[0]),GmMap3D.Math.toRadians(viewingAngle[1]),viewDis);
  
    var jwdcamepo = this.map3dTool.cartesianTo2MapCoord(camepo);
  
    cpositon1 = GmMap3D.Cartographic.fromCartesian(camepo);
    cpositon2 = GmMap3D.Cartographic.fromCartesian(modelMid);
    this.dviewer.camera.lookAtFromTo(cpositon1,cpositon2);
    this.viewer.trackedEntity = null;
  
    var camepojw =  this.map3dTool.cartesianTo2MapCoord(camepo);
    var modeljs =  this.map3dTool.cartesianTo2MapCoord(modelMid);
    return [camepojw,modeljs];
}
