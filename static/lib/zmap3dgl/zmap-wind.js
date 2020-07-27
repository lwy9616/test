;(function(){
  /**
   * 风场类
   * @param {Canvas} _canvas Cesium实例的canvas，可以通过scene或者viewer获取
   * @param {Viewer} _viewer viewer
   * @param {*} data 风暴场数据
   */
  function Wind(_canvas,_viewer,data,littleEndian){
    if(!_canvas || !_viewer || !data){
      throw new Error("请传入完整的参数")
    }
    this.data = data
    this._canvas = _canvas
    this._viewer = _viewer
    this.expand = 0.5 //扩大范围,如果为0.5的话 ，即上下左右扩大0.25,最终呈现的是1.5宽 1.5高的范围
    this._range = []
    this.listened = false //是否已经启用了相机移动监听（避免重复监听）
    this.littleEndian = littleEndian

    //primitive相关
    this._material = {},
    this._appearance
    this._geometry
    this._primitive
    
    this.imageCanvas
    this.inited = false
    //this.init()
  }

  Wind.prototype = {
    init:function(){
      if(this.inited){
        return
      }
      var _this = this
      this.imageCanvas = document.createElement('canvas');
      this.imageCanvas.width = this._canvas.width * (1+this.expand);
      this.imageCanvas.height = this._canvas.height * (1+this.expand);
      this.canvasDefaultSize = [this.imageCanvas.width,this.imageCanvas.height]
      var gl = this.imageCanvas.getContext('webgl', { antialiasing: false });
      var wind = new WindGL(gl);
      this.wind = wind

      //
      setTimeout(function(){  //延时 使地球先出来
        _this.listenCameraMove()
        _this._updateView()
        this.inited = true
      },2000)

      this._viewer.scene.postRender.addEventListener(function(){
        _this.render()
      })
      //
      this.readData(this.data,!!this.littleEndian);
    },
    get show(){
      return this._primitive.show
    },
    set show(val){
      this._primitive.show = !!val
      if(!!val){
        this._updateView(true)
      }
    },
    destory: function(){

    },
    /**
     * 渲染动画
     */
    render: function(){
     if (this.wind.windData1) {
       this.wind.draw();
     }
     var _material = this._material
     var canvas = this.imageCanvas;
     var tex = _material._textures && _material._textures.image;
     if (tex && tex.width == canvas.width && tex.height == canvas.height){
         tex.copyFrom(canvas);
     }
    },
    /**
     * 监听相机移动，和滚轮事件
     */
    listenCameraMove: function(){
      var _this = this
      if(!this.listened){
        this._viewer.scene.camera.moveEnd.addEventListener(function(){
           _this._updateView()
        });
        this.listened = true
        this.handler = new Cesium.ScreenSpaceEventHandler(this._canvas);
        var timer = Date.now()
        this.handler.setInputAction(function (e, e2) {
          if(Date.now() - timer < 50){
            return
          }else{
            _this._updateView(true)
            timer = Date.now()
          }

        }, Cesium.ScreenSpaceEventType.WHEEL);

      }

    },
    /**
     * 检测范围是否全部在最大视图范围内
     * @param {Array} range 
     */
    _pointAllIn: function(range){
      var wd = this.windData;
      var lonMax = Number(wd.lonMax);
      var lonMin = Number(wd.lonMin);
      var latMax = Number(wd.latMax);
      var latMin = Number(wd.latMin);

      //fixit 赤道和逆子午线附近可能会出问题
      var pointIn = function(lng,lat){
        return lng <= Math.max(lonMax,lonMin) &&
          lng >= Math.min(lonMax,lonMin) &&
          lat <= Math.max(latMax,latMin) &&
          lat >= Math.min(latMax,latMin)
      }
      return pointIn(range[0],range[1]) + 
        pointIn(range[0],range[3]) + 
        pointIn(range[2],range[1]) + 
        pointIn(range[2],range[3]) 
    },
    /**
     * 更新视图
     * @param {Boolean} refresh 是否强制刷新true表示强制刷新，默认是移动幅度较小的时候不刷新视图
     */
    _updateView:function(refresh){
      /// this.rangeIsAllOut 标识是否已经处于最大范围之外了
      var _this = this;
      var wd = this.windData;
      var range = _this.getRange(_this._canvas.width,_this._canvas.height,refresh)
      if(range === _this._range){  //没有更新
        return
      }
      var size = this._pointAllIn(range[1])
      if(JSON.stringify(range) === JSON.stringify([[-180,-90,180,90],[-180,-90,180,90]])){  // 全球视图范围
        range = _this._updateViewGloble()
      }else if(size === 4){   // 表示视图范围全在风场的最大的范围之内
        this._updateViewAllIn()
        this.rangeIsAllOut = false
        // console.info('all in')  
      }else if(size === 0){  // 表示视图范围全在风场的最大的范围之外
        if(this.rangeIsAllOut){
          return 
        }
        // console.info('all out')
        range = _this._updateViewGloble()
        this.rangeIsAllOut = true
      }else{  
        // console.info('out')
        range = this._updateViewIntersect(range[1])
        this.rangeIsAllOut = false
      }
      _this.updateCanvas(range)
      _this.showRectangle(range)
      _this._range = range

    },
    // 全球状态下的渲染
    _updateViewGloble: function(){
      var wd = this.windData,range = [];
      var _range = [Number(wd.lonMin),Number(wd.latMin),Number(wd.lonMax),Number(wd.latMax)]

      // var vmax = Math.max(this._canvas.width,this._canvas.height);
      // this.imageCanvas.width = vmax
      // this.imageCanvas.height = vmax / ((_range[2] - _range[0]) / (_range[3] - _range[1]))
      // this.wind.resize()
      if(_range[2] > 180){
        range[0] = [_range[0]-180,_range[1],_range[2]-180,_range[3]]
        range[1] = [_range[0]-180,_range[1],_range[2]-180,_range[3]]
      }else{
        range[0] = _range;
        range[1] = _range;
      }
      return range
    },
    /**
     * 风场最大范围内的渲染
     * @deprecated 
     */
    _updateViewAllIn: function(){
      // this.imageCanvas.width = this.canvasDefaultSize[0]
      // this.imageCanvas.height = this.canvasDefaultSize[1]
    },
    /**
     * 风场视图相交
     * @see https://blog.csdn.net/Dylan_Frank/article/details/80382063
     */
    _updateViewIntersect: function(r1){
      var wd = this.windData;
      var r2 = [Number(wd.lonMin),Number(wd.latMin),Number(wd.lonMax),Number(wd.latMax)];
      var range = []
      var minx = Math.max(r1[0],r2[0]),
        miny = Math.max(r1[1],r2[1]),
        maxx = Math.min(r1[2],r2[2]),
        maxy = Math.min(r1[3],r2[3]);
      var _range = [minx,miny,maxx,maxy]
      if(_range[2] > 180){
        range[0] = [_range[0]-180,_range[1],_range[2]-180,_range[3]]
        range[1] = [_range[0]-180,_range[1],_range[2]-180,_range[3]]
      }else{
        range[0] = _range;
        range[1] = _range;
      }
      return range
    },
    /**
     * 显示代理的集合体（即动画）
     * @param {Arrar} range 范围，请使用 getRange的返回值
     * @see getRange
     */
    showRectangle: function(range){
      if(!range) return
      if(this._primitive && this._primitive.show === false){
        return
      }
      var _canvas = this._canvas,_viewer = this._viewer,_primitive = this._primitive
      if(this._geometry){   //更新
        this._geometry = new Cesium.RectangleGeometry({
           // rectangle : Cesium.Rectangle.fromDegrees(105.5,21.0,115.5,31.0),
             rectangle : Cesium.Rectangle.fromDegrees.apply(this,range[0]),
             vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
         });
         this._viewer.scene.primitives.remove(this._primitive)
         this._primitive = this._viewer.scene.primitives.add(new Cesium.Primitive({
             geometryInstances : new Cesium.GeometryInstance({
                 geometry : Cesium.RectangleGeometry.createGeometry(this._geometry),
                 id:Date.now()
             }),
             appearance : this._appearance,
             asynchronous:false,
             show : true
         }));
         return
      }

      this._material = new Cesium.Material({
          fabric : {
              type : 'Image',
              uniforms : {
                  image: this.imageCanvas,
              }
          }
      });

      this._appearance = new Cesium.EllipsoidSurfaceAppearance({
          // aboveGround : true,
          faceForward : false,
          flat:true,
          material : this._material,
          renderState: {
              fog: { enabled : true, density: 0.01}
          }
      });

     this._geometry = new Cesium.RectangleGeometry({
        // rectangle : Cesium.Rectangle.fromDegrees(105.5,21.0,115.5,31.0),
          rectangle : Cesium.Rectangle.fromDegrees.apply(this,range[0]),
          vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
      });

      ///
      this._primitive = this._viewer.scene.primitives.add(new Cesium.Primitive({
          geometryInstances : new Cesium.GeometryInstance({
              geometry : Cesium.RectangleGeometry.createGeometry(this._geometry),
              id:Date.now()
          }),
          appearance : this._appearance,
          asynchronous:false,
          show : true
      }));
      this.listenCameraMove()
    },
    /**
     * 更新canvas里面的动画(此canvas并不是传递进来的canvas，而是init方法里面创建的 供webgl运行的canvas)
     * @param {Array} extent 范围，请使用 getRange的返回值
     * @see getRange
     * @see init
     */
    updateCanvas: function (extent) {

        if (this.wind && this._range !== extent) { //!(表示移动范围很小，并没有出界，所以使用原始的范围)
          this.wind.resize();
          this.wind.resetWind(extent[1]);
          this._range = extent
        }
    },
    /**
     * 根据屏幕宽高获取坐标范围
     * @param {Number} x 屏幕的宽度
     * @param {Number} y 屏幕的高度
     * @param {Boolean} refresh 是否强制更新范围，true表示强制更新
     */
    getRange: function(x,y,refresh){
      var _viewer = this._viewer
      var pt1 = new Cesium.Cartesian2(0,y);   //左下
      var pt2= new Cesium.Cartesian2(x,0);  //右上
      var pick1= this._viewer.scene.globe.pick(_viewer.camera.getPickRay(pt1), _viewer.scene);
      var pick2= this._viewer.scene.globe.pick(_viewer.camera.getPickRay(pt2), _viewer.scene);
      if(!pick1 || !pick2){   //表示没有选取到点，（选到宇宙上面了）
        var arr = [[-180,-90,180,90],[-180,-90,180,90]]
        if(JSON.stringify(arr) === JSON.stringify(this._range)){
          return this._range
        }else{
          return arr
        }
      }
      //将三维坐标转成地理坐标
      var geoPt1= _viewer.scene.globe.ellipsoid.cartesianToCartographic(pick1);
      var geoPt2= _viewer.scene.globe.ellipsoid.cartesianToCartographic(pick2);

      //地理坐标转换为经纬度坐标
      var point1=[geoPt1.longitude / Math.PI * 180,geoPt1.latitude / Math.PI * 180];
      var point2=[geoPt2.longitude / Math.PI * 180,geoPt2.latitude / Math.PI * 180];

      if(this._range.length>0 && !refresh){  //新的范围完全在旧的范围之内，直接使用原始的范围，或者使用强制刷新
        var range = this._range[0]
        //TODO 更加完善的范围比较
        if(point1[0]>range[0] && point1[1]>range[1] && point2[0]<range[2] && point2[1]<range[3]){ //
          return this._range
        }
      }
      var diff_lng = (point2[0] - point1[0]) * this.expand / 2
      var diff_lat = (point2[1] - point1[1]) * this.expand / 2
      if(point2[0] < 0 && point1[0] > 0){ //表示经度范围跨域180和-180
        diff_lng = (180-point1[0]) + (point2[0]+180)
      }
      //纬度保持在[-90,90],经度在超过180之后，跨度改变
      var _0 = (point1[0]-diff_lng+180)%360-180,
          _1 = Math.max(Math.min(point1[1]-diff_lat,90),-90),
          _2 = (point2[0]+diff_lng+180)%360-180,
          _3 = Math.max(Math.min(point2[1]+diff_lat,90),-90),
          _4 = 0,
          _5 = 0
      if(_0 < -180){
        _0 = _0+360
      }
      if(_0 > 0 && _2 < 0){ // -180 | 180 边界线附近
        _4 = _0
        _5 = _2 + 360
      }else{        // 0度边界线附近
        _4 = _0
        _5 = _2
      }
      //[-180~180,-90~90],[0~360,-90~90]
      
      //return [[_0,_1,_2,_3],[_4,_1,_5,_3]]
      // 这里的min max方法是避免因为三维地球旋转的时候 变成反向，第二个点比第一个点小的情况下报错的问题
      return [[Math.min(_0,_2),Math.min(_1,_3),Math.max(_0,_2),Math.max(_1,_3)],
            [Math.min(_4,_5),Math.min(_1,_3),Math.max(_4,_5),Math.max(_1,_3)]]
    },
    /**
     * 更新风暴场数据
     * @param {*} data 风暴场数据
     * @param {Boolean} littleEndian 是否小端字序（二进制数据是使用）
     */
    updateData:function(data,littleEndian){
        this.data = data
        this.readData(data,littleEndian)
    },
    /**
     * 读取风暴场数据
     * @param {*} data 风暴场数据
     * @param {Boolean} littleEndian 是否小端字序（二进制数据是使用）
     */
    readData: function(data,littleEndian) {
        var windData = new Object();
        var data1;
        if(data instanceof Uint8Array){
          data1 = data//new Uint8Array(data.field);
          if(littleEndian === undefined) littleEndian = true //后台x86系统服务过来的数据 ，默认使用小端字序
        }else{
          data1 = new Uint8Array(data.field);
        }
        var data2 = new Uint8Array(data.length || data.field.length);
        data2.set(data1.subarray(0, (data.length || data.field.length) - 1), 0);
        var rawData = new DataView(data2.buffer);
        var attribute = new Float32Array(8);
        for (var i = 0; i < attribute.length; i++) {
            attribute[i] = rawData.getFloat32(i * 4,!!littleEndian);
        }
        windData.latMin = attribute[0];
        windData.latMax = attribute[1];
        windData.lonMin = attribute[2];
        windData.lonMax = attribute[3];
        windData.uMax = attribute[4];
        windData.vMax = attribute[5];
        windData.uMin = attribute[6];
        windData.vMin = attribute[7];
        windData.width = rawData.getInt32(8 * 4,!!littleEndian);
        windData.height = rawData.getInt32(9 * 4,!!littleEndian);
        // windData.width = 256;
        // windData.height = 256;
        this.windData = windData;

        var uvData = new Int8Array(rawData.byteLength - 40);
        for (var j = 0; j < uvData.length; j += 2) {
            uvData[j] = Math.floor(256 * (rawData.getInt8(j + 40) - windData.uMin) / (windData.uMax - windData.uMin));
            uvData[j + 1] = Math.floor(256 * (rawData.getInt8(j + 41) - windData.vMin) / (windData.vMax - windData.vMin));
        }
        // var data = new Int8Array(data).slice(40);

        windData.data = new Uint8Array(uvData.byteLength * 2);
        for (var j = 0; j < uvData.byteLength; j += 2) {
            windData.data[j * 2] = uvData[j];
            windData.data[j * 2 + 1] = uvData[j + 1];
        }
        this.wind.setWind(windData, this._range[1]);
    },

    /**
     * 更新场中的粒子属性（具体可配置属性查看控制插件上面的属性）
     * @param {String} key 属性
     * @param {String | Number} value 属性值
     */
    updateProp: function(key,value){
      this.wind[key] = value
      return this
    }
  }

  //Wind.prototype = prop
  window.Wind = Wind
})()
