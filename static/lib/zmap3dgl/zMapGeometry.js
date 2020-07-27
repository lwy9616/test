var ZMAPGEOMETRY = function(map3DView){
    
    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.gifImage ={};
}

//获取model对象
ZMAPGEOMETRY.prototype.getModel = function(modelId){
    
    if(modelId == undefined || modelId == ""){
        return null;
    };
    var entity =  this.viewer.entities.getById(modelId);
    if(!entity || entity == undefined || entity == null){
        entity = null
    }
    return entity;
}


//根据id获取model对象
ZMAPGEOMETRY.prototype.getEntity = function(entityId){
    
    if(entityId == undefined || entityId == ""){
        return null;
    };
    var entity = this.viewer.entities.getById(entityId);
    if(!entity || entity == undefined || entity == null){
        entity = null
    }
    return entity;
}

//移除Entity对象
ZMAPGEOMETRY.prototype.removeEntity = function(entity){
    
    if(!entity ||entity == undefined || entity == ""){
        return " The model doesn't exist  ";
    };

    var existFlag =this.viewer.entities.contains(entity);
    if(!existFlag){
        return " The entity is useless ";
    };

    return this.removeEntityById(entity._id);
}

//通过id移除model对象
ZMAPGEOMETRY.prototype.removeEntityById = function(entityid){
    
    if(!entityid || entityid == undefined || entityid == ""){
        return " The modelId doesn't exist  ";
    };

    var oldEntity = this.getModel(entityid);

    if(!oldEntity ||oldEntity == undefined || oldEntity == ""){
        return " The model doesn't exist  ";
    };

    var stateFlag  = this.viewer.entities.removeById(entityid);
    return stateFlag;
}

//移除所有的实体对象
ZMAPGEOMETRY.prototype.removeAll = function(){
    
   this.viewer.entities.removeAll();
}

//显示实体对象
ZMAPGEOMETRY.prototype.showEntity = function(entity){
    var existFlag =this.viewer.entities.contains(entity);
    if(!existFlag){
        return " The entity is useless ";
    };
    entity.show = true;
}

//隐藏实体对象
ZMAPGEOMETRY.prototype.unshowEntity = function(entity){
    var existFlag =this.viewer.entities.contains(entity);
    if(!existFlag){
        return " The entity is useless ";
    };
    entity.show = false;
}

//根据经纬度地图添加单点
ZMAPGEOMETRY.prototype.addPoint = function(options,isFlyto){

    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

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

    var definedPointEntity  =this.viewer.entities.add({
        id: options.id ,
        name: options.name||options.id,
        position: _position,
        show:options.show==undefined?true:options.show,
        point: {
            color : options.dcolor ? this.map3dTool.colorTransform(options.dcolor) : GmMap3D.Color.WHITE,
            pixelSize :	 options.dpixelSize ? options.dpixelSize : 1.0,
            outlineColor :  options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.BLACK,
            outlineWidth :	 options.doutlineWidth ? options.doutlineWidth : 1.0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000),
            scaleByDistance : options.fscaleByDistance ? new GmMap3D.NearFarScalar(options.fscaleByDistance[0],options.fscaleByDistance[1],options.fscaleByDistance[2],options.fscaleByDistance[3]) : new GmMap3D.NearFarScalar(0.0,1.0,100000000,1.0),
            disableDepthTestDistance:options.ddisableDepthTestDistance ==undefined?0:options.ddisableDepthTestDistance
        }
    });

    if(isFlyto){
        this.viewer.camera.flyTo({
            destination : GmMap3D.Cartesian3.fromDegrees(posiArr[0], posiArr[1], posiArr[2]+1000)
        });
    }

    return definedPointEntity;
}

//根据经纬度地图添加多点
ZMAPGEOMETRY.prototype.addPoints = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length==0){
        return " please provide points ";
    }

    var entitys = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        var _position = GmMap3D.Cartesian3.fromDegrees(pos[0], pos[1], pos[2]);
        
        var definedPointEntity  =this.viewer.entities.add({
            id: options.id+i,
            name: options.name||options.id,
            position: _position,
            show:options.show==undefined?true:options.show,
            point: {
                color : options.dcolor ? this.map3dTool.colorTransform(options.dcolor) : GmMap3D.Color.WHITE,
                pixelSize :	 options.dpixelSize ? options.dpixelSize : 1.0,
                outlineColor :  options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.BLACK,
                outlineWidth :	 options.doutlineWidth ? options.doutlineWidth : 1.0,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000),
                scaleByDistance : options.fscaleByDistance ? new GmMap3D.NearFarScalar(options.fscaleByDistance[0],options.fscaleByDistance[1],options.fscaleByDistance[2],options.fscaleByDistance[3]) : new GmMap3D.NearFarScalar(0.0,1.0,100000000.0,1.0),
                disableDepthTestDistance:options.ddisableDepthTestDistance ==undefined?0:options.ddisableDepthTestDistance
            }
        });

        entitys.push(definedPointEntity);
    }
    return entitys;
}

//添加polyline
ZMAPGEOMETRY.prototype.addPolyline = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }

    var definedPolyline  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        show:options.show==undefined?true:options.show,
        polyline: {
            positions : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
            followSurface : options.dfollowSurface ? options.dfollowSurface : false,
            clampToGround : options.dclampToGround ? options.dclampToGround : false,
            width : options.dwidth ? options.dwidth : 1.0,
            material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            shadows : options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            zIndex : options.fzIndex ? options.fzIndex : 0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedPolyline;
}


//添加PolylineOutline
ZMAPGEOMETRY.prototype.addPolylineOutline = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }


    var definedPolyline  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
        show:options.show==undefined?true:options.show,
        polyline: {
            followSurface : options.dfollowSurface ? options.dfollowSurface : false,
            clampToGround : options.dclampToGround ? options.dclampToGround : false,
            width : options.dwidth ? options.dwidth : 1.0,
            material :  new Cesium.PolylineOutlineMaterialProperty({
                color : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outlineWidth : options.foutlineWidth ? options.foutlineWidth : 1.0,
                outlineColor : options.foutlineColor ? this.map3dTool.colorTransform(options.foutlineColor) : GmMap3D.Color.WHITE
            }),
            shadows : options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            zIndex : options.fzIndex ? options.fzIndex : 0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedPolyline;
}

//添加PolylineArrow
ZMAPGEOMETRY.prototype.addPolylineArrow = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }


    var definedPolylineArrow  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
        show:options.show==undefined?true:options.show,
        polyline: {
            followSurface : options.dfollowSurface ? options.dfollowSurface : false,
            clampToGround : options.dclampToGround ? options.dclampToGround : false,
            width : options.dwidth ? options.dwidth : 1.0,
            material : new Cesium.PolylineArrowMaterialProperty(options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE),
            shadows : options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            zIndex : options.fzIndex ? options.fzIndex : 0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedPolylineArrow;
}

