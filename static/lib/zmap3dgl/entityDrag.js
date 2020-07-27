/**
 * 实体拖拽工具
 * @author flake
 */
;(function($){
    var Tool = function (GmMap3D,map3DView,opt) {
        if(GmMap3D && map3DView){
            this.GmMap3D = GmMap3D
            this.map3DView = map3DView;
            this.viewer = map3DView.cesium.viewer;
            this.inited = true;
            this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);//注册工具类
            this.axisLength = opt && opt.length || 300
        }else {
            this.inited = false;
        }
        this.lines = []		//所有高程测量的线和点,
        this.points = []		//正在编辑的点,
        this.polygons = []	//所有面积测量的面,
        this.polylines = []	//所有面积测量的范围线
        this.labels = []		//所有面积的label标签,
        this.lineLabels = []		//所有线段的label标签,
        this.editing = false	//是否测量中（用来控制两点测量的初始化）
        this.leftDownFlag = false
        this.pointDraged = null
        this.opt = {}

    }
    Tool.prototype = {
        msg:{
            typeError:'请传入实体类型',
        },
        /**
         * 工具初始化（初始化之后才能使用）
         * @param {Object} GmMap3D Cesium实例
         * @param {Object} viewer Viewer实例
         * @param {Node} toolbar 一个DOM节点  用于界面的展示，自定义展示界面可以为空
         */
        init:function(GmMap3D,map3DView,opt){
            if(!this.inited){
                this.GmMap3D = GmMap3D
                this.map3DView = map3DView;
                this.viewer = map3DView.cesium.viewer;
                this.inited = true;
                this.map3DTool = new ZMap3DLib.Input3DTool(map3DView);//注册工具类
                this.axisLength = opt && opt.length || 300
                //this.setListener()
            }
            return this
        },
        /**
         * 编辑实体
         * @param entity 实体对象
         * @param opt 参数
         *  opt{
         *      step:实时回调,
         *      done:完成时的回调
         *  }
         */
        adjustEntity:function(entity,opt){
            if(this.entityType(entity) === 'Entity'){
                if(opt) this.opt = opt
                if(entity.polyline){
                    this.adjustPolyline(entity,opt)
                }else if (entity.point){
                    this.adjustPoint(entity,opt)
                }
            }else{
                throw new Error(this.msg.typeError)
            }
        },
        /**
         * 调整点位
         */
        adjustPoint:function(entity){

            entity.point.color = GmMap3D.Color.YELLOW
            var frame = this.setReferenceFrame(entity)
            var _this = this
            this.viewer.screenSpaceEventHandler.setInputAction(function(e,e2) {
                _this.pointDraged = _this.viewer.scene.pick(e.position);//选取当前的entity
                _this.leftDownFlag = true;
                if (_this.pointDraged) {
                    _this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_DOWN);
            this.viewer.screenSpaceEventHandler.setInputAction(function(e) {
                _this.leftDownFlag = false;
                _this.pointDraged = null;
                _this.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
            }, GmMap3D.ScreenSpaceEventType.LEFT_UP);
            this.viewer.screenSpaceEventHandler.setInputAction(function(e) {
                if (_this.leftDownFlag === true && _this.pointDraged != null) {
                    var ray = _this.viewer.camera.getPickRay(e.endPosition);
                    var cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
                    entity.position=new Cesium.ConstantPositionProperty(cartesian);
                    var transform = _this.GmMap3D.Transforms.eastNorthUpToFixedFrame(cartesian);
                    frame.modelMatrix = transform

                }
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);
        },
        /**
         * 调整Polyline点位
         */
        adjustPolyline:function(entity){
            var old_time = Date.now()
            var interval = 20   //节流阈值
            var polyline = entity.polyline
            var points = polyline.positions._value
            this.pts = points
            this.polyline = polyline
            var arrowsArr = []
            this.arrowsArr = arrowsArr
            points.forEach(function (point,index) {
                var e = this.addEntityPoint(point);
                arrows = this.setReferenceFrame(point,e)
                arrowsArr.push(arrows)

            }, this)
            polyline.positions = new GmMap3D.CallbackProperty(function () {
                return points.map(function (point) {
                    return new GmMap3D.Cartesian3(point.x, point.y, point.z)
                })
            }, false);
            var _this = this
            this.control = new GmMap3D.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            var handler = this.control
            handler.setInputAction(function (e, e2) {

                _this.moving = true
                _this.pointDraged = _this.viewer.scene.pick(e.position);//选取当前的entity
                _this.leftDownFlag = true;
                if (_this.pointDraged) {
                    var type = _this.pointDraged.id.type
                    if(type)
                        _this.viewer.scene.screenSpaceCameraController.enableRotate = false;//锁定相机
                }
            }, GmMap3D.ScreenSpaceEventType.LEFT_DOWN);

            handler.setInputAction(function (e) {
                _this.moving = false
                if (!_this.pointDraged) return
                var ray = _this.viewer.camera.getPickRay(e.position);
                var cartesian = _this.viewer.scene.globe.pick(ray, _this.viewer.scene);
                var id = (_this.pointDraged.id && _this.pointDraged.id.belong) || (_this.pointDraged.id && _this.pointDraged.id.id)
                if (id) {
                    var index = _this.getEntityIndex(id)
                    var entity = _this.getEntityPoint(id)
                    if (entity) {
                        var point = entity.position._value
                        points[index] = point
                        arrowsArr[index].forEach(function (arrow) {
                            arrow.polyline.positions = [point, _this.rotate(point, arrow.opt)]
                        })
                    }
                }
                _this.leftDownFlag = false;
                _this.pointDraged = null;
                _this.viewer.scene.screenSpaceCameraController.enableRotate = true;//解锁相机
            }, GmMap3D.ScreenSpaceEventType.LEFT_UP);

            handler.setInputAction(function (e) {
                if (Date.now() - old_time < interval) return
                _this.hoverHandler(e)
                if (_this.leftDownFlag === true && _this.pointDraged != null) {

                    var type = _this.pointDraged.id.type
                    if(!type) return;
                    //拾取的是否是坐标轴
                    var axis = type === 'axis'

                    var ray = _this.viewer.camera.getPickRay(e.endPosition);

                    var index = _this.getEntityIndex(axis ? _this.pointDraged.id.belong : _this.pointDraged.id.id)
                    var entity = axis ? _this.getEntityPoint(_this.pointDraged.id.belong) : _this.pointDraged.id

                    var intersectPoint = _this.getPlaneIntersect(entity.position._value,ray)

                    var oldp = _this._cartographic(points[index])
                    var c3 = _this.getAxisCarsian(_this.pointDraged.id, oldp,intersectPoint,!axis)
                    points[index] = c3
                    entity.position = new GmMap3D.ConstantPositionProperty(c3)
                    if (typeof _this.opt.step === 'function') _this.opt.step({
                        points: points
                    })
                    polyline._createPrimitive = true

                }
                old_time = Date.now()
            }, GmMap3D.ScreenSpaceEventType.MOUSE_MOVE);
        },
        /**
         * 鼠标移入处理 </br>
         * 同一个位置建立两套颜色不同的参考系，通过控制显示与隐藏来实现变色的效果
         * @param e
         */
        hoverHandler:function(e){

            var ray = this.viewer.camera.getPickRay(e.endPosition);
            var entity = this.viewer.scene.pick(e.endPosition);   //选取当前的entity
            if(this.moving || (entity && this.colorEqual(entity.id.color,Cesium.Color.YELLOW))){
                return
            }
            if(entity && entity.id.fake){
                return
            }
            this.arrowsArr.forEach(function (arrows) {
                arrows.forEach(function (arrow) {

                    if(!arrow.fake){
                        arrow.show = true
                    }else{
                        arrow.show = false
                    }
                })
            })
            if(entity && entity.id.type === 'axis'){

                var en = entity.id
                en.show = false
                en.shado.show = true
            }
        },
        colorEqual:function(color1,color2){
            return color1 && color2 && color1.alpha === color2.alpha && color1.red === color2.red && color1.green === color2.green && color1.blue === color2.blue
        },
        /**
         * 获取坐标轴（或者xOy面）上的位置
         * @param entity 实体
         * @param oldp 原始点
         * @param newp 新点
         * @returns {*}
         */
        getAxisCarsian:function(entity,oldp,intersectPoint,plane){

            if(plane){
                var newpoint = intersectPoint['xOy']
                return Cesium.Cartesian3.fromDegrees(newpoint.lng,newpoint.lat,newpoint.hei)
            }
            switch (entity.typename) {
                case 'east':
                    var newpoint = intersectPoint['xOz']
                    return Cesium.Cartesian3.fromDegrees(newpoint.lng,oldp.lat,oldp.hei)
                case 'north':
                    var newpoint = intersectPoint['yOz']
                    return Cesium.Cartesian3.fromDegrees(oldp.lng,newpoint.lat,oldp.hei)
                case 'up':
                    var newpoint = intersectPoint[this.viewerPlane()]
                    return Cesium.Cartesian3.fromDegrees(oldp.lng,oldp.lat,newpoint.hei)
            }
        },
        viewerPlane:function(){
            var camera = this.viewer.scene.camera
            //135°~315°使用 xOz面
            return camera.heading > 0.75*Math.PI && camera.heading < 1.75*Math.PI ?  'xOz' : 'yOz'
        },
        /**
         * 添加实体点
         * @param pos
         * @returns {Entity}
         */
        addEntityPoint:function(pos){
            var point = this.viewer.entities.add({
                position:pos,
                point: {
                    color:this.GmMap3D.Color.RED,
                    pixelSize:15
                }
            })
            point.type = 'axis-point'
            this.points.push(point)
            return point
        },
        /**
         * 获取平面相交点
         * @param redPoint 参考系原点（红点）
         * @param ray 垂直屏幕的光线
         * @return {
         *     'xOy':c3,
         *     'xOz':c3,
         *     'yOz':c3,
         * }
         */
        getPlaneIntersect:function(redPoint,ray){
            var point = redPoint
            var camera = this.viewer.camera
            var planes = [{
                name:"xOz",
                PHR:{
                    heading:90,
                    pitch:0
                }
            },{
                name:"yOz",
                PHR:{
                    heading:0,
                    pitch:0
                }
            },{
                name:"xOy",
                PHR:{
                    heading:0,
                    pitch:90
                }
            }]

            var result = {}

            var tmp = new Cesium.Cartesian3(0,0,0)
            planes.forEach(function (plane) {
                var next = this.rotate(point,plane.PHR)
                var sub = Cesium.Cartesian3.subtract(next,point,tmp)
                var normal = Cesium.Cartesian3.normalize(sub,tmp)
                var oOo = Cesium.Plane.fromPointNormal(point,normal) //Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(next,point))
                var po = Cesium.IntersectionTests.rayPlane(ray, oOo)

                //未产生交点的时候 使用红点
                result[plane.name] = this._cartographic(po || redPoint)

            },this)

            return result
        },
        /**
         * 根据id获取实体点
         * @param id
         * @returns {*}
         */
        getEntityPoint:function(id){
            var target
            this.points.forEach(function (point) {
                if(point.id === id) {
                    target = point
                }
            })
            return target
        },
        /**
         * 根据id获取实体
         * @param id
         * @returns {*}
         */
        getEntityIndex:function(id){
            var target
            this.points.forEach(function (point,index) {
                if(point.id === id) {
                    target = index
                }
            })
            return target
        },
        /**
         * 获取自定义对象类型
         */
        entityType:function(obj){
            return obj.constructor.name;
        },
        /**
         * 设置三维坐标参考框架（）
         * ^
         * |    ^
         * |   /
         * |  /
         * | /
         * |------------>
         * @param {Cartesian3} center 框架中心点位置
         */
        setReferenceFrame: function(point,e) {
            var center = point
            var degress = this._cartographic(center)
            var size = this.axisLength
            this.viewer.camera.flyTo({
                destination:Cesium.Cartesian3.fromDegrees(degress.lng,degress.lat,degress.hei+size*2),
            })
            var colorAxis = [{
                name:'east',
                color: new Cesium.Color(1,0,0,1),
                opt:{
                    heading:0,
                    pitch:0
                }
            },{
                name:'north',
                color: new Cesium.Color(0,1,0,1),
                opt:{
                    heading:-90,
                    pitch:0
                }
            },{
                name:'up',
                color: new Cesium.Color(0,0,1,1),
                opt:{
                    heading:0,
                    pitch:90
                }
            }]
            var arrows = []
            colorAxis.forEach(function (axis) {
                var arrow = this.viewer.entities.add({
                    polyline: {
                        show: true,
                        positions: [point,this.rotate(point,axis.opt)],
                        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.clone(axis.color)),
                        followSurface: false,
                        width : 20
                    }
                })
                arrow.opt = axis.opt
                arrow.color = Cesium.Color.clone(axis.color)
                arrow.type = 'axis'
                arrow.fake = false
                arrow.belong = e.id
                arrow.typename = axis.name
                //fake poltline(the yellow line)
                var arrow2 = this.viewer.entities.add({
                    polyline: {
                        show: true,
                        positions: [point,this.rotate(point,axis.opt)],
                        material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.YELLOW),
                        followSurface: false,
                        width : 20
                    }
                })
                arrow2.opt = axis.opt
                arrow2.color = Cesium.Color.clone(axis.color)
                arrow2.type = 'axis'
                arrow2.fake = true
                arrow2.belong = e.id
                arrow2.typename = axis.name

                arrow.shado = arrow2
                arrow2.shado = arrow
                arrows.push(arrow)
                arrows.push(arrow2)

            },this)
            return arrows;

        },
        /**
         * 获取旋转后的的坐标
         *
         *     -----
         *   /       \
         * |          \
         * |    ·------|
         * \          /
         *  ----------
         *
         * @param base 原点
         * @param opt heading and pitch (控制旋转的角度)
         * @return {Cartesian3} c3
         */
        rotate:function(base,opt){
            var viewer = this.viewer;
            var B = base;
            var X = opt.heading
            var Y = opt.pitch
            var heading = GmMap3D.Math.toRadians(X);
            var pitch = GmMap3D.Math.toRadians(Y);
            var headingPitchRoll = new GmMap3D.HeadingPitchRoll(heading,pitch,0);

            var m = GmMap3D.Transforms.headingPitchRollToFixedFrame(B, headingPitchRoll, GmMap3D.Ellipsoid.WGS84, GmMap3D.Transforms.eastNorthUpToFixedFrame, new GmMap3D.Matrix4());

            var A1 = new GmMap3D.Cartesian3(this.axisLength,0, 0);
            return GmMap3D.Matrix4.multiplyByPoint(m, A1, new GmMap3D.Cartesian3());

        },
        /**
         * 结束所有事件监听
         */
        end: function(){
            this.map3DTool.ClearAll();
        },
        /**
         * 笛卡尔三维转经纬度高度
         * @param {Object} pos 笛卡尔坐标
         * @return {Object} 经纬度高度对象
         */
        _cartographic:function(pos){
            var ellipsoid=this.viewer.scene.globe.ellipsoid;
            var cartographic=ellipsoid.cartesianToCartographic(pos);
            var lat=Cesium.Math.toDegrees(cartographic.latitude);
            var lng=Cesium.Math.toDegrees(cartographic.longitude);
            var hei=cartographic.height;
            return {
                lat:lat,
                lng:lng,
                hei:hei,
            }
        },
        destroy:function () {
            this.control = this.control && this.control.destroy()
            this.polyline.positions = this.pts.map(function (point) {
                return new GmMap3D.Cartesian3(point.x,point.y,point.z)
            })
            var collection = this.viewer.entities
            this.points.forEach(function (point) {
                collection.remove(point)
            })
            this.arrowsArr.forEach(function (arrows) {
                arrows.forEach(function (arrow) {
                    collection.remove(arrow)
                })
            })
            this.points = []
            this.arrowsArr = []
            this.pts = []
            if(typeof this.opt.done === 'function') this.opt.done()
        }
    }
    window.dragTool = new Tool();
    window.dragToolPrototype = Tool;
})(jQuery);