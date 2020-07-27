// JScript 文件
//********************************************************************************************
//                 Map3DSDK V2.0  本版本的接口都为经纬度坐标
//*********************************************************************************************//
var globeMap3D = {};
var GmMap3D  = Cesium;
var ZMAP3D   = GmMap3D;
var Map3DSDK = Map3DSDK || {};


(function() {
     /** 
     * @exports map3d as Map3DSDK.Map 
     */

    var map3d  =   
    Map3DSDK.Map = function Init3DView(divID, tileOptions, viewOptions){
        
        var terrain = null, images = null;
        if(viewOptions && viewOptions != undefined && viewOptions != null){
            if(viewOptions.terrain){
                terrain = viewOptions.terrain;
            }
            if(viewOptions.images){
                images = viewOptions.images;
            }else{
                images = [
                    {
                        name : "tdt",  //'TdtImage',
                        type : "UrlTemplate",   //'ZMapImage',
                        //url: 'http://t0.tianditu.gov.cn/DataServer?T=img_w&x={x}&y={y}&l={z}&tk=3e3d542dbde8cd9af3b820d693f18746',
                        url: 'http://www.google.cn/maps/vt?lyrs=s@748&gl=cn&x={x}&y={y}&z={z}',
                        visible: true,
                        maximumLevel: 18, // 设置最大显示层级
                        scheme:"Geographic-level-0"
                    }
                ];
            }
        }
        var cegoreParam = null;
        if(terrain != null){
            cegoreParam =  {
                fullscreenElement: divID,
                fullscreenButton: false,
                geocoder: false,
                sceneMode: GmMap3D.defaultValue(viewOptions.sceneMode, GmMap3D.SceneMode.SCENE3D),

        //        czops: {
        //            skyAtmosphere: false
        //        },
                 terrain: terrain,
                //  {
                //   type: 'UrlTemplate', //'ZMapTerrain',
                //   url:  'http://10.148.10.131:9080/zs/data/Tdt/Terrain3d',
                //   tileWidth : 64,
                //   tileHeight : 64,
                //     //waterMask: true,
                //     //waterHeight : 0,
                //   heightOffset: 0,
                //   tilingScheme: new GmMap3D.GeographicTilingScheme({
                //             ellipsoid: GmMap3D.Ellipsoid.WGS84,
                //             numberOfLevelZeroTilesX:8,
                //             numberOfLevelZeroTilesY:4
                //         })
                // },
                images:images,
                currentTime: new Date(2017,12,26,12,0,0),
                infoBox:false,
                animation:false,
                shouldAnimate:true
            };
        }else{
            cegoreParam =  {
                fullscreenElement: divID,
                fullscreenButton: false,
                sceneMode: GmMap3D.defaultValue(viewOptions.sceneMode, GmMap3D.SceneMode.SCENE3D),           
                geocoder: false,
//                czops: {
//                    skyAtmosphere: true
//               },
                 //terrain: terrain,
                //  {
                //   type: 'UrlTemplate', //'ZMapTerrain',
                //   url:  'http://10.148.10.131:9080/zs/data/Tdt/Terrain3d',
                //   tileWidth : 64,
                //   tileHeight : 64,
                //     //waterMask: true,
                //     //waterHeight : 0,
                //   heightOffset: 0,
                //   tilingScheme: new GmMap3D.GeographicTilingScheme({
                //             ellipsoid: GmMap3D.Ellipsoid.WGS84,
                //             numberOfLevelZeroTilesX:8,
                //             numberOfLevelZeroTilesY:4
                //         })
                // },
                images:images,
                currentTime: new Date(2017,12,26,12,0,0),
                infoBox:false,
                animation:false,
                shouldAnimate:true
            };
        }

        if(tileOptions&&typeof tileOptions =='object')
        {
            var tk = Object.keys(tileOptions)
            for(var i=0;i<tk.length;i++)
            {
                cegoreParam[tk[i]] = tileOptions[tk[i]]
            }
        }
        

        var cegore = new Cegore.Viewer(divID,cegoreParam);
        
        cegore.camera.setView({
            rect: [-95.59, 40.03, -95.60, 40.04]
        });
        
        this.divID           = divID;
        this.cegore          = cegore;
        this.cesium          = cegore._czData;
        globeMap3D[divID]    = this;   
        this._initq          = new ZMAP3D.Quaternion(-0.5, -0.5, -0.5, 0.5);
        this.handlerArray    = []; //存储所有的监听事件
        this.taskLoadMap     = {};
        
        //根据距离求等级
        this.dmap = [61437120, 30718560, 22914940, 15003300, 7679640, 3839820, 1484560, 763000, 381010,
        196080, 91300, 46070, 23210, 11290, 5730, 2900, 1450, 750, 360, 180, 100, 50];

        // 鼠标状态标志
        this.Keyflags = {
            looking : true,
            moveUp : false,// 向上
            moveLeft : false,// 向左
            moveRight : false,// 向右
            moveForward : false, // 向前
            moveBackward : false // 向后            
        };
        
        this.controls = {};
        this.layerMap = {};//存储图层
        
        
        // extend our view by the cesium navigation mixin
        viewOptions = viewOptions || { navigation : true, mousePosition: true };
        if (viewOptions.navigation)
        {
            try{
               this.cesium.viewer.extend(GmMap3D.viewerCesiumNavigationMixin, {});       
            }catch(e)
            {}           
        }       
        
        if (viewOptions.mousePosition)
        {
            this.AddControl(new ZMAP3D.MousePositionCtl());
        }
        
        this.cesium.viewer.scene.globe.depthTestAgainstTerrain = false; //开启视图会被遮挡
        this.cesium.viewer.scene.rethrowRenderErrors = false;
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);

        /*--weili  鼠标双击解除锁定--*/
        Map3DSDK.map3DView = this;
        var self = this;
        this.dbClick = this.AddEventListener('dblclick',function(movement){
            var client = movement.position;
            var pick = self.PickModel(client);
            var pickedFeature = pick.models;
            if (!GmMap3D.defined(pickedFeature)) {
                self.unLockModel();
                return;
            }
        })

        /*--weili  鼠标滚动根据高程缩放entitys--*/
        this.mouseWheel = this.AddEventListener('wheel',function(){
            var cop = self.getCamera();
            var height = cop.position[2];
            var entitys = self.GetView().entities.values;
            // Math.log(height)/Math.log(2);
            
            for(var i=0;i<entitys.length;i++)
            {
                if(entitys[i].model)
                {
                    if(entitys[i].model&&entitys[i].scaleBase&&typeof entitys[i].scaleBase =='number')
                    {
                        var zs =height/entitys[i].scaleBase<1?1:height/entitys[i].scaleBase;
                        self.changeScaleModel(entitys[i],zs)
                    }
                }
                
            }
        })

        this.fullscreenViewModel = new ZMAP3D.FullscreenButtonViewModel(divID);
        
        window.addEventListener("mousewheel", function(e)  { 
            if (e.deltaY === 1) {
                 e.preventDefault();
             }
         }) ;
         
         
         //绘制异常抛出问题
         function startRenderLoop(widget) {
            widget._renderLoopRunning = true;
    
            var lastFrameTime = 0;
            function render(frameTime) {
                if (widget.isDestroyed()) {
                    return;
                }
    

                try {
                    var targetFrameRate = widget._targetFrameRate;
                    if (!Cesium.defined(targetFrameRate)) {
                        widget.resize();
                        widget.render();
                        requestAnimationFrame(render);
                    } else {
                        var interval = 1000.0 / targetFrameRate;
                        var delta = frameTime - lastFrameTime;

                        if (delta > interval) {
                            widget.resize();
                            widget.render();
                            lastFrameTime = frameTime - (delta % interval);
                        }
                        requestAnimationFrame(render);
                    }
                } catch (error) {
                    requestAnimationFrame(render);
                }
            }
    
            requestAnimationFrame(render);
        }

        startRenderLoop(this.cesium.viewer.cesiumWidget);
               
        //
        var defaultBoundingSphere = new ZMAP3D.BoundingSphere(Cesium.Cartesian3.ZERO, 6378137);
        var old_Cesium_Globe_pickWorldCoordinates = ZMAP3D.Globe.prototype.pickWorldCoordinates;
        ZMAP3D.Globe.prototype.pickWorldCoordinates = function(ray, scene, result)
        {
            var ins = old_Cesium_Globe_pickWorldCoordinates.call(this, ray, scene, result);
            if (Cesium.defined(ins))
            {
                return ins;
            }
		/*

            var inv = ZMAP3D.IntersectionTests.raySphere(ray, defaultBoundingSphere);
            if (ZMAP3D.defined(inv))
            {
                return ZMAP3D.Ray.getPoint(ray, inv.start != 0 ? inv.start : inv.stop, result);
            }

            return inv; */
        };   
        
        //设置地形碰撞
        var options =  { enableCollisionDetection: false, depthTestAgainstTerrain : false};
        this.enable(options);       
        
        options = { minAngle: 0, minHeight: -10000, minimumZoomDistance: 10};        
        this.setInputParam(options);        
        this.checkpower();               
    }
    
    map3d.prototype.checkpower       = function()
    {
		var authorizer = decodeURIComponent('%E5%BD%93%E5%89%8D%E7%B3%BB%E7%BB%9F%E4%B8%BA%E8%AF%95%E7%94%A8%E7%89%88%EF%BC%8C%E6%9C%AA%E6%AD%A3%E5%BC%8F%E6%8E%88%E6%9D%83');
		$.ajax({
			url: window.location.protocol + "//" + window.location.host + "/" + 'zs/cms/lic/q',
			dataType: 'json',
			success: function (data) {
				if (data.lic) {
					if (data.lic.authorizer && data.lic.authorizer != "") {
						authorizer = data.lic.authorizer;
					}
				}
			}
		})
		var Str   = randomString(32);
		var param = CodeString(Str);
		var status = decodeURIComponent('%E6%97%A0%E6%B3%95%E8%8E%B7%E5%8F%96%E8%AF%81%E4%B9%A6%E4%BF%A1%E6%81%AF%E6%88%96%E8%80%85%E8%AF%81%E4%B9%A6%E5%B7%B2%E8%BF%87%E6%9C%9F');
		$.ajax({
			url: window.location.protocol + "//" + window.location.host + '/zs/cms/lic/check',
			type: 'GET',
			data: { 'param': param, 'version': 6.0 },
			async: true,
			success: function (data) {
				var sign = data.sign;
				if (Str == sign) {
					if (data.lic.status == "OK") {
						status = '';
					}
				}
			}
		});     
		$('#' + this.divID).append("<span style='position:absolute;right:2px;bottom:2px;color:#fff;font-size:12px;' >"+authorizer+"</span>");	   
    }
    

    /*--weili  设置地形--*/
    map3d.prototype.setTerrain  = function(options)
    {
        var terrain = {
            type: options.type||'ZMapTerrain',
            url: options.url||'',
            tileWidth : options.tileWidth||64,
            tileHeight :options.tileHeight|| 64,
            waterMask: options.waterMask?true:false,
            waterHeight : options.waterHeight?options.waterHeight:0,
            heightOffset: options.heightOffset?options.heightOffset:0,
            tilingScheme: new GmMap3D.GeographicTilingScheme({
                      ellipsoid:options.ellipsoid||GmMap3D.Ellipsoid.WGS84,
                      numberOfLevelZeroTilesX:options.numberOfLevelZeroTilesX?options.numberOfLevelZeroTilesX:8,
                      numberOfLevelZeroTilesY:options.numberOfLevelZeroTilesY?options.numberOfLevelZeroTilesY:4
                  })
          }
        if (Cegore.TypeCheck.isObject(terrain)) {
            this.cegore.globe.setTerrain(terrain);
        }
    }
    
    //内部交互对象
    map3d.prototype.getScreenSpaceCameraController = function()
    {
        return this.cesium.viewer.scene._screenSpaceCameraController;
    }
    
    //启用和关闭地形检测 { enableCollisionDetection: true, depthTestAgainstTerrain : false}
    map3d.prototype.enable  = function(option)
    {
        if (ZMAP3D.defined(option.enableCollisionDetection))
        {
            this.getScreenSpaceCameraController().enableCollisionDetection =  option.enableCollisionDetection;
        }
        
        if (ZMAP3D.defined(option.depthTestAgainstTerrain))
        {
            this.cesium.viewer.scene.globe.depthTestAgainstTerrain = option.depthTestAgainstTerrain; //开启视图会被遮挡       
        }
        
        if (ZMAP3D.defined(option.rethrowRenderErrors))
        {
           this.cesium.viewer.scene.rethrowRenderErrors = option.rethrowRenderErrors;
        }
    }

/*    
    enableCollisionDetection: false
    enableInputs: true
    enableLook: true
    enableRotate: true
    enableTilt: true
    enableTranslate: true
    enableZoom: true
    inertiaSpin: 0.9
    inertiaTranslate: 0.9
    inertiaZoom: 0.8
    maximumMovementRatio: 0.1
    maximumZoomDistance: Infinity
    minimumCollisionTerrainHeight: 150000
    minimumPickingTerrainHeight: 150000
    minimumTrackBallHeight: 7500000
    minimumZoomDistance: 100   
    _maximumRotateRate: 1.77
    _maximumZoomRate: 5906376272000
    _minAngle: 0
    _minHeight: -10000
    _minimumCollisionTerrainHeight: 150000
    _minimumPickingTerrainHeight: 150000
    _minimumRotateRate: 0.0002
    _minimumTrackBallHeight: 7500000
    _minimumZoomRate: 20
    _rotateFactor:1.567855942887398 e-7    
     */
    
    map3d.prototype.setInputParam  = function(options)
    {
        var controller    = this.getScreenSpaceCameraController();        
        if (ZMAP3D.defined(options.minAngle)){
            controller._minAngle = options.minAngle;        
        }        
        if (ZMAP3D.defined(options.minHeight)){
            controller._minHeight= options.minHeight;  
        }
        if (ZMAP3D.defined(options.minimumZoomDistance)){
            controller.minimumZoomDistance = options.minimumZoomDistance;
        }
        
        //        
        for (var key in options)
        {
            if (ZMAP3D.defined(options[key]))
               controller[key] = options[key];
        }
    }
    

    /*--weili  切换成2d--*/
    map3d.prototype.morphTo2D = function()
    {
        this.cesium.scene.morphTo2D()
    }

    /*--weili  切换成3d--*/
    map3d.prototype.morphTo3D = function()
    {
        this.cesium.scene.morphTo3D()
    }

    /*--weili  切换成2.5d--*/
    map3d.prototype.morphToColumbusView = function()
    {
        this.cesium.scene.morphToColumbusView()
    }
    /*--weili  全屏--*/
    map3d.prototype.fullscreen = function()
    {
        this.fullscreenViewModel.command()
    }

    map3d.prototype.GetCegore  = function()
    {
        return this.cegore;
    } 
    
    map3d.prototype.GetCesium  = function()
    {
        return this.cesium;
    }
    
    map3d.prototype.EnableDebug = function(enable)
    {
        if (enable)
        {
            this.cesium.viewer.extend(GmMap3D.viewerCesiumInspectorMixin);               
        }
        else
        {
            //this.cesium.viewer.remove(GmMap3D.viewerCesiumInspectorMixin);
        }
    }

    map3d.prototype.setControlsBackground = function(background)
    {
        $('#setControlsBackground').remove();
        var style = '<style id="setControlsBackground">.compass-outer-ring-background{border-color:'+background+'}.compass-outer-ring-background,.compass-gyro-background,.navigation-controls{background:'+background+'}.</style>'
        $('head').append(style);
    }
    
        
    //获取cesium Map
    map3d.prototype.GetMap  = function()
    {
        return this.cesium;
    }

    map3d.prototype.GetView  = function()
    {
        return this.cesium.viewer;
    }
    
    map3d.prototype.SetKeyBoardMsg   = function(options)
    {
        this.Keyflags = options;                                
    }
    
    map3d.prototype.GetKeyBoardMsg   = function()
    {
        return this.Keyflags;                                
    }    
    
    map3d.prototype.RegisterKeyBoard = function()
    {
        // 鼠标开始位置
        var startMousePosition = {};

        // 鼠标位置
        var mousePosition = {};    
                
        var viewer    = this.GetView();
        var canvas    = viewer.canvas;
        var ellipsoid = viewer.scene.globe.ellipsoid; // 获取地球球体对象        
        var handler = new GmMap3D.ScreenSpaceEventHandler(canvas);

        // 接收用户鼠标（手势）事件
//        handler.setInputAction(function(movement) {
//            // 处理鼠标按下事件
//            // movement: 接收值为一个对象，含有鼠标单击的x，y坐标
//            flags.looking = true;
//            // 设置鼠标当前位置
//            mousePosition = startMousePosition = GmMap3D.Cartesian3.clone(movement.position);
//        }, GmMap3D.ScreenSpaceEventType.LEFT_DOWN);

//        handler.setInputAction(function(movement) {
//            // 处理鼠标移动事件
//            // 更新鼠标位置
//            mousePosition = movement.endPosition;
//        }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

//        handler.setInputAction(function(position) {
//            // 处理鼠标左键弹起事件
//            flags.looking = false;
//        }, GmMap3D.ScreenSpaceEventType.LEFT_UP);

        // 对onTick事件进行监听
        // onTick事件：根据当前配置选项，从当前时间提前计时。应该每个帧都调用tick，而不管动画是否发生。
        // 简单的说就是每过一帧都会执行这个事件
        
        var flags = this.Keyflags;        
        viewer.clock.onTick.addEventListener(function(clock) {
        
            // 获取实例的相机对象
            var camera = viewer.camera;

//            if (flags.looking) {
//                // 获取画布的宽度
//                var width = canvas.clientWidth;
//                // 获取画布的高度
//                var height = canvas.clientHeight;
//                
//                mousePosition.x = viewer.canvas.clientWidth/2;
//                mousePosition.y = viewer.canvas.clientHeight/2;

//                // Coordinate (0.0, 0.0) will be where the mouse was clicked.
//                var x = (mousePosition.x - startMousePosition.x) / width;
//                var y = -(mousePosition.y - startMousePosition.y) / height;
//                var lookFactor = 0.05;

//                camera.lookRight(x * lookFactor);
//                camera.lookUp(y * lookFactor);
//            }

            // 获取相机高度
            // cartesianToCartographic(): 将笛卡尔坐标转化为地图坐标，方法返回Cartographic对象，包含经度、纬度、高度
            var cameraHeight = ellipsoid.cartesianToCartographic(camera.position).height;
            var moveRate = cameraHeight / 100.0;

            // 如果按下键盘就移动
            if (flags.moveForward) {
                camera.moveForward(moveRate);
            }
            if (flags.moveBackward) {
                camera.moveBackward(moveRate);
            }
            if (flags.moveUp) {
                camera.moveUp(moveRate);
            }
            if (flags.moveDown) {
                camera.moveDown(moveRate);
            }
            if (flags.moveLeft) {
                camera.moveLeft(moveRate);
            }
            if (flags.moveRight) {
                camera.moveRight(moveRate);
            }
        });    
    }
    

    map3d.prototype.JW2MapExtent  = function (srcExtent)
    {
        var JWExtent = srcExtent; 
        var code = this.GetProjectCode();
        if (code == 'EPSG:900913')
        {
            var min = Map3DSDK.Convert('EPSG:4326', 'EPSG:900913', [srcExtent[0], srcExtent[1]]);
            var max = Map3DSDK.Convert('EPSG:4326', 'EPSG:900913', [srcExtent[2], srcExtent[3]]);
            JWExtent= [ min[0], min[1], max[0], max[1]];  
        }
        return JWExtent;      
    }
    
    map3d.prototype.IsInView = function (cen)
    {        
        var mapCoord = this.JW2MapCoord(cen);
        var rect     = this.GetViewRect();
        if (mapCoord[0] < rect[0] || mapCoord[0] > rect[2] || 
            mapCoord[1] < rect[1] || mapCoord[1] > rect[3] )
        {
            return false;
        }
        else
        {
            return true;
        }
    }  
    
    //设置控件复位状态
    map3d.prototype.SetResetCenterAndZoom = function (lon, lat, zoom)
    {        
       var height = this.GetHeightByZoom(zoom ? zoom : 5);        
       try
       {
           var controls = this.cesium.viewer.cesiumNavigation.navigationViewModel.controls;
           for (var i = 0; i < controls.length; i++)
           {
                //if (controls[i] instanceof ResetViewNavigationControl)
                if (controls[i].cssClass == "navigation-control-icon-reset")
                {
                    controls[i].setLocate(lon, lat, height);
                }
           }          
       }   
       catch(e)
       {}   
       
    }   
    
    
    //返回控件复位状态[lon, lat, zoom]
    map3d.prototype.GetResetCenterAndZoom = function ()
    {        
       try
       {
           var lonlatz;
           var controls = this.cesium.viewer.cesiumNavigation.navigationViewModel.controls;
           for (var i = 0; i < controls.length; i++)
           {
                //if (controls[i] instanceof ResetViewNavigationControl)
                if (controls[i].cssClass == "navigation-control-icon-reset")
                {
                    lonlatz = controls[i].getLocate();
                    break;
                }
           }
           lonlatz[2] = this.GetZoomByHeight(lonlatz[2]); 
           return lonlatz;
       }   
       catch(e)
       {}   
       return [0, 0, 1];
    }             
    
    map3d.prototype.CenterAndZoom = function (cen, zoom)
    {        
        this.SetViewCenter(cen[0], cen[1]);
        this.SetZoom(zoom);
    }
    
    
    map3d.prototype.AddTileMapLayer = function(options)
    {
        options = options||{};
        if(!options.url)
        {
            return;
        }
        var imageLayer = new Cegore.ImageLayer({
                name :  options.name||'imagelayer',
                type : options.type||'ZMapImage',
                url: options.url,
                brightness: options.brightness || 2,
                visible: options.visible?true:false,
                maximumLevel:options.maximumLevel||18, // 设置最大显示层级
                scheme:options.scheme||"Geographic-level-0"        
        });    
        return this.AddLayer(imageLayer);     
    }    
   
    //添加图层
    map3d.prototype.AddLayer = function(layer)
    {
        try
        {        
            var name       = this.GetLayerName(layer);
            var existLayer = this.layerMap[name];
            if (existLayer)
            {
                throw "exist layer: " + name;
                return ;
            }
                          
            var ceisum = this.GetMap();
            var n = ceisum.viewer.imageryLayers.length;
            ceisum.viewer.imageryLayers.add(layer._czLayer, n);     
            this.layerMap[layer.name] = layer;
        }
        catch(e)
        {
            return null;
        }
    }
    
    //获取名称
    map3d.prototype.GetLayerName  = function(layer) 
    {
        return layer.name;
    }   
    
    //获取名称
    map3d.prototype.GetUnkLayer  = function(name) 
    {
       var ceisum = this.GetMap();
       var layer  = this.layerMap[name];       
       if (layer == undefined)
       {
            layer = this.GetCegore().images.get(name);
            if (layer) this.layerMap[name] = layer;    
       }
       return layer;                 
    }
    
    map3d.prototype._GetInnerZMapLayer = function(layer)
    {
        var rLayer;
        if (typeof(layer) == "string")
        {
            rLayer = this.GetUnkLayer(layer);
        }
        else if (layer instanceof GmMap3D.ImageryLayer)
        {
            rLayer = layer._ZMapLayer;
        }
        else if (layer instanceof Cegore.NetCDFImageLayer)
        {
            rLayer = layer; 
        } 
        else
        {
            rLayer = layer;
        }
        return rLayer;
    }
    
    map3d.prototype._GetCzLayer = function(layer)
    {
        if (typeof(layer) == "string")
        {
            rLayer = this.GetUnkLayer(layer);
        }
        else if (layer instanceof "ImageryLayer")
        {
            rLayer = layer._ZMapLayer;
        }
        else if (layer instanceof "NetCDFImageLayer")
        {
            rLayer = layer; 
        } 
        return rLayer._czLayer;
    }    
    
     
    //删除图层
    map3d.prototype.RemoveLayer     = function (layer) 
    {
        var rLayer = this._GetInnerZMapLayer(layer), fname;
        if (rLayer == null) return ; 
        fname = rLayer.name;
                
        var name = this.GetLayerName(rLayer);
        delete this.layerMap[name];     
        
        //
        var ceisum = this.GetMap();        
        var size   = ceisum.viewer.imageryLayers.length;
        for (var i = 0; i < size; i++)
        {
            //ceisum.viewer.imageryLayers.remove(rLayer);      
            var layer   = ceisum.viewer.imageryLayers._layers[i];
            var name    = layer._ZMapLayer.name;
            if (name == fname)
            {
                ceisum.viewer.imageryLayers.remove(layer);
                break;
            }
        }
    }
            
    map3d.prototype.GetLayers       = function() 
    {
        var layer = []; //this.cegore.images   
        for (var key in this.layerMap)
        {
            layer.push(this.layerMap[key]);
        }     
        return layer;
    }    

    map3d.prototype.SetVisible    = function(unkLayerName, visible)
    {
        var layer = this._GetCzLayer(unkLayerName);
        if (layer)
        {
            layer.show = visible;            
        }
    }

    map3d.prototype.IsVisible    = function(unkLayerName)
    {
        var layer = this._GetCzLayer(unkLayerName);
        return layer.show;
    }   
        
    //经纬度与Coord转换
    map3d.prototype.JW2MapCoord    = function (srccoord)
    {
        return srccoord;
    }
    
    map3d.prototype.GetViewCenter    = function()
    {
        var viewer = this.GetView();
        var result = viewer.camera.pickEllipsoid(new GmMap3D.Cartesian2(viewer.canvas.clientWidth /2 , viewer.canvas.clientHeight / 2));
        var curPosition = GmMap3D.Ellipsoid.WGS84.cartesianToCartographic(result);
        var lon = curPosition.longitude*180/Math.PI;
        var lat = curPosition.latitude*180/Math.PI;
        var height = curPosition.height;
        return [lon, lat, height];
    }

    //设置相机移动的目的地
    map3d.prototype.FlyTo            = function(x, y, options)
    {
        options    = options ? options : {};    
        var camera = this.GetView().camera;
        var height = options.height ? options.height : 150000;
        var carPos = new GmMap3D.Cartesian3(x, y, height);     
        var camera = this.GetView().camera;
        var ellipsoid      = this.GetView().scene.globe.ellipsoid; // 获取地球球体对象               
        var destination    = GmMap3D.Cartesian3.fromDegrees(carPos.x, carPos.y, carPos.z, ellipsoid);
        camera.flyTo({
                destination: destination,
                duration: options.duration ? options.duration : 2,
                orientation: {
                    heading : GmMap3D.Math.toRadians(options.heading ? options.heading : 0), 
                    pitch : GmMap3D.Math.toRadians(options.pitch ? options.pitch : -90),   
                    roll : GmMap3D.Math.toRadians(options.roll ? options.roll : 0)  
                }                   
            }); 
    }

    /*--weili  设置相机参数--*/
    map3d.prototype.setCamera = function(options)
    {
        var camera = this.GetView().camera;
        var pos = options.position;
        if(pos&&Array.isArray(pos))
        {
            var destination    = GmMap3D.Cartesian3.fromDegrees(pos[0]||0, pos[1]||0, pos[2]||0);
        }
        else
        {
            var destination =camera.position;
        }

        var rotate = options.rotate;
        if(rotate&&Array.isArray(pos))
        {
            var heading = GmMap3D.Math.toRadians(parseFloat(rotate[0]));
            var pitch = GmMap3D.Math.toRadians(parseFloat(rotate[1]));
            var roll = GmMap3D.Math.toRadians(parseFloat(rotate[2]));
            var orientation =new GmMap3D.HeadingPitchRoll(heading, pitch, roll)
        }
        else{
            var orientation = {heading :camera.heading,pitch :camera.pitch,roll :camera.roll};
        }
        

        

        camera.flyTo({
            destination: destination,
            duration: options.duration ? options.duration : 2,
            orientation: orientation                 
        });
    }

    /*--weili  获取相机参数--*/
    map3d.prototype.getCamera = function()
    {
        var camera = this.GetView().camera;
        var des = this.cartesianTo2MapCoord(camera.position);
        var ori =[GmMap3D.Math.toDegrees(camera.heading),GmMap3D.Math.toDegrees(camera.pitch),GmMap3D.Math.toDegrees(camera.roll)];

        return {
            position:des,
            rotate:ori
        };
    }



    
    map3d.prototype.SetViewCenter    = function(x, y, options)
    {
        options    = options ? options : {};
        var height = options.height ? options.height : 150000;
        var carPos = new GmMap3D.Cartesian3(x, y, height);     
        var camera = this.GetView().camera;
        var ellipsoid = this.GetView().scene.globe.ellipsoid; // 获取地球球体对象               
        var pos    = GmMap3D.Cartesian3.fromDegrees(carPos.x, carPos.y, carPos.z, ellipsoid)
        camera.setView({
                destination: pos,
                orientation: {
                    heading : GmMap3D.Math.toRadians(options.heading ? options.heading : 0), 
                    pitch : GmMap3D.Math.toRadians(options.pitch ? options.pitch : -90),   
                    roll : GmMap3D.Math.toRadians(options.roll ? options.roll : 0)
                }
            });     
    } 
    
    //设置地图等级
    map3d.prototype.SetZoom     = function(zoom)
    {
        //根据距离求等级
        var src = [1366, 768];
        var w   = $("#"+ this.divID).width();
        var h   = $("#"+ this.divID).height();
        var dim = w > h ? w : h;
        var scale = dim / src[0];
        var temp  = [];
        for (var i = 0; i < this.dmap.length; i++)
        {
            temp.push(this.dmap[i] * scale); 
        }

        var centerMapLevel = [99999999999];
        for (var i = 1; i < temp.length; ++i)
        {
            centerMapLevel[i] = (temp[i-1] + temp[i]) / 2;
        }
        centerMapLevel[centerMapLevel.length] = 0;    
                
        var d = (centerMapLevel[zoom-1] + centerMapLevel[zoom]) / 2;

        var center = this.GetViewCenter();
        var carPos    = new GmMap3D.Cartesian3(center[0], center[1], d);        
        var camera    = this.GetView().camera;
        var ellipsoid = this.GetView().scene.globe.ellipsoid; // 获取地球球体对象               
        var pos    = GmMap3D.Cartesian3.fromDegrees(carPos.x, carPos.y, carPos.z, ellipsoid);
        camera.setView({
                destination: pos,
                endTransform: GmMap3D.Matrix4.IDENTITY
            });
        return ;            
    }
        
    map3d.prototype.GetZoom     = function()
    {
        //根据距离求等级
        var src = [1366, 768];
        var w   = $("#"+ this.divID).width();
        var h   = $("#"+ this.divID).height();
        var dim = w > h ? w : h;
        var scale = dim / src[0];
        var temp  = [];
        for (var i = 0; i < this.dmap.length; i++)
        {
            temp.push(this.dmap[i] * scale); 
        }

        ///
        var centerMapLevel = [99999999999];
        for (var i = 1; i < temp.length; ++i)
        {
            centerMapLevel[i] = (temp[i-1] + temp[i]) / 2;
        }
        centerMapLevel[centerMapLevel.length] = 0;        
            
        //计算表面距离
        var camera = this.GetView().camera;
        var pos    = camera.position;
        var geo    = this.cesium.ellipsoid.cartesianToCartographic(pos);
        var d      = geo.height;
        for (var i = 0; i < centerMapLevel.length; ++i)
        {
            if (d >= centerMapLevel[i])
            {
                return i;
            }
        }
        return centerMapLevel.length;    
    }
    
    map3d.prototype.GetHeightByZoom     = function(zoom)
    {
        //根据距离求等级
        var src = [1366, 768];
        var w   = $("#"+ this.divID).width();
        var h   = $("#"+ this.divID).height();
        var dim = w > h ? w : h;
        var scale = dim / src[0];
        var temp  = [];
        for (var i = 0; i < this.dmap.length; i++)
        {
            temp.push(this.dmap[i] * scale); 
        }

        ///
        var centerMapLevel = [99999999999];
        for (var i = 1; i < temp.length; ++i)
        {
            centerMapLevel[i] = (temp[i-1] + temp[i]) / 2;
        }
        centerMapLevel[centerMapLevel.length] = 0;        
            
        //计算表面距离
        if (zoom < 0)
        {
            return centerMapLevel[0];                
        }
        else if (zoom > centerMapLevel.length)
        {
             return centerMapLevel[centerMapLevel.length-1];      
        }
        return centerMapLevel[zoom];
    }    
    
    map3d.prototype.GetZoomByHeight     = function(height)
    {
        //根据距离求等级
        var src = [1366, 768];
        var w   = $("#"+ this.divID).width();
        var h   = $("#"+ this.divID).height();
        var dim = w > h ? w : h;
        var scale = dim / src[0];
        var temp  = [];
        for (var i = 0; i < this.dmap.length; i++)
        {
            temp.push(this.dmap[i] * scale); 
        }

        ///
        var centerMapLevel = [99999999999];
        for (var i = 1; i < temp.length; ++i)
        {
            centerMapLevel[i] = (temp[i-1] + temp[i]) / 2;
        }
        centerMapLevel[centerMapLevel.length] = 0;        
            
        //计算表面距离
        var d = height;
        for (var i = 0; i < centerMapLevel.length; ++i)
        {
            if (d >= centerMapLevel[i])
            {
                return i;
            }
        }
        return centerMapLevel.length;
    }        
    

    //获取视图地理区域[xmin, ymin, xmax, ymax]
    map3d.prototype.GetViewRect = function ()
    {   
        var toDegree= 180 / Math.PI;
        var camera  = this.GetView().camera;
        var rect    = camera.computeViewRectangle();
        return [rect.west*toDegree, rect.south*toDegree, rect.east*toDegree, rect.north*toDegree];        
    }
    

    //[xmin, ymin, xmax, ymax]
    map3d.prototype.SetViewRect = function (xmin, ymin, xmax, ymax, options)
    {
        options = options ? options : {};
       var camera   = this.GetView().camera;
       camera.flyTo({
            destination: GmMap3D.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
            duration: options.duration ? options.duration : 1          
        });
        
        return ;
    }    
    
    map3d.prototype.setViewRectByPositions = function(positions,options)
    {
        options = options||{};
        if(Array.isArray(positions)&&positions.length>1&&Array.isArray(positions[0]))
        {
            var polys = [0, 0, 0, 0];
            for(var i=0;i<positions.length;i++)
            {
                var xx = positions[i][0];
                var yy = positions[i][1];
                if (i == 0) {
                    polys[0] = xx;
                    polys[2] = xx;
                    polys[1] = yy;
                    polys[3] = yy;
                } else {
                    polys[0] = polys[0] <= xx ? polys[0] : xx;
                    polys[2] = polys[2] >= xx ? polys[2] : xx;
                    polys[1] = polys[1] <= yy ? polys[1] : yy;
                    polys[3] = polys[3] >= yy ? polys[3] : yy;
                }
            }

            if(options.scale!=undefined)
            {
                var bl = isNaN(parseFolat(options.scale))?0.6:(parseFolat(options.scale)>0?parseFolat(options.scale):0.6);
                bl = bl>0.6?0.6:bl;
                polys[0] = polys[0]-(polys[2]-polys[0])*(1-bl)/2;
                polys[1] = polys[1]-(polys[3]-polys[1])*(1-bl)/2;
                polys[2] = polys[2]+(polys[2]-polys[0])*(1-bl)/2;
                polys[3] = polys[3]+(polys[3]-polys[1])*(1-bl)/2;
            }
            if(polys[0]==polys[2]||polys[1]==polys[3])
            {
                return;
            }

            this.SetViewRect( polys[0], polys[1], polys[2], polys[3],options)

        }
        
    }

    
    //显示坐标转化屏幕坐标
    map3d.prototype.GetPixelFromCoordinate = function (x, y)
    {
        this.Screen2MapCoord([x, y]);
    }    
    
    //==============================MapView屏幕坐标转换(度)============================================
    map3d.prototype.Screen2MapCoord       = function (screen)  //pickEllipsoid(windowPosition, ellipsoid, result) 
    {
       var xy        = {x: screen[0], y: screen[1]};
       var cesium    = this.cesium;
       var pickRay   = cesium.scene.camera.getPickRay(xy);
       var cartesian = cesium.scene.globe.pick(pickRay, cesium.viewer.scene);
       if (!cartesian)
       {
          return null;  
       }
       var geo = cesium.ellipsoid.cartesianToCartographic(cartesian);           
       var lon = (geo.longitude / Math.PI * 180).toFixed(6);
       var lat = (geo.latitude / Math.PI * 180).toFixed(6);
       return [lon, lat, geo.height];
    } 
    //经纬度转屏幕坐标
    map3d.prototype.MapCoord2Screen       = function (mapcoord)
    {
        var lon = mapcoord[0];
        var lat = mapcoord[1];
        var hei = mapcoord[2] ? mapcoord[2] : 0;
        
      
       var cesium    = this.cesium;        
       var cart3     = GmMap3D.Cartesian3.fromDegrees(lon, lat, hei)         
       var scr       = GmMap3D.SceneTransforms.wgs84ToWindowCoordinates(cesium.scene, cart3);       
       return [scr.x, scr.y];
    }

    //经纬度转笛卡尔
    map3d.prototype.JWcoordToC3       = function (JWcoord)
    {
        var lon = JWcoord[0];
        var lat = JWcoord[1];
        var hei = JWcoord[2] ? JWcoord[2] : 0;

        var ellipsoid=this.GetView().scene.globe.ellipsoid;
        var cartographic=GmMap3D.Cartographic.fromDegrees(lon,lat,hei);
        var cartesian3=ellipsoid.cartographicToCartesian(cartographic)
              
       return cartesian3;
    }

    //笛卡尔坐标转经纬度
    map3d.prototype.cartesianTo2MapCoord    = function (cartesian)
    {
        var cesium    = this.cesium; 
        var geo = cesium.ellipsoid.cartesianToCartographic(cartesian);           
        var lon = parseFloat((geo.longitude / Math.PI * 180).toFixed(6));
        var lat = parseFloat((geo.latitude / Math.PI * 180).toFixed(6));
        return [lon, lat, geo.height];
    }

    map3d.prototype.rotateCalculate = function(pointc3,heading,pitch,sideOffset){
        var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
        var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(pointc3, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
        var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
        return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
    }

    map3d.prototype.calculatehp = function(pointA,pointB){
        
        var spo  = this.JWcoordToC3(pointA);
        var epo = this.JWcoordToC3(pointB);
        
        //求俯仰角
        var pointz = this.rotateCalculate(spo,0,GmMap3D.Math.toRadians(-90),10);
        var normalVectorz = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(pointz,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());
        var normalVectorp = GmMap3D.Cartesian3.normalize(GmMap3D.Cartesian3.subtract(epo,spo,new GmMap3D.Cartesian3()),new GmMap3D.Cartesian3());

        var numdu = GmMap3D.Cartesian3.dot(normalVectorz,normalVectorp);
        var picth = GmMap3D.Math.toDegrees(Math.acos(numdu))-90;
       
        //求航向角
        pointB[2] = pointA[2];
    
        spo = this.JWcoordToC3(pointA);
        epo = this.JWcoordToC3(pointB);
        var pointxz = this.rotateCalculate(spo,0,0,10);
        var pointyf = this.rotateCalculate(spo,GmMap3D.Math.toRadians(90),0,10);
        var pointyz = this.rotateCalculate(spo,GmMap3D.Math.toRadians(-90),0,10);

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
        return [hear,picth];
    }

    //隐藏整个地球背景
    map3d.prototype.unshowGlodeBackground = function (color)
    {
        var dviewer = this.cesium.viewer;
        var glodeflag = dviewer.scene.globe.show ;
        var glodesky = dviewer.scene.skyAtmosphere.show ;
        var skybox = dviewer.scene.skyBox.show ;
        var skysun = dviewer.scene.sun.show ;
        if(glodeflag){
            dviewer.scene.globe.show = false;
        }

        if(glodesky){
            dviewer.scene.skyAtmosphere.show = false;
        }

        if(skybox){
            dviewer.scene.skyBox.show = false;
        }

        if(skysun){
            dviewer.scene.sun.show = false;
        }

        if(color){
            dviewer.scene.backgroundColor = this.colorTransform(color);
        }

    }

    //显示整个地球背景
    map3d.prototype.showGlodeBackground  = function (cartesian)
    {
        var dviewer = this.cesium.viewer;
        var glodeflag = dviewer.scene.globe.show ;
        var glodesky = dviewer.scene.skyAtmosphere.show ;
        var skybox = dviewer.scene.skyBox.show ;
        var skysun = dviewer.scene.sun.show ;
        if(!glodeflag){
            dviewer.scene.globe.show = true;
        }

        if(!glodesky){
            dviewer.scene.skyAtmosphere.show = true;
        }

        if(!skybox){
            dviewer.scene.skyBox.show = true;
        }

        if(!skysun){
            dviewer.scene.sun.show = true;
        }

        dviewer.scene.backgroundColor = GmMap3D.Color.BLACK;
    }

    //==============================设置地图光标类型(pointer、move、crosshair、wait、help、 no-drop、text、not-allowed、progress、default)============================================
    map3d.prototype.SetCursorStyle        = function (style)
    {
        $("#" + this.divID).css("cursor", style);
    } 
    
    function GetActiveMap() 
    {
        var map = null;
        for (var key in globeMap3D)
        {
            map = globeMap3D[key];
            break ;
        } 
        return map;   
    }    
    
    //===============================定义基础几何类===========================================
    map3d.prototype.Point   = function(convert,options)
    {
        var citizensBankPark = this.cesium.viewer.entities.add( {
            id:options.id,
            name : options.name|| options.id,
            position : GmMap3D.Cartesian3.fromDegrees(convert[0], convert[1], convert[2]),
            point : options.style||{ //点
                pixelSize : options.pixelSize ? options.pixelSize : 10,
                color : GmMap3D.Color.RED,
                outlineColor : GmMap3D.Color.WHITE,
                outlineWidth : 2
            },
        })
        return citizensBankPark;
    }
    
    Map3DSDK.MultiPoint        = function (coords, convert) 
    {
        var JWArray;
        var map = GetActiveMap(); 
        if (map)
        {
           JWArray = [];           
           for (var i = 0; i < coords.length; i++)
           {
               if (convert == false)
               {
                 JWArray.push(coords[i]);                
               }
               else
               {
                 JWArray.push(map.JW2MapCoord(coords[i]));                
               }               
           }
        }
        else
        {
            JWArray = coords; 
        }
        return //new ol.geom.MultiPoint(JWArray, 'XY');
    }
    
    Map3DSDK.Line           = function (coordArray, convert) 
    {
        var JWArray;
        var map = GetActiveMap(); 
        if (map)
        {
           JWArray = [];           
           for (var i = 0; i < coordArray.length; i++)
           {
               if (convert == false)
               {
                 JWArray.push(coordArray[i]);
               }
               else
               {
               JWArray.push(map.JW2MapCoord(coordArray[i]));                
               }
           }
        }
        else
        {
            JWArray = coordArray; 
        }
        return //new ol.geom.LineString(JWArray, 'XY');
    }
    
    Map3DSDK.MultiLine      = function (lineArray, convert, style) 
    {
        var JWlinArray;
        var map = GetActiveMap(); 
        if (map)
        {
           JWlinArray = [];           
           for (var i = 0; i < lineArray.length; i++)
           {
               for (var j = 0; j < lineArray[i].length; j++)
               {
                  if (convert == false)
                  {
                      JWlinArray.push(parseFloat(lineArray[i][j]));                                                       
                  }
                  else
                  {
                      JWlinArray.push(parseFloat(this.JW2MapCoord(lineArray[i][j])));                                        
                  }
               }
           }
        }
        else
        {
            JWlinArray = lineArray; 
        } 
        var width = 0;
        if(style){
            if(style.width){
                width = style.width;
            }else{
                width = 5.0;
            }
        }else{
            width = 5.0;
        }
        //SimplePolylineGeometry
        var multiline = new GmMap3D.PolylineGeometry({
            //positions: new GmMap3D.CallbackProperty(JWlinArray),
            positions: GmMap3D.Cartesian3.fromDegreesArray(JWlinArray),
            width : width,//线宽
            vertexFormat : GmMap3D.PolylineColorAppearance.VERTEX_FORMAT
        });
        return multiline;//new ol.geom.MultiLineString(JWlinArray, 'XY');
    }
         
    Map3DSDK.Polygon           = function (poly, convert)
    {
        var outRing = poly; 
        var jwpoly = [];          
        for (var i = 0; i < outRing.length; i++)
        {
            for (var j = 0; j < outRing[i].length; j++)
            {
                if (convert == false)
                {
                    jwpoly.push(parseFloat(outRing[i][j]));                                                       
                }
                else
                {
                  jwpoly.push(parseFloat(this.JW2MapCoord(outRing[i][j])));                                        
                }
            }
        }

        for (var i = 1; i < poly.length; i++)
        {
        }       
        
        var polygon = new GmMap3D.PolygonGeometry({
            polygonHierarchy : new GmMap3D.PolygonHierarchy(
                GmMap3D.Cartesian3.fromDegreesArray(jwpoly)
            ),
            height: 0
        });        
       return polygon;
    }
    
    Map3DSDK.MultiPolygon      = function(polys)
    {
        
    } 
        
    Map3DSDK.Circle            = function (cen, radius) 
    {
        var center    = cen.center;
        var map = Map3DSDK.GetMap(); 
        var globe = map.GetCegore()._scene.globe._czGlobe;
        var R = globe._ellipsoid._maximumRadius;//地球半径
        var radius = GmMap3D.Math.toRadians(R * cen.radius);  
        var circle = new GmMap3D.CircleGeometry({
            center : GmMap3D.Cartesian3.fromDegrees(center[0], center[1]),
            radius : radius,
            height:center[2]||0
        });     
        return circle;
    }   
    
    Map3DSDK.GetMap = function(){
        return this.map3DView;
    }

    //================================注记（图片、文字）============================
    map3d.prototype.AddGeometrys  = function(unklayName, geoms, style, bClear, exparam)
    {
        var viewer    = this.GetView();
        exparam       = exparam || {};
        
        var color = [];
        if(style){
            color = style.color ? style.color : [1.0, 1.0, 0.0, 1];
        }else{
            color = [1.0, 1.0, 0.0, 1];
        }

        if(typeof color =='string')
        {
            var cl = this.colorTransform(color);
            color = [cl.red,cl.green,cl.blue,cl.alpha];
        }

        //new primitive
        var geomInstance = new GmMap3D.GeometryInstance({
            id: unklayName,
            geometry : geoms,
            asynchronous: exparam.asynchronous ? exparam.asynchronous : false,
            attributes : {
                color : new GmMap3D.ColorGeometryInstanceAttribute(color[0], color[1], color[2], color[3])
            }
        });  

        var defAppearance = null;
        if(geoms._width){//有线宽的为线的geometry
            defAppearance = new GmMap3D.PolylineColorAppearance({
                translucent : false
            });
        }else{
            var material = GmMap3D.Material.fromType('Color', {
                color : new GmMap3D.Color(color[0], color[1], color[2], color[3])
            });
            defAppearance = new GmMap3D.EllipsoidSurfaceAppearance({ 
                material: material,
                aboveGround: true 
            });
        }

        var primitive = new GmMap3D.Primitive({
            geometryInstances : geomInstance,
            appearance : defAppearance
        });
        viewer.scene.primitives.add(primitive);
    }

    map3d.prototype.RemoveGeometrys = function(unklayName) 
    {
        var viewer    = this.GetView();
        var primitives = viewer.scene.primitives;
        for (var i = 0; i < primitives.length; i++)
        {
           var prim = primitives.get(i);
           
           if (prim instanceof GmMap3D.Primitive)
           {
               var geomInstance = prim.getGeometryInstanceAttributes(unklayName);
               if (geomInstance)
               {
                    viewer.scene.primitives.remove(prim);
                    break ;
               }                
           }           
        }
        
    }

    map3d.prototype.AddEntity  = function(unklayName, polygon, style, bClear, exparam)
    {
       var jwpoly = [], holes = [];
       var outRing = polygon[0];
       for (var i = 0; i < outRing.length; i++)
       {
           jwpoly.push(outRing[i][0]);
           jwpoly.push(outRing[i][1]);
       }
       
       //hole
       for (var i = 1; i < polygon.length; i++)
       {
       }
       
        var material = GmMap3D.Material.fromType('Color', {
            color : new GmMap3D.Color(1.0, 1.0, 0.0, 0.45)
        });
        
        exparam    = exparam || {};    
        var viewer = this.GetView();
        var se = null;
        if(exparam.type == "image"){
            se = new GmMap3D.ImageMaterialProperty(
                {
                    image: exparam.imgUrl,
                    //color: GmMap3D.Color.BLUE,//在图片上覆盖一层颜色
                    //repeat : new GmMap3D.Cartesian2(4, 4)//重复
                    transparent : exparam.transparent //是否透明,为png图片时有效
                });

        }else if(exparam.type == "heatmap"){
            se = exparam.material;
        }else {
            se =  new GmMap3D.Color(1.0, 1.0, 0.0, 0.45);
        }
        viewer.entities.add({  
            id: unklayName,
            name : unklayName,  
            polygon : {  
                hierarchy : GmMap3D.Cartesian3.fromDegreesArray(jwpoly), 
               // height: 20000,
                extrudedHeight: 0,  //拉伸值
                perPositionHeight : true,  
                material : se , 
                outline : exparam.outline ? exparam.outline : true,  
                outlineColor : GmMap3D.Color.RED
            }  
        });
        return ;
    } 

    /*--weili  获取primitive--*/
    map3d.prototype.getParimitive = function(modelID)
    {
        var parimitives = this.GetView().scene.primitives._primitives||[];
        for(var i=0;i<parimitives.length;i++)
        {
            if(parimitives[i].id&&parimitives[i].id.id == modelID)
            {
                return parimitives[i];
            }
        }
        return null;
    }


    //根据实体的id获取该实体对象
    map3d.prototype.GetEntity = function(modelID)
    {
        if(modelID == undefined || modelID == "") return null;
        var czviewer = this.GetView();
        var entity = czviewer.entities.getById(modelID);
        if(!entity || entity == undefined || entity == null){
            entity = null
        }
        return entity;
    }

    map3d.prototype.GetEntityByName = function(modelNmae)
    {
        if(modelNmae == undefined || modelNmae == "") return null;
        var czviewer = this.GetView();
        var entitys = czviewer.entities.values;

        var entity =[];

        for(var i=0;i<entitys.length;i++)
        {
            if(entitys[i].name ===modelNmae)
            {
                entity.push(entitys[i]) ;
            }
        }
        
        return entity;
    }
    
    //根据实体的id移除实体
    map3d.prototype.RemoveEntity  = function(unklayName)
    {
        var viewer = this.GetView();
        return viewer.entities.removeById(unklayName);
    }
    map3d.prototype.RemoveEntitys  = function(unklayName)
    {
        this.GetView().entities.removeAll();
    }

    map3d.prototype.GetModelByName = function(modelName)
    {
        var czviewer = this.GetView();
        var entitys = this.GetEntityByName(modelName);
        return entitys;
    }


/* --weili 模型模糊匹配根据名称*/
    map3d.prototype.GetModelsByName = function(name)
    {

        var allentitys = this.GetView().entities.values;
        if(name&&typeof name =="string")
        {
            var entitys =[]; 
            for(var i=0;i<allentitys.length;i++)
            {
                if(allentitys[i].name.indexOf(name)>-1)
                {
                    entitys.push(allentitys[i]);
                }
            }
            return entitys;
        }
        else
        {
            return allentitys;
        }
        

    }
/*--weili -  模型模糊匹配根据id*/
    map3d.prototype.GetModelsById = function(id)
    {

        var allentitys = this.GetView().entities.values;
        if(id&&typeof id =="string")
        {
            var entitys =[]; 
            for(var i=0;i<allentitys.length;i++)
            {
                if(allentitys[i].id.indexOf(id)>-1)
                {
                    entitys.push(allentitys[i]);
                }
            }
            return entitys;
        }
        else
        {
            return allentitys;
        }
        

    }

    //=====================================================点========================================================================================
    map3d.prototype.addPoint  = function (options,isFlyto)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return  this.zmapGeometry.addPoint(options,isFlyto);
    }

    map3d.prototype.delPoint  = function (pointEntity)
    {
        this.zmapGeometry.removeEntity(pointEntity);
    }

    map3d.prototype.delPointById  = function (pointEntity)
    {
        this.zmapGeometry.removeEntityById(pointEntity);
    }

    //=====================================================线========================================================================================
    map3d.prototype.addLine  = function (options,isFlyto)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return  this.zmapGeometry.addLine(options,isFlyto);
    }

    map3d.prototype.setLineMatrial = function(lineEntity,options){
        var linee = lineEntity;
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        if(!lineEntity){
            return;
        }

        if(!options){
            return;
        }

        if(typeof lineEntity =='string'){
            linee = this.GetModelsById(lineEntity)[0];
        }

        var material = this.zmapGeometry.LineMaterial(options);

        linee.polyline.material = material;
    }
    
    //=====================================================多边形========================================================================================
    //添加多边形
    /**
     * id 
     * name
     * position 形成多边形的点（多边形的形状，与点的顺序有关）
     * dheight 高度 与 dextrudedHeight 配合使用 只有单个设置表示多边形拉伸， 
     * 一起使用dheight表示离地面的高度 ，dextrudedHeight-dheight 的值为多边形的拉伸值 
     * dextrudedHeight
     * dperPositionHeight 开启点的高度，不能和dheight一起使用
     * dfill 是否填充
     * doutline 是否显示轮廓
     * doutlineColor 轮廓颜色
     * doutlineWidth 轮廓线框
     * dstRotation 纹理旋转角度
     * dmaterial 多边形上的纹理，dColorMaterial，dGridMaterial，dImageMaterial，dPolylineGlowMaterial，dStripeMaterial
     * ddistanceDisplayCondition
     * @param {*} options 参数
     * @param {*} callback 回调函数
     * 实例1
     * options ={
     *  id : "polygontest",
        position : [[109.234,23.545],[109.224,23.565],[109.244,23.565]],
        dheight : 1000,
        doutline : true,
        doutlineColor : "red",
        dextrudedHeight : 1100,
        dmaterial : {
            materialName : "dGridMaterial",
            dcolor:"rgba(255,255,0,0.3)",
            dcellAlpha : 0.5,
            dlineThickness : [1.0,1.0]
        }
     * }
     * 实例2
     * options = {
     *  id : "polygontest2",
        position : [[109.184,23.545,1000],[109.194,23.535,10],[109.204,23.535,10],[109.214,23.545,10],[109.204,23.555,1000],[109.194,23.555,1000]],
        doutline : true,
        dperPositionHeight :true,
        dextrudedHeight : 1000,
        doutlineColor : "green",
        dmaterial : {
            materialName : "dStripeMaterial",
            devenColor:"rgba(255,255,0,0.5)",
            drepeat : 10,
            doddColor : "rgba(255,0,0,0.5)",
            doffset : 10,
            drotation :45
        }
     * }
     * 实例3
     * options = {
     *  id : "polygontest3",
        position : [[109.184,23.565],[109.194,23.575],[109.204,23.565],[109.204,23.585],[109.184,23.585]],
        doutline : true,
        dextrudedHeight : 100,
        doutlineColor : "blue",
        dmaterial : {
            materialName : "dPolylineGlowMaterial",
            dcolor:"rgba(255,0,0,1)",
            dglowPower : 0
        }
     * }
     * 实例4
     * options = {
     *  id : "polygontest4",
        position : [[109.184,23.525],[109.204,23.525],[109.204,23.505],[109.184,23.505]],
        doutline : true,
        dextrudedHeight : 100,
        doutlineColor : "purple",
        doutlineWidth : 125,
        dstRotation : 45,
        dmaterial : {
            materialName : "dImageMaterial",
            dimage : './images/t-8.png',
            dcolor :"rgba(255,0,0,0.8)",
            drepeat : [1,1]
        }
     * }
     */
    map3d.prototype.addPolygon  = function (options,callback)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        var polygonEntity = this.zmapGeometry.Addpolygon(options);

        if(polygonEntity){
            var clickrntity = polygonEntity;
            var scene   = this.GetView().scene;
            var handler = clickrntity.handler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);
            handler.setInputAction(function(click)
            {
                var pickedObjects = scene.drillPick(click.position);
                for(var i = 0; i < pickedObjects.length; i++)
                {
                    var pickEnt = pickedObjects[i].id;
                    if (pickEnt.id == clickrntity.id)
                    {
                        if (callback)
                        {
                            callback(click);
                        }                        
                        break ;
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
        }

        return polygonEntity;
    };

    //通过多边形的id获取该对象
    map3d.prototype.getPolygonByid = function(polygonId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return this.zmapGeometry.getEntity(polygonId);
    }

    //通过多边形对象删除
    map3d.prototype.removePolygon = function(polygonEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntity(polygonEntity);
    }

    //通过id 移除多边形
    map3d.prototype.removePolygonByid = function(polygonId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntityById(polygonId);
    }

    //移除所有的多边形
    map3d.prototype.removePolygons = function(){
        var polygons =this.GetView().entities._entities._array;
        for(var i =0 ;i<polygons.length ;i++){
            var ent = polygons[i]._polygon;
            if(ent){
                this.removePolygon(polygons[i]);
            }
        }
    }

    //获取所有的多边形对象
    map3d.prototype.getPolygons = function(){
        var polygons =this.GetView().entities._entities._array;
        var existPolygons = [];
        for(var i =0 ;i<polygons.length ;i++){
            var ent = polygons[i]._polygon;
            if(ent){
                existPolygons.push(polygons[i]);
            }
        }
        return existlabels;
    }

    //显示指定多边形
    map3d.prototype.showPolygon = function(polygonEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.showEntity(polygonEntity);
    }

     //隐藏指定多边形
     map3d.prototype.unshowPolygon = function(polygonEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.unshowEntity(polygonEntity);
    }

    //显示指定id多边形
    map3d.prototype.showPolygonById = function(polygonId){
        var polygonEntity =  this.getPolygonByid(polygonId);
        this.showPolygon(polygonEntity);
    }

     //隐藏指定id多边形
     map3d.prototype.unshowPolygonById = function(polygonId){
        var polygonEntity =  this.getPolygonByid(polygonId);
        this.unshowPolygon(polygonEntity);
    }

    //显示所有多边形
    map3d.prototype.showPolygons = function(){
        var polygons =this.GetView().entities._entities._array;
        for(var i =0 ;i<polygons.length ;i++){
            var ent = polygons[i]._polygon;
            if(ent){
                this.showPolygon(polygons[i]);
            }
        }
    }

    //隐藏所有多边形
    map3d.prototype.unshowPolygons = function(){
        var polygons =this.GetView().entities._entities._array;
        for(var i =0 ;i<polygons.length ;i++){
            var ent = polygons[i]._polygon;
            if(ent){
                this.unshowPolygon(polygons[i]);
            }
        }
    }

    //获取多边形的属性属性值
    //options=["dmaterial","dheight","dextrudedHeight","doutline","doutlineColor","doutlineWidth","dfill","ddistanceDisplayCondition"];
    map3d.prototype.getPolygonProperties  = function (polygonEntity,options)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return this.zmapGeometry.getPolygonProperties(polygonEntity,options);
    };

    //设置多边形属性值
    /**
     * 实例1
     * options = {
     *   dmaterial : {
            materialName : "dPolylineGlowMaterial",
            dcolor:"rgba(255,0,0,1)",
            dglowPower : 0
        }
     * }
     * 
     * 实例2
     * options = {
     *  doutline : true,
        doutlineColor : "rgba(23,34,123,1)",
        doutlineWidth : 200
     * }
     * 
     */
     map3d.prototype.setPolygonProperties  = function (polygonEntity,options)
     {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.setPolygonProperties(polygonEntity,options);
     };

    //======================================================添加文本注释==================================================================================

     //添加文字注记(低版本)
     map3d.prototype.AddTextLabel  = function (labelName, x, y, text, options)
     {
         options = options ? options : {};
         var vposition = null;
         if(options.height){
             vposition = [x,y,options.height];
         }else{
             vposition = [x,y,0];
         }
         options.position = vposition
         options.id =  labelName;
         options.dtext = text;
         this.addTextLabel(options);
     }
    //添加文字注记
    /**
     *  options 参数解析
     * id ：文字注记的id
     * name ：文字注记的name
     * position ：位置
     * dtext : 文字注记 的内容
     * dfont ：文字注记的格式
     * dstyle : 文字注记样式，(FILL ,FILL_AND_OUTLINE ,OUTLINE),
     * dfillColor : 文字注记的颜色
     * doutlineColor 文字注记轮廓的颜色
     * doutlineWidth 文字注记轮廓的厚度
     * dshowBackground 文字注记背景是否显示
     * dbackgroundColor 文字注记背景颜色
     * dscale 文字注记放大倍数
     * dhorizontalOrigin 相对位置的水平方向（CENTER ，LEFT ，RIGHT）
     * dverticalOrigin 垂直方向 （CENTER ，LEFT ，RIGHT）
     * ddistanceDisplayCondition 格式是数组[0,10000] 表示相机离地面超过10000点隐藏
     * dscaleByDistance 格式是[10,3,1000000,0] 表示相机随离地面不同放大倍数不同
     * @param {*} options 
     * @param {*} callback  回调函数
     * options = {
     *  id : 'textlable',
     *  name : 'textname',
     *  position : [109.34,24.34,0],
     *  dtext : 'hello world',
     *  dfont : '13px 宋体',
     *  dstyle : 'FILL_AND_OUTLINE',
     *  dfillColor : 'rgb(23,45,64)',
     *  doutlineColor: 'rgb(23,45,164)',
     *  doutlineWidth : 4,
     *  dshowBackground : true,
     *  dbackgroundColor ： '#333',
     *  dscale : 6,
     *  dhorizontalOrigin : 'CENTER',
     *  dverticalOrigin : 'CENTER',
     *  ddistanceDisplayCondition :[0,10000],
     *  dscaleByDistance : [10,3,1000000,0]
     * }
     */
    map3d.prototype.addTextLabel  = function (options)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        var textEntity = this.zmapGeometry.AddTextLabel(options);
        return textEntity;

    }

    //通过label的id获取该对象
    map3d.prototype.getLabelByid = function(labelId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return this.zmapGeometry.getEntity(labelId);
    }

    //删除注记(低版本)
    map3d.prototype.RemoveLabel  = function (labelName)
    {   
         this.removeLabelByid(labelName);
    }

    //通过label对象删除
    map3d.prototype.removeLabel = function(labelEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntity(labelEntity);
    }

    //通过id 移除label
    map3d.prototype.removeLabelByid = function(labelId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntityById(labelId);
    }

    //移除所有的label
    map3d.prototype.removeLabels = function(){
        var labels =this.GetView().entities._entities._array;
        
        var delArray = [];
        for(var i =0 ;i<labels.length ; i++){
            var ent = labels[i]._label;
            if(ent){
                delArray.push(labels[i]);
             }            
        }
                
        for (var i = 0; i < delArray.length; i++)
        {
           this.removeLabel(delArray[i]);
        }
        
    }

    //获取所有的label对象
    map3d.prototype.getLabels = function(){
        var labels =this.GetView().entities._entities._array;
        var existlabels = [];
        for(var i =0 ;i<labels.length ;i++){
            var ent = labels[i]._label;
            if(ent){
                existlabels.push(labels[i]);
            }
        }
        return existlabels;
    }

    //显示指定label
    map3d.prototype.showLabel = function(labelEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.showEntity(labelEntity);
    }

     //隐藏指定label
     map3d.prototype.unshowLabel = function(labelEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.unshowEntity(labelEntity);
    }

    //显示指定label id
    map3d.prototype.showLabelById = function(labelId){
        var labelEntity =  this.getLabelByid(labelId)
        this.showLabel(labelEntity);
    }

     //隐藏指定label id
     map3d.prototype.unshowLabelById = function(labelId){
        var labelEntity =  this.getLabelByid(labelId)
        this.unshowLabel(labelEntity);
    }

    //显示所有label
    map3d.prototype.showLabels = function(){
        var labels =this.GetView().entities._entities._array;
        for(var i =0 ;i<labels.length ;i++){
            var ent = labels[i]._label;
            if(ent){
                this.showLabel(labels[i]);
            }
        }
    }

    //隐藏所有label
    map3d.prototype.unshowLabels = function(){
        var labels =this.GetView().entities._entities._array;
        for(var i =0 ;i<labels.length ;i++){
            var ent = labels[i]._label;
            if(ent){
                this.unshowLabel(labels[i]);
            }
        }
    }

    //获取textLabel 属性值
    //options=["id","name","position","dtext","dfont","dstyle","dfillColor"];
    map3d.prototype.getTextLabelProperties  = function (textEntity,options)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return this.zmapGeometry.getTextProperties(textEntity,options);
    };

    //设置textLabel 属性值
    //    var options = {
    //         dscale:rescale+1,
    //         dshowBackground :true,
    //         dbackgroundColor : "purple"
    //     };
     map3d.prototype.setTextLabelProperties  = function (textEntity,options)
     {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.setTextProperties(textEntity,options);
     };
    //========================================================END==========================================================================

    //========================================================图片操作======================================================================
     //添加图片注记
    /**
     * options 参数解析
     * id  ： 图片的id
     * name ：图片的name
     * position ：位置
     * imageUrl 引用图片的地址
     * dheight  距离地面的高度
     * dwidth   宽度
     * dcolor   设置图片颜色
     * dscale   设置放大倍数
     * dhorizontalOrigin 相对位置的水平方向（CENTER ，LEFT ，RIGHT）
     * dverticalOrigin 垂直方向 （CENTER ，LEFT ，RIGHT）
     * ddistanceDisplayCondition 格式是数组[0,10000] 表示相机离地面超过10000点隐藏
     * dscaleByDistance 格式是[10,3,1000000,0] 表示相机随离地面不同放大倍数不同
     * @param {*} options 
     * @param {*} callback
     * options = {
     *  id : 'testpic',
     *  name : 'testpic',
     *  position : [109.34,24.34,0],
     *  imageUrl : './images/t-8.png',
     *  dheight : 200,
     *  dwidth : 100,
     *  dcolor : 'rgb(234,12,13)'
     *  dscale : 6,
     *  dhorizontalOrigin : 'CENTER',
     *  dverticalOrigin : 'CENTER',
     *  ddistanceDisplayCondition :[0,10000],
     *  dscaleByDistance : [10,3,1000000,0]
     * }
     */
    map3d.prototype.addImage  = function (options,callback)
    {         
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        var imageEntity =  this.zmapGeometry.addbillboard(options);
        
        // if(imageEntity){
        //     var clickrntity = imageEntity;
        //     var scene   = this.GetView().scene;
        //     var handler = clickrntity.handler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);
        //     handler.setInputAction(function(click)
        //     {
        //         var pickedObjects = scene.drillPick(click.position);
        //         for(var i = 0; i < pickedObjects.length; i++)
        //         {
        //             var pickEnt = pickedObjects[i].id;
        //             if (pickEnt.id == clickrntity.id)
        //             {
        //                 if (callback)
        //                 {
        //                     callback(click);
        //                 }                        
        //                 break ;
        //             }
        //         }
        //     }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
        // }

        return imageEntity;
    };

    map3d.prototype.AddImageLabel  = function (labelName, x, y, icondiv,options)
    {         
         var viewer= this.GetView();
         var entity = viewer.entities.getById(labelName);
         this.removeImage(entity);

         options = options ? options : {};
         var vposition = null;
         if(options.height){
             vposition = [x,y,options.height];
         }else{
             vposition = [x,y,0];
         }
         options.position = vposition
         options.id =  labelName;
         options.imageUrl = icondiv;
         this.addImage(options);
    };


    //通过图片id获取该对象
    map3d.prototype.getImageByid = function(imageId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        return this.zmapGeometry.getEntity(imageId);
    }

    //通过图片对象删除
    map3d.prototype.removeImage = function(imageEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntity(imageEntity);
    }

    //通过图片id 移除图片
    map3d.prototype.removeImageByid = function(imageId){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.removeEntityById(imageId);
    }

    //移除所有的图片
    map3d.prototype.removeImages = function(){
        var images =this.GetView().entities._entities._array;
        
        var delArray = [];
        for(var i =0 ; i<images.length ; i++){
            var ent = images[i]._billboard;
            if(ent){
                delArray.push(images[i]);
            }
        }
        for (var i = 0; i < delArray.length; i++)
        {
           this.removeImage(delArray[i]);
        }
    }

    //获取所有的图片对象
    map3d.prototype.getImages = function(){
        var images =this.GetView().entities._entities._array;
        var existImages = [];
        for(var i =0 ;i<images.length ;i++){
            var ent = images[i]._billboard;
            if(ent){
                existImages.push(images[i]);
            }
        }
    }

    //显示指定图片
    map3d.prototype.showImage = function(imageEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.showEntity(imageEntity);
    }

     //隐藏指定图片
     map3d.prototype.unshowImage = function(imageEntity){
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.unshowEntity(imageEntity);
    }

     //显示指定id图片
     map3d.prototype.showImageById = function(imageId){
        var imageEntity = this.getImageByid(imageId)
        this.showImage(imageEntity);
    }

     //隐藏指定id图片
     map3d.prototype.unshowImageById = function(imageId){
        var imageEntity = this.getImageByid(imageId)
        this.unshowImage(imageEntity);
    }

    //显示所有图片
    map3d.prototype.showImages = function(){
        var images =this.GetView().entities._entities._array;
        for(var i =0 ;i<images.length ;i++){
            var ent = images[i]._billboard;
            if(ent){
                this.showImage(images[i]);
            }
        }
    }

    //隐藏所有图片
    map3d.prototype.unshowImages = function(){
        var images =this.GetView().entities._entities._array;
        for(var i =0 ;i<images.length ;i++){
            var ent = images[i]._billboard;
            if(ent){
                this.unshowImage(images[i]);
            }
        }
    }
    //获取图标的参数
    /**
     * @param {*} imageEntity  需要获取实体对象
     * @param {*} options  需要获取的属性 数组的形式
     * options = ["dcolor","imageUrl","ddistanceDisplayCondition",
     *            "dscaleByDistance","dscale"];
     */
    map3d.prototype.getImageProperties  = function (imageEntity,options)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        var imageProperties = this.zmapGeometry.getbillboardProperties(imageEntity,options);
        return imageProperties;
    }

    //设置图标的参数
    /**
     * @param {*} imageEntity  需要获取实体对象
     * @param {*} options   设置属性
     * options = {
     *  position : [109.234,34.25,0],
     *  dscale :50 ,
     *  dscaleByDistance :[0,5,1000000,0]
     * }
     */
    map3d.prototype.setImageProperties  = function (imageEntity,options)
    {
        this.zmapGeometry =  this.zmapGeometry || new ZMAPGEOMETRY(this);
        this.zmapGeometry.setbillboardProperties(imageEntity,options);
    }
    //====================================================end=====================================================================
    //===============================注册控件============================================  
    map3d.prototype.AddControl    = function (control) 
    {
        this.controls[control.name] = control.element;
    }
    
    map3d.prototype.RemoveControl    = function (control) 
    {
         if (!control) return ;
         var bFind = false;
         for (var key in this.controls)
         {
             var element = this.controls[key];            
             if (element === control.element)
             {
                bFind = true;
                element.remove();
                delete this.controls[key];
                break ;
             }       
         }        
         
         return bFind;
    }
    
    map3d.prototype.RemoveAllControl    = function () 
    {
        for (var key in this.controls)
        {
            var element = this.controls[control.name];
            document.removeChild(element);
        }
        this.controls = {};        
    }    
    
    map3d.prototype.AddCustomControl = function (uqkName, bkCol, divLeft, divTop, divWidth, divHeigth, divContent, func)
    {  
        var button = document.getElementById(uqkName);
        if (button == null)
        {
            button = document.createElement('button');
        }
        button.id        = uqkName;
        button.innerHTML = divContent;
        button.title     = uqkName;
        button.addEventListener('click', func, false);
        button.addEventListener('touchstart', func, false);
        if (bkCol)
        {
            button.style.backgroundColor = bkCol;
        }
        button.style.width = 'calc(100% - 0.1em)';
        button.style.height= 'calc(100% - 0.1em)';
        var myElement = document.createElement('div');
        if (myElement)
        {
            myElement.className = 'gmap-custom-control';  
            myElement.style.left= divLeft + 'px';
            myElement.style.top = divTop + 'px'; 
            myElement.style.width = divWidth + 'px';
            myElement.style.height= divHeigth+ 'px';
            myElement.appendChild(button);    
            document.body.appendChild(myElement);
            
            var myControl = {};
            myControl["name"]    = uqkName;
            myControl["element"] = myElement;
            this.AddControl(myControl);
        }
        return myControl;         
    }

    map3d.prototype.RemoveCustomControl  = function (ctlName)
    {
        var element = this.controls[control.name];
        document.removeChild(element);
        delete this.controls[control.name];
    }
        
    //===============================注册事件============================================  
    //click /  dblclick / mouseup / mousedown / pointermove / zoom
    map3d.prototype.AddEventListener = function (eName, eFun, modifier) 
    {
        var eventType;
        var eventList = {"LEFT_DOWN":0,
                         "LEFT_UP":1,
                         "LEFT_CLICK":2,
                         "LEFT_DOUBLE_CLICK":3,
                         "RIGHT_DOWN":5,
                         "RIGHT_UP":6,
                         "RIGHT_CLICK":7,
                         "MIDDLE_DOWN":10,
                         "MIDDLE_UP":11,
                         "MIDDLE_CLICK":12,
                         "MOUSE_MOVE":15,
                         "WHEEL":16,
                         "PINCH_START":17,
                         "PINCH_END":18,
                         "PINCH_MOVE":19};
        switch (eName)
        {
            case 'click':    eventType = GmMap3D.ScreenSpaceEventType.LEFT_CLICK; break;      
            case 'dblclick':  eventType = GmMap3D.ScreenSpaceEventType.LEFT_DOUBLE_CLICK; break;      
            case 'mousemove':  eventType = GmMap3D.ScreenSpaceEventType.MOUSE_MOVE; break;
            case 'leftDown':  eventType = GmMap3D.ScreenSpaceEventType.LEFT_DOWN; break;
            case 'leftup':  eventType = GmMap3D.ScreenSpaceEventType.LEFT_UP; break;
            case 'wheel':  eventType = GmMap3D.ScreenSpaceEventType.WHEEL; break;
            case 'rclick':  eventType = GmMap3D.ScreenSpaceEventType.RIGHT_CLICK; break;
            default: eventType = eName;break;
        }
    
        var cesium  = this.cesium;
        var handler = new GmMap3D.ScreenSpaceEventHandler(this.cegore.canvas);  
        handler.setInputAction(function (movement)
        {                    
           if (eFun) eFun(movement);          
        }, eventType, modifier);
        return handler;
   }
    
    map3d.prototype.RemoveEventListener= function (handler)
    {
    //    var eventType;
    //    switch (eName)
    //    {
    //        case 'click':    eventType = GmMap3D.ScreenSpaceEventType.LEFT_CLICK; break;      
    //        case 'dblclick':  eventType = GmMap3D.ScreenSpaceEventType.DBLEFT_CLICK; break;      
    //        case 'mousemove':  eventType = GmMap3D.ScreenSpaceEventType.MOUSE_MOVE; break;
    //        case 'leftDown':  eventType = GmMap3D.ScreenSpaceEventType.LEFT_DOWN; break;
    //        case 'leftup':  eventType = GmMap3D.ScreenSpaceEventType.LEFT_UP; break;
    //        default: break;
    //    }    
    //    var cesium  = this.cesium;
    //    cesium.screenSpaceEventHandler.removeInputAction(eventType, obj);
        return handler.destroy();
    }
    
    /*--weili -相机改变事件 */
    map3d.prototype.cameraChanged = function(eFun){
        this.GetView().scene.camera.percentageChanged =0.1
        var handler = this.GetView().scene.camera.changed.addEventListener(eFun);
        return handler;
    }
    /*--weili  相机开始移动事件--*/
    map3d.prototype.cameraMoveStart = function(eFun){
        var handler = this.GetView().scene.camera.moveStart.addEventListener(eFun);
        return handler;
    }
    /*--weili  相机结束移动事件--*/
    map3d.prototype.cameraMoveEnd = function(eFun){
        var handler = this.GetView().scene.camera.moveEnd.addEventListener(eFun);
        return handler;
    }

    /*--weili  senec 的postRender事件--*/
    map3d.prototype.senecPostRender = function(eFun){
        var handler = this.GetView().scene.postRender.addEventListener(eFun);
        return handler;
    }

     /*--weili  senec 的PostUpdate 事件--*/
    map3d.prototype.senecPostUpdate = function(eFun){
        var handler = this.GetView().scene.postUpdate.addEventListener(eFun);
        return handler;
    }
     /*--weili  senec 的PreRender 事件--*/
    map3d.prototype.senecPreRender = function(eFun){
        var handler = this.GetView().scene.preRender.addEventListener(eFun);
        return handler;
    }
    /*--weili  senec 的PreUpdate 事件--*/
    map3d.prototype.senecPreUpdate = function(eFun){
        var handler = this.GetView().scene.preUpdate.addEventListener(eFun);
        return handler;
    }

    /*--weili  设置vr--*/
    map3d.prototype.useWebVR = function(is)
    {
        this.GetView().scene.useWebVR = is==true?true:false;
    }
    
    //=================================地图交互禁用启用=================================
    map3d.prototype.IsEnableDragging  = function ()
    {
       var scene = this.GetView().scene;
       return scene.screenSpaceCameraController.enableTranslate;
    }
           
    map3d.prototype.EnableDragging    = function (enable)
    {
       var scene = this.GetView().scene;
       scene.screenSpaceCameraController.enableTranslate = enable;
    }   
        
    map3d.prototype.IsEnableWheel  = function ()
    {
       var scene = this.GetView().scene;
       return scene.screenSpaceCameraController.enableZoom;
    }
    
   map3d.prototype.EnableWheel  = function(enable)
   {
       var scene = this.GetView().scene;
       scene.screenSpaceCameraController.enableZoom = enable;
   }
   
   map3d.prototype.IsEnableKeyboardPan  = function ()
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableTranslate;
    }
           
    map3d.prototype.EnableKeyboardPan    = function (enable)
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableTranslate = enable;
    }   
        
    map3d.prototype.IsEnableKeyboardZoom  = function ()
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableZoom;
    }
           
    map3d.prototype.EnableKeyboardZoom    = function (enable)
    {
        var scene = this.GetView().scene;
        scene.screenSpaceCameraController.enableZoom = enable;
    } 
    

    map3d.prototype.IsEnableRotate  = function ()
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableRotate;
    }
           
    map3d.prototype.EnableRotate      = function (enable)
    {
        var scene = this.GetView().scene;
        scene.screenSpaceCameraController.enableRotate  = enable;
    }  
   
       map3d.prototype.IsEnableTilt   = function ()
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableTilt;
    }
           
    map3d.prototype.EnableTilt       = function (enable)
    {
        var scene = this.GetView().scene;
        scene.screenSpaceCameraController.enableTilt   = enable;
    }  
    
    map3d.prototype.IsEnableLook   = function ()
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableLook ;
    }
           
    map3d.prototype.EnableLook       = function (enable)
    {
        var scene = this.GetView().scene;
        scene.screenSpaceCameraController.enableLook    = enable;
    }  
    
    map3d.prototype.IsInputActive     = function(name)
    {
        var scene = this.GetView().scene;
        return scene.screenSpaceCameraController.enableZoom;
    }
    
    map3d.prototype.EnableInput  = function(enable)
    {
       var scene = this.GetView().scene;
       scene.screenSpaceCameraController.enableInputs = enable;
       return ;                     
    //       if (enable)
    //       {
    //           // 如果为真，则允许用户旋转相机。如果为假，相机将锁定到当前标题。此标志仅适用于2D和3D。
    //            scene.screenSpaceCameraController.enableRotate = true;
    //            // 如果为true，则允许用户平移地图。如果为假，相机将保持锁定在当前位置。此标志仅适用于2D和Columbus视图模式。
    //            scene.screenSpaceCameraController.enableTranslate = true;
    //            // 如果为真，允许用户放大和缩小。如果为假，相机将锁定到距离椭圆体的当前距离
    //            scene.screenSpaceCameraController.enableZoom = true;
    //            // 如果为真，则允许用户倾斜相机。如果为假，相机将锁定到当前标题。这个标志只适用于3D和哥伦布视图。
    //            scene.screenSpaceCameraController.enableTilt = true;
    //            // 如果为true，则允许用户使用免费外观。如果错误，摄像机视图方向只能通过转换或旋转进行更改。此标志仅适用于3D和哥伦布视图模式。
    //            scene.screenSpaceCameraController.enableLook = true;       
    //       }
    //       else
    //       {
    //            scene.screenSpaceCameraController.enableRotate = false;
    //            scene.screenSpaceCameraController.enableTranslate = false;
    //            scene.screenSpaceCameraController.enableZoom = false;
    //            scene.screenSpaceCameraController.enableTilt = false;
    //            scene.screenSpaceCameraController.enableLook = false;       
    //       }
    //       return ;
    } 

    map3d.prototype.AddSingleImage = function(option)
    {
        var name = option.name ? option.name : 'testE';
        var url = option.url ? option.url : 'image/entity.jpg';
        var polygon = option.polygon ? option.polygon : [[[109.080842,25.002073],[105.91517,25.002073],[104.058488,24.996596],
                                                          [104.053011,23.002989],[104.053011,21.003906],[105.728954,20.998429],
                                                          [107.919731,21.003906],[109.04798,20.998429],
                                                          [111.047063,20.998429],[111.047063,22.000709],
                                                          [111.047063,24.476286],[111.05254,25.002073]
                                                        ]];

        var exparam = {
            type: 'image',
            imgUrl: url,
            transparent: option.transparent ? option.transparent : false
        };
        this.AddEntity(name, polygon, undefined, undefined, exparam);
        return;
    } 

    map3d.prototype.RemoveSingImage = function(name)
    {
        var name = name;
        this.RemoveEntity(name);
    } 

    //=====================定义infowindow对象===============================================
    Map3DSDK.InfoWindow = function(point, content, obj) 
    {
        var infowindow = {};
        if(!point[2]){
            point[2] = 0;
        }
        this.InfoWindowPoint = point;
        this.InfoWindowSite  = obj;
        this.divid = obj.divid ? obj.divid : "trackPopUp";

        var infoDiv = '<div id="'+this.divid+'" style="display:block;">'+
                 '<div id="'+this.divid+'Content" class="leaflet-popup" style="top:5px;left:0;">'+
                   '<a class="leaflet-popup-close-button" data_id ="'+this.divid+'" href="#">×</a>'+
                   '<div class="leaflet-popup-content-wrapper">'+
                     '<div id="'+this.divid+'Link" class="leaflet-popup-content" style="max-width: 300px;"></div>'+
                   '</div>'+
                   '<div class="leaflet-popup-tip-container">'+
                     '<div class="leaflet-popup-tip"></div>'+
                   '</div>'+
                 '</div>'+
                '</div>';
        $("#" + obj.viewer.divID).append(infoDiv);


        $(".cesium-selection-wrapper").show();
        $('#' + this.divid+'Link').empty();
        $('#' + this.divid+'Link').append(content);
        var client = obj.viewer.MapCoord2Screen([parseFloat(point[0]), parseFloat(point[1]), parseFloat(point[2])]);//屏幕坐标
       
        var c = new GmMap3D.Cartesian2(parseFloat(client[0]), parseFloat(client[1]));//client屏幕坐标,c为二维坐标
        
        positionPopUp(c,obj); 
        $("#" + this.divid).hide();
        
        this.viewer = obj.viewer;
        var mapView = obj.viewer;
        var viewer =  obj.viewer.GetCesium().viewer;
        var scene = viewer.scene;
        var infowindow = this;
        var addHandler = scene.postRender.addEventListener(function () {
            var pos={};
            pos = GmMap3D.Cartesian3.fromDegrees(parseFloat((infowindow.InfoWindowPoint)[0]), parseFloat((infowindow.InfoWindowPoint)[1]), parseFloat((infowindow.InfoWindowPoint)[2])); //wgs坐标
            try{
                var changedC = GmMap3D.SceneTransforms.wgs84ToWindowCoordinates(viewer.scene,pos);
                changedC = new GmMap3D.Cartesian2(parseFloat(changedC.x), parseFloat(changedC.y));//client屏幕坐标

                if ((c.x !== changedC.x) || (c.y !== changedC.y)) {
                    positionPopUp(changedC,infowindow.InfoWindowSite);
                    c = changedC;
                }
            }catch(e){

            }        
            
        });
        this.addHandler = addHandler;
        function positionPopUp (c,siteParams) {
            var InfoWindowSite = siteParams;
            if(InfoWindowSite && InfoWindowSite !=undefined){
                if(!InfoWindowSite.xoffset){
                    InfoWindowSite["xoffset"] = 0;
                }
                if(!InfoWindowSite.yoffset){
                    InfoWindowSite["yoffset"] = 0;
                }
                if(!InfoWindowSite.positioning){
                    InfoWindowSite["positioning"] = 'bottom-center';
                }
            }else{
                InfoWindowSite = {xoffset: 0, yoffset: 0, positioning: 'bottom-center'};
            }
            var positioning = InfoWindowSite.positioning;
            var x = 0, y = 0;
            if(positioning.indexOf("top") > 0){//top
                y = c.y + 2 + InfoWindowSite.yoffset;
            }else{//bottom
                y = c.y - ($('#' + InfoWindowSite["divid"] + 'Content').height()) + 2 + InfoWindowSite.yoffset;
            }

            if(positioning.indexOf("left") > 0){
                x = c.x  + 0 + InfoWindowSite.xoffset;
            }else if(positioning.indexOf("right") > 0){
                x = c.x - ($('#' + InfoWindowSite["divid"] + 'Content').width()) + 0 + InfoWindowSite.xoffset;
            }else{
                x = c.x - ($('#' + InfoWindowSite["divid"] + 'Content').width()) / 2 + 0 + InfoWindowSite.xoffset;
            }

            $('#' + InfoWindowSite["divid"] + 'Content').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
        }

        $('.leaflet-popup-close-button').click(function() {
            var divid = $(this).attr("data_id");
            $('#' + divid).hide();
            $('#' + divid + 'Link').empty();
            $(".cesium-selection-wrapper").hide();
            addHandler.call();
            return false;
        });                             

        return this;
    }

    Map3DSDK.InfoWindow.prototype.SetContent = function(content){
        var InfoWindowSite = this.InfoWindowSite;
        $('#' + InfoWindowSite.divid+'Link').empty();
        $('#' + InfoWindowSite.divid+'Link').append(content);
    }

    Map3DSDK.InfoWindow.prototype.SetPosition = function(newPoint){
        if(!newPoint[2]){
            newPoint[2] = 0;
        }
        var client = this.viewer.MapCoord2Screen([parseFloat(newPoint[0]), parseFloat(newPoint[1]), parseFloat(newPoint[2])]);//屏幕坐标
        
        var c = new GmMap3D.Cartesian2(parseFloat(client[0]), parseFloat(client[1]));//client屏幕坐标,c为二维坐标
        this.InfoWindowPoint = newPoint;
        
        var InfoWindowSite = this.InfoWindowSite;
        if(InfoWindowSite && InfoWindowSite !=undefined){
            if(!InfoWindowSite.xoffset){
                InfoWindowSite["xoffset"] = 0;
            }
            if(!InfoWindowSite.yoffset){
                InfoWindowSite["yoffset"] = 0;
            }
            if(!InfoWindowSite.positioning){
                InfoWindowSite["positioning"] = 'bottom-center';
            }
        }else{
            InfoWindowSite = {xoffset: 0, yoffset: 0, positioning: 'bottom-center'};
        }
        var positioning = InfoWindowSite.positioning;
        var x = 0, y = 0;
        if(positioning.indexOf("top") > 0){//top
            y = c.y + 2 + InfoWindowSite.yoffset;
        }else{//bottom
            y = c.y - ($('#' + InfoWindowSite["divid"] + 'Content').height()) + 2 + InfoWindowSite.yoffset;
        }

        if(positioning.indexOf("left") > 0){
            x = c.x  + 0 + InfoWindowSite.xoffset;
        }else if(positioning.indexOf("right") > 0){
            x = c.x - ($('#' + InfoWindowSite["divid"] + 'Content').width()) + 0 + InfoWindowSite.xoffset;
        }else{
            x = c.x - ($('#' + InfoWindowSite["divid"] + 'Content').width()) / 2 + 0 + InfoWindowSite.xoffset;
        }
        $('#' + InfoWindowSite["divid"] + 'Content').css('transform', 'translate3d(' + x + 'px, ' + y + 'px, 0)');
    }

    map3d.prototype.OpenInfoWindow = function(infowindow){
        $('#' + infowindow.divid).show();   
    }

    map3d.prototype.UpdatePosition = function(infoWindow, position)
    {   
        if (infoWindow)
        {
            infoWindow.SetPosition(position);
        }
    }

    map3d.prototype.CloseInfoWindow = function(infoWindow)
    {
        $('#'+ infoWindow.divid).hide();
        $('#'+ infoWindow.divid).remove();  
        infoWindow.addHandler();
        infoWindow = {};
    }

    //===================================模型操作接口==================================================================================================
    map3d.prototype.AddModel = function(modelID,option,ifFlyTo,islocked,callback)
    {
        var copyoption = ZMAP3D.clone(option, true);    
        var oldmodel = this.GetModel(modelID);
        if(oldmodel != undefined || oldmodel != null){
            this.RemoveModel(modelID);
        }

        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);

        copyoption.modelid = modelID;
        if(copyoption.drotate){
            copyoption.drotate = [copyoption.drotate[0],copyoption.drotate[1],copyoption.drotate[2]];
        }else {
            copyoption.drotate = [0,0,0];
        }

               

        var model = this.zmapGltf.addModel(copyoption,ifFlyTo,islocked,callback);
        return model;
    }


    //获取实体模型
    map3d.prototype.GetModel = function(modelID)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        return this.zmapGltf.getModel(modelID);
    }

     //获取所有实体模型
     map3d.prototype.GetModels = function()
     {
        var models =this.GetView().entities._entities._array;
        var existModels = [];
        for(var i =0 ;i<models.length ;i++){
            var ent = models[i]._model;
            if(ent){
                existModels.push(models[i]);
            }
        }
         return existModels;
     }

    //显示实体模型
    map3d.prototype.showModelByid = function(modelID)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.showModel(modelID)
    }
    //隐藏实体模型
    map3d.prototype.unshowModelByid = function(modelID)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.unshowModel(modelID);
    }

    //显示实体模型
    map3d.prototype.showModel = function(modelEntity)
    {
        var existFlag =this.GetView().entities.contains(modelEntity);
        if(existFlag){
            modelEntity.show = true;
        };
    }
    //隐藏实体模型
    map3d.prototype.unshowModel = function(modelEntity)
    {
        var existFlag =this.GetView().entities.contains(modelEntity);
        if(existFlag){
            modelEntity.show = false;
        };
    }

    //显示所有实体模型
    map3d.prototype.showModels = function()
    {
        var models =this.GetView().entities._entities._array;
        for(var i =0 ;i<models.length ;i++){
            var ent = models[i]._model;
            if(ent){
                this.showModel(models[i]);
            }
        }
    }
    //隐藏所有实体模型
    map3d.prototype.unshowModels = function()
    {
        var models =this.GetView().entities._entities._array;
        for(var i =0 ;i<models.length ;i++){
            var ent = models[i]._model;
            if(ent){
                this.unshowModel(models[i]);
            }
        }
    }

    //根据id移除实体模型
    map3d.prototype.removeModelByid = function(modelID, single)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);

        if (single || single == undefined)
        {
            this.RemoveLoadTask(modelID);       
            this.zmapGltf.removeModelById(modelID);            
        }
        else
        {
           this.removeModelsByid(modelID);
        }
    }

    //移除实体模型
    map3d.prototype.removeModel = function(modelEntity)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.removeModel(modelEntity);
    }

    //根据id移除所有的模型
    map3d.prototype.removeModelsByid = function(modelID)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
                      
        this.RemoveLoadTask(modelID);       
        var models = this.GetModels();
        for (var i = 0; i < models.length; i++)
        {
            this.removeModel(models[i]);        
        }        
    }

    map3d.prototype.RemoveModel = function(modelID)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);       
        this.removeModelByid(modelID);
    }  
    
    map3d.prototype.RemoveLoadTask = function(modelID)
    {
        var fd = this.taskLoadMap[modelID];
        if (fd)
        {
            fd.cancle();
            delete this.taskLoadMap[modelID];
        }   
    }  

    map3d.prototype.RemoveAllLoadTask = function(modelID)
    {
        for (var key in this.taskLoadMap)
        {
            delete this.taskLoadMap[key];
        }        
    }  

    //移除所有实体模型
    map3d.prototype.removeModels = function()
    {
        var models =this.GetView().entities._entities._array;
        var self =this;
        var modelIds = [];
        for(var i=0;i<models.length;i++)
        {
            var ent = models[i].model;
            if(ent)
            {
                modelIds.push(models[i].id)
            }
        }
        modelIds.map(function(id){         
                self.removeModelByid(id);
        })
        
    };

    //模型旋转，position存在，就以position所在的位置旋转
    map3d.prototype.RotateModelByid = function(modelID,rotate,position)
    {
        var modelEntity = this.GetModel(modelID);
        this.RotateNewModel(modelEntity,rotate,position);
    };

    ////模型旋转，position存在，就以position所在的位置旋转
    map3d.prototype.RotateNewModel = function(modelEntity,rotate,position)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.changeOrientation(modelEntity,rotate,position);
    };

    map3d.prototype.RotateModel = function(modelID,rotate)
    {
        this.RotateModelByid(modelID,rotate);
    }

    //模型变更位置
    map3d.prototype.changePositionModelByid = function(modelID,position,isfly)
    {
        var modelEntity = this.GetModel(modelID);
        var dfly = true;
        if(!isfly){
            dfly = false;
        }else{
            dfly = isfly;
        }
        this.changePositionModel(modelEntity,position,dfly);
    };

    //模型变更位置
    map3d.prototype.changePositionModel = function(modelEntity,position,isfly)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        var dfly = true;
        if(!isfly){
            dfly = false;
        }else{
            dfly = isfly;
        }
        this.zmapGltf.changePosition(modelEntity,position,dfly);
    };


    //获取模型的位置
    map3d.prototype.getPositionModelByid = function(modelID,c3flag)
    {
        var modelEntity = this.GetModel(modelID);
        return  this.getPositionModel(modelEntity,c3flag);
    };

    //获取模型的位置
    map3d.prototype.getPositionModel = function(modelEntity,c3flag)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        return this.zmapGltf.getModelPosition(modelEntity,c3flag);
    };

    //模型变更颜色
    map3d.prototype.changeColorModelByid = function(modelID,color)
    {
        var modelEntity = this.GetModel(modelID);
        this.changeColorModel(modelEntity,color);
    };

    //模型变更颜色
    map3d.prototype.changeColorModel = function(modelEntity,color)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.changeColor(modelEntity,color);
    };


    //获取模型颜色
    map3d.prototype.getColorModelByid = function(modelID)
    {
        var modelEntity = this.GetModel(modelID);
        return  this.getColorModel(modelEntity);
    };

    //获取模型的颜色
    map3d.prototype.getColorModel = function(modelEntity)
    {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        return this.zmapGltf.getModelcolor(modelEntity);
    };

     //模型变更大小比例
     map3d.prototype.changeScaleModelByid = function(modelID,dscale)
     {
        var modelEntity = this.GetModel(modelID);
         this.changeScaleModel(modelEntity,dscale);
     };
 
    //模型变更放大比例
     map3d.prototype.changeScaleModel = function(modelEntity,dscale)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.changeScale(modelEntity,dscale);
     };
 
 
     //获取模型大小比例
     map3d.prototype.getScaleModelByid = function(modelID)
     {
        var modelEntity = this.GetModel(modelID);
         return  this.getScaleModel(modelEntity);
     };
 
     //获取模型的大小比例
     map3d.prototype.getScaleModel = function(modelEntity)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        return this.zmapGltf.getModelScale(modelEntity);
     };

     //动态旋转模型
     map3d.prototype.dynamicRotateModel = function(modelEntity,rotate)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        var dynamicModel =  new ZMAPGLTF.rotateModel(this.GetView(),modelEntity,rotate);

        return dynamicModel;
     }

     //单一模型的运动旋转
     map3d.prototype.singeldynamicRotateModel = function(options,locked,callback)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        var dynamicModel =  new ZMAPGLTF.singelMoveAndrotateModel(this.zmapGltf,options,locked,callback);

        return dynamicModel;
     }

     //两个模型的运动旋转
     map3d.prototype.shieldMachineMoveAndrotateModel = function(options,locked,callback)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        var dynamicModel =  new ZMAPGLTF.shieldMachineMoveAndrotateModel(this.zmapGltf,options,locked,callback);

        return dynamicModel;
     }

     //盾构机跳动旋转
     map3d.prototype.shieldMachinejumpAndrotateModel = function(options,locked,callback)
     {
        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        var dynamicModel =  new ZMAPGLTF.shieldMachinejumpAndrotateModel(this.zmapGltf,options,locked,callback);

        return dynamicModel;
     }

     //以不同的角度看模型
     map3d.prototype.lookatModel = function(model,options){

        this.zmapGltf =  this.zmapGltf || new ZMAPGLTF(this);
        this.zmapGltf.lookModel(model,options);
     }
    
    map3d.prototype.urlTransform = function(options,callback){

        var id = options.id;
        if(!id){
            return ;
        }
        var url = options.url;
        if(!url){
            return ;
        }
        var longlat = options.longlat;
        var single = options.single;
        var load = options.single;
        this.addZmapModel(id,url,longlat,single,load,callback,{ifFlyTo:options.ifFlyTo||false});
    }
    
    var ZMapFetch = function MapFetch(url)
    {
        this.url = url;
    }
    
    ZMapFetch.prototype = {
        constructor:ZMapFetch,
        then: function (callback)
        {
            $.ajax({
               url: url,
               success: function(data)
               {
                  callback(e)      
               },
               error: function(e)
               {
                  
               }                
            });
            return this;
        }
    }
       
    
    var LoadGroupTask = function()
    {
        this.id       = null;
        this.iscancle = "false";
    }
    
    LoadGroupTask.prototype = {
        constructor:LoadGroupTask,
        cancle: function() {this.iscancle = "true";},
        request: function(map, initq, id, url, longlat, single,load,callback,options){
        this.id = id;  
        var czviewer   = map.GetView();   
        var setOptions = [];   
        if(url.indexOf('/zs/zfcls')>-1)
        {
            this.zmapGltf = this.zmapGltf||new ZMAPGLTF(map);

            function doSuccess(tree) {
                var data = tree;

                var position = data.position.split(",");
                if (position.length == 3) {
                    position[0] = parseFloat(position[0]);
                    position[1] = parseFloat(position[1]);
                    position[2] = parseFloat(position[2]);
                }
                if (longlat && Array.isArray(longlat) && longlat.length == 3 && !isNaN(longlat[0]) && !isNaN(longlat[1]) && !isNaN(longlat[2])) {
                    position = longlat;
                }

                var setOption = {
                    modelid: id,
                    name: data.name || id,
                    drotate: [0, 0, 0],
                    position: position,
                    initq: initq,
                    center: data.center,
                    url: url + '/model/0/' + data.offset,
                    dcolor: GmMap3D.Color.WHITE,
                    dscale: 1,
                    dcolorBlendMode: GmMap3D.ColorBlendMode.HIGHLIGHT,
                    dcolorBlendAmount: 0.5
                }

                if (typeof callback == 'function') {
                    setOption = callback(setOption) || setOption;
                }

                if (options.ifFlyTo != false) {
                    czviewer.camera.flyTo({
                        destination: GmMap3D.Cartesian3.fromDegrees(parseFloat(position[0]), parseFloat(position[1]), parseFloat(position[2]) + options.distance || 1500)
                    });
                }
                return position;
            }

            function SplitModel(ab, group, mapdata, position) {

                var vu32 = new Uint32Array(ab);
                //var vu8 = new Uint8Array(ab);
                var mnum = vu32[0];
                var joffset = vu32[1];
                var jsize = vu32[2];

                /// 分割模型
                for (var num = 0; num < mnum; ++num) {
                    var md = mapdata[group[num]];
                    var joffset = vu32[num * 2 + 3];
                    var jsize = vu32[num * 2 + 4];
                    var curl = URL.createObjectURL(new Blob([ab.slice(joffset, joffset + jsize)]));
                    var setOp = {
                        modelid: id + '-' + md.id,
                        name: md.name || md.id,
                        drotate: [0, 0, 0],
                        position: position,
                        center: md.center,
                        initq: initq,
                        url: curl,
                        show: load,
                        dcolor: GmMap3D.Color.WHITE,
                        dscale: 1,
                        dcolorBlendMode: GmMap3D.ColorBlendMode.HIGHLIGHT,
                        dcolorBlendAmount: 0.5
                    };

                    if (typeof callback == 'function') {
                        setOp = callback(setOp) || setOp;
                    }

                    if (load && !single) {
                        if (map.GetModel(setOp.modelid)) {
                            map.RemoveModel(setOp.modelid)
                        }
                    }
                    var entity = map.AddModel(setOp.modelid, setOp)//czviewer.entities.add(setOp);
                }
            }

            function tree2map(models, mapdata) {
                for (var i = 0; i < models.length; ++i) {
                    var md = models[i];
                    if (md.complex) {
                        tree2map(md.children, mapdata);
                    }
                    else {
                        mapdata[md.id] = md;
                    }
                }
            }

            /// 
            function loadgroup(group, mapdata, position, objthis) {
                if (group == null) return ;

                fetch(url + '/model/group/' + group.join(','))
                    .then( function(e) { return e.arrayBuffer(); })
                    .then( function(e) { 
                        if (objthis.iscancle == "true") return ;
                        SplitModel(e, group, mapdata, position); });
            }

            //分组请求模型数据            
            if (!single)
            {
                var objthis = this;
                fetch(url + '/model/pg/2000000')
                    .then(function(e) { return e.json(); })
                    .then(function(e) {
                        
                        //                        
                        if (objthis.iscancle == "true") return ;
                        
                        /// json 字符串
                        var position = doSuccess(e.tree);

                        var mapdata = {};
                        tree2map(e.tree.children, mapdata);
                        for (var i = 0; i < e.groups.length; ++i) {
                            loadgroup(e.groups[i], mapdata, position, objthis);
                        }
                    });                
            }  
            else
            {
                $.ajax({
                    url: url + '/info',
                    datatype: 'json',
                    success: function(data){
                            var position = data.position.split(",");
                            if(position.length==3)
                            {
                              position[0] = parseFloat(position[0]);
                              position[1] = parseFloat(position[1]);
                              position[2] = parseFloat(position[2]);
                            }
                            else
                            {
                              position = longlat;
                            }

                            var setOption = {
                                modelid:id,
                                name : id,
                                drotate:[90,0,0],
                                initq: initq,
                                position : position,
                                url : url + '/model/0/' + data.offset,
                                dcolor : GmMap3D.Color.WHITE,
                                show: load,
                                dscale:1,
                                dcolorBlendMode :  GmMap3D.ColorBlendMode.HIGHLIGHT,
                                dcolorBlendAmount :  0.5
                                // position : pos,
                                // orientation : ori,
                                // model : {
                                //     uri : url + '/model/0/' + data.offset,
                                //     color : GmMap3D.Color.WHITE,
                                //     colorBlendMode :  GmMap3D.ColorBlendMode.HIGHLIGHT,
                                //     colorBlendAmount :  0.5,
                                //     //minimumPixelSize : 128,
                                //     //maximumScale : 20000,
                                // }
                            }

                            if(typeof callback =='function')
                            {
                                setOption = callback(setOption)||setOption;
                            }

                            if(load && map.zmapGltf.getModel(setOption.modelid))
                            {
                                map.zmapGltf.removeModelById(setOption.modelid)
                            }
                            var entity = map.zmapGltf.addModel(setOption);
                            czviewer.camera.flyTo({
                                destination : GmMap3D.Cartesian3.fromDegrees(parseFloat(position[0]),parseFloat(position[1]), parseFloat(position[2])+1000)
                            });
                        }
                });
            }
        }

        else if(url.indexOf('/zs/obj')>-1)
        {
            this.zmapGltf = this.zmapGltf||new ZMAPGLTF(map);
            $.ajax({
                url: url + '/files/zmapgltf.json',
                datatype: 'json',
                success: function(data){
                    data = JSON.parse(data);
                    var position = data.position.split(",");
                    if(position.length==3)
                    {
                    position[0] = parseFloat(position[0]);
                    position[1] = parseFloat(position[1]);
                    position[2] = parseFloat(position[2]);
                    }

                    if(longlat&&Array.isArray(longlat)&&longlat.length==3&&!isNaN(longlat[0])&&!isNaN(longlat[1])&&!isNaN(longlat[2]))
                    {
                    position = longlat;
                    }

                    if(Array.isArray(data.children))
                    {
                        for(var i=0;i<data.children.length;i++)
                        {
                            var setOption = {
                                modelid:data.children[i].id||(id+'-'+data.children[i].url.replace('.gltf','')),
                                name : data.children[i].name||(id+'-'+i),
                                drotate:[0,0,0],
                                position : position,
                                url : url + '/files/' + data.children[i].url,
                                dcolor : GmMap3D.Color.WHITE,
                                dscale:1,
                                show: load,
                                colorBlendMode :  GmMap3D.ColorBlendMode.HIGHLIGHT,
                                colorBlendAmount :  0.5
                            }
                            
                            if(typeof callback =='function')
                            {
                                setOption = callback(setOption)||setOption;
                            }

                            if(load)
                            {
                                if(map.GetModel(setOption.modelid))
                                {
                                    map.RemoveModel(setOption.modelid)
                                }
                            }                         
                            var entity = map.AddModel(setOption.modelid,setOption) ;
                        }
                    }
                    
                    if(options.ifFlyTo!=false)
                    {
                        czviewer.camera.flyTo({
                            destination : GmMap3D.Cartesian3.fromDegrees(parseFloat(position[0]),parseFloat(position[1]), parseFloat(position[2])+options.distance||1500)
                        });
                    }
                    
                }
            })
        }
        else if(url.indexOf('/zs/osg')>-1||url.indexOf('/zs/ifc')>-1||url.indexOf('/zs/3dtiles')>-1)
        {
            this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(map);
            $.ajax({
            	url:url.replace('osg','data').replace('ifc','data').replace('3dtiles','data')+'?f=json',//.replace('osg','data').replace('ifc','data').replace('files/3dtiles.json','?f=json'),//'http://192.168.8.97:9080/zs/data/PDzMap/Bim?f=json',
            	type:'post',
            	datatype:'json',
            	success:function(data)
            	{
                    
                    var position = [parseFloat(data.attributes.X),parseFloat(data.attributes.Y),parseFloat(data.attributes.Z)];

                    if(longlat&&Array.isArray(longlat)&&longlat.length==3&&!isNaN(longlat[0])&&!isNaN(longlat[1])&&!isNaN(longlat[2]))
                    {
                    position = longlat;
                    }
            		var setOption = {
                        modelid:id,
            			position : position,
		                url : url+'/files/3dtiles.json',
		                fskipScreenSpaceErrorFactor : 16,
		                fskipLevels : 7
                    }
                    if(isNaN(position[0])||isNaN(position[1])||isNaN(position[2]))
                    {
                        delete setOption.position;
                    }
                    if(typeof callback =='function')
                    {
                        setOption = callback(setOption)||setOption;
                    }

                    if(load)
                    {
                        if(map.get3dTilesById(setOption.modelid))
                        {
                            map.deleteTilesById(setOption.modelid)
                        }
                        var entity = map.add3dTiles(setOption,options.ifFlyTo!=false?true:false);
                    }

            		
            	}
            })
        }
        else if(url.indexOf('/zs/dot')>-1){
        
            this.zmapGeometry = this.zmapGeometry||new ZMAPGEOMETRY(map);

            $.ajax({
                url: url.replace('dot','data')+'?f=json',
                dataType: 'json',
                success: function(data)
                {

                    var iconurl = data.attributes.modelUrl;

                    if(iconurl&&iconurl!=""&&iconurl.indexOf('/zs/')>-1)
                    {
                        $.ajax({
                            url: iconurl + '/files/zmapgltf.json',
                            datatype: 'json',
                            success: function(data){
                                data = JSON.parse(data);
                                if(data.children&&Array.isArray(data.children)&&data.children.length>0)
                                {
                                    var gltfurl = iconurl + '/files/' + data.children[0].url;
                                    getDot(gltfurl)
                                }
                                else{
                                    getDot();
                                }

                            },
                            error:function(){
                                getDot();
                            }
                        })
                    }
                    else
                    {
                        getDot()
                    }
                }
            })


            function getDot(modelurl)
            {
                $.ajax({
                    url: url+'/info?f=json',
                    dataType: 'json',
                    success: function(data)
                    {
                        var jdata = data["data"];
                        var dw = true;            
                        for (var i = 0; i < jdata.length; i++)
                        {
                            var pid = jdata[i]["ID"]||i;
                            var x = parseFloat(jdata[i]["X"]);
                            var y = parseFloat(jdata[i]["Y"]);
                            var z = parseFloat(jdata[i]["Z"]);
                            if(isNaN(x)||isNaN(y)||isNaN(z))
                            {
                                continue;
                            }
                            if(dw)
                            {
                                if(options.ifFlyTo !=false)
                                {
                                    map.setCamera({position:[x,y,z+options.distance||1500],rotate:[0,-90,0]})
                                }
                                dw =false;
                            }
                            if(modelurl)
                            {
                                var setOption = {
                                    modelid:id+'-'+pid,
                                    name : pid,
                                    drotate:[0,0,0],
                                    position : [x,y,z],
                                    url : modelurl,
                                    dcolor : GmMap3D.Color.WHITE,
                                    dscale:1,
                                    colorBlendMode :  GmMap3D.ColorBlendMode.HIGHLIGHT,
                                    colorBlendAmount :  0.5
                                }
                                
                                if(typeof callback =='function')
                                {
                                    setOption = callback(setOption)||setOption;
                                }
    
                                if(load)
                                {
                                    if(map.GetModel(setOption.modelid))
                                    {
                                        map.RemoveModel(setOption.modelid)
                                    }
                                    var entity = map.AddModel(setOption.modelid,setOption) ;
                                }  
                                
                            }
                            else
                            {
                                var setOption = {
                                    id:id+'-'+pid,
                                    name:pid,
                                    position:[x,y,z],
                                    dcolor:'red',
                                    dpixelSize:10
                                }
        
                                if(typeof callback =='function')
                                {
                                    setOption = callback(setOption)||setOption;
                                }
        
                                if(load)
                                {
                                    if(map.zmapGeometry.getModel(setOption.id))
                                    {
                                        map.zmapGeometry.removeEntityById(setOption.id)
                                    }
                                    map.zmapGeometry.addPoint(setOption);
                                } 
                            }
                             
                        }                 
                    },
                    error:function(e)
                    {                    
                    }
                });
            }            
        }         
      }
   }

   /*--weili  添加发布模型接口，其中options是扩展参数。--*/
    map3d.prototype.addZmapModel =  function(id,url, longlat, single,load,callback,options)
    {
        var map = this;
        options = options||{};
        var initq      = this._initq;       
        this.taskLoadMap[id] = new LoadGroupTask();
        this.taskLoadMap[id].request(map, initq, id, url, longlat, single, load, callback, options);        
    }

    /*--liumeng  以一定方向和高度看锁定后的模型--*/
    /**
     * 
     * @param {*} modelEntity 
     * @param {*} rotate  给定标准的方向
     * @param {*} type 是那种方式看模型 1.俯视 2，沿给定的方向，3沿给定方向的反方向
     * 4正视图，5正视的反方向
     * @param {*} distance 距离
     */
    map3d.prototype.lookatLockedModelEx = function(modelEntity,rotate,distance){

        var mviewer = this.GetView();
        var model = modelEntity;
        var definedDistance = 0;
        var centerPoint = null;
        var  modelFlag = true;

        //判断是否存在该对象
        if(typeof modelEntity =='string')
        {
            if(this.zmapGltf){
                model =  this.GetModel(modelEntity);
            }else if(this.zmap3DTiles){
                model =  this.get3dTilesById(modelEntity);
                modelFlag = false;
            }
           
        }
        if(!model){
            return;
        }

        if(model._id){
            modelFlag = true;
        }

        if(!modelFlag){
            centerPoint = model._root._boundingVolume._boundingSphere.center;
            definedDistance = model._root._boundingVolume._boundingSphere.radius;
        }else{
            var allprimitives =  mviewer.scene.primitives._primitives;
            var delpriEntity = null;
            for(var i=0 ; i< allprimitives.length ; i++){
                var primi = allprimitives[i];
                if(primi.id){
                    if(primi.id._id === model._id){
                        delpriEntity = primi;
                        break;
                    }
                }
            };
            definedDistance = delpriEntity._scaledBoundingSphere.radius;
            centerPoint = model._position._value;
        }

        if(model){
            mviewer.trackedEntity = model;
        }
        else{
            return;
        }

        this.lookatLockedModelFlool(centerPoint,rotate,definedDistance,distance);

        mviewer.trackedEntity = null;
    }

    map3d.prototype.assignloockat = function(rotate,type){
        if(!type){
            return rotate;
        }

        switch(Number(type))
        {
        case 1:
            rotate[1] = 90;
            break;
        case 2:
            var cdeg =   Number(rotate[0])+180;
            if(cdeg<=180){
                rotate[0] = cdeg;
            }else if(cdeg>180&&cdeg<360){
                rotate[0] = 360-cdeg;
            }
            break;
        case 3:
            rotate[0] =  Number(rotate[0])+90;
            break;
        case 4:
            rotate[0] =  Number(rotate[0])-90;
            break;
        default:
            break;
        }
        return rotate;
    }

    map3d.prototype.lookatLockedModelFlool = function(centerPoint,rotate,definedDistance,distances){
      
        
        var viewDis = definedDistance*5;

        if(distances){
            viewDis = distances;
        }
      
        var camepoo = this.deviationCalculate(centerPoint,GmMap3D.Math.toRadians(rotate[0]),GmMap3D.Math.toRadians(rotate[1]),viewDis);
      
        var newcajw = this.cartesianTo2MapCoord(camepoo);

        newcajw[2] = Math.abs(newcajw[2]);

        var camepo = this.JWcoordToC3(newcajw);

        var hp = this.calculatehp(this.cartesianTo2MapCoord(camepo),this.cartesianTo2MapCoord(centerPoint));
      
        var jwdcamepo = this.cartesianTo2MapCoord(camepo);
      
        cpositon1 = GmMap3D.Cartographic.fromCartesian(camepo);

        cpositon2 = GmMap3D.Cartographic.fromCartesian(centerPoint);

        this.GetCegore().camera.lookAtFromTo(cpositon1,cpositon2);
      
    }

    /*--weili  以一定方向和高度看锁定后的模型，针对于entity实体--*/
    map3d.prototype.lookatLockedModel = function (modelEntity,rotate,distance){
        this.lookatLockedModelEx(modelEntity,rotate,distance);
        // var model = modelEntity;
        // if(typeof modelEntity =='string')
        // {
        //     model =  this.GetModel(modelEntity);
        // }

        // if(model){
        //     this.GetView().trackedEntity = model;
        // }
        // else{
        //     return;
        // }

        // var pos = model.position._value;
        // var ori = model.orientation._value;
        // var M4 = Cesium.Matrix4.fromTranslationQuaternionRotationScale(pos,ori,new Cesium.Cartesian3(1.0, 1.0, 1.0));
    
        // var hpr  = Cesium.Transforms.fixedFrameToHeadingPitchRoll(M4);
        
        // //模型自身角度
        // var rot = [GmMap3D.Math.toDegrees(hpr.heading),GmMap3D.Math.toDegrees(hpr.pitch),GmMap3D.Math.toDegrees(hpr.roll)];

        // //计算最终角度
        // var h = (rotate[0]+rot[0])%360<0?(rotate[0]+rot[0])%360+360:(rotate[0]+rot[0])%360;
        // var p = (rotate[1]+rot[1])%360<0?(rotate[1]+rot[1])%360+360:(rotate[1]+rot[1])%360;

        // if(h%90==0)
        // {
        //     h=h+0.5;
        // }
        // if(p%90==0)
        // {
        //     p=p+0.5;
        // }
        
        // //计算xyz
        // var x = Math.sqrt(distance*distance*Math.sin(h/180*Math.PI)*Math.sin(h/180*Math.PI)*(1-(Math.sin(p/180*Math.PI)*Math.sin(p/180*Math.PI)))/(1-Math.sin(h/180*Math.PI)*Math.sin(h/180*Math.PI)*Math.sin(p/180*Math.PI)*Math.sin(p/180*Math.PI)))||0;
        // var y = Math.sqrt(x*x*(1-Math.sin(h/180*Math.PI)*Math.sin(h/180*Math.PI))/(Math.sin(h/180*Math.PI)*Math.sin(h/180*Math.PI)))||0;
        // var z = Math.sqrt(distance*distance-x*x-y*y)||0;

        // if(h>90&&h<270)
        // {
        //     y = -y;
        // }
        // if(h>180&&h<360)
        // {
        //     x = -x;
        // }
        // if(p>180&&p<360)
        // {
        //     z = -z;
        // }

        // var self = this;
        // console.log(h,p,x,y,z);
        // //锁定结束后以对应位置看向实体
        // setTimeout(function(){
        //     self.GetView().scene.camera.lookAtTransform(self.GetView().scene.camera.transform,{x:x,y:y,z:z});
        // },20)
        

    }



    map3d.prototype.lockedModel = function (modelEntity){
        
        if(modelEntity){
            this.GetView().trackedEntity = modelEntity;
        }
    }

    map3d.prototype.unLockModel = function (){
        this.GetView().trackedEntity = null;
    }

    map3d.prototype.getColorBlendMode = function (colorBlendMode){
        return GmMap3D.ColorBlendMode[colorBlendMode.toUpperCase()];
    }
    
    map3d.prototype.getColor = function(colorName, alpha) {
        var color = GmMap3D.Color[colorName.toUpperCase()];
        return GmMap3D.Color.fromAlpha(color, parseFloat(alpha));
    }
    
    map3d.prototype.PickModel = function(position)
    {        
        var viewer = this.GetCegore();
        var viewer       = this.GetView();
        var scene        = viewer.scene;
        var pick = {};
        var pixel        = {x: parseFloat(position.x), y: parseFloat(position.y) };
		var pickedObject = scene.pick(pixel);
		if (scene.pickPositionSupported && GmMap3D.defined(pickedObject) && pickedObject.primitive) 
		{
			var cartesian = viewer.scene.pickPosition(pixel);
			if (GmMap3D.defined(cartesian))
			{
				var cartographic = GmMap3D.Cartographic.fromCartesian(cartesian);
				var lng = GmMap3D.Math.toDegrees(cartographic.longitude);
				var lat = GmMap3D.Math.toDegrees(cartographic.latitude);
				
				//模型高度
				var height = cartographic.height;
				pick.coord = {x:lng.toFixed(6), y:lat.toFixed(6), z:height.toFixed(6)};
			}
		}
		else
		{
            var ray      = viewer.camera.getPickRay(pixel);
            var cartesian= viewer.scene.globe.pick(ray, scene);
            if (GmMap3D.defined(cartesian))
			{
                var cartographic = GmMap3D.Cartographic.fromCartesian(cartesian);
                var lng          = GmMap3D.Math.toDegrees(cartographic.longitude);//经度值
                var lat          = GmMap3D.Math.toDegrees(cartographic.latitude);//纬度值
                pick.coord       = {x:lng.toFixed(6), y:lat.toFixed(6), z:cartographic.height.toFixed(6)};
            }
		}		
		pick.models = pickedObject;    
		return pick;    
    }

    //====================================================BIM(3Dtiles)操作接口===============================================================================
    map3d.prototype.add3dTiles = function(param,isfly,loadcallback){
        
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        var tilesEntity = this.zmap3DTiles.add3dTiles(param,isfly,loadcallback);
        return tilesEntity;
    }

    //通过id获取3dTiles对象
    map3d.prototype.get3dTilesById = function(tilesId)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        return this.zmap3DTiles.get3dTilesById(tilesId);
    }
    //通过id移除3dTiles对象
    map3d.prototype.deleteTilesById = function(tilesId)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this);
        this.zmap3DTiles.deleteTilesById(tilesId);
    }

    //显示3dTiles模型
    map3d.prototype.showTiles = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.show(tilesEntity);
    }
    //隐藏3dTiles模型
    map3d.prototype.unshowTiles = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshow(tilesEntity);
    }

    //显示所有3dTiles模型
    map3d.prototype.showAllTiles = function()
    {
        // var dtiles = this.GetView().scene.primitives._primitives;
        // for(var i = 0 ; i< dtiles.length ; i++){
        //     var tile = dtiles[0];
        //     if(tile.constructor.name === "Cesium3DTileset"){
        //         this.showTiles(tile);
        //     }
        // }
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        for(var k in this.zmap3DTiles.tileslist)
        {
            this.showTiles(this.zmap3DTiles.tileslist[k])
        }
    }
    //隐藏所有3dTiles模型
    map3d.prototype.unshowAllTiles = function()
    {
        // var dtiles = this.GetView().scene.primitives._primitives;
        // for(var i = 0 ; i< dtiles.length ; i++){
        //     var tile = dtiles[0];
        //     if(tile.constructor.name === "Cesium3DTileset"){
        //         this.unshowTiles(tile);
        //     }
        // }
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        for(var k in this.zmap3DTiles.tileslist)
        {
            this.unshowTiles(this.zmap3DTiles.tileslist[k])
        }
    }

    //获取所有的3dtiles对象
    map3d.prototype.getAllTiles = function()
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        // var existTiles = [];
        // for(var i = 0 ; i< this.zmap3DTiles.tileslist.length ; i++){
        //     var tile = this.zmap3DTiles.tileslist[0];
        //     for(var ob in tile){
        //         existTiles.push(tile[ob]); 
        //     }
        // }
        //return existTiles;

        return this.zmap3DTiles.tileslist
    }

    //移除3dtiles对象
    map3d.prototype.removeTiles = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.deletedTiles(tilesEntity);
    }

    //移除所有的3dtiles对象
    map3d.prototype.removeAllTiles = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        // var dtiles = this.GetView().scene.primitives._primitives;
        // for(var i = 0 ; i< dtiles.length ; i++){
        //     var tile = dtiles[0];
        //     if(tile.constructor.name === "Cesium3DTileset"){
        //         this.removeTiles(tile);
        //     }
        // }
        // this.zmap3DTiles.tileslist = [];
        var keys = Object.keys(this.zmap3DTiles.tileslist);
        for(var i in keys)
        {
            this.deleteTilesById(keys[i])
        }

    }

    //显示3dtiles模块的url
    map3d.prototype.show3dTilesModelUrl = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugShowUrl(tilesEntity);
    }

    //隐藏3dtiles模块的url
    map3d.prototype.unshow3dTilesModelUrl = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugShowUrl(tilesEntity);
    }

    //显示3dtiles模块占用内存
    map3d.prototype.show3dTilesModelMemoryUsage = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugShowMemoryUsage(tilesEntity);
    }
    //隐藏3dtiles模块占用内存
    map3d.prototype.unshow3dTilesModelMemoryUsage = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugShowMemoryUsage(tilesEntity);
    }
    //显示绘制标签以指示每个图块的命令，点，三角形和要素的数量。
    map3d.prototype.show3dTilesModelRenderingStatistics = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugShowRenderingStatistics(tilesEntity);
    }
    //隐藏绘制标签以指示每个图块的命令，点，三角形和要素的数量。
    map3d.prototype.unshow3dTilesModelRenderingStatistics = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugShowRenderingStatistics(tilesEntity);
    }
    //显示每个图块的内容呈现边界体积
    map3d.prototype.show3dTilesModelContentBoundingVolume = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugShowContentBoundingVolume(tilesEntity);
    }
    //隐藏每个图块的内容呈现边界体积。
    map3d.prototype.unshow3dTilesModelContentBoundingVolume = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugShowContentBoundingVolume(tilesEntity);
    }

    //显示每个图块呈现边界体积。
    map3d.prototype.show3dTilesModelBoundingVolume = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugShowBoundingVolume(tilesEntity);
    }
    //隐藏每个图块呈现边界体积。
    map3d.prototype.unshow3dTilesModelBoundingVolume = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugShowBoundingVolume(tilesEntity);
    }

    //显示内容渲染为线框。
    map3d.prototype.show3dTilesModelWireframe = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugWireframe(tilesEntity);
    }
    //隐藏内容渲染为线框。
    map3d.prototype.unshow3dTilesModelWireframe = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugWireframe(tilesEntity);
    }
    //给每个模块设置随机颜色。
    map3d.prototype.tilesModelRandomColor = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.showDebugColorizeTiles(tilesEntity);
    }
    //取消每个模块设置随机颜色。
    map3d.prototype.untilesModelRandomColor = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.unshowDebugColorizeTiles(tilesEntity);
    }

    //====设置tiles 的Style，前提是对应得json数据中包括你设置的条件
    //dconditions数据结构(前提是json数据中有height参数)
    // dconditions = [['${height} >= 300', 'rgba(45, 0, 75, 0.5)'],
    //  ['${height} >= 200', 'rgb(102, 71, 151)'],
    //  ['${height} >= 100', 'rgb(170, 162, 204)'],
    //  ['${height} >= 50', 'rgb(224, 226, 238)'],
    //  ['${height} >= 25', 'rgb(252, 230, 200)'],
    //  ['${height} >= 10', 'rgb(248, 176, 87)'],
    //  ['${height} >= 5', 'rgb(198, 106, 11)'],
    //  ['true', 'rgb(127, 59, 8)']
    // ]
    //根据高度设置不同的颜色
    map3d.prototype.tilesModelColorByHeight = function(tilesEntity,dconditions)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.colorByHeight(tilesEntity,dconditions);
    }

    // dconditions =  [
    //     ['${latitudeRadians} >= 0.7125', "color('purple')"],
    //     ['${latitudeRadians} >= 0.712', "color('red')"],
    //     ['${latitudeRadians} >= 0.7115', "color('orange')"],
    //     ['${latitudeRadians} >= 0.711', "color('yellow')"],
    //     ['${latitudeRadians} >= 0.7105', "color('lime')"],
    //     ['${latitudeRadians} >= 0.710', "color('cyan')"],
    //     ['true', "color('blue')"]
    // ]
    //根据Latitude设置不同的颜色
    map3d.prototype.tilesModelcolorByLatitudeDefine = function(tilesEntity,dconditions)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.colorByLatitudeDefine(tilesEntity,dconditions);
    }

    // dconditions =  [
    //     ['${LongitudeRadians} >= 0.7125', "color('purple')"],
    //     ['${LongitudeRadians} >= 0.712', "color('red')"],
    //     ['${LongitudeRadians} >= 0.7115', "color('orange')"],
    //     ['${LongitudeRadians} >= 0.711', "color('yellow')"],
    //     ['${LongitudeRadians} >= 0.7105', "color('lime')"],
    //     ['${LongitudeRadians} >= 0.710', "color('cyan')"],
    //     ['true', "color('blue')"]
    // ]
    //根据Longitude设置不同的颜色
    map3d.prototype.tilesModelcolorByLongitudeDefined = function(tilesEntity,dconditions)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.colorByLongitudeDefined(tilesEntity,dconditions);
    }

    //根据距离设置不同的颜色
    // conditions = [
    //     ['${distance} > 0.0012',"color('gray')"],
    //     ['${distance} > 0.0008', "mix(color('yellow'), color('red'), (${distance} - 0.008) / 0.0004)"],
    //     ['${distance} > 0.0004', "mix(color('green'), color('yellow'), (${distance} - 0.0004) / 0.0004)"],
    //     ['${distance} < 0.00001', "color('white')"],
    //     ['true', "mix(color('blue'), color('green'), ${distance} / 0.0004)"]
    // ]
    map3d.prototype.tilesModelcolorByDistance = function(tilesEntity,dconditions,point)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.colorByDistance(tilesEntity,dconditions,point);
    }

    //(regExp('3').test(String(${name}))) ? color('cyan', 0.9) : color('purple', 0.1)
    map3d.prototype.tilesModelcolorByNameRegex = function(tilesEntity,dnameRgex)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.colorByNameRegex(tilesEntity,dnameRgex);
    }
    //'${height} >100'
    map3d.prototype.tilesModelhideByHeight = function(tilesEntity,dheight)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        this.zmap3DTiles.hideByHeight(tilesEntity,dheight);
    }

    //获取设置的颜色
    map3d.prototype.get3dtilesModelStyle = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        return this.zmap3DTiles.getTilesStyle(tilesEntity);
    }

    //移除设置的颜色
    map3d.prototype.remove3dtilesModelStyle = function(tilesEntity)
    {
        this.zmap3DTiles = this.zmap3DTiles||new ZMAP3DTILES(this); 
        return this.zmap3DTiles.removeTilesStyle(tilesEntity);
    }
    //====================================================结束================================================================================================



    //彩虹桥中间点的生成
    map3d.prototype.createDnyLinePoints = function(spoint,epoint,heightRatio)
    {
        var earthr = 6378137;
        var rePoint=[];
        lat1 = Math.PI / 180*spoint[1];
        lat2 = Math.PI / 180*epoint[1];
        lon1 = Math.PI / 180*spoint[0];
        lon2 = Math.PI / 180*epoint[0];

        // 计算长度
        var ac = Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
        var as = Math.sin(lat1) * Math.sin(lat2);
        var a = ac + as;
        if (a > 1) a = 1;
        if (a < -1) a = -1;
        var len = Math.acos(a);	

        //计算角度
        var y = Math.sin(lon2 - lon1) * Math.cos(lat2);
        var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(lon2 - lon1);
        azi = Math.atan2(y, x);
        
        var count = 100;
        var countRatio = 0.01;
		for (var i = 0; i <=count; ++i)
		{
            var pyx = 0.02*i;
            var pyz =(2*pyx-pyx*pyx)*earthr*heightRatio;
            if(i===0){
                rePoint.push(spoint[0]);
                rePoint.push(spoint[1]);
                rePoint.push(pyz);
            }else if(i===100){
                rePoint.push(epoint[0]);
                rePoint.push(epoint[1]);
                rePoint.push(pyz);
            }else{
                var sinlat1 = Math.sin(lat1);
                var coslat1 = Math.cos(lat1);
                var sindis = Math.sin(len * countRatio*i);
                var cosdis = Math.cos(len * countRatio*i);
                var sinazi = Math.sin(azi);
                var cosazi = Math.cos(azi);
                var processy = Math.asin(sinlat1 * cosdis + coslat1 * sindis * cosazi);
                var processx = lon1 + Math.atan2( sinazi * sindis * coslat1, cosdis - sinlat1 * Math.sin(processy));
                rePoint.push(processx*180/Math.PI);
                rePoint.push(processy*180/Math.PI);
                rePoint.push(pyz);
            }
            
        }

        return rePoint;
    }


    //生成彩虹动态轨迹
    map3d.prototype.createDnyLine = function(param)
    {
            var czviewer = this.GetView();
            var points = this.createDnyLinePoints(param.stponit,param.enpoint,param.heightRatio);


            if(param.flymove){
                var mat = new PolylineDynMaterialProperty({
                    color: param.bottomColor,
                    color2: param.flyColor,
                    lineLength : 1.0,
                    lineSpeed : 1.0    
                });

                var glowingLine = czviewer.entities.add({
                    name : 'Glowing blue line on the surface',
                    polyline : {
                        positions : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
                        width : param.linewidth ?  param.linewidth  : 3.0,
                        material :mat,
                        shadows:GmMap3D.ShadowMode.ENABLED,
                        followSurface: false
                    }
                })

                         
                this.cesium.scene.preRender.addEventListener(function(t){
                    mat.update(0.01);
                });

            }else{
                var glowingLine = czviewer.entities.add({
                    name : 'Glowing blue line on the surface',
                    polyline : {
                        positions : GmMap3D.Cartesian3.fromDegreesArrayHeights(points),
                        width : param.linewidth ?  param.linewidth  : 3.0,
                        material :param.noflycolor,
                        shadows:GmMap3D.ShadowMode.ENABLED,
                        followSurface: false
                    }
                });

            }
    }

    map3d.prototype.caldistancejw = function(point1,point2)
    {

        var earthr = 6378137;
        
        lat1 = Math.PI / 180*point1[1];
        lat2 = Math.PI / 180*point2[1];
        lon1 = Math.PI / 180*point1[0];
        lon2 = Math.PI / 180*point2[0];
   
        // 计算长度
        var ac = Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2);
        var as = Math.sin(lat1) * Math.sin(lat2);
        var a = ac + as;
        if (a > 1) a = 1;
        if (a < -1) a = -1;
        var len = Math.acos(a);
        return len*earthr;
    }
    //开启关闭深度检测
    map3d.prototype.setDepthTestAgainstTerrain = function(b)
    {
        this.GetView().scene.globe.depthTestAgainstTerrain = b
    }
    map3d.prototype.getDepthTestAgainstTerrain = function()
    {
        return this.GetView().scene.globe.depthTestAgainstTerrain;
    }

    //开启关闭透明拾取
    map3d.prototype.setPickTranslucentDepth = function(b)
    {
        this.GetView().scene.pickTranslucentDepth = b
    }
    map3d.prototype.getPickTranslucentDepth = function()
    {
        return this.GetView().scene.pickTranslucentDepth;
    }

    //移除切割
    map3d.prototype.unshowClippingPlanes = function()
    {
        var self = this;
        if(self.GetView().scene.globe.clippingPlanes&&self.GetView().scene.globe.clippingPlanes.removeAll)
        {
            self.GetView().scene.globe.clippingPlanes.removeAll();
        }
        self.setDepthTestAgainstTerrain(false);
        var entity = this.GetEntity("cuttingWall");
        if (entity) {
            self.RemoveEntity("cuttingWall");
            self.RemoveEntity("cuttingUnderside");
        }
    }
    //切割
    map3d.prototype.showClippingPlanes = function (options) { 
        
        
        if(!(options.positions&&Array.isArray(options.positions)&&options.positions.length>2))
        {
            console.log('切割坐标输入错误!');
            return;
        }
        
        var e =[];
        var  d=0;
        for(var k=0;k<options.positions.length;k++)
        {
            var pt = GmMap3D.Cartesian3.fromDegrees(parseFloat(options.positions[k][0]),parseFloat(options.positions[k][1]),parseFloat(options.positions[k][2]));
            if(pt)
            {
                e.push(pt);
            }
            var vPts = options.positions;
            var jk = (k + 1) % options.positions.length;
            d += -0.5 * (vPts[jk][1] + vPts[k][1])*(vPts[jk][0] - vPts[k][0]);
        }
        var self = this;
        if(self.GetView().scene.globe.clippingPlanes&&self.GetView().scene.globe.clippingPlanes.removeAll)
        {
            self.GetView().scene.globe.clippingPlanes.removeAll();
        }

        var viewer = this.GetView();
            var i = [], a = [], n = e.length, r = new GmMap3D.Cartesian3;
            for (var s = 0; s < n; ++s) 
            { 
                var l = (s + 1) % n, o = GmMap3D.Cartesian3.midpoint(e[s], e[l], new GmMap3D.Cartesian3); i.push(e[s]), i.push(o); 
                var p, m = GmMap3D.Cartesian3.normalize(o, new GmMap3D.Cartesian3); 
                p = d<0?GmMap3D.Cartesian3.subtract(e[s], e[l], new GmMap3D.Cartesian3):GmMap3D.Cartesian3.subtract(e[l], e[s], new GmMap3D.Cartesian3);
                p = GmMap3D.Cartesian3.normalize(p, p); 
                var u = GmMap3D.Cartesian3.cross(p, m, new GmMap3D.Cartesian3); u = GmMap3D.Cartesian3.normalize(u, u); 
                var c = new GmMap3D.Plane(u, 0), C = GmMap3D.Plane.getPointDistance(c, o); 
                a.push(new GmMap3D.ClippingPlane(u, C)) 
            }
            this.setDepthTestAgainstTerrain(true);
            this.setPickTranslucentDepth(true);
            viewer.scene.globe.clippingPlanes = new GmMap3D.ClippingPlaneCollection({ planes: a, edgeWidth: 1, edgeColor: GmMap3D.Color.WHITE, enabled: !0 });
            if(options.noWall!=true)
            {
                this.addClippingImageMaterial(options);
            }
            
        } 
    map3d.prototype.addClippingImageMaterial =function (options) 
        { 
            var viewer = this.GetView();
            // for (var i = [], a = [], n = [], r = [], t = 0; t < e.length; ++t) 
            // { 
            //     var s = GmMap3D.Cartographic.fromCartesian(e[t]), l = s.height, o = 0;//viewer.scene.sampleHeight(s); 
            //     null != l && l < o && (l = o), i.push(options.height||-100), a.push(l), n.push(GmMap3D.Cartesian3.fromRadians(s.longitude, s.latitude, 0)), r.push(GmMap3D.Cartesian3.fromRadians(s.longitude, s.latitude, options.height||-100)) 
            // } 
            // n.push(n[0]), i.push(i[0]), a.push(a[0]); 
            var n =[];
            var a = [];
            var i = [];
            var r = [];
            for(var k=0;k<options.positions.length;k++)
            {
                var pt1 = GmMap3D.Cartesian3.fromDegrees(parseFloat(options.positions[k][0]),parseFloat(options.positions[k][1]),parseFloat(options.positions[k][2]));
                var maxHeight = options.positions[k][2];
                var minHeight = parseFloat(options.height||-100);
                var pt2 = GmMap3D.Cartesian3.fromDegrees(parseFloat(options.positions[k][0]),parseFloat(options.positions[k][1]),minHeight);

                if(pt1&&pt2)
                {
                    n.push(pt1);
                    r.push(pt2);
                    a.push(maxHeight);
                    i.push(minHeight);
                }   
            }
            n.push(n[0]), i.push(i[0]), a.push(a[0]); 
            var entityWall = this.GetEntity("cuttingWall");
            var entityUnder = this.GetEntity("cuttingUnderside");
            if(entityWall)
            {
                entityWall.wall.positions.setValue(n);
            }
            else{
                viewer.entities.add({ 
                    id:'cuttingWall',
                    name: "挖地四周墙", 
                    wall: { 
                        positions: n, 
                        maximumHeights: a, 
                        minimumHeights: i, 
                        material: options.wallMaterial||new GmMap3D.ImageMaterialProperty({ image: "images/excavationregion_top.jpg", repeat: new GmMap3D.Cartesian2(10, 30) }) } });
    
            }
            if(entityUnder)
            {
                entityUnder.polygon.hierarchy.setValue(r);
            }
            else{
                viewer.entities.add({
                    id:'cuttingUnderside',name: "挖地底面", 
                    polygon: { 
                        hierarchy: r, 
                        perPositionHeight: !0, 
                        material: options.undersideMaterial||new GmMap3D.ImageMaterialProperty({ image: "images/excavationregion_side.jpg", repeat: new GmMap3D.Cartesian2(10, 10) }) } });
    
            }
        }

    map3d.prototype.autoClippingPlanes = function(width,height,options)
    {
        var w= parseFloat(width);
        var h= parseFloat(height);
        if(isNaN(w)||isNaN(h))
        {
            console.log('自动裁切地形参数错误!');
            return;
        }
        var self = this;
        var cameraOp = self.getCamera();
        
        var fx = cameraOp.rotate[0];

        var jd = options.pitch==undefined?-30:options.pitch;
        if(cameraOp.rotate[1]>jd||cameraOp.rotate[1]>-10)
        {
            return;
        }
        var p = self.GetViewCenter();
        var p0 = GmMap3D.Cartesian3.fromDegrees(p[0],p[1],0);
        var r = Math.atan(w/h)*180/Math.PI;
        var distance = Math.sqrt(h*h+w*w);

        var p1 = self.cartesianTo2MapCoord(self.deviationCalculate(p0, GmMap3D.Math.toRadians(fx+90-r),GmMap3D.Math.toRadians(0),distance));
        var p2 = self.cartesianTo2MapCoord(self.deviationCalculate(p0,GmMap3D.Math.toRadians(fx+90+r),GmMap3D.Math.toRadians(0),distance));
        var p3 = self.cartesianTo2MapCoord(self.deviationCalculate(p0,GmMap3D.Math.toRadians(fx+270-r),GmMap3D.Math.toRadians(0),distance));
        var p4 = self.cartesianTo2MapCoord(self.deviationCalculate(p0,GmMap3D.Math.toRadians(fx+270+r),GmMap3D.Math.toRadians(0),distance));
        options = options||{};
        options['positions'] = [p1,p2,p3,p4];

        var Material = new GmMap3D.ImageMaterialProperty({
            color : self.colorTransform('#000000'),
            transparent :false
        });
        options.wallMaterial =  options.wallMaterial||Material;
        options.undersideMaterial =  options.wallMaterial||Material;

        self.showClippingPlanes(options);
    }

    map3d.prototype.deviationCalculate = function(po,heading,pitch,sideOffset){
    
        var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);
        var mar = GmMap3D.Transforms.headingPitchRollToFixedFrame(po, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());
        var offectc3 = new GmMap3D.Cartesian3(sideOffset,0, 0);
        return GmMap3D.Matrix4.multiplyByPoint(mar,offectc3, new GmMap3D.Cartesian3());
    };

    //组织切割平面参数
    map3d.prototype.conshearzmap = function(param)
    {
        var points = param.pointes;
        var fmaterials = param.bmaterials;
        var ftopheight = param.btopheight;
        var fbotheight = param.bbotheight;
        var fbheight = param.bbheight;
        var fjeercode = param.bjeercode;
        var fweercode = param.bweercode;
        var modelid = param.id;

        var jdx= 0;
        var wdx = 0;
        var ptes = [];
        var fverticalfaceds = [];
        for(var i=0 ;i<points.length ;i++){
            var index = (i + 1) % points.length;
            var p1 = points[i];
            var p2 = points[index];

            ptes.push(p1[0],p1[1]);
            jdx+=p1[0];
            wdx+=p1[1];

            //构建侧面参数
            var fverticalfaced = {points:p1,pointe:p2,facematerial:fmaterials[i],topheight:ftopheight[i],botheight:fbotheight[i]};
            fverticalfaceds.push(fverticalfaced);
        }
         //获取切面范围内的一点
         var midjd = jdx/points.length;
         var midwd = wdx/points.length;
         var midpo = [midjd,midwd,0.0];

        //构建底面的参数
        var fbootomface = {midpoint:midpo,ponits:ptes,facematmaterial:fmaterials[fmaterials.length-1],bheight:fbheight};

        //构建剪切面参数
        var latlen = this.caldistancejw(points[0],points[1]) -fjeercode;
        var longlen = this.caldistancejw(points[0],points[points.length-1]) -fweercode;

        fplans = [[1,0,0,-latlen/2],[-1,0,0,-latlen/2],[0,1,0,-longlen/2],[0,-1,0,-longlen/2]];
        var param2 = {
            id : modelid,
            plans:fplans,        
            shearedgewidth : 1.0,
            shearedgeclor  :GmMap3D.Color.WHITE,
            verticalface:fverticalfaceds,
            bootomface:fbootomface
        };

        var plans = this.shearzmap(param2);

        return plans;
    }

    //地图切割上图
    map3d.prototype.shearzmap = function(param)
    {
        var czviewer = this.GetView();
        var globe = czviewer.scene.globe;

        //切割区域的中心点
        var midpoint = param.bootomface.midpoint;
        var position = GmMap3D.Cartesian3.fromDegrees(midpoint[0],midpoint[1],midpoint[2]);

        //添加地面材料
        var entity =  czviewer.entities.add({
            id:param.id,
            position:position,
            polygon : {
                hierarchy : GmMap3D.Cartesian3.fromDegreesArray(param.bootomface.ponits),
                height:param.bootomface.bheight ? param.bootomface.bheight : -50.0,
                material : param.bootomface.facematmaterial ? param.bootomface.facematmaterial : GmMap3D.Color.RED,
            },
        })

        //构建切面
        var plans = [];
        for(var i = 0 ;i<param.plans.length;i++){
            var oneplane = param.plans[i];
            var clippingPlane = new GmMap3D.ClippingPlane(new GmMap3D.Cartesian3( oneplane[0],   oneplane[1],  oneplane[2]), oneplane[3]);
            plans.push(clippingPlane);
        }
        
        globe.depthTestAgainstTerrain = true;
        //czviewer.scene.pickTranslucentDepth  = true;
        globe.clippingPlanes = new GmMap3D.ClippingPlaneCollection({
                modelMatrix : entity.computeModelMatrix(GmMap3D.JulianDate.now()),
                planes : plans,
                shearedgewidth: param.shearedgewidth ? param.shearedgewidth : 1.0,
                shearedgeclor: param.shearedgeclor ?  param.shearedgeclor : GmMap3D.Color.WHITE,
                enabled : true
            });
          
        //构建侧面
        var verticalface = param.verticalface;
        if(!verticalface){
            return ;
        }

        for( var i =0 ;i<verticalface.length;i++){
            
            var topheight = verticalface[i].topheight
            if(!topheight || topheight===0){
                topheight = 0.000001;
            }

            var botheight = verticalface[i].botheight
            if(!topheight){
                botheight = 50;
            }

            var spoint = verticalface[i].points;
            var epont =  verticalface[i].pointe;

            czviewer.entities.add({
                id: param.id+i,
                wall : {
                    positions : GmMap3D.Cartesian3.fromDegreesArrayHeights([spoint[0],spoint[1],topheight,epont[0],epont[1],topheight]),
                    minimumHeights: [botheight,botheight],
                    material : verticalface[i].facematerial ? verticalface[i].facematerial : GmMap3D.Color.RED,
                    outline:false
                },
            });

        }

        return plans;
       
    }

     
    //形成垂直地面的墙
    map3d.prototype.createWall = function(options){

        this.zmapGeometry = this.zmapGeomettry || new ZMAPGEOMETRY(this);

        return this.zmapGeometry.AddWall(options);
    }

     //形成线
     map3d.prototype.createPolyline = function(options){
        
        this.zmapGeometry = this.zmapGeomettry || new ZMAPGEOMETRY(this);

        return this.zmapGeometry.addPolyline(options);
    }

    //颜色格式转化，统一转化成rgb格式
    //rgba(23,34,54,0.4)或者RGBA(23,34,54,0.4)
    //rgb(23,45,56)或者RGB(23,45,56)
    //HEX#333或者是hex#333
    //HSL(0.2,0.5,1)或者是hsl(0.2,0.5,1) h, s, 和 l 设定在 [0, 1] 之间
    //"red" ,"blue","GREEN"
    //颜色返回格式 {red: 1, green: 0, blue: 0, alpha: 1}
    map3d.prototype.colorTransform = function(colorFormat){
        

        if(!colorFormat){
            return ;
        }

        var objstr = colorFormat.constructor.name;
        if(objstr === "Color"){
            return colorFormat;
        }

        var realColor = null;
        if(colorFormat.red || colorFormat.RED || colorFormat.green || colorFormat.GREEN || colorFormat.blue || colorFormat.BLUE ){
            var col = [];
            if(colorFormat.red || colorFormat.RED){
                col.push(colorFormat.red ? colorFormat.red :colorFormat.RED);
            }else{
                col.push(0);
            }
           
            if(colorFormat.green || colorFormat.GREEN){
                col.push(colorFormat.green ? colorFormat.green :colorFormat.GREEN);
            }else{
                col.push(0);
            }

            if(colorFormat.blue || colorFormat.BLUE){
                col.push(colorFormat.blue ? colorFormat.blue :colorFormat.BLUE);
            }else{
                col.push(0);
            }

            if(colorFormat.alpha || colorFormat.ALPHA){
                col.push(colorFormat.alpha ? colorFormat.alpha :colorFormat.ALPHA);
            }else{
                col.push(1);
            }
            
            if(Number(col[0])===0 &&Number(col[1]) ===0 &&Number(col[2])===0 ){
                realColor = new GmMap3D.Color(0,0,0,col[3]);
            }else {
                //var colorc3 = GmMap3D.Cartesian3.normalize(new GmMap3D.Cartesian3(Number(col[0]),Number(col[1]),Number(col[2])), new GmMap3D.Cartesian3());
                var colorc3={
                    x:isNaN(Number(col[0]/255))?1:Number(col[0]/255),
                    y:isNaN(Number(col[1]/255))?1:Number(col[1]/255),
                    z:isNaN(Number(col[2]/255))?1:Number(col[2]/255)
                }
                realColor = new GmMap3D.Color(colorc3.x,colorc3.y,colorc3.z,col[3]);
            }
            return realColor;
        }
        
        //清除字符串两端空格，包含换行符、制表符
        var  midColor = colorFormat.replace(/(^[\s\n\t]+|[\s\n\t]+$)/g, "");
        //去除中间的空格，将中文逗号改成英文逗号，将中英文（）去除
        var  middColor = midColor.replace(/\s/g,"").replace(/，/ig,',').replace("(","").replace(")","").replace("（","").replace("）","");
        //截取字符串的前三位
        var ff = middColor.slice(0,3);
        var fga = middColor.slice(0,4);
        if(ff.toUpperCase() === "RGB"){
            var colorarray = null;
            var colorarray = middColor.slice(3,middColor.length).split(",");
            if(fga.toUpperCase() === "RGBA"){
                colorarray = middColor.slice(4,middColor.length).split(",");
            }

            if(Number(colorarray[0])===0 &&Number(colorarray[1]) ===0 &&Number(colorarray[2])===0 ){
                realColor = new GmMap3D.Color(0,0,0,1);
            }else{
                //var colorc3 = GmMap3D.Cartesian3.normalize(new GmMap3D.Cartesian3(Number(colorarray[0]),Number(colorarray[1]),Number(colorarray[2])), new GmMap3D.Cartesian3());
                var colorc3={
                    x:isNaN(Number(colorarray[0]/255))?1:Number(colorarray[0]/255),
                    y:isNaN(Number(colorarray[1]/255))?1:Number(colorarray[1]/255),
                    z:isNaN(Number(colorarray[2]/255))?1:Number(colorarray[2]/255)
                }
                if(colorarray[3]){
                    realColor = new GmMap3D.Color(colorc3.x,colorc3.y,colorc3.z,Number(colorarray[3]));
                }else {
                    realColor = new GmMap3D.Color(colorc3.x,colorc3.y,colorc3.z,1);
                }
            }
            return realColor;
        }else if(fga.indexOf("#")>=0){
            var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
            var colorarray = middColor;
            if(ff.toUpperCase() === "HEX"){
                colorarray =  middColor.slice(3,middColor.length)
            }
            var sColor = colorarray.toLowerCase();
            if(sColor && reg.test(sColor)){  
                if(sColor.length === 4){  
                    var sColorNew = "#";  
                    for(var i=1; i<4; i+=1){  
                        sColorNew += sColor.slice(i,i+1).concat(sColor.slice(i,i+1));     
                    }  
                    sColor = sColorNew;
                }  
                //处理六位的颜色值  
                var sColorChange = [];  
                for(var i=1; i<7; i+=2){  
                    sColorChange.push(parseInt(sColor.slice(i,i+2),16));    
                }
                if(Number(sColorChange[0])===0 &&Number(sColorChange[1]) ===0 &&Number(sColorChange[2])===0 ){
                    realColor = new GmMap3D.Color(0,0,0,1);
                    return realColor;
                }
                if(Number(sColorChange[0])===0 &&Number(sColorChange[1]) ===0 &&Number(sColorChange[2])===0 ){
                    realColor = new GmMap3D.Color(0,0,0,1);
                }else{
                    //var colorc3 = GmMap3D.Cartesian3.normalize(new GmMap3D.Cartesian3(Number(sColorChange[0]),Number(sColorChange[1]),Number(sColorChange[2])), new GmMap3D.Cartesian3());
                    var colorc3={
                        x:isNaN(Number(sColorChange[0]/255))?1:Number(sColorChange[0]/255),
                        y:isNaN(Number(sColorChange[1]/255))?1:Number(sColorChange[1]/255),
                        z:isNaN(Number(sColorChange[2]/255))?1:Number(sColorChange[2]/255)
                    }
                    realColor = new GmMap3D.Color(colorc3.x,colorc3.y,colorc3.z,1);
                }
                return realColor;
            }
        }else if(ff.toUpperCase() === "HSL"){
            var colorarray = middColor.slice(3,middColor.length).split(",");
            var r, g, b;
            var h = Number(colorarray[0]);
            var s = Number(colorarray[1]);
            var l = Number(colorarray[2]);
            if(s === 0) {
                r = g = b = l; // achromatic
                realColor = new GmMap3D.Color(Number(r),Number(g),Number(b),1);
                return realColor;
            } else {
                var hue2rgb = function hue2rgb(p, q, t) {
                    if(t < 0) t += 1;
                    if(t > 1) t -= 1;
                    if(t < 1/6) return p + (q - p) * 6 * t;
                    if(t < 1/2) return q;
                    if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }
        
                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
                if(r===0 && g===0 && b===0){
                    realColor = new GmMap3D.Color(0,0,0,1);
                }else{
                    realColor = new GmMap3D.Color(parseFloat(r),parseFloat(g),parseFloat(b),1);
                }
               
                return realColor;
            }
        }else{
            realColor = GmMap3D.Color[middColor.toUpperCase()];
            return realColor;
        }
        
        return null;
    }
    //添加热力图
    map3d.prototype.addHeatmap = function(heatmapID,option)
    {
        var heatid = heatmapID;
        var czviewer = this.GetView();
        czviewer.entities.removeById(heatid);

        // 创建元素
        var heatDoc = document.createElement("div");
        heatDoc.setAttribute("style", "width:1000px;height:1000px;margin: 0px;display: none;");
        document.body.appendChild(heatDoc);
        var zoom = this.GetZoom();
        var ra = parseInt(17150/(zoom*zoom*zoom));
        var gradient = option.gradient ? option.gradient : {
                '0.9':'red',
                '0.8':'orange',
                '0.7':'yellow',
                '0.5':'blue',
                '0.3':'green',
            };
        // 创建热力图对象
        var heatMap = h337.create({
            container: heatDoc,
            radius: ra,
          //  maxOpacity: .5,//渲染最大透明度
          //  minOpacity: 0,//渲染最小透明度
            blur: .95,//模糊因子，适用于所有的数据点。默认为0.85。模糊因子越高，梯度就越平滑。
            gradient:gradient ,
            opacity:0.8
        });

        var dataArr = option.data;
        var max = 0;
        for(var i = 0; i < dataArr.length; i++){
            if(parseFloat(dataArr[i]["value"]) > max){
                max = parseFloat(dataArr[i]["value"]) ;    
            }    
        }
        // 添加数据
        heatMap.setData({
            max: max,
            data: dataArr
        });

        var polygon = option.polygon ? option.polygon : [[[105.91517,25.002073],[104.058488,24.996596],
                                                          [104.053011,23.002989],[104.053011,21.003906],
                                                          [105.728954,20.998429],[107.919731,21.003906],
                                                          [109.04798,20.998429],[111.047063,20.998429],
                                                          [111.047063,22.000709],[111.047063,24.476286],
                                                          [111.05254,25.002073]
                                                        ]];

        var exparam = {
            type: 'heatmap',
            material: heatMap._renderer.canvas,
            outline: false
        };
        this.AddEntity(heatid, polygon, undefined, undefined, exparam);

        //滚轮监听事件
        var mapView = this;
        var handler =  this.AddEventListener("wheel",function(){
            var zoom = mapView.GetZoom();
            var radius = parseInt(17150/(zoom*zoom*zoom));

            var heatMap2 = h337.create({
                container: heatDoc,
                radius: radius,
              //  maxOpacity: .5,
              //  minOpacity: 0,
                opacity:0.8,
                blur: .95,
                gradient: gradient
            });

            // 添加数据
            heatMap2.setData({
                max: max,
                data: dataArr
            });

            var entity = mapView.GetEntity(heatid);
            entity.polygon.material = heatMap2._renderer.canvas;
        });
        var habds = {"heatmapID":handler};
        var handlA = this.handlerArray;
        handlA.push(habds);
        this.handlerArray = handlA;

        return;
    }
    
    
    var rainSystem = null;
    map3d.prototype.moveRain = function(){
        if(rainSystem.show != undefined){
            rainSystem.show = false;
        }
    }

    map3d.prototype.GetRain = function(params){
        var height = params[2] || 3000;
        var carPoor = new GmMap3D.Cartesian3.fromDegrees(params[0],params[1],height);

        var viewer = this.GetView();
        var scene = viewer.scene;
        scene.globe.depthTestAgainstTerrain = true;
        var resetCameraFunction = function() {
            scene.camera.setView({
                //destination : new GmMap3D.Cartesian3(277096.634865404, 5647834.481964232, 2985563.7039122293),
                destination : new GmMap3D.Cartesian3(carPoor.x,carPoor.y,carPoor.z),
                // orientation : {
                //     heading : 0, //4.731089976107251,
                //     pitch : 0 //-0.32003481981370063
                // }
            });
        };
        resetCameraFunction();
// rain
        var rainParticleSize = scene.drawingBufferWidth / 200.0;
        var rainRadius = 50000.0;
        var rainImageSize = new GmMap3D.Cartesian2(rainParticleSize, rainParticleSize*4);

      //  var rainSystem;

        var rainGravityScratch = new GmMap3D.Cartesian3();
        var rainUpdate = function(particle, dt) {
            rainGravityScratch = GmMap3D.Cartesian3.normalize(particle.position, rainGravityScratch);
            rainGravityScratch = GmMap3D.Cartesian3.multiplyByScalar(rainGravityScratch, -1050.0, rainGravityScratch);

            particle.position = GmMap3D.Cartesian3.add(particle.position, rainGravityScratch, particle.position);

            var distance = GmMap3D.Cartesian3.distance(scene.camera.position, particle.position);
            if (distance > rainRadius) {
                particle.endColor.alpha = 0.0;
            } else {
                particle.endColor.alpha = rainSystem.endColor.alpha / (distance / rainRadius + 0.1);
            }
        };

        rainSystem = new GmMap3D.ParticleSystem({
            modelMatrix : new GmMap3D.Matrix4.fromTranslation(scene.camera.position),
            speed : -2.0,
            lifetime : 15.0,
            emitter : new GmMap3D.SphereEmitter(rainRadius),
            startScale : 1.0,
            endScale : 0.0,
            image : params.image ? params.image : './images/rain.png',
            emissionRate : 8000.0,
            startColor :new GmMap3D.Color(0.71,0.71,0.66, 0.0),
            endColor : new GmMap3D.Color(0.71,0.71,0.66, 0.98),
            imageSize : rainImageSize,
            updateCallback : rainUpdate
        });
        scene.primitives.add(rainSystem);
    }

    //¿Ì¶ÈÖá
    var KDTList = [];
    map3d.prototype.KDT = function (params) {
        KDTList = [];
        var viewer = this.GetView();
        var points = this.orderLines(params);
        for(var i in points){
            var id = "KDT" + i;
            KDTList.push(id);
            var glowingLine = viewer.entities.add({
                id:id,
                name: 'Glowing blue line on the surface',
                polyline: {
                    positions: GmMap3D.Cartesian3.fromDegreesArrayHeights(points[i]),
                    width: 1.0,
                    material: GmMap3D.Color.YELLOW.withAlpha(0.5),
                    shadows: GmMap3D.ShadowMode.ENABLED,
                    followSurface: false
                }
            });
        }
    }

    var textLabelList = [];
    map3d.prototype.orderLines = function(params){
        var points = [];
        textLabelList = [];
        var minHeight = params.minHeight || 0;
        var maxHeight = params.maxHeight || 3000;
        var markZ      = params.markZ || 10;
        var markY      = params.markY || 10;
        var markX      = params.markX || 10;
        var pointArr  = params.pointArr;
        var dif       = params.dif;

        ////主轴线
        points.push([pointArr[0][0],pointArr[0][1],minHeight,pointArr[0][0],pointArr[0][1],maxHeight]);//Z
        points.push([pointArr[0][0],pointArr[0][1],minHeight,pointArr[1][0],pointArr[1][1],minHeight]);//X
        points.push([pointArr[0][0],pointArr[0][1],minHeight,pointArr[2][0],pointArr[2][1],minHeight]);//Y
        // 1-2 面
        for(var i = 0;i< markZ ;i++){
            var h = (maxHeight - minHeight)/markZ*(i+1);
            if(i <markZ - 1){
                points.push([pointArr[0][0],pointArr[0][1],h + minHeight,pointArr[0][0]+dif,pointArr[0][1],h+minHeight ]);
                this.AddTextLabel("TextLabel"+i, pointArr[0][0], pointArr[0][1], parseInt(h) + "",{height:h + minHeight});
                textLabelList.push("TextLabel"+i);
            }

            if(i == markZ - 1){
                this.AddTextLabel("TextLabel"+i, pointArr[0][0], pointArr[0][1], '米',{height:h + minHeight});
                textLabelList.push("TextLabel"+i);
            }
        }

        var JLongth = 0;
        for (var j = 0; j < markX; j++) {
            var h = (pointArr[0][0] - pointArr[1][0]) / markX * j;

            if (!JLongth) {
                JLongth = parseInt(this.caldistancejw(pointArr[0], pointArr[1]) / markX);
            }

           var  JLongth4 = JLongth * j;

            if (j < markX - 1) {
                points.push([pointArr[0][0] - h, pointArr[0][1], minHeight, pointArr[0][0] - h, pointArr[0][1], minHeight + maxHeight / 30]);
                this.AddTextLabel("TextLabel1" + j, pointArr[0][0] - h, pointArr[0][1], parseInt(JLongth4) + "", {height: minHeight});
                textLabelList.push("TextLabel1" + j);
            }

            if (j == markX - 1) {
                this.AddTextLabel("TextLabel1" + j, pointArr[0][0] - h, pointArr[0][1], '米', {height: minHeight});
                textLabelList.push("TextLabel1" + j);
            }
        }


        var JLongth2 = 0;
        for(var k = 0;k< markY ;k++){
            var h = (pointArr[0][1] - pointArr[2][1])/markY*k;

            if (!JLongth2) {
                JLongth2 = parseInt(this.caldistancejw(pointArr[0], pointArr[2]) / markY);
            }
            var JLongth3 = JLongth2 * k;
            if(k <markY - 1){
                points.push([pointArr[0][0],pointArr[0][1]-h,minHeight,pointArr[0][0],pointArr[0][1]-h,minHeight + maxHeight/30]);
                this.AddTextLabel("TextLabel2" + k, pointArr[0][0],pointArr[0][1]-h, parseInt(JLongth3)  + "", {height: minHeight});
                textLabelList.push("TextLabel2" + k);
            }

            if (k == markY - 1) {
                this.AddTextLabel("TextLabel2" + k, pointArr[0][0],pointArr[0][1]-h, '米', {height: minHeight});
                textLabelList.push("TextLabel2" + k);
            }
        }
        return  points;
    }

    

    map3d.prototype.moveKDTextLable = function(){
        for(var i = 0 ;i< textLabelList.length;i++){
            this.RemoveLabel(textLabelList[i]);
        }
        for(var j = 0;j < KDTList.length;j++){
            this.RemoveEntity(KDTList[j]);
        }
    }    

                
    Map3DSDK.Map = map3d;


    /*--weili  模型拾取--*/
    var modelpick = Map3DSDK.ZmapModelPick = function (map3dView, option) {
        var self = this;
        this.option = option || {};

        self.option.clickColor = self.option.clickColor||'rgba(255,0,0,0.6)';
        self.option.hoverColor = self.option.hoverColor||'rgba(0,255,0,0.6)';

        this.map3dView = map3dView;
        //轮廓线高亮
        if(self.option.type=='Silhouette')
        {
            this.silhouetteBlue = GmMap3D.PostProcessStageLibrary.createEdgeDetectionStage();
            self.silhouetteBlue.uniforms.color =self.option.hoverColor?map3dView.colorTransform(self.option.hoverColor):GmMap3D.Color.BLUE;
            self.silhouetteBlue.uniforms.length = 0.01;
            self.silhouetteBlue.selected = [];

            this.silhouetteGreen = GmMap3D.PostProcessStageLibrary.createEdgeDetectionStage();
            self.silhouetteGreen.uniforms.color = self.option.clickColor?map3dView.colorTransform(self.option.clickColor):GmMap3D.Color.RED;
            self.silhouetteGreen.uniforms.length = 0.01;
            self.silhouetteGreen.selected = [];

            map3dView.GetView().scene.postProcessStages.add(GmMap3D.PostProcessStageLibrary.createSilhouetteStage([self.silhouetteBlue, self.silhouetteGreen]));
        }
        //面高亮
        else{
            var fs =
            'uniform sampler2D colorTexture;\n' +
            'varying vec2 v_textureCoordinates;\n' +
            'uniform vec4 highlight;\n' +
            'void main() {\n' +
            '    vec4 color = texture2D(colorTexture, v_textureCoordinates);\n' +
            '    if (czm_selected()) {\n' +
            '        vec3 highlighted = highlight.a * highlight.rgb + (1.0 - highlight.a) * color.rgb;\n' +
            '        gl_FragColor = vec4(highlighted, 1.0);\n' +
            '    } else { \n' +
            '        gl_FragColor = color;\n' +
            '    }\n' +
            '}\n';
            this.silhouetteBlue = new GmMap3D.PostProcessStage({
                fragmentShader : fs,
                uniforms : {
                    highlight : function() {
                        return self.option.hoverColor?map3dView.colorTransform(self.option.hoverColor):GmMap3D.Color.BLUE;//new GmMap3D.Color(1.0, 1.0, 0.0, 0.5);
                    }
                }
            });
            self.silhouetteBlue.selected = [];

            this.silhouetteGreen = new GmMap3D.PostProcessStage({
                fragmentShader : fs,
                uniforms : {
                    highlight : function() {
                        return self.option.clickColor?map3dView.colorTransform(self.option.clickColor):GmMap3D.Color.RED;//new GmMap3D.Color(1.0, 0.0, 0.0, 0.5);
                    }
                }
            });
            self.silhouetteGreen.selected = [];
            
            map3dView.GetView().scene.postProcessStages.add(self.silhouetteBlue);
            map3dView.GetView().scene.postProcessStages.add(self.silhouetteGreen);

        }

        
        // this.selected = {
        //     feature: undefined,
        //     originalColor: new GmMap3D.Color()
        // };
        // this.highlighted = {
        //     feature : undefined,
        //     originalColor : new GmMap3D.Color()
        // };

        //鼠标移入的气泡
        this.nameOverlay = document.createElement('div');
        map3dView.GetView().container.appendChild(self.nameOverlay);
        self.nameOverlay.className = self.option.hoverClass || 'backdrop';
        self.nameOverlay.style.display = 'none';
        self.nameOverlay.style.position = 'absolute';
        self.nameOverlay.style.bottom = '0';
        self.nameOverlay.style.left = '0';
        self.nameOverlay.style['pointer-events'] = 'none';
        this.selectedEntity = new GmMap3D.Entity();
        this.clickHandler = map3dView.GetView().screenSpaceEventHandler.getInputAction(GmMap3D.ScreenSpaceEventType.LEFT_CLICK);

        var style = document.createElement('style');
        style.innerHTML = '.backdrop {background: #000;color: #fff;padding: 4px;font-size: 12px;}'
        document.getElementsByTagName('head')[0].append(style);
    }

    //清空高亮
    modelpick.prototype.reback = function()
    {
        var self = this;
        self.silhouetteBlue.selected = [];
        self.silhouetteGreen.selected = [];
        self.nameOverlay.style.display = 'none';
        // if(self.highlighted.feature)
        // {
        //     self.highlighted.feature.id.model.color.setValue(self.highlighted.originalColor);
        //     self.highlighted = {
        //         feature : undefined,
        //         originalColor : new GmMap3D.Color()
        //     }
        // }
        // if(self.selected.feature)
        // {
        //     self.selected.feature.id.model.color.setValue(self.selected.originalColor);
        //     self.selected = {
        //         feature : undefined,
        //         originalColor : new GmMap3D.Color()
        //     }
        // }
    }

    //鼠标移入高亮方法
    modelpick.prototype.hover = function (movement, callback) {
        var self = this;
        self.silhouetteBlue.selected = [];
        // if(self.highlighted.feature)
        // {
        //     if(self.selected.feature&&self.selected.feature.id==self.highlighted.feature.id)
        //     {
        //         self.selected.feature.id.model.color.setValue(self.map3dView.colorTransform(self.option.clickColor||'HEX#ff0000'))
        //     }
        //     else
        //     {
        //         self.highlighted.feature.id.model.color.setValue(self.highlighted.originalColor);
        //     }      
        // }

        var client = movement.endPosition;
        var pick = self.map3dView.PickModel(client);
        if(callback && typeof callback =='function')
        {
            if(callback(pick) == false)
            {
                return;
            }
        }
        // Pick a new feature
        var pickedFeature = pick.models;
        if (!GmMap3D.defined(pickedFeature)) {
            self.nameOverlay.style.display = 'none';
            return;
        }
        self.nameOverlay.style.display = 'block';
        self.nameOverlay.style.bottom = self.map3dView.GetView().canvas.clientHeight - movement.endPosition.y + 'px';
        self.nameOverlay.style.left = movement.endPosition.x + 'px';
        if (pickedFeature.id) {
            self.silhouetteBlue.selected = [pickedFeature.primitive];
            // self.highlighted.feature =  pickedFeature;
            // var ncolor = pickedFeature.id.model.color.valueOf();
            
            // for(var k in ncolor)
            // {
            //     self.highlighted.originalColor[k]=ncolor[k];
            // }
            
            // pickedFeature.id.model.color.setValue(self.map3dView.colorTransform(self.option.hoverColor||'HEX#ffff00'));
            var id = pickedFeature.id;
            if(typeof id === 'string'){
                self.nameOverlay.textContent = id;
            }else{
                self.nameOverlay.textContent = id.name || id.id;
            }
        }
        else {

            // A feature was picked, so show it's overlay content
            if(pickedFeature.getProperty)
            {
                var name = pickedFeature.getProperty('name')||pickedFeature.getProperty('NAME');
                if (!GmMap3D.defined(name)) {
                    name = pickedFeature.getProperty('id')||pickedFeature.getProperty('ID');
                }
                self.nameOverlay.textContent = name;
            }
            else{
                self.nameOverlay.style.display = 'none';
            }
           

            // Highlight the feature if it's not already selected.
            
            self.silhouetteBlue.selected = [pickedFeature];
            
        }
    }

    //鼠标点击高亮方法
    modelpick.prototype.click = function (movement, callback) {

        var self = this;
        self.silhouetteGreen.selected = [];
        
        // Pick a new feature
        var client = movement.position;
        var pick = self.map3dView.PickModel(client);

        if(callback && typeof callback =='function')
        {
            if(callback(pick) == false)
            {
                return;
            }
        }
        // Pick a new feature
        var pickedFeature = pick.models;
        if (!GmMap3D.defined(pickedFeature)) {
                self.clickHandler(movement);
                return;
            }
        if (pickedFeature.id) {
            
            if(pickedFeature.id.callfun&&typeof pickedFeature.id.callfun == 'function')
            {
                var callop = {
                    id:pickedFeature.id.id,
                    name:pickedFeature.id.name
                }
                pickedFeature.id.callfun(callop)
            }

            self.silhouetteGreen.selected = [pickedFeature.primitive];
            self.selectedEntity = pickedFeature.id;
            //self.selectedEntity.name = pickedFeature.id.name||pickedFeature.id.id;
            self.selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
            self.map3dView.GetView().selectedEntity = self.selectedEntity;
    
            self.selectedEntity.description = '<table class="cesium-infoBox-defaultTable"><tbody>'+'<tr><th>id</th><td>' + pickedFeature.id.id + '</td></tr><tr><th>name</th><td>' + pickedFeature.id.name + '</td></tr>'+'</tbody></table>';
        } 
        else {
            

            // Select the feature if it's not already selected
            if (self.silhouetteGreen.selected[0] === pickedFeature) {
                return;
            }

            // Save the selected feature's original color
            var highlightedFeature = self.silhouetteBlue.selected[0];
            if (pickedFeature === highlightedFeature) {
                self.silhouetteBlue.selected = [];
            }

            // Highlight newly selected feature
            self.silhouetteGreen.selected = [pickedFeature];

            // Set feature infobox description
            if(pickedFeature.getProperty)
            {
                var name = pickedFeature.getProperty('name')||pickedFeature.getProperty('NAME');
                if (!GmMap3D.defined(name)) {
                    name = pickedFeature.getProperty('id')||pickedFeature.getProperty('ID');
                }
                self.selectedEntity.name = name;
                self.selectedEntity.description = 'Loading <div class="cesium-infoBox-loading"></div>';
                self.map3dView.GetView().selectedEntity = self.selectedEntity;

                var propertyNames = pickedFeature.getPropertyNames();
                var htm='';
                for(var i = 0;i<propertyNames.length;i++)
                {
                    htm+=getHtml(propertyNames[i],pickedFeature.getProperty(propertyNames[i]))
                    // if(typeof pickedFeature.getProperty(propertyNames[i]) =='object')
                    // {
                    //     htm+='<tr><th>'+propertyNames[i]+'</th><td><table>'
                    //     var proVal = pickedFeature.getProperty(propertyNames[i]);
                    //     var proKey = Object.keys(proVal);
                    //     for(var k=0;k<proKey.length;k++)
                    //     {
                    //         htm+='<tr><th>'+proKey[k]+'</th><td>' + proVal[proKey[k]] + '</td></tr>';
                    //     }
                    //     htm+='</table></td></tr>'
                    // }
                    // else
                    // {
                    //     htm+='<tr><th>'+propertyNames[i]+'</th><td>' + pickedFeature.getProperty(propertyNames[i]) + '</td></tr>';
                    }
                    
                }
                self.selectedEntity.description = '<table class="cesium-infoBox-defaultTable" style="font-size:12px"><tbody>' +htm+'</tbody></table>';
            }
            
        }


        //根据属性生成html文本
        function getHtml(pname,pvalue)
        {
            var htm ='';
            if(pvalue && typeof pvalue =='object')
            {
                htm+='<tr><th style="max-width:100px;text-overflow:ellipsis;overflow:hidden;" title="'+pname+'">'+pname+'</th><td><table style="width:100%;font-size:12px"><tbody>'
                for(var k=0;k<Object.keys(pvalue).length;k++)
                {
                    htm+= getHtml(Object.keys(pvalue)[k],pvalue[Object.keys(pvalue)[k]]);
                }
                htm+='</tbody></table></td></tr>'
            }
            else
            {
                htm+='<tr><th style="max-width:100px;text-overflow:ellipsis;overflow:hidden;" title="'+pname+'">'+pname+'</th><td>' + pvalue + '</td></tr>';
            }

            return htm;
        }

    //}
    
    

})();