//添加PolylineDash
ZMAPGEOMETRY.prototype.addPolylineDash = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }


    var definedPolylineDash  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
        show:options.show==undefined?true:options.show,
        polyline: {
            followSurface : options.dfollowSurface ? options.dfollowSurface : false,
            clampToGround : options.dclampToGround ? options.dclampToGround : false,
            width : options.dwidth ? options.dwidth : 1.0,
            material : new Cesium.PolylineDashMaterialProperty({
                color : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                gapColor : options.fgapColor ? this.map3dTool.colorTransform(options.fgapColor) : GmMap3D.Color.TRANSPARENT,
                dashLength : options.fdashLength ? options.fdashLength : 1.0,
                dashPattern : options.ddashPattern ? options.ddashPattern : 255
            }),
            shadows : options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            zIndex : options.fzIndex ? options.fzIndex : 0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedPolylineDash;
}

//获取model对象
ZMAPGEOMETRY.prototype.setAssistMaterial = function(options){
    
    var rematerial = null;
    var material = options;
    if(material){
        var materialname = material.materialName;
        if(materialname === "dColorMaterial"){
            rematerial = new GmMap3D.ColorMaterialProperty({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
            })
        }else if(materialname === "dGridMaterial"){
            rematerial = new GmMap3D.GridMaterialProperty ({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                cellAlpha : material.dcellAlpha ? Number(material.dcellAlpha) : 0.1,
                lineCount : material.dlineCount ? new GmMap3D.Cartesian2(Number(material.dlineCount[0]),Number(material.dlineCount[1])) : new GmMap3D.Cartesian2(8, 8),
                lineThickness : material.dlineThickness ? new GmMap3D.Cartesian2(Number(material.dlineThickness[0]),Number(material.dlineThickness[1])) : new GmMap3D.Cartesian2(1.0, 1.0),
                lineOffset : material.dlineOffset ? new GmMap3D.Cartesian2(Number(material.dlineOffset[0]),Number(material.dlineOffset[1])) : new GmMap3D.Cartesian2(0.0, 0.0)
            })
        }else if(materialname === "dImageMaterial"){
            if(material.dimage){
                rematerial = new GmMap3D.ImageMaterialProperty({
                    image : material.dimage,
                    repeat : material.drepeat ? new GmMap3D.Cartesian2(Number(material.drepeat[0]),Number(material.drepeat[1])) : new GmMap3D.Cartesian2(1.0, 1.0),
                    color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                    transparent : material.dtransparent ? material.dtransparent : false
                })
            }
        }else if(materialname === "dPolylineGlowMaterial"){
            rematerial = new GmMap3D.PolylineGlowMaterialProperty({
                glowPower : material.dglowPower ? Number(material.dglowPower) : 0.25,
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE
            })
        }else if(materialname === "dPolylineOutlineMaterial"){
            rematerial = new GmMap3D.PolylineGlowMaterialProperty({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                outlineColor :  material.doutlineColor ? this.map3dTool.colorTransform(material.doutlineColor) : GmMap3D.Color.BLACK,
                outlineWidth : material.doutlineWidth ? Number(material.doutlineWidth) : 1.0,
            })
        }
        else if(materialname === "dPolylineOutlineMaterialProperty"){
            rematerial = new Cesium.PolylineOutlineMaterialProperty({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                outlineColor :  material.doutlineColor ? this.map3dTool.colorTransform(material.doutlineColor) : GmMap3D.Color.BLACK,
                outlineWidth : material.doutlineWidth ? Number(material.doutlineWidth) : 1.0,
            })
        }
        else if(materialname === "dStripeMaterial"){

            var orotation = material.drotation ? Number(material.drotation)*180.0 / Math.PI : 0;
            rematerial = new GmMap3D.StripeMaterialProperty ({
                evenColor :  material.devenColor ? this.map3dTool.colorTransform(material.devenColor) : GmMap3D.Color.WHITE,
                oddColor  :  material.doddColor ? this.map3dTool.colorTransform(material.doddColor) : GmMap3D.Color.WHITE,
                repeat : material.drepeat ? Number(material.drepeat) : 1.0,
                offset : material.doffset ? Number(material.doffset) : 0,
                orientation : orotation
            })
        }else {
            rematerial = new GmMap3D.ColorMaterialProperty({
                color : GmMap3D.Color.WHITE,
            })
        }
    }else {
        rematerial = new GmMap3D.ColorMaterialProperty({
            color : GmMap3D.Color.WHITE,
        })
    }

    return rematerial;
}

//获取model对象
ZMAPGEOMETRY.prototype.getAssistMaterial = function(materialObject){
    
    var objstr = materialObject.constructor.name;
    var rematerial = null;
    if(objstr === "ColorMaterialProperty"){
        rematerial = {
            materialname : "dColorMaterial",
            color : materialObject.color._value,
        }
    }else if(objstr === "GridMaterialProperty"){
        rematerial = {
            materialname : "dGridMaterial",
            dcolor : materialObject.color._value,
            dcellAlpha : materialObject.cellAlpha._value,
            dlineCount :  [materialObject.lineCount._value.x,materialObject.lineCount._value.y],
            dlineThickness : [materialObject.lineThickness._value.x,materialObject.lineThickness._value.y],
            dlineOffset : [materialObject.lineOffset._value.x,materialObject.lineOffset._value.y]
        }
    }else if(objstr === "ImageMaterialProperty"){
        rematerial = {
            materialname : "dImageMaterial",
            dimage : materialObject.image._value,
            drepeat : [materialObject.repeat._value.x,materialObject.repeat._value.y],
            dcolor :  materialObject.color._value,
            dtransparent : materialObject.transparent._value
        }
    }else if(objstr ==="PolylineGlowMaterialProperty"){
        rematerial = {
            materialname : "dPolylineGlowMaterial",
            dglowPower : materialObject.glowPower._value,
            dcolor : materialObject.color._value
        }
    }else if(objstr ==="PolylineOutlineMaterialProperty"){
        rematerial = {
            materialname : "dPolylineOutlineMaterial",
            dcolor : materialObject.color._value,
            doutlineColor : materialObject.outlineColor._value,
            doutlineWidth : materialObject.outlineWidth._value,
        }
    }else if(objstr ==="StripeMaterialProperty"){
        var num = new Number(materialObject.orientation._value * Math.PI/180);
        var mrotate = num.toFixed(2);
        rematerial = {
            materialname : "dStripeMaterial",
            devenColor :  materialObject.evenColor._value,
            doddColor  :  materialObject.oddColor._value,
            drepeat : materialObject.repeat._value,
            doffset : materialObject.offset._value,
            drotation : mrotate
        }
    }else {
        rematerial = {
            materialname : "dColorMaterial",
            color : materialObject.color._value,
        }
    }
    return rematerial;
}



