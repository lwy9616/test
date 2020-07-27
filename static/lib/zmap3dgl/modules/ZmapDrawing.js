import Calc from './ZmapCompute.js';

/**
 * 三维场景几何绘制类
 * @example
 * const tool = new ZmapDrawing(viewer);
 * //开始画多边形
 * tool.startDrawPolygon({
 *  leftClick:pos=>{ console.log(pos);},
 *  polygonOptions:{
 *      material:Cesium.Color.RED,
 *  }
 * });
 */
export default class ZmapDrawing {

    /**
     * 基础几何图形绘制工具类构造函数
     * @param {Cegore.Viewer} viewer 三维视图对象的实例
     */
    constructor(viewer) {
        this.viewer = viewer;
        this.czviewer = viewer._czdata.viewer;
        this.calc = new Calc(viewer);
    }

    /**
     * 点绘制方法
     * @param {function} opts.leftClick （可选）左键单击时触发的回调函数
     * @param {function} opts.rightClick （可选）右键单击时触发的回调函数
     * @param {Object} opts.pointOptions （可选）指定所画点的属性值，具体参数参考Cesium.PointGraphics的options进行设置
     */
    startdrawPoint(opts = {}) {
        const { viewer, czviewer, calc } = this;
        const sceneHandler = new Cesium.ScreenSpaceEventHandler(czviewer.canvas);
        const { pointOptions, leftClick, rightClick,drawheight } = opts;
        const potsEntities = [];
        const drawHeight = drawheight || undefined;
        //单击开始画线
        sceneHandler.setInputAction(function (arg) {
            // var ccartesian3 = czviewer.scene.pickPosition(arg.position);
            const ccartesian3 = calc.getendpt(arg.position,drawHeight);

            if (!ccartesian3) return;
            const entity = czviewer.entities.add({
                position: ccartesian3,
                point: {
                    color: Cesium.Color.RED,
                    pixelSize: 5,
                    ...pointOptions
                }
            });
            potsEntities.push(entity);
            if (typeof leftClick === 'function') leftClick(startPoints);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        //右键单击退出测量
        sceneHandler.setInputAction(function (arg) {
            sceneHandler.destroy();
            potsEntities.forEach(e => { czviewer.entities.remove(e) });
            if (typeof rightClick == 'function') rightClick(potsEntities);
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

    /**
     * 线绘制方法
     * @param {Object} opts.polylineOptions （可选）配置所画线的属性值，具体参数参考Cesium.PolylineGraphics的options进行设置
     * @param {function} opts.leftClick （可选）左键单击时触发的回调函数
     * @param {function} opts.leftDbClick （可选）左键双击时触发的回调函数
     * @param {function} opts.rightClick （可选）右键单击时触发的回调函数
     * @param {function} opts.mouseMove （可选）鼠标移动时触发的回调函数 
     */
    startdrawLine(opts = {}) {

        const { viewer, czviewer, calc } = this;

        const sceneHandler = new Cesium.ScreenSpaceEventHandler(czviewer.canvas);
        const startPoints = [];
        let purpleArrow = null;
        let endpoint = null;
        
        const { polylineOptions, leftClick, leftDbClick, rightClick, mouseMove,drawLineHeight } = opts;
        const drawHeight = drawLineHeight || undefined;


        //单击开始画线
        sceneHandler.setInputAction(function (arg) {
            // var ccartesian3 = czviewer.scene.pickPosition(arg.position);
            const ccartesian3 = calc.getendpt(arg.position,drawHeight);

            if (!ccartesian3) return;
            startPoints.push(ccartesian3);

            if (typeof leftClick === 'function') leftClick(startPoints);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        function getpoint() {
            var line = startPoints.slice(0);
            if (endpoint) line.push(endpoint);
            return line;
        }

        //线的末端跟随鼠标位置
        sceneHandler.setInputAction(function (arg) {

            if (startPoints.length < 1) return;
            // var cartesian3 = czviewer.scene.pickPosition(arg.endPosition);
            const cartesian3 = calc.getendpt(arg.endPosition,drawHeight);
            if (!cartesian3) return;
            if (purpleArrow) {
                endpoint = cartesian3;
            } else {
                purpleArrow = czviewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(getpoint, false),
                        width: 2,
                        followSurface: false,
                        show: true,
                        material: new Cesium.Color(174 / 255, 238 / 255, 238 / 255),
                        ...polylineOptions
                    },
                });
            }
            if (typeof mouseMove === 'function') mouseMove(endpoint, startPoints);
            
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //双击结束画线
        sceneHandler.setInputAction(function (arg) {
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            var line = startPoints.slice(0);
            if (endpoint) line.push(endpoint);
            if (typeof leftDbClick == 'function') leftDbClick(line, purpleArrow);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //右键单击退出测量
        sceneHandler.setInputAction(function (arg) {
            sceneHandler.destroy();
            czviewer.entities.remove(purpleArrow);
            if (typeof rightClick == 'function') rightClick();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

    }

    /**
     * 多边形绘制方法
     * @param {Object} opts.polygonOptions （可选）配置所画线的属性值，具体参数参考Cesium.PolygonGraphics的options进行设置
     * @param {function} opts.leftClick （可选）左键单击时触发的回调函数
     * @param {function} opts.leftDbClick （可选）左键双击时触发的回调函数
     * @param {function} opts.rightClick （可选）右键单击时触发的回调函数
     * @param {function} opts.mouseMove （可选）鼠标移动时触发的回调函数
     */
    startDrawPolygon(opts = {}) {

        const { viewer, czviewer, calc } = this;

        const { polygonOptions, leftClick, leftDbClick, rightClick, mouseMove,drawLineHeight} = opts;
        const sceneHandler = new Cesium.ScreenSpaceEventHandler(czviewer.canvas);
        const drawHeight = drawLineHeight || undefined;
        var lineEntity = null;
        var polygonEntity = null;

        var _primitive = null;

        /// 实际点击的点
        var points = [];
        /// 获取用于绘制的点
        var getPoints = [];

        /// 左键单击
        function OnClickLeft(arg) {

            console.log("click");

            const ccartesian3 = calc.getendpt(arg.position,drawHeight)

            if (!ccartesian3) return;

            ///
            if (points.length == 0)
                points.push(ccartesian3);

            /// 每次点击的时候添加一个“空点”，
            /// 因为点击的位置实际上在OnMouseMove的时候已经更新了，
            /// 这里添加一个占位符
            points.push(null);
            if (typeof leftClick == 'function') leftClick(line);
        }

        /// 右键单击
        function OnClickRight(arg) {
            sceneHandler.destroy();
            if (_primitive)
                czviewer.scene.primitives.remove(_primitive);
            czviewer.entities.remove(lineEntity);
            czviewer.entities.remove(polygonEntity);
            if (typeof rightClick == 'function') rightClick();
        }

        /// 双击
        function OnDbClick(arg) {

            console.log("dbclick");

            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

            if (typeof leftDbClick == 'function') leftDbClick(getPoints, polygonEntity);
            // alert(viewer.scene.calcArea(line))
        }
        /// 鼠标移动
        function OnMouseMove(arg) {
            if (points.length < 1) return;
            /// 更新最后一个点
            points[points.length - 1] = calc.getendpt(arg.endPosition,drawHeight);

            /// 添加线
            if (points.length == 2) {
                if (!lineEntity) {
                    lineEntity = czviewer.entities.add({
                        polyline: {
                            positions: new Cesium.CallbackProperty(getpoint, false),
                            width: 1,
                            followSurface: false,
                            show: true,
                            material: Cesium.Color.RED,
                            height:drawHeight
                        }
                    });
                }
            }

            /// 添加多边形
            if (points.length > 2) {
                if (lineEntity) {
                    czviewer.entities.remove(lineEntity);
                    lineEntity = null;
                }
                if (!polygonEntity) {
                    polygonEntity = czviewer.entities.add({
                        polygon: {
                            hierarchy: new Cesium.CallbackProperty(getpoint, false),
                            material: new Cesium.Color(174 / 255, 238 / 255, 238 / 255, .7),
                            height:drawHeight,
                            ...polygonOptions
                        },
                        id:"drawpolygon"
                    });
                }
            }

            if (typeof mouseMove == 'function') mouseMove(calc.getendpt(arg.endPosition,drawHeight));

        }


        /// 获取用于显示的点
        let getpoint = function () {
            getPoints.length = 0;
            var last = null;
            for (var i = 0; i < points.length; ++i) {
                if (points[i] == null) continue;
                if (last == null) {
                    last = points[i];
                    getPoints.push(last.clone());
                }
                else if (!last.equalsEpsilon(points[i], 0, 0.1)) {
                    last = points[i];
                    getPoints.push(last.clone());
                }
            }

            if (getPoints.length >= 3) {
                getPoints.push(getPoints[0].clone());
            }

            return getPoints;
        }
        //线的末端跟随鼠标位置
        sceneHandler.setInputAction(OnMouseMove, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //双击结束画线
        sceneHandler.setInputAction(OnDbClick, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //右键单击退出测量
        sceneHandler.setInputAction(OnClickRight, Cesium.ScreenSpaceEventType.RIGHT_CLICK);

        sceneHandler.setInputAction(OnClickLeft, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    }

    /**
     * 圆绘制方法
     * @param {Object} opts.polylineOptions （可选）配置所画线的属性值，具体参数参考Cesium.PolygonGraphics的options进行设置
     * 注：圆实际上是通过折线绘制而成的
     * @param {function} opts.leftClick （可选）左键单击时触发的回调函数
     * @param {function} opts.leftDbClick （可选）左键双击时触发的回调函数
     * @param {function} opts.rightClick （可选）右键单击时触发的回调函数
     * @param {function} opts.mouseMove （可选）鼠标移动时触发的回调函数
     */
    startdrawCircle(opts = {}) {

        const { viewer, czviewer, calc } = this;
        const { polylineOptions, leftClick, leftDbClick, rightClick, mouseMove,drawheight } = opts;
        const drawHeight = drawheight || undefined;
        const sceneHandler = new Cesium.ScreenSpaceEventHandler(czviewer.canvas);
        const startPoints = [];
        let circle = null;
        let endpoint = null;
        let center = null;
        let semi = 0;

        //单击开始画线
        sceneHandler.setInputAction(function (arg) {
            var ccartesian3 = calc.getendpt(arg.position,drawHeight);

            if (!ccartesian3) return;
            startPoints.push(ccartesian3);

            if (startPoints.length == 1)
                center = czviewer.entities.add({
                    position: startPoints[0],
                    point: {
                        color: Cesium.Color.RED,
                        pixelSize: 3
                    }
                });
            if (typeof leftClick == 'function') leftClick(ccartesian3);
        }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

        function getSemi() {
            semi = startPoints[0] &&
                endpoint ? Cesium.Cartesian3.distance(startPoints[0], endpoint) : 0;
            const pots = calc.getCircleLinepoints(Cesium.Cartographic.fromCartesian(startPoints[0]), semi, 3600);
            pots.push(pots[0]);
            return pots;
        }

        //线的末端跟随鼠标位置
        sceneHandler.setInputAction(function (arg) {

            if (startPoints.length < 1) return;
            if (circle) {
                endpoint = calc.getendpt(arg.endPosition,
                    Cesium.Cartographic.fromCartesian(startPoints[0]).height);
            } else {
                circle = czviewer.entities.add({
                    polyline: {
                        positions: new Cesium.CallbackProperty(getSemi, false),
                        width: opts.width ? opts.width : 2,
                        followSurface: opts.followSurface === true ? true : false,
                        show: true,
                        material: opts.material ? opts.material : new Cesium.Color(188 / 255, 238 / 255, 104 / 255),
                        ...polylineOptions
                    }
                });
            }
            if (typeof mouseMove == 'function') mouseMove(calc.getendpt(arg.endPosition,
                Cesium.Cartographic.fromCartesian(startPoints[0]).height));
        }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

        //双击结束画线
        sceneHandler.setInputAction(function (arg) {
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
            sceneHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);
            if (typeof leftDbClick == 'function') leftDbClick(startPoints[0], semi, circle);
        }, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

        //右键单击退出测量
        sceneHandler.setInputAction(function (arg) {
            sceneHandler.destroy();
            czviewer.entities.remove(circle);
            czviewer.entities.remove(center);
            if (typeof rightClick == 'function') rightClick();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    }

}

