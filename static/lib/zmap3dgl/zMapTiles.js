var ZMAP3DTILES = function(map3DView){
    
    this.map3dTool = map3DView;
    this.viewer = map3DView.GetView();
    this.tileslist = {};
}

ZMAP3DTILES.prototype.add3dTiles = function(param,isfly,loadcallback,colorcallback){
    
    var realPosition = null;
    var modelMatrix = null;
    if(param.position){
        realPosition = param.position;
        modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
            GmMap3D.Cartesian3.fromDegrees(realPosition[0], realPosition[1], realPosition[2])), new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
    }
    
    var dtileset = this.viewer.scene.primitives.add(new GmMap3D.Cesium3DTileset({

        url: param.url,
        baseScreenSpaceError : 1024,
        skipLevelOfDetail : true,
        skipScreenSpaceErrorFactor : param.fskipScreenSpaceErrorFactor ? param.fskipScreenSpaceErrorFactor:16,
        skipLevels : param.fskipLevels ? param.fskipLevels:1,
        immediatelyLoadDesiredLevelOfDetail : false,
        loadSiblings : false,
        cullWithChildrenBounds : true,
        dynamicScreenSpaceError : true,
        dynamicScreenSpaceErrorDensity : 0.00278,
        dynamicScreenSpaceErrorFactor : 4.0,
        dynamicScreenSpaceErrorHeightFalloff : 0.25,
        debugColorizeTiles :false,
        debugWireframe:false,
        debugShowBoundingVolume:false,
        modelMatrix : modelMatrix ? modelMatrix : GmMap3D.Matrix4.IDENTITY

    }));

    dtileset.readyPromise.then(function () {
        var boundingSphere = dtileset.boundingSphere;
        dtileset.style = param.style;
        this.viewer.camera.viewBoundingSphere(boundingSphere, new GmMap3D.HeadingPitchRange(0.0, -0.5, boundingSphere.radius));
        this.viewer.camera.lookAtTransform(GmMap3D.Matrix4.IDENTITY);
    }).otherwise(function (error) {
        throw (error);
    });

    if(isfly){
        this.viewer.zoomTo(dtileset);
    }

    dtileset.allTilesLoaded.addEventListener(function() {
        if(typeof loadcallback === "function"){
            loadcallback(dtileset);
        }
    });

    setTimeout(() => {
        if(typeof colorcallback === "function"){
            colorcallback(dtileset);
        }
    }, 0);


    var id = param.modelid ? param.modelid : param.url;
    this.tileslist[id] = dtileset;
    // var tilesobj = {}
    // tilesobj[id] = dtileset;
    // this.tileslist.push(tilesobj);
    return dtileset;
}

//通过id获取3dTiles对象
ZMAP3DTILES.prototype.get3dTilesById = function(tilesId)
{
    var tilesen = null;
    // for(var i=0;i<this.tileslist.length;i++){
    //     var tobj = this.tileslist[i];
    //     for(var obj in tobj){
    //         if(obj===tilesId){
    //              tilesen = tobj.obj;
    //              break;
    //         }
    //     }
    //     if(tilesen){
    //         break;
    //     }
    // }
    tilesen = this.tileslist[tilesId];
    return tilesen;
}
//通过id移除3dTiles对象
ZMAP3DTILES.prototype.deleteTilesById = function(tilesId)
{
    var tilesen = null;
    tilesen = this.tileslist[tilesId];
    // var index = 0;
    // for(var i=0;i<this.tileslist.length;i++){
    //     var tobj = this.tileslist[i];
    //     for(var obj in tobj){
    //         if(obj===tilesId){
    //              tilesen = tobj.obj;
    //              index = i;
    //              break;
    //         }
    //     }
    //     if(tilesen){
    //         break;
    //     }
    // }
    if(tilesen){
        this.deletedTiles(tilesen);
        //this.tileslist.splice(index,1);
        //delete this.tileslist[tilesId];
    };
}