//添加plane
ZMAPGEOMETRY.prototype.addPlane = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position){
        return " please provide points ";
    }

    var points = options.position;

    var definedPlan  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegrees(points[0],points[1],points[2]),
        show:options.show==undefined?true:options.show,
        plane: {
            plane : options.dplan ? new GmMap3D.Plane(GmMap3D.Cartesian3.normalize(new GmMap3D.Cartesian3(options.dplan[0],options.dplan[1],options.dplan[2])),options.dplan[3]) : new GmMap3D.Plane(GmMap3D.Cartesian3.UNIT_Y, 0.0),
            dimensions : options.ddimensions ? new GmMap3D.Cartesian2(options.ddimensions[0], options.ddimensions[1]) : new Cesium.Cartesian2(400000.0, 300000.0),
            fill : options.dfill ? options.dfill : true,
            material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            outline : options.doutline ? options.doutline : false,
            outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
            shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedPlan;
}

//添加box
ZMAPGEOMETRY.prototype.addBox = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position){
        return " please provide points ";
    }

    var pos = options.position;
    var _position = GmMap3D.Cartesian3.fromDegrees(pos[0], pos[1], pos[2]);
    var definedBox  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : _position,
        orientation : modelOrientation,
        show:options.show==undefined?true:options.show,
        box: {
            dimensions : options.ddimensions ? new CesiGmMap3Dum.Cartesian3( options.ddimensions[0], options.ddimensions[1], options.ddimensions[2]) : new GmMap3D.Cartesian3(400000.0, 300000.0, 500000.0),
            fill : options.dfill ? options.dfill : true,
            material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            outline : options.doutline ? options.doutline : false,
            outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
            shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000) 
        }
    });

    return definedBox;
}


//添加corridor
ZMAPGEOMETRY.prototype.addcorridor = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
    }

    var definedcorridor  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegreesArray(points),
        show:options.show==undefined?true:options.show,
        corridor: {
            width : options.dwidth ? options.dwidth : 100000,
            cornerType :  options.dcornerType ? GmMap3D.CornerType[options.dcornerType.toUpperCase()] : GmMap3D.CornerType.MITERED,
            height : options.dheight ? options.dheight : 10000,
            extrudedHeight : options.dextrudedHeight ? options.dextrudedHeight : 10000,
            fill : options.dfill ? options.dfill : true,
            material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            outline : options.doutline ? options.doutline : false,
            outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
            shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedcorridor;
}


//添加ellipse
ZMAPGEOMETRY.prototype.addellipse = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length==0){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
    }
    var rematerial = this.setAssistMaterial(options.dmaterial)
    var definedellipse  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegrees(points[0],points[1]),
        show:options.show==undefined?true:options.show,
        ellipse: {
            semiMajorAxis : options.dsemiMajorAxis ? options.dsemiMajorAxis : 30000,
            semiMinorAxis : options.dsemiMinorAxis ? options.dsemiMinorAxis : 30000,
            height : options.dheight ? options.dheight : 10000,
            extrudedHeight : options.dextrudedHeight ? options.dextrudedHeight : 10000,
            fill : options.dfill ? options.dfill : true,
            material :rematerial,// options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            outline : options.doutline ? options.doutline : false,
            outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
            numberOfVerticalLines : options.dnumberOfVerticalLines ? options.dnumberOfVerticalLines : 16,
            shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedellipse;
}



//添加ellipsoid
ZMAPGEOMETRY.prototype.addellipsoid = function(options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length==0){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }

    var definedellipsoid  =this.viewer.entities.add({
        id: options.id,
        name: options.name||options.id,
        position : GmMap3D.Cartesian3.fromDegrees(points[0],points[1],points[2]),
        show:options.show==undefined?true:options.show,
        ellipsoid: {
            radii: options.dradii ?  new GmMap3D.Cartesian3(options.dradii[0],options.dradii[1],options.dradii[2]):new GmMap3D.Cartesian3(200000.0, 200000.0, 300000.0),
            fill : options.dfill ? options.dfill : true,
            material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
            outline : options.doutline ? options.doutline : false,
            outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
            outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
            subdivisions : options.dsubdivisions ? options.dsubdivisions : 128,
            shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    return definedellipsoid;
}

//添加文字注记
ZMAPGEOMETRY.prototype.AddTextLabel  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length==0){
        return " please provide points ";
    }

    var _position = [109.234,34.24,0];
    if(options.position){
        _position = options.position;
        if(!_position[2]){
            _position[2] = 0;
        }
    }
    
    var lableEntity= this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            position : GmMap3D.Cartesian3.fromDegrees(_position[0], _position[1], _position[2]),
            show:options.show==undefined?true:options.show,
            label : {
                show : true,
                text : options.dtext ? options.dtext : "请配置内容",//设置text文本
                font : options.dfont ? options.dfont : '13px 宋体',//设置字体和字体的类型
                style : options.dstyle ? GmMap3D.LabelStyle[options.dstyle.toUpperCase()] : GmMap3D.LabelStyle.FILL_AND_OUTLINE,
                pixelOffset : options.dpixelOffset ? new GmMap3D.Cartesian2(options.dpixelOffset[0],options.dpixelOffset[1]) : new GmMap3D.Cartesian2(0,0),
                fillColor : options.dfillColor ? this.map3dTool.colorTransform(options.dfillColor): GmMap3D.Color.WHITE,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor): GmMap3D.Color.BLACK,
                outlineWidth :  options.doutlineWidth ? options.doutlineWidth : 1,
                showBackground : options.dshowBackground ? options.dshowBackground : false,
                scale : options.dscale ? options.dscale : 1,
                backgroundColor : options.dbackgroundColor ? this.map3dTool.colorTransform(options.dbackgroundColor): new GmMap3D.Color(0.165, 0.165, 0.165, 0.8),
                backgroundPadding:options.dbackgroundPadding?new GmMap3D.Cartesian2(options.dbackgroundPadding[0], options.dbackgroundPadding[1]):new GmMap3D.Cartesian2(7, 5),
                horizontalOrigin : options.dhorizontalOrigin ? GmMap3D.HorizontalOrigin[options.dhorizontalOrigin.toUpperCase()]: GmMap3D.HorizontalOrigin.CENTER,
                verticalOrigin :  options.dverticalOrigin ? GmMap3D.VerticalOrigin[ options.dverticalOrigin.toUpperCase()]: GmMap3D.VerticalOrigin.CENTER,
                eyeOffset  :  options.deyeOffset ? new GmMap3D.Cartesian3(options.deyeOffset[0], options.deyeOffset[1], options.deyeOffset[2]) : new GmMap3D.Cartesian3(0.0, 0.0, 0.0),
                distanceDisplayCondition  : options.ddistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0], options.ddistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000),
                scaleByDistance : options.dscaleByDistance ? new GmMap3D.NearFarScalar(options.dscaleByDistance[0],options.dscaleByDistance[1],options.dscaleByDistance[2],options.dscaleByDistance[3]) : new GmMap3D.NearFarScalar(0.0,1,100000000.0,0.0),
                disableDepthTestDistance:options.ddisableDepthTestDistance ==undefined?0:options.ddisableDepthTestDistance
            }
    });  
    lableEntity['callfun'] = options.callfun;         
    return lableEntity;   
 }

 //添加文字标注的属性