var ZMap3D  = Map3DSDK;

//随机获取字符串
function randomString(len) {
	len = len || 32;
	var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';    /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
	var maxPos = $chars.length;
	var pwd = '';
	for (i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}

//加密
var desTable = "WlNs4mMr7cPEh3FnGi0C5OAgId8JL6KkDuSaUb9Ty1Hfz2BjVoqXtZvYpwQxRe";
function CodeString(str) {
	var out = '';
	var charts = str.split("");
	var desCharts = desTable.split("");
	var outChart = new Array(charts.length);
	for (var i = 0; i < charts.length; i++) {
		var ch = charts[i];
		var az = /^[a-z]+$/;
		var AZ = /^[A-Z]+$/;
		var num = /^[0-9]+$/;
		var chCode = str.charCodeAt(i);
		var index;

		//判断字符是否在a~z
		if (az.test(ch)) {
			index = parseInt(chCode) - 97 + 26;
		}
		//判断字符是否在A~Z
		else if (AZ.test(ch)) {
			index = parseInt(chCode) - 65;
		}
		//判断在0-9之间
		else if (num.test(ch)) {
			index = parseInt(ch) + 52;
		}
		ch = desTable[index];
		outChart[i] = ch;
	}

	out = outChart.join().replace(/,/g, "");
	return out;
}

function showLogo(url) {
	var div;
	div = document.getElementById("zmapservertip");
	if (div == null || div == 'undefined') {
		div = document.createElement('div');
		div.className = 'zmapservertip';
		div.id = "zmapservertip";
		div.style.cssText = 'display:block !important;border:1px solid red; background:#ddd; opacity:0.6;text-align:center; font-size:24px;font-weight:bold;font-style:italic;color: #FF6600;width:450px; z-index:100; height:50px;;position:absolute; bottom:5px; right:10px; ';
		var info = "%E6%97%A0%E6%B3%95%E8%8E%B7%E5%8F%96%E8%AF%81%E4%B9%A6%E4%BF%A1%E6%81%AF%E6%88%96%E8%80%85%E8%AF%81%E4%B9%A6%E5%B7%B2%E8%BF%87%E6%9C%9F";
		div.innerHTML = decodeURI(info) + '<br>服务地址' + url + '';
		document.body.appendChild(div);
	}
	else {
		div.style.display = 'block !important';
	}
	setTimeout(function () { GetServerInfo() }, 10000);
	// $('body').append('<div id="zmapservertip" class="zmapservertip" style="border:1px solid red; width:200px; z-index:100; height:20px;">请购买正版武汉兆图科技有限公司许可</div>')
}

function hideLogo() {
	var div;
	div = document.getElementById("zmapservertip");
	if (div == null || div == 'undefined') { }
	else {
		div.style.display = 'none !important';
	}
}