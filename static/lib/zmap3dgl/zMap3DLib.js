// JScript 文件

var Map3DSDKLib = Map3DSDKLib || {};

(function() {
    /** 
    * @exports Input3DTool as Map3DSDKLib.Input3DTool
    */
    var Input3DTool = (function () {

        // static variables
        var ellipsoid = GmMap3D.Ellipsoid.WGS84;

        // constructor
        function _(map) {
            this._map     = map;
            var cesium    = map.GetMap();
            this._scene   = cesium.scene;
            this._surfaces = [];
            this.initialiseHandlers();
            this.enhancePrimitives();
            this._returnZ  = true;
            this._mouseHandler = null;
            this._tempprim     = [];
            this.enableDalfutInput = false;
        }
        
        _.prototype.EnableReturnZ = function(enable)
        {
            this._returnZ = enable;
        }
        _.prototype.PickPositonM = function(screen)
        {
            var coord = this._map.PickModel(screen).coord;
            if(!coord)
            {
                return this.PickPositon(screen);
            }
            if(this._map.PickModel(screen).models&&this._map.PickModel(screen).models.primitive)
            {
                if(this._map.PickModel(screen).models.id&&this._map.PickModel(screen).models.id.model)
                {
                    return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0]);
                }
                else if(this._map.PickModel(screen).models.primitive instanceof GmMap3D.Cesium3DTileset)
                {
                    return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0]);
                }
                else{
                    if(coord.z<0)
                    {
                        return this._scene.camera.pickEllipsoid(screen, ellipsoid);
                    }
                    else
                    {
                        return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0])
                    }

                }
            }
            else{
                if(coord.z<0)
                {
                    return this._scene.camera.pickEllipsoid(screen, ellipsoid);
                }
                else
                {
                    return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0])
                }
                 
            }
        }
        _.prototype.PickPositon   = function(screen)
        {
            // var coord = this._map.PickModel(screen).coord;
            
            // if(this._map.PickModel(screen).models&&this._map.PickModel(screen).models.primitive&&!this._map.PickModel(screen).models.primitive.callback)
            // {
            //     if(coord.z<-100)
            //     {
            //         console.log(this._map.PickModel(screen));
            //     }
            //     return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0])
            // }
            // else{
            //     if(coord.z<0)
            //     {
            //         return this._scene.camera.pickEllipsoid(screen, ellipsoid);
            //     }
            //     else
            //     {
            //         return this._map.JWcoordToC3([coord.x-0,coord.y-0,coord.z-0])
            //     }
                 
            // }
            
           
            //return this._map.PickModel(screen).coord;
            var scene = this._scene;
            var cartesian;
            var pickedObject = scene.pick(screen);
            if (GmMap3D.defined(pickedObject))
            {
                 cartesian = scene.pickPosition(screen, new GmMap3D.Cartesian3());         
                 
                //强制返回高程大于0的数据，处理拾取不准
                var geoc = ellipsoid.cartesianToCartographic(cartesian); 
                if (geoc.height < 0)
                {
                     cartesian =  scene.camera.pickEllipsoid(screen, ellipsoid);
                }                          
            }
            else
            {
                cartesian =  scene.camera.pickEllipsoid(screen, ellipsoid);
            }
            return cartesian;
        }
               
        _.prototype.EnableInput  = function(enable)
        {
            if(this.enableDalfutInput)
            {
                this._scene.screenSpaceCameraController.enableInputs = enable;
            }
            else
            this._scene.screenSpaceCameraController.enableInputs = true;
            
        }
         
        //点工具
        _.prototype.StartPointTool  = function(StartCallBack, EndCallBack,drawOptions) 
        {
            this.ClearAll();     
            
            var options = {callstart: StartCallBack, 
                callback: EndCallBack};
            if(drawOptions)
            {
                options = copyOptions(options,drawOptions);
            } 
            this.startDrawingPoint(options);
        }   
                
        //多段线工具
        _.prototype.StartLineTool  = function(StartCallBack, EndCallBack,drawOptions) 
        {
            this.ClearAll();      
            var options = {callstart: StartCallBack, 
                callback: EndCallBack};
            if(drawOptions)
            {
                options = copyOptions(options,drawOptions);
            }   
            this.startDrawingPolyline(options);
        }

        //单线工具
        _.prototype.StartSingleLineTool  = function(StartCallBack, EndCallBack, updateCallback,drawOptions) 
        {
            this.ClearAll();        
            var options = {
                callstart: StartCallBack, 
                callback: EndCallBack,
                updateCallback:  updateCallback};
            if(drawOptions)
            {
                options = copyOptions(options,drawOptions);
            }  
            this.startDrawingSingleline(options);
        }
        
        
        _.prototype.StartRectTool  = function(StartCallBack, EndCallBack,drawOptions) 
        {
            this.ClearAll();    
            var options = {callstart: StartCallBack, 
                callback: EndCallBack};
            if(drawOptions)
            {
                options = copyOptions(options,drawOptions);
            }    
            this.startDrawingExtent(options);
        }
        
         _.prototype.StartCircleTool  = function(StartCallBack, EndCallBack,drawOptions) 
        {
            this.ClearAll();
            var options = {callstart: StartCallBack, 
                callback: EndCallBack};
            if(drawOptions)
            {
                options = copyOptions(options,drawOptions);
            }
            this.startDrawingCircle(options);
        }
        
         _.prototype.StartPolygonTool  = function(StartCallBack, EndCallBack,drawOptions)
         {
            this.ClearAll();
            var options = {callstart: StartCallBack, 
                callback: EndCallBack};
            if(drawOptions){
                options = copyOptions(options,drawOptions);
            }
            this.startDrawingPolygon(options);
         }
                  
         _.prototype.StartAnyPolygonTool  = function(StartCallBack, EndCallBack)
         {
            
         }
         
         _.prototype.ClearAll             = function()
         {
            this.muteHandlers(false);                     
          
            // check for cleanUp first
            for (var i = 0; i < this._tempprim.length; i++)
            {
                this._scene.primitives.remove(this._tempprim[i]);            
            }
            
            if (this._mouseHandler) 
            {
                this._mouseHandler.destroy();
                this._mouseHandler = null;
            }
         }     
         
         _.prototype.ClearGeometry        = function()
         {
             this.disableAllEditMode();
         }   
        
        //
        _.prototype.initialiseHandlers = function () {
            var scene = this._scene;
            var _self = this;            
        }

        _.prototype.setListener = function (primitive, type, callback) {
            primitive[type] = callback;
        }

        _.prototype.muteHandlers = function (muted) {
            this._handlersMuted = muted;            
            this.EnableInput(!muted);
        }

        _.prototype.startDrawing = function () {
            // undo any current edit of shapes
            this.ClearAll();
            this.muteHandlers(true);
        }

        _.prototype.stopDrawing = function () {
            this.muteHandlers(false);
            this.ClearAll();
        }

        // make sure only one shape is highlighted at a time
        _.prototype.disableAllHighlights = function () {
            this.setHighlighted(undefined);
        }

        _.prototype.setHighlighted = function (surface) {
            if (this._highlightedSurface && !this._highlightedSurface.isDestroyed() && this._highlightedSurface != surface) {
                this._highlightedSurface.setHighlighted(false);
            }
            this._highlightedSurface = surface;
        }

        _.prototype.disableAllEditMode = function () {
            this.setEdited(undefined);
        }

        _.prototype.setEdited = function (surface) {
            if (this._editedSurface && !this._editedSurface.isDestroyed()) {
                this._editedSurface.setEditMode(false);
            }
            this._editedSurface = surface;
        }

        var material = GmMap3D.Material.fromType(GmMap3D.Material.ColorType);
        material.uniforms.color = new GmMap3D.Color(1.0, 1.0, 0.0, 0.5);

        var defaultShapeOptions = {
            ellipsoid: GmMap3D.Ellipsoid.WGS84,
            textureRotationAngle: 0.0,
            height:0, //60.0,
            asynchronous: true,
            show: true,
            debugShowBoundingVolume: false
        }

        var defaultSurfaceOptions = copyOptions(defaultShapeOptions, {
            appearance: new GmMap3D.EllipsoidSurfaceAppearance({
                aboveGround: false
            }),
            material: material,
            granularity: Math.PI / 180.0
        });

        var defaultPolygonOptions = copyOptions(defaultShapeOptions, {});
        var defaultExtentOptions = copyOptions(defaultShapeOptions, {});
        var defaultCircleOptions = copyOptions(defaultShapeOptions, {});
        var defaultEllipseOptions = copyOptions(defaultSurfaceOptions, { rotation: 0 });

        var defaultPolylineOptions = copyOptions(defaultShapeOptions, {
            width: 2,
            geodesic: true,
            granularity: 10000,
            appearance: new GmMap3D.PolylineMaterialAppearance({
                aboveGround: false
            }),
            material: material,
        });

        //    GmMap3D.Polygon.prototype.setStrokeStyle = setStrokeStyle;
        //    GmMap3D.Polygon.prototype.drawOutline = drawOutline;

        var ChangeablePrimitive = (function () {
            function _() {
            }

            _.prototype.initialiseOptions = function (options) {

                fillOptions(this, options);

                this._ellipsoid = undefined;
                this._granularity = undefined;
                this._height = undefined;
                this._textureRotationAngle = undefined;
                this._id = undefined;

                // set the flags to initiate a first drawing
                this._createPrimitive = true;
                this._primitive = undefined;
                this._outlinePolygon = undefined;

            }

            _.prototype.setAttribute = function (name, value) {
                this[name] = value;
                this._createPrimitive = true;
            };

            _.prototype.getAttribute = function (name) {
                return this[name];
            };

            /**
             * @private
             */
            _.prototype.update = function (context, frameState, commandList) {

                if (!GmMap3D.defined(this.ellipsoid)) {
                    throw new GmMap3D.DeveloperError('this.ellipsoid must be defined.');
                }

                if (!GmMap3D.defined(this.appearance)) {
                    throw new GmMap3D.DeveloperError('this.material must be defined.');
                }

                if (this.granularity < 0.0) {
                    throw new GmMap3D.DeveloperError('this.granularity and scene2D/scene3D overrides must be greater than zero.');
                }

                if (!this.show) {
                    return;
                }

                if (!this._createPrimitive && (!GmMap3D.defined(this._primitive))) {
                    // No positions/hierarchy to draw
                    return;
                }

                if (this._createPrimitive ||
                    (this._ellipsoid !== this.ellipsoid) ||
                    (this._granularity !== this.granularity) ||
                    (this._height !== this.height) ||
                    (this._textureRotationAngle !== this.textureRotationAngle) ||
                    (this._id !== this.id)) {

                    var geometry = this.getGeometry();
                    if (!geometry) {
                        return;
                    }

                    this._createPrimitive = false;
                    this._ellipsoid = this.ellipsoid;
                    this._granularity = this.granularity;
                    this._height = this.height;
                    this._textureRotationAngle = this.textureRotationAngle;
                    this._id = this.id;

                    this._primitive = this._primitive && this._primitive.destroy();

                    this._primitive = new GmMap3D.Primitive({
                        geometryInstances: new GmMap3D.GeometryInstance({
                            geometry: geometry,
                            id: this.id,
                            pickPrimitive: this
                        }),
                        appearance: this.appearance,
                        asynchronous: this.asynchronous
                    });

                    this._outlinePolygon = this._outlinePolygon && this._outlinePolygon.destroy();
                    if (this.strokeColor && this.getOutlineGeometry) {
                        // create the highlighting frame
                        console.log(context)
                        this._outlinePolygon = new GmMap3D.Primitive({
                            geometryInstances: new GmMap3D.GeometryInstance({
                                geometry: this.getOutlineGeometry(),
                                attributes: {
                                    color: GmMap3D.ColorGeometryInstanceAttribute.fromColor(this.strokeColor)
                                }
                            }),
                            appearance: new GmMap3D.PerInstanceColorAppearance({
                                flat: true,
                                renderState: {
                                    depthTest: {
                                        enabled: true
                                    },
                                    lineWidth: 1//Math.min(this.strokeWidth || 4.0, context._aliasedLineWidthRange[1]) 
                                }
                            })
                        });
                    }
                }

                var primitive = this._primitive;
                primitive.appearance.material = this.material;
                primitive.debugShowBoundingVolume = this.debugShowBoundingVolume;
                primitive.update(context, frameState, commandList);
                this._outlinePolygon && this._outlinePolygon.update(context, frameState, commandList);

            };

            _.prototype.isDestroyed = function () {
                return false;
            };

            _.prototype.destroy = function () {
                this._primitive = this._primitive && this._primitive.destroy();
                return GmMap3D.destroyObject(this);
            };

            _.prototype.setStrokeStyle = function (strokeColor, strokeWidth) {
                if (!this.strokeColor || !this.strokeColor.equals(strokeColor) || this.strokeWidth != strokeWidth) {
                    this._createPrimitive = true;
                    this.strokeColor = strokeColor;
                    this.strokeWidth = strokeWidth;
                }
            }

            return _;
        })();

        //Rectangle绘制对象定义
        _.ExtentPrimitive = (function () {
            function _(options) {

                if (!GmMap3D.defined(options.extent)) {
                    throw new GmMap3D.DeveloperError('Extent is required');
                }

                options = copyOptions(options, defaultSurfaceOptions);

                this.initialiseOptions(options);

                this.setExtent(options.extent);

            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setExtent = function (extent) {
                this.setAttribute('extent', extent);
            };

            _.prototype.getExtent = function () {
                return this.getAttribute('extent');
            };

            _.prototype.getGeometry = function () {

                if (!GmMap3D.defined(this.extent)) {
                    return;
                }

                return new GmMap3D.RectangleGeometry({
                    rectangle: this.extent,
                    height: this.height,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    stRotation: this.textureRotationAngle,
                    ellipsoid: this.ellipsoid,
                    granularity: this.granularity
                });
            };

            _.prototype.getOutlineGeometry = function () {
                return new GmMap3D.RectangleOutlineGeometry({
                    rectangle: this.extent
                });
            }

            return _;
        })();
        
        //Point绘制对象定义
        _.PointPrimitive = (function () {

            function _(options) {

                if (!(GmMap3D.defined(options.center) && GmMap3D.defined(options.radius))) {
                    throw new GmMap3D.DeveloperError('Center and radius are required');
                }

                options = copyOptions(options, defaultSurfaceOptions);

                this.initialiseOptions(options);

                this.setRadius(options.radius);

            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setCenter = function (center) {
                this.setAttribute('center', center);
            };

            _.prototype.setRadius = function (radius) {
                this.setAttribute('radius', Math.max(0.1, radius));
            };

            _.prototype.getCenter = function () {
                return this.getAttribute('center');
            };

            _.prototype.getRadius = function () {
                return this.getAttribute('radius');
            };

            _.prototype.getGeometry = function () {

                if (!(GmMap3D.defined(this.center) && GmMap3D.defined(this.radius))) {
                    return;
                }

                return new GmMap3D.CircleGeometry({
                    center: this.center,
                    radius: this.radius,
                    height: this.height,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    stRotation: this.textureRotationAngle,
                    ellipsoid: this.ellipsoid,
                    granularity: this.granularity
                });
            };

            _.prototype.getOutlineGeometry = function () {
                return new GmMap3D.CircleOutlineGeometry({
                    center: this.getCenter(),
                    radius: this.getRadius()
                });
            }

            return _;
        })();           
        
        //Polyline绘制对象定义
        _.PolylinePrimitive = (function () {

            function _(options) {
                options = copyOptions(options, defaultPolylineOptions);
                this.initialiseOptions(options);
            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setPositions = function (positions) {
                this.setAttribute('positions', positions);
            };

            _.prototype.setWidth = function (width) {
                this.setAttribute('width', width);
            };

            _.prototype.setGeodesic = function (geodesic) {
                this.setAttribute('geodesic', geodesic);
            };

            _.prototype.getPositions = function () {
                return this.getAttribute('positions');
            };

            _.prototype.getWidth = function () {
                return this.getAttribute('width');
            };

            _.prototype.getGeodesic = function (geodesic) {
                return this.getAttribute('geodesic');
            };

            _.prototype.getGeometry = function () {

                if (!GmMap3D.defined(this.positions) || this.positions.length < 2) {
                    return;
                }

                return new GmMap3D.PolylineGeometry({
                    positions: this.positions,
                    height: this.height,
                    width: this.width < 1 ? 1 : this.width,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    ellipsoid: this.ellipsoid
                });
            }

            return _;
        })();        

        //Polygon绘制对象定义
        _.PolygonPrimitive = (function () {

            function _(options) {

                options = copyOptions(options, defaultSurfaceOptions);

                this.initialiseOptions(options);

                this.isPolygon = true;

            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setPositions = function (positions) {
                this.setAttribute('positions', positions);
            };

            _.prototype.getPositions = function () {
                return this.getAttribute('positions');
            };

            _.prototype.getGeometry = function () {

                if (!GmMap3D.defined(this.positions) || this.positions.length < 3) {
                    return;
                }

                return GmMap3D.PolygonGeometry.fromPositions({
                    positions: this.positions,
                    //height: this.height,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    stRotation: this.textureRotationAngle,
                    ellipsoid: this.ellipsoid,
                    granularity: this.granularity,
                    perPositionHeight:true
                });
            };

            _.prototype.getOutlineGeometry = function () {
                return GmMap3D.PolygonOutlineGeometry.fromPositions({
                    positions: this.getPositions()
                });
            }

            return _;
        })();

        //Circle绘制对象定义
        _.CirclePrimitive = (function () {

            function _(options) {

                if (!(GmMap3D.defined(options.center) && GmMap3D.defined(options.radius))) {
                    throw new GmMap3D.DeveloperError('Center and radius are required');
                }

                options = copyOptions(options, defaultSurfaceOptions);

                this.initialiseOptions(options);

                this.setRadius(options.radius);

            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setCenter = function (center) {
                this.setAttribute('center', center);
            };

            _.prototype.setRadius = function (radius) {
                this.setAttribute('radius', Math.max(0.1, radius));
            };

            _.prototype.setHeight = function (height) {
                this.setAttribute('height', height);
            };

            _.prototype.getCenter = function () {
                return this.getAttribute('center');
            };

            _.prototype.getRadius = function () {
                return this.getAttribute('radius');
            };

            _.prototype.getHeight = function () {
                return this.getAttribute('height');
            };

            _.prototype.getGeometry = function () {

                if (!(GmMap3D.defined(this.center) && GmMap3D.defined(this.radius))) {
                    return;
                }

                return new GmMap3D.CircleGeometry({
                    center: this.center,
                    radius: this.radius,
                    height: this.height,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    stRotation: this.textureRotationAngle,
                    ellipsoid: this.ellipsoid,
                    granularity: this.granularity
                });
            };

            _.prototype.getOutlineGeometry = function () {
                return new GmMap3D.CircleOutlineGeometry({
                    center: this.getCenter(),
                    radius: this.getRadius()
                });
            }

            return _;
        })();

        //Ellipse绘制对象定义
        _.EllipsePrimitive = (function () {
            function _(options) {

                if (!(GmMap3D.defined(options.center) && GmMap3D.defined(options.semiMajorAxis) && GmMap3D.defined(options.semiMinorAxis))) {
                    throw new GmMap3D.DeveloperError('Center and semi major and semi minor axis are required');
                }

                options = copyOptions(options, defaultEllipseOptions);

                this.initialiseOptions(options);

            }

            _.prototype = new ChangeablePrimitive();

            _.prototype.setCenter = function (center) {
                this.setAttribute('center', center);
            };

            _.prototype.setSemiMajorAxis = function (semiMajorAxis) {
                if (semiMajorAxis < this.getSemiMinorAxis()) return;
                this.setAttribute('semiMajorAxis', semiMajorAxis);
            };

            _.prototype.setSemiMinorAxis = function (semiMinorAxis) {
                if (semiMinorAxis > this.getSemiMajorAxis()) return;
                this.setAttribute('semiMinorAxis', semiMinorAxis);
            };

            _.prototype.setRotation = function (rotation) {
                return this.setAttribute('rotation', rotation);
            };

            _.prototype.getCenter = function () {
                return this.getAttribute('center');
            };

            _.prototype.getSemiMajorAxis = function () {
                return this.getAttribute('semiMajorAxis');
            };

            _.prototype.getSemiMinorAxis = function () {
                return this.getAttribute('semiMinorAxis');
            };

            _.prototype.getRotation = function () {
                return this.getAttribute('rotation');
            };

            _.prototype.getGeometry = function () {

                if (!(GmMap3D.defined(this.center) && GmMap3D.defined(this.semiMajorAxis) && GmMap3D.defined(this.semiMinorAxis))) {
                    return;
                }

                return new GmMap3D.EllipseGeometry({
                    ellipsoid: this.ellipsoid,
                    center: this.center,
                    semiMajorAxis: this.semiMajorAxis,
                    semiMinorAxis: this.semiMinorAxis,
                    rotation: this.rotation,
                    height: this.height,
                    vertexFormat: GmMap3D.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
                    stRotation: this.textureRotationAngle,
                    ellipsoid: this.ellipsoid,
                    granularity: this.granularity
                });
            };

            _.prototype.getOutlineGeometry = function () {
                return new GmMap3D.EllipseOutlineGeometry({
                    center: this.getCenter(),
                    semiMajorAxis: this.getSemiMajorAxis(),
                    semiMinorAxis: this.getSemiMinorAxis(),
                    rotation: this.getRotation()
                });
            }

            return _;
        })();


        var defaultBillboard = {
            iconUrl: "./Images/dragin.png",
            shiftX: 0,
            shiftY: 0
        }

        var dragBillboard = {
            iconUrl: "./Images/dragin.png",
            shiftX: 0,
            shiftY: 0
        }

        var dragHalfBillboard = {
            iconUrl: "./Images/dragin.png",
            shiftX: 0,
            shiftY: 0
        }

        _.prototype.startDrawingPolyline = function (options) {
            var options = copyOptions(options, defaultPolylineOptions);
            this.startDrawingmultiline(false, options);
        }

        _.prototype.startDrawingSingleline = function (options) {
            var options = copyOptions(options, defaultPolylineOptions);
            this.startDrawingSline(false, options);
        }
        
        _.prototype.startDrawingPolygon = function (options) {
            var options = copyOptions(options, defaultSurfaceOptions);
            this.startDrawingPolyshape(true, options);
        }   
        
        _.prototype.startDrawingPoint = function (options) {
            var options = copyOptions(options, defaultSurfaceOptions);
            var returnZ      = this._returnZ;
            var _self = this;

            this.startDrawing();

            var scene = this._scene;
            var primitives = this._scene.primitives;

            var circle = null;
            var markers = null;
            var firstPixel = null;
            
            function isPixelEqual(p1, p2)
            {
                if (Math.abs(p1.x - p2.x) < 5 && Math.abs(p1.x - p2.x) < 5 )
                {
                    return true;
                }
                return false;
            }

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);            
            
            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                if (movement.position != null) {
                    //var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                      var cartesian = _self.PickPositon(movement.position);
                    if (cartesian) {
                        firstPixel = movement.position;                        
                        var geoc = ellipsoid.cartesianToCartographic(cartesian);
                        var point= null;
                        if (returnZ)
                        {
                            point = [ GmMap3D.Math.toDegrees(geoc.longitude), GmMap3D.Math.toDegrees(geoc.latitude), geoc.height]; 
                        }
                        else
                        {
                            point = [ GmMap3D.Math.toDegrees(geoc.longitude), GmMap3D.Math.toDegrees(geoc.latitude)]; 
                        }
                              
                        var radius= 1000000.0 / Math.pow(2, _self._map.GetZoom());                 
                        options.callstart({
                                "screen": movement.position,
                                "type": "point",
                                "geometry": point});                           
                        if (circle == null)
                         {                                                   
                            // create the circle
                            circle = new _.PointPrimitive({
                                center: cartesian,
                                radius: radius,
                                asynchronous: false,
                                material: options.material
                            });
                            primitives.add(circle);
                            _self._tempprim.push(circle);
                            //markers = new _.BillboardGroup(_self, defaultBillboard);
                            //markers.addBillboards([cartesian]);
                            
                        //  _self.stopDrawing();        
                        }
                        else
                        {
                            circle.setCenter(cartesian);
                            circle.setRadius(radius);                            
                        }
                        options.callback({
                                "screen": movement.position,
                                "type": "point",
                                "geometry": point});
                      
                        _self.EnableInput(true);       
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
        }       
        /**
         * 判断是否为模型，请使用zMap3D库中的PickModel方法获取当前拾取的模型 </br>
         * models.primitive下 实体属于Primitive类，gltf等模型属于*model类，3dTiles属于Cesium3DTileset类
         * @param pickedModel PickModel方法的返回值
         * @returns {*} true|false
         */
        _.prototype.isModel = function(pickedModel){

            if(!pickedModel.models){ //表示没有选中任何实体
                return false
            }
            //gltf
            var model = pickedModel.models.primitive && pickedModel.models.primitive.constructor.name.toLowerCase().indexOf("model") > -1
            //3dTiles
            var tilesSet = pickedModel.models.primitive && pickedModel.models.primitive.constructor.name.toLowerCase().indexOf("3dtileset") > -1

            //无论哪种模型都算作模型
            return model || tilesSet
        }
        
        
       _.prototype.startDrawingSline = function (isPolygon, options) {
            var returnZ      = this._returnZ;

            this.startDrawing();

            var _self = this;
            var scene = this._scene;
            var primitives = scene.primitives;

            var minPoints = 2;//isPolygon ? 3 : 2;
            var poly, polyline;

            poly = new Input3DTool.PolylinePrimitive(options);             
            poly.asynchronous = false;
            primitives.add(poly);                  
            _self._tempprim.push(poly);

            var positions = [];
           // var markers = new _.BillboardGroup(this, defaultBillboard);

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);

            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                
                //只选取模型的模式下，选中的不是模型 则直接返回
                if(options.modelOnly && !_self.isModel(_self._map.PickModel(movement.position))){
                    return
                }            
            
                if (movement.position != null) {
                    //var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                     var cartesian = _self.PickPositonM(movement.position);
                    if (cartesian) {
                        // first click
                        if (positions.length == 0) {
                            options.callstart({
                                "screen": movement.position,
                                "firstPoint": cartesian                            
                            });
                        
                        
                            positions.push(cartesian.clone());
                            //markers.addBillboard(positions[0]);
                        }else{
                            _self.stopDrawing();
                            if (typeof options.callback == 'function') {
                                // remove overlapping ones
                                var index = positions.length - 1;
                                
                                var polygon = [];
                                var geoc;
                                
                                
                                for (var i = 0; i < positions.length; i++)
                                {
                                    var geoc = ellipsoid.cartesianToCartographic(positions[i]); 
                                    if (returnZ)
                                    {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude),
                                                      geoc.height]);                                    
                                    }
                                    else
                                    {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude)]);                                        
                                    } 
                                }                               
                                options.callback( {geometry: polygon, type: "singleline"});
                            }
                        }
                        // add new point to polygon
                        // this one will move with the mouse
                        positions.push(cartesian);
                        
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // add marker at the new position
                      //  markers.addBillboard(cartesian);
                        
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);

            mouseHandler.setInputAction(function (movement) {
                var position = movement.endPosition;
                if (position != null) {
                    if (positions.length == 0) {
                    } else {
                        //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositonM(position);
                        if (cartesian) 
                        {
                            positions.pop();
                            // make sure it is slightly different
                            //cartesian.y += (1 + Math.random());
                            positions.push(cartesian);
                            
                            
                            if (positions.length >= minPoints) 
                            {
                                poly.positions = positions;
                                poly._createPrimitive = true;
                                

                            }
                            else
                            {
                                var newPnts = [ new GmMap3D.Cartesian3(positions[0].x, positions[0].y, positions[0].z),
                                                new GmMap3D.Cartesian3(positions[1].x, positions[1].y, positions[1].z)]
                                if (polyline)
                                {
                                    polyline.positions = newPnts;
                                    polyline._createPrimitive = true;
                                }
                            }
                           
                                                        
                            // update marker
                         //   markers.getBillboard(positions.length - 1).position = cartesian;
                            //添加实时回调
                            if(typeof options.updateCallback === 'function') options.updateCallback(positions)
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);


            // mouseHandler.setInputAction(function (movement) {
            //     var position = movement.position;
            //     if (position != null) {
            //         _self.stopDrawing();
            //         if (typeof options.callback == 'function') {
            //             // remove overlapping ones
            //             var index = positions.length - 1;
                        
            //             var polygon = [];
            //             var geoc;
                        
                        
            //             for (var i = 0; i < positions.length; i++)
            //             {
            //                 var geoc = ellipsoid.cartesianToCartographic(positions[i]); 
                            
            //                  if (returnZ)
            //                  {
            //                     polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
            //                                   GmMap3D.Math.toDegrees(geoc.latitude),
            //                                   geoc.height]);    
            //                  }
            //                  else
            //                  {
            //                     polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
            //                                   GmMap3D.Math.toDegrees(geoc.latitude)]);                                
            //                  }
            //             }                               
            //             options.callback( {geometry: polygon, type: "singleline"});
            //         }
            //     }
            // }, GmMap3D.ScreenSpaceEventType.RIGHT_CLICK);

        } 
             

        _.prototype.startDrawingmultiline = function (isPolygon, options) {
            var returnZ      = this._returnZ;

            this.startDrawing();

            var _self = this;
            var scene = this._scene;
            var primitives = scene.primitives;

            var minPoints = 2;//isPolygon ? 3 : 2;
            var poly, polyline;

            poly = new Input3DTool.PolylinePrimitive(options); 
            poly.asynchronous = false;
            primitives.add(poly);                  
            _self._tempprim.push(poly); 

            var positions = [];
            //var markers = new _.BillboardGroup(this, defaultBillboard);

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);

            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                if (movement.position != null) {
                    //var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                     var cartesian = _self.PickPositon(movement.position);
                    if (cartesian) {
                        // first click
                        if (positions.length == 0) {
                            options.callstart({
                                "screen": movement.position,
                                "firstPoint": cartesian                            
                            });
                        
                        
                            positions.push(cartesian.clone());
                           // markers.addBillboard(positions[0]);
                        }
                        // add new point to polygon
                        // this one will move with the mouse
                        positions.push(cartesian);
                        
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // add marker at the new position
                        //markers.addBillboard(cartesian);
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);

            mouseHandler.setInputAction(function (movement) {
                var position = movement.endPosition;
                if (position != null) {
                    if (positions.length == 0) {
                    } else {
                        //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositon(position);
                        if (cartesian) 
                        {
                            positions.pop();
                            // make sure it is slightly different
                            //cartesian.y += (1 + Math.random());
                            positions.push(cartesian);
                            
                            
                            if (positions.length >= minPoints) 
                            {
                                poly.positions = positions;
                                poly._createPrimitive = true;
                                

                            }
                            else
                            {
                                var newPnts = [ new GmMap3D.Cartesian3(positions[0].x, positions[0].y, positions[0].z),
                                                new GmMap3D.Cartesian3(positions[1].x, positions[1].y, positions[1].z)]
                                if (polyline)
                                {
                                    polyline.positions = newPnts;
                                    polyline._createPrimitive = true;
                                }
                            }
                           
                                                        
                            // update marker
                          //  markers.getBillboard(positions.length - 1).position = cartesian;
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

            mouseHandler.setInputAction(function (movement) {
                var position = movement.position;
                if (position != null) {
                    if (positions.length < minPoints ) {
                        return;
                    } else {
                       // var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositon(position);
                        if (cartesian) {
                            _self.stopDrawing();
                            if (typeof options.callback == 'function') {
                                // remove overlapping ones
                                var index = positions.length - 1;
                                
                                var polygon = [];
                                var geoc;
                                
                                //双击剔除一个重复点
                                for (var i = 0; i < positions.length; i++)
                                {
                                   var geoc = ellipsoid.cartesianToCartographic(positions[i]);                                    
                                   if (returnZ)
                                   {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude),
                                                      geoc.height]);                                   
                                   }
                                   else
                                   {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude)]);                                        
                                   }
                                }
                                
                                //添加第一个点，封闭多边形
                                 // geoc = ellipsoid.cartesianToCartographic(positions[0]); 
                                 // polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                 //               GmMap3D.Math.toDegrees(geoc.latitude)]);                                
                                options.callback( {geometry: polygon, type: "polyline"});
                            }
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.RIGHT_CLICK);

        }
        
                _.prototype.startDrawingPolyshape = function (isPolygon, options) {
            var returnZ      = this._returnZ;
            var _self        = this;
            this.startDrawing();

            var scene = this._scene;
            var primitives = scene.primitives;

            var minPoints = isPolygon ? 3 : 2;
            var poly, polyline;
            var lineWidth = options.lineWidth;
            if (isPolygon) 
            {   
                if(lineWidth){
                    defaultPolylineOptions.width = lineWidth;
                }
                polyline = new Input3DTool.PolylinePrimitive(defaultPolylineOptions);
                polyline.asynchronous = false;          
                primitives.add(polyline);  
                _self._tempprim.push(polyline);
                
                
                poly = new Input3DTool.PolygonPrimitive(options);    
                 _self._tempprim.push(poly);            
            }
            else
            {
                poly = new Input3DTool.PolylinePrimitive(options); 
                  _self._tempprim.push(poly); 
            }
            poly.asynchronous = false;
            primitives.add(poly);                  

            var positions = [];
           // var markers = new _.BillboardGroup(this, defaultBillboard);

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);

            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                if (movement.position != null) {
                    //var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                     var cartesian = _self.PickPositon(movement.position);
                    if (cartesian) {
                        // first click
                        if (positions.length == 0) {
                            options.callstart({
                                "screen": movement.position,
                                "firstPoint": cartesian,                    
                            });
                        
                        
                            positions.push(cartesian.clone());
                           // markers.addBillboard(positions[0]);
                        }
                        // add new point to polygon
                        // this one will move with the mouse
                        positions.push(cartesian);
                        
                        if (positions.length >= minPoints) {
                            poly.positions = positions;
                            poly._createPrimitive = true;
                        }
                        // add marker at the new position
                      // markers.addBillboard(cartesian);
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);

            mouseHandler.setInputAction(function (movement) {

                var position = movement.endPosition;
                if (position != null) {
                    if (positions.length == 0) {
                    } else {
                        //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositon(position);
                        
                        if (cartesian) 
                        {
                            cartesian.z = cartesian.z + 0.5;
                            positions.pop();
                            // make sure it is slightly different
                            //cartesian.y += (1 + Math.random());
                            positions.push(cartesian);
                            
                            
                            if (positions.length >= minPoints) 
                            {
                                poly.positions = positions;
                                poly._createPrimitive = true;
                            }
                            // else
                            // {
                                // var newPnts = [ new GmMap3D.Cartesian3(positions[0].x, positions[0].y, positions[0].z),
                                //                 new GmMap3D.Cartesian3(positions[1].x, positions[1].y, positions[1].z)]
                                var newPnts = [];
                                for(var q=0;q<positions.length;q++)
                                {
                                    newPnts.push(positions[q]);
                                }
                                newPnts.push(positions[0])
                                if (polyline)
                                {
                                    polyline.positions = newPnts;
                                    polyline._createPrimitive = true;
                                }
                           // }
                           
                                                        
                            // update marker
                          // markers.getBillboard(positions.length - 1).position = cartesian;
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

            
            mouseHandler.setInputAction(function (movement) {
                var position = movement.position;
                if (position != null) {
                    if (positions.length < minPoints) {
                        return;
                    } else {
                        //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositon(position);
                        if (cartesian) {
                            _self.stopDrawing();
                            if (typeof options.callback == 'function') {
                                // remove overlapping ones
                                var index = positions.length - 1;
                                
                                var polygon = [];
                                var geoc;
                                
                                //双击剔除一个重复点
                                for (var i = 0; i < positions.length; i++)
                                {
                                    var geoc = ellipsoid.cartesianToCartographic(positions[i]); 
                                    
                                    if (returnZ)
                                    {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude),
                                                      geoc.height]);
                                        
                                    }
                                    else
                                    {
                                        polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                      GmMap3D.Math.toDegrees(geoc.latitude)]);                                        
                                    }
                                }
                                
                                //添加第一个点，封闭多边形
                                 geoc = ellipsoid.cartesianToCartographic(positions[0]); 
                                  if (returnZ)
                                  {
                                     polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                   GmMap3D.Math.toDegrees(geoc.latitude),
                                                   geoc.height]);   
                                  }
                                  else
                                  {
                                     polygon.push([GmMap3D.Math.toDegrees(geoc.longitude),
                                                   GmMap3D.Math.toDegrees(geoc.latitude)]);                                
                                    
                                  }
                                options.callback( {geometry: polygon, type: "polygon"});
                            }
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.RIGHT_CLICK);

        }

        function getExtentCorners(value) {
            return ellipsoid.cartographicArrayToCartesianArray([GmMap3D.Rectangle.northwest(value), GmMap3D.Rectangle.northeast(value), GmMap3D.Rectangle.southeast(value), GmMap3D.Rectangle.southwest(value)]);
        }

        _.prototype.startDrawingExtent = function (options) {
            var returnZ      = this._returnZ;

            var options = copyOptions(options, defaultSurfaceOptions);

            this.startDrawing();

            var _self = this;
            var scene = this._scene;
            var primitives = this._scene.primitives;

            var firstPoint = null;
            var firstPixel = null;
            var extent = null;
           // var markers = null;

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);
            
            function isPixelEqual(p1, p2)
            {
                if (Math.abs(p1.x - p2.x) < 5 && Math.abs(p1.x - p2.x) < 5 )
                {
                    return true;
                }
                return false;
            }


            function updateExtent(value) {
                if (extent == null) {
                    options.extent = value;//new GmMap3D.Rectangle(-GmMap3D.Math.PI/2, -GmMap3D.Math.PI/2, GmMap3D.Math.PI/2, GmMap3D.Math.PI/2)//;                
                    extent = new _.ExtentPrimitive(options); //GmMap3D.Rectangle(value);//RectanglePrimitive();
                    extent.asynchronous = false;
                    primitives.add(extent);
                    _self._tempprim.push(extent);
                }
                extent.setExtent(value);
                extent._createPrimitive = true;
                
                // update the markers
                var corners = getExtentCorners(value);
                // create if they do not yet exist
//                if (markers == null) {
//                    markers = new _.BillboardGroup(_self, defaultBillboard);
//                    markers.addBillboards(corners);
//                } else {
//                    markers.updateBillboardsPositions(corners);
//                }
            }

            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                if (movement.position != null) {
                   // var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                     var cartesian = _self.PickPositon(movement.position);
                    if (cartesian) {
                        if (extent == null) {
                            //
                            options.callstart({
                                    "screen": movement.position,
                                    "firstPoint": cartesian});
                        
                            // create the rectangle
                            firstPixel = movement.position;
                            firstPoint = ellipsoid.cartesianToCartographic(cartesian);
                            options.height = firstPoint.height ||0;
                            var value  = getExtent(firstPoint, firstPoint);
                            updateExtent(value);
                        } else {
                            _self.stopDrawing();
                            if (typeof options.callback == 'function') {
                                var rect    = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                                var degRect = [GmMap3D.Math.toDegrees(rect.west),                                                
                                               GmMap3D.Math.toDegrees(rect.south), 
                                               GmMap3D.Math.toDegrees(rect.east), 
                                               GmMap3D.Math.toDegrees(rect.north) ];
                                options.callback( { "geometry": degRect, type: "rectangle",height:firstPoint.height });
                            }
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
                       
            
            // Now wait for over
            // mouseHandler.setInputAction(function (movement) {
            //     if (movement.position != null) {
            //         //var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
            //         var cartesian = _self.PickPositon(movement.position);
            //         if (cartesian) {
            //             if (extent != null) {
            //                 var secPoint = ellipsoid.cartesianToCartographic(cartesian);                            
            //                 if (isPixelEqual(firstPixel, movement.position))
            //                 {
            //                     return ;
            //                 }

            //                 _self.stopDrawing();
            //                 if (typeof options.callback == 'function') {
                            
            //                     var rect    = getExtent(firstPoint, secPoint);
            //                     var degRect = [GmMap3D.Math.toDegrees(rect.west),                                                
            //                                    GmMap3D.Math.toDegrees(rect.south), 
            //                                    GmMap3D.Math.toDegrees(rect.east), 
            //                                    GmMap3D.Math.toDegrees(rect.north) ];
            //                     options.callback( { "geometry": degRect, type: "rectangle" ,height:firstPoint.height });

            //                 }
            //             }
            //         }
            //     }
            // }, GmMap3D.ScreenSpaceEventType.LEFT_UP);            

            mouseHandler.setInputAction(function (movement) {
                var position = movement.endPosition;
                if (position != null) {
                    if (extent == null) {
                    } else {
                        //var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        var cartesian = _self.PickPositon(position);
                        if (cartesian) {
                            var value = getExtent(firstPoint, ellipsoid.cartesianToCartographic(cartesian));
                            updateExtent(value);
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

        }

        _.prototype.startDrawingCircle = function (options) {
            var returnZ      = this._returnZ;

            var options = copyOptions(options, defaultSurfaceOptions);

            this.startDrawing();

            var _self = this;
            var scene = this._scene;
            var primitives = this._scene.primitives;

            var circle = null;
         //   var markers = null;
            var firstPixel = null;
            
            function isPixelEqual(p1, p2)
            {
                if (Math.abs(p1.x - p2.x) < 5 && Math.abs(p1.x - p2.x) < 5 )
                {
                    return true;
                }
                return false;
            }

            var mouseHandler = _self._mouseHandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);

            // Now wait for start
            mouseHandler.setInputAction(function (movement) {
                if (movement.position != null) {
                   // var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
                    var cartesian = _self.PickPositon(movement.position);
                    if (cartesian) {
                        firstPixel = movement.position;
                        if (circle == null) {
                            options.callstart({
                                "screen": movement.position,
                                "firstPoint": cartesian});
                           
                                
                        
                            // create the circle
                            circle = new _.CirclePrimitive({
                                center: cartesian,
                                radius: 0,
                                height:ellipsoid.cartesianToCartographic(cartesian).height,
                                asynchronous: false,
                                material: options.material
                            });
                            primitives.add(circle);
                            _self._tempprim.push(circle);
                           // markers = new _.BillboardGroup(_self, defaultBillboard);
                           // markers.addBillboards([cartesian]);
                               
                        } else {
                            if (typeof options.callback == 'function') {
                                var geoc = ellipsoid.cartesianToCartographic(circle.getCenter());
                                var param = {
                                    center: [ GmMap3D.Math.toDegrees(geoc.longitude), GmMap3D.Math.toDegrees(geoc.latitude),geoc.height],
                                    radius: GmMap3D.Math.toDegrees(circle.getRadius() / ellipsoid._maximumRadius)                                
                                };
                                options.callback( { "geometry": param, type: "circle" } );
                            }
                            _self.stopDrawing();
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);
            

            // Now wait for over
            // mouseHandler.setInputAction(function (movement) {
            //     if (movement.position != null) {
            //         var cartesian = scene.camera.pickEllipsoid(movement.position, ellipsoid);
            //         if (cartesian)
            //         {
            //             if (isPixelEqual(firstPixel, movement.position))
            //             {
            //                 return ;
            //             }                    
            //             if (circle ){
            //                 if (typeof options.callback == 'function') {
            //                     var geoc = ellipsoid.cartesianToCartographic(circle.getCenter());
            //                     var param = {
            //                         center: [ GmMap3D.Math.toDegrees(geoc.longitude), GmMap3D.Math.toDegrees(geoc.latitude),geoc.height],
            //                         radius: GmMap3D.Math.toDegrees(circle.getRadius() / ellipsoid._maximumRadius)  
            //                     };
            //                     options.callback({ "geometry": param , type: "circle" });
            //                 }
            //                 _self.stopDrawing();
            //             }
            //         }
            //     }
            // }, GmMap3D.ScreenSpaceEventType.LEFT_UP);            

            mouseHandler.setInputAction(function (movement) {
                var position = movement.endPosition;
                if (position != null) {
                    if (circle == null) {
                       
                    } else {
                        var cartesian = scene.camera.pickEllipsoid(position, ellipsoid);
                        



                        if (cartesian) {
                            var p1 = ellipsoid.cartesianToCartographic(cartesian);
                            var c1 = ellipsoid.cartesianToCartographic(circle.getCenter());

                            var p2 = [ GmMap3D.Math.toDegrees(p1.longitude), GmMap3D.Math.toDegrees(p1.latitude)];
                            var c2 = [ GmMap3D.Math.toDegrees(c1.longitude), GmMap3D.Math.toDegrees(c1.latitude)];

                            var p = GmMap3D.Cartesian3.fromDegrees(p2[0], p2[1],0);
                            var c = GmMap3D.Cartesian3.fromDegrees(c2[0], c2[1],0);

                            circle.setRadius(GmMap3D.Cartesian3.distance(c, p));
                         //   markers.updateBillboardsPositions(cartesian);
                            
                        }
                    }
                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

        }

        _.prototype.enhancePrimitives = function () {

            var drawHelper = this;

            GmMap3D.Billboard.prototype.setEditable = function () {

                if (this._editable) {
                    return;
                }

                this._editable = true;

                var billboard = this;

                var _self = this;

                function enableRotation(enable) {
                    drawHelper._scene.screenSpaceCameraController.enableRotate = enable;
                }

                setListener(billboard, 'leftDown', function (position) {
                    // TODO - start the drag handlers here
                    // create handlers for mouseOut and leftUp for the billboard and a mouseMove
                    function onDrag(position) {
                        billboard.position = position;
                        _self.executeListeners({ name: 'drag', positions: position });
                    }
                    function onDragEnd(position) {
                        handler.destroy();
                        enableRotation(true);
                        _self.executeListeners({ name: 'dragEnd', positions: position });
                    }

                    var handler = new GmMap3D.ScreenSpaceEventHandler(drawHelper._scene.canvas);

                    handler.setInputAction(function (movement) {
                        var cartesian = drawHelper._scene.camera.pickEllipsoid(movement.endPosition, ellipsoid);
                        if (cartesian) {
                            onDrag(cartesian);
                        } else {
                            onDragEnd(cartesian);
                        }
                    }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);

                    handler.setInputAction(function (movement) {
                        onDragEnd(drawHelper._scene.camera.pickEllipsoid(movement.position, ellipsoid));
                    }, GmMap3D.ScreenSpaceEventType.LEFT_UP);

                    enableRotation(false);

                });

                enhanceWithListeners(billboard);

            }

            function setHighlighted(highlighted) {

                var scene = drawHelper._scene;

                // if no change
                // if already highlighted, the outline polygon will be available
                if (this._highlighted && this._highlighted == highlighted) {
                    return;
                }
                // disable if already in edit mode
                if (this._editMode === true) {
                    return;
                }
                this._highlighted = highlighted;
                // highlight by creating an outline polygon matching the polygon points
                if (highlighted) {
                    // make sure all other shapes are not highlighted
                    drawHelper.setHighlighted(this);
                    this._strokeColor = this.strokeColor;
                    this.setStrokeStyle(GmMap3D.Color.fromCssColorString('white'), this.strokeWidth);
                } else {
                    if (this._strokeColor) {
                        this.setStrokeStyle(this._strokeColor, this.strokeWidth);
                    } else {
                        this.setStrokeStyle(undefined, undefined);
                    }
                }
            }


            _.CirclePrimitive.prototype.getCircleCartesianCoordinates = function (granularity) {
                var geometry = GmMap3D.CircleOutlineGeometry.createGeometry(new GmMap3D.CircleOutlineGeometry({ ellipsoid: ellipsoid, center: this.getCenter(), radius: this.getRadius(), granularity: granularity }));
                var count = 0, value, values = [];
                for (; count < geometry.attributes.position.values.length; count += 3) {
                    value = geometry.attributes.position.values;
                    values.push(new GmMap3D.Cartesian3(value[count], value[count + 1], value[count + 2]));
                }
                return values;
            };

            _.CirclePrimitive.prototype.setEditable = function () {

                if (this.setEditMode) {
                    return;
                }

                var circle = this;
                var scene = drawHelper._scene;

                circle.asynchronous = false;

                drawHelper.registerEditableShape(circle);

                circle.setEditMode = function (editMode) {
                    // if no change
                    if (this._editMode == editMode) {
                        return;
                    }
                    drawHelper.disableAllHighlights();
                    // display markers
                    if (editMode) {
                        // make sure all other shapes are not in edit mode before starting the editing of this shape
                        drawHelper.setEdited(this);
                        var _self = this;
                        // create the markers and handlers for the editing
                        if (this._markers == null) {
                            //var markers = new _.BillboardGroup(drawHelper, dragBillboard);
                            function getMarkerPositions() {
                                return _self.getCircleCartesianCoordinates(GmMap3D.Math.PI_OVER_TWO);
                            }
                            function onEdited() {
                                circle.executeListeners({ name: 'onEdited', center: circle.getCenter(), radius: circle.getRadius() });
                            }
                            var handleMarkerChanges = {
                                dragHandlers: {
                                    onDrag: function (index, position) {
                                        circle.setRadius(GmMap3D.Cartesian3.distance(circle.getCenter(), position));
                                        markers.updateBillboardsPositions(getMarkerPositions());
                                    },
                                    onDragEnd: function (index, position) {
                                        onEdited();
                                    }
                                },
                                tooltip: function () {
                                    return "拖拽改变半径";
                                }
                            };
                            markers.addBillboards(getMarkerPositions(), handleMarkerChanges);
                            this._markers = markers;
                            // add a handler for clicking in the globe
                            this._globeClickhandler = new GmMap3D.ScreenSpaceEventHandler(scene.canvas);
                            this._globeClickhandler.setInputAction(
                                function (movement) {
                                    var pickedObject = scene.pick(movement.position);
                                    if (!(pickedObject && pickedObject.primitive)) {
                                        _self.setEditMode(false);
                                    }
                                }, GmMap3D.ScreenSpaceEventType.LEFT_CLICK);

                            // set on top of the polygon
                            markers.setOnTop();
                        }
                        this._editMode = true;
                    } else {
                        if (this._markers != null) {
                            this._markers.remove();
                            this._markers = null;
                            this._globeClickhandler.destroy();
                        }
                        this._editMode = false;
                    }
                }

                circle.setHighlighted = setHighlighted;

                enhanceWithListeners(circle);

                circle.setEditMode(false);
            }

        }

        function getExtent(mn, mx) {
            var e = new GmMap3D.Rectangle();

            // Re-order so west < east and south < north
            e.west = Math.min(mn.longitude, mx.longitude);
            e.east = Math.max(mn.longitude, mx.longitude);
            e.south = Math.min(mn.latitude, mx.latitude);
            e.north = Math.max(mn.latitude, mx.latitude);

            // Check for approx equal (shouldn't require abs due to re-order)
            var epsilon = GmMap3D.Math.EPSILON7;

            if ((e.east - e.west) < epsilon) {
                e.east += epsilon * 2.0;
            }

            if ((e.north - e.south) < epsilon) {
                e.north += epsilon * 2.0;
            }

            return e;
        };

        function getDisplayLatLngString(cartographic, precision) {
            //return cartographic.longitude.toFixed(precision || 3) + ", " + cartographic.latitude.toFixed(precision || 3);
            var longtitude = GmMap3D.Math.toDegrees(cartographic.longitude).toFixed(precision || 3);
            var latitude = GmMap3D.Math.toDegrees(cartographic.latitude).toFixed(precision || 3);
            return longtitude + ", " + latitude;
        }

        function clone(from, to) {
            if (from == null || typeof from != "object") return from;
            if (from.constructor != Object && from.constructor != Array) return from;
            if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
                from.constructor == String || from.constructor == Number || from.constructor == Boolean)
                return new from.constructor(from);

            to = to || new from.constructor();

            for (var name in from) {
                to[name] = typeof to[name] == "undefined" ? clone(from[name], null) : to[name];
            }

            return to;
        }

        function fillOptions(options, defaultOptions) {
            options = options || {};
            var option;
            for (option in defaultOptions) {
                if (options[option] === undefined) {
                    options[option] = clone(defaultOptions[option]);
                }
            }
        }

        // shallow copy
        function copyOptions(options, defaultOptions) {
            var newOptions = clone(options), option;
            for (option in defaultOptions) {
                if (newOptions[option] === undefined) {
                    newOptions[option] = clone(defaultOptions[option]);
                }
            }
            return newOptions;
        }

        function setListener(primitive, type, callback) {
            primitive[type] = callback;
        }

        function enhanceWithListeners(element) {

            element._listeners = {};

            element.addListener = function (name, callback) {
                this._listeners[name] = (this._listeners[name] || []);
                this._listeners[name].push(callback);
                return this._listeners[name].length;
            }

            element.executeListeners = function (event, defaultCallback) {
                if (this._listeners[event.name] && this._listeners[event.name].length > 0) {
                    var index = 0;
                    for (; index < this._listeners[event.name].length; index++) {
                        this._listeners[event.name][index](event);
                    }
                } else {
                    if (defaultCallback) {
                        defaultCallback(event);
                    }
                }
            }

        }

        return _;
    })();
    
    
    Map3DSDKLib.Input3DTool = Input3DTool;
    
    
    /** 
    * @exports Math as Map3DSDKLib.Math
    */
    Map3DSDKLib.Math = function()
    {
    }
    
    var EARTH_RADIUS = 6378137.0;    //单位M
    Map3DSDKLib.Math.Degree2Rad = function(d)
    {
        var PI = Math.PI;
        return d * PI / 180.0;
    }
   
    Map3DSDKLib.Math.CalcFlatDistance = function (lng1, lat1, lng2, lat2)
    {
        var f = Map3DSDKLib.Math.Degree2Rad((lat1 + lat2) / 2);
        var g = Map3DSDKLib.Math.Degree2Rad((lat1 - lat2) / 2);
        var l = Map3DSDKLib.Math.Degree2Rad((lng1 - lng2) / 2);
        var sg = Math.sin(g);
        var sl = Math.sin(l);
        var sf = Math.sin(f);
        var s, c, w, r, d, h1, h2;
        var a = EARTH_RADIUS;
        var fl = 1 / 298.257;
        sg = sg * sg;
        sl = sl * sl;
        sf = sf * sf;
        s = sg * (1 - sl) + (1 - sf) * sl;
        c = (1 - sg) * (1 - sl) + sf * sl;
        w = Math.atan(Math.sqrt(s / c));
        r = Math.sqrt(s * c) / w;
        d = 2 * w * a;
        h1 = (3 * r - 1) / 2 / c;
        h2 = (3 * r + 1) / 2 / s;
        return d * (1 + fl * (h1 * sf * (1 - sg) - h2 * (1 - sf) * sg));
    }
    
    //球面三角形面积
    Map3DSDKLib.Math.CalcTriAngleArea = function (lon1, lat1, lon2, lat2, lon3, lat3)
    {
        var a = Map3DSDKLib.Math.CalcFlatDistance(lon1, lat1, lon2, lat2);
        var b = Map3DSDKLib.Math.CalcFlatDistance(lon2, lat2, lon3, lat3);
        var c = Map3DSDKLib.Math.CalcFlatDistance(lon1, lat1, lon3, lat3);

        var p = (a + b + c) / 2;
        var S = Math.sqrt(p * (p - a) * (p - b) * (p - c));

        return S;
    }

    //计算多边形面积
    Map3DSDKLib.Math.CalcAnyPolyArea = function (polys,map3d)
    {
        var polys = simpleline(polys,map3d);
        var area = 0;
        for (var i = 1; i <= polys.length / 2 - 2; i++)
        {
            area += Map3DSDKLib.Math.CalcTriAngleArea(polys[2 * i - 2], polys[2 * i - 1],
                                    polys[2 * i], polys[2 * i + 1],
                                    polys[2 * i + 2], polys[2 * i + 3]);
        }
        return area;
    }

    function simpleline(inLine,map3d){
        var outline = [];
        if(inLine != undefined){
            for(var m = 0; m < inLine.length; m++){
                var coor = {x: inLine[m]['x'], y: inLine[m]['y'], z: inLine[m]['z']};
                var point = map3d.cartesianTo2MapCoord(coor);
                outline.push(point[0]);
                outline.push(point[1]);
            }
            return outline;
        }
    }
   
    
    /** 
    * @==========================================距离量算工具=======================================================
    */
    var toolMap            = {};
    function ClearTool()
    {
        for (var tool in toolMap)
        {
            toolMap[tool].End();
        }   
    }    
    
    var distanceTool       = 
    Map3DSDKLib.DistanceTool = function(divMap)
    {
        this.divMap    = divMap;
        this.Input3DTool = new Map3DSDKLib.Input3DTool(map);

        toolMap["dist"]= this;
    }
    
    distanceTool.prototype.GetMap = function()
    {
        return this.divMap;
    }
    
    distanceTool.prototype.ClearGeometry = function()
    {
        this.Input3DTool.ClearGeometry();
    }
        
    //添加提示
    var onlyTip = null;
    distanceTool.prototype.AddFlashTip = function(text, miniSeconds)
    {
        this.CloseFlashTip();
        if (onlyTip == null)
        {
            if (miniSeconds == null) miniSeconds = 3000;
            var cen = this.GetMap().GetViewCenter();
            if (cen == null)
            {
                this.CloseFlashTip();
                return ;
            }        
            toolMap["dist"].GetMap().AddTextLabel('only-tip', cen[0], cen[1], text);
            onlyTip = window.setInterval(this.CloseFlashTip, miniSeconds);
        }
    }

    distanceTool.prototype.CloseFlashTip  = function()
    {
        if (onlyTip != null)
        {   
            toolMap["dist"].GetMap().RemoveLabel('only-tip');
            window.clearInterval(onlyTip);
            onlyTip = null;        
        }
    }
    
            
    //距离量算
    function LineStartCallBack(e) 
    {
        toolMap["dist"].ClearGeometry();
      //toolMap["dist"].GetMap().RemoveLabel('distance-tip-start');
        toolMap["dist"].GetMap().RemoveLabel('distance-tip');
        
        if (e)
        {
            var st_ed = e.currentTarget.finishCoordinate_;
            toolMap["dist"].GetMap().AddTextLabel('distance-tip-start', st_ed[0], st_ed[1], "起点");            
        }
    }
    
     function LineEndCallBack(e)
     {
        
        var st_ed = e.feature.values_.geometry.extent_;
        var polys = e.feature.values_.geometry.flatCoordinates;
        var len   = polys.length;
        var length = 0.0;
        for (var i = 1; i < polys.length / 2; i++)
        {
          length += Map3DSDKLib.Math.CalcFlatDistance(polys[2 * i - 2], polys[2 * i - 1], polys[2 * i], polys[2 * i + 1])
        }
        length /= 1000.0;
        toolMap["dist"].GetMap().AddTextLabel('distance-tip', polys[len - 2], polys[len - 1], "总长:" + length.toFixed(2) + "公里");   
    }
    
    distanceTool.prototype.Start = function()
    {
        LineStartCallBack();
        this.AddFlashTip("距离提示：左击开始，双击左键结束!", 2000);
        this.Input3DTool.StartLineTool(LineStartCallBack, LineEndCallBack);
    }
    
     distanceTool.prototype.End = function()
     {
        this.Input3DTool.ClearAll();
        this.GetMap().RemoveLabel('distance-tip-start');
        this.GetMap().RemoveLabel('distance-tip');
     }
     Map3DSDKLib.DistanceTool = distanceTool;
     
     
    /** 
    * @==========================================面积量算工具=======================================================
    */
    var areaTool       = 
    Map3DSDKLib.AreaTool = function(divMap)
    {
        this.divMap    = divMap;
        this.Input3DTool = new Map3DSDKLib.Input3DTool(divMap);     
        toolMap["area"]= this;
    }
    
    
    areaTool.prototype.GetMap = function()
    {
        return this.divMap;
    }
    
    areaTool.prototype.ClearGeometry = function()
    {
        this.Input3DTool.ClearGeometry();
    }
        
    //添加提示
    var onlyTip = null;
    areaTool.prototype.AddFlashTip = function(text, miniSeconds)
    {
        this.CloseFlashTip();
        if (onlyTip == null)
        {
            if (miniSeconds == null) miniSeconds = 3000;
            var cen = this.GetMap().GetViewCenter();
            if (cen == null)
            {
                this.CloseFlashTip();
                return ;
            }        
            toolMap["area"].GetMap().AddTextLabel('only-tip', cen[0], cen[1], text);
            onlyTip = window.setInterval(this.CloseFlashTip, miniSeconds);
        }
    }

    areaTool.prototype.CloseFlashTip  = function()
    {
        if (onlyTip != null)
        {   
            toolMap["area"].GetMap().RemoveLabel('only-tip');
            window.clearInterval(onlyTip);
            onlyTip = null;        
        }
    }
    
    function PolyStartCallBack(e) 
    {
        toolMap["area"].ClearGeometry();
        toolMap["area"].GetMap().RemoveLabel('area-tip-start');
        toolMap["area"].GetMap().RemoveLabel('area-tip');
    }

    function PolyEndCallBack(e) 
    {
        var polys = e.feature.values_.geometry.flatCoordinates;
        var tooltipCoord = e.feature.values_.geometry.getInteriorPoint().getCoordinates();

        var len = polys.length - 2;
        var area = 0.0;
        for (var i = 1; i <= polys.length / 2 - 3; i++)
        {
            area += Map3DSDKLib.Math.CalcTriAngleArea(polys[2 * i - 2], polys[2 * i - 1],
                                     polys[2 * i], polys[2 * i + 1],
                                     polys[2 * i + 2], polys[2 * i + 3]);
        }
        var tip = "";
        if (area > 1000000)
        {
            area /= 1000000;
            tip = "总面积:" + area.toFixed(2) + "平方公里";
        }
        else
        {
            tip = "总面积:" + area.toFixed(2) + "平方米";
        }    
        toolMap["area"].GetMap().AddTextLabel('area-tip', tooltipCoord[0], tooltipCoord[1], tip);    
    }
    
    areaTool.prototype.Start = function()
    {
        PolyStartCallBack();
        this.AddFlashTip("距离提示：左击开始，双击左键结束!", 2000);
        this.Input3DTool.StartPolygonTool(PolyStartCallBack, PolyEndCallBack);
    }
    
    areaTool.prototype.End = function()
    {
       this.Input3DTool.ClearAll();
       this.GetMap().RemoveLabel('area-tip-start');
       this.GetMap().RemoveLabel('area-tip');
    }
    Map3DSDKLib.AreaTool = areaTool;   
    
})();

var ZMap3DLib = Map3DSDKLib;