ZMAPGEOMETRY.prototype.setTextProperties = function (textEntity,options){
    
    var existFlag =this.viewer.entities.contains(textEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to set ";
    }

    for(var proper in options){
        if("position" === proper){
            var posi = options.position;
            if(posi&&posi.length>1){
                if(posi.length===3){
                    textEntity.position = GmMap3D.Cartesian3.fromDegrees(options.position[0], options.position[1], options.position[2]);
                }else{
                    textEntity.position = GmMap3D.Cartesian3.fromDegrees(options.position[0], options.position[1]);
                }
            }
            continue;
        }
        if("dtext" === proper){
            if(options[proper]){
                textEntity.label.text = options.dtext;
            }
            continue;
        }
        if("dfont" === proper){
            if(options[proper]){
                textEntity.label.font = options.dfont;
            }
            continue;
        }
        if("dstyle" === proper){
            if(options[proper]){
                textEntity.label.style = GmMap3D.LabelStyle[options.dstyle.toUpperCase()];
            }
            continue;
        }
        if("dfillColor" === proper){
            if(options[proper]){
                textEntity.label.fillColor = this.map3dTool.colorTransform(options.dfillColor);
            }
            continue;
        };
        if("doutlineColor" === proper){
            if(options[proper]){
                textEntity.label.outlineColor =  this.map3dTool.colorTransform(options.doutlineColor);
            }
            continue;
        };
        if("doutlineWidth"=== proper){
            if(options[proper]){
                textEntity.label.outlineWidth = options.doutlineWidth;
            }
            continue;
        };

        if("dshowBackground"=== proper){
            if(options[proper]){
                textEntity.label.showBackground = options.dshowBackground;
            }
            continue;
        };

        if("dbackgroundColor"=== proper){
            if(options[proper]){
                textEntity.label.backgroundColor = this.map3dTool.colorTransform(options.dbackgroundColor);
            }
            continue;
        };
        if("dscale"=== proper){
            if(options[proper]){
                textEntity.label.scale = options.dscale;
            }
            continue;
        }
        if("dhorizontalOrigin" === proper){
            if(options[proper]){
                textEntity.label.horizontalOrigin =GmMap3D.HorizontalOrigin[options.dhorizontalOrigin.toUpperCase()];
            }
            continue;
        }
        if("dverticalOrigin" === proper){
            if(options[proper]){
                textEntity.label.verticalOrigin =GmMap3D.VerticalOrigin[options.dverticalOrigin.toUpperCase()];
            }
            continue;
        }
        if("dpixelOffset"=== proper){
            if(posi&&posi.length>1){
                textEntity.label.pixelOffset =new GmMap3D.Cartesian2(options.dpixelOffset[0],options.dpixelOffset[1])
            }
            continue;
        }
        if("dscaleByDistance"=== proper){
            if(options[proper] && options[proper].length===4){
                textEntity.label.scaleByDistance = new GmMap3D.NearFarScalar(options.dscaleByDistance[0],options.dscaleByDistance[1],options.dscaleByDistance[2],options.dscaleByDistance[3]);
            }
            continue;
        };
        if("ddistanceDisplayCondition" === proper){
            if(options[proper] && options[proper].length===2){
                textEntity.label.distanceDisplayCondition =  new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0], options.ddistanceDisplayCondition[1]);
            }
            continue;
        }
    }
}

