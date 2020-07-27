let oMyTask = null;

/**
 * 构建一个水面特效
 * @param {Cegore.Viewer} options.viewer 用于附着材质的canvas DOM对象
 * @param {Object} options.canvas 用于附着材质的canvas DOM对象
 * @param {number} options.height 水体高度
 * @param {number} options.extrudedHeight 多边形高度
 * @param {Array<Cegore.Position>} options.points 多边形范围坐标点
 * 
 * @example
 * const arr = [];
 * while(1){
 *     arr.push(new Cegore.Position(x,y,z));
 * }
 * waterv = new WaterVision({
 *     viewer: viewer,
 *     canvas: document.createElement('CANVAS');,
 *     points: arr,
 *     height: 800,
 *     extrudedHeight: 800
 * });
 */
export default function WaterVision(options) {

    if (new.target != WaterVision) throw '构造函数只能通过new关键字调用！';

    this._canvas = options.canvas;
    const that = this;

    this._material = new Cesium.Material({
        fabric: {
            type: 'Water',
            uniforms: {
                specularMap: options.canvas,
                normalMap: './zmap3dgl/libs/ZmapCegore/dep.debug/Assets/Textures/waterNormals.jpg',
                frequency: 10000.0,
                animationSpeed: 0.01,
                amplitude: 1.0
            }
        }
    });

    this._appearance = new Cesium.EllipsoidSurfaceAppearance({
        aboveGround: true,
        faceForward: false,
        material: this._material,
        renderState: {
            fog: { enabled: true, density: 0.01 }
        }
    });

    this._geometry = new Cesium.RectangleGeometry({
        rectangle: getCZRectangle(options.points),
        vertexFormat: Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
        height: options.height,
        extrudedHeight: options.extrudedHeight,
        granularity: Math.PI / 5000
    });

    ///
    this._primitive = options.viewer._czdata.viewer.scene.primitives.add(new Cesium.Primitive({
        geometryInstances: new Cesium.GeometryInstance({
            geometry: this._geometry
        }),
        appearance: this._appearance,
        show: true
    }));

    drawheight(options.canvas);
    //移除水面
    this.remove = function () {
        options.viewer._czdata.viewer.scene.primitives.remove(this._primitive);
        canvasNS && document.body.removeChild(canvasNS);
    }

    function getCZRectangle(pots) {
        var rec = getRectangle(pots);
        return Cesium.Rectangle.fromDegrees(rec.minx, rec.miny, rec.maxx, rec.maxy);
    }

    //获取多边形外包矩形
    function getRectangle(pots) {
        var minx = pots[0].x < pots[1].x ? pots[0].x : pots[1].x;
        var miny = pots[0].y < pots[1].y ? pots[0].y : pots[1].y;
        var maxx = pots[0].x > pots[1].x ? pots[0].x : pots[1].x;
        var maxy = pots[0].y > pots[1].y ? pots[0].y : pots[1].y;
        for (var i = 0; i < pots.length; i++) {
            if (i < 2) continue;
            if (pots[i].x > maxx) maxx = pots[i].x;
            if (pots[i].x < minx) minx = pots[i].x;
            if (pots[i].y > maxy) maxy = pots[i].y;
            if (pots[i].y < miny) miny = pots[i].y;
        }
        return { minx: minx, maxx: maxx, miny: miny, maxy: maxy };
    }

    //根据地形高度来决定水面是否显示
    function drawheight(canvas) {
        var ctx = canvas.getContext('2d');
        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var dt = imageData.data;

        const oMyTask = new Worker("./zmap3dgl/modules/worker/TerrainCompute.js");
        const pots = options.points;
        pots.forEach((e, i) => {
            pots[i] = { x: e.x, y: e.y, z: e.z };
        });

        oMyTask.postMessage({
            type: 'submerged',
            positions: pots,
            height: options.height,
            imgData: imageData,
            canvasSize: [canvas.width, canvas.height]
        });
        oMyTask.onmessage = e => {
            displayonCanvas(canvas);
            ctx.putImageData(e.data, 0, 0);
            const tex = that._material._textures.specularMap;
            tex && tex.copyFrom(canvas);
            oMyTask.terminate();
        };
    }

    //画布坐标转换到地理坐标
    function win2pos(offset, recc, rec) {
        var x = rec.maxx * offset.left / recc.width + rec.minx * (recc.width - offset.left) / recc.width;
        var y = rec.maxy * (recc.height - offset.top) / recc.height + rec.miny * offset.top / recc.height;
        return new Cesium.Cartographic(Cesium.Math.toRadians(x), Cesium.Math.toRadians(y), 0);
    }

    //判断点是否在多边形内
    function isInnerPoint(testpt, points, isDegrees) {
        if (!isDegrees)
            testpt = new Cegore.Position(Cesium.Math.toDegrees(testpt.longitude),
                Cesium.Math.toDegrees(testpt.latitude));
        var iSum, iCount, iIndex, ps = points, ALon = testpt.x, ALat = testpt.y;
        var dLon1 = 0, dLon2 = 0, dLat1 = 0, dLat2 = 0, dLon;
        if (ps.length < 3) {
            return false;
        }
        iSum = 0;
        iCount = ps.length;
        for (iIndex = 0; iIndex < iCount; iIndex++) {
            var nextIndex = iIndex + 1;
            if (nextIndex >= iCount)
                nextIndex = 0;
            dLon1 = ps[iIndex].x;
            dLat1 = ps[iIndex].y;
            dLon2 = ps[nextIndex].x;
            dLat2 = ps[nextIndex].y;
            // 以下语句判断A点是否在边的两端点的水平平行线之间，在则可能有交点，开始判断交点是否在左射线上  
            if (((ALat >= dLat1) && (ALat < dLat2)) || ((ALat >= dLat2) && (ALat < dLat1))) {
                if (Math.abs(dLat1 - dLat2) > 0) {
                    //得到 A点向左射线与边的交点的x坐标：  
                    dLon = dLon1 - ((dLon1 - dLon2) * (dLat1 - ALat)) / (dLat1 - dLat2);
                    // 如果交点在A点左侧（说明是做射线与 边的交点），则射线与边的全部交点数加一：  
                    if (dLon < ALon)
                        iSum++;
                }
            }
        }
        if ((iSum % 2) != 0)
            return true;
        return false;
    }

    let canvasNS;
    function displayonCanvas(canvas) {
        if (canvasNS) document.body.removeChild(canvasNS);
        canvas.style.position = 'absolute';
        canvas.style.bottom = '0';
        canvas.style.left = '0';
        document.body.appendChild(canvas);
        canvasNS = canvas;
    }
}
