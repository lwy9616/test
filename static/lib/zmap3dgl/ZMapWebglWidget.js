var ZMap = ZMap || {};
ZMap.WebglMapWidget = ZMap.WebglMapWidget || {};
(function() {
    //地图方法
    ZMap.WebglMapWidget.init = function init(mapcode, tileOptions, viewOptions) {
        var self = this;
        this.zmap3dview = new ZMap3D.Map(mapcode,  tileOptions, viewOptions); 
        self.zmap3dview.AddControl(new GmMap3D.MousePositionCtl({map: self.zmap3dview}));
        self.zmap3dview.RegisterKeyBoard();
        this.zmap3dtool = new ZMap3DLib.Input3DTool(self.zmap3dview);

        this.entityGeo =self.zmap3dview.zmapGeometry =self.zmap3dview.zmapGeometry || new ZMAPGEOMETRY(self.zmap3dview); 

        this.center = [105,36];
        this.zoom = 5;
        self.zmap3dview.CenterAndZoom(self.center, self.zoom);
        this.removeLayer = function(name)
        {
            var imageLayer = self.zmap3dview.GetUnkLayer(name);
            if(imageLayer)
            {
                self.zmap3dview.RemoveLayer(imageLayer);
            }
        }

        this.addMapLayer = function(param)
        {
            if(param.name)
            {
                self.removeLayer(param.name);
            }
            else{
                return;
            }
            var imageLayer = new Cegore.ImageLayer({
                    name :  param.name||"tdtAnnoLayer",
                    type : param.maptype||"UrlTemplate",
                    url: param.url||'http://t0.tianditu.com/cia_w/wmts?service=WMTS&version=1.0.0&request=GetTile&Tilematrix={TileMatrix}&layer=cia&style=default&TileRow={TileRow}&TileCol={TileCol}&tilematrixset=w&format=tiles',
                    visible: param.visible||true,
                    maximumLevel: param.maxZoom||18, // 设置最大显示层级
                    customTags : {
                        TileMatrix: function(imageryProvider, x, y, level) {
                            return level;
                        },
                        TileRow: function(imageryProvider, x, y, level) {
                            return y;
                        },
                        TileCol: function(imageryProvider, x, y, level) {
                            return x;
                        }               
                    } ,           
                    scheme:"Geographic-level-0"        
                });       
            self.zmap3dview.AddLayer(imageLayer);
            return imageLayer;
        }

        this.Add3DTileMapLayer = function (paaram)
        {
            if(param.name)
            {
                removeLayer(param.name);
            }
            else{
                return;
            }
            var imageLayer = new Cegore.ImageLayer({
                    name :  paaram.name,
                    type : paaram.maptype,
                    url: paaram.url,
                    visible: param.visible||true,
                    maximumLevel: param.maxZoom||18, // 设置最大显示层级
                    scheme:"Geographic-level-0"        
                });    
            self.zmap3dview.AddLayer(imageLayer); 
            return imageLayer;   
        }

        //测试雷达NC数据层
        this.AddRadarLayer = function(paaram)
        {
            if(param.name)
            {
                removeLayer(param.name);
            }
            else{
                return;
            }
            var imageLayer = new Cegore.NetCDFImageLayer({
                    name :  paaram.name,
                    type : paaram.maptype,
                    type : 'ZMapNetCDFImage',
                    url: paaram.url,
                    visible: param.visible||true,
                    maximumLevel: param.maxZoom||18, // 设置最大显示层级
                    scheme:"Geographic-level-0"        
                });    
            self.zmap3dview.AddLayer(imageLayer); 
            return imageLayer;   
        }




        this.PointQuery = function(options,callbcak)
        {
            function drawStart(e)
            {
            }

            function drawEnd(e)
            {
                self.entityGeo.removeEntityById('testPoint');
                var pts = e.geometry;
                if (pts)
                {
                    self.addPoint({
                        id:'testPoint',
                        dcolor:options.color,
                        doutlineColor:options.color,
                        position:pts,
                        dpixelSize:options.pixelSize||5
                    })
                    //map3DTool.ClearAll();
                    if (callbcak != 0 && typeof callbcak === "function") callbcak(pts);
                }
                self.zmap3dtool.ClearAll();
            }
            AddFlashTip("左键单击开始画点", 2000);
            self.zmap3dtool.StartPointTool(drawStart, drawEnd);
        }

        this.CircleQuery = function(options,callbcak)
        {
            self.entityGeo.removeEntityById("testCircle");
            function drawStart(e)
            {
            }

            function drawEnd(e)
            {
                var pts = e.geometry;
                if (pts)
                {
                   
                    // var circleGeometry = new Map3DSDK.Circle(pts,false);
                    //self.zmap3dview.AddGeometrys("testCircle", circleGeometry, options); //color可不传，默认黄色
                    //AddFlashTip("结束画矩形", 1000);  
                    
                    //map3DView.AddEntity("testCircle",[coords]); 
                    //self.entityGeo.removeEntityById('testCircle');
                    var id = options.id || "testCircle";
                    var dsemiMajorAxis =   GmMap3D.Math.toRadians(pts.radius)*GmMap3D.Ellipsoid.WGS84._maximumRadius
                    var a = self.addEllipse({
                        id: id,
                        position: [pts.center],
                        dheight:pts.height||pts.center[2]||0.1,
                        dextrudedHeight:pts.height||pts.center[2]||0.1,
                        doutlineColor: options.outlineColor || 'red',
                        dsemiMajorAxis: dsemiMajorAxis,//
                        dsemiMinorAxis: dsemiMajorAxis,
                        dmaterial: {
                            materialName: "dGridMaterial",
                            dcolor: options.color || 'rgba(255,255,0,1)',
                            dcellAlpha: 0.5,
                            dlineThickness: [1.0, 1.0]
                        }
                    })

                    self.zmap3dtool.ClearAll(); 

                    if (callbcak != 0 && typeof callbcak === "function") callbcak(pts,a,options);
                }
            }
            AddFlashTip("左键开始画圆形，左键双击结束画圆形", 2000);


            var drawOption = {
                material: new GmMap3D.Material({
                    fabric : {
                        type : 'Color',
                        uniforms : {
                            color : options.color ? this.zmap3dview.colorTransform(options.color) : GmMap3D.Color.WHITE,
                        }
                    }
                })
            }


            self.zmap3dtool.StartCircleTool(drawStart, drawEnd,drawOption);

        }

        this.PolyQuery = function(options,callbcak)
        {
            var polygon = "";
            function LineStart(e)
            {
            }

            function LineEnd(e)
            {
                self.entityGeo.removeEntityById('testPolygon');
                var pts = e.geometry;
                if (pts)
                {
                    polygon  = pts[0].join(",") + ";";
                    polygon += pts[1].join(",");
                    AddFlashTip("结束画多边形", 1000); 
                    
                    //map3DView.AddEntity("testpolygon",[pts]); 
                    // var polyGeometry = new Map3DSDK.Polygon(pts,false);
                    // self.zmap3dview.AddGeometrys("testpolygon", polyGeometry, options); //color可不传，默认黄色
                    // self.zmap3dtool.ClearAll(); 
                    for(var i=0;i<pts.length;i++)
                    {
                        pts[i][2] = pts[i][2]||1;
                    }

                    var option ={
                        id:'testPolygon',
                        position:pts,
                        doutline : true,
                        dperPositionHeight :true,
                        doutlineColor :options.outlineColor||'rgba(255,255,0,1)',
                        doutlineWidth:2,
                        dmaterial : {
                            materialName : "dGridMaterial",
                            dcolor:options.color||'rgba(255,255,0,1)',
                            dcellAlpha : 0.5,
                            dlineThickness : [1.0,1.0]
                        }
                    }
                    self.addPolygon(option);

                    if (callbcak != 0 && typeof callbcak === "function") callbcak(pts);
                }
            }
            AddFlashTip("左键开始画多边形，左键双击结束画多边形", 2000);
            var  material =  {
                materialName : "dGridMaterial",
                dcolor:options.color||'rgba(255,255,0,1)',
                doutlineColor:options.outlineColor||'rgba(255,255,0,1)',
                dcellAlpha : 0.5,
                dlineThickness : [1,1]
            };
            var drawOption = {
                lineWidth:options.outlineWidth||1,
                material: new GmMap3D.Material({
                    fabric : {
                        type : 'Grid',
                        uniforms : {
                            color : material.dcolor ? this.zmap3dview.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                            //outlineColor:material.doutlineColor ? this.zmap3dview.colorTransform(material.doutlineColor) : GmMap3D.Color.WHITE,
                            //outlineWidth:options.outlineWidth||2
                            cellAlpha : material.dcellAlpha ? Number(material.dcellAlpha) : 0.1,
                            lineCount : material.dlineCount ? new GmMap3D.Cartesian2(Number(material.dlineCount[0]),Number(material.dlineCount[1])) : new GmMap3D.Cartesian2(8, 8),
                            lineThickness : material.dlineThickness ? new GmMap3D.Cartesian2(Number(material.dlineThickness[0]),Number(material.dlineThickness[1])) : new GmMap3D.Cartesian2(1.0, 1.0),
                            lineOffset : material.dlineOffset ? new GmMap3D.Cartesian2(Number(material.dlineOffset[0]),Number(material.dlineOffset[1])) : new GmMap3D.Cartesian2(0.0, 0.0)
                        }
                    }
                })
            }


            self.zmap3dtool.StartPolygonTool(LineStart, LineEnd,drawOption);
        }

        this.RectQuery = function(options,callbcak)
        {
            
            function drawStart(e)
            {
            }

            function drawEnd(e)
            {
                self.entityGeo.removeEntityById('testRectangle');
                var extent = e.geometry;
                var coords = [];
                coords.push([extent[0], extent[1],e.height||0]);
                coords.push([extent[2], extent[1],e.height||0]);
                coords.push([extent[2], extent[3],e.height||0]);
                coords.push([extent[0], extent[3],e.height||0]);
                coords.push([extent[0], extent[1],e.height||0]);
                

                AddFlashTip("结束画矩形", 1000); 
                // map3DView.AddEntity("testRectangle",[coords]);
                // var polyGeometry = new Map3DSDK.Polygon(coords,false);
                // self.zmap3dview.AddGeometrys("testRectangle", polyGeometry, options); //color可不传，默认黄色

                for(var i=0;i<coords.length;i++)
                {
                    coords[i][2] = coords[i][2]||1;
                }
                var option ={
                    id:'testRectangle',
                    position:coords,
                    doutline : true,
                    dperPositionHeight :true,
                    doutlineColor : options.outlineColor||'rgba(255,255,0,1)',
                    doutlineWidth:2,
                    dmaterial : {
                        materialName : "dGridMaterial",
                        dcolor:options.color||'rgba(255,255,0,1)',
                        dcellAlpha : 0.5,
                        dlineThickness : [1.0,1.0]
                    }
                }
                self.addPolygon(option);
                self.zmap3dtool.ClearAll(); 
                if (callbcak != 0 && typeof callbcak === "function") callbcak(extent);
            };

            
            AddFlashTip("左键按下开始画矩形，左键抬起结束画矩形", 2000);


            var  material =  {
                materialName : "dGridMaterial",
                dcolor:options.color||'rgba(255,255,0,1)',
                doutlineColor:options.outlineColor||'rgba(255,255,0,1)',
                dcellAlpha : 0.65,
                dlineThickness : [1,1]
            };
            var drawOption = {
                lineWidth:options.outlineWidth||1,
                material: new GmMap3D.Material({
                    fabric : {
                        type : 'Grid',
                        uniforms : {
                            color : material.dcolor ? this.zmap3dview.colorTransform(material.dcolor) : GmMap3D.Color.WHITE,
                            //outlineColor:material.doutlineColor ? this.zmap3dview.colorTransform(material.doutlineColor) : GmMap3D.Color.WHITE,
                            //outlineWidth:options.outlineWidth||2
                            cellAlpha : material.dcellAlpha ? Number(material.dcellAlpha) : 0.1,
                            lineCount : material.dlineCount ? new GmMap3D.Cartesian2(Number(material.dlineCount[0]),Number(material.dlineCount[1])) : new GmMap3D.Cartesian2(8, 8),
                            lineThickness : material.dlineThickness ? new GmMap3D.Cartesian2(Number(material.dlineThickness[0]),Number(material.dlineThickness[1])) : new GmMap3D.Cartesian2(1.0, 1.0),
                            lineOffset : material.dlineOffset ? new GmMap3D.Cartesian2(Number(material.dlineOffset[0]),Number(material.dlineOffset[1])) : new GmMap3D.Cartesian2(0.0, 0.0)
                        }
                    }
                })
            }
            self.zmap3dtool.StartRectTool(drawStart, drawEnd,drawOption);
        }

        this.LineQuery = function(options,callbcak)
        {
            var line = "";
            function drawStart(e)
            {
            }

            function drawEnd(e)
            {
                var pts = e.geometry;
                if (pts)
                {
                    // line  = pts[0].join(",") + ";";
                    // line += pts[1].join(",");
                    AddFlashTip("结束画线", 1000); 
                    //var linGeometry = new Map3DSDK.MultiLine(pts, false, {width:3});
                    //self.zmap3dview.AddGeometrys("testLine", linGeometry, options); //color可不传，默认黄色
                    for(var i=0;i<pts.length;i++)
                    {
                        pts[i][2] = pts[i][2]||0;
                    }
                    self.entityGeo.removeEntityById("testLine");
                    self.addLine({
                        id: 'testLine',
                        position: pts,
                        dfollowSurface: true,
                        dclampToGround: true,
                        dwidth: options.lineWidth? options.lineWidth:5,
                        dmaterial: {
                            materialName: "dPolylineOutlineMaterialProperty",
                            dcolor: options.color || 'rgba(255,255,0,1)',
                            doutlineColor: options.outlineColor || 'rgba(255,255,0,1)',
                            doutlineWidth: 0,
            
        
                        }
                    })

                    // options['id'] = 'testLine';
                    // options['position'] = pts;
                    // options['dfill'] =  options['color'];
                    // options['doutlineColor'] =  options['color'];
                    // self.addPolyline(options)

                    //map3DView.AddEntity("testLine",pts);
                    //map3DTool.ClearAll(); 
                    self.zmap3dtool.ClearAll(); 
                    if (callbcak != 0 && typeof callbcak === "function") callbcak(pts);
                }
            }
            AddFlashTip("左键单击开始画线，双击结束画线", 2000);
            var drawOption = {
                material: new GmMap3D.Material({
                    fabric : {
                        type : 'Color',
                        uniforms : {
                            color : options.color ? this.zmap3dview.colorTransform(options.color) : GmMap3D.Color.RED
                        
                        }
                    }
                })
            }
            self.zmap3dtool.StartLineTool(drawStart, drawEnd,drawOption);
        }


        this.addPoint = function(options)
        {
            return self.entityGeo.addPoint(options)
        }

        this.addPoints = function(options)
        {
            return self.entityGeo.addPoints(options)
        }
        this.addLine = function(options)
        {
            return self.entityGeo.addLine(options)
        }
        this.addPolygon = function(options)
        {
            return self.entityGeo.Addpolygon(options)
        }
        this.addEllipse = function(options)
        {
            return self.entityGeo.addellipse(options)
        }





        this.toolClearAll = function()
        {
            self.entityGeo.removeEntityById('testLine');
            self.entityGeo.removeEntityById('testRectangle');
            self.entityGeo.removeEntityById('testPolygon');
            self.entityGeo.removeEntityById('testCircle');
            self.entityGeo.removeEntityById('testPoint');
            CloseFlashTip();
            self.zmap3dtool.ClearAll();
        }

        //添加提示
        var onlyTip = null;
        function  AddFlashTip(text, miniSeconds)
        {
            CloseFlashTip();
            if (onlyTip == null)
            {
                if (miniSeconds == null) miniSeconds = 3000;
                var cen = self.zmap3dview.GetViewCenter();
                if (cen == null)
                {
                    this.CloseFlashTip();
                    return ;
                }
                self.zmap3dview.AddTextLabel('only-tip', cen[0], cen[1], text,{
                    id : "TextLabel",
                    position : [119.345,23.4546,0],
                    dtext : "测试文字标注",//设置text文本
                    dfont : '15px 宋体',//设置字体和字体的类型
                    dstyle : "FILL_AND_OUTLINE",
                    dfillColor : "rgba23,34,34,0",
                    doutlineColor : "red",
                    doutlineWidth : 1,
                    dshowBackground : false,
                    dscale : 1,
                    // dbackgroundColor : "blue",//new GmMap3D.Color(0.165, 0.165, 0.165, 0.8)
                    dhorizontalOrigin : "CENTER",
                    dverticalOrigin : "CENTER",
                    deyeOffset  : [0.0, 0.0, 0.0],
                    ddistanceDisplayCondition  : [10, 20000000],
                    dscaleByDistance : [10.0,2,8000000.0,0.0]

                });
                onlyTip = window.setInterval(CloseFlashTip, miniSeconds);
            }
        }

        //关闭提示
        function CloseFlashTip()
        {
            if (onlyTip != null)
            {
                self.zmap3dview.RemoveLabel('only-tip');
                window.clearInterval(onlyTip);
                onlyTip = null;        
            }
        }

        this.getCenter = function()
        {
            var center = self.zmap3dview.GetViewCenter();
            return center;
        }

        this.getZoom = function()
        {
            var zoom = self.zmap3dview.GetZoom();
            return zoom;
        }

        this.getCegore = function()
        {
            var cegore = self.zmap3dview.GetCegore();            
            return cegore;
        }

        this.getCesium = function()
        {
            var cesium = self.zmap3dview.GetCesium();        
            return cesium;
        }


        this.addModel = function(param)
        {
            var modelId = param.id||"testModel";
            var obj = {
                position: param.position||[110.05254, 25.002073, 0],
                rotate: param.rotate||[0, 0, 0],
                shadows: param.shadows||true,
                url: param.url||'./gltf/WoodTower/Wood_Tower.gltf'
            };
            self.zmap3dview.AddModel(modelId,obj);
        }

        this.removeModel = function(id)
        {
            self.zmap3dview.RemoveModel(id);
        }

        this.rotateModel = function(id,rotate)
        {
            self.zmap3dview.RotateModel(id,rotate);
        }

        this.getModel = function(id)
        {
            return self.zmap3dview.GetModel(id);
        }

        this.pickModel = function(c)
        {
            return self.zmap3dview.PickModel(c);
        }

        /*********/

        this.dztModel = function(id,url,pos,load,callback)
        {
            return self.zmap3dview.addZmapModel(id,url,pos,load,callback);
        }
        /*********/
        this.zmap3DTilesModel = new ZMAP3DTILES(self.zmap3dview);
        
        this.add3DTiless = function(param,isfly,loadcallback,colorcallback)
        {
            self.zmap3DTilesModel.add3dTiles(param,isfly,loadcallback,colorcallback);
        }


        /*********/
        
        this.moveRotateModel = function()
        {
            
        }


        this.getCamera = function(){
            return self.zmap3dview.getCamera();
        }

        this.setCamera = function(options)
        {
            self.zmap3dview.setCamera(options);
        }
    }

})();