//获取文字注记属性
ZMAPGEOMETRY.prototype.getTextProperties   = function (textEntity,options){
    
    var existFlag =this.viewer.entities.contains(textEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to get ";
    }

    var reProperties = {}

    for(var i=0 ;i< options.length ;i++){
        var proper = options[i];
        if("id" === proper){
            reProperties.id = textEntity.id;
            continue;
        }
        if("name" === proper){
            reProperties.name = textEntity.name;
            continue;
        }

        if("position" === proper){
            var pos = this.map3dTool.cartesianTo2MapCoord(textEntity.position._value)
            reProperties.position = pos;
            continue;
        }

        if("dtext" === proper){
            reProperties.dtext = textEntity.label.text._value;
            continue;
        }
        if("dfont" === proper){
            reProperties.dfont = textEntity.label.font._value;
            continue;
        }
        if("dstyle" === proper){
            var mdstyle = textEntity.label.style;
            if(mdstyle){
                mdstyle = textEntity.label.style._value;
                if(mdstyle===0 ||mdstyle==="0"){reProperties.dstyle ="FILL"};
                if(mdstyle===1 ||mdstyle==="1"){reProperties.dstyle = "OUTLINE"};
                if(mdstyle===2 ||mdstyle==="2"){reProperties.dstyle ="FILL_AND_OUTLINE"};
            }
            continue;
        }
        if("dfillColor" === proper){
            reProperties.dfillColor = textEntity.label.fillColor._value;
            continue;
        };
        if("doutlineColor" === proper){
            reProperties.doutlineColor = textEntity.label.outlineColor._value;
            continue;
        };
        if("doutlineWidth"=== proper){
            reProperties.doutlineWidth = textEntity.label.outlineWidth._value;
            continue;
        };

        if("dshowBackground"=== proper){
            reProperties.dshowBackground = textEntity.label.showBackground._value;
            continue;
        };

        if("dbackgroundColor"=== proper){
            reProperties.dbackgroundColor = textEntity.label.backgroundColor._value;
            continue;
        };
        if("dscale"=== proper){
            reProperties.dscale =  textEntity.label.scale._value;
            continue;
        };
        if("dhorizontalOrigin" === proper){
            var mdhorizontalOrigin = textEntity.label.horizontalOrigin;
            if(mdhorizontalOrigin){
                mdhorizontalOrigin = textEntity.label.horizontalOrigin._value
                if(mdhorizontalOrigin===0 ||mdhorizontalOrigin==="0"){reProperties.dhorizontalOrigin ="CENTER"};
                if(mdhorizontalOrigin===1 ||mdhorizontalOrigin==="1"){reProperties.dhorizontalOrigin = "LEFT"};
                if(mdhorizontalOrigin===-1 ||mdhorizontalOrigin==="-1"){reProperties.dhorizontalOrigin ="RIGHT"};
            }
          
            continue;
        };
        if("dverticalOrigin" === proper){
            var mdverticalOrigin = textEntity.label.verticalOrigin;
            if(mdverticalOrigin){
                mdverticalOrigin= textEntity.label.verticalOrigin._value;
                if(mdverticalOrigin===0 ||mdverticalOrigin==="0"){reProperties.dverticalOrigin ="CENTER"};
                if(mdverticalOrigin===1 ||mdverticalOrigin==="1"){reProperties.dverticalOrigin = "LEFT"};
                if(mdverticalOrigin===-1 ||mdverticalOrigin==="-1"){reProperties.dverticalOrigin ="RIGHT"};
            }
            continue;
        };
        if("dpixelOffset"=== proper){
            var dpixelOffset2 = textEntity.label.pixelOffset
            if(dpixelOffset2){
                dpixelOffset2 = textEntity.label.pixelOffset._value;
                reProperties.dpixelOffset = [dpixelOffset2.x,dpixelOffset2.y];
            }
            continue;
        };
        if("dscaleByDistance"=== proper){
            var mdscaleByDistance = textEntity.label.scaleByDistance._value;
            reProperties.dscaleByDistance =  [mdscaleByDistance.near,mdscaleByDistance.nearValue,mdscaleByDistance.far,mdscaleByDistance.farValue];
            continue;
        };
        if("ddistanceDisplayCondition" === proper){
            var mdistanceDisplayCondition = textEntity.label.distanceDisplayCondition._value;
            reProperties.ddistanceDisplayCondition =  [mdistanceDisplayCondition._near,mdistanceDisplayCondition._far];
            continue;
        }
    }

    return reProperties;

}


 ZMAPGEOMETRY.prototype.addLine = function(options,isFlyto)
{
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }
    var points  =[];
    for(var i =0 ;i< options.position.length ;i++){
        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        if(!Number(pos[2])){
            points.push(0);
        }else{
            points.push(pos[2]);
        }
    }

    
    var rematerial = this.LineMaterial(options.dmaterial)
    
    var defaultLine  =this.viewer.entities.add({
        id: options.id, 
        name: options.name||options.id,  
        show:options.show==undefined?true:options.show,
        polyline: {
            positions : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
            followSurface : options.dfollowSurface ? options.dfollowSurface : false,
            clampToGround : options.dclampToGround ? options.dclampToGround : false,
            width : options.dwidth ? options.dwidth : 1.0,
            material : rematerial ? rematerial:Cesium.Color.RED,
            shadows : options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
            zIndex : options.fzIndex ? options.fzIndex : 0,
            distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
        }
    });

    if(isFlyto){
        this.viewer.camera.flyTo({
            destination : GmMap3D.Cartesian3.fromDegrees(points[0], points[1], points[2]+1000)
        });
    }

    return defaultLine;
}

ZMAPGEOMETRY.prototype.LineMaterial = function(options){
    var rematerial = null;
    var material = options;
    if(material){
        var materialname = material.materialName;
        if(materialname === "dColorMaterial"){
            rematerial = material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE;
        }else if(materialname === "dPolylineGlowMaterial"){
            rematerial = new GmMap3D.PolylineGlowMaterialProperty({
                glowPower : material.dglowPower ? Number(material.dglowPower) : 0.25,
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE
            })
        }else if(materialname === "dPolylineOutlineMaterial"){
            rematerial = new GmMap3D.PolylineOutlineMaterialProperty({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                outlineColor :  material.doutlineColor ? this.map3dTool.colorTransform(material.doutlineColor) : GmMap3D.Color.BLACK,
                outlineWidth : material.doutlineWidth ? Number(material.doutlineWidth) : 1.0,
            })
        }else if(materialname === "dPolylineArrowMaterial"){
            rematerial = new Cesium.PolylineArrowMaterialProperty(
                material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE
            )
        }else if(materialname === "dPolylineDashMaterial"){
            rematerial = new Cesium.PolylineDashMaterialProperty({
                color : material.dcolor ? this.map3dTool.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                gapColor: material.dgapColor ?  material.dgapColor: Color.TRANSPARENT,
                dashLength: material.ddashLength ?  material.ddashLength: 16,
                dashPattern: material.ddashPattern ?  material.ddashPattern: 255,
            })
        }else {
            rematerial = GmMap3D.Color.WHITE;
        }
    }else {
        rematerial = GmMap3D.Color.WHITE;
    }

    return rematerial;
}



//添加polygon
ZMAPGEOMETRY.prototype.Addpolygon  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<3){
        return " please provide points ";
    }

    var points = [];//用于不使用点的高度
    var pointsh = [];//需要使用点的高度
    for(var i =0 ;i< options.position.length ;i++){
        var pos = options.position[i];
        points.push(pos[0]);
        pointsh.push(pos[0]);
        points.push(pos[1]);
        pointsh.push(pos[1]);
        if(!Number(pos[2])){
            points.push(0);
        }else{
            points.push(pos[2]);
        }
    }
    //开启点的高度dperPositionHeight 和dheight 不能同时使用
    var rheight = null;
    var rhierarchy = null;
    if(!options.dheight){
        rhierarchy = GmMap3D.Cartesian3.fromDegreesArrayHeights(points);
    }else{
        rheight = options.dheight;
        rhierarchy = GmMap3D.Cartesian3.fromDegreesArray(pointsh);
        if(options.dperPositionHeight){
            options.dperPositionHeight = false;
        }
    }

    //纹理旋转问题
    var srotate = options.dstRotation ?  GmMap3D.Math.toRadians(Number(options.dstRotation)) : 0;

    var rematerial = this.setAssistMaterial(options.dmaterial)
    
    var definedPolygon= this.viewer.entities.add({
            id: options.id,
            name : options.name ? options.name : options.id,
            show:options.show==undefined?true:options.show,
            polygon : {
                hierarchy : rhierarchy,
                height : rheight,
                extrudedHeight : options.dextrudedHeight ? options.dextrudedHeight : null,
                fill : options.dfill ? options.dfill : true,
                material : rematerial,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                stRotation : srotate,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.ddistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0], options.ddistanceDisplayCondition[1]) : new GmMap3D.DistanceDisplayCondition(0,1000000000),
                perPositionHeight : options.dperPositionHeight ? options.dperPositionHeight : false,
                closeTop : options.dcloseTop ? options.dcloseTop : true,
                closeBottom : options.dcloseBottom ? options.dcloseBottom : true
            }
    });
    definedPolygon['callfun'] = options.callfun;
    return definedPolygon;
 }

 //设置多边形的属性