//移除3dTiles
ZMAP3DTILES.prototype.deletedTiles = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    if(typeof tileset =="string")
    {
        this.deleteTilesById(tileset);
        return;
    }


    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    // var index = -1;
    // for(var i=0;i<this.tileslist.length;i++){
    //     var tobj = this.tileslist[i];
    //     for(var obj in tobj){
    //         if(tileset===tobj[obj]){
    //              index = i;
    //              break;
    //         }
    //     }
    //     if(index>0){
    //         break;
    //     }
    // }

    for(var k in this.tileslist)
    {
        if(this.tileslist[k] == tileset)
        {
            delete this.tileslist[k];
            break;
        }
    }

    this.viewer.scene.primitives.remove(tileset);
    //this.tileslist.splice(index,1);
}


ZMAP3DTILES.prototype.show =  function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.show = true;
}

ZMAP3DTILES.prototype.unshow =  function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.show = false;
}

//显示模块的url
ZMAP3DTILES.prototype.showDebugShowUrl = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowUrl = true;
};

//隐藏模块的url
ZMAP3DTILES.prototype.unshowDebugShowUrl = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowUrl = false;
};

//显示模块占用内存
ZMAP3DTILES.prototype.showDebugShowMemoryUsage = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowMemoryUsage = true;
}

//隐藏模块占用内存
ZMAP3DTILES.prototype.unshowDebugShowMemoryUsage = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowMemoryUsage = false;
}

//隐藏绘制标签以指示每个图块的命令，点，三角形和要素的数量。
ZMAP3DTILES.prototype.unshowDebugShowRenderingStatistics = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowRenderingStatistics = false;
}

//显示绘制标签以指示每个图块的命令，点，三角形和要素的数量。
ZMAP3DTILES.prototype.showDebugShowRenderingStatistics = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowRenderingStatistics = true;
}

//显示每个图块的内容呈现边界体积。
ZMAP3DTILES.prototype.showDebugShowContentBoundingVolume = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowContentBoundingVolume = true;
}

//隐藏每个图块的内容呈现边界体积。
ZMAP3DTILES.prototype.unshowDebugShowContentBoundingVolume = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowContentBoundingVolume = false;
}


//显示每个图块呈现边界体积。
ZMAP3DTILES.prototype.showDebugShowBoundingVolume = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowBoundingVolume = true;
}

//隐藏每个图块呈现边界体积。
ZMAP3DTILES.prototype.unshowDebugShowBoundingVolume = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugShowBoundingVolume = false;
}

//显示内容渲染为线框。
ZMAP3DTILES.prototype.showDebugWireframe = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugWireframe = true;
}

//隐藏内容渲染为线框。
ZMAP3DTILES.prototype.unshowDebugWireframe = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugWireframe = false;
}

//显示随机给每个模块颜色。
ZMAP3DTILES.prototype.showDebugColorizeTiles = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugColorizeTiles = true;
}

//不给随机颜色。
ZMAP3DTILES.prototype.unshowDebugColorizeTiles = function(tileset){
    
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

    tileset.debugColorizeTiles = false;
}

//dconditions数据结构
// dconditions = [['${height} >= 300', 'rgba(45, 0, 75, 0.5)'],
//  ['${height} >= 200', 'rgb(102, 71, 151)'],
//  ['${height} >= 100', 'rgb(170, 162, 204)'],
//  ['${height} >= 50', 'rgb(224, 226, 238)'],
//  ['${height} >= 25', 'rgb(252, 230, 200)'],
//  ['${height} >= 10', 'rgb(248, 176, 87)'],
//  ['${height} >= 5', 'rgb(198, 106, 11)'],
//  ['true', 'rgb(127, 59, 8)']
// ]
ZMAP3DTILES.prototype.colorByHeight = function(tileset,dconditions) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        color: {
            conditions: dconditions
        }
    });
}

