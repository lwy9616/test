var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Volumn;
(function (Volumn) {
    var LongLatHeight = /** @class */ (function () {
        function LongLatHeight(lon, lat, height) {
            this.longitude = lon;
            this.latitude = lat;
            this.height = height;
        }
        LongLatHeight.prototype.toCartographic = function (result) {
            return Cesium.Cartographic.fromDegrees(this.longitude, this.latitude, this.height);
        };
        LongLatHeight.prototype.toCartesian3 = function (result) {
            return Cesium.Cartesian3.fromDegrees(this.longitude, this.latitude, this.height);
        };
        LongLatHeight.fromDegrees = function (lon, lat, height) {
            return new LongLatHeight(lon, lat, height);
        };
        LongLatHeight.fromRadians = function (lon, lat, height) {
            return new LongLatHeight(Cesium.Math.toDegrees(lon), Cesium.Math.toDegrees(lat), height);
        };
        /// 
        LongLatHeight.formCartographic = function (cart) {
            return this.fromRadians(cart.longitude, cart.latitude, cart.height);
        };
        LongLatHeight.fromCartesian3 = function (cart) {
            var llh = new LongLatHeight();
            Cesium.Cartographic.fromCartesian(cart, undefined, llh);
            llh.longitude = Cesium.Math.toDegrees(llh.longitude);
            llh.latitude = Cesium.Math.toDegrees(llh.latitude);
            return llh;
        };
        return LongLatHeight;
    }());
    var Box = /** @class */ (function () {
        function Box(xmin, ymin, zmin, xmax, ymax, zmax) {
            this.xmin = xmin;
            this.ymin = ymin;
            this.zmin = zmin;
            this.zmax = xmax;
            this.ymax = ymax;
            this.zmax = zmax;
            /// 
            this.center = [(xmax + xmin) / 2, (ymax + ymin) / 2, (zmax + zmin) / 2];
            this.size = [xmax - xmin, ymax - ymin, zmax - zmin];
            /// 
            this.from = new LongLatHeight(xmin, ymin, zmin);
            this.to = new LongLatHeight(xmax, ymax, zmax);
        }
        Box.fromStartEnd = function (from, to) {
            return new Box(from.longitude, from.latitude, from.height, to.longitude, to.latitude, to.height);
        };
        return Box;
    }());
    /**
     * 实体工具
     * @author flake
     */
    var EntityTool = /** @class */ (function () {
        ///
        function EntityTool(viewer) {
            /// 
            this._default = {
                lineWidth: 15,
                pointSize: 10,
                lineColor: Cesium.Color.CORAL,
                pointColor: Cesium.Color.DEEPSKYBLUE,
                textColor: Cesium.Color.DEEPSKYBLUE
            };
            //对应Cesium框架内的Viewer类实例 ，类型为Viewer
            this.viewer = viewer;
        }
        Object.defineProperty(EntityTool.prototype, "defaultOpt", {
            get: function () {
                return this._default;
            },
            set: function (opt) {
                this._default = Object.assign(this._default, opt);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 添加折线
         * @param pos Array.[Cartesian3]
         * @return Entity
         */
        EntityTool.prototype.addPloyline = function (pos, option) {
            var opt = Object.assign(this.getDefault(), option);
            return this.viewer.entities.add({
                polyline: {
                    positions: pos,
                    material: new Cesium.PolylineGlowMaterialProperty({
                        glowPower: 0.2,
                        color: opt.lineColor
                    }),
                    //material: new Cesium.PolylineArrowMaterialProperty(Cesium.Color.CORNFLOWERBLUE),
                    width: opt.lineWidth,
                    clampToGround: false
                }
            });
        };
        /**
         * 获取默认配置
         * @return {{lineWidth: number, lineColor: Color}}
         */
        EntityTool.prototype.getDefault = function () {
            return this._default;
        };
        /**
         * 添加点
         * @param pos Array.[Cartesian3]
         * @return Array.[Entity]
         */
        EntityTool.prototype.addPoint = function (pos, labelGraphics, option) {
            var _this = this;
            var opt = Object.assign(this.getDefault(), option);
            return pos.map(function (point) {
                return _this.viewer.entities.add({
                    position: point,
                    point: {
                        pixelSize: opt.pointSize,
                        color: opt.pointColor
                    },
                    label: labelGraphics
                });
            });
        };
        /**
         * 添加点附加经度文字
         * @param pos Array.[Cartesian3]
         */
        EntityTool.prototype.addPointWithLongitude = function (pos, option) {
            var _this = this;
            var opt = Object.assign(this.getDefault(), option);
            return pos.map(function (point) {
                return _this.viewer.entities.add({
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
        };
        /**
         * 添加点附加纬度文字
         * @param pos Array.[Cartesian3]
         */
        EntityTool.prototype.addPointWithLatitude = function (pos, option) {
            var _this = this;
            var opt = Object.assign(this.getDefault(), option);
            return pos.map(function (point) {
                return _this.viewer.entities.add({
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
        };
        /**
         * 添加单点和文字
         * @param pos Cartesian3
         * @param text 文本信息
         * @return Entity
         */
        EntityTool.prototype.addSinglePointWithText = function (pos, text, option) {
            var opt = Object.assign(this.getDefault(), option);
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
        };
        return EntityTool;
    }());
    /**
     *
     * @interface 交互工具必须实现此接口
     * @see GridLine
     * @see SliceTool
     * @see RectPlane
     * @see MapVolume
     */
    var VolumeBiningable = /** @class */ (function () {
        function VolumeBiningable(map3dView, box) {
            this.tool = ConvertTool;
            this._show = true;
            this.viewer = map3dView.cesium.viewer;
            this.scene = map3dView.cesium.scene;
            this.box = box;
            /// 
            this.entityTool = new EntityTool(this.viewer);
        }
        Object.defineProperty(VolumeBiningable.prototype, "show", {
            /// 
            get: function () { return this._show; },
            set: function (show) { this._show = show; this.onShowChanged(show); },
            enumerable: true,
            configurable: true
        });
        return VolumeBiningable;
    }());
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
    var GridLine = /** @class */ (function (_super) {
        __extends(GridLine, _super);
        function GridLine(viewer, box, opt) {
            var _this = 
            ///
            _super.call(this, viewer, box) || this;
            _this.xSteps = [];
            _this.ySteps = [];
            _this.zSteps = [];
            _this.gridLine = [];
            _this.scale = [1, 1, 1];
            var default_opt = {
                stepX: 1,
                stepY: 1,
                stepZ: 100,
                useOrigin: false
            };
            _this.opt = Object.assign(default_opt, opt);
            ///
            _this.entityTool = new EntityTool(_this.viewer);
            // 设置默认样式
            if (_this.opt.style)
                _this.style = _this.opt.style;
            ///
            _this.init();
            return _this;
        }
        Object.defineProperty(GridLine.prototype, "style", {
            /**
             * get/set 工具样式
             * 配置项详见EntityTool._default
             * @see EntityTool.defaultOpt
             * @return {{lineWidth: number, lineColor: Color}}
             */
            get: function () {
                return this.entityTool.getDefault();
            },
            set: function (opt) {
                this.entityTool.defaultOpt = opt;
                this.update(this.box);
            },
            enumerable: true,
            configurable: true
        });
        /**
         * 更新数据
         */
        GridLine.prototype.update = function (box) {
            this.box = box;
            this.destroy();
            this.init();
            this.show = !!this.show;
        };
        /**
         * 清除【完全清除还是隐藏功能待定】
         */
        GridLine.prototype.clean = function () {
        };
        ///
        GridLine.prototype.binding = function () {
        };
        ///
        GridLine.prototype.init = function () {
            ///
            var _a = this.box, xmin = _a.xmin, ymin = _a.ymin, zmin = _a.zmin, xmax = _a.xmax, ymax = _a.ymax, zmax = _a.zmax;
            ///
            var diff = Math.abs(zmax - zmin); //高度差，使用这个属性和实例上的stepZ属性计算z轴的网格
            this.xSteps = this.computeMiddleSpacing(xmin, xmax, this.opt.stepX);
            this.ySteps = this.computeMiddleSpacing(ymin, ymax, this.opt.stepY);
            this.zSteps = (diff && this.opt.stepZ) ? this.computeMiddleSpacing(zmin, zmax, this.opt.stepZ) : [];
            ///
            this.createGrid();
        };
        GridLine.prototype.onShowChanged = function (show) {
            this.gridLine.forEach(function (line) {
                line.show = show;
            });
        };
        /**
         * 计算中间间距<br>
         *
         * ·    ·    ·    · ·
         * @param min 最小值
         * @param max 最大值
         * @param step 步长
         * @example (1,5.5,1) => [1,2,3,4,5,5.5]
         */
        GridLine.prototype.computeMiddleSpacing = function (min, max, step) {
            var arr = [], spacing = max - min;
            for (var i = 0; i < spacing / step; i++) {
                arr.push(step * i);
            }
            if (spacing % step !== 0) { //不是整除的时候 添加差值
                arr.push(spacing);
            }
            return arr;
        };
        GridLine.prototype.createGrid = function () {
            return this.gridLine = this.gridLine.concat(this._vertical(), this._justify());
        };
        /**
         * 竖向栅格（y）
         * @private
         */
        GridLine.prototype._vertical = function () {
            var _this = this;
            var start = this.box.from, entitys = [];
            this.xSteps.forEach(function (stepX, index) {
                var lines = _this.ySteps.map(function (stepY) {
                    var one = _this.tool.cartographicAdd(start, new LongLatHeight(stepX, stepY, 0));
                    // one.height = 0
                    return _this.tool.c3ByDegrees(one);
                });
                if (index === 0) {
                    entitys = entitys.concat(_this._verticalZ(lines));
                    entitys = entitys.concat(_this.entityTool.addPointWithLatitude(lines));
                }
                entitys.push(_this.entityTool.addPloyline(lines));
            });
            return entitys;
        };
        /**
         * 横向栅格（x）
         * @private
         */
        GridLine.prototype._justify = function () {
            var _this = this;
            var start = this.box.from, entitys = [];
            this.ySteps.forEach(function (stepY, index) {
                var lines = _this.xSteps.map(function (stepX) {
                    var one = _this.tool.cartographicAdd(start, new LongLatHeight(stepX, stepY, 0));
                    // one.height = 0
                    return _this.tool.c3ByDegrees(one);
                });
                if (index === 0) {
                    entitys = entitys.concat(_this._verticalZ(lines));
                    entitys = entitys.concat(_this.entityTool.addPointWithLongitude(lines));
                }
                entitys.push(_this.entityTool.addPloyline(lines));
            });
            return entitys;
        };
        /**
         * 竖向栅格（z）
         * @private
         */
        GridLine.prototype._verticalZ = function (baseLine) {
            var _this = this;
            var entitys = [];
            var scale = this.opt.useOrigin ? this.scale[2] : 1;
            this.zSteps.forEach(function (step) {
                entitys.push(_this.entityTool.addPloyline(baseLine.map(function (c3) {
                    var cart = _this.tool.c3ToCartographic(c3);
                    cart.height += step;
                    return _this.tool.c3ByRadians(cart);
                })));
                var cart2 = _this.tool.c3ToCartographic(baseLine[0]);
                cart2.height += step;
                entitys.push(_this.entityTool.addSinglePointWithText(_this.tool.c3ByRadians(cart2), ((cart2.height / scale).toFixed(1)) + 'm\n\n'));
            });
            return entitys;
        };
        GridLine.prototype.destroy = function () {
            var collection = this.viewer.entities;
            this.gridLine.forEach(function (entity) {
                collection.remove(entity);
            });
            this.gridLine = [];
        };
        return GridLine;
    }(VolumeBiningable));
    /**
     * 切片工具
     * @author flake
     * @example new SliceTool(map3DView,{longitude:108.5,latitude:18,height:0},{longitude:119,latitude:27,height:0})
     */
    var SliceTool = /** @class */ (function (_super) {
        __extends(SliceTool, _super);
        ///
        function SliceTool(map3dView, box, opt) {
            var _this = _super.call(this, map3dView, box) || this;
            ///
            var default_opt = {
                sliceSize: 20 //分段个数 ，两点之间的曲线polyline和经纬度线圈不重合，采取两点分割成多个点，来近似重合
            };
            _this.opt = Object.assign(default_opt, opt);
            ///
            _this.planes = {
                xoy: null,
                xoz: null,
                yoz: null,
                xoy_offset: 0.5,
                xoz_offset: 0.5,
                yoz_offset: 0.5
            };
            // 设置默认样式
            if (_this.opt.style) {
                _this.style = _this.opt.style;
            }
            else {
                _this.init();
            }
            return _this;
        }
        Object.defineProperty(SliceTool.prototype, "style", {
            /**
             * get/set 工具样式
             * 配置项详见EntityTool._default
             * @see EntityTool.defaultOpt
             * @return {{lineWidth: number, lineColor: Color}}
             */
            get: function () {
                return this.entityTool.getDefault();
            },
            set: function (opt) {
                this.entityTool.defaultOpt = opt;
                this.destroy();
                this.update(this.box);
            },
            enumerable: true,
            configurable: true
        });
        SliceTool.prototype.init = function () {
            var _this = this;
            //初始化控制工具
            if (SliceControl && !this.sliceControl)
                this.sliceControl = new SliceControl(this, null, this.opt);
            this.height = Math.abs(this.box.zmax - this.box.zmin);
            //初始化三个面
            this.xoy = this._getScalePoint('xoy', this.planes.xoy_offset);
            this.xoz = this._getScalePoint('xoz', this.planes.xoz_offset);
            this.yoz = this._getScalePoint('yoz', this.planes.yoz_offset);
            this.planes.xoy = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.xoy)));
            this.planes.xoz = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.xoz)));
            this.planes.yoz = (this.entityTool.addPloyline(this.tool.fromDegreesArrayWithHeight(this.yoz)));
            //创建实时更新动画
            this.planes.xoy.polyline.positions = new Cesium.CallbackProperty(function () {
                return _this.tool.fromDegreesArrayWithHeight(_this.xoy);
            }, false);
            this.planes.xoz.polyline.positions = new Cesium.CallbackProperty(function () {
                return _this.tool.fromDegreesArrayWithHeight(_this.xoz);
            }, false);
            this.planes.yoz.polyline.positions = new Cesium.CallbackProperty(function () {
                return _this.tool.fromDegreesArrayWithHeight(_this.yoz);
            }, false);
            return this.planes;
        };
        SliceTool.prototype.update = function (box) {
            this.box = box;
            this.destroy();
            this.init();
            this.show = !!this.show;
        };
        SliceTool.prototype.clean = function () {
        };
        ///
        SliceTool.prototype.destroy = function () {
            var arr = ["xoy", "xoz", "yoz",];
            for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
                var val = arr_1[_i];
                this.planes[val] && this.viewer.entities.remove(this.planes[val]);
            }
        };
        /**
         * 绑定MapVolume
         * @param vol MapVolume实例
         */
        SliceTool.prototype.binding = function (vol) {
            this.vol = vol;
        };
        Object.defineProperty(SliceTool.prototype, "control", {
            get: function () {
                return this.sliceControl;
            },
            /**
             * 使用自定义的sliceControl
             * @param sliceControl
             */
            set: function (sliceControl) {
                this.sliceControl.destroy();
                this.sliceControl = sliceControl;
            },
            enumerable: true,
            configurable: true
        });
        ///
        /**
         * 根据比例获取构建面的经纬度列表
         * @param type 类型【'xoy','yoz','xoz'】分别表示【‘平行于地表的面’，‘垂直于地表的面 南北方向’，‘垂直于地表的面 东西方向’】
         * @param scale 位置比例[0-1]
         * @returns {[]} like [lng,lat,height,lng,lat,height,...]
         * @private
         */
        SliceTool.prototype._getScalePoint = function (type, scale) {
            var _a = this.box, xmin = _a.xmin, ymin = _a.ymin, zmin = _a.zmin, xmax = _a.xmax, ymax = _a.ymax, zmax = _a.zmax;
            var target_height = zmin + (zmax - zmin) * scale, target_x = xmin + (xmax - xmin) * scale, target_y = ymin + (ymax - ymin) * scale;
            var sliceSize = this.opt.sliceSize;
            //平行于地表的面
            if ('xoy' === type) {
                return [xmin, ymin, target_height].concat(ConvertTool.expansion([xmin, ymax, target_height], [xmax, ymax, target_height,], sliceSize), ConvertTool.expansion([xmax, ymin, target_height], [xmin, ymin, target_height,], sliceSize));
            }
            //垂直于地表的面 南北方向
            if ('yoz' === type) {
                return [target_x, ymin, zmin].concat(ConvertTool.expansion([target_x, ymin, zmax], [target_x, ymax, zmax,], sliceSize), ConvertTool.expansion([target_x, ymax, zmin], [target_x, ymin, zmin], sliceSize));
            }
            //垂直于地表的面 东西方向
            if ('xoz' === type) {
                return [xmin, target_y, zmin].concat(ConvertTool.expansion([xmin, target_y, zmax], [xmax, target_y, zmax], sliceSize), ConvertTool.expansion([xmax, target_y, zmin], [xmin, target_y, zmin], sliceSize));
            }
        };
        Object.defineProperty(SliceTool.prototype, "offset", {
            get: function () {
                return this.planes;
            },
            set: function (obj) {
                var _this = this;
                var types = ['xoy_offset', 'xoz_offset', 'yoz_offset'];
                types.forEach(function (val) {
                    if (val in obj) {
                        var v = Math.max(obj[val], 0);
                        v = Math.min(obj[val], 1);
                        _this.planes[val] = v;
                        _this.resetPlane(val, v);
                    }
                });
                if (this.vol) {
                    this.vol.setSlice({
                        z: obj["xoy_offset"],
                        y: obj["xoz_offset"],
                        x: obj["yoz_offset"]
                    });
                }
            },
            enumerable: true,
            configurable: true
        });
        SliceTool.prototype.onShowChanged = function (show) {
            var _this = this;
            show = !!show;
            ['xoy', 'xoz', 'yoz'].forEach(function (key) {
                _this.planes[key].show = show;
            });
            if (this.sliceControl) { //隐藏/显示拖动工具
                document.querySelectorAll(".scroll-control").forEach(function (el) {
                    el.style.visibility = show ? "visible" : "hidden";
                });
            }
        };
        SliceTool.prototype.resetPlane = function (type, value) {
            var planeName = type.slice(0, 3);
            this[planeName] = this._getScalePoint(planeName, value);
        };
        SliceTool.prototype.showPlane = function (plane, show) {
            if (this.planes[plane]) {
                return this.planes[plane].show = show;
            }
        };
        return SliceTool;
    }(VolumeBiningable));
    /**
     * 范围切面工具
     * @author flake
     */
    var RectPlane = /** @class */ (function (_super) {
        __extends(RectPlane, _super);
        ///
        function RectPlane(map3dView, box, opt) {
            var _this = _super.call(this, map3dView, box) || this;
            ///
            var default_opt = {
                sliceSize: 20
            };
            _this.opt = Object.assign(default_opt, opt);
            _this.points = [];
            // 设置默认样式
            if (_this.opt.style)
                _this.style = _this.opt.style;
            _this.planes = {};
            _this.init();
            return _this;
        }
        Object.defineProperty(RectPlane.prototype, "style", {
            /**
             * get/set 工具样式
             * 配置项详见EntityTool._default
             * @see EntityTool.defaultOpt
             * @return {{lineWidth: number, lineColor: Color}}
             */
            get: function () {
                return this.entityTool.getDefault();
            },
            set: function (opt) {
                this.entityTool.defaultOpt = opt;
                this.update(this.box);
            },
            enumerable: true,
            configurable: true
        });
        RectPlane.prototype.update = function (box) {
            this.box = box;
            this.destroy();
            this.init();
            this.show = !!this.show;
        };
        RectPlane.prototype.clean = function () {
        };
        /**
         * 绑定MapVolume
         * @param vol MapVolume实例
         */
        RectPlane.prototype.binding = function (vol) {
            this.vol = vol;
        };
        RectPlane.prototype.destroy = function () {
            var collection = this.viewer.entities;
            for (var key in this.planes) {
                collection.remove(this.planes[key]);
            }
            this.points && this.points.forEach(function (entity) {
                collection.remove(entity);
            });
            this.planes = {};
            this.points = [];
        };
        RectPlane.prototype.init = function () {
            var _this = this;
            this.height = Math.abs(this.box.zmax - this.box.zmin);
            this._getPoints();
            var ps = this.eightPoint;
            this.copy_to = this.tool.c3ByDegrees(this.box.to);
            this.copy_from = this.tool.c3ByDegrees(this.box.from);
            this.planes.p_top = this.entityTool.addPloyline(ConvertTool.expansionC3(ps.$001, ps.$101, this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$111, ps.$011, this.opt.sliceSize), [ps.$001]));
            this.planes.p_left = this.entityTool.addPloyline([ps.$000, ps.$010, ps.$011, ps.$001, ps.$000]);
            this.planes.p_right = this.entityTool.addPloyline([ps.$100, ps.$110, ps.$111, ps.$101, ps.$100]);
            this.planes.p_bottom = this.entityTool.addPloyline(ConvertTool.expansionC3(ps.$000, ps.$100, this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$110, ps.$010, this.opt.sliceSize), [ps.$000]));
            this.planes.p_front = this.entityTool.addPloyline(ConvertTool.expansionC3(ps.$000, ps.$100, this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$101, ps.$001, this.opt.sliceSize), [ps.$000]));
            this.planes.p_behind = this.entityTool.addPloyline(ConvertTool.expansionC3(ps.$010, ps.$110, this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$111, ps.$011, this.opt.sliceSize), [ps.$010]));
            //创建实时更新动画
            this.planes.p_top.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return ConvertTool.expansionC3(ps.$001, ps.$101, _this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$111, ps.$011, _this.opt.sliceSize), [ps.$001]);
            }, false);
            this.planes.p_left.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return [ps.$000, ps.$010, ps.$011, ps.$001, ps.$000];
            }, false);
            this.planes.p_right.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return ConvertTool.expansionC3(ps.$000, ps.$100, _this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$110, ps.$010, _this.opt.sliceSize), [ps.$000]);
            }, false);
            this.planes.p_bottom.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return ConvertTool.expansionC3(ps.$000, ps.$100, _this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$110, ps.$010, _this.opt.sliceSize), [ps.$000]);
            }, false);
            this.planes.p_front.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return ConvertTool.expansionC3(ps.$000, ps.$100, _this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$101, ps.$001, _this.opt.sliceSize), [ps.$000]);
            }, false);
            this.planes.p_behind.polyline.positions = new Cesium.CallbackProperty(function () {
                var ps = _this.eightPoint;
                return ConvertTool.expansionC3(ps.$010, ps.$110, _this.opt.sliceSize).concat(ConvertTool.expansionC3(ps.$111, ps.$011, _this.opt.sliceSize), [ps.$010]);
            }, false);
            this.points = this.entityTool.addPoint(this.sixPoint);
            this.handler();
            return this.planes;
        };
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
        RectPlane.prototype._getPoints = function (from, to) {
            from = from || this.box.from;
            to = to || this.box.to;
            var xmin = from.longitude, ymin = from.latitude, hmin = from.height, xmax = to.longitude, ymax = to.latitude, hmax = to.height, half_x = (xmax + xmin) / 2, half_y = (ymax + ymin) / 2, half_z = (hmax + hmin) / 2;
            var $000 = this._createLLH(xmin, ymin, hmin), $100 = this._createLLH(xmax, ymin, hmin), $110 = this._createLLH(xmax, ymax, hmin), $010 = this._createLLH(xmin, ymax, hmin), $001 = this._createLLH(xmin, ymin, hmax), $101 = this._createLLH(xmax, ymin, hmax), $011 = this._createLLH(xmin, ymax, hmax), $111 = this._createLLH(xmax, ymax, hmax), $top = this._createLLH(half_x, half_y, hmax), $left = this._createLLH(xmin, half_y, half_z), $right = this._createLLH(xmax, half_y, half_z), $bottom = this._createLLH(half_x, half_y, hmin), $front = this._createLLH(half_x, ymin, half_z), $behind = this._createLLH(half_x, ymax, half_z);
            this.eightPoint = {
                $000: $000,
                $100: $100,
                $110: $110,
                $010: $010,
                $001: $001,
                $101: $101,
                $011: $011,
                $111: $111
            };
            this.sixPoint = [
                $top,
                $left,
                $right,
                $bottom,
                $front,
                $behind,
            ];
            return [$001, $101, $111, $011,
                $000, $100, $110, $010,
                $top, $left, $right, $bottom, $front, $behind,
            ];
        };
        RectPlane.prototype._setPoints = function (c3) {
            var _this = this;
            var point = this.tool.c3ToCartographicDegrees(c3);
            var sub = Cesium.Cartesian3.subtract(c3, this.sixPoint[this.movingPointIndex], new Cesium.Cartesian3());
            var to, from;
            //max(..min()) min(..max()) 都是为了限定最终计算的点在最大最小范围内，使用case每次只影响一个方向
            switch (this.movingPointIndex) {
                case 0: //上面
                    to = this.tool.c3ToCartographicDegrees(this.copy_to);
                    to.height = Math.max(Math.min(point.height, this.box.to.height), this.box.from.height);
                    this.copy_to = this.tool.c3ByDegrees(to);
                    break;
                case 2: //右边
                    to = this.tool.c3ToCartographicDegrees(this.copy_to);
                    to.longitude = Math.max(Math.min(point.longitude, this.box.to.longitude), this.box.from.longitude);
                    this.copy_to = this.tool.c3ByDegrees(to);
                    break;
                case 5: //后面
                    to = this.tool.c3ToCartographicDegrees(this.copy_to);
                    to.latitude = Math.max(Math.min(point.latitude, this.box.to.latitude), this.box.from.latitude);
                    this.copy_to = this.tool.c3ByDegrees(to);
                    break;
                case 1: //左边
                    from = this.tool.c3ToCartographicDegrees(this.copy_from);
                    from.longitude = Math.min(Math.max(point.longitude, this.box.from.longitude), this.box.to.longitude);
                    this.copy_from = this.tool.c3ByDegrees(from);
                    break;
                case 3: //下面
                    from = this.tool.c3ToCartographicDegrees(this.copy_from);
                    from.height = Math.min(Math.max(point.height, this.box.from.height), this.box.to.height);
                    this.copy_from = this.tool.c3ByDegrees(from);
                    break;
                case 4: //前面
                    from = this.tool.c3ToCartographicDegrees(this.copy_from);
                    from.latitude = Math.min(Math.max(point.latitude, this.box.from.latitude), this.box.to.latitude);
                    this.copy_from = this.tool.c3ByDegrees(from);
                    break;
            }
            //限定移动区域在最大和最小的区域范围之内
            var tmp_from = this.tool.c3ToCartographicDegrees(this.copy_from), tmp_to = this.tool.c3ToCartographicDegrees(this.copy_to);
            var eight = this._getPoints(tmp_from, tmp_to);
            this.points.forEach(function (entity, index) {
                entity.position = _this.sixPoint[index];
            });
            if (this.vol) { //体数据范围更新
                var _from = this.tool.c3ByDegrees(this.box.from);
                this.vol.range = {
                    minHeight: tmp_from.height,
                    minLongitude: Math.abs(ConvertTool.pointPlaneInstance(eight[4], eight[5], _from)),
                    maxLatitude: Math.abs(ConvertTool.pointPlaneInstance(eight[7], eight[4], _from)),
                    maxHeight: tmp_to.height,
                    maxLongitude: Math.abs(ConvertTool.pointPlaneInstance(eight[5], eight[4], _from)),
                    minLatitude: Math.abs(ConvertTool.pointPlaneInstance(eight[4], eight[7], _from))
                };
            }
        };
        /**
         * 创建经纬度高度对象
         * @param longitude
         * @param latitude
         * @param height
         * @returns {{longitude: *, latitude: *, height: *}}
         * @private
         */
        RectPlane.prototype._createLLH = function (longitude, latitude, height) {
            return Cesium.Cartesian3.fromDegrees(longitude, latitude, height);
        };
        RectPlane.prototype.handler = function () {
            var _this = this;
            this.control = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
            var handler = this.control;
            var old_time = new Date().getTime();
            var interval = 50;
            //左键按下
            handler.setInputAction(function (e) {
                _this.moving = true;
                _this.pointDraged = _this.viewer.scene.pick(e.position); //选取当前的entity
                _this.leftDownFlag = true;
                if (_this.pointDraged) {
                    _this.movingPointIndex = _this.points.indexOf(_this.pointDraged.id); //当前正在被移动的点
                    //console.info(this.movingPoint)
                    if (_this.movingPointIndex > -1)
                        _this.viewer.scene.screenSpaceCameraController.enableRotate = false; //锁定相机
                }
            }, Cesium.ScreenSpaceEventType.LEFT_DOWN);
            //左键松开
            handler.setInputAction(function (e) {
                _this.moving = false;
                _this.leftDownFlag = false;
                if (!_this.pointDraged)
                    return;
                _this.pointDraged = null;
                _this.viewer.scene.screenSpaceCameraController.enableRotate = true; //解锁相机
            }, Cesium.ScreenSpaceEventType.LEFT_UP);
            //鼠标移动
            handler.setInputAction(function (e) {
                if (Date.now() - old_time < interval)
                    return;
                _this.hoverHandler(e);
                if (_this.leftDownFlag === true && _this.pointDraged != null) {
                    var ray = _this.viewer.camera.getPickRay(e.endPosition);
                    var entity = _this.points[_this.movingPointIndex];
                    if (!entity)
                        return; //movingPointIndex为-1的情况 获取不到entity
                    var intersectPoint = _this.getPlaneIntersect(entity.position._value, ray);
                    var c3 = _this._getAxisCarsian(_this.tool.c3ToCartographicDegrees(entity.position._value), intersectPoint);
                    //entity.position = c3
                    _this._setPoints(c3);
                }
                old_time = Date.now();
            }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
        };
        /**
         * 鼠标移入处理 </br>
         *
         * @param e
         */
        RectPlane.prototype.hoverHandler = function (e) {
            var _this = this;
            if (this.leftDownFlag)
                return;
            var ray = this.viewer.camera.getPickRay(e.endPosition);
            var entity = this.viewer.scene.pick(e.endPosition); //选取当前的entity
            if (entity && entity.id && entity.id.point) {
                entity.id.point.pixelSize = 1.5 * this.style.pointSize;
            }
            else {
                this.points.forEach(function (point) {
                    point.point.pixelSize = _this.style.pointSize;
                });
            }
        };
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
        RectPlane.prototype.getPlaneIntersect = function (redPoint, ray) {
            var _this = this;
            var point = redPoint;
            // let camera = this.viewer.camera
            var planes = [{
                    name: "xOz",
                    PHR: {
                        heading: 90,
                        pitch: 0
                    }
                }, {
                    name: "yOz",
                    PHR: {
                        heading: 0,
                        pitch: 0
                    }
                }, {
                    name: "xOy",
                    PHR: {
                        heading: 0,
                        pitch: 90
                    }
                }];
            var result = {};
            var tmp = new Cesium.Cartesian3(0, 0, 0);
            planes.forEach(function (plane) {
                var next = _this.rotate(point, plane.PHR);
                var sub = Cesium.Cartesian3.subtract(next, point, tmp);
                var normal = Cesium.Cartesian3.normalize(sub, tmp);
                var oOo = Cesium.Plane.fromPointNormal(point, normal); //Cesium.Cartesian3.normalize(Cesium.Cartesian3.subtract(next,point))
                var po = Cesium.IntersectionTests.rayPlane(ray, oOo);
                //未产生交点的时候 使用红点
                result[plane.name] = _this.tool.c3ToCartographicDegrees(po || point);
            });
            return result;
        };
        /**
         * 获取坐标轴（或者xOy面）上的位置
         * @param entity 实体
         * @param oldp 原始点
         * @param newp 新点
         * @returns {*}
         */
        RectPlane.prototype._getAxisCarsian = function (oldp, intersectPoint) {
            var newpoint;
            //$top, $left, $right, $bottom, $front, $behind
            switch (this.movingPointIndex) {
                case 1:
                case 2:
                    newpoint = intersectPoint['xOz'];
                    return Cesium.Cartesian3.fromDegrees(newpoint.longitude, oldp.latitude, oldp.height);
                case 4:
                case 5:
                    newpoint = intersectPoint['yOz'];
                    return Cesium.Cartesian3.fromDegrees(oldp.longitude, newpoint.latitude, oldp.height);
                case 0:
                case 3:
                    newpoint = intersectPoint[this._viewerPlane()];
                    return Cesium.Cartesian3.fromDegrees(oldp.longitude, oldp.latitude, newpoint.height);
            }
        };
        RectPlane.prototype._viewerPlane = function () {
            var camera = this.viewer.scene.camera;
            //135°~315°使用 xOz面
            return camera.heading > 0.75 * Math.PI && camera.heading < 1.75 * Math.PI ? 'xOz' : 'yOz';
        };
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
        RectPlane.prototype.rotate = function (base, opt) {
            var heading = Cesium.Math.toRadians(opt.heading);
            var pitch = Cesium.Math.toRadians(opt.pitch);
            var headingPitchRoll = new Cesium.HeadingPitchRoll(heading, pitch, 0);
            var mat4 = Cesium.Transforms.headingPitchRollToFixedFrame(base, headingPitchRoll);
            var vec3 = new Cesium.Cartesian3(300, 0, 0);
            return Cesium.Matrix4.multiplyByPoint(mat4, vec3, new Cesium.Cartesian3());
        };
        RectPlane.prototype.onShowChanged = function (show) {
            this.points.forEach(function (entity) {
                entity.show = show;
            });
            //隐藏面
            for (var key in this.planes) {
                this.planes[key].show = show;
            }
        };
        return RectPlane;
    }(VolumeBiningable));
    /**
     * 转换工具<br>
     * 一些简单的转换工具<br>
     * 只依赖核心的Cesium对象
     * @author flake
     */
    var ConvertTool = /** @class */ (function () {
        function ConvertTool() {
        }
        /**
         * 获取一个经纬度坐标【弧度制】
         * @param cartesian c3坐标
         * @return {Cartographic}
         */
        ConvertTool.c3ToCartographic = function (cartesian) {
            return Cesium.Cartographic.fromCartesian(cartesian);
        };
        /**
         * 获取一个经纬度坐标【度】
         * @param cartesian c3坐标
         * @return {Object}
         */
        ConvertTool.c3ToCartographicDegrees = function (cartesian) {
            var cartographic = Cesium.Cartographic.fromCartesian(cartesian);
            return this.cartographic2CartographicDegrees(cartographic);
        };
        /**
         * 经纬度坐标 弧度转度
         * @param cartographic 经纬度坐标【弧度制】
         * @return {{longitude: Number, latitude: Number, height: Number}}
         */
        ConvertTool.cartographic2CartographicDegrees = function (cartographic) {
            return LongLatHeight.formCartographic(cartographic);
        };
        /**
         * 得到一个c3坐标
         * @param cartographic 度类型的经度纬度高度
         * @return {Cartesian3}
         */
        ConvertTool.c3ByDegrees = function (cartographic, result) {
            return cartographic.toCartesian3(result);
        };
        /**
         * 得到一个c3坐标
         * @param cartographic 弧度类型的经度纬度高度
         * @return {Cartesian3}
         */
        ConvertTool.c3ByRadians = function (cartographic) {
            return Cesium.Cartesian3.fromRadians(cartographic.longitude, cartographic.latitude, cartographic.height);
        };
        /**
         * 根据经纬度高度数组拿到c3数组
         * @param arr like[lng,lat,height,lng,lat,height,...]
         * @returns {Array}.Cartesian3
         */
        ConvertTool.fromDegreesArrayWithHeight = function (arr) {
            var c3 = [];
            for (var i = 0; i < arr.length; i += 3) {
                c3.push(Cesium.Cartesian3.fromDegrees(arr[i], arr[i + 1], arr[i + 2]));
            }
            ///
            return c3;
        };
        /**
         * 弧度转度
         * @param radians 弧度
         * @return {Number}
         */
        ConvertTool.radians2Degrees = function (radians) {
            return Cesium.Math.toDegrees(radians);
        };
        /**
         * 度转弧度
         * @param degrees 度
         * @return {Number}
         */
        ConvertTool.degrees2Radians = function (degrees) {
            return Cesium.Math.toRadians(degrees);
        };
        /**
         * 经纬度相加
         * @param left
         * @param right
         * @return {{longitude: Number, latitude: Number, height: Number}}
         */
        ConvertTool.cartographicAdd = function (left, right) {
            return new LongLatHeight(left.longitude + right.longitude, left.latitude + right.latitude, Math.max(left.height, right.height));
        };
        /**
         * 扩容
         * @param left 左边点
         * @param right 右边点
         * @param size 目标点个数
         * @returns {Array} [lng,lat,height,lng,lat,height,...]
         */
        ConvertTool.expansion = function (left, right, size) {
            var xStep = (right[0] - left[0]) / size, yStep = (right[1] - left[1]) / size, zStep = (right[2] - left[2]) / size, arr = [];
            for (var i = 0; i < size; i++) {
                if (i === size - 1) { //避免计算误差
                    arr.push.apply(//避免计算误差
                    arr, right);
                }
                else {
                    arr.push(left[0] + xStep * i, left[1] + yStep * i, left[2] + zStep * i);
                }
            }
            return arr;
        };
        /**
         * 扩容
         * @param left{Cartesian3} 左边点
         * @param right{Cartesian3} 右边点
         * @param size 目标点个数
         * @returns {Array}
         */
        ConvertTool.expansionC3 = function (p1, p2, size) {
            var cartographic1 = Cesium.Cartographic.fromCartesian(p1), cartographic2 = Cesium.Cartographic.fromCartesian(p2), left = [Cesium.Math.toDegrees(cartographic1.longitude), Cesium.Math.toDegrees(cartographic1.latitude), cartographic1.height], right = [Cesium.Math.toDegrees(cartographic2.longitude), Cesium.Math.toDegrees(cartographic2.latitude), cartographic2.height];
            return Cesium.Cartesian3.fromDegreesArrayHeights(ConvertTool.expansion(left, right, size));
        };
        /**
         * 计算合并，返回一个最大值的经纬度高度对象
         * @return {{longitude: *, latitude: *, height: *}}
         */
        ConvertTool.mergeMax = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var longitude = args[0].longitude, latitude = args[0].latitude, height = args[0].height;
            for (var i = 0, length_1 = args.length; i < length_1; i++) {
                longitude = Math.max(longitude, args[i].longitude);
                latitude = Math.max(latitude, args[i].latitude);
                height = Math.max(height, args[i].height);
            }
            ///
            return new LongLatHeight(longitude, latitude, height);
        };
        /**
         * 计算合并，返回一个最小值的经纬度高度对象
         * @return {{longitude: *, latitude: *, height: *}}
         */
        ConvertTool.mergeMin = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var longitude = args[0].longitude, latitude = args[0].latitude, height = args[0].height;
            for (var i = 0, length_2 = args.length; i < length_2; i++) {
                longitude = Math.min(longitude, args[i].longitude);
                latitude = Math.min(latitude, args[i].latitude);
                height = Math.min(height, args[i].height);
            }
            ///
            return new LongLatHeight(longitude, latitude, height);
        };
        /**
         * 点面距离计算
         * planePoint1位于面上，planePoint2与planePoint1构成法线
         * 如果距离为正，则该点位于法线方向的半空间中; 如果为负，则该点位于与法线相反的半空间中; 如果为零，点在面上
         * @param planePoint1
         * @param planePoint2
         * @param point
         * @return {*}
         */
        ConvertTool.pointPlaneInstance = function (planePoint1, planePoint2, point) {
            var sub = Cesium.Cartesian3.subtract(planePoint2, planePoint1, new Cesium.Cartesian3(0, 0, 0));
            var normal = Cesium.Cartesian3.normalize(sub, new Cesium.Cartesian3(0, 0, 0));
            var plane = Cesium.Plane.fromPointNormal(planePoint1, normal);
            return Cesium.Plane.getPointDistance(plane, point);
        };
        return ConvertTool;
    }());
    /**
     * 页面的切片工具对应的控制工具
     */
    var SliceControl = /** @class */ (function () {
        /**
         * 构造函数
         * @param slice {SliceTool} SliceTool实例
         * @param el {String | HTMLElement | null} 元素，为null时会默认创建一个元素
         * @param opt {
         *     buttonClick(event,planeType,show)：xyz按钮的点击事件的回调,event：元素事件对象；planeType：轴对应的面；show：['show','hide']
         *     move(call,ele,type) xyz轴移动的回调,call移动的实时信息；ele:['X','Y','Z'];type:['move','end']
         * }
         */
        function SliceControl(slice, el, opt) {
            this.slice = slice;
            this.opt = opt || {};
            if (typeof el === 'string') {
                this.root = document.querySelector(el);
            }
            else if (typeof el === 'object' && el instanceof HTMLElement) {
                this.root = el;
            }
            else {
                this.root = this._createRoot();
            }
            this._createChild();
            this.init();
            this.bindingEvent();
            //储存当前的位置
            this._x = 0.5;
            this._y = 0.5;
            this._z = 0.5;
        }
        SliceControl.prototype.init = function () {
            var _this = this;
            if (this.inited)
                return;
            //添加默认的class和属性，请使用slice.control.css来控制样式
            this.root.classList.add("scroll-control");
            this.root.setAttribute("data-allow", "volume");
            //xyz 显示隐藏控制
            this.root.addEventListener("click", function (e) {
                if (e.target.tagName.toLowerCase() === 'span') {
                    var map = { X: 'yoz', Y: 'xoz', Z: 'xoy' };
                    var type = map[e.target.innerHTML];
                    if (e.target.className === 'active') {
                        e.target.className = '';
                        _this.slice.showPlane(type, true);
                    }
                    else {
                        e.target.className = 'active';
                        _this.slice.showPlane(type, false);
                    }
                    if (typeof _this.opt.buttonClick === 'function') {
                        _this.opt.buttonClick(e, type, e.target.className === 'active' ? 'show' : 'hide');
                    }
                }
                e.stopPropagation();
            });
            this.inited = true;
        };
        SliceControl.prototype._createRoot = function () {
            var root = document.createElement("div");
            document.body.appendChild(root);
            return root;
        };
        SliceControl.prototype._createChild = function () {
            this.root.innerHTML = this._createChildEle('X')
                + this._createChildEle('Y')
                + this._createChildEle('Z');
        };
        SliceControl.prototype._createChildEle = function (type) {
            return "\n            <div class=\"control\">\n                <span>" + type + "</span>\n                <div class=\"scroll\" id=\"scrollBar" + type + "\">\n                    <div class=\"bar\"></div>\n                    <div class=\"mask\"></div>\n                </div>\n            </div>\n";
        };
        SliceControl.prototype.bindingEvent = function () {
            var _this = this;
            if (typeof this.opt.move !== 'function') {
                this.opt.move = function () {
                };
            }
            this._createBar({
                el: "#scrollBarX",
                move: function (call) {
                    _this._sliceOffset('_x', call);
                    _this.opt.move(call, 'X', 'move');
                },
                end: function (call) {
                    _this._sliceOffset('_x', call);
                    _this.opt.move(call, 'X', 'end');
                }
            });
            this._createBar({
                el: "#scrollBarY",
                move: function (call) {
                    _this._sliceOffset('_y', call);
                    _this.opt.move(call, 'Y', 'move');
                },
                end: function (call) {
                    _this._sliceOffset('_y', call);
                    _this.opt.move(call, 'Y', 'end');
                }
            });
            this._createBar({
                el: "#scrollBarZ",
                move: function (call) {
                    _this._sliceOffset('_z', call);
                    _this.opt.move(call, 'Z', 'move');
                },
                end: function (call) {
                    _this._sliceOffset('_z', call);
                    _this.opt.move(call, 'Z', 'end');
                }
            });
        };
        /**
         * 设置体数据切片的位置
         * @param key 轴对应的变量
         * @param call 轴移动的回调参数
         * @private
         */
        SliceControl.prototype._sliceOffset = function (key, call) {
            this[key] = call.scale;
            this.slice.offset = {
                yoz_offset: this._x,
                xoz_offset: this._y,
                xoy_offset: this._z
            };
        };
        SliceControl.prototype._createBar = function (obj) {
            // 获取元素
            var scrollBar = this.root.querySelector(obj.el);
            var bar = scrollBar.children[0];
            var mask = scrollBar.children[1];
            var timer = new Date().getTime();
            // 拖动
            bar.onmousedown = function (event) {
                var leftVal = event.clientX - this.offsetLeft;
                // 拖动放到down的里面
                var that = this;
                document.onmousemove = function (event) {
                    var new_time = new Date().getTime();
                    if (new_time - timer < 17) {
                        return;
                    }
                    timer = new_time;
                    that.style.left = event.clientX - leftVal + "px";
                    // 限制条件
                    var val = parseInt(that.style.left);
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
        };
        SliceControl.prototype.destroy = function () {
            this.root.parentNode.removeChild(this.root);
            this.slice = null;
            this.opt = null;
        };
        return SliceControl;
    }());
    var VolumeMode;
    (function (VolumeMode) {
        VolumeMode[VolumeMode["GLOBE"] = 0] = "GLOBE";
        VolumeMode[VolumeMode["BOX"] = 1] = "BOX";
    })(VolumeMode || (VolumeMode = {}));
    var VolumeRenderMode;
    (function (VolumeRenderMode) {
        VolumeRenderMode[VolumeRenderMode["GLOBE_VOLUME"] = 1] = "GLOBE_VOLUME";
        VolumeRenderMode[VolumeRenderMode["GLOBE_SLICE"] = 2] = "GLOBE_SLICE";
        VolumeRenderMode[VolumeRenderMode["BOX_VOLUME"] = 3] = "BOX_VOLUME";
        VolumeRenderMode[VolumeRenderMode["BOX_SLICE"] = 4] = "BOX_SLICE";
    })(VolumeRenderMode || (VolumeRenderMode = {}));
    var MapVolume = /** @class */ (function (_super) {
        __extends(MapVolume, _super);
        ////
        function MapVolume(map3dView, from, to, options) {
            var _this = _super.call(this, map3dView, Box.fromStartEnd(from, to)) || this;
            _this._BoxSizeInMeter = new Cesium.Cartesian3();
            _this._boxMatrix = new Cesium.Matrix4();
            _this._boxMatrixInv = new Cesium.Matrix4();
            /// 
            options = options || {};
            ///
            _this._box = new Box(_this.box.from.longitude, _this.box.from.latitude, _this.box.from.height, _this.box.to.longitude, _this.box.to.latitude, _this.box.to.height);
            ///
            _this._name = options.name ? options.name : ("Volume_TimeStap_" + Date.now());
            _this._sliceNum = options.sliceNum ? options.sliceNum : [8, 8];
            _this._scale = options.scale ? options.scale : [1, 1, 1];
            _this._offset = options.offset ? options.offset : [0, 0, 0];
            _this._url = options.url ? options.url : "BaseWhite";
            _this._color = options.colorMap;
            _this._line = [0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0];
            //订阅者
            _this._bindings = [];
            //观察者
            _this._handlers = {};
            //存储各自变量
            _this._vol = { pri: null, apprance: null, mat: null };
            _this._sect = { pri: [], apprance: null, mat: null };
            ///
            if (options.filterParam) {
                _this.filterParam = options.filterParam || {};
            }
            /// 加载体数据（纹理）
            _this._loadImage(_this._url);
            _this._sectpri = [];
            // 体数据渲染的模式，1表示采用曲面代理几何渲染,0表示正立方体渲染
            _this._mode = (options && options.mode === VolumeMode.GLOBE) ? VolumeMode.GLOBE : VolumeMode.BOX;
            ///
            ///过滤分析
            if (FilterEdit && !_this._filterControl) {
                var param_1 = Object.assign({
                    split_X: 4,
                    split_Y: 2,
                    tolerance: 3,
                    min_X: 0,
                    max_X: 1000,
                    max_Y: 1000,
                    min_Y: 0
                }, _this.filterParam || {});
                /// 属性过滤界面
                var div = document.createElement("div");
                div.className = "analysis";
                div.setAttribute("data-allow", "volume");
                document.body.appendChild(div);
                /// 属性过滤
                _this._filterControl = new FilterEdit(div, param_1);
                //拖动事件:line为当前折线,position为控制点的位置
                _this._filterControl.onchangestatus = function (position, line) { };
                //拖动结束事件:line为当前折线,position为控制点的位置
                _this._filterControl.onchangestatus_over = function (position, line) {
                    // 最多接收16个值
                    _this.filterLine = line.flat().slice(0, 16).map(function (num, index) { return index % 2 === 0 ? num / param_1.max_X : num / param_1.max_Y; });
                };
            }
            return _this;
        }
        Object.defineProperty(MapVolume.prototype, "visible", {
            get: function () {
                return this.show;
            },
            // get/set 可见性
            set: function (visible) {
                this.show = visible;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "box", {
            get: function () {
                return this._box;
            },
            // get/set 盒子属性
            set: function (box) {
                this._box = box;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "scale", {
            get: function () {
                return this._scale;
            },
            /**
             * get/set 缩放比例
             * @param scale [xScale,yScale,zScale]
             * @example vol.scale = [1,1,2] z轴扩展两倍
             */
            set: function (scale) {
                this._scale = scale;
                this._calcParam();
                ///
                this.update(this._rbox);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "offset", {
            get: function () {
                return this._offset;
            },
            /**
             * get/set 偏移量
             * @param offset [x,y,z]
             * @example vol.offset = [0,0,100] 模型抬起100米
             */
            set: function (offset) {
                this._offset = offset;
                this._calcParam();
                ///
                this.update(this._rbox);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "filterLine", {
            get: function () {
                return this._line;
            },
            set: function (line) {
                this._line = line;
                if (line.length > 16)
                    line.length = 16;
                if (line.length < 16) {
                    for (var i = line.length; i < 16; ++i) {
                        line[i] = 16;
                    }
                }
                //过滤
                if (Array.isArray(line)) {
                    if (this._vol.mat) {
                        this._vol.mat.uniforms.u_VolFilterLine = line;
                    }
                    if (this._sect.mat) {
                        this._sect.mat.uniforms.u_VolFilterLine = line;
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "sliceVisble", {
            /**
             * 切片体的显示和隐藏
             * @param val
             */
            set: function (val) {
                this._sectpri.forEach(function (pri) {
                    pri.show = !!val;
                });
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "sliceXVisble", {
            set: function (val) {
                this._sectpri[0].show = !!val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "sliceYVisble", {
            set: function (val) {
                this._sectpri[1].show = !!val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "sliceZVisble", {
            set: function (val) {
                this._sectpri[2].show = !!val;
            },
            enumerable: true,
            configurable: true
        });
        MapVolume.prototype.initShader = function () {
            //this.shader;
        };
        MapVolume.prototype.update = function (box) {
            var _this = this;
            this._calcParam();
            this._bindings.forEach(function (tool) {
                tool.update(_this._rbox);
            });
        };
        MapVolume.prototype.clean = function () {
        };
        /**
         * 加载体数据图片
         * @param url
         * @private
         */
        MapVolume.prototype._loadImage = function (url) {
            var _this = this;
            /**
             * 标志位 表示图片的加载状态
             * @type {number} {0:未完成,1:已完成,-1:已失败}
             */
            this._VolDataLoaded = false;
            this._VolImage = this._VolImage || new Image();
            this._VolImage.src = url;
            this._VolImage.crossOrigin = "anonymous"; //允许跨域
            this._VolImage.onload = function () { return _this._VolDataLoaded = true; };
            this._VolImage.onerror = function () {
                _this._VolDataLoaded = false;
                throw new Error("体数据模型地址无效");
            };
        };
        /**
         * 将交互工具和体数据工具互相绑定<br>
         * 基于简单的发布/订阅模式，体数据范围更新的时候，会通知订阅者更新数据<br>
         * 使用此方法，不用关心手动去更新交互工具
         * @see this.update()
         * @param tools{Array.[VolumeBiningable] | VolumeBiningable} 实现了_Common的实例 或者实例数组
         */
        MapVolume.prototype.binding = function (tools) {
            if (!Array.isArray(tools)) {
                tools = [tools];
            }
            ///
            for (var i = 0; i < tools.length; i++) {
                var tool = tools[i];
                if (tool instanceof VolumeBiningable) {
                    this._bindings.push(tool);
                    tool.binding(this);
                }
                else {
                    throw Error("请传入实现_Comon接口的实例");
                }
            }
        };
        /**
         * 绑定事件
         * @param type 类型
         * @param handler 回调
         * @return {Number} 当前毫秒数，作为事件id ，移除事件的时候能用到
         * @example this.on("update",function(type,obj){})
         */
        MapVolume.prototype.on = function (type, handler) {
            if (!(type in this._handlers)) {
                this._handlers[type] = [];
            }
            ///
            var id = Date.now();
            this._handlers[type].push({
                handler: handler,
                id: id
            });
            return id;
        };
        /**
         * 移除事件
         * @param type 类型
         * @param id 事件id
         * @example this.off() 移除绑定在此对象上面的所有事件
         * @example this.off("update") 移除绑定在此对象上面的所有update事件
         * @example this.off("update",1123231231) 移除绑定在此对象上面的id为1123231231的update事件
         */
        MapVolume.prototype.off = function (type, id) {
            if (!type) { //清除所有观察者
                this._handlers = {};
            }
            else if (!id) { //清除某一个类型的观察者
                this._handlers[type] = [];
            }
            else if (this._handlers[type]) {
                var events = this._handlers[type];
                for (var i = 0; i < events.length; i++) {
                    if (events[i].id === id) { //移除单个事件
                        events.splice(i, 1);
                        break;
                    }
                }
            }
        };
        /**
         * 触发事件
         * @param type 类型
         * @param obj 传递过去的参数
         * @example this.emit("update",{})
         */
        MapVolume.prototype.emit = function (type, obj) {
            var events = this._handlers[type];
            for (var i = 0; i < events.length; i++) {
                if (typeof events[i].handler === 'function') {
                    events[i].handler(type, obj);
                }
            }
        };
        MapVolume.prototype._DelayInvoke = function (fGlobe, fBox) {
            var _this = this;
            var args = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                args[_i - 2] = arguments[_i];
            }
            if (this._VolDataLoaded) {
                return this._mode === VolumeMode.GLOBE ? fGlobe.call(this, args) : fBox.call(this, args);
            }
            else {
                setTimeout(function () { return _this._DelayInvoke(fGlobe, fBox); });
            }
        };
        MapVolume.prototype._createAppearance = function (mode, boxMin, boxMax, boxRadus, invMat) {
            /// 
            var uniforms = {
                u_SliceNumXf: this._sliceNum[0],
                u_SliceNumYf: this._sliceNum[1],
                u_CubeTex: this._VolImage,
                u_ColorTex: this._color,
                u_InvWorldMat: Cesium.Matrix4.toArray(invMat),
                u_VolBoxMin: boxMin,
                u_VolBoxMax: boxMax,
                u_VolClipMin: new Cesium.Cartesian3(0.0, 0.0, 0.0),
                u_VolClipMax: new Cesium.Cartesian3(1.0, 1.0, 1.0),
                u_VolBoxRadius: boxRadus,
                u_VolFilterLine: this._line
            };
            /// 
            var isSlice = mode === VolumeRenderMode.BOX_SLICE || mode === VolumeRenderMode.GLOBE_SLICE;
            /// 
            var matShader = "#define ZMAP_MODE " + mode + "\n\n#line 0" + this.shader.materialShader;
            // 创建材质
            var material = new Cesium.Material({
                translucent: true,
                fabric: {
                    type: 'ZMapVolume',
                    source: matShader,
                    uniforms: uniforms
                }
            });
            var apoptions = {
                material: material,
                vertexShaderSource: this.shader.vertexShader,
                fragmentShaderSource: this.shader.fragmentShader,
                translucent: true,
                faceForward: true,
                closed: false,
                renderState: {
                    cull: {
                        enabled: isSlice ? false : true,
                        face: Cesium.CullFace.BACK
                    }
                }
            };
            /// 创建表现
            return new Cesium.MaterialAppearance(apoptions);
        };
        /**
         * 显示提数据
         */
        MapVolume.prototype.setVolume = function () {
            this._DelayInvoke(this._setVolumeOnGlobe, this._setVolumeOnBox);
        };
        /**
         * 普通模型的渲染方式
         */
        MapVolume.prototype._setVolumeOnBox = function () {
            var viewer = this.viewer;
            //计算参数
            this._calcParam();
            /// 创建表现
            this._vol.apprance = this._createAppearance(VolumeRenderMode.BOX_VOLUME, Cesium.Cartesian3.ZERO, this._BoxSizeInMeter, 0, this._boxMatrixInv);
            this._vol.mat = this._vol.apprance.material;
            // 代理几何体添加到指定经纬度场景
            var box = new Cesium.BoxGeometry({
                maximum: this._BoxSizeInMeter,
                minimum: Cesium.Cartesian3.ZERO
            });
            var geom = Cesium.BoxGeometry.createGeometry(box);
            this._vol.pri && viewer.scene.primitives.remove(this._vol.pri);
            this._vol.pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geom,
                    modelMatrix: this._boxMatrix,
                    id: this._name
                }),
                asynchronous: false,
                appearance: this._vol.apprance
            });
            viewer.scene.primitives.add(this._vol.pri);
        };
        /**
         * 曲面模型的渲染方式
         */
        MapVolume.prototype._setVolumeOnGlobe = function () {
            var viewer = this.viewer;
            //计算参数
            var param = this._calcParam();
            var _a = this._rbox, xmin = _a.xmin, xmax = _a.xmax, ymin = _a.ymin, ymax = _a.ymax, zmin = _a.zmin, zmax = _a.zmax;
            // 代理几何体添加到指定经纬度场景
            var rectangle = new Cesium.RectangleGeometry({
                rectangle: Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
                height: zmin,
                extrudedHeight: zmax
            });
            ///
            var geom = Cesium.RectangleGeometry.createGeometry(rectangle);
            /// 创建表现
            this._vol.apprance = this._createAppearance(VolumeRenderMode.GLOBE_VOLUME, new Cesium.Cartesian3(xmin, ymin, zmin), new Cesium.Cartesian3(xmax, ymax, zmax), this._boundRadius, this._boxMatrixInv);
            this._vol.mat = this._vol.apprance.material;
            /// 移除旧的提数据对象
            this._vol.pri && viewer.scene.primitives.remove(this._vol.pri);
            /// 创建提数据Primitive
            this._vol.pri = new Cesium.Primitive({
                geometryInstances: new Cesium.GeometryInstance({
                    geometry: geom,
                    //debugShowBoundingVolume: true,
                    // modelMatrix: matrix,
                    id: this._name
                }),
                asynchronous: false,
                appearance: this._vol.apprance
            });
            ///
            viewer.scene.primitives.add(this._vol.pri);
        };
        MapVolume.prototype.setSlice = function (slice) {
            var _this = this;
            var viewer = this.viewer;
            ///
            if (this._vol.pri)
                this._vol.pri.show = false;
            /// 删除旧的切面模型
            this._sectpri.forEach(function (pri, index) {
                if (pri && pri.show !== false) {
                    viewer.scene.primitives.remove(pri);
                    _this._sectpri[index] = null;
                }
            });
            this._DelayInvoke(this.setSliceOnGlobe, this._setSliceOnBox, slice);
        };
        MapVolume.prototype._setSliceOnBox = function (slice) {
            var viewer = this.viewer;
            //计算参数
            this._calcParam();
            /// 
            var _a = this._BoxSizeInMeter, deltaX = _a.x, deltaY = _a.y, deltaZ = _a.z;
            /// 创建材质
            if (!this._sect.apprance) {
                this._sect.apprance = this._createAppearance(VolumeRenderMode.BOX_SLICE, Cesium.Cartesian3.ZERO, this._BoxSizeInMeter, 0, this._boxMatrixInv);
                this._sect.mat = this._sect.apprance.material;
            }
            ///
            var indices = new Uint32Array([0, 1, 3, 3, 2, 0]);
            //create buffer
            var slices = [];
            //为0的时候会报错，下同
            if (slice.x !== undefined) {
                var _xSlice = slice.x * deltaX;
                slices[0] = ({
                    position: new Float64Array([
                        _xSlice, 0.0, 0.0,
                        _xSlice, deltaY, 0.0,
                        _xSlice, 0.0, deltaZ,
                        _xSlice, deltaY, deltaZ
                    ]),
                    normal: new Float32Array([
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                    ]),
                    name: 'lonSection'
                });
            }
            if (slice.y !== undefined) {
                var _ySlice = slice.y * deltaY;
                slices[1] = ({
                    position: new Float64Array([
                        0.0, _ySlice, 0.0,
                        deltaX, _ySlice, 0.0,
                        0.0, _ySlice, deltaZ,
                        deltaX, _ySlice, deltaZ
                    ]),
                    normal: new Float32Array([
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                    ]),
                    name: 'latSection'
                });
            }
            if (slice.z !== undefined) {
                var _zSlice = slice.z * deltaZ;
                slices[2] = ({
                    position: new Float64Array([
                        0.0, 0.0, _zSlice,
                        deltaX, 0.0, _zSlice,
                        0.0, deltaY, _zSlice,
                        deltaX, deltaY, _zSlice
                    ]),
                    normal: new Float32Array([
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                        0.0, 0.0, 1.0,
                    ]),
                    name: 'heiSection'
                });
            }
            ///
            for (var i = 0; i < slices.length; i++) {
                var slice_1 = slices[i];
                var attributes = new Cesium.GeometryAttributes();
                attributes.position = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.DOUBLE,
                    componentsPerAttribute: 3,
                    values: slice_1.position
                });
                attributes.normal = new Cesium.GeometryAttribute({
                    componentDatatype: Cesium.ComponentDatatype.FLOAT,
                    componentsPerAttribute: 3,
                    values: slice_1.normal
                });
                var geo = new Cesium.Geometry({
                    attributes: attributes,
                    indices: indices,
                    primitiveType: Cesium.PrimitiveType.TRIANGLES,
                    boundingSphere: Cesium.BoundingSphere.fromVertices(slice_1.position)
                });
                var pri = new Cesium.Primitive({
                    geometryInstances: new Cesium.GeometryInstance({
                        geometry: geo,
                        id: slice_1.name,
                        modelMatrix: this._boxMatrix
                    }),
                    asynchronous: false,
                    appearance: this._sect.apprance
                });
                ///
                this._sectpri[i] = (pri);
                viewer.scene.primitives.add(pri);
            }
        };
        MapVolume.prototype.setSliceOnGlobe = function (slice) {
            var viewer = this.viewer;
            this._calcParam();
            var _a = this._rbox, xmin = _a.xmin, ymin = _a.ymin, zmin = _a.zmin, xmax = _a.xmax, ymax = _a.ymax, zmax = _a.zmax;
            ///
            var target_x = xmin + slice.x * (xmax - xmin), target_y = ymin + slice.y * (ymax - ymin), target_z = zmin + slice.z * (zmax - zmin);
            /// 创建材质
            if (!this._sect.apprance) {
                this._sect.apprance = this._createAppearance(VolumeRenderMode.GLOBE_SLICE, new Cesium.Cartesian3(xmin, ymin, zmin), new Cesium.Cartesian3(xmax, ymax, zmax), 0, this._boxMatrixInv);
                this._sect.mat = this._sect.apprance.material;
            }
            //create buffer
            var nameArray = ["lonSection", "latSection", "heiSection"];
            var geoArray = [null, null, null];
            // xslice
            if (!this._sectpri[0]) {
                var xWall = Cesium.WallGeometry.fromConstantHeights({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        target_x, ymin,
                        target_x, ymax,
                    ]),
                    minimumHeight: zmin,
                    maximumHeight: zmax
                });
                ///
                geoArray[0] = Cesium.WallGeometry.createGeometry(xWall);
            }
            // yslice
            if (!this._sectpri[1]) {
                var yWall = Cesium.WallGeometry.fromConstantHeights({
                    positions: Cesium.Cartesian3.fromDegreesArray([
                        xmin, target_y,
                        xmax, target_y,
                    ]),
                    minimumHeight: zmin,
                    maximumHeight: zmax
                });
                geoArray[1] = Cesium.WallGeometry.createGeometry(yWall);
            }
            // zslice
            if (!this._sectpri[2]) {
                var zGeo = new Cesium.RectangleGeometry({
                    rectangle: Cesium.Rectangle.fromDegrees(xmin, ymin, xmax, ymax),
                    height: target_z
                });
                geoArray[2] = Cesium.RectangleGeometry.createGeometry(zGeo);
            }
            //add slice primitive
            for (var i = 0; i < 3; i++) {
                if (!this._sectpri[i]) {
                    var pri = new Cesium.Primitive({
                        geometryInstances: new Cesium.GeometryInstance({
                            geometry: geoArray[i],
                            id: nameArray[i],
                            attributes: {
                                color: Cesium.ColorGeometryInstanceAttribute.fromColor(Cesium.Color.TRANSPARENT)
                            }
                        }),
                        asynchronous: false,
                        appearance: this._sect.apprance
                    });
                    this._sectpri[i] = pri;
                    viewer.scene.primitives.add(pri);
                }
            }
        };
        MapVolume.prototype.reset = function () {
            this._scale = [1, 1, 1];
            this._offset = [0, 0, 0];
            ///
            return this.setVolume();
        };
        MapVolume.prototype.onShowChanged = function (show) {
        };
        MapVolume.prototype.destroy = function () {
            var viewer = this.viewer;
            var pris = viewer.scene.primitives;
            if (this._vol.pri) {
                pris.remove(this._vol.pri);
                this._vol.pri = null;
            }
            this._sectpri.forEach(function (pri) {
                pris.remove(pri);
            });
            this._sectpri = [];
            return;
        };
        Object.defineProperty(MapVolume.prototype, "colorMap", {
            set: function (colorMap) {
                if (this._vol.mat) {
                    this._vol.mat.uniforms.u_ColorTex = colorMap;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "filter", {
            ///
            get: function () {
                return this._filterOpen;
            },
            /**
             * 设置属性过滤
             * @param open {boolean} 是否开启属性过滤
             */
            set: function (open) {
                if (open) {
                    this._filterControl && (this._filterControl.element.style.visibility = "visible");
                }
                else {
                    this._filterControl && (this._filterControl.element.style.visibility = "hidden");
                }
                this._filterOpen = open;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(MapVolume.prototype, "range", {
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
            set: function (ranges) {
                if (this._vol.mat) {
                    var box = this._rbox;
                    var uniforms = this._vol.mat.uniforms;
                    //keep the value in [0,1]
                    var keep = function (val) {
                        return Math.max(Math.min(val, 0.9999999), 0.000001);
                    };
                    uniforms.u_VolClipMin.x = keep(ranges.xmin / box.xmin);
                    uniforms.u_VolClipMin.y = keep(ranges.ymin / box.ymin);
                    uniforms.u_VolClipMin.z = keep(ranges.zmin / box.zmin);
                    uniforms.u_VolClipMax.x = keep(ranges.xmax / box.xmax);
                    uniforms.u_VolClipMax.y = keep(ranges.ymax / box.ymax);
                    uniforms.u_VolClipMax.z = keep(ranges.zmax / box.zmax);
                }
            },
            enumerable: true,
            configurable: true
        });
        MapVolume.prototype.SetOffset = function (arr) {
            this._offset = arr;
            this.setVolume();
        };
        MapVolume.prototype._calcScaleOffsetBox = function () {
            var box = this._box, offset = this._offset, scale = this._scale;
            var xoffset = offset[0], yoffset = offset[1], zoffset = offset[2];
            var xscale = scale[0], yscale = scale[1], zscale = scale[2];
            /// 
            this._rbox = new Box(xoffset + box.xmin * xscale, yoffset + box.ymin * yscale, zoffset + box.zmin * zscale, xoffset + box.xmax * xscale, yoffset + box.ymax * yscale, zoffset + box.zmax * zscale);
        };
        MapVolume.prototype._calcParam = function () {
            this._calcScaleOffsetBox();
            // 求指定经纬度所代表的长宽范围
            var a = Cesium.Cartesian3.fromDegrees(this._rbox.xmin, this._rbox.ymax, this._rbox.zmin);
            var c = Cesium.Cartesian3.fromDegrees(this._rbox.xmin, this._rbox.ymin, this._rbox.zmin);
            var d = Cesium.Cartesian3.fromDegrees(this._rbox.xmax, this._rbox.ymax, this._rbox.zmin);
            //跨度
            var deltaX = Cesium.Cartesian3.distance(a, d);
            var deltaY = Cesium.Cartesian3.distance(a, c);
            var deltaZ = this._rbox.size[2];
            Cesium.BoundingSphere.fromCornerPoints;
            /// 
            Cesium.Cartesian3.fromElements(deltaX, deltaY, deltaZ, this._BoxSizeInMeter);
            this._boundRadius = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            // 求Cen几何体变换矩阵的逆矩阵
            Cesium.Transforms.eastNorthUpToFixedFrame(Cesium.Cartesian3.fromDegrees(this._rbox.xmin, this._rbox.ymin, this._rbox.zmin), undefined, this._boxMatrix);
            ///
            Cesium.Matrix4.inverse(this._boxMatrix, this._boxMatrixInv);
        };
        MapVolume.prototype.getSecPri = function (name) {
            var secpriArr = this._sectpri;
            var secpri = null;
            for (var i = 0; i < secpriArr.length; i++) {
                if ((secpriArr[i]._instanceIds)[0] == name) {
                    secpri = secpriArr[i];
                    break;
                }
            }
            return secpri;
        };
        return MapVolume;
    }(VolumeBiningable));
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
    var FilterEdit = /** @class */ (function () {
        ///
        function FilterEdit(element, param) {
            ///
            if (!(element instanceof Element)) {
                throw new Error("请传入一个正确的页面元素");
            }
            ///
            this.element = element;
            ///
            param = Object.assign({
                name_X: "属性值",
                split_X: 4,
                max_X: 1000,
                min_X: 0,
                name_Y: "透明度",
                split_Y: 5,
                max_Y: 1000,
                min_Y: 0,
                tolerance: 3,
                bkColor: "#22344C",
                axisColor: "#C6CDCC",
                lineColor: "#FF0000",
                fontColor: "#C6CDCC",
                textSpace: 2
            }, param);
            this._name_X = param.name_X;
            this._split_X = param.split_X;
            this._min_X = param.min_X;
            this._max_X = param.max_X;
            this._name_Y = param.name_Y;
            this._split_Y = param.split_Y;
            this._min_Y = param.min_Y;
            this._max_Y = param.max_Y;
            /// 
            this._tolerance = param.tolerance;
            this._bkColor = param.bkColor;
            this._axisColor = param.axisColor;
            this._lineColor = param.lineColor;
            this._fontColor = param.fontColor;
            this._textSpace = param.textSpace;
            /// 
            this.x_axis = 30;
            this.y_axis = 40;
            ///
            this._line = param.line ? param.line : [[0, 0], [this._max_X, this._max_Y]];
            this._init(this.element);
        }
        /**
         * 初始化
         * @param div
         */
        FilterEdit.prototype._init = function (div) {
            var _this = this;
            ///
            this._width = div.offsetWidth;
            this._height = div.offsetHeight;
            ///
            this._painter = document.createElement('canvas');
            this._painter.width = this._width;
            this._painter.height = this._height;
            ///
            div.appendChild(this._painter);
            /// 
            this._context = this._painter.getContext('2d');
            ///
            this._toDrawCoord();
            var highlight_status = -1;
            var selectedPoint = -1;
            /// 鼠标按下
            this._painter.addEventListener('mousedown', function (e) {
                /// 没有选中点
                if (selectedPoint < 0) {
                    //插入点
                    selectedPoint = -selectedPoint;
                    _this._trans_line.splice(selectedPoint, 0, [e.offsetX, e.offsetY]);
                    ///
                    _this._draw(selectedPoint);
                    _this._toLoginCoord();
                }
            });
            /// 鼠标移动
            this._painter.addEventListener('mousemove', function (e) {
                /// 左键按下
                if ((e.button & 1) === 1) {
                    var yposition = void 0;
                    if (e.offsetY <= 50)
                        yposition = 50;
                    else if (e.offsetY > _this._height - _this.x_axis)
                        yposition = _this._height - _this.x_axis;
                    else
                        yposition = e.offsetY;
                    if (selectedPoint == 0)
                        _this._trans_line[selectedPoint] = [_this.y_axis, yposition];
                    else if (selectedPoint == _this._trans_line.length - 1)
                        _this._trans_line[selectedPoint] = [_this._width - 50, yposition];
                    else {
                        _this._trans_line[selectedPoint] = [e.offsetX, yposition];
                        for (var i = 1; i < _this._trans_line.length - 1 - selectedPoint; i++) {
                            if (_this._trans_line[selectedPoint + i][0] <= e.offsetX)
                                _this._trans_line[selectedPoint + i][0] = e.offsetX;
                        }
                        for (var i = 0; i < selectedPoint; i++) {
                            if (_this._trans_line[i][0] >= e.offsetX)
                                _this._trans_line[i][0] = e.offsetX;
                        }
                        if (e.offsetX >= _this._width - 50) {
                            _this._trans_line.splice(selectedPoint + 1, _this._trans_line.length - 1 - selectedPoint);
                            _this._trans_line[selectedPoint] = [_this._width - 50, yposition];
                        }
                        if (e.offsetX <= _this.y_axis) {
                            _this._trans_line.splice(0, selectedPoint);
                            selectedPoint = 0;
                            _this._trans_line[0] = [_this.y_axis, yposition];
                        }
                    }
                    ///
                    _this._draw(selectedPoint);
                    _this._toLoginCoord();
                    ///
                    _this.onchangestatus(selectedPoint, _this._line);
                }
                /// 直接移动
                else {
                    //mouseon
                    var point = [e.offsetX, e.offsetY];
                    selectedPoint = _this._getSelectedPoint(point);
                    ///
                    _this._draw();
                    if (selectedPoint > 0) {
                        _this.highlight(selectedPoint);
                    }
                }
            });
            /// 鼠标弹起
            this._painter.addEventListener('mouseup', function (e) {
                _this.onchangestatus_over(selectedPoint, _this._line);
            });
            ///
            this._painter.addEventListener('mouseout', function (e) {
                _this.onchangestatus_over(selectedPoint, _this._line);
            });
            ///
            this._draw();
        };
        FilterEdit.prototype._reset = function () {
            this._line = [[0, 0], [this._max_X, this._max_Y]];
            this._toDrawCoord();
            this._draw();
        };
        FilterEdit.prototype._resetMax = function () {
            this._line = [[0, this._max_Y], [this._max_X, this._max_Y]];
            this._toDrawCoord();
            this._draw();
        };
        FilterEdit.prototype._resetPoints = function (points) {
            this._line = points;
            this._toDrawCoord();
            this._draw();
        };
        FilterEdit.prototype._draw = function (i) {
            this.clearCanvas();
            this._draw_arrow();
            this._draw_line(i);
        };
        FilterEdit.prototype._draw_arrow = function () {
            var context = this._context;
            context.beginPath();
            context.lineWidth = 1;
            context.strokeStyle = this._axisColor;
            context.font = "10px Courier New";
            context.fillStyle = this._fontColor;
            //y
            context.moveTo(this.y_axis, this._height - this.x_axis);
            context.lineTo(this.y_axis, 30);
            context.lineTo(this.y_axis - 4, 34);
            context.moveTo(this.y_axis, 30);
            context.lineTo(this.y_axis + 4, 34);
            //x
            context.moveTo(this.y_axis, this._height - this.x_axis);
            context.lineTo(this._width - 30, this._height - this.x_axis);
            context.lineTo(this._width - 34, this._height - this.x_axis - 4);
            context.moveTo(this._width - 30, this._height - this.x_axis);
            context.lineTo(this._width - 34, this._height - this.x_axis + 4);
            //x刻度
            var cell_x = (this._width - 50 - this.y_axis) / this._split_X;
            var cell_x_value = Math.floor((this._max_X - this._min_X) / this._split_X);
            for (var i = 1; i <= this._split_X; i++) {
                context.moveTo(cell_x * i + this.y_axis, this._height - this.x_axis);
                if (i % this._textSpace == 1) {
                    //画长标签
                    context.lineTo(cell_x * i + this.y_axis, this._height - this.x_axis + 5);
                    context.fillText((this._min_X + cell_x_value * i).toFixed(0), cell_x * i + this.y_axis - 5, this._height - this.x_axis + 15);
                }
                else {
                    //画短标签
                    context.lineTo(cell_x * i + this.y_axis, this._height - this.x_axis + 3);
                }
            }
            context.moveTo(this._width - 50, this._height - 30);
            context.lineTo(this._width - 50, 50);
            context.fillText(this._name_X, this._width - 45, this._height - this.x_axis - 11);
            context.fillText(this._name_Y, this.y_axis - 15, 30);
            context.stroke();
            context.beginPath();
            //y刻度
            context.strokeStyle = this._axisColor;
            context.lineWidth = 1;
            var cell_y = (this._height - this.x_axis - 50) / this._split_Y;
            var cell_y_value = Math.floor((this._max_Y - this._min_Y) / this._split_Y);
            for (var i = 0; i < this._split_Y; i++) {
                context.moveTo(this.y_axis, cell_y * i + 50);
                context.lineTo(this._width - 50, cell_y * i + 50);
                context.fillText((this._max_Y - cell_y_value * i).toFixed(0), this.y_axis - 30, cell_y * i + 53);
            }
            context.stroke();
        };
        FilterEdit.prototype._draw_line = function (position) {
            var context = this._context;
            context.lineWidth = 1;
            context.strokeStyle = this._lineColor;
            context.beginPath();
            context.moveTo(this._trans_line[0][0], this._trans_line[0][1]);
            for (var i = 1; i < this._trans_line.length; i++) {
                context.lineTo(this._trans_line[i][0], this._trans_line[i][1]);
            }
            context.stroke();
            context.lineWidth = 1;
            context.fillStyle = this._lineColor;
            for (var i = 0; i < this._trans_line.length; i++) {
                context.beginPath();
                context.arc(this._trans_line[i][0], this._trans_line[i][1], 4, 0, Math.PI * 2);
                context.fill();
            }
            if (position !== undefined) {
                this.highlight(position);
            }
        };
        FilterEdit.prototype.highlight = function (i) {
            var context = this._context;
            context.lineWidth = 1;
            context.fillStyle = this._lineColor;
            context.beginPath();
            context.arc(this._trans_line[i][0], this._trans_line[i][1], 5, 0, Math.PI * 2);
            context.fill();
        };
        FilterEdit.prototype.clearCanvas = function () {
            var context = this._context;
            context.fillStyle = this._bkColor;
            context.fillRect(0, 0, this._width, this._height);
        };
        FilterEdit.prototype._toDrawCoord = function () {
            this._trans_line = [];
            for (var i = 0; i < this._line.length; i++) {
                var re = [0, 0];
                re[0] = (this._line[i][0] - this._min_X) / (this._max_X - this._min_X) * (this._width - this.y_axis - 50) + this.y_axis;
                re[1] = this._height - this.x_axis - ((this._line[i][1] - this._min_Y) / (this._max_Y - this._min_Y) * (this._height - this.x_axis - 50));
                this._trans_line.push(re);
            }
        };
        FilterEdit.prototype._toLoginCoord = function () {
            this._line = [];
            for (var i = 0; i < this._trans_line.length; i++) {
                var re = [0, 0];
                re[0] = ((this._trans_line[i][0] - this.y_axis) / (this._width - this.y_axis - 50) * (this._max_X - this._min_X) + this._min_X);
                re[1] = ((this._height - this.x_axis - this._trans_line[i][1]) / (this._height - this.x_axis - 50) * (this._max_Y - this._min_Y) + this._min_Y);
                this._line.push(re);
            }
        };
        FilterEdit.prototype.onchangestatus = function (positon, line) { };
        FilterEdit.prototype.onchangestatus_over = function (positon, line) { };
        /**
         * 计算两点距离的平方
         * @param p1
         * @param p2
         */
        FilterEdit._squareDistance = function (p1, p2) {
            var x = p1[0] - p2[0];
            var y = p1[1] - p2[1];
            return (x * x + y * y);
        };
        /**
         * 获取鼠标附近的点
         * @param point
         * @param line
         * @param tole
         */
        FilterEdit.prototype._getSelectedPoint = function (point) {
            var line = this._trans_line, tole = this._tolerance;
            var max = tole * tole;
            for (var i = 0; i < line.length; i++) {
                var sd = FilterEdit._squareDistance(point, line[i]);
                if (sd <= max)
                    return i;
            }
            for (var i = 0; i < line.length; i++) {
                if (point[0] >= line[i][0])
                    return -i;
            }
            ///
            return 999;
        };
        return FilterEdit;
    }());
})(Volumn || (Volumn = {}));