ZMAPGEOMETRY.prototype.setPolygonProperties = function (polygonEntity,options){
    
    var existFlag =this.viewer.entities.contains(polygonEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to set ";
    }

    for(var proper in options){
        if("dmaterial" === proper){
            if(options[proper]){
               var rmaterial =  this.setAssistMaterial(options.dmaterial);
               polygonEntity.polygon.material = rmaterial;
            }
        }
        if("dheight"=== proper){
            if(options[proper]){
                polygonEntity.polygon.height = options.dheight;
            }
            continue;
        }
        if("dextrudedHeight" === proper){
            if(options[proper]){
                polygonEntity.polygon.extrudedHeight =options.dextrudedHeight;
            }
            continue;
        }
        if("dfill" === proper){
            if(options[proper] !=undefined){
                polygonEntity.polygon.fill = options.dfill;
            }
            continue;
        }
        if("doutline"=== proper){
            if(options[proper] !=undefined ){
                polygonEntity.polygon.outline = options.doutline;
            }
            continue;
        }
        if("doutlineColor" === proper){
            if(options[proper]){
                polygonEntity.polygon.outlineColor =  this.map3dTool.colorTransform(options.doutlineColor);
            }
            continue;
        }
        if("doutlineWidth" === proper){
            if(options[proper]){
                polygonEntity.polygon.outlineWidth = options.doutlineWidth;
            }
            continue;
        }
        if("dstRotation" === proper){
            if(options[proper]){
                polygonEntity.polygon.stRotation =  GmMap3D.Math.toRadians(Number(options.dstRotation));
            }
            continue;
        }
        if("dperPositionHeight"=== proper){
            if(options[proper] !=undefined){
                polygonEntity.polygon.perPositionHeight = options.dperPositionHeight;
            }
            continue;
        }
        if("ddistanceDisplayCondition"=== proper){
            if(options[proper] && options[proper].length===2){
                polygonEntity.polygon.distanceDisplayCondition = new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0],options.ddistanceDisplayCondition[1]);
            }
            continue;
        }
    }
}

//获取多边形的属性
ZMAPGEOMETRY.prototype.getPolygonProperties   = function (polygonEntity,options){
    
    var existFlag =this.viewer.entities.contains(polygonEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to get ";
    }

    var reProperties = {}

    for(var i=0 ;i< options.length ;i++){
        var proper = options[i];
        if("dmaterial"=== proper){
            var rmaterial = this.getAssistMaterial(polygonEntity.polygon.material);
            reProperties.dmaterial = rmaterial;
        }
        if("dheight"=== proper){
            reProperties.dheight = polygonEntity.polygon.height._value;
            continue;
        }
        if("dextrudedHeight" === proper){
            reProperties.dextrudedHeight =polygonEntity.polygon.extrudedHeight._value;
            continue;
        }
        if("dfill" === proper){
            reProperties.dfill =polygonEntity.polygon.fill._value;
            continue;
        };
        if("doutline"=== proper){
            reProperties.doutline =polygonEntity.polygon.outline._value;
            continue;
        };
        if("doutlineColor" === proper){
            reProperties.doutlineColor =polygonEntity.polygon.outlineColor._value;
            continue;
        };
        if("doutlineWidth" === proper){
            reProperties.doutlineWidth =polygonEntity.polygon.outlineWidth._value;
            continue;
        };
        if("dstRotation" === proper){
            reProperties.dstRotation = GmMap3D.Math.toDegrees(polygonEntity.polygon.stRotation._value);
            continue;
        };
        if("dperPositionHeight"=== proper){
            reProperties.dperPositionHeight =polygonEntity.polygon.perPositionHeight._value;
            continue;
        };
        if("ddistanceDisplayCondition"=== proper){
            var mdistanceDisplayCondition = polygonEntity.polygon.distanceDisplayCondition._value;
            reProperties.ddistanceDisplayCondition = [mdistanceDisplayCondition._near,mdistanceDisplayCondition._far]
            continue;
        };
    }

    return reProperties;

}


 //添加polylineVolume
ZMAPGEOMETRY.prototype.AddPolylineVolume  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length<2){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        if(!Number(pos[2])){
            points.push(0);
        }else{
            points.push(pos[2]);
        }
       
    }
    
    var definedPolylineVolume= this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            position : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
            polylineVolume : {
                shape : options.dshape ? options.dshape : [new Cesium.Cartesian2(-50000, -50000),new Cesium.Cartesian2(50000, -50000),new Cesium.Cartesian2(50000, 50000),
                    new Cesium.Cartesian2(-50000, 50000)],
                cornerType :  options.dcornerType ? GmMap3D.CornerType[options.dcornerType.toUpperCase()] : GmMap3D.CornerType.MITERED,
                fill : options.dfill ? options.dfill : true,
                material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
            }
    });

    return definedPolylineVolume;
 }


 //添加rectangle
ZMAPGEOMETRY.prototype.AddRectangle  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length!=2){
        return " please provide points more than 2";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
    }
    
    var definedrectangle= this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            position : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
            rectangle : {
                coordinates	: Cesium.Rectangle.fromDegrees(points[0],points[1],points[2],points[3]),
                height : options.dheight ? options.dheight:0,
                extrudedHeight : options.dextrudedHeight ? options.dextrudedHeight : 0,
                fill : options.dfill ? options.dfill : true,
                material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
            }
    });

    return definedrectangle;
 }

 //添加rectangle
ZMAPGEOMETRY.prototype.AddRectangle  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length!=2){
        return " please provide points more than 2";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
    }
    
    var definedrectangle= this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            rectangle : {
                coordinates	: Cesium.Rectangle.fromDegrees(points[0],points[1],points[2],points[3]),
                height : options.dheight ? options.dheight:0,
                extrudedHeight : options.dextrudedHeight ? options.dextrudedHeight : 0,
                fill : options.dfill ? options.dfill : true,
                material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
            }
    });

    return definedrectangle;
 }


 //添加wall