//dconditions数据结构
// dconditions =  [
//     ['${latitudeRadians} >= 0.7125', "color('purple')"],
//     ['${latitudeRadians} >= 0.712', "color('red')"],
//     ['${latitudeRadians} >= 0.7115', "color('orange')"],
//     ['${latitudeRadians} >= 0.711', "color('yellow')"],
//     ['${latitudeRadians} >= 0.7105', "color('lime')"],
//     ['${latitudeRadians} >= 0.710', "color('cyan')"],
//     ['true', "color('blue')"]
// ]
ZMAP3DTILES.prototype.colorByLatitudeDefine =  function(tileset,dconditions) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        defines: {
            latitudeRadians: 'radians(${latitude})'
        },
        color: {
            conditions: dconditions
        }
    });
}

//dconditions数据结构
// dconditions =  [
//     ['${LongitudeRadians} >= 0.7125', "color('purple')"],
//     ['${LongitudeRadians} >= 0.712', "color('red')"],
//     ['${LongitudeRadians} >= 0.7115', "color('orange')"],
//     ['${LongitudeRadians} >= 0.711', "color('yellow')"],
//     ['${LongitudeRadians} >= 0.7105', "color('lime')"],
//     ['${LongitudeRadians} >= 0.710', "color('cyan')"],
//     ['true', "color('blue')"]
// ]
ZMAP3DTILES.prototype.colorByLongitudeDefined =  function(tileset,dconditions) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        defines: {
            LongitudeRadians: 'radians(${Longitude})'
        },
        color: {
            conditions: dconditions
        }
    });
}

// conditions = [
//     ['${distance} > 0.0012',"color('gray')"],
//     ['${distance} > 0.0008', "mix(color('yellow'), color('red'), (${distance} - 0.008) / 0.0004)"],
//     ['${distance} > 0.0004', "mix(color('green'), color('yellow'), (${distance} - 0.0004) / 0.0004)"],
//     ['${distance} < 0.00001', "color('white')"],
//     ['true', "mix(color('blue'), color('green'), ${distance} / 0.0004)"]
// ]
ZMAP3DTILES.prototype.colorByDistance =  function(tileset,dconditions,midPoint) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        defines : {
            distance : 'distance(vec2(radians(${longitude}), radians(${latitude})), vec2(radians('+midPoint[0]+'),radians('+midPoint[1]+')))'
        },
        color : {
            conditions : dconditions
        }
    });
}

//(regExp('3').test(String(${name}))) ? color('cyan', 0.9) : color('purple', 0.1)
ZMAP3DTILES.prototype.colorByNameRegex = function(tileset,dnameRgex) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        color :dnameRgex
    });
}

//'${height} >100'
ZMAP3DTILES.prototype.hideByHeight = function(tileset,dheight) {
    tileset.style = new ZMAP3D.Cesium3DTileStyle({
        show : '${height} '+dheight
    });
}

//获取设置的样式
ZMAP3DTILES.prototype.getTilesStyle = function(tileset) {
   
    if(!tileset ||tileset == undefined || tileset == ""){
        return " The tiles doesn't exist  ";
    };

    var existFlag = this.viewer.scene.primitives.contains(tileset);
    if(!existFlag){
        return " The tiles is useless ";
    };

   if(!dtitles.style){
       return " no style"
   }
   var conditions =  dtitles.style._color._conditions;
   return conditions;

}

//移除设置的样式
ZMAP3DTILES.prototype.removeTilesStyle = function(tileset) {
    
     if(!tileset ||tileset == undefined || tileset == ""){
         return " The tiles doesn't exist  ";
     };
 
     var existFlag = this.viewer.scene.primitives.contains(tileset);
     if(!existFlag){
         return " The tiles is useless ";
     };
 
    if(!dtitles.style){
        return " no style"
    }
    tileset.style = null;
 
 }



