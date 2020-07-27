var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 转换工具<br>
     * 一些简单的转换工具<br>
     * 只依赖核心的Cesium对象
     * @author flake
     */
    class ConvertTool {
        /**
         * 获取一个经纬度坐标【弧度制】
         * @param cartesian c3坐标
         * @return {Cartographic}
         */
        static c3ToCartographic(cartesian) {
            return Cesium.Cartographic.fromCartesian(cartesian);
        }
        /**
         * 获取一个经纬度坐标【度】
         * @param cartesian c3坐标
         * @return {Object}
         */
        static c3ToCartographicDegrees(cartesian) {
            let cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            return this.cartographic2CartographicDegrees(cartographic);
        }
        /**
         * 经纬度坐标 弧度转度
         * @param cartographic 经纬度坐标【弧度制】
         * @return {{longitude: Number, latitude: Number, height: Number}}
         */
        static cartographic2CartographicDegrees(cartographic) {
            return ZMapVolume.LongLatHeight.formCartographic(cartographic);
        }
        /**
         * 得到一个c3坐标
         * @param cartographic 度类型的经度纬度高度
         * @return {Cartesian3}
         */
        static c3ByDegrees(cartographic, result) {
            return cartographic.toCartesian3(result);
        }
        /**
         * 得到一个c3坐标
         * @param cartographic 弧度类型的经度纬度高度
         * @return {Cartesian3}
         */
        static c3ByRadians(cartographic) {
            return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        }
        /**
         * 根据经纬度高度数组拿到c3数组
         * @param arr like[lng,lat,height,lng,lat,height,...]
         * @returns {Array}.Cartesian3
         */
        static fromDegreesArrayWithHeight(arr) {
            const c3 = [];
            for (let i = 0; i < arr.length; i += 3) {
                c3.push(Cesium.Cartesian3.fromDegrees(arr[i], arr[i + 1], arr[i + 2]));
            }
            ///
            return c3;
        }
        /**
         * 弧度转度
         * @param radians 弧度
         * @return {Number}
         */
        static radians2Degrees(radians) {
            return Cesium.Math.toDegrees(radians);
        }
        /**
         * 度转弧度
         * @param degrees 度
         * @return {Number}
         */
        static degrees2Radians(degrees) {
            return Cesium.Math.toRadians(degrees);
        }
        /**
         * 经纬度相加
         * @param left
         * @param right
         * @return {{longitude: Number, latitude: Number, height: Number}}
         */
        static cartographicAdd(left, right) {
            return new ZMapVolume.LongLatHeight(left.longitude + right.longitude, left.latitude + right.latitude, Math.max(left.height, right.height));
        }
        /**
         * 扩容
         * @param left 左边点
         * @param right 右边点
         * @param size 目标点个数
         * @returns {Array} [lng,lat,height,lng,lat,height,...]
         */
        static expansion(left, right, size) {
            let xStep = (right[0] - left[0]) / size, yStep = (right[1] - left[1]) / size, zStep = (right[2] - left[2]) / size, arr = [];
            for (let i = 0; i < size; i++) {
                if (i === size - 1) { //避免计算误差
                    arr.push(...right);
                }
                else {
                    arr.push(left[0] + xStep * i, left[1] + yStep * i, left[2] + zStep * i);
                }
            }
            return arr;
        }
        /**
         * 扩容
         * @param left{Cartesian3} 左边点
         * @param right{Cartesian3} 右边点
         * @param size 目标点个数
         * @returns {Array}
         */
        static expansionC3(p1, p2, size) {
            let cartographic1 = Cesium.Cartographic.fromCartesian(p1), cartographic2 = Cesium.Cartographic.fromCartesian(p2), left = [Cesium.Math.toDegrees(cartographic1.longitude), Cesium.Math.toDegrees(cartographic1.latitude), cartographic1.height], right = [Cesium.Math.toDegrees(cartographic2.longitude), Cesium.Math.toDegrees(cartographic2.latitude), cartographic2.height];
            return Cesium.Cartesian3.fromDegreesArrayHeights(ConvertTool.expansion(left, right, size));
        }
        /**
         * 计算合并，返回一个最大值的经纬度高度对象
         * @return {{longitude: *, latitude: *, height: *}}
         */
        static mergeMax(...args) {
            let longitude = args[0].longitude, latitude = args[0].latitude, height = args[0].height;
            for (let i = 0, length = args.length; i < length; i++) {
                longitude = Math.max(longitude, args[i].longitude);
                latitude = Math.max(latitude, args[i].latitude);
                height = Math.max(height, args[i].height);
            }
            ///
            return new ZMapVolume.LongLatHeight(longitude, latitude, height);
        }
        /**
         * 计算合并，返回一个最小值的经纬度高度对象
         * @return {{longitude: *, latitude: *, height: *}}
         */
        static mergeMin(...args) {
            let longitude = args[0].longitude, latitude = args[0].latitude, height = args[0].height;
            for (let i = 0, length = args.length; i < length; i++) {
                longitude = Math.min(longitude, args[i].longitude);
                latitude = Math.min(latitude, args[i].latitude);
                height = Math.min(height, args[i].height);
            }
            ///
            return new ZMapVolume.LongLatHeight(longitude, latitude, height);
        }
        /**
         * 点面距离计算
         * planePoint1位于面上，planePoint2与planePoint1构成法线
         * 如果距离为正，则该点位于法线方向的半空间中; 如果为负，则该点位于与法线相反的半空间中; 如果为零，点在面上
         * @param planePoint1
         * @param planePoint2
         * @param point
         * @return {*}
         */
        static pointPlaneInstance(planePoint1, planePoint2, point) {
            let sub = Cesium.Cartesian3.subtract(planePoint2, planePoint1, new Cesium.Cartesian3(0, 0, 0));
            let normal = Cesium.Cartesian3.normalize(sub, new Cesium.Cartesian3(0, 0, 0));
            let plane = Cesium.Plane.fromPointNormal(planePoint1, normal);
            return Cesium.Plane.getPointDistance(plane, point);
        }
    }
    ZMapVolume.ConvertTool = ConvertTool;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 使用经纬度表示的空间范围
     */
    class LongLatBox {
        constructor(xmin, ymin, zmin, xmax, ymax, zmax) {
            this.xmin = xmin;
            this.ymin = ymin;
            this.zmin = zmin;
            this.xmax = xmax;
            this.ymax = ymax;
            this.zmax = zmax;
            /// 
            this.center = [(xmax + xmin) / 2, (ymax + ymin) / 2, (zmax + zmin) / 2];
            this.size = [xmax - xmin, ymax - ymin, zmax - zmin];
            /// 
            this.from = new ZMapVolume.LongLatHeight(xmin, ymin, zmin);
            this.to = new ZMapVolume.LongLatHeight(xmax, ymax, zmax);
        }
        static fromStartEnd(from, to) {
            return new LongLatBox(from.longitude, from.latitude, from.height, to.longitude, to.latitude, to.height);
        }
        static fromStartEndArray(from, to) {
            return new LongLatBox(from[0], from[1], from[2], to[0], to[1], to[2]);
        }
    }
    ZMapVolume.LongLatBox = LongLatBox;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 使用经纬度表示的坐标点，数据单位为‘度’
     */
    class LongLatHeight {
        constructor(lon, lat, height) {
            this.longitude = lon;
            this.latitude = lat;
            this.height = height;
        }
        toCartographic(result) {
            return Cesium.Cartographic.fromDegrees(this.longitude, this.latitude, this.height);
        }
        toCartesian3(result) {
            return Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height);
        }
        static fromDegrees(lon, lat, height) {
            return new LongLatHeight(lon, lat, height);
        }
        static fromRadians(lon, lat, height) {
            return new LongLatHeight(Cesium.Math.toDegrees(lon), Cesium.Math.toDegrees(lat), height);
        }
        /// 
        static formCartographic(cart) {
            return this.fromRadians(cart.longitude, cart.latitude, cart.height);
        }
        static fromCartesian3(cart) {
            const llh = new LongLatHeight();
            Cesium.Cartographic.fromCartesian(cart, undefined, llh);
            llh.longitude = Cesium.Math.toDegrees(llh.longitude);
            llh.latitude = Cesium.Math.toDegrees(llh.latitude);
            return llh;
        }
    }
    ZMapVolume.LongLatHeight = LongLatHeight;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /// 着色器
    ZMapVolume.Shaders = {
        vertexShader: '',
        fragmentShader: '',
        materialShader: ''
    };
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /**
     *
     * @interface 交互工具必须实现此接口
     * @see GridLine
     * @see SliceTool
     * @see RectPlane
     * @see MapVolume
     */
    class VolumeBiningable {
        constructor(map3dView) {
            this._show = true;
            ///
            this._viewer = map3dView.cesium.viewer;
            this._scene = map3dView.cesium.scene;
            /// 
            this._entityTool = new ZMapVolume.EntityTool(this._viewer);
            /// 
            this._box = new ZMapVolume.LongLatBox(0, 0, 0, 0.01, 0.01, 1110);
        }
        ///
        binding(vol) {
            this._vol = vol;
        }
        /// 
        get show() { return this._show; }
        set show(show) { this._show = show; this.onShowChanged(show); }
    }
    ZMapVolume.VolumeBiningable = VolumeBiningable;
})(ZMapVolume || (ZMapVolume = {}));
/// <reference path="VolumeBindingable.ts" />
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 绘制模式
     */
    let VolumeMode;
    (function (VolumeMode) {
        VolumeMode[VolumeMode["GLOBE"] = 1] = "GLOBE";
        VolumeMode[VolumeMode["BOX"] = 2] = "BOX";
    })(VolumeMode = ZMapVolume.VolumeMode || (ZMapVolume.VolumeMode = {}));
    /**
     * 绘制射线方向
     */
    let VolumeRayDir;
    (function (VolumeRayDir) {
        /**
         * 正向绘制
         */
        VolumeRayDir[VolumeRayDir["FORWARD"] = 1] = "FORWARD";
        /**
         * 反向绘制
         */
        VolumeRayDir[VolumeRayDir["BACKWORD"] = 2] = "BACKWORD";
    })(VolumeRayDir = ZMapVolume.VolumeRayDir || (ZMapVolume.VolumeRayDir = {}));
    ;
    let VolumeRenderMode;
    (function (VolumeRenderMode) {
        VolumeRenderMode[VolumeRenderMode["GLOBE_VOLUME"] = 1] = "GLOBE_VOLUME";
        VolumeRenderMode[VolumeRenderMode["GLOBE_SLICE"] = 2] = "GLOBE_SLICE";
        VolumeRenderMode[VolumeRenderMode["BOX_VOLUME"] = 3] = "BOX_VOLUME";
        VolumeRenderMode[VolumeRenderMode["BOX_SLICE"] = 4] = "BOX_SLICE";
    })(VolumeRenderMode || (VolumeRenderMode = {}));
    class VolumeRender extends ZMapVolume.VolumeBiningable {
        ////
        constructor(map3dView, options) {
            super(map3dView);
            this._sampleNum = 256;
            this._dataValueRange = new Cesium.Cartesian2(0, 1);
            this._center = new Cesium.Cartesian3();
            this._boxSizeInMeter = new Cesium.Cartesian3();
            this._boxMatrix = new Cesium.Matrix4();
            this._boxMatrixInv = new Cesium.Matrix4();
            /// 
            this._slice = { x: 0.5, y: 0.5, z: 0.5 };
            this._rangeMin = [0.01, 0.01, 0.01];
            this._rangeMax = [0.99, 0.99, 0.99];
            this._rayDir = VolumeRayDir.BACKWORD;
            ///
            this._appranceCaches = {};
            this._cubeTex = {};
            this._colorTex = {};
            ///
            this._clearPreRender = null;
            /// 
            this._temp_lc = new Cesium.Cartesian3();
            this._temp_wcc = new Cesium.Cartographic();
            this._temp_dir = new Cesium.Cartesian3();
            this._temp_planes = [
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0),
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0),
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0),
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0),
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0),
                new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0)
            ];
            this._temp_results = [
                new Cesium.Cartesian3(),
                new Cesium.Cartesian3(),
                new Cesium.Cartesian3(),
                new Cesium.Cartesian3(),
                new Cesium.Cartesian3(),
                new Cesium.Cartesian3()
            ];
            this._temp_sphere1 = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0);
            this._temp_sphere2 = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 0);
            this._temp_sr1 = new Cesium.Interval();
            this._temp_sr2 = new Cesium.Interval();
            ///
            this._createDefaultTexture();
            /// 
            options = options || {};
            ///
            this._name = options.name ? options.name : ("Volume_TimeStap_" + Date.now());
            this._sliceNum = options.sliceNum ? options.sliceNum : [8, 8];
            this._sampleNum = Cesium.defaultValue(options.sampleNum, 256);
            this._scale = options.scale ? options.scale : [1, 1, 1];
            this._offset = options.offset ? options.offset : [0, 0, 0];
            this._vol_url = options.url ? options.url : "BaseWhite";
            this._color_url = options.colorMap;
            this._turn = options.turn || [0, 0, 0];
            this._line = [0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            this.blongElement = options.blongElement;
            //订阅者
            this._bindings = [];
            //观察者
            this._handlers = {};
            //存储各自变量
            this._vol_model = { pri: null, apprance: null, mat: null };
            this._sec_model = { pri: [], anypri: null, apprance: null, mat: null };
            /// 
            if (options.dataValueRange) {
                this._dataValueRange.x = options.dataValueRange[0];
                this._dataValueRange.y = options.dataValueRange[1];
            }
            ///
            this.filterParam = options.filterParam || {};
            // 体数据渲染的模式，1表示采用曲面代理几何渲染,0表示正立方体渲染
            this._mode = (options && options.mode === VolumeMode.GLOBE) ? VolumeMode.GLOBE : VolumeMode.BOX;
            this._rayDir = options.rayDir ? options.rayDir : VolumeRayDir.BACKWORD;
            ///
            ///过滤分析
            if (ZMapVolume.FilterEdit && !this._filterControl) {
                const param = this.filterParam;
                /// 属性过滤界面
                const div = document.createElement("div");
                div.className = "analysis";
                div.setAttribute("data-allow", "volume");
                if (this.blongElement) {
                    if (typeof this.blongElement === 'string') {
                        document.querySelector(this.blongElement).appendChild(div);
                    }
                    else if (typeof this.blongElement === 'object' && this.blongElement instanceof HTMLElement) {
                        this.blongElement.appendChild(div);
                    }
                }
                else {
                    document.body.appendChild(div);
                }
                /// 属性过滤
                this._filterControl = new ZMapVolume.FilterEdit(div, param);
                //拖动事件:line为当前折线,position为控制点的位置
                this._filterControl.onchangestatus = (position, line) => {
                    const pl = [];
                    const fc = this._filterControl;
                    const rg = fc.max_Value - fc.min_Value;
                    line.forEach(p => {
                        pl.push(p[0] / rg + fc.min_Value, p[1] / rg + fc.min_Value);
                    });
                    ///
                    this.filterLine = pl;
                };
            }
        }
        _createDefaultTexture() {
            if (!VolumeRender._defaultTexture) {
                VolumeRender._defaultTexture = new Cesium.Texture({
                    context: this._scene.context,
                    source: {
                        width: 1,
                        height: 1,
                        arrayBufferView: new Uint8Array([0, 0, 0, 0])
                    },
                    flipY: false
                });
            }
        }
        loadData(options) {
            /// 
            if (options.min && options.max) {
                this._box = ZMapVolume.LongLatBox.fromStartEndArray(options.min, options.max);
            }
            if (options.url)
                this._vol_url = options.url;
            if (options.colorMap)
                this._color_url = options.colorMap;
            if (options.offset)
                this._offset = options.offset;
            if (options.scale)
                this._scale = options.scale;
            if (options.sliceNum)
                this._sliceNum = options.sliceNum;
            if (Cesium.defined(options.sampleNum))
                this._sampleNum = options.sampleNum;
            if (options.mode)
                this._mode = options.mode;
            if (options.rayDir)
                this._rayDir = options.rayDir;
            if (options.dataValueRange) {
                this._dataValueRange.x = options.dataValueRange[0];
                this._dataValueRange.y = options.dataValueRange[1];
            }
            /// 加载体数据（纹理）
            this._loadImage();
            ///
            this._apply();
        }
        // get/set 可见性
        set visible(visible) {
            this.show = visible;
        }
        get visible() {
            return this.show;
        }
        // get/set 盒子属性
        set box(box) {
            this._box = box;
            this._apply();
        }
        get box() {
            return this._box;
        }
        get readyPromise() { return this._volImagePromise; }
        set rayDir(dir) { this._rayDir = dir; this._apply(); }
        get rayDir() { return this._rayDir; }
        /**
         * get/set 缩放比例
         * @param scale [xScale,yScale,zScale]
         * @example vol.scale = [1,1,2] z轴扩展两倍
         */
        set scale(scale) {
            this._scale = scale;
            this._apply();
        }
        get scale() {
            return this._scale;
        }
        /**
         * get/set 偏移量
         * @param offset [x,y,z]
         * @example vol.offset = [0,0,100] 模型抬起100米
         */
        set offset(offset) {
            this._offset = offset;
            this._apply();
        }
        get offset() {
            return this._offset;
        }
        set filterLine(line) {
            this._line = line;
            if (line.length > 16)
                line.length = 16;
            if (line.length < 16) {
                for (let i = line.length; i < 16; ++i) {
                    line[i] = 1;
                }
            }
            //过滤
            if (Array.isArray(line)) {
                this._applyUniforms(u => u.u_VolFilterLine = line);
            }
        }
        get filterLine() {
            return this._line;
        }
        set sampleMum(value) {
            this._sampleNum = value;
            this._apply();
        }
        get sampleNum() { return this._sampleNum; }
        showVolume() {
            this.setVolume();
        }
        set volumeVisible(show) {
            if (this._vol_model.pri)
                this._vol_model.pri.show = show;
        }
        /**
         * 切片体的显示和隐藏
         * @param val
         */
        set sliceVisible(val) {
            this._sec_model.pri.forEach(pri => {
                if (pri)
                    pri.show = !!val;
            });
        }
        set anySliceVisible(val) {
            if (this._sec_model.anypri)
                this._sec_model.anypri.show = !!val;
        }
        set sliceXVisble(val) {
            const sx = this._sec_model.pri[0];
            if (sx)
                sx.show = !!val;
        }
        set sliceYVisble(val) {
            const sx = this._sec_model.pri[1];
            if (sx)
                sx.show = !!val;
        }
        set sliceZVisble(val) {
            const sx = this._sec_model.pri[2];
            if (sx)
                sx.show = !!val;
        }
        update(box) { }
        _apply() {
            /// 清除旧模型
            this.clearVolume();
            ///
            this._calcParam();
            ///
            this._bindings.forEach(tool => {
                tool.update(this._rbox);
            });
            /// 
            if (this._rmode == VolumeRenderMode.BOX_VOLUME || this._rmode == VolumeRenderMode.GLOBE_VOLUME)
                this.setVolume();
            else if (this._rmode == VolumeRenderMode.BOX_SLICE || this._rmode == VolumeRenderMode.GLOBE_SLICE)
                this.setSlice(this._slice);
            ///
            if (!this._clearPreRender) {
                /// 
                this._clearPreRender = this._scene.preRender.addEventListener(this._preRender, this);
            }
        }
        clean() {
        }
        /**
         * 加载体数据图片
         * @param url
         * @private
         */
        _loadImage() {
            const prs = [];
            const context = this._scene.context;
            function createImage(ti, url, promises) {
                /// 
                if (ti.image && ti.image.src === url) {
                    return;
                }
                const image = new Image();
                const vp = new Promise((resolve, reject) => {
                    image.onload = () => {
                        if (image.width <= 0 || image.height <= 0) {
                            reject();
                        }
                        else {
                            if (ti.texture) {
                                ti.texture.destroy();
                                ti.texture = null;
                            }
                            ///
                            ti.texture = new Cesium.Texture({
                                context, source: image
                            });
                            ti.texture['type'] = 'sampler2D';
                            ///
                            resolve();
                        }
                    };
                    image.onerror = (error) => reject(error);
                });
                //允许跨域
                image.crossOrigin = "anonymous";
                image.src = url;
                /// 
                promises.push(vp);
                ///
                ti.image = image;
            }
            ///
            createImage(this._cubeTex, this._vol_url, prs);
            createImage(this._colorTex, this._color_url, prs);
            /// 
            if (prs.length > 0) {
                this.clearMaterial();
                this._volImagePromise = Promise.all(prs);
            }
        }
        /**
         * 将交互工具和体数据工具互相绑定<br>
         * 基于简单的发布/订阅模式，体数据范围更新的时候，会通知订阅者更新数据<br>
         * 使用此方法，不用关心手动去更新交互工具
         * @see this.update()
         * @param tools{Array.[VolumeBiningable] | VolumeBiningable} 实现了_Common的实例 或者实例数组
         */
        binding(tools) {
            if (!Array.isArray(tools)) {
                tools = [tools];
            }
            ///
            for (let i = 0; i < tools.length; i++) {
                let tool = tools[i];
                if (tool instanceof ZMapVolume.VolumeBiningable) {
                    this._bindings.push(tool);
                    tool.binding(this);
                }
                else {
                    throw Error("请传入实现_Comon接口的实例");
                }
            }
        }
        /**
         * 绑定事件
         * @param type 类型
         * @param handler 回调
         * @return {Number} 当前毫秒数，作为事件id ，移除事件的时候能用到
         * @example this.on("update",function(type,obj){})
         */
        on(type, handler) {
            if (!(type in this._handlers)) {
                this._handlers[type] = [];
            }
            ///
            const id = Date.now();
            this._handlers[type].push({
                handler: handler,
                id: id
            });
            return id;
        }
        /**
         * 移除事件
         * @param type 类型
         * @param id 事件id
         * @example this.off() 移除绑定在此对象上面的所有事件
         * @example this.off("update") 移除绑定在此对象上面的所有update事件
         * @example this.off("update",1123231231) 移除绑定在此对象上面的id为1123231231的update事件
         */
        off(type, id) {
            if (!type) { //清除所有观察者
                this._handlers = {};
            }
            else if (!id) { //清除某一个类型的观察者
                this._handlers[type] = [];
            }
            else if (this._handlers[type]) {
                let events = this._handlers[type];
                for (let i = 0; i < events.length; i++) {
                    if (events[i].id === id) { //移除单个事件
                        events.splice(i, 1);
                        break;
                    }
                }
            }
        }
        /**
         * 触发事件
         * @param type 类型
         * @param obj 传递过去的参数
         * @example this.emit("update",{})
         */
        emit(type, obj) {
            const events = this._handlers[type];
            for (let i = 0; i < events.length; i++) {
                if (typeof events[i].handler === 'function') {
                    events[i].handler(type, obj);
                }
            }
        }
        _imageReadyInvoke(fGlobe, fBox, ...args) {
            const ss = {
                cancel: false,
                callback: () => { this._mode === VolumeMode.GLOBE ? fGlobe.apply(this, args) : fBox.apply(this, args); }
            };
            ///
            function ccb() {
                if (!ss.cancel)
                    ss.callback();
            }
            function reject(reason) {
                console.warn('load volume data error.', reason);
            }
            ///
            const oldss = this._volImagePromise['ss'];
            if (oldss)
                oldss.cancel = true;
            ///
            this._volImagePromise['ss'] = ss;
            this._volImagePromise.then(ccb, reject);
        }
        _createAppearance(mode, boxMin, boxMax) {
            ///  
            const uniforms = {
                u_SliceNumXf: this._sliceNum[0],
                u_SliceNumYf: this._sliceNum[1],
                u_ColorTex: this._colorTex.texture,
                u_CubeTex: this._cubeTex.texture,
                u_InvWorldMat: Cesium.Matrix4.toArray(this._boxMatrixInv),
                u_VolBoxMin: boxMin,
                u_VolBoxMax: boxMax,
                u_VolClipMin: new Cesium.Cartesian3(...this._rangeMin),
                u_VolClipMax: new Cesium.Cartesian3(...this._rangeMax),
                u_VolBoxRadius: this._boundRadius,
                u_VolFilterLine: this._line,
                u_Turn: new Cesium.Cartesian3(...this._turn),
                u_DataValueRange: this._dataValueRange
            };
            /// 
            const isSlice = mode === VolumeRenderMode.BOX_SLICE || mode === VolumeRenderMode.GLOBE_SLICE;
            const key = `mode:${mode}-ray:${this._rayDir}`;
            let app = this._appranceCaches[key];
            if (!app) {
                /// 
                const matShader = `
#define ZMAP_MODE ${mode}
#define ZMAP_VOL_RAY_DIR ${this._rayDir}
#define ZMAP_IN_BOX ${this._isInBox ? 1 : 0}
#define ZMAP_VOL_SAMPLE_NUM ${this._sampleNum}
#line 0
${ZMapVolume.Shaders.materialShader}`;
                // 创建材质
                const material = new Cesium.Material({
                    translucent: !isSlice,
                    fabric: {
                        type: 'ZMapVolume-' + key,
                        source: matShader,
                        uniforms: uniforms
                    }
                });
                material._defaultTexture = VolumeRender._defaultTexture;
                material._textures['u_CubeTex'] = this._cubeTex.texture;
                material._textures['u_ColorTex'] = this._colorTex.texture;
                const apoptions = {
                    material: material,
                    vertexShaderSource: ZMapVolume.Shaders.vertexShader,
                    fragmentShaderSource: ZMapVolume.Shaders.fragmentShader,
                    translucent: !isSlice,
                    faceForward: true,
                    closed: false,
                    renderState: {
                        cull: {
                            enabled: !isSlice,
                            face: isSlice ? Cesium.CullFace.BACK : Cesium.CullFace.FRONT
                        },
                        depthMask: false,
                        blending: Cesium.BlendingState.ALPHA_BLEND
                    }
                };
                /// 创建表现
                app = new Cesium.MaterialAppearance(apoptions);
                this._appranceCaches[key] = app;
            }
            ///
            Object.assign(app.material.uniforms, uniforms);
            return app;
        }
        /**
         * 显示提数据
         */
        setVolume() {
            this.sliceVisible = false;
            this.anySliceVisible = false;
            if (this._vol_model.pri) {
                this.volumeVisible = true;
                return;
            }
            ///
            this._imageReadyInvoke(this._setVolumeOnGlobe, this._setVolumeOnBox);
        }
        /**
         * 普通模型的渲染方式
         */
        _setVolumeOnBox() {
            const viewer = this._viewer;
            //计算参数
            this._calcParam();
            this._rmode = VolumeRenderMode.BOX_VOLUME;
            /// 
            const bs = this._boxSizeInMeter;
            const minimum = Cesium.Cartesian3.fromElements(-bs.x / 2, -bs.y / 2, -bs.z / 2);
            const maximum = Cesium.Cartesian3.fromElements(bs.x / 2, bs.y / 2, bs.z / 2);
            /// 创建表现
            this._vol_model.apprance = this._createAppearance(VolumeRenderMode.BOX_VOLUME, minimum, maximum);
            this._vol_model.mat = this._vol_model.apprance.material;
            // 代理几何体添加到指定经纬度场景
            const box = new Cesium.BoxGeometry({ minimum, maximum });
            const geom = Cesium.BoxGeometry.createGeometry(box);
            ///
            viewer.scene.primitives.remove(this._vol_model.pri);
            this._vol_model.pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geom,
                    modelMatrix: this._boxMatrix,
                    id: this._name
                }),
                asynchronous: false,
                appearance: this._vol_model.apprance
            });
            viewer.scene.primitives.add(this._vol_model.pri);
        }
        /**
         * 曲面模型的渲染方式
         */
        _setVolumeOnGlobe() {
            const viewer = this._viewer;
            //计算参数
            this._calcParam();
            this._rmode = VolumeRenderMode.GLOBE_VOLUME;
            let { xmin, xmax, ymin, ymax, zmin, zmax } = this._rbox;
            // 代理几何体添加到指定经纬度场景
            const rectangle = new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
                height: zmin,
                extrudedHeight: zmax
            });
            ///
            const geom = Cesium.RectangleGeometry.createGeometry(rectangle);
            /// 创建表现
            this._vol_model.apprance = this._createAppearance(VolumeRenderMode.GLOBE_VOLUME, new Cesium.Cartesian3(xmin, ymin, zmin), new Cesium.Cartesian3(xmax, ymax, zmax));
            this._vol_model.mat = this._vol_model.apprance.material;
            /// 移除旧的提数据对象
            viewer.scene.primitives.remove(this._vol_model.pri);
            /// 创建提数据Primitive
            this._vol_model.pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geom,
                    //debugShowBoundingVolume: true,
                    // modelMatrix: matrix,
                    id: this._name
                }),
                asynchronous: false,
                appearance: this._vol_model.apprance
            });
            ///
            viewer.scene.primitives.add(this._vol_model.pri);
        }
        setSlice(slice) {
            this.volumeVisible = false;
            this.anySliceVisible = false;
            /// 
            slice = Cesium.defaultValue(slice, { x: 0.5, y: 0.5, z: 0.5 });
            ///
            slice.x = Cesium.Math.clamp(Cesium.defaultValue(slice.x), 0, 1);
            slice.y = Cesium.Math.clamp(Cesium.defaultValue(slice.y), 0, 1);
            slice.z = Cesium.Math.clamp(Cesium.defaultValue(slice.z), 0, 1);
            let update = false;
            if (slice) {
                if (slice.x != this._slice.x || slice.y != this._slice.y || slice.z != this._slice.z) {
                    update = true;
                }
            }
            ///
            if (!update && this._sec_model.pri.length == 3) {
                this.sliceVisible = true;
                return;
            }
            ///
            this._imageReadyInvoke(this.setSliceOnGlobe, this._setSliceOnBox, slice);
        }
        _setSliceOnBox(slice) {
            const viewer = this._viewer;
            //计算参数
            this._calcParam();
            this._rmode = VolumeRenderMode.BOX_SLICE;
            ///
            const bs = this._boxSizeInMeter;
            const min = Cesium.Cartesian3.fromElements(-bs.x / 2, -bs.y / 2, -bs.z / 2);
            const max = Cesium.Cartesian3.fromElements(bs.x / 2, bs.y / 2, bs.z / 2);
            /// 创建材质
            if (!this._sec_model.apprance) {
                this._sec_model.apprance = this._createAppearance(VolumeRenderMode.BOX_SLICE, min, max);
                this._sec_model.mat = this._sec_model.apprance.material;
            }
            ///
            const indices = new Uint32Array([0, 1, 3, 3, 2, 0]);
            //create buffer
            const slices = [];
            //为0的时候会报错，下同
            if (slice.x !== this._slice.x) {
                this._slice.x = slice.x;
                const _xSlice = slice.x * bs.x + min.x;
                slices[0] = ({
                    name: 'lonSection',
                    position: new Float64Array([
                        _xSlice, min.y, min.z, _xSlice, max.y, min.z,
                        _xSlice, min.y, max.z, _xSlice, max.y, max.z
                    ]),
                    normal: new Float32Array([
                        1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                        1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
                    ])
                });
            }
            ///
            if (slice.y !== this._slice.y) {
                this._slice.y = slice.y;
                const _ySlice = slice.y * bs.y + min.y;
                slices[1] = ({
                    name: 'latSection',
                    position: new Float64Array([
                        min.x, _ySlice, min.z, max.x, _ySlice, min.z,
                        min.x, _ySlice, max.z, max.x, _ySlice, max.z
                    ]),
                    normal: new Float32Array([
                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                        0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
                    ])
                });
            }
            if (slice.z !== this._slice.z) {
                this._slice.z = slice.z;
                const _zSlice = slice.z * bs.z + min.z;
                slices[2] = ({
                    name: 'heiSection',
                    position: new Float64Array([
                        min.x, min.y, _zSlice, max.x, min.y, _zSlice,
                        min.x, max.y, _zSlice, max.x, max.y, _zSlice
                    ]),
                    normal: new Float32Array([
                        0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
                    ])
                });
            }
            ///
            for (let i = 0; i < slices.length; i++) {
                const slice = slices[i];
                if (!slice)
                    continue;
                const attributes = new Cesium.GeometryAttributes();
                attributes.position = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: slice.position
                });
                attributes.normal = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: slice.normal
                });
                const geo = new Cesium.Geometry({
                    attributes: attributes,
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(slice.position),
                });
                const pri = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geo,
                        id: slice.name,
                        modelMatrix: this._boxMatrix,
                    }),
                    asynchronous: false,
                    appearance: this._sec_model.apprance
                });
                /// 
                viewer.scene.primitives.remove(this._sec_model.pri[i]);
                ///
                this._sec_model.pri[i] = pri;
                viewer.scene.primitives.add(pri);
            }
        }
        setSliceOnGlobe(slice) {
            const viewer = this._viewer;
            this._calcParam();
            this._rmode = VolumeRenderMode.GLOBE_SLICE;
            const { xmin, ymin, zmin, xmax, ymax, zmax } = this._rbox;
            /// 创建材质
            if (!this._sec_model.apprance) {
                this._sec_model.apprance = this._createAppearance(VolumeRenderMode.GLOBE_SLICE, new Cesium.Cartesian3(xmin, ymin, zmin), new Cesium.Cartesian3(xmax, ymax, zmax));
                this._sec_model.mat = this._sec_model.apprance.material;
            }
            //create buffer
            const nameArray = ["lonSection", "latSection", "heiSection"];
            const geoArray = [null, null, null];
            // xslice
            if (slice.x != this._slice.x) {
                this._slice.x = slice.x;
                const target_x = xmin + slice.x * (xmax - xmin);
                const xWall = Cesium.WallGeometry.fromConstantHeights({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        target_x, ymin,
                        target_x, ymax,
                    ]),
                    minimumHeight: zmin,
                    maximumHeight: zmax,
                    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                });
                ///
                geoArray[0] = Cesium.WallGeometry.createGeometry(xWall);
            }
            // yslice
            if (slice.y != this._slice.y) {
                this._slice.y = slice.y;
                const target_y = ymin + slice.y * (ymax - ymin);
                const yWall = Cesium.WallGeometry.fromConstantHeights({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        xmin, target_y,
                        xmax, target_y,
                    ]),
                    minimumHeight: zmin,
                    maximumHeight: zmax,
                    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                });
                geoArray[1] = Cesium.WallGeometry.createGeometry(yWall);
            }
            // zslice
            if (slice.z != this._slice.z) {
                this._slice.z = slice.z;
                const target_z = zmin + slice.z * (zmax - zmin);
                const zGeo = new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
                    height: target_z,
                    vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
                });
                geoArray[2] = Cesium.RectangleGeometry.createGeometry(zGeo);
            }
            //add slice primitive
            for (let i = 0; i < 3; i++) {
                const geo = geoArray[i];
                if (!geo)
                    continue;
                ///
                const pri = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geoArray[i],
                        id: nameArray[i],
                        attributes: {
                            color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TRANSPARENT)
                        },
                    }),
                    asynchronous: false,
                    appearance: this._sec_model.apprance
                });
                /// 
                viewer.scene.primitives.remove(this._sec_model.pri[i]);
                ///
                this._sec_model.pri[i] = pri;
                viewer.scene.primitives.add(pri);
            }
        }
        setSliceAny(start, end) {
            const viewer = this._viewer;
            this.volumeVisible = false;
            this.sliceVisible = false;
            /// 删除旧的切面模型
            viewer.scene.primitives.remove(this._sec_model.anypri);
            this._sec_model.anypri = null;
            ///
            this._imageReadyInvoke(this._setSliceAnyOnGlobe, this._setSliceAnyOnBox, start, end);
        }
        _setSliceAnyOnBox(start, end) {
            const viewer = this._viewer;
            //计算参数
            this._calcParam();
            this._rmode = VolumeRenderMode.BOX_SLICE;
            /// 
            const ct = this._rbox.center;
            const bstart = [(start[0] - ct[0]) * 111000, (start[1] - ct[1]) * 111000, start[2] - ct[2]];
            const bend = [(end[0] - ct[0]) * 111000, (end[1] - ct[1]) * 111000, end[2] - ct[2]];
            ///
            const bs = this._boxSizeInMeter;
            const min = Cesium.Cartesian3.fromElements(-bs.x / 2, -bs.y / 2, -bs.z / 2);
            const max = Cesium.Cartesian3.fromElements(bs.x / 2, bs.y / 2, bs.z / 2);
            /// 创建材质
            if (!this._sec_model.apprance) {
                this._sec_model.apprance = this._createAppearance(VolumeRenderMode.BOX_SLICE, min, max);
                this._sec_model.mat = this._sec_model.apprance.material;
            }
            ///
            const indices = new Uint32Array([0, 1, 3, 3, 2, 0]);
            //create buffer
            const normal = new Cesium.Cartesian3(bstart[0] - bend[0], bstart[1] - bend[1], 0);
            Cesium.Cartesian3.normalize(normal, normal);
            Cesium.Cartesian3.cross(normal, Cesium.Cartesian3.UNIT_Z, normal);
            ///
            const slice = {
                position: new Float64Array([
                    bstart[0], bstart[1], min.z,
                    bend[0], bend[1], min.z,
                    bstart[0], bstart[1], max.z,
                    bend[0], bend[1], max.z
                ]),
                normal: new Float32Array([
                    normal.x, normal.y, normal.z,
                    normal.x, normal.y, normal.z,
                    normal.x, normal.y, normal.z,
                    normal.x, normal.y, normal.z,
                ]),
                name: 'anySection'
            };
            ///
            const attributes = new Cesium.GeometryAttributes();
            attributes.position = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                componentsPerAttribute: 3,
                values: slice.position
            });
            attributes.normal = new Cesium.GeometryAttribute({
                componentDatatype: Cesium.ComponentDatatype.FLOAT,
                componentsPerAttribute: 3,
                values: slice.normal
            });
            const geo = new Cesium.Geometry({
                attributes: attributes,
                indices: indices,
                primitiveType: Cesium.PrimitiveType.TRIANGLES,
                boundingSphere: Cesium.BoundingSphere.fromVertices(slice.position),
            });
            const pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geo,
                    id: slice.name,
                    modelMatrix: this._boxMatrix,
                }),
                asynchronous: false,
                appearance: this._sec_model.apprance
            });
            ///
            this._sec_model.anypri = (pri);
            viewer.scene.primitives.add(pri);
        }
        _setSliceAnyOnGlobe(start, end) {
            const viewer = this._viewer;
            this._calcParam();
            this._rmode = VolumeRenderMode.GLOBE_SLICE;
            const { xmin, ymin, zmin, xmax, ymax, zmax } = this._rbox;
            /// 创建材质
            if (!this._sec_model.apprance) {
                this._sec_model.apprance = this._createAppearance(VolumeRenderMode.GLOBE_SLICE, new Cesium.Cartesian3(xmin, ymin, zmin), new Cesium.Cartesian3(xmax, ymax, zmax));
                this._sec_model.mat = this._sec_model.apprance.material;
            }
            const xWall = Cesium.WallGeometry.fromConstantHeights({
                positions: Cesium.Cartesian3.fromDegreesArray([
                    start[0], start[1],
                    end[0], end[1],
                ]),
                minimumHeight: zmin,
                maximumHeight: zmax,
                vertexFormat: Cesium.VertexFormat.POSITION_AND_NORMAL
            });
            ///
            const geo = Cesium.WallGeometry.createGeometry(xWall);
            ///
            const pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geo,
                    id: 'slice_any',
                    attributes: {
                        color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TRANSPARENT)
                    },
                }),
                asynchronous: false,
                appearance: this._sec_model.apprance
            });
            ///
            this._sec_model.anypri = pri;
            viewer.scene.primitives.add(pri);
        }
        _applyUniforms(func) {
            if (this._vol_model.mat)
                func(this._vol_model.mat.uniforms);
            if (this._sec_model.mat)
                func(this._sec_model.mat.uniforms);
        }
        ///
        _preRender() {
            if (!this._rbox)
                return;
            const wc = this._viewer.camera.positionWC;
            const dir = Cesium.Cartesian3.subtract(this._center, wc, this._temp_dir);
            const ray = new Cesium.Ray(wc, dir);
            let distance = Number.MAX_VALUE;
            if (this._mode == VolumeMode.BOX) {
                const lc = Cesium.Matrix4.multiplyByPoint(this._boxMatrixInv, wc, this._temp_lc);
                const bx = this._boxSizeInMeter;
                this._isInBox = lc.x < bx.x && lc.x > -bx.x && lc.y < bx.y && lc.y > -bx.y && lc.z < bx.z && lc.z > -bx.z;
                const pre = (p1, p2, dir, dist) => {
                    Cesium.Cartesian3.clone(dir, p1.normal);
                    Cesium.Cartesian3.clone(dir, p2.normal);
                    p1.distance = dist / 2;
                    p2.distance = -dist / 2;
                    Cesium.Plane.transform(p1, this._boxMatrix, p1);
                    Cesium.Plane.transform(p2, this._boxMatrix, p2);
                };
                ///
                const [px1, px2, py1, py2, pz1, pz2] = this._temp_planes;
                pre(px1, px2, Cesium.Cartesian3.UNIT_X, this._boxSizeInMeter.x);
                pre(py1, py2, Cesium.Cartesian3.UNIT_Y, this._boxSizeInMeter.y);
                pre(pz1, pz2, Cesium.Cartesian3.UNIT_Z, this._boxSizeInMeter.z);
                //Cesium.Matrix4.multi
                const rayPlane = Cesium.IntersectionTests.rayPlane;
                let [ix1, ix2, iy1, iy2, iz1, iz2] = this._temp_results;
                ix1 = rayPlane(ray, px1, ix1);
                ix2 = rayPlane(ray, px2, ix2);
                iy1 = rayPlane(ray, py1, iy1);
                iy2 = rayPlane(ray, py2, iy2);
                iz1 = rayPlane(ray, pz1, iz1);
                iz2 = rayPlane(ray, pz2, iz2);
                const distMin = function (i1, i2) {
                    if (i1 && i2) {
                        const d = Cesium.Cartesian3.distanceSquared(i1, i2);
                        if (d < distance)
                            distance = d;
                    }
                };
                distMin(ix1, ix2);
                distMin(iy1, iy2);
                distMin(iz1, iz2);
            }
            else {
                const s1 = this._temp_sphere1;
                const s2 = this._temp_sphere2;
                s1.radius = this._rbox.zmax + 6378137;
                s2.radius = this._rbox.zmin + 6378137;
                const wcc = this._scene.camera.positionCartographic;
                const lon = Cesium.Math.toDegrees(wcc.longitude);
                const lat = Cesium.Math.toDegrees(wcc.latitude);
                const hei = wcc.height;
                const bx = this._rbox;
                this._isInBox = lon > bx.xmin && lon < bx.xmax && lat > bx.ymin && lat < bx.ymax && hei > bx.zmin && hei < bx.zmax;
                const sr1 = Cesium.IntersectionTests.raySphere(ray, s1, this._temp_sr1);
                const sr2 = Cesium.IntersectionTests.raySphere(ray, s2, this._temp_sr2);
                if (sr1 && sr2) {
                    const p0 = Cesium.Ray.getPoint(ray, sr1.start, this._temp_results[0]);
                    const p1 = Cesium.Ray.getPoint(ray, sr2.start, this._temp_results[1]);
                    /// 
                    distance = Cesium.Cartesian3.distanceSquared(p0, p1);
                }
            }
            /// u_VolBoxRadius: this._boundRadius,
            distance = Math.sqrt(distance);
            if (distance > this._boundRadius) {
                distance = this._boundRadius;
            }
            this._applyUniforms(u => u.u_VolBoxRadius = distance);
        }
        reset() {
            this._scale = [1, 1, 1];
            this._offset = [0, 0, 0];
            ///
            return this.setVolume();
        }
        onShowChanged(show) {
        }
        clearVolume() {
            const viewer = this._viewer;
            const pris = viewer.scene.primitives;
            /// 体模型
            pris.remove(this._vol_model.pri);
            this._vol_model.pri = null;
            this._vol_model.apprance = null;
            this._vol_model.mat = null;
            /// 切片模型
            this._sec_model.pri.forEach(pri => pris.remove(pri));
            this._sec_model.pri.length = 0;
            /// 任意切片
            pris.remove(this._sec_model.anypri);
            this._sec_model.anypri = null;
            ///
            this._sec_model.apprance = null;
            this._sec_model.mat = null;
            this._slice = { x: -1, y: -1, z: -1 };
            ///
            this._rbox = null;
        }
        clearMaterial() {
            this._appranceCaches = {};
            if (this._cubeTex.texture) {
                this._cubeTex.texture.destroy();
                this._cubeTex.texture = null;
            }
            if (this._colorTex.texture) {
                this._colorTex.texture.destroy();
                this._colorTex.texture = null;
            }
        }
        /**
         * 销毁体数据
         */
        destroy() {
            if (this._clearPreRender) {
                this._clearPreRender();
                this._clearPreRender = null;
            }
            /// 
            this.clearVolume();
            this.clearMaterial();
            ///
            return;
        }
        set colorMap(colorMap) {
            if (colorMap && this._color_url !== colorMap) {
                this._color_url = colorMap;
                this._applyUniforms(u => u.u_ColorTex = colorMap);
            }
        }
        /// 体数据模型翻转 [0,0,0] 对应xyz轴翻转，0表示不翻转 1表示翻转（这里会对传进来的值进行真假值判断）
        set volTurn(turn) {
            this._turn = turn.map((num) => { return Number(!!num); });
            this._applyUniforms(u => u.u_Turn = new Cesium.Cartesian3(...this._turn));
        }
        get volTurn() {
            return this._turn;
        }
        /**
         * 设置属性过滤
         * @param open {boolean} 是否开启属性过滤
         */
        set filter(open) {
            if (open) {
                this._filterControl && (this._filterControl.element.style.visibility = "visible");
            }
            else {
                this._filterControl && (this._filterControl.element.style.visibility = "hidden");
            }
            this._filterOpen = open;
        }
        ///
        get filter() {
            return this._filterOpen;
        }
        /**
         * 统一minHei,minLng,minLat,maxHei,maxLng,maxLat方法
         * @param uniforms {Object} 包含以下属性：[minHeight,minLongitude,minLatitude,maxHeight,maxLongitude,maxLatitude]等
         * @see minHei
         * @see minLng
         * @see minLat
         * @see maxHei
         * @see maxLng
         * @see maxLat
         */
        set range(ranges) {
            const box = this._rbox;
            //keep the value in [0,1]
            const keep = function (val) {
                return Math.max(Math.min(val, 0.99), 0.01);
            };
            const size = box.size;
            const x1 = keep((ranges.xmin - box.xmin) / size[0]);
            const y1 = keep((ranges.ymin - box.ymin) / size[1]);
            const z1 = keep((ranges.zmin - box.zmin) / size[2]);
            const x2 = keep((ranges.xmax - box.xmin) / size[0]);
            const y2 = keep((ranges.ymax - box.ymin) / size[1]);
            const z2 = keep((ranges.zmax - box.zmin) / size[2]);
            ///
            this._rangeMin = [x1, y1, z1];
            this._rangeMax = [x2, y2, z2];
            this._applyUniforms(u => {
                Cesium.Cartesian3.fromElements(x1, y1, z1, u.u_VolClipMin);
                Cesium.Cartesian3.fromElements(x2, y2, z2, u.u_VolClipMax);
            });
        }
        _calcScaleOffsetBox() {
            const box = this._box, offset = this._offset, scale = this._scale;
            const xoffset = offset[0], yoffset = offset[1], zoffset = offset[2];
            const xscale = scale[0], yscale = scale[1], zscale = scale[2];
            /// 
            this._rbox = new ZMapVolume.LongLatBox(xoffset + box.xmin * xscale, yoffset + box.ymin * yscale, zoffset + box.zmin * zscale, xoffset + box.xmax * xscale, yoffset + box.ymax * yscale, zoffset + box.zmax * zscale);
        }
        getRealValue(v, field) {
            return (v - this._offset[field]) / this._scale[field];
        }
        _calcParam() {
            this._calcScaleOffsetBox();
            // 求指定经纬度所代表的长宽范围
            const a = Cesium.Cartesian3.fromDegrees(this._rbox.xmin, this._rbox.ymax, this._rbox.zmin);
            const c = Cesium.Cartesian3.fromDegrees(this._rbox.xmin, this._rbox.ymin, this._rbox.zmin);
            const d = Cesium.Cartesian3.fromDegrees(this._rbox.xmax, this._rbox.ymax, this._rbox.zmin);
            //跨度
            const deltaX = Cesium.Cartesian3.distance(a, d);
            const deltaY = Cesium.Cartesian3.distance(a, c);
            const deltaZ = this._rbox.size[2];
            Cesium.BoundingSphere.fromCornerPoints;
            /// 
            Cesium.Cartesian3.fromElements(deltaX, deltaY, deltaZ, this._boxSizeInMeter);
            this._boundRadius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            /// 求几何体变换矩阵
            const [cx, cy, cz] = this._rbox.center;
            Cesium.Cartesian3.fromDegrees(cx, cy, cz, null, this._center);
            Cesium.Transforms.eastNorthUpToFixedFrame(this._center, undefined, this._boxMatrix);
            /// 计算逆军阵
            Cesium.Matrix4.inverse(this._boxMatrix, this._boxMatrixInv);
        }
    }
    ZMapVolume.VolumeRender = VolumeRender;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 实体工具
     * @author flake
     */
    class EntityTool {
        ///
        constructor(viewer) {
            /// 
            this._default = {
                lineWidth: 2,
                pointSize: 10,
                lineColor: Cesium.Color.CORAL,
                pointColor: Cesium.Color.DEEPSKYBLUE,
                textColor: Cesium.Color.DEEPSKYBLUE
            };
            //对应Cesium框架内的Viewer类实例 ，类型为Viewer
            this.viewer = viewer;
        }
        set defaultOpt(opt) {
            this._default = Object.assign(this._default, opt);
        }
        get defaultOpt() {
            return this._default;
        }
        /**
         * 添加折线
         * @param pos Array.[Cartesian3]
         * @return Entity
         */
        addPloyline(pos, option) {
            let opt = Object.assign(this.getDefault(), option);
            return this.viewer.entities.add({
                polyline: {
                    positions: pos,
                    material: opt.lineColor,
                    width: opt.lineWidth,
                    clampToGround: false
                }
            });
        }
        /**
         * 获取默认配置
         * @return {{lineWidth: number, lineColor: Color}}
         */
        getDefault() {
            return this._default;
        }
        /**
         * 添加点
         * @param pos Array.[Cartesian3]
         * @return Array.[Entity]
         */
        addPoint(pos, labelGraphics, option) {
            let opt = Object.assign(this.getDefault(), option);
            return pos.map(point => {
                return this.viewer.entities.add({
                    position: point,
                    point: {
                        pixelSize: opt.pointSize,
                        color: opt.pointColor
                    },
                    label: labelGraphics
                });
            });
        }
        /**
         * 添加点附加经度文字
         * @param pos Array.[Cartesian3]
         */
        addPointWithLongitude(pos, option) {
            let opt = Object.assign(this.getDefault(), option);
            return pos.map(point => {
                return this.viewer.entities.add({
                    position: point,
                    point: {
                        pixelSize: opt.pointSize,
                        color: opt.pointColor
                    },
                    label: {
                        text: '\n\n\n\n' + ((Cesium.Cartographic.fromCartesian(point).longitude) / Math.PI * 180).toFixed(1),
                        font: '16px sans-serif',
                        fillColor: opt.textColor
                    }
                });
            });
        }
        /**
         * 添加点附加纬度文字
         * @param pos Array.[Cartesian3]
         */
        addPointWithLatitude(pos, option) {
            let opt = Object.assign(this.getDefault(), option);
            return pos.map(point => {
                return this.viewer.entities.add({
                    position: point,
                    point: {
                        pixelSize: opt.pointSize,
                        color: opt.pointColor
                    },
                    label: {
                        text: '\n\n' + ((Cesium.Cartographic.fromCartesian(point).latitude) / Math.PI * 180).toFixed(1),
                        font: '16px sans-serif',
                        fillColor: opt.textColor
                    }
                });
            });
        }
        /**
         * 添加单点和文字
         * @param pos Cartesian3
         * @param text 文本信息
         * @return Entity
         */
        addSinglePointWithText(pos, text, option) {
            let opt = Object.assign(this.getDefault(), option);
            return this.viewer.entities.add({
                position: pos,
                point: {
                    pixelSize: opt.pointSize,
                    color: opt.pointColor
                },
                label: {
                    text: text,
                    font: '16px sans-serif',
                    fillColor: opt.textColor
                }
            });
        }
    }
    ZMapVolume.EntityTool = EntityTool;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    let SelectType;
    (function (SelectType) {
        SelectType[SelectType["NONE"] = 0] = "NONE";
        SelectType[SelectType["PICKED"] = 1] = "PICKED";
        SelectType[SelectType["INSERT"] = 2] = "INSERT";
    })(SelectType || (SelectType = {}));
    /*
    * param参数 *为空则为默认值
    * name_X:x轴名称
    * split_X:x轴分段数
    * max_X:x轴最大值
    * min_X:x轴最小值
    * tolerance:点击容差
    * ...
    * line:二维数组,[[x1,y1],[x2,y2],...]
    * */
    class FilterEdit {
        /**
         * 构造一个属性过滤编辑器
         * @param element
         * @param param
         */
        constructor(element, param) {
            // 
            this._pointSize = 4;
            this._selPointSize = 5;
            ///
            this._margin = [40, 20, 50, 40];
            this._arrowLen = 30;
            ///
            if (!(element instanceof Element)) {
                throw new Error("请传入一个正确的页面元素");
            }
            ///
            this.element = element;
            /// 默认值
            param = Object.assign({
                name_X: "属性值",
                split_X: 4,
                min_X: 0,
                max_X: 100,
                min_Value: 0,
                max_Value: 100,
                //
                name_Y: "透明度",
                split_Y: 5,
                min_Y: 0,
                max_Y: 100,
                pointSize: 4,
                bkColor: "#22344C",
                axisColor: "#C6CDCC",
                lineColor: "#FF0000",
                fontColor: "#C6CDCC",
                textSpace: 2,
            }, param);
            this._name_X = param.name_X;
            this._split_X = param.split_X;
            this._min_X = param.min_X;
            this._max_X = param.max_X;
            this._name_Y = param.name_Y;
            this._split_Y = param.split_Y;
            this._min_Y = param.min_Y;
            this._max_Y = param.max_Y;
            this._min_Value = param.min_Value;
            this._max_Value = param.max_Value;
            /// 
            this._pointSize = param.pointSize;
            this._bkColor = param.bkColor;
            this._axisColor = param.axisColor;
            this._lineColor = param.lineColor;
            this._fontColor = param.fontColor;
            this._textSpace = param.textSpace;
            ///
            this._line = param.line ? param.line : [[0, 0], [this._max_X, this._max_Y]];
            this._init(this.element);
        }
        get min_Value() { return this._min_Value; }
        get max_Value() { return this._max_Value; }
        set filterLine(line) {
            this._line = line;
            this._draw();
            ///
            this.onchangestatus(0, this._line);
        }
        get filterLine() { return this._line; }
        /**
         * 初始化
         * @param div
         */
        _init(div) {
            ///
            this._width = div.offsetWidth;
            this._height = div.offsetHeight;
            /// 
            this._area = new ZMapVolume.LongLatBox(this._margin[0], this._margin[1], 0, this._width - this._margin[2], this._height - this._margin[3], 0);
            ///
            this._painter = document.createElement('canvas');
            this._painter.width = this._width;
            this._painter.height = this._height;
            ///
            div.appendChild(this._painter);
            div.style.zIndex = '1000';
            /// 
            this._context = this._painter.getContext('2d');
            ///
            this._toDrawCoord();
            let selectedPoint = { type: SelectType.NONE };
            /// 鼠标按下
            this._painter.addEventListener('mousedown', (e) => {
                /// 没有选中点
                if (e.buttons === 1 && selectedPoint.type == SelectType.INSERT) {
                    //插入点
                    this._trans_line.splice(selectedPoint.index, 0, [e.offsetX, e.offsetY]);
                    ///
                    this._draw(selectedPoint.index);
                    this._toLoginCoord();
                }
                /// 右键
                else if (e.buttons === 2 && selectedPoint.type == SelectType.PICKED) {
                    if (selectedPoint.index != 0 && selectedPoint.index != this._trans_line.length - 1) {
                        this._trans_line.splice(selectedPoint.index, 1);
                        this._draw();
                        this._toLoginCoord();
                    }
                }
            });
            /// 鼠标移动
            this._painter.addEventListener('mousemove', e => {
                console.log(`move bt:${e.button} id:${selectedPoint.index}, type:${selectedPoint.type}`);
                const a = this._area;
                const xmin = a.xmin, xmax = a.xmax;
                const ymin = this._height - a.ymax, ymax = this._height - a.ymin;
                /// 左键按下
                if (e.buttons === 1 && selectedPoint.type !== SelectType.NONE) {
                    const xposition = Cesium.Math.clamp(e.offsetX, xmin, xmax);
                    const yposition = Cesium.Math.clamp(e.offsetY, ymin, ymax);
                    ///
                    const selPoint = selectedPoint.index;
                    if (selPoint == 0)
                        this._trans_line[selPoint] = [xmin, yposition];
                    else if (selPoint == this._trans_line.length - 1)
                        this._trans_line[selPoint] = [xmax, yposition];
                    else {
                        this._trans_line[selPoint] = [xposition, yposition];
                        for (let i = 1; i < this._trans_line.length - 1 - selPoint; i++) {
                            if (this._trans_line[selPoint + i][0] <= e.offsetX)
                                this._trans_line[selPoint + i][0] = e.offsetX;
                        }
                        for (let i = 0; i < selPoint; i++) {
                            if (this._trans_line[i][0] >= e.offsetX)
                                this._trans_line[i][0] = e.offsetX;
                        }
                        if (e.offsetX >= xmax) {
                            this._trans_line.length = selPoint + 1;
                        }
                        if (e.offsetX <= xmin) {
                            this._trans_line.splice(0, selPoint);
                            selectedPoint.index = 0;
                        }
                    }
                    ///
                    this._draw(selPoint);
                    this._toLoginCoord();
                    ///
                    this.onchangestatus(selPoint, this._line);
                }
                /// 
                else if (e.buttons === 0) {
                    //mouseon
                    let point = [e.offsetX, e.offsetY];
                    selectedPoint = this._getSelectedPoint(point);
                    ///
                    if (selectedPoint.type == SelectType.INSERT &&
                        (point[0] < xmin || point[0] > xmax || point[1] < ymin || point[1] > ymax)) {
                        selectedPoint.type = SelectType.NONE;
                    }
                    ///
                    this._draw();
                    if (selectedPoint.type === SelectType.PICKED) {
                        this._draw_select(selectedPoint.index);
                    }
                }
            });
            /// 鼠标弹起
            this._painter.addEventListener('mouseup', (e) => {
                this.onchangestatus(0, this._line);
            });
            ///
            this._painter.addEventListener('mouseout', (e) => {
                this.onchangestatus(0, this._line);
            });
            ///
            this._draw();
        }
        _reset() {
            this._line = [[0, 0], [this._max_X, this._max_Y]];
            this._toDrawCoord();
            this._draw();
        }
        _resetMax() {
            this._line = [[0, this._max_Y], [this._max_X, this._max_Y]];
            this._toDrawCoord();
            this._draw();
        }
        _resetPoints(points) {
            this._line = points;
            this._toDrawCoord();
            this._draw();
        }
        _draw(i) {
            this.clearCanvas();
            this._draw_axis();
            this._draw_line(i);
        }
        /** 绘制坐标轴 */
        _draw_axis() {
            let context = this._context;
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = this._axisColor;
            context.font = "10px Courier New";
            context.fillStyle = this._fontColor;
            /// 
            const a = this._area;
            const al = this._arrowLen;
            const as = 4;
            const w = this._width;
            const h = this._height;
            const ox = a.xmin, oy = h - a.ymin;
            const tx = a.xmax, ty = h - a.ymax;
            const txa = tx + al;
            const tya = ty - al;
            //y
            context.moveTo(ox, oy);
            context.lineTo(ox, tya);
            context.lineTo(ox - as, tya + as);
            context.moveTo(ox, tya);
            context.lineTo(ox + as, tya + as);
            //x
            context.moveTo(ox, oy);
            context.lineTo(txa, oy);
            context.lineTo(txa - as, oy - as);
            context.moveTo(txa, oy);
            context.lineTo(txa - as, oy + as);
            //x刻度
            context.textAlign = 'left';
            const cell_x = a.size[0] / this._split_X;
            const cell_x_value = Math.floor((this._max_X - this._min_X) / this._split_X);
            for (let i = 1; i <= this._split_X; i++) {
                const lx = cell_x * i + ox;
                context.moveTo(lx, oy);
                //画长标签
                if (i % this._textSpace == 1) {
                    context.lineTo(lx, oy + 5);
                    context.fillText((this._min_X + cell_x_value * i).toFixed(0), lx - 5, oy + 15);
                }
                //画短标签
                else {
                    context.lineTo(lx, oy + 3);
                }
            }
            ///
            context.moveTo(tx, oy);
            context.lineTo(tx, ty);
            //y刻度
            context.textAlign = 'right';
            const cell_y = a.size[1] / this._split_Y;
            const cell_y_value = Math.floor((this._max_Y - this._min_Y) / this._split_Y);
            for (let i = 0; i < this._split_Y; i++) {
                const ly = (ty + cell_y * i);
                context.moveTo(ox, ly);
                context.lineTo(tx, ly);
                context.fillText((this._max_Y - cell_y_value * i).toFixed(0), ox - 5, ly);
            }
            ///
            context.stroke();
            /// 坐标轴名称
            context.textAlign = 'left';
            context.fillText(this._name_X, txa - 15, oy + 15);
            ///
            context.textAlign = 'right';
            context.fillText(this._name_Y, ox - 5, tya + 10);
        }
        _draw_line(position) {
            const context = this._context;
            context.lineWidth = 1;
            context.strokeStyle = this._lineColor;
            context.beginPath();
            context.moveTo(this._trans_line[0][0], this._trans_line[0][1]);
            for (let i = 1; i < this._trans_line.length; i++) {
                context.lineTo(this._trans_line[i][0], this._trans_line[i][1]);
            }
            context.stroke();
            context.lineWidth = 1;
            context.fillStyle = this._lineColor;
            for (let i = 0; i < this._trans_line.length; i++) {
                context.beginPath();
                context.arc(this._trans_line[i][0], this._trans_line[i][1], this._pointSize, 0, Math.PI * 2);
                context.fill();
            }
            if (position !== undefined) {
                this._draw_select(position);
            }
        }
        _draw_select(i) {
            let context = this._context;
            context.lineWidth = 1;
            context.fillStyle = this._lineColor;
            context.strokeStyle = this._axisColor;
            context.beginPath();
            context.arc(this._trans_line[i][0], this._trans_line[i][1], this._selPointSize, 0, Math.PI * 2);
            context.stroke();
        }
        clearCanvas() {
            let context = this._context;
            context.fillStyle = this._bkColor;
            context.fillRect(0, 0, this._width, this._height);
        }
        _toDrawCoord() {
            this._trans_line = [];
            const a = this._area;
            const w = this._width;
            const h = this._height;
            const vx = (this._max_X - this._min_X);
            const vy = (this._max_Y - this._min_Y);
            for (let i = 0; i < this._line.length; i++) {
                let re = this._line[i].slice(0);
                re[0] = (re[0] - this._min_X) / vx * a.size[0] + a.xmin;
                re[1] = h - (re[1] - this._min_Y) / vy * a.size[1] - a.ymin;
                this._trans_line.push(re);
            }
        }
        _toLoginCoord() {
            ///
            const a = this._area;
            const w = this._width;
            const h = this._height;
            const vx = (this._max_X - this._min_X);
            const vy = (this._max_Y - this._min_Y);
            this._line = [];
            for (let i = 0; i < this._trans_line.length; i++) {
                let re = this._trans_line[i].slice(0);
                re[0] = (re[0] - a.xmin) / a.size[0] * vx + this._min_X;
                re[1] = (h - re[1] - a.ymin) / a.size[1] * vy + this._min_Y;
                this._line.push(re);
            }
        }
        onchangestatus(positon, line) { }
        /**
         * 计算两点距离的平方
         * @param p1
         * @param p2
         */
        static _squareDistance(p1, p2) {
            const x = p1[0] - p2[0];
            const y = p1[1] - p2[1];
            return (x * x + y * y);
        }
        /**
         * 获取鼠标附近的点
         * @param point
         * @param line
         * @param tole
         */
        _getSelectedPoint(point) {
            const line = this._trans_line, tole = this._pointSize + 1;
            const max = tole * tole;
            for (let i = 0; i < line.length; i++) {
                const sd = FilterEdit._squareDistance(point, line[i]);
                if (sd <= max)
                    return { type: SelectType.PICKED, index: i, point: line[i] };
            }
            for (let i = 0; i < line.length; i++) {
                if (point[0] < line[i][0])
                    return { type: SelectType.INSERT, index: i, point };
            }
            ///
            return { type: SelectType.NONE, point };
        }
    }
    ZMapVolume.FilterEdit = FilterEdit;
})(ZMapVolume || (ZMapVolume = {}));
/// <reference path="../VolumeBindingable.ts" />
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 栅格线工具
     *
     * ------------------------to
     * |                        |
     * |                        |
     * |                        |
     * |                        |
     * |                        |
     * from---------------------
     * @author flake
     * @example new GridLine(map3DView,{longitude:100,latitude:25,height:0},{longitude:120.5,latitude:32.5,height:0})
     */
    class GridLine extends ZMapVolume.VolumeBiningable {
        constructor(viewer, opt) {
            ///
            super(viewer);
            this.xSteps = [];
            this.ySteps = [];
            this.zSteps = [];
            this.gridLine = [];
            this.scale = [1, 1, 1];
            let default_opt = {
                stepX: 1,
                stepY: 1,
                stepZ: 100,
                useOrigin: false,
            };
            ///
            this.opt = Object.assign(default_opt, opt);
            ///
            this._entityTool = new ZMapVolume.EntityTool(this._viewer);
            if (this.opt.style)
                this._entityTool.defaultOpt = this.opt.style;
        }
        /**
         * get/set 工具样式
         * 配置项详见EntityTool._default
         * @see EntityTool.defaultOpt
         */
        get style() {
            return this._entityTool.getDefault();
        }
        set style(opt) {
            this._entityTool.defaultOpt = opt;
            this.update(this._box);
        }
        get option() {
            return this.opt;
        }
        set option(o) {
            this.opt = Object.assign(this.opt, o);
            this.update(this._box);
        }
        set scales(sc) {
            this.scale = sc;
        }
        get scales() {
            return this.scale;
        }
        /**
         * 更新数据
         */
        update(box) {
            this._box = box;
            this.destroy();
            this.init();
        }
        /**
         * 清除【完全清除还是隐藏功能待定】
         */
        clean() {
        }
        ///
        init() {
            ///
            const { xmin, ymin, zmin, xmax, ymax, zmax } = this._box;
            ///
            this.xSteps = this.computeMiddleSpacing(xmin, xmax, this.opt.stepX);
            this.ySteps = this.computeMiddleSpacing(ymin, ymax, this.opt.stepY);
            const diff = Math.abs(zmax - zmin); //高度差，使用这个属性和实例上的stepZ属性计算z轴的网格
            while (diff / this.opt.stepZ > 10) {
                this.opt.stepZ *= 10;
            }
            ///
            this.zSteps = (diff && this.opt.stepZ) ? this.computeMiddleSpacing(zmin, zmax, this.opt.stepZ) : [];
            /// 
            this.onShowChanged(this.show);
        }
        onShowChanged(show) {
            if (show && this.gridLine.length == 0) {
                this.createGrid();
            }
            this.gridLine.forEach((line) => {
                line.show = show;
            });
        }
        /**
         * 计算中间间距<br>
         *
         * ·    ·    ·    · ·
         * @param min 最小值
         * @param max 最大值
         * @param step 步长
         * @example (1,5.5,1) => [1,2,3,4,5,5.5]
         */
        computeMiddleSpacing(min, max, step) {
            let arr = [], spacing = max - min;
            for (let i = 0; i < spacing / step; i++) {
                arr.push(step * i);
            }
            if (spacing % step !== 0) { //不是整除的时候 添加差值
                arr.push(spacing);
            }
            return arr;
        }
        createGrid() {
            this.gridLine = this.gridLine.concat(this._lineOnX(), this._lineOnY(), this._lineOnZ());
        }
        _lineOnX() {
            return this._lineAxis(this.xSteps, this.ySteps, this.zSteps, [0, 1, 2], [0, 20]);
        }
        _lineOnY() {
            return this._lineAxis(this.ySteps, this.xSteps, this.zSteps, [1, 0, 2], [-40, 0]);
        }
        _lineOnZ() {
            return this._lineAxis(this.zSteps, this.xSteps, this.ySteps, [2, 0, 1], [-40, 20]);
        }
        _lineAxis(steps0, steps1, steps2, axis, offset) {
            const entitys = [];
            const fr = this._box.from;
            const start0 = [fr.longitude, fr.latitude, fr.height], start1 = [0, 0, 0];
            steps0.forEach(step0 => {
                const line1 = steps1.map(step1 => {
                    start1[axis[0]] = start0[axis[0]] + step0;
                    start1[axis[1]] = start0[axis[1]] + step1;
                    start1[axis[2]] = start0[axis[2]];
                    return Cesium.Cartesian3.fromDegrees(start1[0], start1[1], start1[2]);
                });
                const line2 = steps2.map(step2 => {
                    start1[axis[0]] = start0[axis[0]] + step0;
                    start1[axis[1]] = start0[axis[1]];
                    start1[axis[2]] = start0[axis[2]] + step2;
                    return Cesium.Cartesian3.fromDegrees(start1[0], start1[1], start1[2]);
                });
                line2.reverse();
                line2.length = line2.length - 1;
                const lines = line2.concat(line1);
                entitys.push(this._entityTool.addPloyline(lines));
                start1[axis[0]] = start0[axis[0]] + step0;
                start1[axis[1]] = start0[axis[1]];
                start1[axis[2]] = start0[axis[2]];
                const pos = Cesium.Cartesian3.fromDegrees(start1[0], start1[1], start1[2]);
                const labeltext = (this._vol.getRealValue(start1[axis[0]], axis[0])).toFixed(1);
                const label = this._entityTool.addSinglePointWithText(pos, labeltext);
                label.label.pixelOffset = new Cesium.Cartesian2(offset[0], offset[1]);
                entitys.push(label);
            });
            ///
            return entitys;
        }
        ///
        destroy() {
            let collection = this._viewer.entities;
            this.gridLine.forEach(entity => {
                collection.remove(entity);
            });
            this.gridLine = [];
        }
    }
    ZMapVolume.GridLine = GridLine;
})(ZMapVolume || (ZMapVolume = {}));
/// <reference path="../VolumeBindingable.ts" />
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 范围切面工具
     * @author flake
     */
    class RectPlane extends ZMapVolume.VolumeBiningable {
        ///
        constructor(map3dView, opt) {
            super(map3dView);
            this.eightPoint = {};
            ///
            this._xoy = new Cesium.Plane(Cesium.Cartesian3.UNIT_Z, 0);
            this._yoz = new Cesium.Plane(Cesium.Cartesian3.UNIT_X, 0);
            this._xoz = new Cesium.Plane(Cesium.Cartesian3.UNIT_Y, 0);
            ///
            let default_opt = {
                sliceSize: 20,
            };
            this.opt = Object.assign(default_opt, opt);
            this.points = [];
            // 设置默认样式
            if (this.opt.style)
                this.style = this.opt.style;
            !this.planes && (this.planes = {});
        }
        /**
         * get/set 工具样式
         * 配置项详见EntityTool._default
         * @see EntityTool.defaultOpt
         * @return {{lineWidth: number, lineColor: Color}}
         */
        get style() {
            return this._entityTool.getDefault();
        }
        set style(opt) {
            this._entityTool.defaultOpt = opt;
            this.update(this._box);
        }
        update(box) {
            this._box = box;
            this.destroy();
            this.init();
        }
        /** */
        clean() { }
        /**
         * 绑定MapVolume
         * @param vol MapVolume实例
         */
        binding(vol) {
            this._vol = vol;
        }
        destroy() {
            let collection = this._viewer.entities;
            for (let key in this.planes) {
                collection.remove(this.planes[key]);
            }
            this.points && this.points.forEach(entity => {
                collection.remove(entity);
            });
            this.planes = {};
            this.points = [];
        }
        /**
         * 初始化，创建曲面
         */
        init() {
            this.height = Math.abs(this._box.zmax - this._box.zmin);
            this._calcPoints();
            this._calcPlanes();
            ///
            const ps = this.eightPoint;
            const ss = this.opt.sliceSize;
            const exp = ZMapVolume.ConvertTool.expansionC3;
            const createSurface = (cb) => {
                return this._entityTool.addPloyline(new Cesium.CallbackProperty(cb, false));
            };
            this.copy_to = ZMapVolume.ConvertTool.c3ByDegrees(this._box.to);
            this.copy_from = ZMapVolume.ConvertTool.c3ByDegrees(this._box.from);
            /// 创建8个曲面
            this.planes.p_top = createSurface(() => { return [...exp(ps.$001, ps.$101, ss), ...exp(ps.$111, ps.$011, ss), ps.$001]; });
            this.planes.p_bottom = createSurface(() => { return [...exp(ps.$000, ps.$100, ss), ...exp(ps.$110, ps.$010, ss), ps.$000]; });
            this.planes.p_left = createSurface(() => { return [ps.$000, ps.$010, ps.$011, ps.$001, ps.$000]; });
            this.planes.p_right = createSurface(() => { return [...exp(ps.$000, ps.$100, ss), ...exp(ps.$110, ps.$010, ss), ps.$000]; });
            this.planes.p_front = createSurface(() => { return [...exp(ps.$000, ps.$100, ss), ...exp(ps.$101, ps.$001, ss), ps.$000]; });
            this.planes.p_behind = createSurface(() => { return [...exp(ps.$010, ps.$110, ss), ...exp(ps.$111, ps.$011, ss), ps.$010]; });
            ///
            this.points = this._entityTool.addPoint(this.sixPoint);
            this.handler();
            /// 
            this.onShowChanged(this.show);
        }
        /**
         * 获取坐标的8+6个点 ${z}{y}{z}
         *       _________________$111
         *      /               / |
         *     /_______________/  |
         *     |               |  |
         *     |               | /
         * $000|_______________|/
         * @param from this.from
         * @param to this.to
         * @private
         */
        _calcPoints(from, to) {
            const cllh = Cesium.Cartesian3.fromDegrees;
            from = from || this._box.from;
            to = to || this._box.to;
            const xmin = from.longitude, ymin = from.latitude, hmin = from.height, xmax = to.longitude, ymax = to.latitude, hmax = to.height, half_x = (xmax + xmin) / 2, half_y = (ymax + ymin) / 2, half_z = (hmax + hmin) / 2;
            const $000 = cllh(xmin, ymin, hmin), $100 = cllh(xmax, ymin, hmin), $110 = cllh(xmax, ymax, hmin), $010 = cllh(xmin, ymax, hmin), $001 = cllh(xmin, ymin, hmax), $101 = cllh(xmax, ymin, hmax), $011 = cllh(xmin, ymax, hmax), $111 = cllh(xmax, ymax, hmax), $top = cllh(half_x, half_y, hmax), $left = cllh(xmin, half_y, half_z), $right = cllh(xmax, half_y, half_z), $bottom = cllh(half_x, half_y, hmin), $front = cllh(half_x, ymin, half_z), $behind = cllh(half_x, ymax, half_z);
            ///
            Object.assign(this.eightPoint, { $000, $100, $110, $010, $001, $101, $011, $111 });
            ///
            this.sixPoint = [$top, $left, $right, $bottom, $front, $behind];
        }
        _calcPlanes() {
            ///
            const $left = this.sixPoint[1], $top = this.sixPoint[0], $behind = this.sixPoint[5];
            const $center = Cesium.Cartesian3.fromDegrees(this._box.center[0], this._box.center[1], this._box.center[2]);
            /// 
            const temp = new Cesium.Cartesian3();
            Cesium.Cartesian3.subtract($left, $center, temp);
            Cesium.Cartesian3.normalize(temp, temp);
            this._yoz = Cesium.Plane.fromPointNormal($center, temp, this._yoz);
            Cesium.Cartesian3.subtract($behind, $center, temp);
            Cesium.Cartesian3.normalize(temp, temp);
            this._xoz = Cesium.Plane.fromPointNormal($center, temp, this._xoz);
            Cesium.Cartesian3.subtract($top, $center, temp);
            Cesium.Cartesian3.normalize(temp, temp);
            this._xoy = Cesium.Plane.fromPointNormal($center, temp, this._xoy);
        }
        _setPoints(index, c3) {
            let point = ZMapVolume.ConvertTool.c3ToCartographicDegrees(c3);
            let from = ZMapVolume.ConvertTool.c3ToCartographicDegrees(this.copy_from);
            let to = ZMapVolume.ConvertTool.c3ToCartographicDegrees(this.copy_to);
            ///
            const clamp = (v, min, max) => { return v < min ? min : v > max ? max : v; };
            switch (index) {
                case 0: //上面
                    to.height = clamp(point.height, this._box.from.height, this._box.to.height);
                    break;
                case 2: //右边
                    to.longitude = clamp(point.longitude, this._box.from.longitude, this._box.to.longitude);
                    break;
                case 5: //后面
                    to.latitude = clamp(point.latitude, this._box.from.latitude, this._box.to.latitude);
                    break;
                case 1: //左边
                    from.longitude = clamp(point.longitude, this._box.from.longitude, this._box.to.longitude);
                    break;
                case 3: //下面
                    from.height = clamp(point.height, this._box.from.height, this._box.to.height);
                    break;
                case 4: //前面
                    from.latitude = clamp(point.latitude, this._box.from.latitude, this._box.to.latitude);
                    break;
            }
            this.copy_to = ZMapVolume.ConvertTool.c3ByDegrees(to);
            this.copy_from = ZMapVolume.ConvertTool.c3ByDegrees(from);
            ///
            this._calcPoints(from, to);
            ///
            this.points.forEach((entity, index) => {
                entity.position = this.sixPoint[index];
            });
            //体数据范围更新
            if (this._vol) {
                this._vol.range = ZMapVolume.LongLatBox.fromStartEnd(from, to);
            }
        }
        handler() {
            this.control = new Cesium.ScreenSpaceEventHandler(this._viewer.scene.canvas);
            let handler = this.control;
            let selectPoint = -1;
            let lbottomDown = false;
            const temp_ray = new Cesium.Ray();
            const sscc = this._viewer.scene.screenSpaceCameraController;
            //左键按下
            handler.setInputAction(() => {
                lbottomDown = true;
                if (selectPoint > -1)
                    sscc.enableRotate = false;
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            //左键松开
            handler.setInputAction(() => {
                lbottomDown = false;
                sscc.enableRotate = true;
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
            //鼠标移动
            handler.setInputAction(e => {
                /// 
                if (!this.show)
                    return;
                ///
                const ray = this._viewer.camera.getPickRay(e.endPosition, temp_ray);
                if (lbottomDown && selectPoint != -1) {
                    let intersectPoint = this._getIntersectPointOnPlane(selectPoint, this.sixPoint[selectPoint], ray);
                    if (intersectPoint)
                        this._setPoints(selectPoint, intersectPoint);
                }
                else {
                    selectPoint = this._pickPoint(ray);
                    this._hoverPoint(selectPoint);
                }
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        }
        /**
         * 鼠标移入处理 </br>
         *
         * @param e
         */
        _hoverPoint(hover) {
            if (hover != -1) {
                this.points[hover].point.pixelSize = 1.5 * this.style.pointSize;
            }
            else {
                this.points.forEach(e => e.point.pixelSize = this.style.pointSize);
            }
        }
        _pickPoint(ray) {
            let point = -1;
            let invt = Number.MAX_VALUE;
            const temp_interval = new Cesium.Interval();
            const canvas = this._viewer.canvas;
            const width = canvas.clientWidth;
            const height = canvas.clientHeight;
            const bs = new Cesium.BoundingSphere(Cesium.Cartesian3.ZERO, 1);
            this.sixPoint.forEach((e, i) => {
                Cesium.Cartesian3.clone(e, bs.center);
                bs.radius = 1;
                ///
                const mp = this._viewer.camera.getPixelSize(bs, width, height);
                bs.radius = mp * this._entityTool.defaultOpt.pointSize;
                const ivl = Cesium.IntersectionTests.raySphere(ray, bs, temp_interval);
                if (ivl !== undefined && ivl.start < invt) {
                    invt = ivl.start;
                    point = i;
                }
            });
            return point;
        }
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
        _getIntersectPointOnPlane(index, point, ray) {
            //$top, $left, $right, $bottom, $front, $behind
            let p1, p2;
            switch (index) {
                case 1:
                case 2:
                    p1 = this._xoy, p2 = this._xoz;
                    break;
                case 4:
                case 5:
                    p1 = this._xoy, p2 = this._yoz;
                    break;
                case 0:
                case 3:
                    p1 = this._xoz;
                    p2 = this._yoz;
                    break;
            }
            const cos = Cesium.Cartesian3.dot(ray.direction, this._xoy.normal);
            const plane = Math.abs(cos) < 0.707 ? p1 : p2;
            ///
            let po = Cesium.IntersectionTests.rayPlane(ray, plane);
            //未产生交点的时候 使用红点
            return po || point;
        }
        onShowChanged(show) {
            this.points.forEach(entity => {
                entity.show = show;
            });
            //隐藏面
            for (let key in this.planes) {
                this.planes[key].show = show;
            }
        }
    }
    ZMapVolume.RectPlane = RectPlane;
})(ZMapVolume || (ZMapVolume = {}));
var ZMapVolume;
(function (ZMapVolume) {
    /**
     * 页面的切片工具对应的控制工具
     */
    class SliceControl {
        /**
         * 构造函数
         * @param slice {SliceTool} SliceTool实例
         * @param el {String | HTMLElement | null} 元素，为null时会默认创建一个元素
         * @param opt {
         *     buttonClick(event,planeType,show)：xyz按钮的点击事件的回调,event：元素事件对象；planeType：轴对应的面；show：['show','hide']
         *     move(call,ele,type) xyz轴移动的回调,call移动的实时信息；ele:['X','Y','Z'];type:['move','end']
         * }
         */
        constructor(slice, el, opt) {
            this.slice = slice;
            this.opt = opt || {};
            this._createRoot(el);
            this._createChild();
            this.init();
            this.bindingEvent();
            //储存当前的位置
            this._x = 0.5;
            this._y = 0.5;
            this._z = 0.5;
        }
        init() {
            if (this.inited)
                return;
            //添加默认的class和属性，请使用slice.control.css来控制样式
            this.root.classList.add("scroll-control");
            this.root.setAttribute("data-allow", "volume");
            //xyz 显示隐藏控制
            this.root.addEventListener("click", e => {
                if (e.target.tagName.toLowerCase() === 'span') {
                    let map = { X: ZMapVolume.SlicePlane.YOZ, Y: ZMapVolume.SlicePlane.XOZ, Z: ZMapVolume.SlicePlane.XOY };
                    let type = map[e.target.innerHTML];
                    if (e.target.className === 'active') {
                        e.target.className = '';
                        this.slice.showPlane(type, true);
                    }
                    else {
                        e.target.className = 'active';
                        this.slice.showPlane(type, false);
                    }
                    if (typeof this.opt.buttonClick === 'function') {
                        this.opt.buttonClick(e, type, e.target.className === 'active' ? 'show' : 'hide');
                    }
                }
                e.stopPropagation();
            });
            this.inited = true;
        }
        _createRoot(el) {
            let root = document.createElement("div");
            if (typeof el === 'string') {
                document.querySelector(el).appendChild(root);
            }
            else if (typeof el === 'object' && el instanceof HTMLElement) {
                el.appendChild(root);
            }
            else {
                document.body.appendChild(root);
            }
            this.root = root;
            return root;
        }
        _createChild() {
            this.root.innerHTML = this._createChildEle('X')
                + this._createChildEle('Y')
                + this._createChildEle('Z');
        }
        _createChildEle(type) {
            return `
                <div class="control">
                    <span>${type}</span>
                    <div class="scroll" id="scrollBar${type}">
                        <div class="bar"></div>
                        <div class="mask"></div>
                    </div>
                </div>
    `;
        }
        bindingEvent() {
            if (typeof this.opt.move !== 'function') {
                this.opt.move = function () {
                };
            }
            this._createBar({
                el: "#scrollBarX",
                move: call => {
                    this._sliceOffset('_x', call);
                    this.opt.move(call, 'X', 'move');
                },
                end: call => {
                    this._sliceOffset('_x', call);
                    this.opt.move(call, 'X', 'end');
                }
            });
            this._createBar({
                el: "#scrollBarY",
                move: call => {
                    this._sliceOffset('_y', call);
                    this.opt.move(call, 'Y', 'move');
                },
                end: call => {
                    this._sliceOffset('_y', call);
                    this.opt.move(call, 'Y', 'end');
                }
            });
            this._createBar({
                el: "#scrollBarZ",
                move: call => {
                    this._sliceOffset('_z', call);
                    this.opt.move(call, 'Z', 'move');
                },
                end: call => {
                    this._sliceOffset('_z', call);
                    this.opt.move(call, 'Z', 'end');
                }
            });
        }
        /**
         * 设置体数据切片的位置
         * @param key 轴对应的变量
         * @param call 轴移动的回调参数
         * @private
         */
        _sliceOffset(key, call) {
            this[key] = call.scale;
            this.slice.offset = [this._z, this._x, this._y];
        }
        _createBar(obj) {
            // 获取元素
            let scrollBar = this.root.querySelector(obj.el);
            let bar = scrollBar.children[0];
            let mask = scrollBar.children[1];
            let timer = new Date().getTime();
            // 拖动
            bar.onmousedown = function (event) {
                let leftVal = event.clientX - this.offsetLeft;
                // 拖动放到down的里面
                let that = this;
                document.onmousemove = function (event) {
                    let new_time = new Date().getTime();
                    if (new_time - timer < 17) {
                        return;
                    }
                    timer = new_time;
                    that.style.left = event.clientX - leftVal + "px";
                    // 限制条件
                    let val = parseInt(that.style.left);
                    if (val < 0) {
                        that.style.left = 0;
                    }
                    else if (val > 382) {
                        that.style.left = "382px";
                    }
                    // 移动的距离为遮罩的宽度
                    mask.style.width = that.style.left;
                    // 回调
                    if (typeof obj.move === 'function')
                        obj.move({
                            type: 'move',
                            scrollBar: scrollBar,
                            elText: obj.el,
                            scale: (parseInt(that.style.left) / 382)
                        });
                    // 清除拖动 --- 防止鼠标已经弹起时还在拖动
                    //window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
                };
                // 鼠标抬起停止拖动
                document.onmouseup = function () {
                    if (typeof obj.end === 'function')
                        obj.end({
                            type: 'end',
                            scrollBar: scrollBar,
                            elText: obj.el,
                            scale: (parseInt(that.style.left) / 382)
                        });
                    document.onmousemove = null;
                    document.onmouseup = null;
                };
            };
        }
        destroy() {
            this.root.parentNode.removeChild(this.root);
            this.slice = null;
            this.opt = null;
        }
    }
    ZMapVolume.SliceControl = SliceControl;
})(ZMapVolume || (ZMapVolume = {}));
/// <reference path="../VolumeBindingable.ts" />
var ZMapVolume;
(function (ZMapVolume) {
    let SlicePlane;
    (function (SlicePlane) {
        SlicePlane[SlicePlane["XOY"] = 0] = "XOY";
        SlicePlane[SlicePlane["YOZ"] = 1] = "YOZ";
        SlicePlane[SlicePlane["XOZ"] = 2] = "XOZ";
    })(SlicePlane = ZMapVolume.SlicePlane || (ZMapVolume.SlicePlane = {}));
    /**
     * 切片工具
     * @author flake
     * @example new SliceTool(map3DView,{longitude:108.5,latitude:18,height:0},{longitude:119,latitude:27,height:0})
     */
    class SliceTool extends ZMapVolume.VolumeBiningable {
        ///
        constructor(map3dView, opt) {
            super(map3dView);
            ///
            let default_opt = {
                sliceSize: 20 //分段个数 ，两点之间的曲线polyline和经纬度线圈不重合，采取两点分割成多个点，来近似重合
            };
            this.opt = Object.assign(default_opt, opt);
            this.blongElement = opt.blongElement;
            ///
            this._planes = [
                { offset: 0.5, points: null, entity: null },
                { offset: 0.5, points: null, entity: null },
                { offset: 0.5, points: null, entity: null }
            ];
            // 设置默认样式
            if (this.opt.style) {
                this.style = this.opt.style;
            }
        }
        /**
         * get/set 工具样式
         * 配置项详见EntityTool._default
         * @see EntityTool.defaultOpt
         */
        get style() {
            return this._entityTool.getDefault();
        }
        set style(opt) {
            this._entityTool.defaultOpt = opt;
            this.destroy();
            this.update(this._box);
        }
        init() {
            //初始化控制工具
            if (ZMapVolume.SliceControl && !this.sliceControl)
                this.sliceControl = new ZMapVolume.SliceControl(this, this.blongElement || null, this.opt);
            ///
            //this.height = Math.abs(this.box.zmax - this.box.zmin);
            const createPlane = (cb) => {
                return this._entityTool.addPloyline(new Cesium.CallbackProperty(cb, false));
            };
            //初始化三个面
            for (let i = 0; i < 3; ++i) {
                const p = this._planes[i];
                p.points = this._getPlanePoints(i, p.offset);
                p.entity = createPlane(() => { return p.points; });
            }
            this.onShowChanged(this.show);
        }
        update(box) {
            this._box = box;
            this.destroy();
            this.init();
        }
        clean() {
        }
        ///
        destroy() {
            this._planes.forEach(p => {
                p.entity && this._viewer.entities.remove(p);
            });
        }
        get control() {
            return this.sliceControl;
        }
        /**
         * 使用自定义的sliceControl
         * @param sliceControl
         */
        set control(sliceControl) {
            this.sliceControl.destroy();
            this.sliceControl = sliceControl;
        }
        ///
        /**
         * 根据比例获取构建面的经纬度列表
         * @param type 类型【'xoy','yoz','xoz'】分别表示【‘平行于地表的面’，‘垂直于地表的面 南北方向’，‘垂直于地表的面 东西方向’】
         * @param pos 位置比例[0-1]
         * @returns {[]} like [lng,lat,height,lng,lat,height,...]
         * @private
         */
        _getPlanePoints(type, pos) {
            const { xmin, ymin, zmin, xmax, ymax, zmax } = this._box;
            const target_z = zmin + (zmax - zmin) * pos, target_x = xmin + (xmax - xmin) * pos, target_y = ymin + (ymax - ymin) * pos;
            ///
            const sliceSize = this.opt.sliceSize;
            ///
            switch (type) {
                case SlicePlane.XOY:
                    return Cesium.Cartesian3.fromDegreesArrayHeights([
                        xmin, ymin, target_z,
                        ...ZMapVolume.ConvertTool.expansion([xmin, ymax, target_z], [xmax, ymax, target_z,], sliceSize),
                        ...ZMapVolume.ConvertTool.expansion([xmax, ymin, target_z], [xmin, ymin, target_z,], sliceSize)
                    ]);
                case SlicePlane.YOZ:
                    return Cesium.Cartesian3.fromDegreesArrayHeights([
                        target_x, ymin, zmin,
                        ...ZMapVolume.ConvertTool.expansion([target_x, ymin, zmax], [target_x, ymax, zmax,], sliceSize),
                        ...ZMapVolume.ConvertTool.expansion([target_x, ymax, zmin], [target_x, ymin, zmin], sliceSize)
                    ]);
                case SlicePlane.XOZ:
                    return Cesium.Cartesian3.fromDegreesArrayHeights([xmin, target_y, zmin,
                        ...ZMapVolume.ConvertTool.expansion([xmin, target_y, zmax], [xmax, target_y, zmax], sliceSize),
                        ...ZMapVolume.ConvertTool.expansion([xmax, target_y, zmin], [xmin, target_y, zmin], sliceSize)]);
            }
        }
        set offset(offset) {
            this._planes.forEach((e, i) => {
                e.offset = Cesium.Math.clamp(offset[i], 0, 1);
                e.points = this._getPlanePoints(i, e.offset);
            });
            ///
            if (this._vol) {
                this._vol.setSlice({
                    z: this._planes[SlicePlane.XOY].offset,
                    y: this._planes[SlicePlane.XOZ].offset,
                    x: this._planes[SlicePlane.YOZ].offset,
                });
            }
        }
        onShowChanged(show) {
            ///
            this._planes.forEach(e => { if (e.entity)
                e.entity.show = show; });
            ///
            if (this.sliceControl) { //隐藏/显示拖动工具
                // document.querySelectorAll(".scroll-control").forEach((el:any) =>{
                //     el.style.visibility = show ? "visible" : "hidden"
                // })
                let el = this.sliceControl.root;
                el.style.visibility = show ? "visible" : "hidden";
            }
        }
        showPlane(plane, show) {
            const p = this._planes[plane];
            if (p)
                p.entity.show = show;
        }
    }
    ZMapVolume.SliceTool = SliceTool;
})(ZMapVolume || (ZMapVolume = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiek1hcFZvbHVtZVYzLmVzNiIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9Db252ZXJ0VG9vbC50cyIsIi4uL3NyYy9Mb25nTGF0Qm94LnRzIiwiLi4vc3JjL0xvbmdMYXRIZWlnaHQudHMiLCIuLi9zcmMvU2hhZGVycy50cyIsIi4uL3NyYy9Wb2x1bWVCaW5kaW5nYWJsZS50cyIsIi4uL3NyYy9Wb2x1bWVSZW5kZXIudHMiLCIuLi9zcmMvdG9vbHMvRW50aXR5VG9vbC50cyIsIi4uL3NyYy90b29scy9GaWx0ZXJFZGl0LnRzIiwiLi4vc3JjL3Rvb2xzL0dyaWRMaW5lLnRzIiwiLi4vc3JjL3Rvb2xzL1JlY3RQbGFuZS50cyIsIi4uL3NyYy90b29scy9TbGljZUNvbnRyb2wudHMiLCIuLi9zcmMvdG9vbHMvU2xpY2VUb29sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQVUsVUFBVSxDQXlNbkI7QUF6TUQsV0FBVSxVQUFVO0lBRWhCOzs7OztPQUtHO0lBQ0gsTUFBYSxXQUFXO1FBRXBCOzs7O1dBSUc7UUFDSCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBMkI7WUFDL0MsT0FBTyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN2RCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyx1QkFBdUIsQ0FBQyxTQUEyQjtZQUN0RCxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtZQUUvRCxPQUFPLElBQUksQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUMvRCxDQUFDO1FBRUQ7Ozs7V0FJRztRQUNILE1BQU0sQ0FBQyxnQ0FBZ0MsQ0FBQyxZQUFnQztZQUNwRSxPQUFPLFdBQUEsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ3hELENBQUM7UUFFRDs7OztXQUlHO1FBQ0gsTUFBTSxDQUFD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SUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDO1lBQzFCLElBQUksQ0FBQyxNQUFNLEdBQUcsS0FBSyxDQUFDLEtBQUssQ0FBQztZQUUxQixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBRWxDLElBQUk7WUFDSixJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEMsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1lBQzlCLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUNsQyxJQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUM7WUFDbEMsSUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1lBQ2xDLElBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsQ0FBQztZQUVsQyxHQUFHO1lBQ0gsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUN6RSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM1QixDQUFDO1FBRUQsSUFBSSxTQUFTLEtBQUssT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQztRQUMzQyxJQUFJLFNBQVMsS0FBSyxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDO1FBRTNDLElBQUksVUFBVSxDQUFDLElBQWM7WUFFekIsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7WUFDbEIsSUFBSSxDQUFD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
ZMapVolume.Shaders.vertexShader = 'varying vec4 worldPos;\n\
\n\
attribute float batchId;\n\
attribute vec3 position3DHigh;\n\
attribute vec3 position3DLow;\n\
attribute vec3 normal;\n\
\n\
varying vec3 v_positionEC;\n\
varying vec3 v_normalEC;\n\
varying vec3 v_normal2;\n\
\n\
vec4 czm_translateRelativeToEye2(vec3 high, vec3 low)\n\
{\n\
    vec3 highDifference = high - czm_encodedCameraPositionMCHigh;\n\
    vec3 lowDifference = low - czm_encodedCameraPositionMCLow;\n\
    return vec4(highDifference + lowDifference, 1.0);\n\
}\n\
\n\
void main()\n\
{\n\
    vec4 p = czm_translateRelativeToEye2(position3DHigh, position3DLow);\n\
\n\
    ///\n\
    vec3 pos = position3DHigh + position3DLow;\n\
    worldPos = czm_model * vec4(pos, 1.0);\n\
    v_positionEC = (czm_modelViewRelativeToEye * p).xyz;\n\
    v_normalEC = czm_normal * normal;\n\
    v_normal2 = normal;\n\
\n\
    ///\n\
    gl_Position = czm_modelViewProjectionRelativeToEye * p;\n\
}';
ZMapVolume.Shaders.fragmentShader = '\n\
\n\
\n\
void main( void ) \n\
{\n\
    doZMapRender();\n\
}             \n\
';
ZMapVolume.Shaders.materialShader = '\n\
#define ZMAP_RENDER_MODE_GLOBE_VOLUME       1\n\
#define ZMAP_RENDER_MODE_GLOBE_SLICE        2\n\
#define ZMAP_RENDER_MODE_BOX_VOLUME         3\n\
#define ZMAP_RENDER_MODE_BOX_SLICE          4\n\
\n\
#define ZMAP_VOL_RAY_FORWARD     1\n\
#define ZMAP_VOL_RAY_BACKWARD    2\n\
\n\
/// 顶点的世界坐标\n\
varying vec4 worldPos;\n\
\n\
/// \n\
varying vec3 v_positionEC;\n\
varying vec3 v_normalEC;\n\
varying vec3 v_normal2;\n\
\n\
/// uniforms\n\
// 体纹理，使用二维纹理替代\n\
uniform sampler2D u_CubeTex;\n\
// 色表\n\
uniform sampler2D u_ColorTex;\n\
// 逆矩阵\n\
uniform mat4 u_InvWorldMat;\n\
\n\
// 提数据的空间范围\n\
uniform vec3 u_VolBoxMin;\n\
uniform vec3 u_VolBoxMax;\n\
// 体纹理的有效区域（动态裁剪）\n\
uniform vec3 u_VolClipMin;\n\
uniform vec3 u_VolClipMax;\n\
// 提数据的包围球半径\n\
uniform float u_VolBoxRadius;\n\
// 属性过滤\n\
uniform mat4 u_VolFilterLine;\n\
\n\
/// 切片列数\n\
uniform float u_SliceNumXf;\n\
/// 切片行数\n\
uniform float u_SliceNumYf;\n\
\n\
/// 翻转参数\n\
uniform vec3 u_Turn;\n\
uniform vec2 u_DataValueRange;\n\
\n\
/// 体数据的尺寸\n\
vec3 c_VolBoxSize;\n\
\n\
/// 采样次数\n\
const int MAX_STEPS = ZMAP_VOL_SAMPLE_NUM;\n\
/// \n\
const float alphaCorrection = 1.0;\n\
\n\
/// 切片层数\n\
float SliceCountf = 0.0;\n\
\n\
/// 切片的宽高\n\
float SliceWidth = 0.0;\n\
float SliceHeight = 0.0;\n\
\n\
\n\
/// 属性过滤器\n\
vec2 filter_line[8];\n\
void initGlobeVars()\n\
{\n\
    /// 切片层数\n\
    SliceCountf = u_SliceNumXf * u_SliceNumYf;\n\
\n\
    /// 切片的宽高\n\
    SliceWidth  = 1.0 / u_SliceNumXf;\n\
    SliceHeight = 1.0 / u_SliceNumYf;\n\
\n\
    ///\n\
    filter_line[0] = vec2(u_VolFilterLine[0][0],u_VolFilterLine[0][1]);\n\
    filter_line[1] = vec2(u_VolFilterLine[0][2],u_VolFilterLine[0][3]);\n\
    filter_line[2] = vec2(u_VolFilterLine[1][0],u_VolFilterLine[1][1]);\n\
    filter_line[3] = vec2(u_VolFilterLine[1][2],u_VolFilterLine[1][3]);\n\
    filter_line[4] = vec2(u_VolFilterLine[2][0],u_VolFilterLine[2][1]);\n\
    filter_line[5] = vec2(u_VolFilterLine[2][2],u_VolFilterLine[2][3]);\n\
    filter_line[6] = vec2(u_VolFilterLine[3][0],u_VolFilterLine[3][1]);\n\
    filter_line[7] = vec2(u_VolFilterLine[3][2],u_VolFilterLine[3][3]);\n\
}\n\
\n\
/// 应用属性过滤\n\
float doFilter(float value)\n\
{\n\
    float k,b;\n\
\n\
    float x = value;\n\
    vec2 point0 = vec2(0.0, 0.0);\n\
    for(int i = 0;i < 8; i++)\n\
    {\n\
        vec2 point1 = filter_line[i];\n\
        if(x < point1.x)\n\
        {\n\
            k = (point1.y - point0.y) / (point1.x - point0.x);\n\
            b = point1.y - k * point1.x;\n\
            value = k * x + b;\n\
            break;\n\
        }\n\
\n\
        ///\n\
        point0 = point1;\n\
    }\n\
\n\
    ///\n\
    return value;\n\
}\n\
\n\
bool doVolClip(vec3 texCoord)\n\
{\n\
    return any(greaterThan(texCoord, u_VolClipMax)) || any(lessThan(texCoord, u_VolClipMin));\n\
}\n\
\n\
// Z方向-256层体数据变为64层体数据\n\
float readVolDataValue(vec3 texCoord)\n\
{\n\
    /// 翻转\n\
    texCoord = texCoord * (vec3(1.0,1.0,1.0) - u_Turn) + (vec3(1.0,1.0,1.0) - texCoord) * u_Turn;\n\
\n\
    /// 计算在第几个切片，加0.5便于计算\n\
    float slice = texCoord.z * SliceCountf + 0.5;\n\
    float slice_int = floor(slice);\n\
    float slice_dot = slice - slice_int;\n\
\n\
    ///\n\
    float slice_n1 = slice_int - 1.0, slice_n2 = slice_int;\n\
    if (slice_int == 0.0) slice_n1 = 0.0;\n\
    if (slice_int == SliceCountf) slice_n2 = SliceCountf - 1.0;\n\
\n\
    //The Z slices are stored in a matrix of 16x16 of Z slices.\n\
    //The original UV coordinates have to be rescaled by the tile numbers in each row and column.\n\
    texCoord.x /= u_SliceNumXf;\n\
    texCoord.y /= u_SliceNumYf;\n\
\n\
    ///\n\
    vec2 texcoord1 = texCoord.xy;\n\
    vec2 texcoord2 = texCoord.xy;\n\
    //Add an offset to the original UV coordinates depending on the row and column number.\n\
    texcoord1.x += mod(slice_n1, u_SliceNumXf) * SliceWidth;\n\
    texcoord1.y += (u_SliceNumYf - floor(slice_n1 / u_SliceNumXf) - 1.0) * SliceHeight;\n\
\n\
    texcoord2.x += mod(slice_n2, u_SliceNumXf) * SliceWidth;\n\
    texcoord2.y += (u_SliceNumYf - floor(slice_n2 / u_SliceNumXf) - 1.0) * SliceHeight;\n\
\n\
    /// 分别在两个切片上进行纹理采样\n\
    vec4 v1 = texture2D(u_CubeTex, texcoord1);\n\
    vec4 v2 = texture2D(u_CubeTex, texcoord2);\n\
\n\
    /// 混合上下两个值\n\
    float value = mix(v1.r, v2.r, slice_dot);\n\
    value = (value - u_DataValueRange[0]) / (u_DataValueRange[1] - u_DataValueRange[0]);\n\
    return clamp(value, 0.0, 1.0);\n\
}\n\
\n\
vec4 readColorTable(float v)\n\
{\n\
    /// 对色表进行采样\n\
    return texture2D(u_ColorTex, vec2(v, 1.0));\n\
}\n\
\n\
/// 三维坐标转纹理坐标（经纬度），计算结果比较准确，计算量比较大\n\
const vec3 c_BoxTexMin = vec3(0.0,0.0,0.0);\n\
const vec3 c_BoxTexMax = vec3(1.0,1.0,1.0);\n\
\n\
const float WGS84EllipsoidA = 6378137.0;\n\
const float WGS84EllipsoidB = 6356752.314245179;\n\
\n\
#if 0\n\
\n\
/// 椭球体\n\
vec3 xyz2lnlt(vec3 xyz)\n\
{\n\
    float X = xyz.x;\n\
    float Y = xyz.y;\n\
    float Z = xyz.z;\n\
    const float a = WGS84EllipsoidA;\n\
    const float b = WGS84EllipsoidB;\n\
    float er = sqrt(X * X + Y * Y);\n\
    float e1 = (a * a - b * b) / (a * a);\n\
    float e2 = (a * a - b * b) / (b * b);\n\
    float th = atan((Z * a) / (er * b));\n\
\n\
    float sinth3 = pow(sin(th), 3.0);\n\
    float costh3 = pow(cos(th), 3.0);\n\
\n\
    float L = atan(Y, X);\n\
    float B = atan((Z + e2 * b * sinth3) / (er - e1 * a * costh3));\n\
    float sinB = sin(B);\n\
    float cosB = cos(B);\n\
    float N = a / sqrt(1.0 - e1 * sinB * sinB);\n\
    float H = er / cosB - N;\n\
\n\
    return vec3(degrees(L),degrees(B),H);\n\
}\n\
#else \n\
\n\
/// 正求体\n\
vec3 xyz2lnlt(vec3 xyz)\n\
{\n\
    float radius = length(xyz);\n\
    float lon = atan(xyz.y, xyz.x);\n\
    float lat = asin(xyz.z / radius);\n\
\n\
    return vec3(degrees(lon), degrees(lat), radius - WGS84EllipsoidA);\n\
}\n\
#endif\n\
\n\
/// 单次体绘制\n\
vec4 doVolOnceRender(vec3 texCoord, vec4 acc)\n\
{\n\
    if (doVolClip(texCoord)) return acc;\n\
\n\
    //Get the voxel intensity value from the 3D texture.    \n\
    float volValue = readVolDataValue(texCoord);\n\
    vec4 colorSample = readColorTable(volValue);\n\
    float alphaSample = doFilter(volValue) * colorSample.a;\n\
    \n\
    //Allow the alpha correction customization\n\
    alphaSample = alphaSample * alphaCorrection;\n\
\n\
    //Perform the composition.\n\
#if ZMAP_VOL_RAY_DIR == ZMAP_VOL_RAY_FORWARD\n\
    acc.rgb = acc.rgb * acc.a + (1.0 - acc.w) * colorSample.rgb;\n\
#else \n\
    acc.rgb = acc.rgb * (1.0-alphaSample) + colorSample.rgb * alphaSample;\n\
#endif\n\
    \n\
    //Store the alpha accumulated so far.\n\
    acc.a = 1.0 - (1.0 - acc.a) * (1.0 - alphaSample);\n\
\n\
    /// \n\
    return acc;\n\
}\n\
\n\
vec4 doPhong(vec3 positionToEyeEC, vec3 normalEC, vec4 color)\n\
{\n\
    czm_material material;\n\
    material.diffuse = color.rgb;\n\
    material.specular = 0.0;\n\
    material.shininess = 1.0;\n\
    material.normal = normalize(normalEC);\n\
    material.emission = vec3(0.0);\n\
    material.alpha = color.a;\n\
\n\
    ///\n\
    return czm_phong(normalize(-positionToEyeEC), material);\n\
}\n\
\n\
vec4 doSliceRender(vec3 texCoord)\n\
{\n\
    /// \n\
    if (doVolClip(texCoord)) discard;\n\
\n\
    ///\n\
    float value = readVolDataValue(texCoord);\n\
    vec4 color = readColorTable(value);\n\
    float alpha = doFilter(value) * color.a;\n\
\n\
    ///\n\
    //return vec4(alpha, 1.0, 1.0, 1.0);\n\
    alpha = alpha > 0.5 ? 1.0 : 0.0;\n\
    if (alpha == 0.0) discard;\n\
    \n\
    color.a = 1.0;\n\
\n\
    ///\n\
    //return vec4(v_normal2, 1.0);\n\
    //return color;\n\
    return doPhong(v_positionEC, v_normalEC, color);\n\
}\n\
\n\
\n\
#if ZMAP_MODE == ZMAP_RENDER_MODE_GLOBE_VOLUME\n\
\n\
    /// 体绘制模式\n\
    void doVolRender()\n\
    {\n\
        vec3 dir = worldPos.xyz - czm_viewerPositionWC.xyz ; \n\
        float delta = u_VolBoxRadius * 2.0 / float(MAX_STEPS);\n\
        vec3 deltaDirection = normalize(dir) * delta;\n\
\n\
        vec3 currentPosition = worldPos.xyz;\n\
        vec4 acc = vec4(0.0, 0.0, 0.0, 0.0);\n\
\n\
    #if ZMAP_VOL_RAY_DIR == ZMAP_VOL_RAY_FORWARD\n\
        currentPosition = currentPosition - deltaDirection * float(MAX_STEPS);\n\
    #endif\n\
        \n\
        ///\n\
        for (int i = 0; i < MAX_STEPS; ++i)\n\
        {\n\
            vec3 geo = xyz2lnlt(currentPosition);\n\
            geo = (geo - u_VolBoxMin) / c_VolBoxSize;\n\
\n\
            ///\n\
            acc = doVolOnceRender(geo, acc);\n\
            \n\
            //Advance the ray.\n\
    #if ZMAP_VOL_RAY_DIR == ZMAP_VOL_RAY_FORWARD\n\
            currentPosition += deltaDirection;\n\
            //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.\n\
            if (acc.w > 1.0) break;\n\
    #else\n\
            currentPosition -= deltaDirection;\n\
    #endif\n\
        }\n\
\n\
        ///\n\
        gl_FragColor = acc;\n\
    }\n\
\n\
#elif ZMAP_MODE == ZMAP_RENDER_MODE_BOX_VOLUME\n\
\n\
    /// 立方体绘制方式\n\
    void doVolRender()\n\
    {\n\
        vec4 locPos = u_InvWorldMat * worldPos;\n\
        vec4 locViewerPositionWC = u_InvWorldMat * vec4(czm_viewerPositionWC, 1.0);\n\
        vec3 dir = locPos.xyz - locViewerPositionWC.xyz; \n\
\n\
        ///\n\
        float delta = 1.732 / float(MAX_STEPS);\n\
        vec3 deltaDirection = normalize(dir / c_VolBoxSize) * delta;\n\
        \n\
        ///\n\
        vec3 currentPosition = (locPos.xyz - u_VolBoxMin) / c_VolBoxSize;\n\
        vec4 acc = vec4(0.0, 0.0, 0.0, 0.0);\n\
\n\
    #if ZMAP_VOL_RAY_DIR == ZMAP_VOL_RAY_FORWARD\n\
        currentPosition = currentPosition - deltaDirection * float(MAX_STEPS);\n\
    #endif\n\
\n\
        ///\n\
        for(int i = 0; i < MAX_STEPS; i++)\n\
        {\n\
            ///\n\
            acc = doVolOnceRender(currentPosition, acc);\n\
            \n\
            ///\n\
    #if ZMAP_VOL_RAY_DIR == ZMAP_VOL_RAY_FORWARD\n\
            currentPosition += deltaDirection;\n\
            //If the length traversed is more than the ray length, or if the alpha accumulated reaches 1.0 then exit.\n\
            if (acc.w > 1.0) break;\n\
    #else\n\
            //Advance the ray.\n\
            currentPosition -= deltaDirection;\n\
    #endif\n\
        }\n\
\n\
        ///\n\
        gl_FragColor = acc;\n\
    }\n\
\n\
#elif ZMAP_MODE == ZMAP_RENDER_MODE_GLOBE_SLICE\n\
\n\
    /// 切面绘制模式\n\
    void doVolRender()\n\
    {\n\
        vec3 geo = xyz2lnlt(worldPos.xyz);\n\
        geo = (geo - u_VolBoxMin) / c_VolBoxSize;\n\
\n\
        ///\n\
        gl_FragColor = doSliceRender(geo);\n\
    }\n\
\n\
#elif ZMAP_MODE == ZMAP_RENDER_MODE_BOX_SLICE\n\
\n\
    void doVolRender()\n\
    {\n\
        vec4 locPos = u_InvWorldMat * worldPos;\n\
\n\
        ///\n\
        vec3 texCoord = (locPos.xyz - u_VolBoxMin) / c_VolBoxSize;\n\
        texCoord = clamp(texCoord, c_BoxTexMin, c_BoxTexMax);\n\
\n\
        ///\n\
        gl_FragColor = doSliceRender(texCoord);\n\
    }\n\
\n\
#endif\n\
\n\
void doDebugRender()\n\
{\n\
    vec3 currentPosition = worldPos.xyz;\n\
        \n\
    vec4 colorSample;\n\
    float accumulatedAlpha = 0.0;\n\
\n\
    vec3 geo = xyz2lnlt(currentPosition);\n\
    geo = (geo - u_VolBoxMin) / c_VolBoxSize;\n\
\n\
    gl_FragColor = vec4(geo, 0.5);\n\
}\n\
\n\
void doZMapRender( void ) \n\
{\n\
    c_VolBoxSize = u_VolBoxMax - u_VolBoxMin;\n\
\n\
    /// 初始化过滤器\n\
    initGlobeVars();\n\
\n\
    /// \n\
    doVolRender();\n\
}             \n\
';