ZMAPGEOMETRY.prototype.AddWall  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.dmaximumHeights || !options.dminimumHeights ){
        return " please give dmaximumHeights and dminimumHeights ";
    }

    if(!options.position || options.position.length<1){
        return " please provide points more than 1";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
    }

    if(options.dmaximumHeights.length != options.position.length || options.dminimumHeights.length != options.position.length){
        
        return "  dmaximumHeights length and dminimumHeights length must equal to point length";
    }
    
    var defineWall= this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            wall : {
                positions : GmMap3D.Cartesian3.fromDegreesArray(points),
                maximumHeights: options.dmaximumHeights ,
                minimumHeights:  options.dminimumHeights,
                fill : options.dfill ? options.dfill : true,
                material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
            }
    });

    return defineWall;
 }


 //添加rectangle
ZMAPGEOMETRY.prototype.AddCylinder  = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position){
        return " please provide points ";
    }

    var points = [];
    for(var i =0 ;i< options.position.length ;i++){

        var pos = options.position[i];
        points.push(pos[0]);
        points.push(pos[1]);
        points.push(pos[2]);
    }
    
    var definedcylinder = this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            position : Cesium.Cartesian3.fromDegrees(points[0], points[1], points[2]),
            cylinder : {
                length : options.dlength ? options.dlength : 10000,
                topRadius : options.dtopRadius ? options.dtopRadius : 0,
                bottomRadius : options.dbottomRadius ?  options.dbottomRadius : 10000,
                fill : options.dfill ? options.dfill : true,
                material : options.fcolor ? this.map3dTool.colorTransform(options.fcolor) : GmMap3D.Color.WHITE,
                outline : options.doutline ? options.doutline : false,
                outlineColor : options.doutlineColor ? this.map3dTool.colorTransform(options.doutlineColor) : GmMap3D.Color.WHITE,
                outlineWidth : options.doutlineWidth ? options.doutlineWidth : 1.0,
                numberOfVerticalLines : options.dnumberOfVerticalLines ? options.dnumberOfVerticalLines : 16,
                shadows	:  options.dshadows ? GmMap3D.ShadowMode[options.dshadows.toUpperCase()] : GmMap3D.ShadowMode.DISABLED,
                distanceDisplayCondition  : options.fdistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.fdistanceDisplayCondition[0], options.fdistanceDisplayCondition[1]) : new Cesium.DistanceDisplayCondition(0,100000000)
            }
    });

    return definedcylinder;
 }


 //添加billboard(添加图片)
ZMAPGEOMETRY.prototype.addbillboard   = function (options){
    
    if(!options.id){
        return "you have to give a id ";
    };

    if(!options.imageUrl){
        return "you have to give a imageUrl ";
    };

    var oldEntity = this.getModel(options.id);

    if(oldEntity != undefined || oldEntity != null){
        
        return " The id already exists ";
    }

    if(!options.position || options.position.length==0){
        return " please provide points ";
    }
    var imageOption = options.imageUrl ? options.imageUrl : './images/Cesium_Logo_overlay.png';
    if(options.imageUrl&&typeof options.imageUrl =='string'&&options.imageUrl.indexOf('.gif')>-1)
    {
        this.gifImage[options.imageUrl] = this.gifImage[options.imageUrl] || new GmMap3D.GifImageProperty({url:options.imageUrl});
        imageOption = this.gifImage[options.imageUrl] 
    }
    



    var orotation = options.drotation ? Number(options.drotation)*180.0 / Math.PI : 0;

    var _position = GmMap3D.Cartesian3.fromDegrees(options.position[0], options.position[1], options.position[2]);
    var billoption =  {
        image: imageOption,
        rotation : orotation,
        alignedAxis : GmMap3D.Cartesian3.ZERO,
        color : options.dcolor ? this.map3dTool.colorTransform(options.dcolor) : GmMap3D.Color.WHITE,
        scale : options.dscale ? options.dscale : 1,
        pixelOffset : options.dpixelOffset ? new GmMap3D.Cartesian2(options.dpixelOffset[0],options.dpixelOffset[1]) : new GmMap3D.Cartesian2(0,0),
        horizontalOrigin : options.dhorizontalOrigin ? GmMap3D.HorizontalOrigin[options.dhorizontalOrigin.toUpperCase()]: GmMap3D.HorizontalOrigin.CENTER,
        verticalOrigin :  options.dverticalOrigin ? GmMap3D.VerticalOrigin[ options.dverticalOrigin.toUpperCase()]: GmMap3D.VerticalOrigin.CENTER,
        distanceDisplayCondition  : options.ddistanceDisplayCondition ? new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0], options.ddistanceDisplayCondition[1]) : new GmMap3D.DistanceDisplayCondition(0,100000000),
        scaleByDistance : options.dscaleByDistance ? new GmMap3D.NearFarScalar(options.dscaleByDistance[0],options.dscaleByDistance[1],options.dscaleByDistance[2],options.dscaleByDistance[3]) : new GmMap3D.NearFarScalar(10, 2.0, 1000000, 0.0),
        translucencyByDistance : options.dtranslucencyByDistance ? new GmMap3D.NearFarScalar(options.dtranslucencyByDistance[0],options.dtranslucencyByDistance[1],options.dtranslucencyByDistance[2],options.dtranslucencyByDistance[3]) : new GmMap3D.NearFarScalar(10, 2.0,10000000, 0.0),
        disableDepthTestDistance:options.ddisableDepthTestDistance ==undefined?0:options.ddisableDepthTestDistance
    };

    if(options.dheight)
    {
        billoption['height'] = options.dheight ? Number(options.dheight) : 1;
    }
    if(options.dwidth)
    {
        billoption['width'] =  options.dwidth ? Number(options.dwidth) :1;
    }



    var billboardEntity=this.viewer.entities.add({
            id: options.id,
            name: options.name||options.id,
            show:options.show==undefined?true:options.show,
            position : _position,
            billboard  :billoption
    });
    billboardEntity['callfun'] = options.callfun;
    return billboardEntity;
 }

