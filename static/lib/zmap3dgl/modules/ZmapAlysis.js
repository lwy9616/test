import draw from './ZmapDrawing.js';
import Calc from './ZmapCompute.js';
import WaterVision from './WaterVision.js';

const TO_DEGREES = 180.0 / Math.PI;
/**
 * 空间分析工具类
 */
export default class {
    constructor(viewer) {
        this.viewer = viewer;
        this.czviewer = viewer._czdata.viewer;
        this.draw = new draw(viewer);
        this.calc = new Calc(viewer);
    }

    /**
     * 测量距离工具
     * @param {Object} opts 参阅ZmapDrawing.startdrawLine方法的opts配置
     */
    startMeasureDistance(opts = {}) {
        const { viewer, czviewer, draw } = this;
        const { leftClick, rightClick, mouseMove,drawFontHeight ,drawLineHeight} = opts;
        let endLabel;
        let endPot = null;
        const labels = [];
        draw.startdrawLine({
            ...opts,
            leftClick: (startPoints) => {
                if (startPoints.length > 1) {
                    let startPos = startPoints[startPoints.length - 2];
                    let endPos = startPoints[startPoints.length - 1];
                    addLabel(startPos, endPos, labels, czviewer,drawFontHeight);
                }
                if (typeof leftClick === 'function') leftClick(startPoints);
            },
            rightClick: () => {
                labels.forEach(e => {
                    czviewer.entities.remove(e);
                });
                czviewer.entities.remove(endLabel);
                if (typeof rightClick === 'function') rightClick();
            },
            mouseMove: (endpoint, startPoints) => {
                endPot = endpoint;
                if (!endLabel) endLabel = addMoveLabel(czviewer, () => {
                    if (endPot == null) return;
                    const pos1 = endPot;
                    const pos2 = startPoints[startPoints.length - 1]
                    const pos = new Cesium.Cartesian3((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2, (pos1.z + pos2.z) / 2 + drawFontHeight);
                    const dis = new Number(Cesium.Cartesian3.distance(pos1, pos2));
                    if (endLabel && dis > 1) endLabel.label.text = `${dis.toFixed(2)}米`;
                    if (endLabel && dis <= 1) endLabel.label.text = ``;
                    return pos;
                });
                if (typeof mouseMove === 'function') mouseMove(endpoint, startPoints);
            }
        });
    }

    /**
     * 面积距离工具
     * @param {Object} opts 参阅ZmapDrawing.startDrawPolygon方法的opts配置
     */
    startMeasureArea(opts = {}) {
        const { viewer, czviewer, draw } = this;
        const { leftDbClick,drawheight } = opts;
        draw.startDrawPolygon({
            ...opts,
            leftDbClick: (line, entity) => {
                if (typeof leftDbClick === 'function') leftDbClick(line, entity);
                const area = viewer.scene.calcArea(line);
            }
        });
    }



    /**
     * 通视分析
     * @param {Object} opts 参阅ZmapDrawing.startdrawLine方法的opts配置
     */
    drawVisionLine(opts = {}) {

        const { viewer, czviewer, draw, calc, drawLineacrossTerrain } = this;
        const { rightClick, mouseMove,drawheight } = opts;
        const that = this;
        let polylines = czviewer.scene.primitives.add(new Cesium.PolylineCollection());
        draw.startdrawLine({
            ...opts,
            polylineOptions: {
                material: new Cesium.Color(0, 0, 0, 0)
            },
            mouseMove: (endpoint, startPoints) => {
                const start = startPoints[startPoints.length - 1];
                if (endpoint && start) {
                    polylines.removeAll();
                    drawLineacrossTerrain.call(that, start, endpoint, polylines);
                }
                if (typeof mouseMove === 'function') mouseMove(endpoint, startPoints);
            },
            rightClick: () => {
                czviewer.scene.primitives.remove(polylines);
                if (typeof rightClick === 'function') rightClick();
            }
        });
    }

    /**
     * 可视域分析
     * @param {Object} opts 参阅ZmapDrawing.startdrawCircle方法的opts配置
     */
    drawVisualAanalysis(opts = {}) {
        const { viewer, czviewer, draw, calc, drawLineacrossTerrain } = this;
        const that = this;
        const { leftDbClick, rightClick, worker,drawheight } = opts;

        const workerurl = worker ? worker : "./modules/worker/TerrainCompute.js";

        const polygon = czviewer.entities.add({
            polygon: {
                material: new Cesium.Color(174 / 255, 238 / 255, 238 / 255, .7)
            }
        });
        draw.startdrawCircle({
            ...opts,
            leftDbClick: (center, semi) => {
                const points = calc.getCircleLinepoints(Cesium.Cartographic.fromCartesian(center), semi);
                const oMyTask = new Worker(workerurl);
                const pots = points;
                pots.forEach((e, i) => {
                    const car = Cesium.Cartographic.fromCartesian(e);
                    pots[i] = { x: car.longitude * TO_DEGREES, y: car.latitude * TO_DEGREES, z: car.height * TO_DEGREES };
                });

                const cent = Cesium.Cartographic.fromCartesian(center);

                oMyTask.postMessage({
                    type: 'viewCompute',
                    positions: pots,
                    center: { x: cent.longitude * TO_DEGREES, y: cent.latitude * TO_DEGREES, z: cent.height },
                    interpolationDensity: 1000
                });
                oMyTask.onmessage = e => {
                    const pts = e.data;
                    pts.forEach((e, i) => {
                        pts[i] = Cesium.Cartesian3.fromDegrees(e.x, e.y, e.z);
                    });
                    polygon.polygon.hierarchy = pts;
                    oMyTask.terminate();
                };
                if (typeof leftDbClick === 'function') leftDbClick(center, semi);
            },
            rightClick: () => {
                czviewer.entities.remove(polygon);
                if (typeof rightClick === 'function') rightClick();
            }
        });
    }

    /**
     * 制高点分析
     * @param {Object} opts 参阅ZmapDrawing.startdrawCircle方法的opts配置
     */
    drawDominantPoint(opts = {}) {
        const { viewer, czviewer, draw, calc, drawLineacrossTerrain } = this;

        const { leftDbClick, rightClick, worker,drawheight } = opts;
        const that = this;
        const workerurl = worker ? worker : "./modules/worker/TerrainCompute.js";

        const polylines = czviewer.scene.primitives.add(new Cesium.PolylineCollection());
        const billboards = czviewer.scene.primitives.add(new Cesium.BillboardCollection());

        const circles = [];
        draw.startdrawCircle({
            ...opts,
            followSurface: true,
            leftDbClick: (center, semi) => {
                const points = calc.getCircleLinepoints(Cesium.Cartographic.fromCartesian(center), semi);
                const oMyTask = new Worker(workerurl);
                const pots = points;
                pots.forEach((e, i) => {
                    const car = Cesium.Cartographic.fromCartesian(e);
                    pots[i] = { x: car.longitude * TO_DEGREES, y: car.latitude * TO_DEGREES, z: car.height * TO_DEGREES };
                });

                oMyTask.postMessage({
                    type: 'dominantCompute',
                    positions: pots,
                    interpolationDensity: 1000
                });
                oMyTask.onmessage = e => {
                    let pos = e.data;
                    pos = Cesium.Cartesian3.fromDegrees(pos.x, pos.y, pos.z);
                    oMyTask.terminate();
                    billboards.add({
                        position: pos,
                        image: './images/redflag.png',
                        height: 40,
                        width: 30,
                        pixelOffset: new Cesium.Cartesian2(0, -20)
                    });
                };
                if (typeof leftDbClick === 'function') leftDbClick(center, semi);
            },
            rightClick: () => {
                if (typeof rightClick === 'function') rightClick();
                czviewer.scene.primitives.remove(polylines);
                czviewer.scene.primitives.remove(billboards);
                circles.forEach(e => { czviewer.entities.remove(e); });
            }
        })
    }

    //画地形切割线
    drawLineacrossTerrain(p1, p2, polylines) {
        const { viewer, czviewer, draw, calc } = this;
        p1 = Cesium.Cartographic.fromCartesian(p1);
        p2 = Cesium.Cartographic.fromCartesian(p2);
        const tv = calc.pots2tv
        var points = calc.calcLines(p1, p2);
        points.push(p2);
        for (var i = 0; i < points.length; i += 2) {
            if (i + 1 >= points.length) break;
            polylines.add({
                positions: [Cesium.Cartesian3.fromRadians(points[i].longitude, points[i].latitude, points[i].height),
                Cesium.Cartesian3.fromRadians(points[i + 1].longitude, points[i + 1].latitude, points[i + 1].height)],
                width: 1,
                followSurface: false,
                show: true,
                material: i > 0 ? Cesium.Material.fromType('Color', {
                    color: Cesium.Color.RED
                }) : Cesium.Material.fromType('Color', {
                    color: Cesium.Color.GREEN
                })
            });
        }
        return points;
    }

    /**
     * 淹没分析
     * @param {Object} opts 参阅ZmapDrawing.startDrawPolygon方法的opts配置
     */
    startSubmergedAnalysis(opts = {}) {
        const { viewer, czviewer, draw } = this;

        const { leftDbClick, rightClick,drawheight } = opts;
        let waterv;
        draw.startDrawPolygon({
            ...opts,
            leftDbClick: (arr, entity) => {
                for (let i = 0; i < arr.length; i++) {
                    const cartographic = Cesium.Cartographic.fromCartesian(arr[i]);
                    arr[i] = new Cegore.Position(cartographic);
                }
                const canvas = document.createElement('CANVAS');
                canvas.width = 400;
                canvas.height = 300;
                waterv = new WaterVision({
                    viewer: viewer,
                    canvas: canvas,
                    points: arr,
                    height: arr[0].z,
                    extrudedHeight: arr[0].z
                });
                if (typeof leftDbClick === 'function') leftDbClick(arr, entity);
            },
            rightClick: () => {
                if (waterv) waterv.remove();
                if (typeof rightClick === 'function') rightClick();
            }
        });
    }

}



const addLabel = function (pos1, pos2, labels, czviewer,drawFontHeight) {
    let pos = new Cesium.Cartesian3((pos1.x + pos2.x) / 2, (pos1.y + pos2.y) / 2, (pos1.z + pos2.z) / 2 + drawFontHeight);
    let dis = new Number(Cesium.Cartesian3.distance(pos1, pos2));
    if (dis < 1) return;
    labels.push(czviewer.entities.add({
        position: pos,
        label: {
            fillColor: new Cesium.Color(188 / 255, 238 / 255, 104 / 255),
            text: `${dis.toFixed(2)}米`,
            font: '1.5vw arial',
        },
    }));
}

const addMoveLabel = function (czviewer, callbackProperty) {
    return czviewer.entities.add({
        position: new Cesium.CallbackProperty(callbackProperty, false),
        label: {
            fillColor: new Cesium.Color(188 / 255, 238 / 255, 104 / 255),
            text: `0米`,
            font: '1.5vw arial',
        },
    });
}
