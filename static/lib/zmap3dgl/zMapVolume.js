// JScript 文件
//********************************************************************************************
//                 Map3DSDK 1.0  本版本的接口都为经纬度坐标
//*********************************************************************************************//
var Map3DSDK = Map3DSDK || {};

(function() {
     var MapVolume = function (map, options){
        this._map    = map;
        this._box    = options.box;
        this._scale  = options.scale ? options.scale : [1, 1, 1];
        this._offset = options.offset? options.offset: [0, 0, 0];
        this._line   = [0.0, 0.0, 80.0, 1000.0,0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0,0.0, 0.0, 0.0, 0.0];
               
        
        //存储各自变量
        this._vol    = {
            pri: null,
            apprance: null,
            mat: null
        };
        this._sect   = {
            pri: [],
            apprance: null,
            mat: null        
        };
        this._filter = {
            pri: null,
            apprance: null,
            mat: null
        };  

        this._url     = options.url ? options.url : "BaseWhite";
        var stamp     = Date.parse(new Date());
        this._name    = options.name? options.name: ("Volume_TimeStap_" + stamp);   

        this._sectpri = [];           
     }

    MapVolume.prototype.InitShader = function()
    {
        var thisObj = this;
        $.ajax({
            url: './libs/zmap3dgl/glsl/glsl.htm',
            async: false,
            dataType: 'text',
            success: function (xml)
            {
                var data = xml;
                $(document.body).append(data);
            },
            error: function(e)
            {
               console.log(e.message); 
            }
        });  
        
        $.ajax({
            url: './libs/zmap3dgl/glsl/filter.htm',
            async: false,
            dataType: 'text',
            success: function (xml)
            {
                var data = xml;
                $(document.body).append(data);
            },
            error: function(e)
            {
                console.log(e.message); 
            }
        });           
                
        
        $.ajax({
            url: './libs/zmap3dgl/glsl/sect.htm',
            async: false,
            dataType: 'text',
            success: function (xml)
            {
                var data = xml;
                $(document.body).append(data);
            },
            error: function(e)
            {
                console.log(e.message); 
            }
        });  
    }       
         
    MapVolume.prototype.Reset = function()
    {
        this._scale  = [1, 1, 1];
        this._offset = [0, 0, 0];
        return this.Refresh();
    }   
    
    MapVolume.prototype.Refresh = function()
    {
        //删除几何模型重新创建
        this.Destroy();
        this.ShowVolume();
        return ;
    }   
    
    MapVolume.prototype.SetVisible = function(visible)
    {
        var viewer = this._map.GetView();       
        if (this._vol.pri)
        {
            this._vol.pri.show = visible;
        }  
        return ;
    }
    
    
    MapVolume.prototype.IsVisible = function(visible)
    {
        var viewer = this._map.GetView();       
        if (this._vol.pri)
        {
            return this._vol.pri.show;
        }  
        return false;
    }       
    
    MapVolume.prototype.ShowVolume = function()
    {
        this._CreateModel(1);
        this.SetVisible(true);
    } 
      
    
    MapVolume.prototype.Destroy = function()
    {    
        var viewer = this._map.GetView();        
        var pris   = viewer.scene.primitives;
        if (this._vol.pri) 
        {
            pris.remove(this._vol.pri);    
            this._vol.pri = null;    
        }
        return ;
    }
    
    
    MapVolume.prototype.EnableFilterAnlyze = function(enable)
    {
          if (enable)
          {
             this._CreateModel(2);
          }
          else
          {
             this._CreateModel(1);
          }
        
//        var apprance = this._vol.pri.appearance;
//        if (enable)
//        {
//            apprance._vertexShaderSource = document.getElementById( 'filterVertexShaderPass' ).textContent;
//            apprance._fragmentShaderSource= document.getElementById( 'filterFragmentShaderPass' ).textContent; 
//        }
//        else
//        {
//            apprance._vertexShaderSource = document.getElementById( 'vertexShaderPass' ).textContent;
//            apprance._fragmentShaderSource= document.getElementById( 'fragmentShaderPass' ).textContent;                                
//        }
    }
    
    MapVolume.prototype.EnableSectAnlyze   = function(enable)
    {
        if (enable)
        {
            this._CreateModel(3);
        }
        else
        {
            this._CreateModel(1);
        }
              
    }    
    
    
    //mode: 轴向,0/1/2  nav:正负,-1/1, x:大小
    MapVolume.prototype.SetSectPlaneAnlyze = function(mode, nav, x)
    {
//        lonSection.modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
//                 GmMap3D.Cartesian3.fromDegrees(value, 19.797363, 0.0)), new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());

//        latSection.modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
//                 GmMap3D.Cartesian3.fromDegrees(109.654541, value, 0.0)), new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
    
//        heiSection.modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
//         GmMap3D.Cartesian3.fromDegrees(109.654541, 19.797363, value)), new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());

        var sectpri = this._sectpri[mode];
        if (nav > 0)
        {
        }
        else
        {
            
        }
    }    
    
    
    MapVolume.prototype.SetBox = function(box)
    {
        this._box = box;
    }  
          
    MapVolume.prototype.GetBox = function()
    {
        return this._box;
    }     
    
    MapVolume.prototype.SetScale = function(scale)
    {
        this._scale = scale;
        this.Refresh();
    }  
    
    MapVolume.prototype.GetScale = function(scale)
    {
        return this._scale;
    }  
    
    //属性过滤
    MapVolume.prototype.Filter = function (fitArr)
    {
        if(!Array.isArray(fitArr))
        {
            return ;
        }
        if(this._filter.pri)
        {
            var pri = this._filter.pri;
            pri.appearance.material.uniforms.line = fitArr;
        }        
    } 

    //设置体模型最小高程
    MapVolume.prototype.SetMinHei = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.minHeight = value;
            }
        }
        
    }

    //设置体模型最小经度
    MapVolume.prototype.SetMinLon = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.minLongitude = value;
            }
        }
    }

    //设置体模型最小纬度
    MapVolume.prototype.SetMinLat = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.minLatitude = value;
            }
        }
    }

    //设置体模型最大高程
    MapVolume.prototype.SetMaxHei = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.maxHeight = value;
            }
        }
    }

    //设置体模型最大经度
    MapVolume.prototype.SetMaxLon = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.maxLongitude = value;
            }
        }
    }

    //设置体模型最大纬度
    MapVolume.prototype.SetMaxLat = function (value)
    {
        if(value != undefined)
        {
            if(this._vol.pri)
            {
                var pri = this._vol.pri;
                pri.appearance.material.uniforms.maxLatitude = value;
            }
        }
    }

    //设置体模型高程偏移
    MapVolume.prototype.SetOffset = function (arr)
    {
        // if(arr != undefined && Array.isArray(arr))
        // {
        //     if(this._vol.pri)
        //     {
        //         var pri = this._vol.pri;
        //         var offset = GmMap3D.Cartesian3.fromRadians(arr[0],arr[1],arr[2]);
        //         //创建平移矩阵方法二
        //         var translation=GmMap3D.Cartesian3.fromArray(arr);
        //         var model = GmMap3D.Matrix4.fromTranslation(translation);

        //         //生效
        //         this._modelMatrix = model;
        //     }
        // }
//        var height = Number(arr);
//        if (isNaN(height)) {
//            return;
//        }
//        var tileset = this._vol.pri;
//        var cartographic = GmMap3D.Cartographic.fromCartesian((tileset._boundingSpheres)[0].center);
//        var surface = GmMap3D.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
//        var offset = GmMap3D.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude,height);
//        var translation = GmMap3D.Cartesian3.subtract(offset, surface, new GmMap3D.Cartesian3());
//        tileset.modelMatrix = GmMap3D.Matrix4.fromTranslation(translation);
//        //GmMap3D.TranslationRotationScale

        this._offset = arr;
        this.Refresh();
    }


    MapVolume.prototype._calcScaleOffsetBox = function()
    {
        var newBox = {}, box = this._box, offset = this._offset, scale = this._scale;
        var xoffset= offset[0], yoffset=offset[1], zoffset= offset[2];
        var xscale = scale[0], yscale = scale[1], zscale  = scale[2];
        
        //x
        newBox.xmin = xoffset + box.xmin * xscale;
        newBox.xmax = xoffset + box.xmax * xscale;
        
        //y
        newBox.ymin = yoffset + box.ymin * yscale;
        newBox.ymax = yoffset + box.ymax * yscale;
   
        //z
        newBox.zmin = zoffset + box.zmin * zscale;
        newBox.zmax = zoffset + box.zmax * zscale;        

        return newBox;                
    }
    
    //
    MapVolume.prototype._getModelMatrix = function()
    {
        return this._vol.pri.modelMatrix;
    }
    
    MapVolume.prototype._setModelMatrix = function(mat)
    {
            this._vol.pri.modelMatrix = mat;
        
    }    

    MapVolume.prototype.SetModelMatrix = function(value,priName)
    {
        if(priName == undefined){
            this._vol.pri.modelMatrix = this.CalculateMatrix(value);
        }else{
            var priobj = this.getSecPri(priName);
            priobj.modelMatrix = this.CalculateMatrix(value);
        }
        
    } 

    MapVolume.prototype.CalculateMatrix = function (input){
        var output = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
                 GmMap3D.Cartesian3.fromDegrees(input[0], input[1], input[2])), new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
        return output;
    }
    
    //
    MapVolume.prototype._calcModelMatrix = function()
    {   
        var offset = this._offset, scale = this._scale;            
    
        var copyMat =  new GmMap3D.Matrix4(); 
    
        
        //计算原始
//        var oriMat  = this._vol.pri.geometryInstances.modelMatrix;
//        GmMap3D.Matrix4.clone(oriMat, copyMat);
               
        
        //offset
//        matrix[12] = offset[0];
//        matrix[13] = offset[1];
//        matrix[14] = offset[2];
        
        //scale
//        copyMat[0]  *= scale[0];
//        copyMat[5]  *= scale[1];
//        copyMat[10] *= scale[2];


        //
        var box  = this._box;
        var xcen = (box.xmin + box.xmax) / 2;
        var ycen = (box.ymin + box.ymin) / 2;

        //offset
        var trs = new GmMap3D.TranslationRotationScale();        
        //trs.translation = GmMap3D.Cartesian3.fromDegrees(0, 0, 0);
        
        //rotate        
        var hpr = GmMap3D.HeadingPitchRoll.fromDegrees(0.0, 0.0, 0.0, new GmMap3D.HeadingPitchRoll());
        trs.rotation = GmMap3D.Quaternion.fromHeadingPitchRoll(hpr, new GmMap3D.Quaternion());
        
        //scale
        trs.scale = GmMap3D.Cartesian3.fromElements(scale[0], scale[1], scale[2], new GmMap3D.Cartesian3())
        
        return GmMap3D.Matrix4.fromTranslationRotationScale(trs, new GmMap3D.Matrix4());        
    }
        
    MapVolume.prototype._calcParam = function()
    {
        var scale= this._scale;
        var offset=this._offset;
        var box   = this._calcScaleOffsetBox();
        
        
        //经纬度单位计算
        var xcen = (box.xmin + box.xmax) / 2;
        var ycen = (box.ymin + box.ymax) / 2;
        var zcen = (box.zmin + box.zmax) / 2;    
        var deltaH  = box.zmax - box.zmin;   
        var deltaMinH = box.zmin;
        var deltaMaxH = box.zmax;
        
        
        // 求指定经纬度所代表的长宽范围
        var a = GmMap3D.Cartesian3.fromDegrees(box.xmin, box.ymax, deltaMinH);
        var c = GmMap3D.Cartesian3.fromDegrees(box.xmin, box.ymin, deltaMinH);
        var d = GmMap3D.Cartesian3.fromDegrees(box.xmax, box.ymax, deltaMinH);
        
        //跨度
        var deltaX = Math.sqrt((d.x - a.x)*(d.x - a.x) + (d.y - a.y)*(d.y - a.y) + (d.z - a.z)*(d.z - a.z));
        var deltaY = Math.sqrt((c.x - a.x)*(c.x - a.x) + (c.y - a.y)*(c.y - a.y) + (c.z - a.z)*(c.z - a.z));

        // 求Cen几何体变换矩阵的逆矩阵
        var cenMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
                                GmMap3D.Cartesian3.fromDegrees(box.xmin, box.ymin, deltaMinH)), 
                                new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
        var invCenMatrixs = new GmMap3D.Matrix4();
        invCenMatrixs = GmMap3D.Matrix4.inverse(cenMatrix, invCenMatrixs);
        
        //平移                      
        return {
            xcen: xcen,
            ycen: ycen,
            zcen: zcen,
            deltaH: deltaH,
            deltaMinH: deltaMinH,
            deltaMaxH: deltaMaxH,
            a: a,
            c: c,
            d: d,
            deltaX: deltaX,
            deltaY: deltaY,
            cenMatrix: cenMatrix,
            invCenMatrix: invCenMatrixs          
        };
    }
    
    //1/2/3:体/属性过滤体/切片分析 
    MapVolume.prototype._CreateModel = function(mode)
    {
       'use strict';    

        var viewer = this._map.GetView();       
                
        //计算参数
        var param  = this._calcParam();
        var xcen   = param.xcen;
        var ycen   = param.ycen;
        var zcen   = param.zcen;    
        var deltaH  = param.deltaH;   
        var deltaMinH = param.deltaMinH;
        var deltaMaxH = param.deltaMaxH;
        var deltaX    = param.deltaX;
        var deltaY     = param.deltaY;
        var matrix     = param.cenMatrix;
        var invMatrixs = param.invCenMatrix;

       if (mode == 1)
       {        
            // 向shader传参
            var material = null;
            if (!this._vol.mat)
            {
               material   = this._vol.mat = new GmMap3D.Material({
                  fabric : {
                    type : 'PramLQ',
                    uniforms : {
        //              cubeTex : './radar.png',
                        cubeTex: this._url,
                        transferTex : './color.jpg',
                        invMat : GmMap3D.Matrix4.toArray(invMatrixs),
                        boxLon : deltaX,
                        boxLat : deltaY,
                        boxHeight : deltaMaxH,
                        minHeight :    0,
                        minLongitude : 0,
                        minLatitude  : 0,   
                        maxHeight : deltaMaxH,
                        maxLongitude : deltaX,
                        maxLatitude :  deltaY,
                        line : this._line

                    }
                  }
                });            
            }
            else
            {
                material = this._vol.mat;            
                material.uniforms.invMat = GmMap3D.Matrix4.toArray(invMatrixs),
                material.uniforms.boxLon = deltaX,
                material.uniforms.boxLat = deltaY,
                material.uniforms.boxHeight    = deltaMaxH,
                material.uniforms.minHeight    = 0,
                material.uniforms.minLongitude = 0,
                material.uniforms.minLatitude  = 0,   
                material.uniforms.maxHeight    =deltaMaxH,
                material.uniforms.maxLongitude = deltaX,
                material.uniforms.maxLatitude  = deltaY            
            }
            
            // 代理几何体添加到指定经纬度场景 
            var box = new GmMap3D.BoxGeometry({
                maximum : new GmMap3D.Cartesian3(deltaX, deltaY, deltaMaxH),
                minimum : new GmMap3D.Cartesian3(0.0, 0.0, deltaMinH)
            });
           
            var boxGeometry = null;
            if (this._vol.geom)
            {
                boxGeometry = this._vol.geom;
            }
            else
            {
                boxGeometry = this._vol.geom = GmMap3D.BoxGeometry.createGeometry(box);
            }
                        
            var appearance  = null;
            if (this._vol.apperance)
            {
                appearance = this._vol.apperance;            
            }
            else
            {
                appearance = this._vol.apperance = new GmMap3D.MaterialAppearance({
                        material : material,
//                        vertexShaderSource   : document.getElementById( 'vertexShaderPass' ).textContent,
//                        fragmentShaderSource : document.getElementById( 'fragmentShaderPass' ).textContent,
                        vertexShaderSource   : document.getElementById( 'filterVertexShaderPass' ).textContent,
                        fragmentShaderSource : document.getElementById( 'filterFragmentShaderPass' ).textContent,

                        faceForward : true,
                        closed : true
                      });        
            }
            
            if (!this._vol.pri)
            {
                var pri = this._vol.pri = new GmMap3D.Primitive({
                    geometryInstances : new GmMap3D.GeometryInstance({
                    geometry : boxGeometry,
                    debugShowBoundingVolume: true,
                    modelMatrix : matrix,
                    id: this._name
                    }),
                    asynchronous: false,
                    appearance : appearance
                });            
                viewer.scene.primitives.add(pri);
            }     
       }  
       else if (mode == 2)
       {   
            if (this._vol.pri) this._vol.pri.show = false;
           
            var appearance;
            var material = this._vol.mat;
            var boxGeometry = this._vol.geom;
            if (this._filter.apperance)
            {
                appearance = this._filter.apperance;            
            }
            else
            {
                appearance = this._filter.apperance = new GmMap3D.MaterialAppearance({
                        material : material,
                        vertexShaderSource   : document.getElementById( 'filterVertexShaderPass' ).textContent,
                        fragmentShaderSource : document.getElementById( 'filterFragmentShaderPass' ).textContent,
                        faceForward : true,
                        closed : true
                      });        
            }
            
            if (!this._filter.pri)
            {
                var pri = this._filter.pri = new GmMap3D.Primitive({
                    geometryInstances : new GmMap3D.GeometryInstance({
                    geometry : boxGeometry,
                    debugShowBoundingVolume: true,
                    modelMatrix : matrix,
                    id: this._name
                    }),
                    asynchronous: false,
                    appearance : appearance
                });            
                viewer.scene.primitives.add(pri);
            }            
       }  
       else
       {      
            var xstart = this._box.xmin;
            var ystart = this._box.ymin;
            var zstart = this._box.zmin; 
            this._sectpri = []; 
            // 向shader传参
            var material = new GmMap3D.Material({
              fabric : {
                type : 'PramLQ',
                uniforms : {
                    cubeTex : './radar.png',
                    transferTex : './color.jpg',
                    invMat : GmMap3D.Matrix4.toArray(invMatrixs),
                    boxLong : deltaX,
                    boxWidth : deltaY,
                    boxHeight : deltaMaxH
                }
              }
            });
                    
            //create buffer
            var nameArray  = ["lonSection", "latSection", "heiSection"];
            var sliceArray = [], normalsArray = [], texCoorsArray = [], indexsArray = [], modelMatrixArray = [];
            
            //xslice
            {
                var xSlice = new Float64Array([
                  0.000001, 0.0, 0.0,
                  0.0, deltaY, 0.0,
                  0.0, 0.0, deltaMaxH,
                  0.0, deltaY, deltaMaxH
                ]);
                var xNormals = new Float32Array([                                              
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                ]);
                var xTexCoords = new Float32Array([                                              
                  0.0, 1.0,
                  0.0, 0.5,
                  0.5, 0.0,
                  1.0, 1.0
                ]);    
                
               var modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
                         GmMap3D.Cartesian3.fromDegrees(xcen, ystart, zstart)), 
                         new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
                
                var xIndexs = new Uint32Array([0, 1, 3, 3, 2, 0]);        
                sliceArray.push(xSlice);
                normalsArray.push(xNormals);
                texCoorsArray.push(xTexCoords);
                indexsArray.push(xIndexs);   
                modelMatrixArray.push(modelMatrix);         
            }
            
            //yIndex
            {
                var ySlice = new Float64Array([                                              
                  0.0, 0.00000001, 0.0,
                  deltaX, 0.0, 0.0,
                  0.0, 0.0, deltaMaxH,
                  deltaX, 0.0, deltaMaxH
                ]);
                var yNormals = new Float32Array([                                              
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                ]);
                var yTexCoords = new Float32Array([                                              
                  0.0, 1.0,
                  0.0, 0.5,
                  0.5, 0.0,
                  1.0, 1.0
                ]);    
                
               var modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
                         GmMap3D.Cartesian3.fromDegrees(xstart, ycen, zstart)), 
                         new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());
                
                        
                var yIndexs = new Uint32Array([0, 1, 3, 3, 2, 0]);  
                sliceArray.push(ySlice);
                normalsArray.push(yNormals);
                texCoorsArray.push(yTexCoords);
                indexsArray.push(yIndexs);
                modelMatrixArray.push(modelMatrix);         
            }   
            
            //
            {
                var zSlice = new Float64Array([                                              
                  0.0, 0.0, 0.000001,
                  deltaX, 0.0, 0.0,
                  0.0, deltaY, 0.0,
                  deltaX, deltaY, 0.0
                ]);
                var zNormals = new Float32Array([                                              
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                  0.0, 0.0, 1.0,
                ]);
                var zTexCoords = new Float32Array([                                              
                  0.0, 1.0,
                  0.0, 0.5,
                  0.5, 0.0,
                  1.0, 1.0
                ]);        
                var zIndexs = new Uint32Array([0, 1, 3, 3, 2, 0]);
               var modelMatrix = GmMap3D.Matrix4.multiplyByTranslation(GmMap3D.Transforms.eastNorthUpToFixedFrame(
                         GmMap3D.Cartesian3.fromDegrees(xstart, ystart, zcen)), 
                         new GmMap3D.Cartesian3(0.0, 0.0, 0.0), new GmMap3D.Matrix4());            
                
                sliceArray.push(zSlice);
                normalsArray.push(zNormals);
                texCoorsArray.push(zTexCoords);
                indexsArray.push(zIndexs);
                modelMatrixArray.push(modelMatrix);
            }   
                    
            //create Geometry
            for (var i = 0; i < nameArray.length; i++)
            {
                var attributes = new GmMap3D.GeometryAttributes();
                attributes.position = new GmMap3D.GeometryAttribute({
                        componentDatatype : GmMap3D.ComponentDatatype.DOUBLE,
                        componentsPerAttribute : 3,
                        values : sliceArray[i] 
                    });

                attributes.normal = new GmMap3D.GeometryAttribute({
                                componentDatatype : GmMap3D.ComponentDatatype.FLOAT,
                                componentsPerAttribute : 3,
                                values : normalsArray[i]
                            });

                attributes.st = new GmMap3D.GeometryAttribute({
                        componentDatatype : GmMap3D.ComponentDatatype.FLOAT,
                        componentsPerAttribute : 2,
                        values : texCoorsArray[i]
                    });

                var geo = new GmMap3D.Geometry({
                    attributes : attributes,
                    indices : indexsArray[i],
                    primitiveType : GmMap3D.PrimitiveType.TRIANGLES,
                    boundingSphere : GmMap3D.BoundingSphere.fromVertices(sliceArray[i]),
                });

                var pri = new GmMap3D.Primitive({
                    geometryInstances : new GmMap3D.GeometryInstance({
                        geometry : geo,                 
                        id : nameArray[i]
                    }),
                    modelMatrix : modelMatrixArray[i],
                    asynchronous: false,
                    appearance : new GmMap3D.MaterialAppearance({
                        material : material,
                        vertexShaderSource   : document.getElementById( 'sliceVertexShaderPass' ).textContent,
                        fragmentShaderSource : document.getElementById( 'sliceFragmentShaderPass' ).textContent,
                        faceForward : true
                    })
                });
                this._sectpri.push(pri);
                viewer.scene.primitives.add(pri);        
            }    
       }   
    }

    MapVolume.prototype.getSecPri = function (name)
    {
        var secpriArr = this._sectpri;
        var secpri = null;
        for(var i = 0; i < secpriArr.length; i++){
            if((secpriArr[i]._instanceIds)[0] == name){
                secpri = secpriArr[i];
                break;
            }
        }
        return secpri;
    }

        

    Map3DSDK.MapVolume = MapVolume;   

})();