//添加billboard(添加图片)
ZMAPGEOMETRY.prototype.setbillboardProperties = function (billboardEntity,options){
    
    var existFlag =this.viewer.entities.contains(billboardEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to set ";
    }

    for(var proper in options){
        if("position" === proper){
            var posi = options.position;
            if(posi&&posi.length>1){
                if(posi.length===3){
                    billboardEntity.position = GmMap3D.Cartesian3.fromDegrees(options.position[0], options.position[1], options.position[2]);
                }else{
                    billboardEntity.position = GmMap3D.Cartesian3.fromDegrees(options.position[0], options.position[1]);
                }
            }
            continue;
        }
        if("imageUrl" === proper){
            if(options[proper]){
                billboardEntity.billboard.image = options.imageUrl;
            }
            continue;
        }
        if("dscale"=== proper){
            if(options[proper]){
                billboardEntity.billboard.scale = options.dscale;
            }
            continue;
        }
        if("dhorizontalOrigin" === proper){
            if(options[proper]){
                billboardEntity.billboard.horizontalOrigin =GmMap3D.HorizontalOrigin[options.dhorizontalOrigin.toUpperCase()];
            }
            continue;
        }
        if("dverticalOrigin" === proper){
            if(options[proper]){
                billboardEntity.billboard.verticalOrigin =GmMap3D.VerticalOrigin[options.dverticalOrigin.toUpperCase()];
            }
            continue;
        }
        if("dpixelOffset"=== proper){
            if(posi&&posi.length>1){
                billboardEntity.billboard.pixelOffset =new GmMap3D.Cartesian2(options.dpixelOffset[0],options.dpixelOffset[1])
            }
            continue;
        }
        if("drotation" === proper){
            if(options[proper]){
                var rate = GmMap3D.Math.toRadians(Number(options.drotation));
                billboardEntity.billboard.rotation = rate;
            }
            continue;
        }
        if("dwidth" === proper){
            if(options[proper]){
                billboardEntity.billboard.width = options.dwidth;
            }
            continue;
        }
        if("dheight"=== proper){
            if(options[proper]){
                billboardEntity.billboard.height = options.dheight;
            }
            continue;
        }
        if("dcolor" === proper){
            if(options[proper]){
                billboardEntity.billboard.color = this.map3dTool.colorTransform(options.dcolor);
            }
            continue;
        }
        if("dscaleByDistance"=== proper){
            if(options[proper] && options[proper].length===4){
                billboardEntity.billboard.scaleByDistance = new GmMap3D.NearFarScalar(options.dscaleByDistance[0],options.dscaleByDistance[1],options.dscaleByDistance[2],options.dscaleByDistance[3]);
            }
            continue;
        }
        if("dtranslucencyByDistance"=== proper){
            if(options[proper] && options[proper].length===4){
                billboardEntity.billboard.translucencyByDistance = new GmMap3D.NearFarScalar(options.dtranslucencyByDistance[0],options.dtranslucencyByDistance[1],options.dtranslucencyByDistance[2],options.dtranslucencyByDistance[3]);
            }
            continue;
        }
        if("ddistanceDisplayCondition" === proper){
            if(options[proper] && options[proper].length===2){
                billboardEntity.billboard.distanceDisplayCondition =  new GmMap3D.DistanceDisplayCondition(options.ddistanceDisplayCondition[0], options.ddistanceDisplayCondition[1]);
            }
            continue;
        }
    }
}

//添加billboard(添加图片)
ZMAPGEOMETRY.prototype.getbillboardProperties  = function (billboardEntity,options){
    
    var existFlag =this.viewer.entities.contains(billboardEntity);
    if(!existFlag){
        return " The entity is useless ";
    };
    
    if(!options){
        return " No need to get ";
    }

    var reProperties = {}

    for(var i=0 ;i< options.length ;i++){
        var proper = options[i];
        if("id" === proper){
            reProperties.id = billboardEntity.id;
            continue;
        }
        if("name" === proper){
            reProperties.name = billboardEntity.name;
            continue;
        }

        if("position" === proper){
            var pos = this.map3dTool.cartesianTo2MapCoord(billboardEntity.position._value)
            reProperties.position = pos;
            continue;
        }
        if("imageUrl" === proper){
            reProperties.imageUrl = billboardEntity.billboard.image._value;
            continue;
        }
        if("dscale"=== proper){
            reProperties.dscale =  billboardEntity.billboard.scale._value;
            continue;
        }
        if("dhorizontalOrigin" === proper){
            var mdhorizontalOrigin = textEntity.label.horizontalOrigin._value;
            if(mdhorizontalOrigin===0 ||mdhorizontalOrigin==="0"){reProperties.dhorizontalOrigin ="CENTER"};
            if(mdhorizontalOrigin===1 ||mdhorizontalOrigin==="1"){reProperties.dhorizontalOrigin = "LEFT"};
            if(mdhorizontalOrigin===-1 ||mdhorizontalOrigin==="-1"){reProperties.dhorizontalOrigin ="RIGHT"};
            continue;
        };
        if("dverticalOrigin" === proper){
            var mdverticalOrigin = textEntity.label.verticalOrigin._value;
            if(mdverticalOrigin===0 ||mdverticalOrigin==="0"){reProperties.dverticalOrigin ="CENTER"};
            if(mdverticalOrigin===1 ||mdverticalOrigin==="1"){reProperties.dverticalOrigin = "LEFT"};
            if(mdverticalOrigin===-1 ||mdverticalOrigin==="-1"){reProperties.dverticalOrigin ="RIGHT"};
            continue;
        };
        if("dpixelOffset"=== proper){
            var mdpixelOffset = billboardEntity.billboard.pixelOffset._value;
            reProperties.dpixelOffset = [mdpixelOffset.x,mdpixelOffset.y]; 
            continue;
        }
        if("drotation" === proper){
            reProperties.drotation = GmMap3D.Math.toDegrees(billboardEntity.billboard.rotation._value);
            continue;
        }
        if("dwidth" === proper){
            reProperties.dwidth =  billboardEntity.billboard.width._value;
            continue;
        }
        if("dheight"=== proper){
            reProperties.dheight =  billboardEntity.billboard.height._value;
            continue;
        }
        if("dcolor" === proper){
            reProperties.dcolor =  billboardEntity.billboard.color._value;
            continue;
        }
        if("dscaleByDistance"=== proper){
            var mdscaleByDistance = billboardEntity.billboard.scaleByDistance._value;
            reProperties.dscaleByDistance =  [mdscaleByDistance.near,mdscaleByDistance.nearValue,mdscaleByDistance.far,mdscaleByDistance.farValue];
            continue;
        }
        if("dtranslucencyByDistance"=== proper){
            var mdtranslucencyByDistance = billboardEntity.billboard.translucencyByDistance._value;
            reProperties.dtranslucencyByDistance =  [mdtranslucencyByDistance.near,mdtranslucencyByDistance.nearValue,mdtranslucencyByDistance.far,mdtranslucencyByDistance.farValue];
            continue;
        }
        if("ddistanceDisplayCondition" === proper){
            var mdistanceDisplayCondition = billboardEntity.billboard.distanceDisplayCondition._value;
            reProperties.ddistanceDisplayCondition =  [mdistanceDisplayCondition._near,mdistanceDisplayCondition._far];
            continue;
        }
    }

    return reProperties;
}
